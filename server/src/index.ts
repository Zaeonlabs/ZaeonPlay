import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';

declare const __dirname: string;

function resolvePluginsDir(): string {
  const envDir = process.env.STREAMPLUGINS_PLUGINS_DIR;
  if (envDir && existsSync(envDir)) {
    return envDir;
  }

  // Installed layout: .../data/server/streamplugins-server.exe + .../data/plugins/
  const packaged = path.resolve(path.dirname(process.execPath), '..', 'plugins');
  if (existsSync(packaged)) {
    return packaged;
  }

  // Dev / npm run dev (server/dist or server/src)
  const devPath = path.resolve(__dirname, '..', '..', 'plugins');
  return devPath;
}

const app = express();
const PORT = parseInt(process.env.STREAMPLUGINS_PORT ?? '3847', 10);

app.use(express.json());

const pluginsDir = resolvePluginsDir();
app.use('/plugins', express.static(pluginsDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', pluginsDir });
});

// TODO: Mount auth routes (server/src/routes/auth.ts)
// TODO: Mount API proxy routes (server/src/routes/api.ts)
// TODO: Mount config routes (server/src/routes/config.ts)
// TODO: Initialize WebSocket manager (server/src/websockets/manager.ts)
// TODO: Initialize Discord forwarder (server/src/discord/forwarder.ts)

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[StreamPlugins] Server running at http://localhost:${PORT}`);
  console.log(`[StreamPlugins] Serving plugins from ${pluginsDir}`);
  console.log(`[StreamPlugins] Plugin UIs available at http://localhost:${PORT}/plugins/`);
});
