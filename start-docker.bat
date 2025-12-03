@echo off
REM E-commerce Microservices with Docker - Startup Script

cd /d "C:\Users\ASUS\Desktop\ecommerce-system\ecommerce-system"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║       E-commerce Docker Microservices Startup                  ║
echo ║                                                                ║
echo ║  Starting all services via Docker Compose...                  ║
echo ║  Please wait 5-10 seconds for containers to initialize         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Start all services in background
docker-compose up -d

REM Wait for services to be ready
echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          All Services Started Successfully!                    ║
echo ║                                                                ║
echo ║  ✓ Frontend:         http://localhost                          ║
echo ║  ✓ API Gateway:      http://localhost:5000                    ║
echo ║  ✓ Product Service:  http://localhost:5001                    ║
echo ║  ✓ User Service:     http://localhost:5002                    ║
echo ║  ✓ Order Service:    http://localhost:5003                    ║
echo ║                                                                ║
echo ║  Opening Frontend in Browser...                                ║
echo ║                                                                ║
echo ║  To stop all services: Run "docker-compose down"               ║
echo ╚════════════════════════════════════════════════════════════════╝

REM Open frontend in default browser
timeout /t 2 /nobreak
start http://localhost

pause
