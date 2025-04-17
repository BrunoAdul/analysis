# Excel Flow Analyzer - Run MySQL Commands (PowerShell version)
Write-Host "Excel Flow Analyzer - Run MySQL Commands" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

Write-Host "This script will run MySQL commands to create a user and initialize the database."
Write-Host ""

$MYSQL_ADMIN = Read-Host "Enter MySQL admin username (default: root)"
if ([string]::IsNullOrEmpty($MYSQL_ADMIN)) {
    $MYSQL_ADMIN = "root"
}

$MYSQL_ADMIN_PASSWORD = Read-Host "Enter MySQL admin password"

Write-Host ""
Write-Host "Running MySQL commands..."
Write-Host ""

# Create database and user
$createUserCommand = @"
CREATE DATABASE IF NOT EXISTS excel_flow_analyzer;
CREATE USER IF NOT EXISTS 'dbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
GRANT ALL PRIVILEGES ON excel_flow_analyzer.* TO 'dbuser'@'localhost';
FLUSH PRIVILEGES;
"@

# Save to a temporary file
Set-Content -Path "temp_commands.sql" -Value $createUserCommand

# Execute the commands
if ([string]::IsNullOrEmpty($MYSQL_ADMIN_PASSWORD)) {
    & mysql -u $MYSQL_ADMIN -e "source temp_commands.sql"
} else {
    & mysql -u $MYSQL_ADMIN -p"$MYSQL_ADMIN_PASSWORD" -e "source temp_commands.sql"
}

# Check if the command was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "User 'dbuser' created successfully!" -ForegroundColor Green
    
    # Initialize the database
    Write-Host ""
    Write-Host "Initializing the database..."
    
    & mysql -u dbuser excel_flow_analyzer -e "source db-init.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database initialized successfully!" -ForegroundColor Green
        
        # Update .env file
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
        Write-Host ".env file updated with dbuser credentials." -ForegroundColor Green
    } else {
        Write-Host "Failed to initialize database." -ForegroundColor Red
    }
} else {
    Write-Host "Failed to create user. Please check your MySQL admin credentials." -ForegroundColor Red
}

# Clean up
Remove-Item -Path "temp_commands.sql" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")