@echo off
title Smart School ERP — शहीद राम सिंह विद्यालय
color 1F
cls
echo.
echo  ==========================================
echo   शहीद राम सिंह विद्यालय — Smart School ERP
echo  ==========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Download from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd /d %~dp0backend
call npm install --silent
if %errorlevel% neq 0 ( echo [ERROR] Backend npm install failed & pause & exit /b 1 )
echo       Done!

echo [2/4] Installing frontend dependencies...
cd /d %~dp0frontend
call npm install --silent
if %errorlevel% neq 0 ( echo [ERROR] Frontend npm install failed & pause & exit /b 1 )
echo       Done!

echo.
echo [3/4] Starting Backend API (port 5000)...
cd /d %~dp0backend
start "School ERP Backend" cmd /k "color 0A && echo Backend starting... && npm run dev"

echo [4/4] Starting Frontend (port 3000)...
cd /d %~dp0frontend
timeout /t 3 /nobreak >nul
start "School ERP Frontend" cmd /k "color 0B && echo Frontend starting... && npm run dev"

echo.
echo  ==========================================
echo   Both servers are starting!
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000/health
echo.
echo   Login with:
echo     Admin:   admin@srsv.edu.in / admin123
echo     Teacher: ram.sharma@srsv.edu.in / teacher123
echo  ==========================================
echo.
timeout /t 5
start http://localhost:3000
