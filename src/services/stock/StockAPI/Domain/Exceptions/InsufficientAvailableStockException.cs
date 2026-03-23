namespace StockAPI.Domain.Exceptions;

public class InsufficientAvailableStockException : Exception
{
    public InsufficientAvailableStockException(Guid productId, int requested, int available)
        : base($"Insufficient available stock for product '{productId}'. Requested: {requested}, available: {available}.")
    {
    }
}
