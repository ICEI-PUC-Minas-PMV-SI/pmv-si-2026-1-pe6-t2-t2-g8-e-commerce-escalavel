namespace StockAPI.DTOs;

public record StockItemResponse(
    Guid ProductId,
    string Name,
    string Color,
    string Model,
    string Size,
    decimal CostPrice,
    decimal SalePrice,
    int QuantityAvailable,
    int QuantityReserved
);
