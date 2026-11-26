@echo off
title MyOffiCity Local AI (RTX 4070 SUPER - Unlimited 0 kr)
cd /d "%~dp0"
echo ================================================================
echo   MyOffiCity Hybrid Local-AI (Ollama + Cloudflare Tunnel)
echo   Sa lange detta fonster ar oppet kor Tomas ^& teamet pa din GPU!
echo ================================================================
echo.
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="1" (
  echo Startar Ollama-servern i bakgrunden...
  start "" /B ollama serve >NUL 2>&1
  timeout /t 3 /nobreak >NUL
)
node local-ai-bridge.js
pause
