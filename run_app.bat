@echo off
title IntelliFAQ - Start Backend and Frontend
echo ===================================================
echo   Starting IntelliFAQ (CodeAlpha Task 2)
echo ===================================================

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "IntelliFAQ Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 >nul

echo [2/2] Starting React Frontend on http://127.0.0.1:5173 ...
start "IntelliFAQ Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul
start http://127.0.0.1:5173

echo.
echo Both servers have been launched!
echo Browser opened to: http://127.0.0.1:5173
echo.
pause
