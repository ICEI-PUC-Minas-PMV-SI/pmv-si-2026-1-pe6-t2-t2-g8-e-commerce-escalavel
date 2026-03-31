namespace StockAPI.Domain.Exceptions;

public class StockConcurrencyException : Exception
{
    public StockConcurrencyException(Guid productId)
        : base($"Stock for product '{productId}' was modified by another request. Please retry.")
    {
    }
}