import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { authConfigured, loadCredentials, reloadCredentials } from './config/credentials.js';
import { getDataDir } from './auth/tokenStore.js';
import { createApiRouter } from './routes/api.js';
import { createAuthRouter } from './routes/auth.js';
import { createConfigRouter } from './routes/config.js';
import { createSetupRouter } from './routes/setup.js';

declare const __dirname: string;

loadCredentials();

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
app.use('/api', createApiRouter());
app.use('/api/config', createConfigRouter());
app.use('/api/setup', createSetupRouter());

const pluginsDir = resolvePluginsDir();
app.use('/plugins', express.static(pluginsDir));

app.get('/health', (_req, res) => {
  reloadCredentials();
  res.json({
    status: 'ok',
    version: '0.1.2',
    pluginsDir,
    dataDir: getDataDir(),
    authConfigured: authConfigured(),
    publisherReady: Object.values(authConfigured()).some(Boolean),
  });
});

app.listen(PORT, '127.0.0.1', () => {
  const credentialsFile = loadCredentials();
  console.log(`[StreamPlugins] Server running at http://localhost:${PORT}`);
  console.log(`[StreamPlugins] Data directory: ${getDataDir()}`);
  if (credentialsFile) {
    console.log(`[StreamPlugins] Loaded credentials from ${credentialsFile}`);
  } else {
    console.log('[StreamPlugins] No publisher keys yet — use Settings dock Publisher Setup form');
  }
  console.log(`[StreamPlugins] Serving plugins from ${pluginsDir}`);
});
