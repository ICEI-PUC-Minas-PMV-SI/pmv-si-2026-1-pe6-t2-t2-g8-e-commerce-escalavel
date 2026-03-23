using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record CreateStockRequest(
    [Required][Range(0, int.MaxValue)] int InitialQuantity
);
