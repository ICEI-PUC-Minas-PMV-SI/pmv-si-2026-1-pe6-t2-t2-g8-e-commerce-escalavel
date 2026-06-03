namespace StockAPI.Domain.Exceptions;

public class InsufficientReservedStockException : Exception
{
    public InsufficientReservedStockException(Guid skuId, int requested, int reserved)
        : base($"Insufficient reserved stock for SKU '{skuId}'. Requested: {requested}, reserved: {reserved}.")
    {
    }
}
