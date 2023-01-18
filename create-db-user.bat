@echo off
echo Excel Flow Analyzer - Create Database User
echo =========================================
echo.
cd /d "%~dp0"

echo This script will create a new MySQL user 'dbuser' with no password
echo and grant all privileges to the excel_flow_analyzer database.
echo.

set /p MYSQL_ADMIN=Enter MySQL admin username (default: root): 
if "%MYSQL_ADMIN%"=="" set MYSQL_ADMIN=root

set /p MYSQL_ADMIN_PASSWORD=Enter MySQL admin password: 

echo.
echo Creating database and user...
echo.

echo -- Create database if it doesn't exist > create_user.sql
echo CREATE DATABASE IF NOT EXISTS excel_flow_analyzer; >> create_user.sql
echo. >> create_user.sql
echo -- Create user with no password >> create_user.sql
echo CREATE USER IF NOT EXISTS 'dbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY ''; >> create_user.sql
echo. >> create_user.sql
echo -- Grant privileges to the user >> create_user.sql
echo GRANT ALL PRIVILEGES ON excel_flow_analyzer.* TO 'dbuser'@'localhost'; >> create_user.sql
echo. >> create_user.sql
echo -- Flush privileges to apply changes >> create_user.sql
echo FLUSH PRIVILEGES; >> create_user.sql

mysql -u %MYSQL_ADMIN% -p%MYSQL_ADMIN_PASSWORD% < create_user.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo User 'dbuser' created successfully!
    echo.
    echo Now updating .env file with the new user...
    
    echo # Server Configuration > .env
    echo PORT=3001 >> .env
    echo NODE_ENV=development >> .env
    echo. >> .env
    echo # Database Configuration >> .env
    echo DB_HOST=localhost >> .env
    echo DB_USER=dbuser >> .env
    echo DB_PASSWORD= >> .env
    echo DB_NAME=excel_flow_analyzer >> .env
    echo. >> .env
    echo # JWT Secret for Authentication (for future use) >> .env
    echo JWT_SECRET=your_jwt_secret_here >> .env
    echo JWT_EXPIRES_IN=1d >> .env
    
    echo .env file updated with the new user credentials.
    echo.
    echo Now initializing the database...
    
    mysql -u dbuser < db-init.sql
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Database initialized successfully!
        echo.
        echo You can now start the server with: npm run start:server
    ) else (
        echo.
        echo Failed to initialize database. Please check the error message above.
    )
    
    del create_user.sql
) else (
    echo.
    echo Failed to create user. Please check your MySQL admin credentials and try again.
    del create_user.sql
)

pause