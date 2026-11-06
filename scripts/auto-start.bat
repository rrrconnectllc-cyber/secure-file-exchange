@echo off
REM SFX Auto-Start Script for Windows
REM Brings up all services and resumes development build

setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0.."
set "LOG_FILE=%PROJECT_DIR%\logs\auto-start.log"
set "PID_FILE=%PROJECT_DIR%\.auto-start.pid"

REM Create logs directory
if not exist "%PROJECT_DIR%\logs" mkdir "%PROJECT_DIR%\logs"

REM Log function
goto :main

:log
echo [%date% %time%] %* >> "%LOG_FILE%"
echo [%date% %time%] %*
exit /b

:main
call :log "=========================================="
call :log "SFX Auto-Start Sequence Initiated"
call :log "=========================================="

REM Step 1: Start Docker services
call :log "Step 1/5: Starting Docker services..."
cd /d "%PROJECT_DIR%"
docker-compose up -d
if errorlevel 1 (
    call :log "ERROR: Failed to start Docker services"
    exit /b 1
)

REM Step 2: Wait for services
call :log "Step 2/5: Waiting for services to be healthy..."
timeout /t 10 /nobreak

REM Step 3: Run database migrations
call :log "Step 3/5: Running database migrations..."
call npm run db:migrate
if errorlevel 1 (
    call :log "WARNING: Migration may have failed"
)

REM Step 4: Install dependencies
call :log "Step 4/5: Installing dependencies..."
call npm install --legacy-peer-deps
if errorlevel 1 (
    call :log "ERROR: Failed to install dependencies"
    exit /b 1
)

REM Step 5: Start development servers
call :log "Step 5/5: Starting development servers..."
call npm run dev

REM Cleanup
if exist "%PID_FILE%" del "%PID_FILE%"

call :log "=========================================="
call :log "SFX Auto-Start Complete"
call :log "=========================================="
call :log "Services running:"
call :log "  - API: http://localhost:3001"
call :log "  - Web: http://localhost:3000"
call :log "  - MinIO Console: http://localhost:9001"
call :log "=========================================="

endlocal
