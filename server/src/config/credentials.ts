import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getDataDir } from '../auth/tokenStore.js';

/**
 * Load publisher OAuth credentials from every sensible location.
 * Priority: first file found wins (dotenv does not override existing vars).
 *
 * 1. Project root .env (dev — loaded by dotenv/config in index.ts)
 * 2. %APPDATA%/StreamPlugins/.env (user override)
 * 3. Next to server executable (installed layout)
 * 4. Parent of executable (data/.env in OBS plugin install)
 */
export function loadCredentials(): string | null {
  const candidates = [
    path.join(getDataDir(), '.env'),
    path.join(path.dirname(process.execPath), '.env'),
    path.join(path.dirname(process.execPath), '..', '.env'),
  ];

  let loadedFrom: string | null = null;
  for (const file of candidates) {
    if (existsSync(file)) {
      dotenv.config({ path: file });
      loadedFrom = loadedFrom ?? file;
    }
  }
  return loadedFrom;
}

export function authConfigured(): Record<string, boolean> {
  return {
    twitch: Boolean(process.env.TWITCH_CLIENT_ID?.trim() && process.env.TWITCH_CLIENT_SECRET?.trim()),
    youtube: Boolean(process.env.YOUTUBE_CLIENT_ID?.trim() && process.env.YOUTUBE_CLIENT_SECRET?.trim()),
    kick: Boolean(process.env.KICK_CLIENT_ID?.trim() && process.env.KICK_CLIENT_SECRET?.trim()),
  };
}
