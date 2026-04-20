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
    private readonly ILogger<StockService> _logger;

    public StockService(StockDbContext db, ILogger<StockService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<StockItemResponse>> GetAllAsync()
    {
        return await _db.StockItems
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new StockItemResponse(
                x.ProductId,
                x.Name,
                x.Color,
                x.Model,
                x.Size,
                x.CostPrice,
                x.SalePrice,
                x.QuantityAvailable,
                x.QuantityReserved
            ))
            .ToListAsync();
    }

    public async Task<StockItemResponse?> GetByProductIdAsync(Guid productId)
    {
        var item = await _db.StockItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == productId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<StockItemResponse> CreateAsync(CreateStockRequest request)
    {
        var productId = request.ProductId
            ?? throw new ArgumentException("Field 'productId' is required.");

        if (productId == Guid.Empty)
        {
            throw new ArgumentException("Field 'productId' cannot be empty.");
        }

        var quantity = request.Quantity
            ?? throw new ArgumentException("Field 'quantity' is required.");

        var exists = await _db.StockItems.AnyAsync(x => x.ProductId == productId);
        if (exists)
        {
            throw new StockAlreadyExistsException(productId);
        }

        var item = StockItem.Create(
            productId,
            request.Name,
            quantity,
            request.Color,
            request.Model,
            request.Size,
            request.CostPrice,
            request.SalePrice);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            _db.StockItems.Add(item);
            _db.StockMovements.Add(CreateStockMovement(item.ProductId, null, MovementType.Restock, quantity));

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            await transaction.RollbackAsync();
            throw new StockAlreadyExistsException(productId);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        _logger.LogInformation(
            "Stock created for ProductId={ProductId}, Name={Name}, InitialQuantity={InitialQuantity}",
            item.ProductId,
            item.Name,
            quantity);

        return ToResponse(item);
    }

    public async Task<StockItemResponse> ReserveAsync(Guid productId, Guid orderId, ReserveRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(productId);
            item.Reserve(request.Quantity);

            var reservation = await GetReservationAsync(productId, orderId);
            if (reservation is null)
            {
                reservation = StockReservation.Create(productId, orderId, request.Quantity);
                _db.StockReservations.Add(reservation);
            }
            else
            {
                reservation.Reserve(request.Quantity);
            }

            _db.StockMovements.Add(CreateStockMovement(productId, orderId, MovementType.Reserve, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(productId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock reserved for ProductId={ProductId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                productId,
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

    public async Task<StockItemResponse> ReleaseAsync(Guid productId, Guid orderId, ReleaseRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(productId);
            var reservation = await GetReservationAsync(productId, orderId);
            var reservedByOrder = reservation?.QuantityReserved ?? 0;
            if (reservedByOrder < request.Quantity)
            {
                throw new InsufficientReservedStockException(productId, request.Quantity, reservedByOrder);
            }

            item.Release(request.Quantity);
            reservation!.Release(request.Quantity);
            if (reservation.QuantityReserved == 0)
            {
                _db.StockReservations.Remove(reservation);
            }

            _db.StockMovements.Add(CreateStockMovement(productId, orderId, MovementType.Release, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(productId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock released for ProductId={ProductId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                productId,
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

    public async Task<StockItemResponse> ConfirmAsync(Guid productId, Guid orderId, ConfirmRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(productId);
            var reservation = await GetReservationAsync(productId, orderId);
            var reservedByOrder = reservation?.QuantityReserved ?? 0;
            if (reservedByOrder < request.Quantity)
            {
                throw new InsufficientReservedStockException(productId, request.Quantity, reservedByOrder);
            }

            item.Confirm(request.Quantity);
            reservation!.Release(request.Quantity);
            if (reservation.QuantityReserved == 0)
            {
                _db.StockReservations.Remove(reservation);
            }

            _db.StockMovements.Add(CreateStockMovement(productId, orderId, MovementType.Confirm, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(productId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock confirmed for ProductId={ProductId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                productId,
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

    public async Task<StockItemResponse> RestockAsync(Guid productId, RestockRequest request)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var item = await GetItemOrThrowAsync(productId);
            item.Restock(request.Quantity);

            _db.StockMovements.Add(CreateStockMovement(productId, null, MovementType.Restock, request.Quantity));

            await SaveChangesWithConcurrencyHandlingAsync(productId);
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock restocked for ProductId={ProductId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
                productId,
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

    public async Task<IEnumerable<StockMovementResponse>> GetHistoryAsync(Guid productId)
    {
        var exists = await _db.StockItems.AnyAsync(x => x.ProductId == productId);
        if (!exists)
            throw new StockNotFoundException(productId);

        return await _db.StockMovements
            .AsNoTracking()
            .Where(m => m.ProductId == productId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new StockMovementResponse(
                m.Id,
                m.ProductId,
                m.OrderId,
                m.Type.ToString().ToLowerInvariant(),
                m.Quantity,
                m.CreatedAt
            ))
            .ToListAsync();
    }

    private async Task<StockItem> GetItemOrThrowAsync(Guid productId)
    {
        return await _db.StockItems.FirstOrDefaultAsync(x => x.ProductId == productId)
            ?? throw new StockNotFoundException(productId);
    }

    private async Task<StockReservation?> GetReservationAsync(Guid productId, Guid orderId)
    {
        return await _db.StockReservations
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.OrderId == orderId);
    }

    private async Task SaveChangesWithConcurrencyHandlingAsync(Guid productId)
    {
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(
                ex,
                "Concurrency conflict while updating stock for ProductId={ProductId}",
                productId);
            throw new StockConcurrencyException(productId);
        }
    }

    private static StockItemResponse ToResponse(StockItem item)
    {
        return new StockItemResponse(
            item.ProductId,
            item.Name,
            item.Color,
            item.Model,
            item.Size,
            item.CostPrice,
            item.SalePrice,
            item.QuantityAvailable,
            item.QuantityReserved);
    }

    private static StockMovement CreateStockMovement(Guid productId, Guid? orderId, MovementType type, int quantity)
    {
        return new StockMovement
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            OrderId = orderId,
            Type = type,
            Quantity = quantity,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException postgresException
            && postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
    }
}
