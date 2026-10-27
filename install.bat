@echo off
REM OpenRubberDocks - Windows Launcher for Interactive Installer & Updater
REM License: GNU Affero General Public License v3.0 (AGPL-3.0-only)
REM
REM Usage:
REM   install.bat            -> Interactive Setup / Update / CORS Wizard
REM   install.bat --update   -> One-command automated update from 'main' (preserves .env & colors.ts)
REM   install.bat update     -> Alias for --update
REM   install.bat --cors     -> Fast interactive CORS / allowed domains configurator
REM   install.bat cors       -> Alias for --cors

cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required but not installed or not in PATH.
    echo Please install Node.js (v20+ recommended) before running this script.
    pause
    exit /b 1
)

node "%~dp0install.mjs" %*
