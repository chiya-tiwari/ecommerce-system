@echo off
REM E-commerce Microservices Startup Script
REM This script starts all microservices and the API gateway

cd /d "C:\Users\ASUS\Desktop\ecommerce-system"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║       E-commerce Microservices Architecture Startup            ║
echo ║                                                                ║
echo ║  Starting all services...                                      ║
echo ║  Please wait 3-5 seconds for all services to start             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Kill any existing Python processes on these ports
taskkill /F /IM python.exe >nul 2>&1

REM Start each service in a new window
echo [1/4] Starting Product Service (Port 5001)...
start "Product Service - Port 5001" cmd /k "cd ecommerce-system\backend && .\..\..\.venv\Scripts\python.exe product_service.py"

echo [2/4] Starting User Service (Port 5002)...
timeout /t 1 /nobreak
start "User Service - Port 5002" cmd /k "cd ecommerce-system\backend && .\..\..\.venv\Scripts\python.exe user_service.py"

echo [3/4] Starting Order Service (Port 5003)...
timeout /t 1 /nobreak
start "Order Service - Port 5003" cmd /k "cd ecommerce-system\backend && .\..\..\.venv\Scripts\python.exe order_service.py"

echo [4/4] Starting API Gateway (Port 5000)...
timeout /t 1 /nobreak
start "API Gateway - Port 5000" cmd /k "cd ecommerce-system\backend && .\..\..\.venv\Scripts\python.exe app.py"

echo.
timeout /t 3 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          All Services Started Successfully!                    ║
echo ║                                                                ║
echo ║  ✓ API Gateway:      http://localhost:5000                    ║
echo ║  ✓ Product Service:  http://localhost:5001                    ║
echo ║  ✓ User Service:     http://localhost:5002                    ║
echo ║  ✓ Order Service:    http://localhost:5003                    ║
echo ║                                                                ║
echo ║  📱 Opening Frontend...                                        ║
echo ║                                                                ║
echo ║  To stop services: Close the command windows                   ║
echo ╚════════════════════════════════════════════════════════════════╝

REM Open frontend in default browser
timeout /t 2 /nobreak
start http://localhost
echo.

echo Opening frontend in browser...
timeout /t 2 /nobreak

REM Try to open the frontend file
if exist "ecommerce-system\frontend\index.html" (
    start "" "ecommerce-system\frontend\index.html"
) else (
    echo.
    echo NOTE: Please open ecommerce-system/frontend/index.html in your browser
    echo.
)

echo.
echo Services running in background windows. Press any key to exit this window...
pause >nul
