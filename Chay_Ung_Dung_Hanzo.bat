@echo off
title Hanzo Hanyu Localhost Server
cd /d "%~dp0"
echo Khoi chay Hanzo Hanyu qua Localhost HTTP Server...
powershell -ExecutionPolicy Bypass -File .\start_server.ps1
pause
