@echo off
setlocal

cd /d "%~dp0"

echo Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo npm install failed.
    exit /b %errorlevel%
)

echo Starting MySQL service...
powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command ""net start MySQL80""' -Verb RunAs"

echo Waiting a few seconds for MySQL...
timeout /t 5 >nul

echo Building production files...
call npm run build:prod
if %errorlevel% neq 0 (
    echo.
    echo Build failed. Production services were not started.
    exit /b %errorlevel%
)

echo Build completed successfully.

echo Starting backend in production...
start "Renderer Production" cmd /k "cd /d %cd% && npm run start:renderer"

echo Waiting for backend on port 4000...
:waitForBackend
powershell -command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',4000); $c.Close(); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto waitForBackend
)

echo Backend is ready.

echo Starting frontend in production...
start "Web Production" cmd /k "cd /d %cd% && npm run start:web"

echo.
echo Production rebuild and startup completed.
endlocal