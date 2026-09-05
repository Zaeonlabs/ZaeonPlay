import os from 'node:os';
import QRCode from 'qrcode';

// Check if running inside Electron runtime
let electronApp: any;
let BrowserWindow: any;
try {
  const electron = await import('electron');
  electronApp = electron.app;
  BrowserWindow = electron.BrowserWindow;
} catch (_) {
  // Graceful fallback when invoked via plain Node CLI
}

/**
 * Detect the first non-internal IPv4 address from os.networkInterfaces()
 */
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

/**
 * Generate QR code data URL for mobile dashboard URL
 */
export async function getMobileDashboardInfo() {
  const ip = getLanIP();
  const port = 3000;
  const url = `http://${ip}:${port}/dashboard`;
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: 200,
    margin: 2,
    color: {
      dark: '#0e0e10',
      light: '#ffffff',
    },
  });

  return { ip, port, url, qrCodeDataUrl };
}

/**
 * Build HTML content for Electron launcher dashboard window
 */
export async function generateDashboardHTML(): Promise<string> {
  const { url, qrCodeDataUrl } = await getMobileDashboardInfo();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreamPlugins Launcher — Dashboard</title>
  <style>
    :root {
      --sp-bg-primary: #0e0e10;
      --sp-bg-secondary: #18181b;
      --sp-bg-tertiary: #27272a;
      --sp-accent: #9146FF;
      --sp-text-primary: #fafafa;
      --sp-text-secondary: #a1a1aa;
      --sp-text-muted: #71717a;
      --sp-border: #2e2e32;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--sp-bg-primary);
      color: var(--sp-text-primary);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--sp-text-primary);
    }
    .header p {
      font-size: 0.875rem;
      color: var(--sp-text-secondary);
      margin-top: 4px;
    }
    .qr-card {
      background: var(--sp-bg-secondary);
      border: 1px solid var(--sp-border);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .qr-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--sp-accent);
    }
    .qr-img {
      width: 180px;
      height: 180px;
      border-radius: 8px;
      background: #fff;
      padding: 8px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .url-text {
      font-family: monospace;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #53FC18;
      background: var(--sp-bg-tertiary);
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--sp-border);
      word-break: break-all;
      margin-bottom: 12px;
      user-select: all;
    }
    .qr-note {
      font-size: 0.8125rem;
      color: var(--sp-text-muted);
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>StreamPlugins Launcher</h1>
    <p>Mobile Chat Dashboard Access</p>
  </div>

  <div class="qr-card">
    <div class="qr-title">Mobile Dashboard</div>
    <div class="url-text">${url}</div>
    <img class="qr-img" src="${qrCodeDataUrl}" alt="Mobile Dashboard QR Code" />
    <div class="qr-note">Scan with your phone on the same WiFi network.</div>
  </div>
</body>
</html>`;
}

export async function createDashboardWindow() {
  if (!BrowserWindow) {
    console.log('[StreamPlugins Tray] Electron not detected. Printing mobile network info:');
    const info = await getMobileDashboardInfo();
    console.log(`[StreamPlugins Tray] Local URL: ${info.url}`);
    console.log('[StreamPlugins Tray] Scan with your phone on the same WiFi network.');
    return;
  }

  const win = new BrowserWindow({
    width: 440,
    height: 520,
    title: 'StreamPlugins Launcher',
    backgroundColor: '#0e0e10',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const html = await generateDashboardHTML();
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

if (electronApp) {
  electronApp.whenReady().then(createDashboardWindow);
  electronApp.on('window-all-closed', () => {
    if (process.platform !== 'darwin') electronApp.quit();
  });
} else {
  createDashboardWindow();
}

