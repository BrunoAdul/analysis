@echo off
echo Fixing frontend dependencies for Excel Flow Analyzer...
echo.
cd /d "%~dp0"

echo Removing node_modules...
rmdir /s /q node_modules

echo Removing package-lock.json...
del package-lock.json

echo Installing dependencies with --legacy-peer-deps...
npm install --legacy-peer-deps

echo.
echo Dependencies reinstalled. Now trying to start the frontend...
echo.
npm run start:frontend
pause