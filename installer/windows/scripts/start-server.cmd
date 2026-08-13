@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1" -InstallRoot "%~dp0.."
if errorlevel 1 (
  echo.
  pause
)
