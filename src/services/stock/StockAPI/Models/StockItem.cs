using StockAPI.Domain.Exceptions;

namespace StockAPI.Models;

public class StockItem
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }

    public static StockItem Create(
        string name,
        int quantity,
        string color,
        string model,
        string size,
        decimal costPrice,
        decimal salePrice)
    {
        if (quantity < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity cannot be negative.");
        }

        if (costPrice < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(costPrice), "CostPrice cannot be negative.");
        }

        if (salePrice < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(salePrice), "SalePrice cannot be negative.");
        }

        if (salePrice < costPrice)
        {
            throw new ArgumentException("SalePrice cannot be lower than CostPrice.", nameof(salePrice));
        }

        var item = new StockItem
        {
            Id = Guid.NewGuid(),
            ProductId = Guid.NewGuid(),
            Name = NormalizeRequiredText(name, nameof(name)),
            Color = NormalizeRequiredText(color, nameof(color)),
            Model = NormalizeRequiredText(model, nameof(model)),
            Size = NormalizeRequiredText(size, nameof(size)),
            CostPrice = costPrice,
            SalePrice = salePrice,
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

        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new InvalidOperationException("Name cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(Color))
        {
            throw new InvalidOperationException("Color cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(Model))
        {
            throw new InvalidOperationException("Model cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(Size))
        {
            throw new InvalidOperationException("Size cannot be empty.");
        }

        if (CostPrice < 0)
        {
            throw new InvalidOperationException("CostPrice cannot be negative.");
        }

        if (SalePrice < 0)
        {
            throw new InvalidOperationException("SalePrice cannot be negative.");
        }

        if (SalePrice < CostPrice)
        {
            throw new InvalidOperationException("SalePrice cannot be lower than CostPrice.");
        }
    }

    private static string NormalizeRequiredText(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Field is required.", parameterName);
        }

        return value.Trim();
    }
}
