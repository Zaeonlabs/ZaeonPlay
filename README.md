# StreamPlugins

**Multi-Platform Streaming Tools for OBS Studio**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Zaeonlabs/ZaeonPlay/ci.yml?branch=master)](https://github.com/Zaeonlabs/ZaeonPlay/actions)
[![Latest Release](https://img.shields.io/github/v/release/Zaeonlabs/ZaeonPlay)](https://github.com/Zaeonlabs/ZaeonPlay/releases)
[![Discord](https://img.shields.io/discord/000000000000000000?label=Discord&logo=discord&logoColor=white)](https://discord.gg/streamplugins)

---

## Overview

StreamPlugins is an open-source monorepo containing nine interconnected OBS Studio plugins designed for multi-platform streamers. Whether you broadcast to Twitch, YouTube, Kick, or all three simultaneously, StreamPlugins gives you a unified control surface directly inside OBS -- no more juggling browser tabs and separate dashboards. Beyond basic metrics and chat, StreamPlugins offers donation alerts, animated goal bars, a combined viewer count overlay, OBS scene automation triggered by stream events, and a user-selectable theme system with seven built-in themes.

Each plugin is built with web technologies (HTML, CSS, and JavaScript) backed by a lightweight local Node.js server that handles API authentication, data aggregation, and real-time event delivery. The plugins communicate with each other through a shared event bus, enabling powerful workflows such as forwarding alerts from all platforms to Discord, displaying combined chat from every connected service in a single panel, or automatically switching OBS scenes in response to raids and donations.

StreamPlugins supports two installation methods to suit different workflows. The **native OBS plugin** uses an installer that registers custom docks directly into OBS Studio with zero manual configuration. Alternatively, a **standalone tray application** runs the backend independently and exposes browser-source URLs that can be added to any OBS setup -- ideal for developers, advanced users, or anyone who prefers manual control.

---

## Features

### Stream Metrics Widget

Display real-time subscriber, follower, and viewer counts from Twitch, YouTube, and Kick in a compact OBS dock. Toggle visibility per platform, choose between combined totals or individual breakdowns, and customize the display theme to match your stream overlay.

### Stream Title Updater

Update your stream title, category, tags, description, and privacy settings across all three platforms from a single OBS dock panel. Save presets for recurring streams, schedule title changes, and keep metadata consistent without switching between dashboards.

### Multistream Alerts

An animated browser-source overlay that renders alerts for subscriptions, follows, raids, bits, Super Chats, and gift subs from Twitch, YouTube, and Kick. Includes a built-in alert queue, customizable animations, sound effects, and per-platform styling with platform badges.

### Unified Chat Widget

Combine live chat from Twitch, YouTube, and Kick into one scrollable window. Messages are tagged with platform icons and timestamps, support user-role badges, and can be filtered or highlighted by platform, moderator status, or keyword. Available as both a dock panel and a transparent browser source.

### Discord Logger

Forward all chat messages and stream events (subscriptions, raids, follows, bits, Super Chats) to one or more Discord channels via webhooks. Messages are formatted as rich embeds with platform colors, user avatars, and event metadata. Configurable filters let you choose exactly which events reach which channel.

### Combined Viewer Count

A simple, compact overlay widget showing the total combined viewer count across all connected platforms. Features a large animated total number with a per-platform breakdown row below (Twitch, YouTube, Kick icons with individual counts). Polls every 10 seconds and uses a transparent background for seamless overlay use.

### Goal Bars

Animated progress bar overlays for subscriber goals, follower goals, and donation goals. Shows current/target with percentage and uses a gradient fill with glow effects. Includes a settings dock for configuring goal type, label, target, and current values. Auto-updates from the metrics API and donation WebSocket events.

### Donation Alerts

Alert overlay for payments received via PayPal, Stripe, Ko-fi, Buy Me a Coffee, and Streamlabs. Displays donor name, amount, and optional message with payment platform-specific styling. Includes a settings dock for webhook configuration. Requires a public tunnel (ngrok or Cloudflare Tunnel) for webhook delivery in development or self-hosted setups.

### OBS Scene Reactions

A control dock that automates OBS scene and source changes in response to stream events via obs-websocket v5. Configure rules like "On raid → Switch to BRB scene for 30 seconds" or "On donation > $10 → Play media source". Features a rule builder UI, scene/source auto-discovery, test buttons, and enable/disable toggles per rule.

---

### Themes

StreamPlugins includes 7 built-in themes: Dark, Light, Transparent, AMOLED, Midnight Blue, Cyberpunk, and Forest. Themes are selectable from the Settings dock and synchronized across all open docks and overlays in real time via the shared event bus.

---

## Screenshots

<!-- screenshots will be added -->

### Stream Metrics Widget

<!-- screenshot: metrics widget showing Twitch/YouTube/Kick counts -->

### Stream Title Updater

<!-- screenshot: title updater dock with multi-platform fields -->

### Multistream Alerts

<!-- screenshot: animated alert overlay in action -->

### Unified Chat Widget

<!-- screenshot: combined chat panel with platform icons -->

### Discord Logger

<!-- screenshot: Discord webhook embed examples -->

### Combined Viewer Count

<!-- screenshot: combined viewer count overlay with platform breakdown -->

### Goal Bars

<!-- screenshot: animated goal bar overlay showing progress -->

### Donation Alerts

<!-- screenshot: donation alert overlay with payment styling -->

### OBS Scene Reactions

<!-- screenshot: scene reactions rule builder dock -->

---

## Quick Start

### Option A: Native OBS Plugin (Recommended)

1. Download the latest installer from the [Releases](https://github.com/Zaeonlabs/ZaeonPlay/releases) page.
2. **Fully quit OBS Studio**, then run the installer.
3. The installer registers StreamPlugins under **View → Docks** and adds a **Start StreamPlugins Server** shortcut in the Start Menu.
4. Before streaming, run **Start StreamPlugins Server** (OBS docks load pages from `http://localhost:3847`).
5. Open OBS → **View → Docks** → enable the **StreamPlugins:** panels.
6. Open **StreamPlugins: Settings** to connect Twitch, YouTube, Kick, and Discord.

> **Note:** Auto-dock registration uses OBS Custom Browser Docks (not the native C++ plugin yet). If docks are missing after install, run **Register OBS Docks** from the Start Menu while OBS is closed, then restart OBS.

### Option B: Standalone / Development

```bash
git clone https://github.com/Zaeonlabs/ZaeonPlay.git
cd ZaeonPlay
npm install
npm run dev
```

The development server starts on `http://localhost:3847`. In OBS, use **View → Docks → Custom Browser Docks** (or run `installer\windows\scripts\register-obs-docks.cmd` while OBS is closed to add them automatically), then enable:

| Plugin | URL |
|--------|-----|
| Stream Metrics Widget | `http://localhost:3847/metrics` |
| Stream Title Updater | `http://localhost:3847/title` |
| Multistream Alerts | `http://localhost:3847/alerts` |
| Unified Chat Widget | `http://localhost:3847/chat` |
| Discord Logger (config) | `http://localhost:3847/discord` |
| Combined Viewer Count | `http://localhost:3847/plugins/viewer-count/` |
| Goal Bars (overlay) | `http://localhost:3847/plugins/goal-bars/` |
| Goal Bars (settings) | `http://localhost:3847/plugins/goal-bars/settings.html` |
| Donation Alerts (overlay) | `http://localhost:3847/plugins/donation-alerts/` |
| Donation Alerts (settings) | `http://localhost:3847/plugins/donation-alerts/settings.html` |
| Scene Reactions | `http://localhost:3847/plugins/scene-reactions/` |

Open `http://localhost:3847/settings` in your browser to configure API credentials and connect accounts.

---

## Supported Platforms

| Feature | Twitch | YouTube | Kick |
|---------|:------:|:-------:|:----:|
| Viewer count | Yes | Yes | Yes |
| Follower / Subscriber count | Yes | Yes | Yes |
| Update stream title | Yes | Yes | Yes |
| Update category / game | Yes | Yes | Yes |
| Update tags | Yes | Yes | -- |
| Update description | -- | Yes | Yes |
| Update privacy | -- | Yes | -- |
| Subscription alerts | Yes | Yes | Yes |
| Follow alerts | Yes | Yes | Yes |
| Raid alerts | Yes | -- | Yes |
| Bits / Super Chat alerts | Yes | Yes | -- |
| Gift sub alerts | Yes | Yes | Yes |
| Live chat feed | Yes | Yes | Yes |
| Chat moderation badges | Yes | Yes | Yes |
| Discord event forwarding | Yes | Yes | Yes |
| Combined viewer count | Yes | Yes | Yes |
| Goal tracking | Yes | Yes | Yes |
| Donation alerts | PayPal, Stripe, Ko-fi, BMC, Streamlabs | | |
| OBS scene automation | Yes | Yes | Yes |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 LTS |
| Server framework | Express.js |
| Server language | TypeScript |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Build system | esbuild (server), Vite (frontend dev) |
| Native plugin wrapper | CMake + obs-browser |
| OBS automation | obs-websocket-js |
| Installer | Inno Setup (Windows), pkgbuild (macOS) |
| Package manager | npm workspaces |

---

## Project Structure

```
StreamPlugins/
├── server/              # Node.js backend (TypeScript)
│   ├── src/
│   │   ├── routes/      # Express route handlers per plugin
│   │   │   └── webhooks.ts  # Webhook route registration
│   │   ├── services/    # Platform API clients (Twitch, YouTube, Kick)
│   │   ├── events/      # Shared event bus and WebSocket layer
│   │   ├── webhooks/    # Donation webhook handlers
│   │   ├── obswebsocket/ # OBS WebSocket client
│   │   └── index.ts     # Server entry point
│   └── tsconfig.json
├── plugins/             # Frontend source for each plugin
│   ├── metrics/
│   ├── title/
│   ├── alerts/
│   ├── chat/
│   ├── discord/
│   ├── viewer-count/    # Combined viewer count overlay
│   ├── goal-bars/       # Goal bar overlays + settings
│   ├── donation-alerts/ # Donation alert overlay + settings
│   ├── scene-reactions/ # OBS scene automation dock
│   └── shared/
│       └── js/
│           ├── icons.js        # SVG icon library
│           └── theme-loader.js # Theme auto-loader
├── native-plugin/       # CMake project for OBS native integration
│   ├── src/
│   └── CMakeLists.txt
├── tray-app/            # Standalone system tray application
├── docs/                # Additional documentation
├── installer/           # Platform-specific installer scripts
├── .github/             # CI workflows and issue templates
├── package.json
├── LICENSE
└── README.md
```

---

## Configuration

All configuration is managed through the Settings panel (available as a dock or at `http://localhost:3847/settings`). Credentials are stored locally in an encrypted configuration file at:

- **Windows:** `%APPDATA%\StreamPlugins\config.enc`
- **macOS:** `~/Library/Application Support/StreamPlugins/config.enc`
- **Linux:** `~/.config/StreamPlugins/config.enc`

No credentials are transmitted to any third-party server. All API communication happens directly between your machine and the respective platform APIs.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up the development environment
- Code style and linting rules
- Commit message conventions
- Submitting pull requests
- Reporting bugs and requesting features

If you are unsure where to start, check the issues labeled [`good first issue`](https://github.com/Zaeonlabs/ZaeonPlay/issues?q=label%3A%22good+first+issue%22).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

StreamPlugins is made possible by the following projects and APIs:

- [OBS Studio](https://obsproject.com/) and the [obs-browser](https://github.com/obsproject/obs-browser) plugin
- [obs-websocket-js](https://github.com/obs-websocket-community-projects/obs-websocket-js)
- [Twitch API](https://dev.twitch.tv/docs/api/)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Kick Public API](https://kick.com)
- [Express.js](https://expressjs.com/)
- [esbuild](https://esbuild.github.io/)
- [Vite](https://vitejs.dev/)

---

<p align="center">
Built for streamers, by streamers.
</p>
