import { Router } from 'express';
import {
  kickCallback,
  kickDisconnect,
  kickLogin,
  kickStatus,
} from '../auth/kick.js';
import {
  twitchCallback,
  twitchDisconnect,
  twitchLogin,
  twitchStatus,
} from '../auth/twitch.js';
import {
  youtubeCallback,
  youtubeDisconnect,
  youtubeLogin,
  youtubeStatus,
} from '../auth/youtube.js';

type Platform = 'twitch' | 'youtube' | 'kick';

const PLATFORMS = new Set<Platform>(['twitch', 'youtube', 'kick']);

function isPlatform(value: string): value is Platform {
  return PLATFORMS.has(value as Platform);
}

export function createAuthRouter(): Router {
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json({
      twitch: twitchStatus(),
      youtube: youtubeStatus(),
      kick: kickStatus(),
    });
  });

  router.get('/:platform/login', (req, res) => {
    const platform = String(req.params.platform);
    if (!isPlatform(platform)) {
      res.status(404).json({ error: 'Unknown platform' });
      return;
    }
    if (platform === 'twitch') twitchLogin(req, res);
    else if (platform === 'youtube') youtubeLogin(req, res);
    else kickLogin(req, res);
  });

  router.get('/:platform/callback', async (req, res) => {
    const platform = String(req.params.platform);
    if (!isPlatform(platform)) {
      res.status(404).json({ error: 'Unknown platform' });
      return;
    }
    if (platform === 'twitch') await twitchCallback(req, res);
    else if (platform === 'youtube') await youtubeCallback(req, res);
    else await kickCallback(req, res);
  });

  router.post('/:platform/disconnect', (req, res) => {
    const platform = String(req.params.platform);
    if (!isPlatform(platform)) {
      res.status(404).json({ error: 'Unknown platform' });
      return;
    }
    if (platform === 'twitch') twitchDisconnect(req, res);
    else if (platform === 'youtube') youtubeDisconnect(req, res);
    else kickDisconnect(req, res);
  });

  return router;
}
