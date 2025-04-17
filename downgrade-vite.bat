@echo off
echo Downgrading Vite to a more compatible version...
echo.
cd /d "%~dp0"

echo Installing Vite v4.5.2 (older but more compatible version)...
npm install vite@4.5.2 --save-dev

echo.
echo Vite downgraded. Now trying to start the frontend...
echo.
npm run start:frontend
pause