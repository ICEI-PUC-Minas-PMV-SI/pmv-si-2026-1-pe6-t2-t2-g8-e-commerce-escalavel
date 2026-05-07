using Microsoft.EntityFrameworkCore;
using Npgsql;
using StockAPI.Data;
using StockAPI.Domain.Exceptions;
using StockAPI.DTOs;
using StockAPI.Models;

namespace StockAPI.Services;

public class StockService : IStockService
{
    private readonly StockDbContext _db;
    private readonly ICatalogClient _catalog;
    private readonly ILogger<StockService> _logger;

    public StockService(StockDbContext db, ICatalogClient catalog, ILogger<StockService> logger)
    {
        _db = db;
        _catalog = catalog;
        _logger = logger;
    }

    public async Task<IEnumerable<StockItemResponse>> GetAllAsync()
    {
        return await _db.StockItems
            .AsNoTracking()
            .OrderBy(x => x.SkuId)
            .Select(x => new StockItemResponse(
                x.Id,
                x.SkuId,
                x.CostPrice,
                x.QuantityAvailable,
                x.QuantityReserved
            ))
            .ToListAsync();
    }

    public async Task<IEnumerable<StockItemDetailedResponse>> GetAllWithProductsAsync(CancellationToken cancellationToken = default)
    {
        var items = await _db.StockItems
            .AsNoTracking()
            .OrderBy(x => x.SkuId)
            .ToListAsync(cancellationToken);

        var enrichTasks = items.Select(async item =>
        {
            var product = await _catalog.GetProductBySkuIdAsync(item.SkuId, cancellationToken);
            return new StockItemDetailedResponse(
                item.Id,
                item.SkuId,
                item.CostPrice,
                item.QuantityAvailable,
                item.QuantityReserved,
                product
            );
        });

        return await Task.WhenAll(enrichTasks);
    }

