; StreamPlugins -- Native OBS Plugin Installer (Inno Setup)
;
; Builds a Windows installer that places the plugin into the user's OBS
; plugins directory so docks auto-register on next OBS launch.
;
; Build:
;   iscc /DMyAppVersion=0.1.0 installer\windows\setup.iss
;
; Expected input layout (relative to SourceDir):
;   streamplugins\
;     bin\64bit\streamplugins.dll
;     data\
;       server\streamplugins-server.exe
;       plugins\...
;       locale\en-US.ini

#ifndef MyAppVersion
  #define MyAppVersion "0.1.0"
#endif

#ifndef SourceDir
  #define SourceDir "..\..\dist\obs-plugin-windows"
#endif

#define MyAppName "StreamPlugins"
#define MyAppPublisher "StreamPlugins Contributors"
#define MyAppURL "https://github.com/StreamPlugins/StreamPlugins"
#define MyAppId "{{A3F2C8E1-7B4D-4E9A-9C1F-2D8E6B5A4C03}"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName} OBS Plugin
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} OBS Plugin {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={userappdata}\obs-studio\plugins\streamplugins
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
DisableDirPage=no
OutputDir=..\..\dist\installers
OutputBaseFilename=streamplugins-{#MyAppVersion}-obs-plugin-windows-x64
SetupIconFile=
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayName={#MyAppName} OBS Plugin
InfoBeforeFile=
LicenseFile=..\..\LICENSE
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel2=This will install [name/ver] into your OBS Studio plugins folder.%n%nAfter installation, fully quit and restart OBS Studio. The StreamPlugins docks will appear under the Docks menu.%n%nMake sure OBS Studio is closed before continuing.

[Files]
; Native plugin binary
Source: "{#SourceDir}\streamplugins\bin\64bit\*"; DestDir: "{app}\bin\64bit"; Flags: ignoreversion recursesubdirs createallsubdirs

; Bundled server + plugin frontends + locale
Source: "{#SourceDir}\streamplugins\data\*"; DestDir: "{app}\data"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Uninstall {#MyAppName} OBS Plugin"; Filename: "{uninstallexe}"

[Code]
function InitializeSetup(): Boolean;
var
  ObsPluginsDir: String;
begin
  Result := True;
  ObsPluginsDir := ExpandConstant('{userappdata}\obs-studio\plugins');
  if not DirExists(ObsPluginsDir) then
  begin
    if not ForceDirectories(ObsPluginsDir) then
    begin
      MsgBox('Could not create OBS plugins directory:' + #13#10 + ObsPluginsDir + #13#10#13#10 +
             'Install OBS Studio first, then run this installer again.',
             mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('{#MyAppName} was installed successfully.' + #13#10#13#10 +
           '1. Fully quit OBS Studio if it is running.' + #13#10 +
           '2. Restart OBS Studio.' + #13#10 +
           '3. Open Docks > StreamPlugins: Settings to connect your accounts.',
           mbInformation, MB_OK);
  end;
end;

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
