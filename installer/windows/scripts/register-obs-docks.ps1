# Registers StreamPlugins browser docks in OBS Studio (user.ini).
# Safe to run multiple times; merges by URL without duplicating entries.

param(
  [string]$BaseUrl = "http://localhost:3847",
  [string]$ObsConfigDir = "$env:APPDATA\obs-studio"
)

$ErrorActionPreference = "Stop"

function Get-StreamPluginsDocks([string]$base) {
  $base = $base.TrimEnd("/")
  @(
    @{ title = "StreamPlugins: Settings";         url = "$base/plugins/settings/";                    uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A001" }
    @{ title = "StreamPlugins: Metrics";          url = "$base/plugins/metrics-widget/";            uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A002" }
    @{ title = "StreamPlugins: Title Updater";    url = "$base/plugins/title-updater/";             uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A003" }
    @{ title = "StreamPlugins: Chat";             url = "$base/plugins/chat-widget/";               uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A004" }
    @{ title = "StreamPlugins: Alerts";           url = "$base/plugins/alerts/";                    uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A005" }
    @{ title = "StreamPlugins: Discord";          url = "$base/plugins/discord-logger/settings.html"; uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A006" }
    @{ title = "StreamPlugins: Goal Bars";        url = "$base/plugins/goal-bars/settings.html";    uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A007" }
    @{ title = "StreamPlugins: Donations";         url = "$base/plugins/donation-alerts/settings.html"; uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A008" }
    @{ title = "StreamPlugins: Scene Reactions";  url = "$base/plugins/scene-reactions/";           uuid = "A3F2C8E17B4D4E9A9C1F2D8E6B5A009" }
  )
}

function Merge-Docks([object[]]$existing, [object[]]$incoming) {
  $merged = New-Object System.Collections.Generic.List[object]
  $urls = New-Object System.Collections.Generic.HashSet[string]

  foreach ($dock in $existing) {
    if ($null -ne $dock.url -and $urls.Add([string]$dock.url)) {
      $merged.Add($dock)
    }
  }

  foreach ($dock in $incoming) {
    if ($urls.Add([string]$dock.url)) {
      $merged.Add([pscustomobject]$dock)
    }
  }

  return ,$merged.ToArray()
}

function Update-ObsIniFile([string]$iniPath, [object[]]$incomingDocks) {
  $text = ""
  if (Test-Path $iniPath) {
    $text = Get-Content -Path $iniPath -Raw -Encoding UTF8
  }

  $existing = @()
  if ($text -match '(?m)^ExtraBrowserDocks=(.*)$') {
    try {
      $existing = @(ConvertFrom-Json $Matches[1])
    } catch {
      Write-Warning "Could not parse ExtraBrowserDocks in $iniPath; keeping non-StreamPlugins entries if possible."
      $existing = @()
    }
  }

  $merged = Merge-Docks $existing $incomingDocks
  $json = ($merged | ConvertTo-Json -Compress -Depth 5)

  if ($text -match '(?m)^ExtraBrowserDocks=') {
    $text = [regex]::Replace($text, '(?m)^ExtraBrowserDocks=.*$', "ExtraBrowserDocks=$json")
  } elseif ($text -match '(?ms)^\[BasicWindow\]\s*\r?\n') {
    $text = [regex]::Replace($text, '(?ms)^\[BasicWindow\]\s*\r?\n', "[BasicWindow]`r`nExtraBrowserDocks=$json`r`n")
  } else {
    if ($text.Length -gt 0 -and -not $text.EndsWith("`n")) {
      $text += "`r`n"
    }
    $text += "[BasicWindow]`r`nExtraBrowserDocks=$json`r`n"
  }

  Set-Content -Path $iniPath -Value $text -Encoding UTF8
  Write-Host "Updated $iniPath with $($merged.Count) browser dock(s)."
}

if (-not (Test-Path $ObsConfigDir)) {
  throw "OBS config directory not found: $ObsConfigDir. Install OBS Studio first."
}

$obs = Get-Process -Name obs64, obs32 -ErrorAction SilentlyContinue
if ($obs) {
  throw "OBS Studio is running. Fully quit OBS, then run this script again."
}

$docks = Get-StreamPluginsDocks $BaseUrl
$userIni = Join-Path $ObsConfigDir "user.ini"
$globalIni = Join-Path $ObsConfigDir "global.ini"

Update-ObsIniFile $userIni $docks
if (Test-Path $globalIni) {
  Update-ObsIniFile $globalIni $docks
}

Write-Host "StreamPlugins docks registered."
Write-Host "Next: run Start StreamPlugins Server, then open OBS and enable docks under View > Docks."
