using StockAPI.Domain.Exceptions;

namespace StockAPI.Models;

public class StockItem
{
    public Guid Id { get; set; }
    public Guid SkuId { get; set; }
    public decimal CostPrice { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }

    public static StockItem Create(Guid skuId, int quantity, decimal costPrice)
    {
        if (skuId == Guid.Empty)
        {
            throw new ArgumentException("SkuId is required.", nameof(skuId));
        }

        if (quantity < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity cannot be negative.");
        }

        if (costPrice < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(costPrice), "CostPrice cannot be negative.");
        }

        var item = new StockItem
        {
            Id = Guid.NewGuid(),
            SkuId = skuId,
            CostPrice = costPrice,
            QuantityAvailable = quantity,
            QuantityReserved = 0
        };

        item.EnsureInvariants();
        return item;
    }

    public void Restock(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        QuantityAvailable += quantity;
        EnsureInvariants();
    }

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        if (QuantityAvailable < quantity)
        {
            throw new InsufficientAvailableStockException(SkuId, quantity, QuantityAvailable);
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
            throw new InsufficientReservedStockException(SkuId, quantity, QuantityReserved);
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
            throw new InsufficientReservedStockException(SkuId, quantity, QuantityReserved);
        }

        QuantityReserved -= quantity;
        EnsureInvariants();
    }

    private void EnsureInvariants()
    {
        if (SkuId == Guid.Empty)
        {
            throw new InvalidOperationException("SkuId cannot be empty.");
        }

        if (QuantityAvailable < 0)
        {
            throw new InvalidOperationException("QuantityAvailable cannot be negative.");
        }

        if (QuantityReserved < 0)
        {
            throw new InvalidOperationException("QuantityReserved cannot be negative.");
        }

        if (CostPrice < 0)
        {
            throw new InvalidOperationException("CostPrice cannot be negative.");
        }
    }
}
