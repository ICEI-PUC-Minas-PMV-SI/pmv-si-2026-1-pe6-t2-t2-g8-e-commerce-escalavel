namespace StockAPI.DTOs;

public record StockItemResponse(
    Guid Id,
    Guid SkuId,
    decimal CostPrice,
    int QuantityAvailable,
    int QuantityReserved
);
