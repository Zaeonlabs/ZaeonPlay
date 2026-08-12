# Security

This document describes the security architecture of StreamPlugins, covering how sensitive data is handled, stored, and protected.

## Threat Model

StreamPlugins runs entirely on the user's local machine. The primary assets to protect are:

| Asset | Risk | Mitigation |
|-------|------|------------|
| OAuth access tokens | Token theft grants API access to user's streaming accounts | Encrypted at rest, never sent to frontend, localhost-only server |
| OAuth refresh tokens | Long-lived credential for generating new access tokens | Encrypted at rest, stored separately from access tokens |
| Discord webhook URLs | Anyone with the URL can post to the user's Discord channel | Stored server-side only, never exposed to browser sources |
| Platform client secrets | Compromise allows impersonation of the application | Stored in environment variables or encrypted config, never bundled in frontend |
| User configuration | Contains channel IDs, preferences | Stored locally, no remote transmission |
| Donation webhook secrets (Stripe secret, Ko-fi token, etc.) | Compromise allows sending fake donation alerts | Stored server-side only in encrypted config, never exposed to frontend |
| OBS WebSocket password | Grants full control of OBS Studio | Stored server-side, connection is localhost-only |
| Tunnel URLs | Public endpoint exposing webhook handlers | Only webhook routes are exposed; all other routes reject non-localhost origins |

## Architecture Security Properties

### Localhost-Only Binding

The StreamPlugins server binds exclusively to `127.0.0.1` (localhost). It does not accept connections from other machines on the network. This is enforced at the Express server level:

```typescript
server.listen(PORT, '127.0.0.1');
```

No firewall rules or port forwarding are needed. The server is not accessible from the internet.

### No Telemetry

StreamPlugins does not collect, transmit, or store any analytics, telemetry, crash reports, or usage data. All data stays on the user's machine. There are no outbound connections except to the platform APIs (Twitch, YouTube, Kick) and Discord webhooks configured by the user.

### No Cloud Dependencies

StreamPlugins has no cloud backend, no SaaS component, and no remote server. The only external connections are direct API calls to the streaming platforms and Discord.

## Token Management

### Storage

OAuth tokens are stored in an encrypted JSON file at:

- **Linux/macOS**: `~/.streamplugins/tokens.json`
- **Windows**: `%USERPROFILE%\.streamplugins\tokens.json`

### Encryption

Tokens are encrypted using AES-256-GCM:

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key derivation**: PBKDF2 with SHA-512, 100,000 iterations
- **Salt**: Randomly generated per installation, stored alongside the encrypted data
- **Key source**: Derived from a combination of:
  - Machine-specific identifier (hostname + OS serial, via `os` module)
  - Installation-specific random seed (generated on first run)
- **IV**: Randomly generated per encryption operation
- **Auth tag**: Stored with the ciphertext to verify integrity on decryption

This means:
- Tokens cannot be decrypted if the file is copied to another machine
- Tokens cannot be decrypted without the installation seed
- Each write operation uses a fresh IV, preventing ciphertext analysis

### Token Lifecycle

```
1. User initiates OAuth flow via Settings dock
2. Browser redirects to platform authorization page
3. Platform redirects back to localhost callback with auth code
4. Server exchanges auth code for access + refresh tokens (server-to-server)
5. Tokens encrypted and written to disk
6. Access token used for API calls (kept in memory during session)
7. On token expiry: refresh token used to obtain new access token
8. On refresh failure: user prompted to re-authorize
```

### Token Refresh

| Platform | Access Token Lifetime | Refresh Strategy |
|----------|----------------------|------------------|
| Twitch | ~4 hours | Auto-refresh using refresh token before expiry |
| YouTube | ~1 hour | Auto-refresh using refresh token before expiry |
| Kick | Varies | Auto-refresh using refresh token before expiry |

The server proactively refreshes tokens 5 minutes before expiry to avoid interrupting live streams.

### Token Revocation

Users can revoke platform access through the Settings dock. This:
1. Calls the platform's token revocation endpoint
2. Deletes the encrypted token from disk
3. Clears the token from server memory

## OAuth Flow Security

### CSRF Protection

All OAuth callback routes validate the `state` parameter:
1. Server generates a random `state` value before redirecting to the platform
2. State is stored in a short-lived server-side session (5-minute expiry)
3. On callback, the returned `state` must match the stored value
4. Mismatched or missing `state` values reject the callback

### PKCE (Kick)

Kick uses OAuth 2.1 with PKCE (Proof Key for Code Exchange):
1. Server generates a random `code_verifier` (43-128 chars, URL-safe)
2. Computes `code_challenge` as `BASE64URL(SHA256(code_verifier))`
3. Sends `code_challenge` with the authorization request
4. Sends `code_verifier` with the token exchange request
5. Kick verifies the challenge matches, preventing authorization code interception

### Redirect URI Validation

