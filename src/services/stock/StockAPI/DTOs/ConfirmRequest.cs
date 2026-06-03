using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record ConfirmRequest(
    [Required][Range(1, int.MaxValue)] int Quantity
);
