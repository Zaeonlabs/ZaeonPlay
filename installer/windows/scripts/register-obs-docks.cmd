@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register-obs-docks.ps1"
if errorlevel 1 (
  echo.
  pause
)
