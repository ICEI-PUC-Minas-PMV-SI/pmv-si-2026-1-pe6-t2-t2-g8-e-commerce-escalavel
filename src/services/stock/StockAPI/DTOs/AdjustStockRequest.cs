using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record AdjustStockRequest(
    [Required] int Delta,
    [Required][MinLength(3)][MaxLength(255)] string Reason
);
