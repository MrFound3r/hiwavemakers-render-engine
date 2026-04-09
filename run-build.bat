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

echo Building production files...
call npm run build:prod
if %errorlevel% neq 0 (
    echo Build failed.
    exit /b %errorlevel%
)

echo Production build completed successfully.
endlocal