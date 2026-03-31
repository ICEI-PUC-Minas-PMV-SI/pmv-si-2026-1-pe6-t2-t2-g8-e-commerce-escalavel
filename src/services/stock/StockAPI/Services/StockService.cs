using Microsoft.EntityFrameworkCore;
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
            .OrderBy(x => x.ProductId)
            .Select(x => new StockItemResponse(
                x.ProductId,
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
        var item = StockItem.Create(request.InitialQuantity);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        _db.StockItems.Add(item);
        await _db.SaveChangesAsync();

        _db.StockMovements.Add(CreateStockMovement(item.ProductId, null, MovementType.Restock, request.InitialQuantity));

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        _logger.LogInformation(
            "Stock created for ProductId={ProductId} with InitialQuantity={InitialQuantity}",
            item.ProductId,
            request.InitialQuantity);

        return ToResponse(item);
    }

    public async Task<StockItemResponse> ReserveAsync(Guid productId, ReserveRequest request)
    {
        var item = await GetItemOrThrowAsync(productId);
        item.Reserve(request.Quantity);

        _db.StockMovements.Add(CreateStockMovement(productId, request.OrderId, MovementType.Reserve, request.Quantity));

        await SaveChangesWithConcurrencyHandlingAsync(productId);
        _logger.LogInformation(
            "Stock reserved for ProductId={ProductId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
            productId,
            request.OrderId,
            request.Quantity,
            item.QuantityAvailable,
            item.QuantityReserved);

        return ToResponse(item);
    }

    public async Task<StockItemResponse> ReleaseAsync(Guid productId, ReleaseRequest request)
    {
        var item = await GetItemOrThrowAsync(productId);
        item.Release(request.Quantity);

        _db.StockMovements.Add(CreateStockMovement(productId, request.OrderId, MovementType.Release, request.Quantity));

        await SaveChangesWithConcurrencyHandlingAsync(productId);
        _logger.LogInformation(
            "Stock released for ProductId={ProductId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
            productId,
            request.OrderId,
            request.Quantity,
            item.QuantityAvailable,
            item.QuantityReserved);

        return ToResponse(item);
    }

    public async Task<StockItemResponse> ConfirmAsync(Guid productId, ConfirmRequest request)
    {
        var item = await GetItemOrThrowAsync(productId);
        item.Confirm(request.Quantity);

        _db.StockMovements.Add(CreateStockMovement(productId, request.OrderId, MovementType.Confirm, request.Quantity));

        await SaveChangesWithConcurrencyHandlingAsync(productId);
        _logger.LogInformation(
            "Stock confirmed for ProductId={ProductId}, OrderId={OrderId}, Quantity={Quantity}, Available={Available}, Reserved={Reserved}",
            productId,
            request.OrderId,
            request.Quantity,
            item.QuantityAvailable,
            item.QuantityReserved);

        return ToResponse(item);
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
        return new StockItemResponse(item.ProductId, item.QuantityAvailable, item.QuantityReserved);
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
}
