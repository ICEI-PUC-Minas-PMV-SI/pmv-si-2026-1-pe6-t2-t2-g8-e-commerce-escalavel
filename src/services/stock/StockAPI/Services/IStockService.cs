using StockAPI.DTOs;

namespace StockAPI.Services;

public interface IStockService
{
    Task<IEnumerable<StockItemResponse>> GetAllAsync();
    Task<StockItemResponse?> GetBySkuIdAsync(Guid skuId);
    Task<StockItemResponse> CreateAsync(CreateStockRequest request);
    Task<StockItemResponse> ReserveAsync(Guid skuId, Guid orderId, ReserveRequest request);
    Task<StockItemResponse> ReleaseAsync(Guid skuId, Guid orderId, ReleaseRequest request);
    Task<StockItemResponse> ConfirmAsync(Guid skuId, Guid orderId, ConfirmRequest request);
    Task<StockItemResponse> RestockAsync(Guid skuId, RestockRequest request);
    Task<StockItemResponse> AdjustAsync(Guid skuId, AdjustStockRequest request);
    Task<IEnumerable<StockMovementResponse>> GetHistoryAsync(Guid skuId);
}
