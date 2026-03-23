using StockAPI.Domain.Exceptions;

namespace StockAPI.Models;

public class StockItem
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }

    public static StockItem Create(Guid productId, int initialQuantity)
    {
        var item = new StockItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            QuantityAvailable = initialQuantity,
            QuantityReserved = 0
        };

        item.EnsureInvariants();
        return item;
    }

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        if (QuantityAvailable < quantity)
        {
            throw new InsufficientAvailableStockException(ProductId, quantity, QuantityAvailable);
        }

        QuantityAvailable -= quantity;
        QuantityReserved += quantity;
        EnsureInvariants();
    }

    public void Release(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        if (QuantityReserved < quantity)
        {
            throw new InsufficientReservedStockException(ProductId, quantity, QuantityReserved);
        }

        QuantityReserved -= quantity;
        QuantityAvailable += quantity;
        EnsureInvariants();
    }

    public void Confirm(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        if (QuantityReserved < quantity)
        {
            throw new InsufficientReservedStockException(ProductId, quantity, QuantityReserved);
        }

        QuantityReserved -= quantity;
        EnsureInvariants();
    }

    private void EnsureInvariants()
    {
        if (QuantityAvailable < 0)
        {
            throw new InvalidOperationException("QuantityAvailable cannot be negative.");
        }

        if (QuantityReserved < 0)
        {
            throw new InvalidOperationException("QuantityReserved cannot be negative.");
        }
    }
}
