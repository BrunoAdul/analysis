@echo off
echo Fixing dependencies for Excel Flow Analyzer...
echo.
cd /d "%~dp0"

echo Removing problematic dependencies...
rmdir /s /q node_modules
del package-lock.json

echo Creating a temporary package.json without lovable-tagger...
powershell -Command "(Get-Content package.json) -replace '\"lovable-tagger\": \"\\^1.1.7\",', '' | Set-Content package.json.tmp"
move /y package.json.tmp package.json

echo Installing dependencies with --legacy-peer-deps...
npm install --legacy-peer-deps

echo Installing specific React plugin...
npm install @vitejs/plugin-react-swc@3.3.2 --legacy-peer-deps

echo.
echo Dependencies reinstalled. Now trying to start the frontend...
echo.
npm run dev
pause