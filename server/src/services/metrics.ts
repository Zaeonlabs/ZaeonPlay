import { getTokens, type StoredTokens } from '../auth/tokenStore.js';

export interface PlatformMetrics {
  followers?: number | null;
  subscribers?: number | null;
  viewers?: number;
  members?: number;
}

export type MetricsResponse = Record<string, PlatformMetrics>;

export async function getCombinedMetrics(): Promise<MetricsResponse> {
  const result: MetricsResponse = {};

  const twitch = getTokens('twitch');
  if (twitch?.accessToken) {
    result.twitch = await fetchTwitchMetrics(twitch);
  }

  const youtube = getTokens('youtube');
  if (youtube?.accessToken) {
    result.youtube = await fetchYouTubeMetrics(youtube);
  }

  const kick = getTokens('kick');
  if (kick?.accessToken) {
    result.kick = await fetchKickMetrics(kick);
  }

  return result;
}

async function fetchTwitchMetrics(tokens: StoredTokens): Promise<PlatformMetrics> {
  const clientId = process.env.TWITCH_CLIENT_ID?.trim();
  const userId = tokens.user?.id;
  if (!clientId || !userId) {
    return { viewers: 0, followers: 0, subscribers: 0 };
  }

  const headers = {
    Authorization: `Bearer ${tokens.accessToken}`,
    'Client-Id': clientId,
  };

  let viewers = 0;
  let followers = 0;
  let subscribers = 0;

  try {
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, { headers });
    const streamJson = (await streamRes.json()) as { data?: Array<{ viewer_count: number }> };
    viewers = streamJson.data?.[0]?.viewer_count ?? 0;
  } catch { /* offline */ }

  try {
    const followRes = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`,
      { headers },
    );
    const followJson = (await followRes.json()) as { total?: number };
    followers = followJson.total ?? 0;
  } catch { /* scope or offline */ }

  try {
    const subRes = await fetch(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${userId}&first=1`,
      { headers },
    );
    const subJson = (await subRes.json()) as { total?: number };
    subscribers = subJson.total ?? 0;
  } catch { /* scope */ }

  return { viewers, followers, subscribers };
}

async function fetchYouTubeMetrics(tokens: StoredTokens): Promise<PlatformMetrics> {
  const headers = { Authorization: `Bearer ${tokens.accessToken}` };
  let subscribers = 0;
  let viewers = 0;

  try {
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true',
      { headers },
    );
    const channelJson = (await channelRes.json()) as {
      items?: Array<{ statistics?: { subscriberCount?: string } }>;
    };
    subscribers = Number(channelJson.items?.[0]?.statistics?.subscriberCount ?? 0);
  } catch { /* ignore */ }

  try {
    const liveRes = await fetch(
      'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&broadcastStatus=active&mine=true',
      { headers },
    );
    const liveJson = (await liveRes.json()) as {
      items?: Array<{ id?: string }>;
    };
    const broadcastId = liveJson.items?.[0]?.id;
    if (broadcastId) {
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${broadcastId}`,
        { headers },
      );
      const videoJson = (await videoRes.json()) as {
        items?: Array<{ liveStreamingDetails?: { concurrentViewers?: string } }>;
      };
      viewers = Number(videoJson.items?.[0]?.liveStreamingDetails?.concurrentViewers ?? 0);
    }
  } catch { /* not live */ }

  return { subscribers, viewers };
}

async function fetchKickMetrics(tokens: StoredTokens): Promise<PlatformMetrics> {
  const headers = { Authorization: `Bearer ${tokens.accessToken}` };
  let viewers = 0;
  let subscribers = 0;

  try {
    const channelRes = await fetch('https://api.kick.com/public/v1/channels', { headers });
    const channelJson = (await channelRes.json()) as {
      data?: Array<{ subscriber_count?: number; livestream?: { viewer_count?: number } }>;
    };
    const channel = channelJson.data?.[0];
    subscribers = channel?.subscriber_count ?? 0;
    viewers = channel?.livestream?.viewer_count ?? 0;
  } catch { /* ignore */ }

  return { followers: null, subscribers, viewers };
}
