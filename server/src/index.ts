import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.STREAMPLUGINS_PORT ?? '3847', 10);

app.use(express.json());

// Serve plugin frontend files
const pluginsDir = path.resolve(__dirname, '..', '..', 'plugins');
app.use('/plugins', express.static(pluginsDir));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// TODO: Mount auth routes (server/src/routes/auth.ts)
// TODO: Mount API proxy routes (server/src/routes/api.ts)
// TODO: Mount config routes (server/src/routes/config.ts)
// TODO: Initialize WebSocket manager (server/src/websockets/manager.ts)
// TODO: Initialize Discord forwarder (server/src/discord/forwarder.ts)

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[StreamPlugins] Server running at http://localhost:${PORT}`);
  console.log(`[StreamPlugins] Plugin UIs available at http://localhost:${PORT}/plugins/`);
});
