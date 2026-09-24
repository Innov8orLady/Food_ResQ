@echo off
title FoodResQ Launcher
echo ====================================================
echo Starting FoodResQ Platform...
echo ====================================================

echo [1/3] Starting Backend API (Port 5000)...
start "FoodResQ Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm start"

echo [2/3] Starting Python AI Microservice (Port 8000)...
start "FoodResQ AI Microservice (Port 8000)" cmd /k "cd /d %~dp0ai-service && py main.py"

echo [3/3] Starting Frontend Client (Port 5173)...
start "FoodResQ Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo All FoodResQ services launched in separate windows!
echo Opening http://localhost:5173 in your default browser...
timeout /t 4 >nul
start http://localhost:5173
