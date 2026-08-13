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
#define MyAppURL "https://github.com/Zaeonlabs/ZaeonPlay"
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
Source: "scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\scripts\start-server.cmd"; WorkingDir: "{app}"
Name: "{group}\Register OBS Docks"; Filename: "{app}\scripts\register-obs-docks.cmd"; WorkingDir: "{app}"
Name: "{group}\Open Dashboard"; Filename: "http://localhost:3847/plugins/settings/"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
Filename: "{app}\scripts\start-server.cmd"; Description: "Start StreamPlugins Server"; Flags: nowait postinstall skipifsilent

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    Exec('powershell.exe', '-NoProfile -ExecutionPolicy Bypass -File "' + ExpandConstant('{app}') + '\scripts\register-obs-docks.ps1"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    MsgBox('{#MyAppName} was installed successfully.' + #13#10#13#10 +
           '1. Use Start Menu > StreamPlugins > Start StreamPlugins Server before streaming.' + #13#10 +
           '2. Open OBS and enable docks under View > Docks (StreamPlugins: ...).' + #13#10 +
           '3. Open StreamPlugins: Settings to connect Twitch / YouTube / Kick.',
           mbInformation, MB_OK);
  end;
end;

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
