using StockAPI.DTOs;

namespace StockAPI.Services;

public interface IStockService
{
    Task<IEnumerable<StockItemResponse>> GetAllAsync();
    Task<StockItemResponse?> GetByProductIdAsync(Guid productId);
    Task<StockItemResponse> CreateAsync(CreateStockRequest request);
    Task<StockItemResponse> ReserveAsync(Guid productId, Guid orderId, ReserveRequest request);
    Task<StockItemResponse> ReleaseAsync(Guid productId, Guid orderId, ReleaseRequest request);
    Task<StockItemResponse> ConfirmAsync(Guid productId, Guid orderId, ConfirmRequest request);
    Task<StockItemResponse> RestockAsync(Guid productId, RestockRequest request);
    Task<IEnumerable<StockMovementResponse>> GetHistoryAsync(Guid productId);
}
