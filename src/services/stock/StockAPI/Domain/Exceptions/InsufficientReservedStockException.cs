namespace StockAPI.Domain.Exceptions;

public class InsufficientReservedStockException : Exception
{
    public InsufficientReservedStockException(Guid productId, int requested, int reserved)
        : base($"Insufficient reserved stock for product '{productId}'. Requested: {requested}, reserved: {reserved}.")
    {
    }
}
