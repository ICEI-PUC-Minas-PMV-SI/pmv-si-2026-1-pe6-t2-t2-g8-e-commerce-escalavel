using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record RestockRequest(
    [Required][Range(1, int.MaxValue)] int Quantity
);
