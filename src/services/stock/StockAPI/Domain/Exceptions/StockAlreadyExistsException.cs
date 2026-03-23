namespace StockAPI.Domain.Exceptions;

public class StockAlreadyExistsException : Exception
{
    public StockAlreadyExistsException(Guid productId)
        : base($"Stock already exists for product '{productId}'.")
    {
    }
}
