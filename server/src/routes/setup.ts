import { Router } from 'express';
import {
  authConfigured,
  publisherKeysConfigured,
  savePublisherCredentials,
} from '../config/credentials.js';

export function createSetupRouter(): Router {
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json({
      configured: authConfigured(),
      ready: publisherKeysConfigured(),
    });
  });

  router.post('/credentials', (req, res) => {
    const body = (req.body ?? {}) as Record<string, string>;
    const required = [
      'TWITCH_CLIENT_ID',
      'TWITCH_CLIENT_SECRET',
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET',
      'KICK_CLIENT_ID',
      'KICK_CLIENT_SECRET',
    ];

    const missing = required.filter((key) => !body[key]?.trim());
    if (missing.length > 0) {
      res.status(400).json({
        error: 'All publisher API keys are required before users can connect.',
        missing,
      });
      return;
    }

    const envFile = savePublisherCredentials(body);
    res.json({
      ok: true,
      envFile,
      configured: authConfigured(),
      message: 'Publisher keys saved. Users can now click Connect to log in.',
    });
  });

  return router;
}
