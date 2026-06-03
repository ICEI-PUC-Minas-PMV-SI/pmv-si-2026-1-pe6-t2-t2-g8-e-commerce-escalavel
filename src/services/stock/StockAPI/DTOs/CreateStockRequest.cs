using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record CreateStockRequest(
    [Required] Guid? SkuId,
    [Required][Range(0, int.MaxValue)] int? Quantity,
    [Required][Range(typeof(decimal), "0", "9999999999999999.99")] decimal CostPrice
);
