; StreamPlugins -- Standalone Tray App Installer (Inno Setup)
;
; Installs the tray application that runs the StreamPlugins server
; independently of OBS. Users add localhost Browser Dock URLs manually.
;
; Build:
;   iscc /DMyAppVersion=0.1.0 installer\windows\tray-setup.iss
;
; Expected input layout (relative to SourceDir):
;   streamplugins-tray\
;     streamplugins-tray.exe
;     streamplugins-server.exe
;     plugins\...

#ifndef MyAppVersion
  #define MyAppVersion "0.1.0"
#endif

#ifndef SourceDir
  #define SourceDir "..\..\dist\tray-app-windows"
#endif

#define MyAppName "StreamPlugins"
#define MyAppPublisher "StreamPlugins Contributors"
#define MyAppURL "https://github.com/StreamPlugins/StreamPlugins"
#define MyAppExeName "streamplugins-tray.exe"
#define MyAppId "{{B7D4E2A9-1C6F-4A8B-8E3D-5F9A0C2B7D14}"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={localappdata}\StreamPlugins
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=no
OutputDir=..\..\dist\installers
OutputBaseFilename=streamplugins-{#MyAppVersion}-tray-app-windows-x64-setup
SetupIconFile=
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayName={#MyAppName}
LicenseFile=..\..\LICENSE
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel2=This will install [name/ver] as a standalone system tray application.%n%nAfter installation, launch StreamPlugins from the Start Menu, then add Browser Docks / Browser Sources in OBS pointing to http://localhost:3847/plugins/...

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupicon"; Description: "Start {#MyAppName} automatically when Windows starts"; GroupDescription: "Startup options:"; Flags: unchecked

[Files]
Source: "{#SourceDir}\streamplugins-tray\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Open Dashboard"; Filename: "http://localhost:3847/plugins/settings/"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('{#MyAppName} was installed successfully.' + #13#10#13#10 +
           '1. Launch StreamPlugins from the Start Menu (or system tray).' + #13#10 +
           '2. Open the Settings page and connect Twitch / YouTube / Kick.' + #13#10 +
           '3. In OBS, add Custom Browser Docks / Browser Sources:' + #13#10 +
           '   http://localhost:3847/plugins/settings/' + #13#10 +
           '   http://localhost:3847/plugins/title-updater/' + #13#10 +
           '   http://localhost:3847/plugins/chat-widget/' + #13#10 +
           '   http://localhost:3847/plugins/metrics-widget/' + #13#10 +
           '   http://localhost:3847/plugins/alerts/',
           mbInformation, MB_OK);
  end;
end;

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
