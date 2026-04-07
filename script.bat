powershell -Command "Start-Process cmd -ArgumentList '/c net start MySQL80' -Verb RunAs"

@echo off
echo Starting all servers in separate terminals...

:: Start Node backend server
start "Node Server" cmd /k "npm run dev:renderer"

:: Wait for backend server to open port 3001
echo Waiting for backend to become available...
:waitForBackend
powershell -command "try { (New-Object Net.Sockets.TcpClient).Connect('localhost',4000) } catch { exit 1 }"
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto waitForBackend
)

echo Backend is ready.

:: Start Frontend server (e.g., Vite or React)
start "Frontend Dev" cmd /k "npm run dev:web"

echo All servers started.