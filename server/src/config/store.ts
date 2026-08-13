import fs from 'node:fs';
import { getDataDir } from '../auth/tokenStore.js';

export interface AppConfig {
  theme: string;
}

const DEFAULT_CONFIG: AppConfig = {
  theme: 'dark',
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
    return { ...DEFAULT_CONFIG };
  }
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: AppConfig): void {
  ensureDataDir();
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), 'utf8');
}

export function mergeConfig(partial: Partial<AppConfig>): AppConfig {
  const next = { ...loadConfig(), ...partial };
  saveConfig(next);
  return next;
}
