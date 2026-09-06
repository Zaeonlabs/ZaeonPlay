# YouTube OAuth 2.0 Setup Guide

This guide provides step-by-step instructions for configuring Google OAuth 2.0 authentication and enabling the YouTube Data API v3 for **ZaeonPlay / StreamPlugins**.

---

## 📋 Prerequisites

- A **Google Account** (Personal or Google Workspace).
- Access to the [Google Cloud Console](https://console.cloud.google.com/).
- A local installation or dev environment of ZaeonPlay running (default port: `3847`).

---

## 🛠️ Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top navigation bar, click the **Project Selector** dropdown (next to the Google Cloud logo).
3. In the modal, click **New Project** in the upper-right corner.
4. Enter your project details:
   - **Project Name**: `ZaeonPlay` (or your preferred name)
   - **Organization / Location**: Leave as default (or select your organization if using Google Workspace)
5. Click **Create** and wait a few seconds for project provisioning to finish.
6. Make sure your newly created project is selected in the top navigation bar.

---

### Step 2: Enable the YouTube Data API v3

1. Open the left sidebar menu (`☰`) and navigate to **APIs & Services** > **Library**.
2. In the search bar, type `YouTube Data API v3`.
3. Click on **YouTube Data API v3** from the search results.
4. Click the blue **Enable** button.

---

### Step 3: Configure the OAuth Consent Screen

> [!NOTE]
> Google requires an OAuth consent screen configuration before you can generate Client IDs and Secrets.

1. In the left navigation menu, go to **APIs & Services** > **OAuth consent screen**.
2. Select the **User Type**:
   - **External**: Select this if you do not have a Google Workspace enterprise organization or if you plan to let external users sign in.
   - Click **Create**.
3. **App Information**:
   - **App name**: `ZaeonPlay` (or `StreamPlugins`)
   - **User support email**: Select your email address from the dropdown.
   - **App logo** *(Optional)*: Upload a logo if desired.
   - **Developer contact information**: Enter your email address.
   - Click **Save and Continue**.
4. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Filter/search for `YouTube Data API v3`.
   - Below is the list of all **7 YouTube Data API v3 Scopes** available in the Google Cloud Console:

     | Scope URI | Access Level | Description | Required by ZaeonPlay? |
     | :--- | :--- | :--- | :---: |
     | `.../auth/youtube.readonly` | Read-only | View YouTube account data, channel stats, subscriber count, and live broadcasts. | **YES** ✅ |
     | `.../auth/youtube.force-ssl` | Read / Write | Securely read/send live chat messages, update stream titles, and manage comments. | **YES** ✅ |
     | `.../auth/youtube.channel-memberships.creator` | Read-only | Fetch channel membership lists, member tiers, and sub/member alert events. | **YES** ✅ |
     | `.../auth/youtube` | Full Access | Complete read, write, and delete access to all YouTube account features and videos. | Optional |
     | `.../auth/youtube.upload` | Write-only | Upload videos and manage video upload metadata. | Optional |
     | `.../auth/youtubepartner` | Partner | View and manage YouTube Content Partner assets, claims, and monetization. | Optional |
     | `.../auth/youtube.thirdparty_audit.readonly` | Audit | View third-party account audit details and YouTube analytics reports. | Optional |

   - Select at least the **3 required scopes** marked above (`youtube.readonly`, `youtube.force-ssl`, and `youtube.channel-memberships.creator`).
   - Click **Update**, then click **Save and Continue**.
5. **Test Users** *(Critical Step for External Apps in Testing Mode)*:
   - Click **+ Add Users**.
   - Enter your own Google email address (and any other Google accounts you will use for testing).
   - Click **Add**, then **Save and Continue**.
6. Review the summary and click **Back to Dashboard**.

---

### Step 4: Create OAuth 2.0 Credentials

1. In the left navigation menu, go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top bar and choose **OAuth client ID**.
3. Configure the credential settings:
   - **Application type**: Select **Web application**.
   - **Name**: `ZaeonPlay Web Client`
4. **Authorized redirect URIs**:
   - Click **+ Add URI**.
   - Add the local callback endpoint:
     ```text
     http://localhost:3847/auth/youtube/callback
     ```
   - *(Optional)* If testing over HTTPS or a remote server, add your custom domain callback (e.g., `https://your-domain.com/auth/youtube/callback`).
5. Click **Create**.

---

### Step 5: Configure Environment Variables

After creation, an **OAuth client created** dialog will display your **Client ID** and **Client Secret**.

1. Copy the **Client ID** and **Client Secret**.
2. Open or create your `.env` file in the root directory (or system configuration directory):
   - **Windows**: `%APPDATA%\StreamPlugins\.env`
   - **macOS**: `~/Library/Application Support/StreamPlugins/.env`
   - **Linux**: `~/.config/StreamPlugins/.env`
   - **Local Dev Root**: `.env`

3. Populate the variables:

```env
# YouTube (Google OAuth)
YOUTUBE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret_here
```

---

## 🔍 Troubleshooting & Common Errors

### ❌ `403 Access Blocked: App has not completed the Google verification process`
- **Cause**: The Google account trying to log in is not listed under **Test Users** while the consent screen is in "Testing" mode.
- **Solution**: Go to **APIs & Services** > **OAuth consent screen** > **Test Users**, click **+ Add Users**, and add the email address.

### ❌ Google Prompting for "Verify Branding" / App Review
- **Cause**: Google requires brand verification if you upload an **App Logo**, add unverified website domains (Privacy Policy / Terms URLs), or click "Publish App".
- **Bypass Solution (Get keys instantly in Testing mode)**:
  1. Go to **APIs & Services** > **OAuth consent screen**.
  2. Ensure **Publishing status** is set to **Testing** (do **NOT** click "Publish App").
  3. Edit your consent screen and **remove/leave empty**:
     - ❌ **App logo**: Leave empty (uploading a logo forces brand verification).
     - ❌ **Application home page**: Leave empty.
     - ❌ **Application privacy policy / terms links**: Leave empty for testing.
     - ❌ **Authorized domains**: Leave empty.
  4. Save the consent screen. 
  5. Go to **APIs & Services** > **Credentials** > **+ Create Credentials** > **OAuth client ID**.
  6. Select **Web application** or **Desktop app**. Google will immediately output your **Client ID** and **Client Secret** without any verification required!

---

## 🔐 Security Best Practices

- **Never Commit Secrets**: Never commit `.env` or hardcode your `YOUTUBE_CLIENT_SECRET` in public repositories.
- **Restrict Scopes**: Only request the minimal OAuth scopes required for your application feature set.
- **Publishing App**: Before releasing your app publicly, submit your OAuth consent screen for verification via the Google Cloud Console.
