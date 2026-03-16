using Microsoft.AspNetCore.Mvc;

namespace StockAPI.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "ok", service = "stockapi" });
    }
}
