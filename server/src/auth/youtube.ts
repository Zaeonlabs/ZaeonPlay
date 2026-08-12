/**
 * YouTube / Google OAuth 2.0 Flow
 *
 * Auth URL: https://accounts.google.com/o/oauth2/v2/auth
 * Token URL: https://oauth2.googleapis.com/token
 *
 * Scopes:
 * - https://www.googleapis.com/auth/youtube.readonly (read channel stats, live chat)
 * - https://www.googleapis.com/auth/youtube.force-ssl (update broadcasts, videos)
 * - https://www.googleapis.com/auth/youtube.channel-memberships.creator (member count)
 */

// TODO: Implement Google OAuth flow
// - GET /auth/youtube/login -> redirect to Google authorize URL
// - GET /auth/youtube/callback -> exchange code for tokens, store encrypted
// - Token refresh logic (tokens expire in ~1 hour)
// - Token revocation on disconnect

export {};
