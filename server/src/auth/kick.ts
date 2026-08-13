import type { Request, Response } from 'express';
import {
  authErrorHtml,
  authSuccessHtml,
  consumeState,
  createPkcePair,
  createState,
  getRedirectUri,
  requireEnv,
} from './oauth.js';
import { reloadCredentials } from '../config/credentials.js';
import { deleteTokens, getTokens, saveTokens, type StoredTokens } from './tokenStore.js';

const KICK_AUTH_URL = 'https://id.kick.com/oauth/authorize';
const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';
const KICK_SCOPES = [
  'user:read',
  'channel:read',
  'channel:write',
  'chat:write',
  'events:subscribe',
].join(' ');

export function kickLogin(_req: Request, res: Response): void {
  reloadCredentials();
  try {
    const clientId = requireEnv('KICK_CLIENT_ID');
    const { verifier, challenge } = createPkcePair();
    const state = createState('kick', verifier);
    const redirectUri = getRedirectUri('kick');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: KICK_SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    res.redirect(`${KICK_AUTH_URL}?${params}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kick login failed';
    res.status(503).send(authErrorHtml(
      'Publisher setup required',
      `Complete the one-time Publisher Setup in StreamPlugins: Settings before users can connect Kick.<br><br><small>${message}</small>`,
    ));
  }
}

export async function kickCallback(req: Request, res: Response): Promise<void> {
  const code = String(req.query.code ?? '');
  const state = String(req.query.state ?? '');
  const error = req.query.error ? String(req.query.error) : null;

  if (error) {
    res.status(400).send(authErrorHtml('Kick authorization cancelled', error));
    return;
  }

  const pending = consumeState(state);
  if (!code || !pending || pending.platform !== 'kick' || !pending.codeVerifier) {
    res.status(400).send(authErrorHtml('Invalid Kick callback', 'Missing or expired authorization state.'));
    return;
  }

  try {
    const clientId = requireEnv('KICK_CLIENT_ID');
    const clientSecret = requireEnv('KICK_CLIENT_SECRET');
    const redirectUri = getRedirectUri('kick');

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: pending.codeVerifier,
    });

    const tokenRes = await fetch(KICK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const tokenJson = (await tokenRes.json()) as Record<string, unknown>;
    if (!tokenRes.ok) {
      throw new Error(String(tokenJson.error_description ?? tokenJson.message ?? 'Token exchange failed'));
    }

    const accessToken = String(tokenJson.access_token ?? '');
    const refreshToken = tokenJson.refresh_token ? String(tokenJson.refresh_token) : undefined;
    const expiresIn = Number(tokenJson.expires_in ?? 0);
    const scope = tokenJson.scope ? String(tokenJson.scope) : KICK_SCOPES;

    const userRes = await fetch('https://api.kick.com/public/v1/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    let displayName = 'Kick user';
    let userId: string | undefined;
    if (userRes.ok) {
      const userJson = (await userRes.json()) as {
        data?: Array<{ user_id?: number; name?: string; username?: string }>;
      };
      const user = userJson.data?.[0];
      if (user) {
        displayName = user.name ?? user.username ?? displayName;
        userId = user.user_id !== undefined ? String(user.user_id) : undefined;
      }
    }

    const tokens: StoredTokens = {
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
      scope,
      user: { id: userId, displayName },
    };
    saveTokens('kick', tokens);
    res.send(authSuccessHtml('Kick', displayName));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kick callback failed';
    res.status(500).send(authErrorHtml('Kick connection failed', message));
  }
}

export function kickDisconnect(_req: Request, res: Response): void {
  deleteTokens('kick');
  res.json({ ok: true });
}

export function kickStatus() {
  const tokens = getTokens('kick');
  if (!tokens?.accessToken) {
    return null;
  }
  return {
    displayName: tokens.user?.displayName ?? 'Connected',
    id: tokens.user?.id,
  };
}
