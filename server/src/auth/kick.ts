/**
 * Kick OAuth 2.1 with PKCE Flow
 *
 * Auth URL: https://id.kick.com/oauth/authorize
 * Token URL: https://id.kick.com/oauth/token
 *
 * Scopes:
 * - channel:read (channel info, subscriber count, stream status)
 * - channel:write (update stream title, category, tags)
 * - chat:write (send chat messages)
 * - events:subscribe (webhook event subscriptions)
 * - user:read (user info)
 *
 * PKCE:
 * - Generate code_verifier (43-128 chars, URL-safe random)
 * - Compute code_challenge = BASE64URL(SHA256(code_verifier))
 * - Send code_challenge with authorize request
 * - Send code_verifier with token exchange request
 */

// TODO: Implement Kick OAuth 2.1 + PKCE flow
// - GET /auth/kick/login -> redirect to Kick authorize URL with PKCE challenge
// - GET /auth/kick/callback -> exchange code for tokens using code_verifier
// - Token refresh logic
// - Token revocation on disconnect

export {};
