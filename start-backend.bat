@echo off
echo Starting Ignite Backend...
echo.

cd apps/Ignite

echo Checking if Maven is installed...
mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven first: https://maven.apache.org/install.html
    pause
    exit /b 1
)

echo Maven is installed. Starting the application...
echo.
echo The backend will start on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

mvn spring-boot:run

pause
