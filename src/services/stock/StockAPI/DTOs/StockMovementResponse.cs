namespace StockAPI.DTOs;

public record StockMovementResponse(
    Guid Id,
    Guid ProductId,
    Guid? OrderId,
    string Type,
    int Quantity,
    DateTime CreatedAt
);
