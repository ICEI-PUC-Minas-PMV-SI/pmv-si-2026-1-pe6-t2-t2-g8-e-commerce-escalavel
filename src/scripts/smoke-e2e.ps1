param(
    [string]$GatewayBaseUrl = "http://localhost:7000",
    [switch]$SkipHealthChecks
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
        Url = $Url
        Method = $Method
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

function Get-ObjectPropertyValue {
    param(
        [Parameter(Mandatory = $false)]$Object,
        [Parameter(Mandatory = $true)][string[]]$Names
    )

    if ($null -eq $Object) {
        return $null
    }

    foreach ($name in $Names) {
        if ($Object -is [hashtable] -and $Object.ContainsKey($name)) {
            return $Object[$name]
        }

        $property = $Object.PSObject.Properties[$name]
        if ($null -ne $property) {
            return $property.Value
        }
    }

    return $null
}

$baseUrl = $GatewayBaseUrl.TrimEnd('/')
Write-Host "Running smoke test against $baseUrl" -ForegroundColor Cyan

if (-not $SkipHealthChecks) {
    $healthChecks = @(
        @{ Name = "gateway"; Url = "$baseUrl/gateway/health" },
        @{ Name = "stock"; Url = "$baseUrl/api/stock/health" },
        @{ Name = "orders"; Url = "$baseUrl/api/orders/health" }
    )

    foreach ($check in $healthChecks) {
        $result = Invoke-JsonRequest -Method "GET" -Url $check.Url -ExpectedStatusCodes @(200)
        $status = Get-ObjectPropertyValue -Object $result.Body -Names @("status", "Status")
        $statusText = [string]$status

        if (-not [string]::IsNullOrWhiteSpace($statusText)) {
            Assert-True -Condition ($statusText -imatch "^(ok|up)$") -Message "Healthcheck '$($check.Name)' returned unexpected status '$statusText'. Payload: $($result.Raw)"
        }

        Write-Host "[OK] health $($check.Name)" -ForegroundColor Green
    }
}

$productId = [guid]::NewGuid().Guid
$customerId = [guid]::NewGuid().Guid

$createStockBody = @{
    productId = $productId
    name = "Smoke Product $($productId.Substring(0, 8))"
    quantity = 12
    color = "Black"
    model = "Smoke"
    size = "M"
    costPrice = 50
    salePrice = 80
}

$createStock = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/stock/" -Body $createStockBody -ExpectedStatusCodes @(201)
Assert-True -Condition ($createStock.Body.productId -eq $productId) -Message "Stock create returned a different productId. Expected $productId, got $($createStock.Body.productId)"
Write-Host "[OK] created stock with external productId" -ForegroundColor Green

$duplicateStock = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/stock/" -Body $createStockBody -ExpectedStatusCodes @(409)
Write-Host "[OK] duplicate stock rejected with 409" -ForegroundColor Green

$reserveOrderId = [guid]::NewGuid().Guid
$confirmOrderId = [guid]::NewGuid().Guid

$reserve = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/reserve/$reserveOrderId" -Body @{ quantity = 3 } -ExpectedStatusCodes @(200)
$reserveAvailable = [int](Get-ObjectPropertyValue -Object $reserve.Body -Names @("quantityAvailable", "QuantityAvailable"))
$reserveReserved = [int](Get-ObjectPropertyValue -Object $reserve.Body -Names @("quantityReserved", "QuantityReserved"))
Assert-True -Condition ($reserveAvailable -eq 9) -Message "Reserve did not update QuantityAvailable correctly. Expected 9, got $reserveAvailable"
Assert-True -Condition ($reserveReserved -eq 3) -Message "Reserve did not update QuantityReserved correctly. Expected 3, got $reserveReserved"
Write-Host "[OK] reserve stock flow" -ForegroundColor Green

$overReserve = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/reserve/$confirmOrderId" -Body @{ quantity = 999 } -ExpectedStatusCodes @(422)
Write-Host "[OK] reserve above available rejected with 422" -ForegroundColor Green

$release = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/release/$reserveOrderId" -Body @{ quantity = 2 } -ExpectedStatusCodes @(200)
$releaseAvailable = [int](Get-ObjectPropertyValue -Object $release.Body -Names @("quantityAvailable", "QuantityAvailable"))
$releaseReserved = [int](Get-ObjectPropertyValue -Object $release.Body -Names @("quantityReserved", "QuantityReserved"))
Assert-True -Condition ($releaseAvailable -eq 11) -Message "Release did not update QuantityAvailable correctly. Expected 11, got $releaseAvailable"
Assert-True -Condition ($releaseReserved -eq 1) -Message "Release did not update QuantityReserved correctly. Expected 1, got $releaseReserved"
Write-Host "[OK] release stock flow" -ForegroundColor Green

$overRelease = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/release/$reserveOrderId" -Body @{ quantity = 2 } -ExpectedStatusCodes @(422)
Write-Host "[OK] release above reserved rejected with 422" -ForegroundColor Green

$reserveForConfirm = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/reserve/$confirmOrderId" -Body @{ quantity = 2 } -ExpectedStatusCodes @(200)
$confirm = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/confirm/$confirmOrderId" -Body @{ quantity = 2 } -ExpectedStatusCodes @(200)
$confirmAvailable = [int](Get-ObjectPropertyValue -Object $confirm.Body -Names @("quantityAvailable", "QuantityAvailable"))
$confirmReserved = [int](Get-ObjectPropertyValue -Object $confirm.Body -Names @("quantityReserved", "QuantityReserved"))
Assert-True -Condition ($confirmAvailable -eq 9) -Message "Confirm changed QuantityAvailable unexpectedly. Expected 9, got $confirmAvailable"
Assert-True -Condition ($confirmReserved -eq 1) -Message "Confirm did not update QuantityReserved correctly. Expected 1, got $confirmReserved"
Write-Host "[OK] confirm stock flow" -ForegroundColor Green

$overConfirm = Invoke-JsonRequest -Method "PUT" -Url "$baseUrl/api/stock/$productId/confirm/$reserveOrderId" -Body @{ quantity = 2 } -ExpectedStatusCodes @(422)
Write-Host "[OK] confirm above reserved rejected with 422" -ForegroundColor Green

$createOrderBody = @{
    customerId = $customerId
    items = @(
        @{
            productId = $productId
            quantity = 2
        }
    )
}

$createOrder = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/orders" -Body $createOrderBody -ExpectedStatusCodes @(200, 201)
Assert-True -Condition (-not [string]::IsNullOrWhiteSpace([string]$createOrder.Body.id)) -Message "Order create response did not return id. Body: $($createOrder.Raw)"
Assert-True -Condition ($createOrder.Body.customerId -eq $customerId) -Message "Order create returned a different customerId. Expected $customerId, got $($createOrder.Body.customerId)"
Write-Host "[OK] created order with UUID contract" -ForegroundColor Green

$orderId = [string]$createOrder.Body.id
$getOrder = Invoke-JsonRequest -Method "GET" -Url "$baseUrl/api/orders/$orderId" -ExpectedStatusCodes @(200)
Assert-True -Condition ($getOrder.Body.id -eq $orderId) -Message "Order lookup returned a different id. Expected $orderId, got $($getOrder.Body.id)"
Assert-True -Condition ($getOrder.Body.customerId -eq $customerId) -Message "Order lookup returned a different customerId. Expected $customerId, got $($getOrder.Body.customerId)"
Write-Host "[OK] fetched order by UUID id" -ForegroundColor Green

$approvedPayment = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/payments/process" -Body @{ orderId = $orderId; value = 100 } -ExpectedStatusCodes @(201)
$approvedStatus = [string](Get-ObjectPropertyValue -Object $approvedPayment.Body -Names @("status", "Status"))
$approvedTransactionId = [string](Get-ObjectPropertyValue -Object $approvedPayment.Body -Names @("transactionId", "TransactionId"))
Assert-True -Condition ($approvedStatus -ieq "APPROVED") -Message "Payment approval returned unexpected status '$approvedStatus'. Body: $($approvedPayment.Raw)"
Assert-True -Condition (-not [string]::IsNullOrWhiteSpace($approvedTransactionId)) -Message "Approved payment did not return transactionId. Body: $($approvedPayment.Raw)"
Write-Host "[OK] payment approved flow" -ForegroundColor Green

$declinedPayment = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/payments/process" -Body @{ orderId = $orderId; value = 10.99 } -ExpectedStatusCodes @(402)
$declinedStatus = [string](Get-ObjectPropertyValue -Object $declinedPayment.Body -Names @("status", "Status"))
Assert-True -Condition ($declinedStatus -ieq "DECLINED") -Message "Payment decline returned unexpected status '$declinedStatus'. Body: $($declinedPayment.Raw)"
Write-Host "[OK] payment declined flow" -ForegroundColor Green

$invalidPayment = Invoke-JsonRequest -Method "POST" -Url "$baseUrl/api/payments/process" -Body @{ orderId = $orderId } -ExpectedStatusCodes @(400)
Write-Host "[OK] payment invalid payload rejected with 400" -ForegroundColor Green

$stockAfter = Invoke-JsonRequest -Method "GET" -Url "$baseUrl/api/stock/$productId" -ExpectedStatusCodes @(200)
Assert-True -Condition ($stockAfter.Body.productId -eq $productId) -Message "Stock lookup returned a different productId. Expected $productId, got $($stockAfter.Body.productId)"
Write-Host "[OK] fetched stock by UUID productId" -ForegroundColor Green

Write-Host "" 
Write-Host "Smoke E2E finished successfully." -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- ProductId used: $productId"
Write-Host "- CustomerId used: $customerId"
Write-Host "- OrderId created: $orderId"
Write-Host "- ReserveOrderId used: $reserveOrderId"
Write-Host "- ConfirmOrderId used: $confirmOrderId"
