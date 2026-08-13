@echo off
title StreamPlugins - Fix OBS Docks
echo.
echo  StreamPlugins dock setup
echo  ========================
echo.
echo  OBS must be FULLY CLOSED before continuing.
echo  Right-click the OBS icon in the system tray and choose Exit.
echo.
pause

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register-obs-docks.ps1"
if errorlevel 1 (
  echo.
  echo  FAILED - is OBS still running? Close it completely and try again.
  pause
  exit /b 1
)

echo.
echo  Starting StreamPlugins server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1" -InstallRoot "%~dp0.."
echo.
echo  Done! Now open OBS and go to View ^> Docks
echo  Enable the StreamPlugins panels.
echo.
pause
