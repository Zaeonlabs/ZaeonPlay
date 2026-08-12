/**
 * Twitch IRC WebSocket Client
 *
 * Connection: wss://irc-ws.chat.twitch.tv:443
 * Protocol: IRC over WebSocket
 *
 * Auth (for sending): PASS oauth:{token}, NICK {username}
 * Anonymous read: No auth needed -- connect and JOIN channel
 *
 * Capabilities: twitch.tv/membership, twitch.tv/tags, twitch.tv/commands
 * Tags provide: badges, color, display-name, emotes, subscriber status
 */

// TODO: Implement Twitch IRC WebSocket client
// - Connect to wss://irc-ws.chat.twitch.tv:443
// - Send CAP REQ for tags, membership, commands
// - JOIN target channel(s)
// - Parse PRIVMSG with tags into normalized chat messages
// - Handle PING/PONG keepalive
// - Reconnect on disconnect

export {};
