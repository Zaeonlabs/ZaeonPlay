import type { Request, Response } from 'express';
import {
  authErrorHtml,
  authSuccessHtml,
  consumeState,
  createState,
  getRedirectUri,
  requireEnv,
} from './oauth.js';
import { reloadCredentials } from '../config/credentials.js';
import { deleteTokens, getTokens, saveTokens, type StoredTokens } from './tokenStore.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
].join(' ');

export function youtubeLogin(_req: Request, res: Response): void {
  reloadCredentials();
  try {
    const clientId = requireEnv('YOUTUBE_CLIENT_ID');
    const state = createState('youtube');
    const redirectUri = getRedirectUri('youtube');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: YOUTUBE_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'YouTube login failed';
    res.status(503).send(authErrorHtml(
      'Publisher setup required',
      `Complete the one-time Publisher Setup in StreamPlugins: Settings before users can connect YouTube.<br><br><small>${message}</small>`,
    ));
  }
}

export async function youtubeCallback(req: Request, res: Response): Promise<void> {
  const code = String(req.query.code ?? '');
  const state = String(req.query.state ?? '');
  const error = req.query.error ? String(req.query.error) : null;

  if (error) {
    res.status(400).send(authErrorHtml('YouTube authorization cancelled', error));
    return;
  }

  const pending = consumeState(state);
  if (!code || !pending || pending.platform !== 'youtube') {
    res.status(400).send(authErrorHtml('Invalid YouTube callback', 'Missing or expired authorization state.'));
    return;
  }

  try {
    const clientId = requireEnv('YOUTUBE_CLIENT_ID');
    const clientSecret = requireEnv('YOUTUBE_CLIENT_SECRET');
    const redirectUri = getRedirectUri('youtube');

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const tokenJson = (await tokenRes.json()) as Record<string, unknown>;
    if (!tokenRes.ok) {
      throw new Error(String(tokenJson.error_description ?? tokenJson.error ?? 'Token exchange failed'));
    }

    const accessToken = String(tokenJson.access_token ?? '');
    const refreshToken = tokenJson.refresh_token ? String(tokenJson.refresh_token) : undefined;
    const expiresIn = Number(tokenJson.expires_in ?? 0);
    const scope = tokenJson.scope ? String(tokenJson.scope) : YOUTUBE_SCOPES;

    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const channelJson = (await channelRes.json()) as {
      items?: Array<{ id: string; snippet?: { title?: string } }>;
    };
    const channel = channelJson.items?.[0];

    const tokens: StoredTokens = {
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
      scope,
      user: channel
        ? { channelId: channel.id, displayName: channel.snippet?.title ?? 'YouTube channel' }
        : undefined,
    };
    saveTokens('youtube', tokens);
    res.send(authSuccessHtml('YouTube', tokens.user?.displayName ?? 'Connected'));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'YouTube callback failed';
    res.status(500).send(authErrorHtml('YouTube connection failed', message));
  }
}

export function youtubeDisconnect(_req: Request, res: Response): void {
  deleteTokens('youtube');
  res.json({ ok: true });
}

export function youtubeStatus() {
  const tokens = getTokens('youtube');
  if (!tokens?.accessToken) {
    return null;
  }
  return {
    displayName: tokens.user?.displayName ?? 'Connected',
    id: tokens.user?.channelId,
  };
}
