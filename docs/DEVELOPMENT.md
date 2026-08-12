# Development Guide

This guide covers setting up a local development environment for StreamPlugins.

## Prerequisites

- [Node.js 22 LTS](https://nodejs.org/) (includes npm 10+)
- [Git](https://git-scm.com/)
- [OBS Studio](https://obsproject.com/) (for testing plugins)
- A code editor (VS Code recommended)

Optional dependencies:
- [obs-websocket-js](https://www.npmjs.com/package/obs-websocket-js) (installed via `npm install obs-websocket-js`, needed for the Scene Reactions plugin)
- [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) (for testing Donation Alerts webhooks from external services)

For building the native OBS plugin wrapper (optional):
- [CMake 3.28+](https://cmake.org/)
- C++ compiler (MSVC on Windows, Clang on macOS, GCC on Linux)
- [OBS Studio source code](https://github.com/obsproject/obs-studio)
- [CEF SDK](https://cef-builds.spotifycdn.com/index.html)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YourOrg/StreamPlugins.git
cd StreamPlugins
```

### 2. Install Dependencies

```bash
npm install
```

This installs all workspace dependencies across `server/`, `tray-app/`, and shared tooling.

### 3. Create Platform Applications

You need to register developer applications on each platform you want to test:

**Twitch**:
1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application
3. Set OAuth Redirect URL to `http://localhost:3847/auth/twitch/callback`
4. Note the Client ID and Client Secret

**YouTube**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable the YouTube Data API v3
3. Create OAuth 2.0 credentials (Web application type)
4. Add `http://localhost:3847/auth/youtube/callback` as an authorized redirect URI
5. Note the Client ID and Client Secret

**Kick**:
1. Go to [Kick Developer Settings](https://kick.com/settings/developer)
2. Create a new application
3. Set redirect URI to `http://localhost:3847/auth/kick/callback`
4. Note the Client ID and Client Secret

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Server
STREAMPLUGINS_PORT=3847

# Twitch
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret

# YouTube (Google OAuth)
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret

# Kick
KICK_CLIENT_ID=your_kick_client_id
KICK_CLIENT_SECRET=your_kick_client_secret
```

### 5. Start the Development Server

```bash
npm run dev
```

This starts the server at `http://localhost:3847` with hot reload enabled. Changes to server TypeScript files and plugin HTML/CSS/JS files are reflected immediately.

### 6. Connect to OBS

Open OBS Studio and add the plugins:

**As Browser Docks** (for control panels):
1. Go to Docks > Custom Browser Docks
2. Add entries:

| Dock Name | URL |
|-----------|-----|
| StreamPlugins Settings | `http://localhost:3847/plugins/settings/` |
| Stream Metrics | `http://localhost:3847/plugins/metrics-widget/settings.html` |
| Title Updater | `http://localhost:3847/plugins/title-updater/` |
| Chat Widget | `http://localhost:3847/plugins/chat-widget/` |
| Discord Logger | `http://localhost:3847/plugins/discord-logger/settings.html` |
| Goal Bars Settings | `http://localhost:3847/plugins/goal-bars/settings.html` |
| Donation Alerts Settings | `http://localhost:3847/plugins/donation-alerts/settings.html` |
| Scene Reactions | `http://localhost:3847/plugins/scene-reactions/` |

**As Browser Sources** (for overlays):
1. Add a Browser Source to your scene
2. Set URL to:
   - Metrics overlay: `http://localhost:3847/plugins/metrics-widget/`
   - Alerts overlay: `http://localhost:3847/plugins/alerts/`
   - Chat overlay: `http://localhost:3847/plugins/chat-widget/`
   - Viewer Count overlay: `http://localhost:3847/plugins/viewer-count/`
   - Goal Bars overlay: `http://localhost:3847/plugins/goal-bars/`
   - Donation Alerts overlay: `http://localhost:3847/plugins/donation-alerts/`

## Project Structure

```
StreamPlugins/
  server/              # Node.js backend (TypeScript)
    src/
      index.ts         # Entry point
      auth/            # OAuth flows for each platform
      api/             # API proxy routes
      websockets/      # WebSocket connection managers
      discord/         # Discord webhook forwarder
      config/          # Configuration management
      webhooks/        # Donation webhook handlers (PayPal, Stripe, Ko-fi, BMC, Streamlabs)
      obswebsocket/    # OBS WebSocket v5 client
      routes/          # Express route handlers
      routes/webhooks.ts # Webhook route registration
  plugins/             # Frontend widgets (HTML/CSS/JS)
    shared/
      css/base.css, themes.css  # Design system + 7 themes
      js/api-client.js, ws-client.js, utils.js, icons.js, theme-loader.js
    metrics-widget/    # Plugin 1: Stream metrics display
    title-updater/     # Plugin 2: Multi-platform title editor
    alerts/            # Plugin 3: Alert overlay
    chat-widget/       # Plugin 4: Unified chat
    discord-logger/    # Plugin 5: Discord integration settings
    viewer-count/      # Plugin 6: Combined Viewer Count
    goal-bars/         # Plugin 7: Goal Bars
    donation-alerts/   # Plugin 8: Donation Alerts
    scene-reactions/   # Plugin 9: OBS Scene Reactions
  native-plugin/       # C++ OBS plugin wrapper
  tray-app/            # Standalone tray application
  docs/                # Documentation
  scripts/             # Build and packaging scripts
  installer/           # Platform-specific installer configs
```

## Development Workflow

### Server Development

The server is written in TypeScript. Source files are in `server/src/`.

```bash
npm run dev              # Start with hot reload (nodemon + ts-node)
npm run build:server     # Compile TypeScript to dist/
npm run test             # Run tests with Vitest
npm run test:watch       # Run tests in watch mode
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues
npm run typecheck        # Run TypeScript type checking
```

### Plugin Frontend Development

Plugin frontends are vanilla HTML/CSS/JS in `plugins/`. They are served as static files by the server. Changes are reflected on browser refresh (or use the OBS source refresh button).

Tips:
- Develop in a regular browser first (Chrome DevTools) before testing in OBS
- OBS Browser Sources use Chromium -- all modern CSS and JS features are supported
- Use the shared API client at `plugins/shared/js/api-client.js` for backend communication
- Use the shared WebSocket client at `plugins/shared/js/ws-client.js` for real-time events
- Keep CSS animations performant -- avoid expensive properties like `filter: blur()` on overlays
- The shared SVG icon library (`plugins/shared/js/icons.js`) provides platform icons -- use `SPIcons.html('twitch')` for inline SVGs
- The theme loader (`plugins/shared/js/theme-loader.js`) should be included in every plugin's `<head>` BEFORE other scripts to prevent theme flicker
- Use `showToast(message, type)` from `utils.js` for user feedback instead of custom notifications
- Use `animateValue(el, from, to)` for smooth number transitions

### Native Plugin Development (Optional)

Only needed if you're modifying the C++ OBS plugin wrapper:

```bash
cd native-plugin
cmake -B build -DCMAKE_BUILD_TYPE=Debug \
  -DOBS_SOURCE_DIR=/path/to/obs-studio \
  -DCEF_ROOT_DIR=/path/to/cef
cmake --build build
```

## Debugging

### Server Debugging

The development server outputs detailed logs to the console. Log levels:
- `DEBUG` -- verbose API call details, WebSocket frame data
- `INFO` -- connection events, auth flow steps, polling results
- `WARN` -- rate limit approaches, token refresh warnings
- `ERROR` -- API failures, connection drops, auth errors

To enable debug logging:
```bash
DEBUG=streamplugins:* npm run dev
```

### OBS Browser Source Debugging

OBS includes a built-in browser debugger:
1. Launch OBS with `--remote-debugging-port=9222`
2. Open `http://localhost:9222` in Chrome
3. Select the browser source/dock you want to debug
4. Full Chrome DevTools available (Console, Network, Elements)

On Windows:
```
"C:\Program Files\obs-studio\bin\64bit\obs64.exe" --remote-debugging-port=9222
```

### WebSocket Debugging

To inspect WebSocket frames between the frontend and backend:
1. Use the Chrome DevTools Network tab (filter by WS)
2. Or set `DEBUG=streamplugins:ws*` for server-side WebSocket logging

### Platform API Debugging

Each API proxy route logs request/response details at DEBUG level. To test API calls independently:

```bash
# Test Twitch API (after authentication)
curl http://localhost:3847/api/metrics

# Test title update
curl -X POST http://localhost:3847/api/title/update \
  -H "Content-Type: application/json" \
  -d '{"platforms": ["twitch"], "title": "Test Stream"}'

# Test webhook (simulate a donation)
curl -X POST http://localhost:3847/webhooks/kofi \
  -H "Content-Type: application/json" \
  -d '{"data": "{\"type\":\"Donation\",\"from_name\":\"Test\",\"amount\":\"5.00\",\"currency\":\"USD\",\"message\":\"Test donation\"}"}'

# Test OBS connection status
curl http://localhost:3847/api/obs/status

# Test goals config
curl http://localhost:3847/api/config
```

## Testing

Tests use [Vitest](https://vitest.dev/).

```bash
npm run test                    # Run all tests
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # With coverage report
npm run test -- server/         # Run server tests only
```

### Test Structure

```
server/src/
  auth/__tests__/         # OAuth flow tests (mocked HTTP)
  api/__tests__/          # API proxy tests (mocked platform APIs)
  websockets/__tests__/   # WebSocket manager tests (mocked connections)
  discord/__tests__/      # Discord forwarder tests (mocked webhooks)
  webhooks/__tests__/     # Webhook handler tests (PayPal, Stripe, etc.)
  obswebsocket/__tests__/ # OBS WebSocket client tests
```

### Mock Servers

For integration testing without real platform credentials, use the mock server:

```bash
npm run mock-server     # Starts mock Twitch/YouTube/Kick API server on :3848
```

## Common Issues

**"Port 3847 already in use"**
Another instance is running. Kill it or change the port:
```bash
STREAMPLUGINS_PORT=3850 npm run dev
```

**"OAuth callback failed"**
Ensure your redirect URIs exactly match `http://localhost:3847/auth/{platform}/callback` in your platform developer console. Trailing slashes matter.

**"Browser source shows blank page in OBS"**
- Check that the dev server is running (`npm run dev`)
- Try refreshing the browser source (right-click > Refresh)
- Check the OBS log file for browser source errors

**"YouTube API quota exceeded"**
The YouTube Data API has a daily quota of 10,000 units. During development, reduce polling frequency in config or use the mock server.

**"Kick API returns 429"**
Kick rate limits at 10 requests/second. The server queues requests automatically, but rapid testing can trigger this. Wait and retry.

**"OBS WebSocket connection refused"**
Ensure OBS WebSocket Server is enabled (Tools > obs-websocket Settings). Default port is 4455. If you set a password in OBS, enter it in the Scene Reactions dock.

**"Donation webhooks not arriving"**
Ensure your tunnel (ngrok/Cloudflare) is running and the tunnel URL in Donation Alerts Settings matches your active tunnel URL. Webhook URLs on payment platforms must point to `{tunnel}/webhooks/{platform}`.
