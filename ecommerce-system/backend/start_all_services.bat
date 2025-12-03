@echo off
cd /d "C:\Users\ASUS\Desktop\ecommerce-system\ecommerce-system\backend"

echo Starting E-commerce Microservices...
echo.

echo [1/4] Starting Product Service on port 5001...
start "Product Service" cmd /k "C:\Users\ASUS\Desktop\ecommerce-system\.venv\Scripts\python.exe product_service.py"
timeout /t 2 /nobreak

echo [2/4] Starting User Service on port 5002...
start "User Service" cmd /k "C:\Users\ASUS\Desktop\ecommerce-system\.venv\Scripts\python.exe user_service.py"
timeout /t 2 /nobreak

echo [3/4] Starting Order Service on port 5003...
start "Order Service" cmd /k "C:\Users\ASUS\Desktop\ecommerce-system\.venv\Scripts\python.exe order_service.py"
timeout /t 2 /nobreak

echo [4/4] Starting API Gateway on port 5000...
start "API Gateway" cmd /k "C:\Users\ASUS\Desktop\ecommerce-system\.venv\Scripts\python.exe app.py"
timeout /t 3 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          E-commerce Microservices Started Successfully!        ║
echo ║                                                                ║
echo ║  API Gateway:        http://localhost:5000                    ║
echo ║  Product Service:    http://localhost:5001                    ║
echo ║  User Service:       http://localhost:5002                    ║
echo ║  Order Service:      http://localhost:5003                    ║
echo ║                                                                ║
echo ║  Frontend:           Open frontend/index.html in browser       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