    public async Task<StockItemResponse?> GetBySkuIdAsync(Guid skuId)
    {
        var item = await _db.StockItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.SkuId == skuId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<StockItemResponse> CreateAsync(CreateStockRequest request)
    {
        var skuId = request.SkuId
            ?? throw new ArgumentException("Field 'skuId' is required.");

        if (skuId == Guid.Empty)
        {
            throw new ArgumentException("Field 'skuId' cannot be empty.");
        }

        var quantity = request.Quantity
            ?? throw new ArgumentException("Field 'quantity' is required.");

        var exists = await _db.StockItems.AnyAsync(x => x.SkuId == skuId);
        if (exists)
        {
            throw new StockAlreadyExistsException(skuId);
        }

        var item = StockItem.Create(skuId, quantity, request.CostPrice);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            _db.StockItems.Add(item);
            _db.StockMovements.Add(CreateStockMovement(item.SkuId, null, MovementType.Restock, quantity));

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            await transaction.RollbackAsync();
            throw new StockAlreadyExistsException(skuId);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        _logger.LogInformation(
            "Stock created for SkuId={SkuId}, InitialQuantity={InitialQuantity}, CostPrice={CostPrice}",
            item.SkuId,
            quantity,
            item.CostPrice);

        return ToResponse(item);
    }

    public async Task<StockItemResponse> ReserveAsync(Guid skuId, Guid orderId, ReserveRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(skuId);
            item.Reserve(request.Quantity);

            var reservation = await GetReservationAsync(skuId, orderId);
            if (reservation is null)
            {
                reservation = StockReservation.Create(skuId, orderId, request.Quantity);
                _db.StockReservations.Add(reservation);
            }
            else
            {
                reservation.Reserve(request.Quantity);
            }

            _db.StockMovements.Add(CreateStockMovement(skuId, orderId, MovementType.Reserve, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(skuId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock reserved for SkuId={SkuId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                skuId,
                orderId,
                request.Quantity,
                item.QuantityAvailable,
                item.QuantityReserved);

            return ToResponse(item);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<StockItemResponse> ReleaseAsync(Guid skuId, Guid orderId, ReleaseRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(skuId);
            var reservation = await GetReservationAsync(skuId, orderId);
            var reservedByOrder = reservation?.QuantityReserved ?? 0;
            if (reservedByOrder < request.Quantity)
            {
                throw new InsufficientReservedStockException(skuId, request.Quantity, reservedByOrder);
            }

            item.Release(request.Quantity);
            reservation!.Release(request.Quantity);
            if (reservation.QuantityReserved == 0)
            {
                _db.StockReservations.Remove(reservation);
            }

            _db.StockMovements.Add(CreateStockMovement(skuId, orderId, MovementType.Release, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(skuId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock released for SkuId={SkuId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                skuId,
                orderId,
                request.Quantity,
                item.QuantityAvailable,
                item.QuantityReserved);

            return ToResponse(item);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<StockItemResponse> ConfirmAsync(Guid skuId, Guid orderId, ConfirmRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(skuId);
            var reservation = await GetReservationAsync(skuId, orderId);
            var reservedByOrder = reservation?.QuantityReserved ?? 0;
            if (reservedByOrder < request.Quantity)
            {
                throw new InsufficientReservedStockException(skuId, request.Quantity, reservedByOrder);
            }

            item.Confirm(request.Quantity);
            reservation!.Release(request.Quantity);
            if (reservation.QuantityReserved == 0)
            {
                _db.StockReservations.Remove(reservation);
            }

            _db.StockMovements.Add(CreateStockMovement(skuId, orderId, MovementType.Confirm, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(skuId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock confirmed for SkuId={SkuId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                skuId,
                orderId,
                request.Quantity,
                item.QuantityAvailable,
                item.QuantityReserved);

            return ToResponse(item);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<StockItemResponse> RestockAsync(Guid skuId, RestockRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(skuId);
            item.Restock(request.Quantity);

            _db.StockMovements.Add(CreateStockMovement(skuId, null, MovementType.Restock, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(skuId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock restocked for SkuId={SkuId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                skuId,
                request.Quantity,
                item.QuantityAvailable,
                item.QuantityReserved);

            return ToResponse(item);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<StockItemResponse> AdjustAsync(Guid skuId, AdjustStockRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(skuId);
            item.Adjust(request.Delta);

            _db.StockMovements.Add(CreateStockMovement(skuId, null, MovementType.Adjustment, request.Delta, request.Reason));

            await SaveChangesWithConcurrencyHandlingAsync(skuId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock adjusted for SkuId={SkuId}, Delta={Delta}, Reason={Reason}, Available={Available}, Reserved={Reserved}",
                skuId,
                request.Delta,
                request.Reason,
                item.QuantityAvailable,
                item.QuantityReserved);

            return ToResponse(item);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<StockMovementResponse>> GetHistoryAsync(Guid skuId)
    {
        var exists = await _db.StockItems.AnyAsync(x => x.SkuId == skuId);
        if (!exists)
            throw new StockNotFoundException(skuId);

        return await _db.StockMovements
            .AsNoTracking()
            .Where(m => m.SkuId == skuId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new StockMovementResponse(
                m.Id,
                m.SkuId,
                m.OrderId,
                m.Type.ToString().ToLowerInvariant(),
                m.Quantity,
                m.Reason,
                m.CreatedAt
            ))
            .ToListAsync();
    }

    private async Task<StockItem> GetItemOrThrowAsync(Guid skuId)
    {
        return await _db.StockItems.FirstOrDefaultAsync(x => x.SkuId == skuId)
            ?? throw new StockNotFoundException(skuId);
    }

    private async Task<StockReservation?> GetReservationAsync(Guid skuId, Guid orderId)
    {
        return await _db.StockReservations
            .FirstOrDefaultAsync(x => x.SkuId == skuId && x.OrderId == orderId);
    }

    private async Task SaveChangesWithConcurrencyHandlingAsync(Guid skuId)
    {
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(
                ex,
                "Concurrency conflict while updating stock for SkuId={SkuId}",
                skuId);
            throw new StockConcurrencyException(skuId);
        }
    }

    private static StockItemResponse ToResponse(StockItem item)
    {
        return new StockItemResponse(
            item.Id,
            item.SkuId,
            item.CostPrice,
            item.QuantityAvailable,
            item.QuantityReserved);
    }

    private static StockMovement CreateStockMovement(Guid skuId, Guid? orderId, MovementType type, int quantity, string? reason = null)
    {
        return new StockMovement
        {
            Id = Guid.NewGuid(),
            SkuId = skuId,
            OrderId = orderId,
            Type = type,
            Quantity = quantity,
            Reason = reason,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException postgresException
            && postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
    }
}
