@echo off
echo Excel Flow Analyzer - Database Initialization
echo ============================================
echo.
cd /d "%~dp0"

echo This script will initialize the MySQL database for Excel Flow Analyzer.
echo Make sure MySQL is installed and running on your system.
echo.

set /p MYSQL_USER=Enter MySQL username (default: root): 
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD=Enter MySQL password: 

echo.
echo Creating database and tables...
echo.

mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% < db-init.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database initialized successfully!
    echo.
    echo Now updating .env file with your credentials...
    
    echo # Server Configuration > .env
    echo PORT=3001 >> .env
    echo NODE_ENV=development >> .env
    echo. >> .env
    echo # Database Configuration >> .env
    echo DB_HOST=localhost >> .env
    echo DB_USER=%MYSQL_USER% >> .env
    echo DB_PASSWORD=%MYSQL_PASSWORD% >> .env
    echo DB_NAME=excel_flow_analyzer >> .env
    echo. >> .env
    echo # JWT Secret for Authentication (for future use) >> .env
    echo JWT_SECRET=your_jwt_secret_here >> .env
    echo JWT_EXPIRES_IN=1d >> .env
    
    echo .env file updated with your MySQL credentials.
    echo.
    echo You can now start the server with: npm run start:server
) else (
    echo.
    echo Failed to initialize database. Please check your MySQL credentials and try again.
)

pause