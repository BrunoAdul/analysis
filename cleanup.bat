@echo off
echo Cleaning up unnecessary files...

del /F /Q "simple-viewer.html"
rd /S /Q "simple-react-app"
del /F /Q "local-test.bat"
del /F /Q "local-test.sh"
del /F /Q "src\mockApi.js"

echo Cleanup completed!