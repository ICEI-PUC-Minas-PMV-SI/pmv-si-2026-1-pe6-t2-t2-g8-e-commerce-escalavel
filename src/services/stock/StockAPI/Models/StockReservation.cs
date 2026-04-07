namespace StockAPI.Models;

public class StockReservation
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid OrderId { get; set; }
    public int QuantityReserved { get; set; }

    public static StockReservation Create(Guid productId, Guid orderId, int quantity)
    {
        if (productId == Guid.Empty)
        {
            throw new ArgumentException("ProductId must be a valid value.", nameof(productId));
        }

        if (orderId == Guid.Empty)
        {
            throw new ArgumentException("OrderId must be a valid value.", nameof(orderId));
        }

        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        return new StockReservation
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            OrderId = orderId,
            QuantityReserved = quantity
        };
    }

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        QuantityReserved += quantity;
    }

    public void Release(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        if (QuantityReserved < quantity)
        {
            throw new InvalidOperationException("Cannot release more than reserved quantity.");
        }

        QuantityReserved -= quantity;
    }
}
