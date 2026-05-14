@echo off
title TelWeb Tunnel
cd /d "%~dp0"
echo Cloudflare Tunnel 시작 중...
echo 아래 URL로 어디서든 접속 가능합니다.
echo.
cloudflared.exe tunnel --url http://localhost:8000
pause
