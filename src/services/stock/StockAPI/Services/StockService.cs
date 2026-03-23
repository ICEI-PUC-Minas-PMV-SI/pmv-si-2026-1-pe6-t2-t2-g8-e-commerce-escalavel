using Microsoft.EntityFrameworkCore;
using StockAPI.Data;
using StockAPI.Domain.Exceptions;
using StockAPI.DTOs;
using StockAPI.Models;

namespace StockAPI.Services;

public class StockService : IStockService
{
    private readonly StockDbContext _db;

    public StockService(StockDbContext db)
    {
        _db = db;
    }

    public async Task<StockItemResponse?> GetByProductIdAsync(Guid productId)
    {
        var item = await _db.StockItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == productId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<StockItemResponse> CreateAsync(Guid productId, CreateStockRequest request)
    {
        var exists = await _db.StockItems.AnyAsync(x => x.ProductId == productId);
        if (exists)
            throw new StockAlreadyExistsException(productId);

        var item = StockItem.Create(productId, request.InitialQuantity);

        _db.StockItems.Add(item);

        _db.StockMovements.Add(CreateStockMovement(productId, null, MovementType.Restock, request.InitialQuantity));

        await _db.SaveChangesAsync();
        return ToResponse(item);
    }

    public async Task<StockItemResponse> ReserveAsync(Guid productId, ReserveRequest request)
    {
        var item = await GetItemOrThrowAsync(productId);
        item.Reserve(request.Quantity);

        _db.StockMovements.Add(CreateStockMovement(productId, request.OrderId, MovementType.Reserve, request.Quantity));

        await _db.SaveChangesAsync();
        return ToResponse(item);
    }

    public async Task<StockItemResponse> ReleaseAsync(Guid productId, ReleaseRequest request)
    {
        var item = await GetItemOrThrowAsync(productId);
        item.Release(request.Quantity);

        _db.StockMovements.Add(CreateStockMovement(productId, request.OrderId, MovementType.Release, request.Quantity));

        await _db.SaveChangesAsync();
        return ToResponse(item);
    }

    public async Task<StockItemResponse> ConfirmAsync(Guid productId, ConfirmRequest request)
    {
        var item = await GetItemOrThrowAsync(productId);
        item.Confirm(request.Quantity);

        _db.StockMovements.Add(CreateStockMovement(productId, request.OrderId, MovementType.Confirm, request.Quantity));

        await _db.SaveChangesAsync();
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