OAuth redirect URIs are hardcoded to `http://localhost:3847/auth/{platform}/callback`. The server rejects callbacks that do not match the expected origin.

## Frontend Security

### No Secrets in Frontend Code

The frontend widgets (HTML/CSS/JS loaded in OBS browser sources) never have access to:
- OAuth tokens (access or refresh)
- Platform client secrets
- Discord webhook URLs

The frontend communicates with the backend via `http://localhost:3847/api/*` routes. The backend handles all authenticated API calls on behalf of the frontend.

### Content Security Policy

The server sets Content-Security-Policy headers on all served pages:

```
Content-Security-Policy: default-src 'self'; connect-src 'self' ws://localhost:3847; img-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self'
```

This prevents:
- Loading scripts from external sources
- Connecting to servers other than localhost
- Inline script injection (except for necessary inline styles)

## WebSocket Security

The local WebSocket server (`ws://localhost:3847/ws/events`) is used for real-time event delivery to frontend widgets. Security measures:

- **Origin checking**: Only accepts connections from `localhost` origins
- **No authentication required**: Since the server is localhost-only and the WebSocket carries no write operations, authentication is not required for the event stream
- **Read-only**: The WebSocket is one-directional (server to client). Clients cannot send commands through it

## Discord Webhook Security

Discord webhook URLs are sensitive (anyone with the URL can post messages). StreamPlugins protects them by:

1. Storing webhook URLs only in the server-side config file (encrypted)
2. Never transmitting webhook URLs to the frontend
3. The Discord Logger settings dock sends webhook URLs to the backend via a localhost API call, which stores them immediately
4. All Discord API calls are made server-side

### Webhook Security (Donation Alerts)

The Donation Alerts plugin receives payment notifications from external services (PayPal, Stripe, Ko-fi, Buy Me a Coffee, Streamlabs) via webhook POST requests. These webhooks require a public URL, which is provided via a tunnel (ngrok, Cloudflare Tunnel, etc.).

Security measures:

1. **Webhook validation**: Each payment platform provides a signature or verification mechanism:
   - **Stripe**: Validates `Stripe-Signature` header against the webhook secret using HMAC-SHA256
   - **PayPal**: Validates webhook events against PayPal's verification API
   - **Ko-fi**: Validates the `verification_token` field in the payload
   - **Buy Me a Coffee**: Validates webhook signature header
   - **Streamlabs**: Validates via socket API token

2. **Route isolation**: Only `/webhooks/*` routes accept requests from non-localhost origins. All other server routes continue to reject non-localhost connections.

3. **Secret storage**: Webhook secrets and API tokens are stored in the encrypted config file alongside other credentials. They are never exposed to frontend code.

4. **Input validation**: All webhook payloads are validated against expected schemas before processing. Malformed payloads are rejected with appropriate error codes.

5. **No sensitive data in events**: The normalized `donation` event broadcast to frontends contains only the donor name, amount, currency, and message — no payment IDs, email addresses, or financial details.

### OBS WebSocket Security

The Scene Reactions plugin connects to OBS Studio's obs-websocket server for scene/source automation.

Security measures:

1. **Localhost-only connection**: The obs-websocket client connects only to `ws://localhost:4455` (or user-configured localhost port). No remote OBS connections are supported.
2. **Password authentication**: If the user has configured a password in OBS WebSocket settings, the client authenticates using the obs-websocket v5 authentication protocol.
3. **Password storage**: The OBS WebSocket password is stored in the server-side config (encrypted at rest), never sent to the frontend.
4. **Action scope**: The client only performs scene switches, source visibility toggles, and media playback — it does not modify OBS settings, profiles, or recording configurations.

## Dependency Security

- Dependencies are pinned to specific versions in `package-lock.json`
- Regular dependency audits via `npm audit`
- Minimal dependency tree -- the server uses few external packages to reduce attack surface
- No client-side JavaScript dependencies (vanilla JS only in frontend)

## Responsible Disclosure

If you discover a security vulnerability in StreamPlugins, please report it responsibly:

1. Do NOT open a public GitHub issue
2. Email security@streamplugins.dev (or use GitHub Security Advisories)
3. Include a description of the vulnerability and steps to reproduce
4. Allow reasonable time for a fix before public disclosure

## Security Checklist for Contributors

When submitting code changes, verify:

- [ ] No secrets, tokens, or credentials are hardcoded or logged
- [ ] OAuth tokens are not passed to or accessible from frontend code
- [ ] New API routes that handle sensitive data validate input
- [ ] Discord webhook URLs are not exposed to the frontend
- [ ] New dependencies are reviewed for known vulnerabilities
- [ ] File paths are validated to prevent path traversal
- [ ] Server continues to bind only to localhost
- [ ] Webhook handler validates signatures/tokens before processing events
- [ ] Donation webhook secrets are not logged or included in error messages
- [ ] OBS WebSocket password is not exposed to frontend code
- [ ] Tunnel URL exposure is limited to webhook routes only
