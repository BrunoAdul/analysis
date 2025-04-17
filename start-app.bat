@echo off
echo Initializing database...
node init-sales-table.js

echo Starting server...
start cmd /k "node server.js"

echo Starting frontend...
start cmd /k "npm run dev"

echo Application started!
echo Server running on http://localhost:3001
echo Frontend running on http://localhost:8081