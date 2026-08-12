# StreamPlugins API Reference

This document is the definitive reference for every external API endpoint and internal route used by the StreamPlugins suite. It covers authentication flows, request/response schemas, rate limits, and platform-specific quirks that contributors must be aware of.

**Plugins overview:**

| Plugin | Name | Purpose |
|--------|------|---------|
| Plugin 1 | Metrics | Follower, subscriber, and viewer count overlays |
| Plugin 2 | Stream Manager | Update stream title, category, and tags across platforms |
| Plugin 3 | Alerts | On-screen alerts for follows, subs, raids, cheers, gifts |
| Plugin 4 | Chat | Unified chat overlay aggregating all platforms |
| Plugin 5 | Discord Relay | Forward events and chat to Discord via webhooks |
| Plugin 6 | Viewer Count | Combined viewer count overlay across platforms |
| Plugin 7 | Goal Bars | Animated progress bars for sub/follower/donation goals |
| Plugin 8 | Donation Alerts | Payment alert overlay (PayPal, Stripe, Ko-fi, BMC, Streamlabs) |
| Plugin 9 | Scene Reactions | OBS scene/source automation via obs-websocket |

---

## Table of Contents

1. [Twitch API (Helix)](#1-twitch-api-helix)
2. [YouTube API (Data API v3 + Live Streaming API)](#2-youtube-api-data-api-v3--live-streaming-api)
3. [Kick API (Public API v1)](#3-kick-api-public-api-v1)
4. [Discord API (Webhooks)](#4-discord-api-webhooks)
5. [Internal API (Local Server)](#5-internal-api-local-server)
6. [Donation Webhook APIs](#6-donation-webhook-apis)
7. [OBS WebSocket API](#7-obs-websocket-api)

---

## 1. Twitch API (Helix)

**Base URL:** `https://api.twitch.tv/helix`

### 1.1 Authentication

Twitch uses **OAuth 2.0 Authorization Code** flow.

| Property | Value |
|----------|-------|
| Auth URL | `https://id.twitch.tv/oauth2/authorize` |
| Token URL | `https://id.twitch.tv/oauth2/token` |
| Token Lifetime | ~4 hours (must refresh before expiry) |
| Validation | `GET https://id.twitch.tv/oauth2/validate` |

**Combined required scopes:**

```
moderator:read:followers channel:read:subscriptions channel:manage:broadcast bits:read user:read:chat
```

**Token refresh:** Send a `POST` to the token URL with `grant_type=refresh_token`, `refresh_token`, `client_id`, and `client_secret`. Tokens should be refreshed proactively before the 4-hour window expires.

**Token validation request:**

```
GET https://id.twitch.tv/oauth2/validate
Authorization: OAuth {access_token}
```

The response includes `expires_in` (seconds), `login`, `user_id`, and `scopes`. A `401` response means the token is invalid or expired.

### 1.2 Common Headers

All Helix endpoints require these headers:

```
Authorization: Bearer {access_token}
Client-Id: {client_id}
```

### 1.3 Rate Limits

Twitch Helix enforces **800 requests per minute** for authenticated requests. Rate limit state is returned in response headers:

| Header | Description |
|--------|-------------|
| `Ratelimit-Limit` | Max points in the window |
| `Ratelimit-Remaining` | Points remaining |
| `Ratelimit-Reset` | Unix timestamp when the window resets |

If `Ratelimit-Remaining` drops below 50, back off until the reset time.

### 1.4 REST Endpoints

#### GET /channels/followers

Returns the follower count for a channel.

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/channels/followers` |
| Method | `GET` |
| Scope | `moderator:read:followers` |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `broadcaster_id` | Yes | The broadcaster's user ID |
| `first` | No | Max results per page (1-100, default 20) |
| `after` | No | Cursor for pagination |

**Response (key fields):**

```json
{
  "total": 1234,
  "data": [
    {
      "user_id": "11111",
      "user_name": "viewer_name",
      "followed_at": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "cursor": "eyJiI..."
  }
}
```

Only the `total` field is used by Plugin 1. Full pagination is not needed for the count.

---

#### GET /subscriptions

Returns subscriber count and sub points for a channel.

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/subscriptions` |
| Method | `GET` |
| Scope | `channel:read:subscriptions` |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `broadcaster_id` | Yes | The broadcaster's user ID |
| `first` | No | Max results per page (1-100, default 20) |
| `after` | No | Cursor for pagination |

**Response (key fields):**

```json
{
  "total": 58,
  "points": 72,
  "data": [
    {
      "broadcaster_id": "12345",
      "user_id": "67890",
      "user_name": "sub_viewer",
      "tier": "2000",
      "is_gift": false
    }
  ]
}
```

`total` is the subscriber count. `points` is the sub-point total (Tier 1 = 1, Tier 2 = 2, Tier 3 = 6). Both are used by Plugin 1.

---

#### GET /streams

Returns live stream information including viewer count.

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/streams` |
| Method | `GET` |
| Scope | None (public) |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `user_id` | Yes* | The broadcaster's user ID |
| `user_login` | Yes* | The broadcaster's login name |

*At least one of `user_id` or `user_login` is required.

**Response (key fields):**

```json
{
  "data": [
    {
      "id": "stream_id",
      "user_id": "12345",
      "user_name": "streamer",
      "game_name": "Just Chatting",
      "viewer_count": 1523,
      "started_at": "2024-01-15T18:00:00Z",
      "is_mature": false
    }
  ]
}
```

An empty `data` array means the user is offline. `viewer_count` is the field used by Plugin 1.

---

#### PATCH /channels

Updates channel stream information (title, category, tags, language).

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/channels` |
| Method | `PATCH` |
| Scope | `channel:manage:broadcast` |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `broadcaster_id` | Yes | The broadcaster's user ID |

**Request Body (JSON):**

All body fields are optional. Only include the fields you want to change.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Stream title (max 140 characters) |
| `game_id` | string | Category/game ID (use search/categories to resolve) |
| `tags` | string[] | Stream tags (max 10, each max 25 characters) |
| `broadcaster_language` | string | BCP 47 language code (e.g., `"en"`) |

> **IMPORTANT:** Do NOT include `content_classification_labels` with a `null` value in the request body. Sending `null` for this field causes the API to return a `400 Bad Request`. Either omit it entirely or provide a valid array.

**Response:** `204 No Content` on success (no body).

---

#### GET /search/categories

Searches for game/category by name.

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/search/categories` |
| Method | `GET` |
| Scope | None (public) |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | Search string |
| `first` | No | Max results (1-100, default 20) |
| `after` | No | Pagination cursor |

**Response (key fields):**

```json
{
  "data": [
    {
      "id": "509658",
      "name": "Just Chatting",
      "box_art_url": "https://static-cdn.jtvnw.net/ttv-boxart/509658-{width}x{height}.jpg"
    }
  ]
}
```

Use `id` from the result as `game_id` when calling `PATCH /channels`.

---

#### GET /users

Returns user information. Used across all plugins for user ID resolution.

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/users` |
| Method | `GET` |
| Scope | None for public fields |
| Used by | All plugins |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `id` | No | User ID(s), up to 100 |
| `login` | No | Login name(s), up to 100 |

If neither is provided, returns the authenticated user.

**Response (key fields):**

```json
{
  "data": [
    {
      "id": "12345",
      "login": "streamer",
      "display_name": "Streamer",
      "profile_image_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/..."
    }
  ]
}
```

---

#### POST /eventsub/subscriptions

Creates an EventSub subscription (used to register WebSocket event listeners).

| Field | Value |
|-------|-------|
| URL | `https://api.twitch.tv/helix/eventsub/subscriptions` |
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 3 (Alerts), Plugin 4 (Chat) |

**Request Body:**

```json
{
  "type": "channel.subscribe",
  "version": "1",
  "condition": {
    "broadcaster_user_id": "12345"
  },
  "transport": {
    "method": "websocket",
    "session_id": "{session_id_from_welcome}"
  }
}
```

The `session_id` is obtained from the WebSocket welcome message after connecting. See section 1.5.

---

### 1.5 EventSub WebSocket

Real-time event delivery over WebSocket.

**Connection URL:** `wss://eventsub.wss.twitch.tv/ws`

**Lifecycle:**

1. Connect to the WebSocket URL.
2. Receive a `session_welcome` message containing `session.id`.
3. Use `session.id` to register event subscriptions via `POST /eventsub/subscriptions`.
4. Receive `notification` messages for subscribed events.
5. Respond to `session_keepalive` messages (sent every ~10 seconds). If no message is received within the keepalive timeout, reconnect.
6. Handle `session_reconnect` by connecting to the new URL provided before dropping the old connection.

**Event Types Used:**

#### channel.subscribe

Fired when a user subscribes to the channel.

| Field | Value |
|-------|-------|
| Version | `1` |
| Scope | `channel:read:subscriptions` |
| Used by | Plugin 3 (Alerts) |

**Condition:** `broadcaster_user_id`

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_name` | string | Display name of the subscriber |
| `tier` | string | `"1000"` (Tier 1), `"2000"` (Tier 2), `"3000"` (Tier 3) |
| `is_gift` | boolean | Whether this sub was gifted |

---

#### channel.subscription.gift

Fired when a user gifts subscriptions.

| Field | Value |
|-------|-------|
| Version | `1` |
| Scope | `channel:read:subscriptions` |
| Used by | Plugin 3 (Alerts) |

**Condition:** `broadcaster_user_id`

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_name` | string | Display name of the gifter (null if anonymous) |
| `total` | integer | Number of subs gifted in this event |
| `cumulative_total` | integer | Lifetime gift count from this user (null if anonymous) |
| `is_anonymous` | boolean | Whether the gifter is anonymous |
| `tier` | string | `"1000"`, `"2000"`, or `"3000"` |

---

#### channel.subscription.message

Fired when a user sends a resubscription message.

| Field | Value |
|-------|-------|
| Version | `1` |
| Scope | `channel:read:subscriptions` |
| Used by | Plugin 3 (Alerts) |

**Condition:** `broadcaster_user_id`

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_name` | string | Display name of the subscriber |
| `message` | object | Resub message (`text` field contains the message string) |
| `cumulative_months` | integer | Total months subscribed |
| `tier` | string | `"1000"`, `"2000"`, or `"3000"` |

---

#### channel.follow

Fired when a user follows the channel.

| Field | Value |
|-------|-------|
| Version | `2` |
| Scope | `moderator:read:followers` |
| Used by | Plugin 3 (Alerts) |

**Condition:** `broadcaster_user_id`, `moderator_user_id` (must equal broadcaster)

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_name` | string | Display name of the new follower |
| `followed_at` | string | ISO 8601 timestamp |

---

#### channel.raid

Fired when another broadcaster raids this channel.

| Field | Value |
|-------|-------|
| Version | `1` |
| Scope | None |
| Used by | Plugin 3 (Alerts) |

**Condition:** `to_broadcaster_user_id`

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `from_broadcaster_user_name` | string | Display name of the raiding broadcaster |
| `viewers` | integer | Number of viewers in the raid |

---

#### channel.cheer

Fired when a user cheers with bits.

| Field | Value |
|-------|-------|
| Version | `1` |
| Scope | `bits:read` |
| Used by | Plugin 3 (Alerts) |

**Condition:** `broadcaster_user_id`

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_name` | string | Display name of the cheerer (null if anonymous) |
| `bits` | integer | Number of bits cheered |
| `message` | string | Chat message accompanying the cheer |

---

#### channel.chat.message

Fired for every chat message in the channel.

| Field | Value |
|-------|-------|
| Version | `1` |
| Scope | `user:read:chat` |
| Used by | Plugin 4 (Chat) |

**Condition:** `broadcaster_user_id`, `user_id`

**Payload fields:**

| Field | Type | Description |
|-------|------|-------------|
| `chatter_user_name` | string | Display name of the message sender |
| `message` | object | Message content with `text` and `fragments` array |

---

### 1.6 IRC WebSocket (Chat)

Legacy but stable method for reading Twitch chat. Used as a fallback or for anonymous read-only access.

**Connection URL:** `wss://irc-ws.chat.twitch.tv:443`

**Authentication sequence (sent after connection opens):**

```
CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands
PASS oauth:{access_token}
NICK {username}
```

**Anonymous read-only access** is supported by omitting `PASS` and using `NICK justinfan{random_number}` (e.g., `NICK justinfan12345`). No OAuth token is needed.

**Joining a channel:**

```
JOIN #{channel_name}
```

**Incoming message format (PRIVMSG with tags):**

```
@badge-info=subscriber/12;badges=subscriber/12;color=#FF4500;display-name=ViewerName;emotes=;
first-msg=0;id=msg-uuid;mod=0;subscriber=1;turbo=0;user-type=
:viewername!viewername@viewername.tmi.twitch.tv PRIVMSG #channel :Hello, this is a chat message
```

**Key IRC tags:**

| Tag | Description |
|-----|-------------|
| `display-name` | User's display name |
| `badges` | Comma-separated badge list (e.g., `subscriber/12,premium/1`) |
| `color` | User's chat color (hex) |
| `emotes` | Emote positions in the message |
| `id` | Unique message ID |
| `mod` | `1` if the user is a moderator |

**Keepalive:** Respond to `PING :tmi.twitch.tv` with `PONG :tmi.twitch.tv`.

---

## 2. YouTube API (Data API v3 + Live Streaming API)

**Base URL:** `https://www.googleapis.com/youtube/v3`

### 2.1 Authentication

YouTube uses **Google OAuth 2.0**.

| Property | Value |
|----------|-------|
| Auth URL | `https://accounts.google.com/o/oauth2/v2/auth` |
| Token URL | `https://oauth2.googleapis.com/token` |
| Token Lifetime | ~1 hour |
| Refresh | Use `refresh_token` grant to obtain new `access_token` |

**Required scopes:**

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/youtube.readonly` | Read channel stats, broadcasts, video info |
| `https://www.googleapis.com/auth/youtube.force-ssl` | Update broadcasts and video metadata |
| `https://www.googleapis.com/auth/youtube.channel-memberships.creator` | Read channel memberships |

### 2.2 Common Headers

```
Authorization: Bearer {access_token}
```

No separate API key header is needed when using OAuth tokens.

### 2.3 Rate Limits

YouTube enforces a **quota system** rather than per-second rate limits.

| Quota | Default |
|-------|---------|
| Daily quota | **10,000 units** |
| Read operations | 1 unit (typically) |
| Write operations | 50 units |
| `liveChatMessages` read | 5 units per call |

**Strategy:** Minimize polling frequency. Cache responses aggressively. The daily quota is strict and non-negotiable without applying for an increase.

### 2.4 REST Endpoints

#### GET /channels

Returns channel statistics including subscriber count.

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/channels` |
| Method | `GET` |
| Scope | `youtube.readonly` |
| Quota Cost | 1 unit |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `statistics` (or `statistics,snippet` for extra info) |
| `id` | Yes* | Channel ID |
| `mine` | Yes* | `true` to get the authenticated user's channel |

*Provide either `id` or `mine=true`, not both.

**Response (key fields):**

```json
{
  "items": [
    {
      "id": "UC...",
      "statistics": {
        "subscriberCount": "15200",
        "viewCount": "500000",
        "videoCount": "120"
      }
    }
  ]
}
```

Note: `subscriberCount` is a string, not a number. Parse it to integer.

---

#### GET /members

Returns a list of channel members (paid memberships).

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/members` |
| Method | `GET` |
| Scope | `youtube.channel-memberships.creator` |
| Quota Cost | 1 unit |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `snippet` |
| `mode` | No | `list_members` (default) or `updates` |
| `maxResults` | No | 1-1000, default 5 |
| `pageToken` | No | Pagination token |

**Response (key fields):**

```json
{
  "items": [
    {
      "snippet": {
        "creatorChannelId": "UC...",
        "memberDetails": {
          "channelId": "UC...",
          "channelUrl": "...",
          "displayName": "MemberName",
          "profileImageUrl": "..."
        },
        "membershipsDetails": {
          "highestAccessibleLevel": "level_1",
          "highestAccessibleLevelDisplayName": "Member"
        }
      }
    }
  ],
  "pageInfo": {
    "totalResults": 42,
    "resultsPerPage": 5
  }
}
```

Use `pageInfo.totalResults` for the membership count in Plugin 1.

---

#### GET /videos

Returns video details. Used to get concurrent viewer count for live streams.

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/videos` |
| Method | `GET` |
| Scope | `youtube.readonly` |
| Quota Cost | 1 unit |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `liveStreamingDetails` |
| `id` | Yes | Video ID of the live broadcast |

**Response (key fields):**

```json
{
  "items": [
    {
      "id": "dQw4w9WgXcQ",
      "liveStreamingDetails": {
        "actualStartTime": "2024-01-15T18:00:00Z",
        "concurrentViewers": "1523"
      }
    }
  ]
}
```

Note: `concurrentViewers` is a string. It is only present while the stream is live.

---

#### GET /liveBroadcasts

Lists active broadcasts for the authenticated user.

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/liveBroadcasts` |
| Method | `GET` |
| Scope | `youtube.readonly` |
| Quota Cost | 1 unit |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `snippet,status` |
| `broadcastStatus` | No | `active`, `upcoming`, `completed`, or `all` |
| `mine` | No | `true` for the authenticated user's broadcasts |

**Response (key fields):**

```json
{
  "items": [
    {
      "id": "broadcast_id",
      "snippet": {
        "title": "Stream Title",
        "description": "Stream description",
        "liveChatId": "chat_id_for_liveChatMessages"
      },
      "status": {
        "lifeCycleStatus": "live",
        "recordingStatus": "recording"
      }
    }
  ]
}
```

The `snippet.liveChatId` is needed for polling chat via `GET /liveChatMessages`. The broadcast `id` is needed for `PUT /liveBroadcasts`.

---

#### PUT /liveBroadcasts

Updates a live broadcast's metadata.

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/liveBroadcasts` |
| Method | `PUT` |
| Scope | `youtube.force-ssl` |
| Quota Cost | 50 units |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `snippet` |

**Request Body (JSON):**

```json
{
  "id": "broadcast_id",
  "snippet": {
    "title": "Updated Stream Title",
    "description": "Updated description",
    "scheduledStartTime": "2024-01-15T18:00:00Z"
  }
}
```

You must include all required `snippet` fields (including `scheduledStartTime`) even if you only want to update `title`. Fetch the current broadcast first and merge changes.

**Response:** Returns the updated broadcast resource.

---

#### PUT /videos

Updates video metadata (category, tags, privacy).

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/videos` |
| Method | `PUT` |
| Scope | `youtube.force-ssl` |
| Quota Cost | 50 units |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `snippet,status` |

**Request Body (JSON):**

```json
{
  "id": "video_id",
  "snippet": {
    "title": "Video Title",
    "categoryId": "20",
    "tags": ["gaming", "live"],
    "description": "Video description"
  },
  "status": {
    "privacyStatus": "public"
  }
}
```

**Response:** Returns the updated video resource.

---

#### GET /liveChatMessages

Polls live chat messages for a broadcast.

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/liveChatMessages` |
| Method | `GET` |
| Scope | `youtube.readonly` |
| Quota Cost | 5 units per call |
| Used by | Plugin 4 (Chat), Plugin 3 (Alerts) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `liveChatId` | Yes | From `liveBroadcasts` response `snippet.liveChatId` |
| `part` | Yes | `snippet,authorDetails` |
| `pageToken` | No | Token from previous response for next page |
| `maxResults` | No | 200-2000, default 500 |

**Response (key fields):**

```json
{
  "pollingIntervalMillis": 6000,
  "nextPageToken": "next_page_token",
  "items": [
    {
      "snippet": {
        "type": "textMessageEvent",
        "publishedAt": "2024-01-15T18:05:00Z",
        "displayMessage": "Hello stream!",
        "textMessageDetails": {
          "messageText": "Hello stream!"
        },
        "superChatDetails": null
      },
      "authorDetails": {
        "channelId": "UC...",
        "displayName": "ViewerName",
        "profileImageUrl": "https://...",
        "isChatOwner": false,
        "isChatModerator": false
      }
    }
  ]
}
```

**Polling behavior:** Always respect `pollingIntervalMillis` as the minimum delay between requests. Typical values are 5000-10000ms.

**Event message types used by Plugin 3 (Alerts):**

| `snippet.type` | Description |
|-----------------|-------------|
| `newSponsorEvent` | New channel membership |
| `superChatEvent` | Super Chat received (`snippet.superChatDetails.amountDisplayString`) |
| `membershipGiftingEvent` | Membership gifts |

Plugin 4 (Chat) uses `textMessageEvent` for regular chat messages.

---

#### GET /videoCategories

Lists available video categories for a region.

| Field | Value |
|-------|-------|
| URL | `https://www.googleapis.com/youtube/v3/videoCategories` |
| Method | `GET` |
| Scope | None (public) |
| Quota Cost | 1 unit |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `part` | Yes | `snippet` |
| `regionCode` | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`) |

**Response (key fields):**

```json
{
  "items": [
    {
      "id": "20",
      "snippet": {
        "title": "Gaming",
        "assignable": true
      }
    }
  ]
}
```

Only categories with `assignable: true` can be set on videos. Cache this response -- it rarely changes.

---

## 3. Kick API (Public API v1)

**Base URL:** `https://api.kick.com`

### 3.1 Authentication

Kick uses **OAuth 2.1 with PKCE**.

| Property | Value |
|----------|-------|
| Auth URL | `https://id.kick.com/oauth/authorize` |
| Token URL | `https://id.kick.com/oauth/token` |
| App Registration | https://kick.com/settings/developer |
| PKCE | Required (`code_challenge_method=S256`) |

**Required scopes:**

```
channel:read channel:write chat:write events:subscribe user:read
```

**Token validation:**

The endpoint `POST /public/v1/token/introspect` is deprecated. Use `POST https://id.kick.com/oauth/token/introspect` instead.

### 3.2 Common Headers

```
Authorization: Bearer {access_token}
```

### 3.3 Rate Limits

| Limit | Value |
|-------|-------|
| Request rate | **10 requests per second** |
| On 429 | Retry with exponential backoff (start at 1s, max 30s) |

### 3.4 REST Endpoints

#### GET /public/v1/channels

Returns channel information including subscriber count, stream title, and category.

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v1/channels` |
| Method | `GET` |
| Scope | `channel:read` |
| Used by | Plugin 1 (Metrics), Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `broadcaster_user_id` | Yes* | Broadcaster's user ID |
| `slug[]` | Yes* | Channel slug(s) |

*Provide one of the two.

**Response (key fields):**

```json
{
  "data": [
    {
      "broadcaster_user_id": 12345,
      "slug": "streamer",
      "stream_title": "Current Stream Title",
      "category": {
        "id": 1,
        "name": "Just Chatting"
      },
      "stream": {
        "is_live": true,
        "started_at": "2024-01-15T18:00:00Z"
      },
      "active_subscribers_count": 150
    }
  ]
}
```

---

#### PATCH /public/v1/channels

Updates stream metadata (title, category, tags).

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v1/channels` |
| Method | `PATCH` |
| Scope | `channel:write` |
| Used by | Plugin 2 (Stream Manager) |

**Request Body (JSON):**

```json
{
  "stream_title": "Updated Title",
  "category_id": 15,
  "custom_tags": ["english", "competitive", "fps"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `stream_title` | string | New stream title |
| `category_id` | integer | Category ID (resolve via `GET /public/v2/categories`) |
| `custom_tags` | string[] | Up to 10 custom tags |

**Response:** Returns the updated channel object.

---

#### GET /public/v1/livestreams

Returns livestream information including viewer count.

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v1/livestreams` |
| Method | `GET` |
| Scope | `channel:read` |
| Used by | Plugin 1 (Metrics) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `broadcaster_user_id[]` | Yes | One or more broadcaster user IDs |

**Response (key fields):**

```json
{
  "data": [
    {
      "broadcaster_user_id": 12345,
      "is_live": true,
      "viewer_count": 842,
      "started_at": "2024-01-15T18:00:00Z"
    }
  ]
}
```

---

#### GET /public/v2/categories

Searches or lists stream categories.

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v2/categories` |
| Method | `GET` |
| Scope | None |
| Used by | Plugin 2 (Stream Manager) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `search` | No | Search query string |
| `limit` | No | Max number of results |

**Response (key fields):**

```json
{
  "data": [
    {
      "id": 15,
      "name": "Fortnite",
      "slug": "fortnite"
    }
  ]
}
```

---

#### GET /public/v1/categories/{id}

Returns a specific category by ID.

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v1/categories/{id}` |
| Method | `GET` |
| Scope | None |
| Used by | Plugin 2 (Stream Manager) |

**Response (key fields):**

```json
{
  "data": {
    "id": 15,
    "name": "Fortnite",
    "slug": "fortnite",
    "parent_category": "Gaming"
  }
}
```

---

#### POST /public/v1/events/subscriptions

Subscribes to webhook events for real-time notifications.

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v1/events/subscriptions` |
| Method | `POST` |
| Scope | `events:subscribe` |
| Used by | Plugin 3 (Alerts) |

**Request Body (JSON):**

```json
{
  "events": [
    "channel.followed",
    "channel.subscription.new",
    "channel.subscription.gifts",
    "chat.message.sent"
  ],
  "method": "webhook",
  "broadcaster_user_id": 12345
}
```

**Response:** Returns the created subscription resource with a subscription ID.

---

#### GET /public/v1/users

Returns user information.

| Field | Value |
|-------|-------|
| URL | `https://api.kick.com/public/v1/users` |
| Method | `GET` |
| Scope | `user:read` |
| Used by | All plugins |

**Response (key fields):**

```json
{
  "data": [
    {
      "user_id": 12345,
      "name": "streamer",
      "email": "streamer@example.com",
      "profile_picture": "https://..."
    }
  ]
}
```

---

### 3.5 Pusher WebSocket (Chat)

Kick uses Pusher for real-time chat delivery. This is unofficial but widely used and currently the only viable method for live chat.

**Connection URL:**

```
wss://ws-us2.pusher.com/app/{appKey}?protocol=7
```

**Authentication:** None required for public channels.

**Subscribing to a channel:**

Send a Pusher `subscribe` event after the connection is established:

```json
{
  "event": "pusher:subscribe",
  "data": {
    "channel": "chatrooms.{chatroomId}.v2"
  }
}
```

**Resolving `chatroomId`:** Use the unofficial endpoint `https://kick.com/api/v2/channels/{slug}` and read `chatroom.id` from the response. Be aware this endpoint may be blocked by Cloudflare and requires appropriate request headers.

**Events on `chatrooms.{chatroomId}.v2`:**

| Event Name | Description |
|------------|-------------|
| `App\Events\ChatMessageEvent` | New chat message |
| `App\Events\FollowEvent` | New follower |
| `App\Events\SubscriptionEvent` | New subscription |
| `App\Events\GiftedSubscriptionsEvent` | Gifted subscriptions |

**Keepalive:** Pusher sends `pusher:ping` every ~120 seconds. Respond with `pusher:pong`. If no ping is received within the expected interval, reconnect.

---

### 3.6 Webhook Events (Official)

Events delivered to a registered webhook URL. Register via `POST /public/v1/events/subscriptions`.

**Event types:**

| Event | Description |
|-------|-------------|
| `chat.message.sent` | Chat message with sender info, content, and emotes |
| `channel.followed` | New follower notification |
| `channel.subscription.new` | New subscription |
| `channel.subscription.gifts` | Gifted subscriptions |
| `kicks.gifted` | Gifted Kicks |

**Signature verification:**

All webhook deliveries include a `Kick-Event-Signature` header. Verify it using the platform's public key:

```
GET https://api.kick.com/public/v1/public-key
```

Verify the signature against the raw request body using the returned public key before processing any webhook event.

### 3.7 Known Gaps

**Follower count:** The official Kick API does NOT currently expose follower counts. The v2 endpoint that previously provided this data is blocked by Cloudflare. This is a known issue tracked at [KickEngineering/KickDevDocs#366](https://github.com/KickEngineering/KickDevDocs/issues/366). Plugin 1 should display "N/A" for Kick follower count until this is resolved.

---

## 4. Discord API (Webhooks)

Discord integration uses **webhooks only** -- no bot token or gateway connection is needed.

### 4.1 Webhook URL

```
https://discord.com/api/webhooks/{webhook.id}/{webhook.token}
```

Users configure this URL in the plugin settings. The URL is obtained by creating a webhook in Discord server settings.

### 4.2 Sending Messages

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Authentication | None (token is embedded in the URL) |
| Used by | Plugin 5 (Discord Relay) |

**Request Body:**

```json
{
  "content": "Plain text message (up to 2000 characters)",
  "username": "StreamPlugins",
  "avatar_url": "https://example.com/bot-avatar.png",
  "embeds": [
    {
      "title": "New Subscriber!",
      "description": "**ViewerName** just subscribed at Tier 1!",
      "color": 6570404,
      "fields": [
        {
          "name": "Platform",
          "value": "Twitch",
          "inline": true
        },
        {
          "name": "Tier",
          "value": "Tier 1",
          "inline": true
        }
      ],
      "footer": {
        "text": "StreamPlugins",
        "icon_url": "https://example.com/icon.png"
      },
      "timestamp": "2024-01-15T18:05:00Z",
      "author": {
        "name": "StreamerName",
        "url": "https://twitch.tv/streamername",
        "icon_url": "https://example.com/streamer.png"
      },
      "thumbnail": {
        "url": "https://example.com/thumb.png"
      }
    }
  ]
}
```

**Field constraints:**

| Field | Limit |
|-------|-------|
| `content` | Max 2000 characters |
| `embeds` | Max 10 per message |
| Total embed text | Max 6000 characters across all embeds |
| `embed.fields` | Max 25 per embed |
| `embed.title` | Max 256 characters |
| `embed.description` | Max 4096 characters |
| `embed.field.name` | Max 256 characters |
| `embed.field.value` | Max 1024 characters |
| `embed.footer.text` | Max 2048 characters |
| `embed.color` | Decimal integer (e.g., `6570404` = `#6441A4` Twitch purple) |

### 4.3 Rate Limits

| Limit | Value |
|-------|-------|
| Per webhook | **30 requests per 60 seconds** |
| On 429 | Response includes `retry_after` (seconds) in JSON body |

**Batching strategy for chat relay:**

- Accumulate chat messages for 2-5 seconds.
- Send a single embed with multiple fields (one field per message) instead of one webhook call per message.
- Event alerts (follows, subs, raids) should be sent immediately without batching.

---

## 5. Internal API (Local Server)

**Base URL:** `http://localhost:3847`

The internal server acts as a bridge between the OBS plugin frontend (browser sources) and the platform APIs. It manages OAuth tokens, aggregates data, and provides a unified WebSocket for real-time events.

### 5.1 Authentication Routes

#### GET /auth/{platform}/login

Initiates the OAuth flow for a platform.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Platforms | `twitch`, `youtube`, `kick` |
| Behavior | Redirects the user's browser to the platform's OAuth authorization page |

**Example:** `GET http://localhost:3847/auth/twitch/login`

---

#### GET /auth/{platform}/callback

Handles the OAuth callback after the user authorizes.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Behavior | Exchanges the authorization code for tokens, stores them, redirects to a success page |

This route is set as the OAuth redirect URI for each platform during app registration.

---

#### GET /auth/status

Returns the authentication status for all platforms.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Response | JSON |

**Response:**

```json
{
  "twitch": {
    "authenticated": true,
    "user": {
      "id": "12345",
      "login": "streamer",
      "display_name": "Streamer"
    },
    "expires_at": "2024-01-15T22:00:00Z"
  },
  "youtube": {
    "authenticated": true,
    "user": {
      "channel_id": "UC...",
      "display_name": "Streamer"
    },
    "expires_at": "2024-01-15T19:00:00Z"
  },
  "kick": {
    "authenticated": false,
    "user": null,
    "expires_at": null
  }
}
```

---

### 5.2 Data Endpoints

#### GET /api/metrics

Returns aggregated metrics from all authenticated platforms.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Used by | Plugin 1 (Metrics) |

**Response:**

```json
{
  "twitch": {
    "followers": 1234,
    "subscribers": 58,
    "sub_points": 72,
    "viewers": 1523
  },
  "youtube": {
    "subscribers": 15200,
    "members": 42,
    "viewers": 830
  },
  "kick": {
    "followers": null,
    "subscribers": 150,
    "viewers": 842
  },
  "totals": {
    "viewers": 3195,
    "subscribers": 15408
  }
}
```

The `totals` object aggregates counts across platforms. Kick `followers` is `null` due to the API gap documented in section 3.7.

---

#### POST /api/title/update

Updates stream information across selected platforms simultaneously.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 2 (Stream Manager) |

**Request Body:**

```json
{
  "platforms": ["twitch", "youtube", "kick"],
  "title": "New Stream Title",
  "category": "Just Chatting",
  "tags": ["english", "casual"]
}
```

**Response:**

```json
{
  "results": {
    "twitch": { "success": true },
    "youtube": { "success": true },
    "kick": { "success": false, "error": "Category not found on Kick" }
  }
}
```

The server resolves category names to platform-specific IDs internally (Twitch `game_id`, YouTube `categoryId`, Kick `category_id`).

---

#### GET /api/chat/history

Returns recent chat messages from all platforms.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Used by | Plugin 4 (Chat) |

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `limit` | No | Max messages to return (default 100) |
| `since` | No | ISO 8601 timestamp; only return messages after this time |

**Response:**

```json
{
  "messages": [
    {
      "id": "msg-uuid",
      "platform": "twitch",
      "user": {
        "name": "ViewerName",
        "color": "#FF4500",
        "badges": ["subscriber"]
      },
      "text": "Hello stream!",
      "timestamp": "2024-01-15T18:05:00Z"
    }
  ]
}
```

---

### 5.3 Configuration Endpoints

#### GET /api/config

Returns the current plugin configuration.

| Field | Value |
|-------|-------|
| Method | `GET` |

**Response:**

```json
{
  "theme": "dark",
  "metrics": {
    "poll_interval_seconds": 30,
    "show_platforms": ["twitch", "youtube", "kick"]
  },
  "alerts": {
    "enabled_events": ["follow", "subscribe", "raid", "cheer", "gift"],
    "min_bits_alert": 100,
    "duration_ms": 5000
  },
  "chat": {
    "max_messages": 50,
    "show_badges": true,
    "font_size": 14
  },
  "discord": {
    "webhook_url": "https://discord.com/api/webhooks/...",
    "relay_chat": true,
    "relay_events": true,
    "chat_batch_interval_ms": 3000
  },
  "goals": [],
  "donations": {
    "tunnelUrl": "...",
    "enabled": {}
  },
  "sceneReactions": {
    "rules": []
  }
}
```

---

#### PUT /api/config

Updates the plugin configuration. Accepts a partial object; only provided keys are updated.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Content-Type | `application/json` |

**Request Body (example partial update):**

```json
{
  "alerts": {
    "min_bits_alert": 50,
    "duration_ms": 8000
  }
}
```

**Response:** Returns the full updated configuration object (same schema as `GET /api/config`).

---

### 5.4 Static File Serving

#### GET /plugins/{name}/

Serves static files for plugin browser sources.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Plugins | `metrics`, `manager`, `alerts`, `chat`, `discord` |

**Example:** `GET http://localhost:3847/plugins/metrics/` serves the metrics overlay HTML.

These URLs are configured as OBS Browser Sources.

---

### 5.5 WebSocket (Real-Time Events)

**URL:** `ws://localhost:3847/ws/events`

Provides a unified stream of real-time events to all plugin frontends.

**Message format:**

All messages are JSON with a `type` field indicating the event kind.

**Event types:**

| Type | Description | Source |
|------|-------------|--------|
| `chat.message` | Chat message from any platform | Twitch IRC/EventSub, YouTube polling, Kick Pusher |
| `alert.follow` | New follower | Twitch EventSub, Kick webhook |
| `alert.subscribe` | New subscription | Twitch EventSub, YouTube polling, Kick webhook |
| `alert.gift` | Gifted subscriptions | Twitch EventSub, YouTube polling, Kick webhook |
| `alert.raid` | Incoming raid | Twitch EventSub |
| `alert.cheer` | Bits/Super Chat | Twitch EventSub, YouTube polling |
| `metrics.update` | Updated metric values | Internal polling |
| `auth.status` | Authentication state change | Internal |
| `donation` | Donation received from any payment platform | Webhook handlers |
| `theme-changed` | User changed the theme | Settings dock |
| `goal-updated` | Goal progress changed | Metrics polling / donation |

**Example `chat.message` event:**

```json
{
  "type": "chat.message",
  "platform": "twitch",
  "data": {
    "id": "msg-uuid",
    "user": {
      "name": "ViewerName",
      "color": "#FF4500",
      "badges": ["subscriber"]
    },
    "text": "Hello stream!",
    "timestamp": "2024-01-15T18:05:00Z"
  }
}
```

**Example `alert.subscribe` event:**

```json
{
  "type": "alert.subscribe",
  "platform": "twitch",
  "data": {
    "user_name": "NewSub",
    "tier": "1000",
    "is_gift": false,
    "message": null
  }
}
```

**Connection handling:** Clients should reconnect automatically on disconnect with a 1-second delay. The server sends a `ping` frame every 30 seconds; clients must respond with `pong`.

---

## 6. Donation Webhook APIs

**Base URL:** `http://localhost:3847`

These endpoints receive incoming payment notifications from external services and emit a normalized `donation` event over the internal WebSocket (section 5.5). All webhook handlers are part of the internal server.

### 6.1 POST /webhooks/paypal

Receives PayPal payment webhook notifications. Validates the event and emits a normalized `donation` event.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 8 (Donation Alerts) |

**Event type:** `PAYMENT.CAPTURE.COMPLETED`

---

### 6.2 POST /webhooks/stripe

Receives Stripe webhook notifications. Validates signature (TODO) and emits `donation` event.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Header | `Stripe-Signature` for validation |
| Used by | Plugin 8 (Donation Alerts) |

**Events:** `checkout.session.completed`, `payment_intent.succeeded`

---

### 6.3 POST /webhooks/kofi

Receives Ko-fi webhook notifications. Body contains form-encoded `data` field with JSON.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` or `application/x-www-form-urlencoded` |
| Used by | Plugin 8 (Donation Alerts) |

**Events:** Donation, Subscription

---

### 6.4 POST /webhooks/buymeacoffee

Receives Buy Me a Coffee webhook notifications.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 8 (Donation Alerts) |

**Events:** `payment.completed`, `one-time-payment`

---

### 6.5 POST /webhooks/streamlabs

Receives Streamlabs webhook/socket event notifications.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 8 (Donation Alerts) |

**Event type:** `donation`

---

### 6.6 Normalized Donation Event

All webhook handlers above normalize incoming data and broadcast a unified event via WebSocket:

```json
{
  "type": "donation",
  "data": {
    "source": "paypal|stripe|kofi|buymeacoffee|streamlabs",
    "amount": 10.00,
    "currency": "USD",
    "donor": "Supporter Name",
    "message": "Optional message",
    "timestamp": "2026-08-09T00:00:00.000Z"
  }
}
```

---

## 7. OBS WebSocket API

**Base URL:** `http://localhost:3847`

These endpoints manage the connection to OBS Studio via obs-websocket and allow testing of scene reaction rules. All routes are part of the internal server.

### 7.1 POST /api/obs/connect

Connects to the OBS WebSocket server.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 9 (Scene Reactions) |

**Request body:**

```json
{
  "host": "localhost",
  "port": 4455,
  "password": "optional_password"
}
```

**Response:**

```json
{
  "connected": true,
  "scenes": ["Main", "BRB", "Starting Soon"],
  "sources": ["Webcam", "Game Capture", "Alert Sound"]
}
```

---

### 7.2 GET /api/obs/status

Returns the current OBS connection status, scenes, and sources.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Used by | Plugin 9 (Scene Reactions) |

**Response:** Same shape as `POST /api/obs/connect`.

---

### 7.3 POST /api/obs/test-rule

Executes a single reaction rule for testing.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Content-Type | `application/json` |
| Used by | Plugin 9 (Scene Reactions) |

**Request body:**

```json
{
  "rule": {
    "trigger": "raid",
    "action": "switch_scene",
    "target": "BRB",
    "duration": 30,
    "revertScene": "Main",
    "minAmount": 0,
    "enabled": true
  }
}
```
