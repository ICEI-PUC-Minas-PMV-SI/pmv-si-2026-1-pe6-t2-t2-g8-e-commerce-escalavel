using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record CreateStockRequest(
    [Required] Guid? CategoryId,
    [Required][MinLength(2)][MaxLength(150)] string Name,
    [Required][Range(0, int.MaxValue)] int? Quantity,
    [Required][MinLength(1)][MaxLength(50)] string Color,
    [Required][MinLength(1)][MaxLength(80)] string Model,
    [Required][MinLength(1)][MaxLength(30)] string Size,
    [Required][Range(typeof(decimal), "0", "9999999999999999.99")] decimal CostPrice,
    [Required][Range(typeof(decimal), "0", "9999999999999999.99")] decimal SalePrice
);
