import type { Request, Response } from 'express';
import {
  authErrorHtml,
  authSuccessHtml,
  consumeState,
  createState,
  getRedirectUri,
  requireEnv,
} from './oauth.js';
import { deleteTokens, getTokens, saveTokens, type StoredTokens } from './tokenStore.js';

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_SCOPES = [
  'moderator:read:followers',
  'channel:read:subscriptions',
  'channel:manage:broadcast',
  'bits:read',
  'user:read:chat',
].join(' ');

export function twitchLogin(_req: Request, res: Response): void {
  try {
    const clientId = requireEnv('TWITCH_CLIENT_ID');
    const state = createState('twitch');
    const redirectUri = getRedirectUri('twitch');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: TWITCH_SCOPES,
      state,
    });
    res.redirect(`${TWITCH_AUTH_URL}?${params}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Twitch login failed';
    res.status(500).send(authErrorHtml('Twitch not configured', `${message}. Add credentials to <code>%APPDATA%\\StreamPlugins\\.env</code> (see .env.example).`));
  }
}

export async function twitchCallback(req: Request, res: Response): Promise<void> {
  const code = String(req.query.code ?? '');
  const state = String(req.query.state ?? '');
  const error = req.query.error ? String(req.query.error) : null;

  if (error) {
    res.status(400).send(authErrorHtml('Twitch authorization cancelled', error));
    return;
  }

  const pending = consumeState(state);
  if (!code || !pending || pending.platform !== 'twitch') {
    res.status(400).send(authErrorHtml('Invalid Twitch callback', 'Missing or expired authorization state.'));
    return;
  }

  try {
    const clientId = requireEnv('TWITCH_CLIENT_ID');
    const clientSecret = requireEnv('TWITCH_CLIENT_SECRET');
    const redirectUri = getRedirectUri('twitch');

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch(TWITCH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const tokenJson = (await tokenRes.json()) as Record<string, unknown>;
    if (!tokenRes.ok) {
      throw new Error(String(tokenJson.message ?? 'Token exchange failed'));
    }

    const accessToken = String(tokenJson.access_token ?? '');
    const refreshToken = tokenJson.refresh_token ? String(tokenJson.refresh_token) : undefined;
    const expiresIn = Number(tokenJson.expires_in ?? 0);
    const scope = tokenJson.scope ? String(tokenJson.scope) : TWITCH_SCOPES;

    const userRes = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
    });
    const userJson = (await userRes.json()) as { data?: Array<{ id: string; login: string; display_name: string }> };
    const user = userJson.data?.[0];

    const tokens: StoredTokens = {
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
      scope,
      user: user
        ? { id: user.id, login: user.login, displayName: user.display_name }
        : undefined,
    };
    saveTokens('twitch', tokens);
    res.send(authSuccessHtml('Twitch', tokens.user?.displayName ?? 'Connected'));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Twitch callback failed';
    res.status(500).send(authErrorHtml('Twitch connection failed', message));
  }
}

export function twitchDisconnect(_req: Request, res: Response): void {
  deleteTokens('twitch');
  res.json({ ok: true });
}

export function twitchStatus() {
  const tokens = getTokens('twitch');
  if (!tokens?.accessToken) {
    return null;
  }
  return {
    displayName: tokens.user?.displayName ?? tokens.user?.login ?? 'Connected',
    id: tokens.user?.id,
  };
}
