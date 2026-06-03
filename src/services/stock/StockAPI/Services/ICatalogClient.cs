using StockAPI.DTOs;

namespace StockAPI.Services;

public interface ICatalogClient
{
    Task<CatalogProductInfo?> GetProductBySkuIdAsync(Guid skuId, CancellationToken cancellationToken = default);
}
