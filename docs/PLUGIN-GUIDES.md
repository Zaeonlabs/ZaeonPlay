# Plugin Guides

This document provides detailed user documentation for each of the nine StreamPlugins. Each section covers what the plugin does, how to configure it, and how to integrate it with OBS Studio.

---

## Table of Contents

1. [Stream Metrics Widget](#1-stream-metrics-widget)
2. [Stream Title Updater](#2-stream-title-updater)
3. [Multistream Alerts](#3-multistream-alerts)
4. [Unified Chat Widget](#4-unified-chat-widget)
5. [Discord Logger](#5-discord-logger)
6. [Combined Viewer Count](#6-combined-viewer-count)
7. [Goal Bars](#7-goal-bars)
8. [Donation Alerts](#8-donation-alerts)
9. [OBS Scene Reactions](#9-obs-scene-reactions)

---

## 1. Stream Metrics Widget

Display your subscriber, follower, and viewer counts from Twitch, YouTube, and Kick with one clean, customizable widget.

### What It Shows

| Platform | Metrics Available |
|----------|------------------|
| Twitch | Follower count, Subscriber count, Live viewer count |
| YouTube | Subscriber count, Member count, Live viewer count |
| Kick | Follower count, Subscriber count, Live viewer count |

### OBS Setup

**As an overlay (Browser Source)**:
1. In your OBS scene, click the **+** button under Sources
2. Select **Browser**
3. Set the URL to `http://localhost:3847/plugins/metrics-widget/`
4. Set Width to `400` and Height to `200` (adjust as needed)
5. Check "Refresh browser when scene becomes active" for up-to-date counts

**As a dock (for monitoring)**:
1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/metrics-widget/settings.html`

If using the native OBS plugin, the metrics dock appears automatically under **Docks > StreamPlugins: Metrics**.

### Configuration

Open the metrics settings dock to configure:

- **Platform toggles**: Enable or disable Twitch, YouTube, and Kick individually
- **Metric toggles**: Choose which metrics to display per platform (followers, subscribers, viewers)
- **Display style**: Choose between compact (single line) or expanded (card per platform)
- **Update interval**: How often to poll for new data (default: 30 seconds for counts, 10 seconds for live viewers)
- **Theme**: Light, dark, or transparent (for overlays)

### Notes

- Subscriber and follower counts require OAuth authentication for the respective platform
- Live viewer counts are only available while streaming
- Kick follower counts use an unofficial API endpoint and may occasionally be unavailable
- YouTube API has a daily quota limit (10,000 units). Each poll costs 1-2 units. At default intervals, a 10-hour stream uses approximately 2,400 units

---

## 2. Stream Title Updater

Update your stream title, category, tags, description, and privacy status across Twitch, YouTube, and Kick from one OBS dock.

### Supported Fields

| Field | Twitch | YouTube | Kick |
|-------|--------|---------|------|
| Title | 140 characters | 100 characters | No limit documented |
| Description | -- | 5,000 characters | -- |
| Category | Game/category search | Video category dropdown | Category search |
| Tags | Max 10, 25 chars each | Free-form tags | Max 10 custom tags |
| Privacy Status | -- | Public / Unlisted / Private | -- |
| Language | ISO 639-1 code | -- | -- |

### OBS Setup

This plugin works as a **Browser Dock** (control panel inside OBS):

1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/title-updater/`
3. Position the dock wherever convenient in your OBS layout

If using the native OBS plugin, the dock appears automatically under **Docks > StreamPlugins: Title Updater**.

### Usage

1. The dock shows your current stream info for each connected platform
2. Edit the fields you want to change
3. Select which platforms to update (checkboxes at the top)
4. Click **Update All** to push changes to all selected platforms simultaneously
5. Or click the platform-specific update button to update just one platform

### Per-Platform Edit Modals

Click the **edit icon** next to any platform to open a detailed editor for that platform. This shows all available fields specific to that platform, including:

- **Twitch**: Title, Category (with search autocomplete), Tags, Language
- **YouTube**: Title, Description (multi-line), Category (dropdown), Tags, Privacy Status
- **Kick**: Title, Category (with search autocomplete), Custom Tags

### Category Search

The category field provides autocomplete search:
- Start typing a game or category name
- Select from the dropdown results
- The correct category ID is sent to the platform API

### Notes

- You must be authenticated with each platform to update its stream info
- YouTube title and description can be updated even while live
- Twitch tags cannot contain special characters or spaces
- Changes take effect immediately on the respective platform

---

## 3. Multistream Alerts

Animated overlay displaying real-time alerts from Twitch, YouTube, and Kick. Shows new subscribers, followers, raids, bits/Super Chats, and gift subs with platform-branded styling.

### Supported Alert Types

| Alert Type | Twitch | YouTube | Kick |
|------------|--------|---------|------|
| New subscriber/member | Yes | Yes | Yes |
| Gift subs/memberships | Yes | Yes | Yes |
| Resub with message | Yes | -- | -- |
| New follower | Yes | -- | Yes |
| Raid | Yes | -- | -- |
| Bits/Super Chat | Yes | Yes | -- |

### OBS Setup

This plugin works as a **Browser Source** (full-screen overlay):

1. In your OBS scene, click **+** under Sources
2. Select **Browser**
3. Set the URL to `http://localhost:3847/plugins/alerts/`
4. Set Width to `1920` and Height to `1080` (match your canvas resolution)
5. The background is transparent -- alerts appear over your content
6. Position this source above your game/camera sources

**Settings dock** (optional):
- URL: `http://localhost:3847/plugins/alerts/settings.html`
- Or via native plugin: **Docks > StreamPlugins: Alert Settings**

### Configuration

Open the alerts settings dock to configure:

- **Alert types**: Enable or disable specific alert types per platform
- **Display duration**: How long each alert stays on screen (default: 5 seconds)
- **Alert position**: Top, center, or bottom of the overlay
- **Animation style**: Slide in, fade in, or pop in
- **Alert queue**: Alerts queue up and display one at a time
- **Sound**: Enable or disable alert sounds (requires OBS audio monitoring enabled on the browser source)
- **Theme**: Choose from preset themes or customize colors

### Alert Card Design

Each alert card shows:
- **User avatar** (if available from the platform)
- **Username** with platform-specific color coding
- **Event description** (e.g., "subscribed with Tier 3", "sent a Super Chat ($10.00)")
- **Platform icon** (Twitch, YouTube, or Kick logo)
- **Platform-specific color gradient** on the card background

### Notes

- Twitch alerts use EventSub WebSocket for instant delivery
- Kick alerts use Pusher WebSocket for instant delivery
- YouTube alerts rely on Live Chat API polling (5-10 second delay)
- Alert sounds play through the browser source audio -- enable "Monitor and Output" or "Monitor Only" on the source's audio settings if you want to hear them

---

## 4. Unified Chat Widget

Combine live chat from Twitch, YouTube, and Kick into a single window with platform icons, user badges, timestamps, and color-coded messages.

### OBS Setup

**As an overlay (Browser Source)**:
1. In your OBS scene, click **+** under Sources
2. Select **Browser**
3. Set the URL to `http://localhost:3847/plugins/chat-widget/`
4. Set Width to `400` and Height to `600` (adjust to fit your layout)
5. The background can be transparent or styled

**As a monitoring dock**:
1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/chat-widget/`
3. Or via native plugin: **Docks > StreamPlugins: Chat**

### Features

- **Platform icons**: Each message shows a small Twitch, YouTube, or Kick icon
- **Timestamps**: Messages show the time they were sent
- **User badges**: Subscriber, moderator, and VIP badges displayed next to usernames
- **Color-coded usernames**: Each user gets a consistent color (uses platform-native colors when available)
- **Emote rendering**: Platform-native emotes rendered inline
- **Auto-scroll**: Chat auto-scrolls to the latest message, pauses when you scroll up
- **Platform filtering**: Toggle which platforms to show in the chat

### Configuration

Via the settings panel accessible from the chat widget:

- **Platforms**: Toggle Twitch, YouTube, and Kick on/off
- **Font size**: Small, medium, or large
- **Show timestamps**: On or off
- **Show badges**: On or off
- **Show platform icons**: On or off
- **Background**: Transparent, dark, or custom color
- **Max messages**: Number of messages to keep in the chat history (default: 200, older messages are removed)
- **Message animation**: Slide in or instant

### Chat Sources

| Platform | Connection Type | Latency | Auth Required |
|----------|----------------|---------|---------------|
| Twitch | IRC WebSocket | Instant | No (anonymous read) |
| YouTube | HTTP Polling | 5-10 seconds | Yes (youtube.readonly) |
| Kick | Pusher WebSocket | Instant | No (public channel) |

### Notes

- Twitch and Kick chat are real-time (WebSocket). YouTube chat has a slight delay due to polling
- Anonymous Twitch IRC connections can read chat without authentication
- The chat widget does not support sending messages -- it is read-only
- Emote rendering depends on platform CDN availability
- Very active chats (thousands of messages per minute) will automatically throttle rendering to maintain performance

---

## 5. Discord Logger

Forward your entire Twitch, YouTube, and Kick chat to Discord. Optionally log stream events like new subscribers, raids, and follows.

### OBS Setup

This plugin runs as a background service with a settings dock:

1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/discord-logger/settings.html`
3. Or via native plugin: **Docks > StreamPlugins: Discord Logger**

No browser source is needed -- the Discord Logger runs entirely in the backend.

### Discord Webhook Setup

1. In Discord, right-click the channel where you want chat logs
2. Go to **Edit Channel > Integrations > Webhooks > New Webhook**
3. Name the webhook (e.g., "StreamPlugins Chat Log")
4. Copy the webhook URL
5. Paste the webhook URL into the Discord Logger settings dock

You can configure separate webhooks for:
- **Chat messages** -- All chat from Twitch/YouTube/Kick
- **Stream events** -- Subs, follows, raids, bits, Super Chats, gift subs

### Configuration

- **Chat webhook URL**: Discord webhook for forwarding chat messages
- **Events webhook URL**: Discord webhook for forwarding stream events (can be the same or different channel)
- **Platforms**: Toggle which platforms to forward (Twitch, YouTube, Kick)
- **Event types**: Toggle which events to log (subs, follows, raids, bits, etc.)
- **Batch interval**: How often to send batched chat messages (default: 3 seconds). Shorter intervals use more of Discord's rate limit
- **Include avatars**: Whether to fetch and include user avatars in Discord messages

### Discord Message Format

**Chat messages** are batched and sent as embeds:
- Each embed groups messages from a short time window
- Messages show: platform icon, username (with platform color), message content, timestamp
- Platform-specific embed colors: Twitch (purple #9146FF), YouTube (red #FF0000), Kick (green #53FC18)

**Events** are sent as individual embeds with:
- Event type (e.g., "New Subscriber", "Raid", "Super Chat")
- User info (name, avatar if available)
- Event details (tier, amount, viewer count, message)
- Platform icon and branding color
- Timestamp

### Rate Limits

Discord webhooks allow 30 requests per 60 seconds. The Discord Logger respects this by:
- Batching chat messages (combining multiple messages into one webhook call)
- Queuing event alerts and sending them sequentially
- Automatically backing off if a 429 (rate limit) response is received

### Notes

- The Discord Logger operates independently of OBS scenes -- it runs as long as the server is active
- Webhook URLs are stored encrypted and never exposed to browser-side code
- If the Discord webhook is deleted or invalid, the logger will show an error in the settings dock
- Very high-traffic chats may result in some messages being grouped into larger batches to stay within rate limits

---

## 6. Combined Viewer Count

A compact overlay widget showing the total combined viewer count across all connected platforms.

### What It Shows

- A large animated total viewer count (sum of all platforms)
- A breakdown row showing per-platform counts with Twitch, YouTube, and Kick icons

### OBS Setup

**As an overlay (Browser Source)**:
1. In your OBS scene, click **+** under Sources
2. Select **Browser**
3. Set the URL to `http://localhost:3847/plugins/viewer-count/`
4. Set Width to `400` and Height to `150` (adjust as needed)
5. The background is transparent — position it in a corner of your stream

### Configuration

The viewer count widget uses the same metrics data as Plugin 1. It polls every 10 seconds and displays count-up animations when values change.

No additional configuration needed — it automatically shows all connected platforms.

### Notes

- Only shows platforms that are authenticated and currently live
- The count-up animation makes value changes visually smooth
- Works at any browser source size — the layout is responsive

---

## 7. Goal Bars

Animated progress bar overlays for tracking subscriber, follower, and donation goals during your stream.

### OBS Setup

**Overlay (Browser Source)**:
1. Add a Browser Source with URL `http://localhost:3847/plugins/goal-bars/`
2. Set Width to `500` and Height to `300` (adjust based on number of goals)
3. Transparent background

**Settings dock**:
1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/goal-bars/settings.html`
3. Or via native plugin: **Docks > StreamPlugins: Goal Bars Settings**

### Configuration

Open the Goal Bars settings dock to configure your goals:

1. Click **+ Add Goal** to create a new goal
2. Configure each goal:
   - **Type**: Subscribers, Followers, or Donations ($)
   - **Label**: Display name (e.g., "Road to 500 Subs")
   - **Target**: The goal number to reach
   - **Current**: Starting value (auto-updates from live data)
3. Click **Save Goals** to apply

### Goal Types

| Type | Data Source | Update Method |
|------|-----------|---------------|
| Subscribers | Platform metrics API | Polled every 15 seconds |
| Followers | Platform metrics API | Polled every 15 seconds |
| Donations | Webhook events | Real-time via WebSocket |

### Notes

- Subscriber and follower goals aggregate across all connected platforms
- Donation goals update in real-time as donations come in via webhooks
- Progress bars feature animated gradient fills with glow effects
- Goals persist across sessions via the server config

---

## 8. Donation Alerts

Alert overlay for payments received via PayPal, Stripe, Ko-fi, Buy Me a Coffee, and Streamlabs.

### OBS Setup

**Overlay (Browser Source)**:
1. Add a Browser Source with URL `http://localhost:3847/plugins/donation-alerts/`
2. Set Width to `1920` and Height to `1080` (match your canvas)
3. Transparent background — alerts appear centered at the top

**Settings dock**:
1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/donation-alerts/settings.html`
3. Or via native plugin: **Docks > StreamPlugins: Donation Alerts Settings**

### Prerequisites

Since payment platforms send webhooks to a URL, you need a **public tunnel** to reach your local server:

1. Install [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
2. Start the tunnel: `ngrok http 3847`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
4. Paste it into the **Public Tunnel URL** field in the Donation Alerts settings dock

### Setting Up Payment Platforms

Configure each payment platform's webhook to point to your tunnel:

| Platform | Webhook URL | Where to Configure |
|----------|------------|-------------------|
| PayPal | `{tunnel}/webhooks/paypal` | PayPal Developer Dashboard > Webhooks |
| Stripe | `{tunnel}/webhooks/stripe` | Stripe Dashboard > Developers > Webhooks |
| Ko-fi | `{tunnel}/webhooks/kofi` | Ko-fi Settings > API |
| Buy Me a Coffee | `{tunnel}/webhooks/buymeacoffee` | BMC Dashboard > Integrations |
| Streamlabs | `{tunnel}/webhooks/streamlabs` | Streamlabs API Settings |

Then enter the corresponding API keys/secrets in the settings dock.

### Configuration

- **Public Tunnel URL**: Your ngrok or Cloudflare Tunnel URL
- **PayPal Webhook ID**: From your PayPal developer webhook configuration
- **Stripe Webhook Secret**: The `whsec_...` secret from Stripe
- **Ko-fi Verification Token**: From Ko-fi API settings
- **Buy Me a Coffee Webhook Secret**: From BMC integrations
- **Streamlabs Socket API Token**: From Streamlabs API settings
- **Enabled Sources**: Toggle each payment platform on/off

### Alert Card Design

Each donation alert shows:
- **Amount** prominently displayed in a circular badge
- **Payment platform** label (PayPal, Stripe, etc.)
- **Donor name**
- **Optional message** from the donor
- **Platform-specific color scheme** on the card background

Alerts display for 6 seconds with slide-in/fade-out animations.

### Notes

- The tunnel must be running for webhooks to arrive
- Free ngrok plans may have session limits — consider a paid plan or Cloudflare Tunnel for production use
- Each platform has different webhook configuration steps — check their documentation
- Webhook secrets should be kept private and are stored encrypted on your machine

---

## 9. OBS Scene Reactions

Automate OBS scene and source changes in response to stream events. For example, switch to a "BRB" scene when you receive a raid, or show a celebration animation when someone subscribes.

### OBS Setup

This plugin works as a **Browser Dock** (control panel):

1. Go to **Docks > Custom Browser Docks**
2. Add a dock with URL `http://localhost:3847/plugins/scene-reactions/`
3. Or via native plugin: **Docks > StreamPlugins: Scene Reactions**

### Prerequisites

1. Enable OBS WebSocket Server: go to **Tools > obs-websocket Settings**
2. Check **Enable WebSocket server**
3. Set a port (default: 4455) and optionally set a password
4. Click **OK**

### Connecting to OBS

In the Scene Reactions dock:
1. Enter the host (default: `localhost`), port (default: `4455`), and password (if set)
2. Click **Connect**
3. A green dot appears when connected, and your scenes/sources are loaded

### Creating Rules

1. Click **+ Add Rule**
2. Configure the rule:
   - **Trigger**: The event type that activates the rule (Raid, Subscription, Follow, Bits, Donation, Gift Sub, Super Chat)
   - **Min Amount**: Minimum amount threshold (for donations/bits — set 0 to trigger on any)
   - **Action**: What happens in OBS:
     - Switch Scene — changes the active scene
     - Show Source — makes a source visible
     - Hide Source — makes a source hidden
     - Play Media Source — restarts a media source
   - **Scene / Source**: The target scene or source from OBS
   - **Duration (seconds)**: How long the action lasts before reverting
   - **Revert-to Scene**: Which scene to switch back to after the duration (for scene switches)
3. Toggle the rule on/off with the switch
4. Click **Test** to preview the rule without waiting for a real event
5. Click **Save Rules** when done

### Example Rules

| Trigger | Action | Target | Duration | Revert |
|---------|--------|--------|----------|--------|
| Raid | Switch Scene | BRB | 30s | Main |
| Subscription | Show Source | Celebration | 5s | — |
| Follow | Show Source | Flash Border | 3s | — |
| Donation (>$10) | Play Media Source | Alert Sound | — | — |

### Notes

- OBS must be running with WebSocket Server enabled for this plugin to work
- Scenes and sources are auto-discovered from OBS — no manual entry needed
- Rules are evaluated in order; if multiple rules match the same event, all enabled matches execute
- The Test button executes the rule immediately, regardless of the trigger condition
- Scene switches with a revert-to scene will automatically switch back after the specified duration

---

## General Notes

### Authentication

All plugins share the same authentication. Connect your accounts once through the StreamPlugins Settings dock:

1. Open the Settings dock (native: **Docks > StreamPlugins: Settings**, or `http://localhost:3847/plugins/settings/`)
2. Click **Connect** next to each platform
3. Authorize StreamPlugins in the browser window that opens
4. Once connected, a green indicator shows next to the platform name

### Themes

All plugins support theming via CSS custom properties. The shared theme file (`plugins/shared/css/themes.css`) defines:

- `--sp-bg-primary`: Primary background color
- `--sp-bg-secondary`: Secondary background color
- `--sp-text-primary`: Primary text color
- `--sp-text-secondary`: Secondary text color
- `--sp-accent`: Accent color
- `--sp-twitch`: Twitch brand color (#9146FF)
- `--sp-youtube`: YouTube brand color (#FF0000)
- `--sp-kick`: Kick brand color (#53FC18)

Built-in themes: **Dark** (default), **Light**, **Transparent** (for overlays), **AMOLED** (pure black), **Midnight Blue** (deep navy), **Cyberpunk** (neon pink/cyan), and **Forest** (muted green earth tones). Select your theme from the **Settings dock** — it applies to all open docks and overlays in real time.

Every plugin automatically loads the theme via `theme-loader.js`. The theme is stored locally and synchronized across all open instances via WebSocket events.

### Browser Source Tips

- Set "Shutdown source when not visible" to prevent unnecessary API calls when the source is hidden
- Enable "Refresh browser when scene becomes active" for up-to-date data
- For overlays (alerts, chat), use a transparent background and position the source above your content
- OBS Browser Sources support modern CSS (Grid, Flexbox, animations, custom properties)
