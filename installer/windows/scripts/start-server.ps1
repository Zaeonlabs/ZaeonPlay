# Starts the bundled StreamPlugins server (hidden) if port 3847 is free.
param(
  [string]$InstallRoot = (Join-Path $PSScriptRoot "..")
)

$ErrorActionPreference = "Stop"
$InstallRoot = (Resolve-Path $InstallRoot).Path

if ($env:STREAMPLUGINS_PORT) {
  $port = [int]$env:STREAMPLUGINS_PORT
} else {
  $port = 3847
}

$serverCandidates = @(
  (Join-Path $InstallRoot "data\server\streamplugins-server.exe"),
  (Join-Path $InstallRoot "streamplugins-server.exe")
)
$pluginsCandidates = @(
  (Join-Path $InstallRoot "data\plugins"),
  (Join-Path $InstallRoot "plugins")
)

$serverExe = $serverCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
$pluginsDir = $pluginsCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

function Test-PortInUse([int]$targetPort) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect("127.0.0.1", $targetPort)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

if (Test-PortInUse $port) {
  Write-Host "StreamPlugins server already running on port $port."
  exit 0
}

if (-not $serverExe) {
  throw "Server binary not found under $InstallRoot"
}

if (-not $pluginsDir) {
  throw "Plugins directory not found under $InstallRoot"
}

$env:STREAMPLUGINS_PLUGINS_DIR = $pluginsDir
Start-Process -FilePath $serverExe -WindowStyle Hidden -WorkingDirectory (Split-Path $serverExe)
Start-Sleep -Seconds 2

if (Test-PortInUse $port) {
  Write-Host "StreamPlugins server started on http://localhost:$port"
} else {
  throw "Failed to start StreamPlugins server. Try running from a terminal for errors."
}
