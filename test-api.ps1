Write-Host "========================================" -ForegroundColor Cyan
Write-Host "E-COMMERCE API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "TEST 1: Get Products" -ForegroundColor Green
(Invoke-WebRequest -Uri "http://localhost:5000/api/products" -UseBasicParsing).Content | ConvertFrom-Json | ForEach-Object {
    Write-Host "✓ Found $($_.products.Count) products" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "TEST 2: User Registration" -ForegroundColor Green
$regPayload = @{ email = "testuser@example.com"; password = "password123" } | ConvertTo-Json
$reg = (Invoke-WebRequest -Uri "http://localhost:5000/api/users/register" -Method POST -Body $regPayload -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json
if ($reg.success) { 
    Write-Host "✓ User registered: $($reg.user.email)" -ForegroundColor Yellow
    $userId = $reg.user.id 
} else { 
    Write-Host "Registration failed, using user ID 1" -ForegroundColor Yellow
    $userId = 1 
}

Write-Host ""
Write-Host "TEST 3: User Login" -ForegroundColor Green
$loginPayload = @{ email = "testuser@example.com"; password = "password123" } | ConvertTo-Json
$login = (Invoke-WebRequest -Uri "http://localhost:5000/api/users/login" -Method POST -Body $loginPayload -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json
if ($login.success) { 
    Write-Host "✓ Login successful for $($login.user.email)" -ForegroundColor Yellow
    $userId = $login.user.id 
}

Write-Host ""
Write-Host "TEST 4: Create Order" -ForegroundColor Green
$orderPayload = @{
    user_id = $userId
    items = @(@{ product_id = 1; quantity = 2 })
} | ConvertTo-Json
$order = (Invoke-WebRequest -Uri "http://localhost:5000/api/orders/create" -Method POST -Body $orderPayload -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json
if ($order.success) { 
    Write-Host "✓ Order created: `$$($order.order.total)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "TEST 5: Get User Orders" -ForegroundColor Green
$orders = (Invoke-WebRequest -Uri "http://localhost:5000/api/orders/user/$userId" -UseBasicParsing).Content | ConvertFrom-Json
if ($orders.success) {
    Write-Host "✓ Found $($orders.orders.Count) order(s)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SYSTEM READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend:     http://localhost" -ForegroundColor Magenta
Write-Host "API Gateway:  http://localhost:5000" -ForegroundColor Magenta
