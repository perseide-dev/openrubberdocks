@echo off
REM OpenRubberDocks - Windows Launcher for Interactive Installer
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required but not installed or not in PATH.
    echo Please install Node.js (v18+) before running this installer.
    pause
    exit /b 1
)

node install.mjs %*
