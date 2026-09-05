# 📖 StreamPlugins — Layman's Step-by-Step How-To Guide

Welcome! This guide is written in plain, simple language to walk you through every single feature, setting, and workflow in **StreamPlugins / ZaeonPlay**. 

Whether you are setting up your stream for the first time, using the desktop dashboard, controlling your chat from your smartphone using a QR code, or organizing your OBS dock windows—this guide covers every case step-by-step.

---

## 📑 Table of Contents

1. [Understanding OBS Plugin Windows & Data Storage](#1-understanding-obs-plugin-windows--data-storage)
2. [Case 1: First-Time Setup & Account Connections](#case-1-first-time-setup--account-connections)
3. [Case 2: Using the Desktop Central Dashboard](#case-2-using-the-desktop-central-dashboard)
4. [Case 3: QR Code & Mobile Smartphone Control](#case-3-qr-code--mobile-smartphone-control)
5. [Case 4: Step-by-Step Guides for Every Feature](#case-4-step-by-step-guides-for-every-feature)
   - [A. Stream Metrics Widget](#a-stream-metrics-widget)
   - [B. Stream Title & Game Updater](#b-stream-title--game-updater)
   - [C. Unified Multi-Platform Chat](#c-unified-multi-platform-chat)
   - [D. Multistream Alerts (Subs, Follows, Raids)](#d-multistream-alerts-subs-follows-raids)
   - [E. Combined Live Viewer Counter](#e-combined-live-viewer-counter)
   - [F. Goal Bars (Subs, Followers, Donations)](#f-goal-bars-subs-followers-donations)
   - [G. Donation Alerts (PayPal, Stripe, Ko-fi)](#g-donation-alerts-paypal-stripe-ko-fi)
   - [H. Discord Event & Chat Logger](#h-discord-event--chat-logger)
   - [I. OBS Scene Automation & Reactions](#i-obs-scene-automation--reactions)
6. [Troubleshooting & Frequently Asked Questions](#troubleshooting--frequently-asked-questions)

---

## 1. Understanding OBS Plugin Windows & Data Storage

### 📌 Fixing the 9-Window Auto-Open Issue (Code Solution)
- **Why it occurred before**: The installer was automatically registering all 9 plugin docks simultaneously into OBS's `user.ini` configuration. Because OBS detected 9 new custom docks without prior window geometry positions, OBS forced **all 9 dock windows to pop open simultaneously** on startup.
- **The Code Fix Implemented**:
  - We updated [`register-obs-docks.ps1`](file:///c:/Codebase/ZAEON/zaeonplay/installer/windows/scripts/register-obs-docks.ps1) to operate in `PrimaryOnly` mode by default.
  - On installation/setup, it registers **ONLY ONE clean control dock**: `StreamPlugins: Settings`.
  - It automatically cleans up old multi-window popup entries from OBS's configuration files (`user.ini` and `global.ini`).
  - **Result**: When you launch OBS, it opens cleanly with **zero unwanted window popups**.

### 📌 Opening Additional Windows On-Demand
- To open any plugin window when you need it:
  1. Open OBS Studio.
  2. Go to top menu: **Docks** > **StreamPlugins: Settings** (or access the Dashboard at `http://localhost:3847/dashboard`).
  3. When OBS exits, any open dock windows close automatically.

### 💾 Data Persistence (Your Keys Are Never Reset)
- When OBS closes or when you hide a dock window:
  - **Your settings, API keys, and login tokens are NOT deleted or reset.**
  - All credentials remain stored locally on your hard drive (`%APPDATA%\StreamPlugins\.env` on Windows).
  - Re-opening OBS or a dock window automatically loads your saved keys so you never have to re-enter them!

---

## Case 1: First-Time Setup & Account Connections

### Goal: Connect Twitch, YouTube, or Kick accounts once so all plugins work automatically.

1. **Launch StreamPlugins / Start OBS Studio**.
2. **Open Settings**:
   - In OBS, click **Docks** > **StreamPlugins: Settings** (or open `http://localhost:3847/plugins/settings/` in your browser).
3. **Connect YouTube**:
   - Enter your **YouTube Client ID** and **Client Secret** (see the [YouTube Auth Setup Guide](YOUTUBE-AUTH-SETUP.md) for how to get these from Google Cloud Console).
   - Click **Connect YouTube**.
   - A Google sign-in window will open. Choose your Google account and click **Allow**.
   - You will see a success message: `YouTube Connected`.
4. **Connect Twitch & Kick**:
   - Click **Connect Twitch** or **Connect Kick** and complete the quick login.
5. **Done!** Your credentials are now stored locally. You can close the Settings dock window.

---

## Case 2: Using the Desktop Central Dashboard

### Goal: Manage all stream tools from one master control page on your computer.

1. **Open the Dashboard**:
   - Open your web browser (Chrome, Edge, Firefox) and go to:
     `http://localhost:3847/dashboard`
2. **What You Can See on the Dashboard**:
   - **Connection Status**: Green indicators showing Twitch, YouTube, and Kick connection health.
   - **Combined Viewers**: Total live viewers across all platforms in real-time.
   - **Quick Actions**: Quick buttons to open chat, update titles, or adjust alert settings.
   - **Plugin Switcher**: Click on any plugin tab on the left sidebar to configure its settings.
3. **Closing the Dashboard**:
   - Simply close the browser tab. The background server keeps running silently in OBS.

---

## Case 3: QR Code & Mobile Smartphone Control

### Goal: Monitor live chat, viewer counts, and stream settings from your phone or tablet without clogging your OBS computer screen.

1. **Generate the QR Code**:
   - Launch the **StreamPlugins Tray App** or open the Launcher window.
   - A window titled **StreamPlugins Launcher** will appear on your screen showing a **QR Code** and a local web address (e.g., `http://192.168.1.50:3000/dashboard`).
2. **Connect Your Phone**:
   - Make sure your smartphone or tablet is connected to the **same Wi-Fi network** as your streaming computer.
   - Open the **Camera app** on your phone (iPhone or Android).
   - Point your camera at the QR Code on your computer screen.
   - Tap the pop-up notification link that appears on your phone screen.
3. **Control From Your Phone**:
   - The Mobile Dashboard will open in your phone browser!
   - You can now read combined live chat, see live viewer numbers, and trigger test alerts right from your phone while streaming.
4. **Close the QR Window on PC**:
   - Once connected on your phone, you can close the QR launcher window on your PC. Your phone will stay connected!

---

## Case 4: Step-by-Step Guides for Every Feature

### A. Stream Metrics Widget
- **What it does**: Displays live subscriber, follower, and viewer counts from Twitch, YouTube, and Kick.
- **How to add to OBS as a visual overlay**:
  1. In OBS, go to the **Sources** box and click **+** (Add Source).
  2. Select **Browser**. Name it `Metrics Overlay`.
  3. Set URL to: `http://localhost:3847/plugins/metrics-widget/`
  4. Set Width: `400`, Height: `200`.
  5. Click **OK**.
- **How to customize**:
  - Open **Docks > StreamPlugins: Metrics**.
  - Toggle platforms ON/OFF.
  - Choose layout (Compact single line vs Expanded cards).

---

### B. Stream Title & Game Updater
- **What it does**: Changes your stream title, description, category/game, and tags across Twitch, YouTube, and Kick all at once.
- **Step-by-Step Usage**:
  1. In OBS, click **Docks > StreamPlugins: Title Updater**.
  2. Type your new stream title into the **Title** box (e.g., `🔴 Chill Gaming & Chatting!`).
  3. Type your game or category in the **Category** box (e.g., `Just Chatting` or `Minecraft`).
  4. Check the boxes for the platforms you want to update (Twitch ✅, YouTube ✅, Kick ✅).
  5. Click **Update All Platforms**.
  6. A green confirmation banner will confirm all 3 platforms were updated instantly!

---

### C. Unified Multi-Platform Chat
- **What it does**: Combines live chat messages from Twitch, YouTube, and Kick into a single unified feed with platform badges.
- **Step-by-Step Usage inside OBS (Dock Window)**:
  1. Go to **Docks > StreamPlugins: Chat**.
  2. The chat dock will dock into your OBS layout. Messages from all platforms appear together automatically.
- **Step-by-Step Usage as a Transparent On-Stream Overlay**:
  1. In OBS, add a **Browser Source**.
  2. Set URL to: `http://localhost:3847/plugins/chat-widget/overlay.html`
  3. Set Width: `400`, Height: `600`.
  4. Position it on your stream scene. Chat messages will fade in nicely over your game!

---

### D. Multistream Alerts (Subs, Follows, Raids)
- **What it does**: Plays animated graphic pop-ups and sound effects when someone follows, subscribes, raids, or sends Super Chats.
- **Step-by-Step Setup**:
  1. In OBS, add a **Browser Source** in your main scene.
  2. Set URL to: `http://localhost:3847/plugins/alerts/`
  3. Set Width: `800`, Height: `600`.
- **How to test alerts**:
  1. Go to **Docks > StreamPlugins: Alerts**.
  2. Click **Test Follower Alert** or **Test Subscriber Alert**.
  3. Watch your OBS preview screen—the test alert animation and sound will play!

---

### E. Combined Live Viewer Counter
- **What it does**: Shows a single total number combining live viewers from Twitch + YouTube + Kick.
- **Step-by-Step Setup**:
  1. Add a **Browser Source** in OBS.
  2. Set URL to: `http://localhost:3847/plugins/combined-viewer-count/`
  3. Set Width: `250`, Height: `100`.
  4. The counter updates automatically every 10 seconds.

---

### F. Goal Bars (Subs, Followers, Donations)
- **What it does**: Renders an animated progress bar for your stream goals (e.g., `Subscriber Goal: 45 / 100`).
- **Step-by-Step Setup**:
  1. Go to **Docks > StreamPlugins: Goal Bars** (or open settings).
  2. Choose **Goal Type**: `Subscribers`, `Followers`, or `Donations`.
  3. Set your **Target Number** (e.g., `100`).
  4. In OBS, add a **Browser Source** pointing to `http://localhost:3847/plugins/goal-bars/`.
  5. As new subs or followers come in, the bar fills up automatically!

---

### G. Donation Alerts (PayPal, Stripe, Ko-fi)
- **What it does**: Triggers alert pop-ups when viewers send tip payments.
- **Step-by-Step Setup**:
  1. Open **Docks > StreamPlugins: Donation Alerts**.
  2. Copy the Webhook URL provided on screen.
  3. Paste the Webhook URL into your Ko-fi, PayPal, or Streamlabs webhook settings page.
  4. Add a **Browser Source** pointing to `http://localhost:3847/plugins/donation-alerts/` in OBS.

---

### H. Discord Event & Chat Logger
- **What it does**: Automatically posts your stream alerts and chat logs into your Discord server channels.
- **Step-by-Step Setup**:
  1. Open your Discord server settings > **Integrations** > **Webhooks** > **New Webhook**.
  2. Copy the Discord Webhook URL.
  3. In OBS, open **Docks > StreamPlugins: Discord**.
  4. Paste the Webhook URL.
  5. Select which events to forward (e.g., `New Subscribers ✅`, `Raids ✅`, `Chat Messages ❌`).
  6. Click **Save Settings**.

---

### I. OBS Scene Automation & Reactions
- **What it does**: Automatically switches OBS scenes or toggles sources when events happen (e.g., *Switch to BRB scene when raided*).
- **Step-by-Step Setup**:
  1. Open **Docks > StreamPlugins: Scene Reactions**.
  2. Click **+ Add Rule**.
  3. Select Trigger: `On Raid Received`.
  4. Select Action: `Switch OBS Scene` -> `Celebration / Raid Scene`.
  5. Set Duration: `30 Seconds` (auto-switch back).
  6. Click **Save Rule**.

---

## 5. OBS Dock Window Management & Closing OBS

### Quick Reference Summary:
- **Do dock windows close when OBS closes?**  
  **Yes.** All OBS dock windows close when OBS shuts down.
- **Do my API keys get deleted when OBS closes?**  
  **No!** Keys and tokens are stored in permanent local configuration files.
- **How do I prevent windows from opening on startup?**  
  Simply close the dock panel inside OBS once. OBS will remember your preference on the next launch.
- **How do I open a hidden window?**  
  Click **Docks > StreamPlugins: [Name]** in the top OBS menu bar.
