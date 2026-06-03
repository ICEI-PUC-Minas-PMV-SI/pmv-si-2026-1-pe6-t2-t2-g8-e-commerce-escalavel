using System.ComponentModel.DataAnnotations;

namespace StockAPI.DTOs;

public record ReserveRequest(
    [Required][Range(1, int.MaxValue)] int Quantity
);
