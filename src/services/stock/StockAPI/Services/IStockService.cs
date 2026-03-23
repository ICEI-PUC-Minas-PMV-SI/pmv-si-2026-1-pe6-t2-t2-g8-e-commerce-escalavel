using StockAPI.DTOs;

namespace StockAPI.Services;

public interface IStockService
{
    Task<StockItemResponse?> GetByProductIdAsync(Guid productId);
    Task<StockItemResponse> CreateAsync(Guid productId, CreateStockRequest request);
    Task<StockItemResponse> ReserveAsync(Guid productId, ReserveRequest request);
    Task<StockItemResponse> ReleaseAsync(Guid productId, ReleaseRequest request);
    Task<StockItemResponse> ConfirmAsync(Guid productId, ConfirmRequest request);
    Task<IEnumerable<StockMovementResponse>> GetHistoryAsync(Guid productId);
}
