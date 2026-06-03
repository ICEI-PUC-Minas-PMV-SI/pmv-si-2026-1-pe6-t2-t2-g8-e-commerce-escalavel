namespace StockAPI.Models;

public class StockMovement
{
    public Guid Id { get; set; }
    public Guid SkuId { get; set; }
    public Guid? OrderId { get; set; }
    public MovementType Type { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}
