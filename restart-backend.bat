@echo off
echo Restarting Ignite Backend with updated CORS settings...
echo.

cd apps/Ignite

echo Stopping any running instances...
taskkill /f /im java.exe >nul 2>&1

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Starting the application with updated CORS configuration...
echo The backend will start on http://localhost:8080
echo CORS is now configured to allow frontend on ports 3000, 5173, 4173, 8081, 5500
echo.
echo Press Ctrl+C to stop the server
echo.

mvn spring-boot:run

pause
