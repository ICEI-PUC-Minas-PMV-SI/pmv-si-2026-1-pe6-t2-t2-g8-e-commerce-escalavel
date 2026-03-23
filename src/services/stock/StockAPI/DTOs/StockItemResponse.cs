namespace StockAPI.DTOs;

public record StockItemResponse(
    Guid ProductId,
    int QuantityAvailable,
    int QuantityReserved
);
