@echo off
title TelWeb Server
cd /d "%~dp0backend"
echo TelWeb 서버 시작 중...
node --env-file=.env server.js
pause
