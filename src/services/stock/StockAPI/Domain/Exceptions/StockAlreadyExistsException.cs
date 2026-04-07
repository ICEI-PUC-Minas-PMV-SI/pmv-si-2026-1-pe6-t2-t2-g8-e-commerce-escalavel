namespace StockAPI.Domain.Exceptions;

public class StockAlreadyExistsException : Exception
{
    public StockAlreadyExistsException(string productName)
        : base($"Stock already exists for product name '{productName}'.")
    {
    }
}
