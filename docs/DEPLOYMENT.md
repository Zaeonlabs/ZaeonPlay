# StreamPlugins -- Deployment and Distribution Guide

This document covers how to install, build, package, and distribute StreamPlugins:
a suite of nine OBS Studio plugins for Twitch, YouTube, and Kick.

---

## Table of Contents

1. [Overview](#overview)
2. [Option A: Native OBS Plugin Installation](#option-a-native-obs-plugin-installation)
3. [Option B: Standalone Tray App Installation](#option-b-standalone-tray-app-installation)
4. [First-Time Setup (Both Methods)](#first-time-setup-both-methods)
5. [Building From Source](#building-from-source)
6. [CI/CD Pipeline (GitHub Actions)](#cicd-pipeline-github-actions)
7. [Environment Variables](#environment-variables)
8. [Updating](#updating)
9. [Uninstalling](#uninstalling)

---

## Overview

StreamPlugins provides two installation methods:

| Method | Best For | How It Works |
|--------|----------|--------------|
| **Native OBS Plugin** (recommended) | Users who want a seamless experience | A thin C++ plugin auto-starts the server and registers docks inside OBS |
| **Standalone Tray App** (fallback) | Users who cannot install native plugins, or prefer manual control | A system tray application runs the server independently of OBS |

Both methods share the same underlying architecture:

- A **Node.js backend** server that handles platform APIs (Twitch, YouTube, Kick),
  WebSocket communication, and data persistence.
- **Web frontend widgets** served as local pages that OBS loads via its built-in
  Chromium browser (Browser Docks and Browser Sources).

The server listens on `http://localhost:3847` by default.

---

## Option A: Native OBS Plugin Installation

### How It Works

A lightweight C++ plugin (~200 lines of code) compiled as a shared library
(`.dll` on Windows, `.so` on Linux, `.dylib` on macOS) that performs three tasks:

1. **On OBS load** -- starts the bundled Node.js server as a child process.
2. **Registers browser docks** in the OBS Docks menu automatically:
   - Metrics
   - Title Updater
   - Chat
   - Alerts Settings
   - Discord Logger Settings
   - StreamPlugins Settings
   - Viewer Count
   - Goal Bars
   - Goal Bars Settings
   - Donation Alerts Settings
   - Scene Reactions
3. **On OBS close** -- gracefully stops the child server process.

Because the plugin manages the server lifecycle, the user does not need to
launch or configure anything outside of OBS.

### Installation Steps

#### Windows

1. Download `streamplugins-windows-x64.zip` from
   [GitHub Releases](https://github.com/YourOrg/StreamPlugins/releases).
2. Extract the archive to:
   ```
   %APPDATA%\obs-studio\plugins\streamplugins\
   ```
3. Verify the final directory structure:
   ```
   %APPDATA%\obs-studio\plugins\streamplugins\bin\64bit\streamplugins.dll
   %APPDATA%\obs-studio\plugins\streamplugins\data\...
   ```
4. Restart OBS Studio.
5. Open the **Docks** menu -- eleven new docks will appear.

#### macOS

1. Download `streamplugins-macos-universal.pkg` from GitHub Releases.
2. Right-click the `.pkg` file and select **Open** (the package is not
   notarized, so double-clicking may be blocked by Gatekeeper).
3. Follow the installer prompts. Files are placed at:
   ```
   ~/Library/Application Support/obs-studio/plugins/streamplugins.plugin
   ```
4. Restart OBS Studio.

#### Linux

**Debian/Ubuntu (apt-based):**

```bash
sudo apt install ./streamplugins-linux-x86_64.deb
```

**Manual (tar.gz):**

```bash
tar -xzf streamplugins-linux-x86_64.tar.gz -C ~/.config/obs-studio/plugins/
```

**Flatpak OBS users:**

Extract to the Flatpak-specific config path:

```bash
tar -xzf streamplugins-linux-x86_64.tar.gz \
  -C ~/.var/app/com.obsproject.Studio/config/obs-studio/plugins/streamplugins/
```

After any method, restart OBS Studio.

### File Layout Inside OBS Plugins Directory

```
streamplugins/
  bin/
    64bit/
      streamplugins.dll          # .so on Linux, .dylib on macOS
  data/
    server/
      streamplugins-server.exe   # No extension on Linux/macOS
      node_modules/              # Bundled dependencies (or compiled into binary via pkg)
    plugins/
      shared/
        css/
          ...
        js/
          ...
      metrics-widget/
        index.html
        ...
      title-updater/
        index.html
        ...
      alerts/
        index.html
        ...
      chat-widget/
        index.html
        ...
      discord-logger/
        settings.html
        ...
      viewer-count/
        index.html
        ...
      goal-bars/
        index.html, settings.html
        ...
      donation-alerts/
        index.html, settings.html
        ...
      scene-reactions/
        index.html
        ...
    locale/
      en-US.ini
```

---

## Option B: Standalone Tray App Installation

### How It Works

A system tray (Windows/Linux) or menu bar (macOS) application that runs the
Node.js server independently of OBS. The user manually adds Browser Docks
inside OBS to connect to the running server.

### Installation Steps

#### Windows

1. Download `streamplugins-tray-windows-x64.exe` from GitHub Releases.
2. Run the installer.
3. The app launches in the system tray (notification area).
4. (Optional) Enable **Start with Windows** from the tray context menu.

#### macOS

1. Download `streamplugins-tray-macos-universal.pkg` from GitHub Releases.
2. Install the menu bar app.
3. (Optional) Add a LaunchAgent for auto-start:
   ```bash
   cp /Applications/StreamPlugins.app/Contents/Resources/com.streamplugins.agent.plist \
     ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.streamplugins.agent.plist
   ```

#### Linux

**Debian/Ubuntu:**

```bash
sudo apt install ./streamplugins-tray-linux-x86_64.deb
```

**AppImage:**

```bash
chmod +x StreamPlugins-Tray-x86_64.AppImage
./StreamPlugins-Tray-x86_64.AppImage
```

(Optional) Enable the systemd user service for auto-start:

```bash
systemctl --user enable streamplugins.service
systemctl --user start streamplugins.service
```

### Configuring OBS Browser Docks

With the tray app running, add custom Browser Docks in OBS:

1. Open OBS and navigate to **Docks > Custom Browser Docks...**
2. Add the following entries:

| Dock Name | URL |
|-----------|-----|
| Metrics Widget | `http://localhost:3847/plugins/metrics-widget/` |
| Title Updater | `http://localhost:3847/plugins/title-updater/` |
| Chat Widget | `http://localhost:3847/plugins/chat-widget/` |
| Discord Logger | `http://localhost:3847/plugins/discord-logger/settings.html` |
| Settings | `http://localhost:3847/plugins/settings/` |
| Viewer Count | `http://localhost:3847/plugins/viewer-count/` |
| Goal Bars Settings | `http://localhost:3847/plugins/goal-bars/settings.html` |
| Donation Alerts Settings | `http://localhost:3847/plugins/donation-alerts/settings.html` |
| Scene Reactions | `http://localhost:3847/plugins/scene-reactions/` |

For the **Alerts** overlay, add a **Browser Source** to your scene:

- URL: `http://localhost:3847/plugins/alerts/`
- Width: 1920, Height: 1080 (or match your canvas)

Additional **Browser Sources** for overlay plugins:

- Goal Bars overlay: `http://localhost:3847/plugins/goal-bars/`
- Donation Alerts overlay: `http://localhost:3847/plugins/donation-alerts/`
- Viewer Count overlay: `http://localhost:3847/plugins/viewer-count/`

---

## First-Time Setup (Both Methods)

Once OBS is running with StreamPlugins loaded:

1. Open the **StreamPlugins Settings** dock.
2. Click **Connect Twitch** -- your default browser opens for OAuth
   authorization. Grant the requested permissions and return to OBS.
3. Click **Connect YouTube** -- your browser opens for Google OAuth. Sign in
   and authorize the application.
4. Click **Connect Kick** -- your browser opens for Kick OAuth. Sign in and
   authorize.
5. If your channel name or ID is not auto-detected, enter it manually in the
   corresponding field.
6. (Optional) For Plugin 5 (Discord Logger), paste one or more Discord webhook
   URLs in the Discord Logger Settings dock.
7. For Plugin 8 (Donation Alerts), set up a public tunnel (ngrok/Cloudflare
   Tunnel) and configure webhook URLs in the Donation Alerts Settings dock.
   Each payment platform needs its webhook URL pointed to your tunnel
   (e.g., `https://your-tunnel.ngrok.io/webhooks/paypal`).
8. For Plugin 9 (Scene Reactions), ensure OBS WebSocket Server is enabled in
   OBS (Tools > obs-websocket Settings). Configure the connection in the
   Scene Reactions dock.

Tokens are stored locally at `~/.streamplugins/tokens.json` (encrypted at rest).

---

## Building From Source

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22 LTS | Required for the server and build tooling |
| npm | 10+ | Ships with Node.js 22 |
| Git | Any recent | For cloning the repository |
| CMake | 3.28+ | Only needed for the native OBS plugin |
| C++ Compiler | MSVC (Win), Clang (macOS), GCC (Linux) | Only for native plugin |
| OBS Studio source | Matching your target OBS version | Only for native plugin |
| CEF SDK | Matching OBS's bundled CEF | Only for native plugin |

### Building the Server and Frontend Plugins

```bash
git clone https://github.com/YourOrg/StreamPlugins.git
cd StreamPlugins
npm install
npm run build
```

`npm run build` compiles the TypeScript server and bundles all frontend plugin
assets into the `dist/` directory.

For development with hot reload:

```bash
npm run dev
```

This starts the server on port 3847 with file watchers that rebuild on change.

### Building the Native OBS Plugin

```bash
cd native-plugin
cmake -B build -DCMAKE_BUILD_TYPE=Release \
  -DOBS_SOURCE_DIR=/path/to/obs-studio \
  -DCEF_ROOT_DIR=/path/to/cef
cmake --build build --config Release
```

The compiled shared library is output to `native-plugin/build/`.

### Building the Standalone Server Binary

To compile the Node.js server into a single self-contained executable (no
Node.js runtime required on the target machine):

```bash
npm run package:server
```

This uses [pkg](https://github.com/vercel/pkg) to produce platform-specific
binaries in `dist/server/`.

### Building Platform Packages

**Native OBS Plugin packages:**

```bash
npm run package:obs-plugin -- --platform=windows   # Creates .zip
npm run package:obs-plugin -- --platform=macos     # Creates .pkg
npm run package:obs-plugin -- --platform=linux     # Creates .deb
```

**Standalone Tray App packages:**

```bash
npm run package:tray-app -- --platform=windows     # Creates .exe installer
npm run package:tray-app -- --platform=macos       # Creates .pkg
npm run package:tray-app -- --platform=linux       # Creates .AppImage
```

All packages are output to `dist/packages/`.

---

## CI/CD Pipeline (GitHub Actions)

### Release Workflow

The project uses a tag-based release strategy. Pushing a tag matching `v*`
(e.g., `v1.0.0`) triggers the full build and release pipeline.

### What Happens on Tag Push

1. **Matrix build** across three OS runners:
   - `ubuntu-latest` (Linux x86_64)
   - `windows-latest` (Windows x64)
   - `macos-latest` (macOS universal -- arm64 + x86_64)

2. Each runner builds **two artifacts**:
   - Native OBS plugin package for that platform
   - Standalone tray app package for that platform

3. All six artifacts are uploaded and a **GitHub Release** is created
   automatically with the tag name as the release title.

### Artifacts Produced

| Platform | Native Plugin | Tray App |
|----------|--------------|----------|
| Windows x64 | `streamplugins-windows-x64.zip` | `streamplugins-tray-windows-x64.exe` |
| macOS Universal | `streamplugins-macos-universal.pkg` | `streamplugins-tray-macos-universal.pkg` |
| Linux x86_64 | `streamplugins-linux-x86_64.deb` | `StreamPlugins-Tray-x86_64.AppImage` |

### Workflow File Location

```
.github/workflows/release.yml
```

### Key Workflow Steps

1. Checkout repository
2. Set up Node.js 22 LTS
3. Install dependencies (`npm ci`)
4. Build server and frontend (`npm run build`)
5. Package standalone server binary (`npm run package:server`)
6. (Native plugin only) Set up CMake, C++ toolchain, OBS source, CEF SDK
7. Build native plugin (`cmake` steps)
8. Package platform artifacts
9. Upload artifacts to GitHub Release

---

## Environment Variables

### Development

Create a `.env` file in the project root (never commit this file):

```bash
STREAMPLUGINS_PORT=3847              # Server port (default: 3847)

TWITCH_CLIENT_ID=your_client_id     # Twitch application client ID
TWITCH_CLIENT_SECRET=your_secret    # Twitch application client secret

YOUTUBE_CLIENT_ID=your_client_id    # Google OAuth client ID
YOUTUBE_CLIENT_SECRET=your_secret   # Google OAuth client secret

KICK_CLIENT_ID=your_client_id       # Kick application client ID
KICK_CLIENT_SECRET=your_secret      # Kick application client secret

# OBS WebSocket (for Scene Reactions plugin)
OBS_WEBSOCKET_HOST=localhost
OBS_WEBSOCKET_PORT=4455
OBS_WEBSOCKET_PASSWORD=your_obs_ws_password
```

Register your OAuth applications at:

- Twitch: https://dev.twitch.tv/console/apps
- YouTube/Google: https://console.cloud.google.com/apis/credentials
- Kick: https://kick.com/developer (or equivalent developer portal)

### Production (Bundled Builds)

In production builds, OAuth credentials are embedded at build time. User tokens
(access tokens, refresh tokens) are stored encrypted on the local filesystem:

```
~/.streamplugins/tokens.json
```

The encryption key is derived from a machine-specific identifier. Tokens are
never transmitted to any third-party server.

### Webhook Tunnel Setup (Donation Alerts)

The Donation Alerts plugin receives webhook notifications from payment platforms
(PayPal, Stripe, Ko-fi, Buy Me a Coffee, Streamlabs). Since the StreamPlugins
server runs on localhost, a tunnel is needed to make it reachable from the
internet.

**Using ngrok:**

```bash
ngrok http 3847
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and paste it into the
Donation Alerts Settings dock under "Public Tunnel URL".

**Using Cloudflare Tunnel:**

```bash
cloudflared tunnel --url http://localhost:3847
```

Then configure each payment platform's webhook URL:

- PayPal: `{tunnel_url}/webhooks/paypal`
- Stripe: `{tunnel_url}/webhooks/stripe`
- Ko-fi: `{tunnel_url}/webhooks/kofi`
- Buy Me a Coffee: `{tunnel_url}/webhooks/buymeacoffee`
- Streamlabs: `{tunnel_url}/webhooks/streamlabs`

---

## Updating

### Native OBS Plugin

1. Download the new version from GitHub Releases.
2. Replace the contents of your OBS plugins `streamplugins/` folder with the
   new files.
3. Restart OBS Studio.

### Standalone Tray App

1. Download the new installer from GitHub Releases.
2. Run it over the existing installation (in-place upgrade).
3. Restart the tray app if it does not restart automatically.

### From Source

```bash
git pull origin main
npm install
npm run build
```

Then restart the server or OBS as appropriate.

---

## Uninstalling

### Native OBS Plugin

1. Close OBS Studio.
2. Delete the `streamplugins` folder from your OBS plugins directory:
   - Windows: `%APPDATA%\obs-studio\plugins\streamplugins\`
   - macOS: `~/Library/Application Support/obs-studio/plugins/streamplugins.plugin`
   - Linux: `~/.config/obs-studio/plugins/streamplugins/`
3. (Optional) Remove configuration and tokens:
   ```bash
   rm -rf ~/.streamplugins/
   ```

### Standalone Tray App

**Windows:** Use **Add or Remove Programs** in Windows Settings.

**macOS:** Drag the app from `/Applications` to Trash. Remove the LaunchAgent
if installed:

```bash
launchctl unload ~/Library/LaunchAgents/com.streamplugins.agent.plist
rm ~/Library/LaunchAgents/com.streamplugins.agent.plist
```

**Linux (deb):**

```bash
sudo apt remove streamplugins-tray
```

**Linux (AppImage):** Delete the AppImage file. Disable the systemd service if
enabled:

```bash
systemctl --user disable streamplugins.service
```

For all platforms, optionally remove stored configuration:

```bash
rm -rf ~/.streamplugins/
```

---

## Troubleshooting

### Server fails to start (native plugin)

- Check OBS logs: **Help > Log Files > View Current Log**. Look for lines
  prefixed with `[streamplugins]`.
- Ensure port 3847 is not already in use by another process.
- On Linux, ensure the server binary has execute permissions.

### Docks show "connection refused"

- Verify the server is running (check system processes for
  `streamplugins-server`).
- Confirm the port matches. If you changed `STREAMPLUGINS_PORT`, update the
  dock URLs accordingly.

### OAuth callback fails

- Ensure your OAuth app's redirect URI is set to
  `http://localhost:3847/auth/callback`.
- Check that no firewall is blocking localhost connections on port 3847.

### Flatpak OBS cannot reach localhost

Flatpak sandboxing may block localhost access. Grant network permissions:

```bash
flatpak override --user com.obsproject.Studio --share=network
```
