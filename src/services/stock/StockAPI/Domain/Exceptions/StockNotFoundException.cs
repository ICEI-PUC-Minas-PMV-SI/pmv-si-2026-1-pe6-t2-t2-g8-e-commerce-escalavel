namespace StockAPI.Domain.Exceptions;

public class StockNotFoundException : Exception
{
    public StockNotFoundException(Guid productId)
        : base($"Stock not found for product '{productId}'.")
    {
    }
}
