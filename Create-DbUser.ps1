# Excel Flow Analyzer - Create Database User (PowerShell version)
Write-Host "Excel Flow Analyzer - Create Database User" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

Write-Host "This script will create a new MySQL user 'dbuser' with no password"
Write-Host "and grant all privileges to the excel_flow_analyzer database."
Write-Host ""

$MYSQL_ADMIN = Read-Host "Enter MySQL admin username (default: root)"
if ([string]::IsNullOrEmpty($MYSQL_ADMIN)) {
    $MYSQL_ADMIN = "root"
}

$MYSQL_ADMIN_PASSWORD = Read-Host "Enter MySQL admin password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($MYSQL_ADMIN_PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Creating database and user..."
Write-Host ""

# Create SQL file
$sqlContent = @"
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS excel_flow_analyzer;

-- Create user with no password
CREATE USER IF NOT EXISTS 'dbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY '';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON excel_flow_analyzer.* TO 'dbuser'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;
"@

Set-Content -Path "create_user.sql" -Value $sqlContent

# Run MySQL command
try {
    if ([string]::IsNullOrEmpty($PlainPassword)) {
        mysql -u $MYSQL_ADMIN < create_user.sql
    } else {
        mysql -u $MYSQL_ADMIN -p"$PlainPassword" < create_user.sql
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "User 'dbuser' created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Now updating .env file with the new user..."
        
        $envContent = @"
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=dbuser
DB_PASSWORD=
DB_NAME=excel_flow_analyzer

# JWT Secret for Authentication (for future use)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
"@
        
        Set-Content -Path ".env" -Value $envContent
        
        Write-Host ".env file updated with the new user credentials." -ForegroundColor Green
        Write-Host ""
        Write-Host "Now initializing the database..."
        
        mysql -u dbuser < db-init.sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Database initialized successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now start the server with: npm run start:server"
        } else {
            Write-Host ""
            Write-Host "Failed to initialize database. Please check the error message above." -ForegroundColor Red
        }
        
        Remove-Item -Path "create_user.sql"
    } else {
        Write-Host ""
        Write-Host "Failed to create user. Please check your MySQL admin credentials and try again." -ForegroundColor Red
        Remove-Item -Path "create_user.sql"
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Remove-Item -Path "create_user.sql" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")