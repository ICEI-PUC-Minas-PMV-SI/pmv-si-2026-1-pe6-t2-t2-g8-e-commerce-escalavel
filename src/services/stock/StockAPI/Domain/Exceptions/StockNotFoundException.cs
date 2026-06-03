namespace StockAPI.Domain.Exceptions;

public class StockNotFoundException : Exception
{
    public StockNotFoundException(Guid skuId)
        : base($"Stock not found for SKU '{skuId}'.")
    {
    }
}
