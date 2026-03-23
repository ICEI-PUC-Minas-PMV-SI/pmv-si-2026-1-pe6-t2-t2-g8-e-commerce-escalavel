namespace StockAPI.Models;

public class StockMovement
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid? OrderId { get; set; }
    public MovementType Type { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
}
