namespace StockAPI.Models;

public class StockReservation
{
    public Guid Id { get; set; }
    public Guid SkuId { get; set; }
    public Guid OrderId { get; set; }
    public int QuantityReserved { get; set; }

    public static StockReservation Create(Guid skuId, Guid orderId, int quantity)
    {
        if (skuId == Guid.Empty)
        {
            throw new ArgumentException("SkuId must be a valid value.", nameof(skuId));
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
            SkuId = skuId,
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
