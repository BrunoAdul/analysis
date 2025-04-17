# Excel Flow Analyzer - Update .env File (PowerShell version)
Write-Host "Excel Flow Analyzer - Update .env File" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

Write-Host "Updating .env file with dbuser credentials..."

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
Write-Host ""
Write-Host "You can now start the server with: npm run start:server"

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")