using Microsoft.AspNetCore.Mvc;
using StockAPI.Domain.Exceptions;
using StockAPI.DTOs;
using StockAPI.Services;

namespace StockAPI.Controllers;

[ApiController]
[Route("stock")]
public class StockController : ControllerBase
{
    private readonly IStockService _stockService;

    public StockController(IStockService stockService)
    {
        _stockService = stockService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStocks()
    {
        var result = await _stockService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{productId:guid}")]
    public async Task<IActionResult> GetStock(Guid productId)
    {
        var result = await _stockService.GetByProductIdAsync(productId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateStock([FromBody] CreateStockRequest request)
    {
        try
        {
            var result = await _stockService.CreateAsync(request);
            return CreatedAtAction(nameof(GetStock), new { productId = result.ProductId }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StockAlreadyExistsException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("{productId:guid}/reserve/{orderId:guid}")]
    public async Task<IActionResult> Reserve(Guid productId, Guid orderId, [FromBody] ReserveRequest request)
    {
        try
        {
            var result = await _stockService.ReserveAsync(productId, orderId, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StockConcurrencyException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (StockNotFoundException)
        {
            return NotFound();
        }
        catch (InsufficientAvailableStockException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }

    [HttpPut("{productId:guid}/release/{orderId:guid}")]
    public async Task<IActionResult> Release(Guid productId, Guid orderId, [FromBody] ReleaseRequest request)
    {
        try
        {
            var result = await _stockService.ReleaseAsync(productId, orderId, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StockConcurrencyException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (StockNotFoundException)
        {
            return NotFound();
        }
        catch (InsufficientReservedStockException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }

    [HttpPut("{productId:guid}/confirm/{orderId:guid}")]
    public async Task<IActionResult> Confirm(Guid productId, Guid orderId, [FromBody] ConfirmRequest request)
    {
        try
        {
            var result = await _stockService.ConfirmAsync(productId, orderId, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StockConcurrencyException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (StockNotFoundException)
        {
            return NotFound();
        }
        catch (InsufficientReservedStockException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }

    [HttpPut("{productId:guid}/restock")]
    public async Task<IActionResult> Restock(Guid productId, [FromBody] RestockRequest request)
    {
        try
        {
            var result = await _stockService.RestockAsync(productId, request);
            return Ok(result);
        }
        catch (StockConcurrencyException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (StockNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{productId:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid productId)
    {
        try
        {
            var result = await _stockService.GetHistoryAsync(productId);
            return Ok(result);
        }
        catch (StockNotFoundException)
        {
            return NotFound();
        }
    }
}
