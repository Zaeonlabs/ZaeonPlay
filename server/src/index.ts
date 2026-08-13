import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getDataDir } from './auth/tokenStore.js';
import { createAuthRouter } from './routes/auth.js';
import { createConfigRouter } from './routes/config.js';

declare const __dirname: string;

dotenv.config({ path: path.join(getDataDir(), '.env') });

function resolvePluginsDir(): string {
  const envDir = process.env.STREAMPLUGINS_PLUGINS_DIR;
  if (envDir && existsSync(envDir)) {
    return envDir;
  }

  const packaged = path.resolve(path.dirname(process.execPath), '..', 'plugins');
  if (existsSync(packaged)) {
    return packaged;
  }

  const devPath = path.resolve(__dirname, '..', '..', 'plugins');
  return devPath;
}

const app = express();
const PORT = parseInt(process.env.STREAMPLUGINS_PORT ?? '3847', 10);

app.use(express.json());

app.use('/auth', createAuthRouter());
app.use('/api/config', createConfigRouter());

const pluginsDir = resolvePluginsDir();
app.use('/plugins', express.static(pluginsDir));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    pluginsDir,
    dataDir: getDataDir(),
    authConfigured: {
      twitch: Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET),
      youtube: Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET),
      kick: Boolean(process.env.KICK_CLIENT_ID && process.env.KICK_CLIENT_SECRET),
    },
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[StreamPlugins] Server running at http://localhost:${PORT}`);
  console.log(`[StreamPlugins] Data directory: ${getDataDir()}`);
  console.log(`[StreamPlugins] Serving plugins from ${pluginsDir}`);
});
