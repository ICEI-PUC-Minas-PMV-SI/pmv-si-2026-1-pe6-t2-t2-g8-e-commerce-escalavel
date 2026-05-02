namespace StockAPI.Domain.Exceptions;

public class StockConcurrencyException : Exception
{
    public StockConcurrencyException(Guid skuId)
        : base($"Stock for SKU '{skuId}' was modified by another request. Please retry.")
    {
    }
}
