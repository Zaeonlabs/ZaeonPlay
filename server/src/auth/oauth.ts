import crypto from 'node:crypto';

export interface PendingAuth {
  platform: string;
  codeVerifier?: string;
  expiresAt: number;
}

const pending = new Map<string, PendingAuth>();

export function createState(platform: string, codeVerifier?: string): string {
  const state = crypto.randomBytes(16).toString('hex');
  pending.set(state, {
    platform,
    codeVerifier,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return state;
}

export function consumeState(state: string): PendingAuth | null {
  const entry = pending.get(state);
  if (!entry) {
    return null;
  }
  pending.delete(state);
  if (entry.expiresAt < Date.now()) {
    return null;
  }
  return entry;
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

export function getRedirectUri(platform: string): string {
  const port = process.env.STREAMPLUGINS_PORT ?? '3847';
  return `http://localhost:${port}/auth/${platform}/callback`;
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function authErrorHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0e0e10; color: #fafafa; padding: 2rem; max-width: 640px; margin: 0 auto; }
    h1 { color: #ef4444; }
    code { background: #27272a; padding: 0.15rem 0.4rem; border-radius: 4px; }
    pre { background: #18181b; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${message}</p>
  <p>You can close this tab and return to OBS.</p>
</body>
</html>`;
}

export function authSuccessHtml(platform: string, displayName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Connected</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0e0e10; color: #fafafa; padding: 2rem; max-width: 640px; margin: 0 auto; text-align: center; }
    h1 { color: #22c55e; }
  </style>
</head>
<body>
  <h1>${platform} connected</h1>
  <p>Signed in as <strong>${displayName}</strong>.</p>
  <p>Close this tab and return to the StreamPlugins Settings dock in OBS.</p>
</body>
</html>`;
}
