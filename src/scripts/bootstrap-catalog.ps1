param(
    [string]$GatewayBaseUrl = "http://localhost:7000",
    [string]$CategoryName = "Camisetas",
    [string]$ProductName = "Camiseta Dry Fit Preta",
    [string]$ProductDescription = "Camiseta leve para treino",
    [decimal]$ProductPrice = 89.90,
    [string]$ProductImageUrl = "https://picsum.photos/seed/camisa-preta/600/600"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $false)]$Body,
        [Parameter(Mandatory = $true)][int[]]$ExpectedStatusCodes
    )

    $jsonBody = $null
    if ($null -ne $Body) {
        $jsonBody = $Body | ConvertTo-Json -Depth 10 -Compress
    }

    $statusCode = 0
    $rawContent = ""

    try {
        if ($null -ne $jsonBody) {
            $response = Invoke-WebRequest -Method $Method -Uri $Url -ContentType "application/json" -Body $jsonBody -UseBasicParsing
        }
        else {
            $response = Invoke-WebRequest -Method $Method -Uri $Url -UseBasicParsing
        }

        $statusCode = [int]$response.StatusCode
        $rawContent = $response.Content
    }
    catch {
        if ($null -eq $_.Exception.Response) {
            throw
        }

        $errorResponse = $_.Exception.Response
        $statusCode = [int]$errorResponse.StatusCode.value__

        $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
        $rawContent = $reader.ReadToEnd()
        $reader.Close()
    }

    if ($ExpectedStatusCodes -notcontains $statusCode) {
        throw "Unexpected status code $statusCode for $Method $Url. Expected: $($ExpectedStatusCodes -join ', '). Body: $rawContent"
    }

    $parsedBody = $null
    if (-not [string]::IsNullOrWhiteSpace($rawContent)) {
        try {
            $parsedBody = $rawContent | ConvertFrom-Json
        }
        catch {
            $parsedBody = $rawContent
        }
    }

    return [PSCustomObject]@{
        StatusCode = $statusCode
        Body = $parsedBody
        Raw = $rawContent
    }
}

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

$baseUrl = $GatewayBaseUrl.TrimEnd('/')
Write-Host "Running catalog bootstrap against $baseUrl" -ForegroundColor Cyan

# Item 1: health checks
$healthUrls = @(
    "$baseUrl/gateway/health",
    "$baseUrl/api/catalog/health",
    "$baseUrl/api/stock/health",
    "$baseUrl/api/orders/health",
    "$baseUrl/api/payments/health"
)

foreach ($url in $healthUrls) {
    $null = Invoke-JsonRequest -Method "GET" -Url $url -ExpectedStatusCodes @(200)
    Write-Host "[OK] health $url" -ForegroundColor Green
}

# Item 2: create category
$categoryBody = @{
    name = $CategoryName
    active = $true
}

$createdCategory = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/catalog/categories" -Body $categoryBody -ExpectedStatusCodes @(201)
$categoryId = [string]$createdCategory.Body.id
Assert-True -Condition (-not [string]::IsNullOrWhiteSpace($categoryId)) -Message "Category creation did not return id. Body: $($createdCategory.Raw)"
Write-Host "[OK] created category id=$categoryId" -ForegroundColor Green

# Item 3: create and validate product
$uniqueSuffix = (Get-Date).ToString("yyyyMMddHHmmss")
$productBody = @{
    name = "$ProductName $uniqueSuffix"
    description = $ProductDescription
    price = $ProductPrice
    urlImg = $ProductImageUrl
    active = $true
    categoryId = $categoryId
}

$createdProduct = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/catalog/products" -Body $productBody -ExpectedStatusCodes @(201)
$productId = [string]$createdProduct.Body.id
Assert-True -Condition (-not [string]::IsNullOrWhiteSpace($productId)) -Message "Product creation did not return id. Body: $($createdProduct.Raw)"
Write-Host "[OK] created product id=$productId" -ForegroundColor Green

$productList = Invoke-JsonRequest -Method "GET" -Url "$baseUrl/api/catalog/products" -ExpectedStatusCodes @(200)
$foundInList = $false
foreach ($item in @($productList.Body)) {
    if ([string]$item.id -eq $productId) {
        $foundInList = $true
        break
    }
}
Assert-True -Condition $foundInList -Message "Created product id=$productId not found in /api/catalog/products list."
Write-Host "[OK] product listed in catalog" -ForegroundColor Green

$productById = Invoke-JsonRequest -Method "GET" -Url "$baseUrl/api/catalog/products/$productId" -ExpectedStatusCodes @(200)
Assert-True -Condition ([string]$productById.Body.id -eq $productId) -Message "GET by id returned unexpected product id. Body: $($productById.Raw)"
Write-Host "[OK] product fetched by id" -ForegroundColor Green

Write-Host ""
Write-Host "Catalog bootstrap finished successfully." -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- CategoryId: $categoryId"
Write-Host "- ProductId:  $productId"
