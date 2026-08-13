import fs from 'node:fs';
import { getDataDir } from '../auth/tokenStore.js';

export interface AppConfig {
  theme: string;
  goals: unknown[];
  donations: Record<string, unknown>;
  discord: Record<string, unknown>;
  sceneReactions: Record<string, unknown>;
  plugins: Record<string, unknown>;
}

const DEFAULT_CONFIG: AppConfig = {
  theme: 'dark',
  goals: [],
  donations: { enabled: {} },
  discord: {
    chatPlatforms: { twitch: true, youtube: true, kick: true },
    eventTypes: {
      subscriptions: true,
      follows: true,
      raids: true,
      bits: true,
      gifts: true,
    },
  },
  sceneReactions: { rules: [] },
  plugins: {},
};

function configPath(): string {
  return `${getDataDir()}/config.json`;
}

function ensureDataDir(): void {
  fs.mkdirSync(getDataDir(), { recursive: true });
}

export function loadConfig(): AppConfig {
  ensureDataDir();
  const file = configPath();
  if (!fs.existsSync(file)) {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as AppConfig;
  }
  try {
    return { ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), ...JSON.parse(fs.readFileSync(file, 'utf8')) } as AppConfig;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as AppConfig;
  }
}

export function saveConfig(config: AppConfig): void {
  ensureDataDir();
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), 'utf8');
}

export function mergeConfig(partial: Record<string, unknown>): AppConfig {
  const current = loadConfig();
  const next = { ...current, ...partial } as AppConfig;
  saveConfig(next);
  return next;
}
