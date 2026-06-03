param(
    [string]$GatewayBaseUrl = "http://localhost:7000"
)

# Normaliza `urlImg` no DB para armazenar APENAS o filename (key dentro do bucket).
# Clientes (web + mobile) prefixam IMAGE_BASE_URL próprio em runtime.
# Permite mesmo DB rodar em dev (gateway/MinIO) e prod (CDN) sem migração.
#
# Extração do filename:
#   1. http(s)://*:3000/(assets/)?<file>       -> <file>
#   2. http(s)://*/images/<file>               -> <file>
#   3. path com extensão de imagem             -> <file>
#   4. bare/<file>/assets/<file>               -> <file>
#   5. fallback (sem ext reconhecível, ex.: placehold.co)
#                                              -> slug(productName).webp
# Skips: urlImg null/vazio.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Slug([string]$Name) {
    if ([string]::IsNullOrWhiteSpace($Name)) { return "produto" }
    $s = $Name.ToLower()
    $s = [Text.RegularExpressions.Regex]::Replace($s, '[^\w\s-]', '')
    $s = [Text.RegularExpressions.Regex]::Replace($s, '\s+', '-')
    return $s.Trim('-')
}

function Resolve-Filename([string]$Url, [string]$ProductName) {
    if ($Url -match '^https?://[^/]*:3000/(?:assets/)?(.+)$')              { return $Matches[1] }
    if ($Url -match '^https?://[^/]+/images/(?:[^/]+/)?(.+)$')             { return $Matches[1] }
    if ($Url -match '([^/?#]+\.(?:webp|png|jpe?g|gif|avif))(?:\?.*)?$')    { return $Matches[1] }
    if ($Url -notmatch '://') {
        $f = $Url.TrimStart('/')
        if ($f -match '^assets/(.+)$') { return $Matches[1] }
        return $f
    }
    return "$(Get-Slug $ProductName).webp"
}

$base = $GatewayBaseUrl.TrimEnd('/')

Write-Host "GET $base/api/catalog/products" -ForegroundColor Cyan
$resp = Invoke-RestMethod -Method GET -Uri "$base/api/catalog/products" -UseBasicParsing

$products = if ($resp -is [System.Array]) { $resp } elseif ($resp.data) { $resp.data } else { @($resp) }
Write-Host "  $($products.Count) produtos" -ForegroundColor DarkGray

$updated = 0
$skipped = 0
$failed  = 0

foreach ($p in $products) {
    $url = [string]$p.urlImg
    if ([string]::IsNullOrWhiteSpace($url)) {
        Write-Host "  null  $($p.id) ($($p.name))" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    $newUrl = Resolve-Filename -Url $url -ProductName ([string]$p.name)

    if ($newUrl -eq $url) {
        Write-Host "  same  $($p.id) - $url" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    $body = @{
        name        = $p.name
        description = $p.description
        urlImg      = $newUrl
        active      = $p.active
        categoryId  = if ($p.category) { $p.category.id } else { $null }
    } | ConvertTo-Json -Depth 5 -Compress

    try {
        Invoke-RestMethod -Method PUT -Uri "$base/api/catalog/products/$($p.id)" `
            -ContentType "application/json" -Body $body -UseBasicParsing | Out-Null
        Write-Host "  ok    $($p.id) - $url -> $newUrl" -ForegroundColor Green
        $updated++
    }
    catch {
        Write-Host "  FAIL  $($p.id) - $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Updated: $updated  Skipped: $skipped  Failed: $failed" -ForegroundColor Cyan
