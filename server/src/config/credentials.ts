import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { getDataDir } from '../auth/tokenStore.js';

const ENV_KEYS = [
  'STREAMPLUGINS_PORT',
  'TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'YOUTUBE_CLIENT_ID',
  'YOUTUBE_CLIENT_SECRET',
  'KICK_CLIENT_ID',
  'KICK_CLIENT_SECRET',
] as const;

function credentialFiles(): string[] {
  const root = process.cwd();
  return [
    path.join(root, 'publisher.env'),
    path.join(root, '.env'),
    path.join(getDataDir(), '.env'),
    path.join(path.dirname(process.execPath), '.env'),
    path.join(path.dirname(process.execPath), '..', '.env'),
  ];
}

export function reloadCredentials(): string | null {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }

  let loadedFrom: string | null = null;
  for (const file of credentialFiles()) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file, override: true });
      loadedFrom = loadedFrom ?? file;
    }
  }
  return loadedFrom;
}

export function loadCredentials(): string | null {
  return reloadCredentials();
}

export function authConfigured(): Record<string, boolean> {
  return {
    twitch: Boolean(process.env.TWITCH_CLIENT_ID?.trim() && process.env.TWITCH_CLIENT_SECRET?.trim()),
    youtube: Boolean(process.env.YOUTUBE_CLIENT_ID?.trim() && process.env.YOUTUBE_CLIENT_SECRET?.trim()),
    kick: Boolean(process.env.KICK_CLIENT_ID?.trim() && process.env.KICK_CLIENT_SECRET?.trim()),
  };
}

export function publisherKeysConfigured(): boolean {
  return Object.values(authConfigured()).some(Boolean);
}

export function savePublisherCredentials(values: Record<string, string>): string {
  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  const envFile = path.join(dataDir, '.env');

  const lines = [
    '# StreamPlugins publisher OAuth keys (one-time setup)',
    '# Register apps at dev.twitch.tv, console.cloud.google.com, kick.com/settings/developer',
    '# Redirect URI for each: http://localhost:3847/auth/{platform}/callback',
    '',
    `STREAMPLUGINS_PORT=${values.STREAMPLUGINS_PORT?.trim() || process.env.STREAMPLUGINS_PORT || '3847'}`,
    '',
    `TWITCH_CLIENT_ID=${values.TWITCH_CLIENT_ID?.trim() || ''}`,
    `TWITCH_CLIENT_SECRET=${values.TWITCH_CLIENT_SECRET?.trim() || ''}`,
    '',
    `YOUTUBE_CLIENT_ID=${values.YOUTUBE_CLIENT_ID?.trim() || ''}`,
    `YOUTUBE_CLIENT_SECRET=${values.YOUTUBE_CLIENT_SECRET?.trim() || ''}`,
    '',
    `KICK_CLIENT_ID=${values.KICK_CLIENT_ID?.trim() || ''}`,
    `KICK_CLIENT_SECRET=${values.KICK_CLIENT_SECRET?.trim() || ''}`,
    '',
  ];

  fs.writeFileSync(envFile, lines.join('\n'), 'utf8');
  reloadCredentials();
  return envFile;
}
