import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type Platform = 'twitch' | 'youtube' | 'kick';

export interface StoredUser {
  id?: string;
  login?: string;
  displayName?: string;
  channelId?: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  user?: StoredUser;
}

type TokenFile = Partial<Record<Platform, StoredTokens>>;

export function getDataDir(): string {
  if (process.env.STREAMPLUGINS_DATA_DIR) {
    return process.env.STREAMPLUGINS_DATA_DIR;
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'StreamPlugins',
    );
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'StreamPlugins');
  }
  return path.join(os.homedir(), '.config', 'StreamPlugins');
}

function tokensPath(): string {
  return path.join(getDataDir(), 'tokens.json');
}

function ensureDataDir(): void {
  fs.mkdirSync(getDataDir(), { recursive: true });
}

function readTokenFile(): TokenFile {
  ensureDataDir();
  const file = tokensPath();
  if (!fs.existsSync(file)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as TokenFile;
  } catch {
    return {};
  }
}

function writeTokenFile(data: TokenFile): void {
  ensureDataDir();
  fs.writeFileSync(tokensPath(), JSON.stringify(data, null, 2), 'utf8');
}

export function getTokens(platform: Platform): StoredTokens | null {
  return readTokenFile()[platform] ?? null;
}

export function saveTokens(platform: Platform, tokens: StoredTokens): void {
  const data = readTokenFile();
  data[platform] = tokens;
  writeTokenFile(data);
}

export function deleteTokens(platform: Platform): void {
  const data = readTokenFile();
  delete data[platform];
  writeTokenFile(data);
}

export function getAllTokens(): TokenFile {
  return readTokenFile();
}
