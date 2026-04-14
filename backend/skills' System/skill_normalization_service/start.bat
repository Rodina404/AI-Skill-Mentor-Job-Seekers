@echo off
REM Skill Normalization Service Startup Script (Windows)

setlocal enabledelayedexpansion

echo Starting Skill Normalization Service...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found in PATH
    pause
    exit /b 1
)

REM Create virtual environment if needed
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -q -r requirements.txt

REM Check data files
if not exist "data\skills.json" (
    echo ERROR: data\skills.json not found
    pause
    exit /b 1
)

if not exist "data\rules.json" (
    echo ERROR: data\rules.json not found
    pause
    exit /b 1
)

echo OK: Data files found

REM Create .env if needed
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo OK: Configuration loaded

REM Start service
set PORT=%SERVICE_PORT%
if "%PORT%"=="" set PORT=8003

echo.
echo Starting service on port %PORT%...
echo Access API at: http://localhost:%PORT%
echo Interactive docs at: http://localhost:%PORT%/docs
echo Press CTRL+C to stop
echo.

uvicorn main:app --host 0.0.0.0 --port %PORT% --reload

pause
