/**
 * Discord Webhook Forwarder
 *
 * Forwards chat messages and stream events to Discord via webhooks.
 *
 * Chat messages: batched (accumulate for 2-5 seconds, send as single embed)
 * Events: sent immediately as individual rich embeds
 *
 * Rate limit: 30 requests per 60 seconds per webhook URL
 * Batching prevents hitting rate limits during active chat.
 *
 * Embed colors:
 * - Twitch: #9146FF (purple)
 * - YouTube: #FF0000 (red)
 * - Kick: #53FC18 (green)
 */

// TODO: Implement Discord webhook forwarder
// - ChatBatcher: accumulate messages, flush every N seconds
// - EventForwarder: send event embeds immediately with queue
// - Rate limiter: track requests per webhook, back off on 429
// - Embed builder for chat batches and event alerts

export {};
