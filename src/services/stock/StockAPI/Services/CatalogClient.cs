using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using StockAPI.DTOs;

namespace StockAPI.Services;

public class CatalogClient : ICatalogClient
{
    private readonly HttpClient _http;
    private readonly ILogger<CatalogClient> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public CatalogClient(HttpClient http, ILogger<CatalogClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<CatalogProductInfo?> GetProductBySkuIdAsync(Guid skuId, CancellationToken cancellationToken = default)
    {
        try
        {
            var sku = await GetAsync<SkuPayload>($"/skus/{skuId}", cancellationToken);
            if (sku is null || sku.ProductId == Guid.Empty) return null;

            var product = await GetAsync<ProductPayload>($"/products/{sku.ProductId}", cancellationToken);
            VariantPayload? variant = null;
            if (sku.VariantId != Guid.Empty)
            {
                variant = await GetAsync<VariantPayload>($"/variants/{sku.VariantId}", cancellationToken);
            }

            var urlImg = variant?.UrlImg ?? product?.UrlImg;
            return new CatalogProductInfo(
                product?.Name,
                product?.Description,
                urlImg,
                sku.Code,
                sku.Size
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to enrich SkuId={SkuId} from catalog", skuId);
            return null;
        }
    }

    private async Task<T?> GetAsync<T>(string path, CancellationToken cancellationToken)
    {
        using var response = await _http.GetAsync(path, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound) return default;
        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken);
    }

    private sealed record SkuPayload(Guid Id, Guid VariantId, Guid ProductId, string? Code, string? Size);
    private sealed record ProductPayload(Guid Id, string? Name, string? Description, string? UrlImg);
    private sealed record VariantPayload(Guid Id, string? Color, string? UrlImg);
}
