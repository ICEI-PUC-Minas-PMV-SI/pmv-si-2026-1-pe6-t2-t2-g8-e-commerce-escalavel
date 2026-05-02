namespace StockAPI.Domain.Exceptions;

public class InsufficientAvailableStockException : Exception
{
    public InsufficientAvailableStockException(Guid skuId, int requested, int available)
        : base($"Insufficient available stock for SKU '{skuId}'. Requested: {requested}, available: {available}.")
    {
    }
}
