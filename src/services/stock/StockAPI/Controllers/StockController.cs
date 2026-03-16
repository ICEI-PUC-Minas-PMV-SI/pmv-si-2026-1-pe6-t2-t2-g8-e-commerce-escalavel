using Microsoft.AspNetCore.Mvc;

namespace StockAPI.Controllers;

[ApiController]
[Route("stock")]
public class StockController : ControllerBase
{
    [HttpGet]
    public IActionResult GetStatus()
    {
        return Ok(new
        {
            service = "stockapi",
            message = "Stock API initialized successfully",
            timestamp = DateTime.UtcNow
        });
    }
}
