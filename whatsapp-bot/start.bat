@echo off
REM WhatsApp Bot Startup Script for Windows
echo 🚀 Starting Cyher WhatsApp Bot...
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✅ .env file created with default settings.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

echo ✅ Starting bot...
echo.
echo 📱 A QR code will appear below. Scan it with your WhatsApp:
echo.

REM Start the bot
node src\index.js
