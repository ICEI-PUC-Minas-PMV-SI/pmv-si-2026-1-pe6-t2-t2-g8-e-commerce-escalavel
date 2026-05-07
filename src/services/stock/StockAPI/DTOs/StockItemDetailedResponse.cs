namespace StockAPI.DTOs;

public record CatalogProductInfo(
    string? Name,
    string? Description,
    string? UrlImg,
    string? Code,
    string? Size
);

public record StockItemDetailedResponse(
    Guid Id,
    Guid SkuId,
    decimal CostPrice,
    int QuantityAvailable,
    int QuantityReserved,
    CatalogProductInfo? Product
);
