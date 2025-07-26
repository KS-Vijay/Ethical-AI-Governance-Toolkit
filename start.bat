@echo off
echo Starting AI Integrity Hub...
echo.

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask API server...
start "Flask API" cmd /k "cd api && python app.py"

echo.
echo Waiting for API to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting React development server...
start "React Dev Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:8080
echo Backend: http://localhost:5000
echo.
echo Press any key to exit this launcher...
pause > nul 