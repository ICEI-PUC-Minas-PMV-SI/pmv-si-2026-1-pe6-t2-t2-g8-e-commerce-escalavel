namespace StockAPI.DTOs;

public record StockItemResponse(
    Guid ProductId,
    Guid CategoryId,
    string Name,
    string Color,
    string Model,
    string Size,
    decimal CostPrice,
    decimal SalePrice,
    int QuantityAvailable,
    int QuantityReserved
);
