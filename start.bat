@echo off
title TelWeb
cd /d "%~dp0"

echo [1/2] TelWeb 서버 시작 중...
start "TelWeb Server" cmd /k "cd /d ""%~dp0backend"" && node --env-file=.env server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Cloudflare Tunnel 시작 중...
echo.
echo =============================================
echo  아래 URL로 어디서든 접속하세요:
echo  (https://xxxx.trycloudflare.com 형태)
echo =============================================
echo.
cloudflared.exe tunnel --url http://localhost:8000
