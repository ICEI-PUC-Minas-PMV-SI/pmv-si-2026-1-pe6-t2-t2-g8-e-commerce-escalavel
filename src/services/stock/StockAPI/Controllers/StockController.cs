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

    [HttpGet("{skuId:guid}")]
    public async Task<IActionResult> GetStock(Guid skuId)
    {
        var result = await _stockService.GetBySkuIdAsync(skuId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateStock([FromBody] CreateStockRequest request)
    {
        try
        {
            var result = await _stockService.CreateAsync(request);
            return CreatedAtAction(nameof(GetStock), new { skuId = result.SkuId }, result);
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

    [HttpPut("{skuId:guid}/reserve/{orderId:guid}")]
    public async Task<IActionResult> Reserve(Guid skuId, Guid orderId, [FromBody] ReserveRequest request)
    {
        try
        {
            var result = await _stockService.ReserveAsync(skuId, orderId, request);
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

    [HttpPut("{skuId:guid}/release/{orderId:guid}")]
    public async Task<IActionResult> Release(Guid skuId, Guid orderId, [FromBody] ReleaseRequest request)
    {
        try
        {
            var result = await _stockService.ReleaseAsync(skuId, orderId, request);
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

    [HttpPut("{skuId:guid}/confirm/{orderId:guid}")]
    public async Task<IActionResult> Confirm(Guid skuId, Guid orderId, [FromBody] ConfirmRequest request)
    {
        try
        {
            var result = await _stockService.ConfirmAsync(skuId, orderId, request);
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

    [HttpPut("{skuId:guid}/restock")]
    public async Task<IActionResult> Restock(Guid skuId, [FromBody] RestockRequest request)
    {
        try
        {
            var result = await _stockService.RestockAsync(skuId, request);
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

    [HttpGet("{skuId:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid skuId)
    {
        try
        {
            var result = await _stockService.GetHistoryAsync(skuId);
            return Ok(result);
        }
        catch (StockNotFoundException)
        {
            return NotFound();
        }
    }
}
