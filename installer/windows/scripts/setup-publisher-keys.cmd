@echo off
title StreamPlugins - Publisher OAuth Setup
echo.
echo  One-time setup: add YOUR developer app keys (not streamer logins).
echo  Streamers will only click Connect in OBS after this is done.
echo.
set "ENV_FILE=%APPDATA%\StreamPlugins\.env"
set "INSTALL_ENV=%APPDATA%\obs-studio\plugins\streamplugins\data\.env"

if not exist "%APPDATA%\StreamPlugins" mkdir "%APPDATA%\StreamPlugins"

if not exist "%ENV_FILE%" (
  copy /Y "%~dp0..\..\..\.env.example" "%ENV_FILE%" >nul 2>&1
  if errorlevel 1 copy /Y "%~dp0..\.env.example" "%ENV_FILE%" >nul 2>&1
)

echo  Edit this file and paste your Twitch / YouTube / Kick CLIENT_ID and CLIENT_SECRET:
echo  %ENV_FILE%
echo.
echo  Redirect URIs to register on each platform:
echo    http://localhost:3847/auth/twitch/callback
echo    http://localhost:3847/auth/youtube/callback
echo    http://localhost:3847/auth/kick/callback
echo.
notepad "%ENV_FILE%"
echo.
echo  After saving, restart StreamPlugins Server, then Connect in OBS Settings.
pause
