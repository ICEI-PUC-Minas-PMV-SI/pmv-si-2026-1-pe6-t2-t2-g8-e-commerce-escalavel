using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record ConfirmRequest(
    [Required] Guid OrderId,
    [Required][Range(1, int.MaxValue)] int Quantity
);
