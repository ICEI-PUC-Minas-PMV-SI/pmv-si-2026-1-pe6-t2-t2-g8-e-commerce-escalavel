using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record ReleaseRequest(
    [Required] Guid OrderId,
    [Required][Range(1, int.MaxValue)] int Quantity
);
