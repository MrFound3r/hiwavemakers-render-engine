powershell -Command "Start-Process cmd -ArgumentList '/c net start MySQL80' -Verb RunAs"

@echo off
echo Installing dependencies and starting development servers...

cd /d "%~dp0"

echo Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo npm install failed.
    exit /b %errorlevel%
)

@echo off
echo Starting all servers

:: Start Node backend server
start "Node Server" cmd /k "npm run dev"

echo All servers started.