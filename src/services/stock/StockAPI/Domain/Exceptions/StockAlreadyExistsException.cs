namespace StockAPI.Domain.Exceptions;

public class StockAlreadyExistsException : Exception
{
    public StockAlreadyExistsException(Guid skuId)
        : base($"Stock already exists for SkuId '{skuId}'.")
    {
    }
}
