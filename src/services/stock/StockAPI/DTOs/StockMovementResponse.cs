namespace StockAPI.DTOs;

public record StockMovementResponse(
    Guid Id,
    Guid SkuId,
    Guid? OrderId,
    string Type,
    int Quantity,
    string? Reason,
    DateTime CreatedAt
);
