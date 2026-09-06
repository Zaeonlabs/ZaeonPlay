import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import QRCode from 'qrcode';
import { Server as SocketIOServer } from 'socket.io';
import { authConfigured, loadCredentials, reloadCredentials } from './config/credentials.js';
import { getDataDir } from './auth/tokenStore.js';
import { createApiRouter } from './routes/api.js';
import { createAuthRouter } from './routes/auth.js';
import { createConfigRouter } from './routes/config.js';
import { createSetupRouter } from './routes/setup.js';

declare const __dirname: string;

loadCredentials();

export function getLanIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;
    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

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

function resolvePublicDir(): string {
  const packaged = path.resolve(path.dirname(process.execPath), '..', 'public');
  if (existsSync(packaged)) {
    return packaged;
  }
  const relative = path.resolve(__dirname, '..', 'public');
  if (existsSync(relative)) {
    return relative;
  }
  return path.resolve(__dirname, '..', '..', 'public');
}

const app = express();
const httpServer = createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('[StreamPlugins Socket.io] Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('[StreamPlugins Socket.io] Client disconnected:', socket.id);
  });
});

const PORT = parseInt(process.env.STREAMPLUGINS_PORT ?? '3847', 10);
const HOST = process.env.STREAMPLUGINS_HOST ?? '0.0.0.0';

app.use(express.json());

app.use('/auth', createAuthRouter());
app.use('/api', createApiRouter());
app.use('/api/config', createConfigRouter());
app.use('/api/setup', createSetupRouter());

const pluginsDir = resolvePluginsDir();
app.use('/plugins', express.static(pluginsDir));

const publicDir = resolvePublicDir();
app.use('/public', express.static(publicDir));

// Root route redirect to Central Dashboard
app.get('/', (_req, res) => {
  res.redirect('/dashboard');
});

// Friendly shortcut redirects
app.get('/settings', (_req, res) => res.redirect('/plugins/settings/'));
app.get('/metrics', (_req, res) => res.redirect('/plugins/metrics-widget/'));
app.get('/title', (_req, res) => res.redirect('/plugins/title-updater/'));
app.get('/alerts', (_req, res) => res.redirect('/plugins/alerts/'));
app.get('/chat', (_req, res) => res.redirect('/plugins/chat-widget/'));
app.get('/discord', (_req, res) => res.redirect('/plugins/discord-logger/settings.html'));

// Route /dashboard serving server/public/dashboard/index.html
app.get('/dashboard', (_req, res) => {
  const dashboardPath = path.join(publicDir, 'dashboard', 'index.html');
  if (existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    res.status(404).send('Dashboard page not found');
  }
});

// Route /api/network-info for LAN IP & QR Code data
app.get('/api/network-info', async (_req, res) => {
  const lanIP = getLanIP();
  const mobileDashboardPort = 3000;
  const url = `http://${lanIP}:${mobileDashboardPort}/dashboard`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    res.json({
      ip: lanIP,
      port: mobileDashboardPort,
      url,
      qrCodeDataUrl,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/health', (_req, res) => {
  reloadCredentials();
  res.json({
    status: 'ok',
    version: '0.1.2',
    pluginsDir,
    dataDir: getDataDir(),
    authConfigured: authConfigured(),
    publisherReady: Object.values(authConfigured()).some(Boolean),
    lanIP: getLanIP(),
  });
});

httpServer.listen(PORT, HOST, () => {
  const credentialsFile = loadCredentials();
  const lanIP = getLanIP();
  console.log(`[StreamPlugins] Server running at http://localhost:${PORT}`);
  console.log(`[StreamPlugins] Mobile Dashboard available at http://${lanIP}:3000/dashboard`);
  console.log(`[StreamPlugins] Data directory: ${getDataDir()}`);
  if (credentialsFile) {
    console.log(`[StreamPlugins] Loaded credentials from ${credentialsFile}`);
  } else {
    console.log('[StreamPlugins] No publisher keys yet — use Settings dock Publisher Setup form');
  }
  console.log(`[StreamPlugins] Serving plugins from ${pluginsDir}`);
});

