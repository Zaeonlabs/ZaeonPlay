import { Router } from 'express';
import { getCombinedMetrics } from '../services/metrics.js';

export function createApiRouter(): Router {
  const router = Router();

  router.get('/metrics', async (_req, res) => {
    try {
      const metrics = await getCombinedMetrics();
      res.json(metrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load metrics';
      res.status(500).json({ error: message });
    }
  });

  router.post('/title/update', async (req, res) => {
    // Uses the same OAuth tokens saved by Settings → Connect
    res.json({
      ok: true,
      message: 'Title update queued (platform writers coming soon)',
      request: req.body ?? {},
    });
  });

  router.get('/categories/:platform', (req, res) => {
    res.json([]);
  });

  router.get('/obs/status', (_req, res) => {
    res.json({ connected: false });
  });

  router.post('/obs/connect', (_req, res) => {
    res.json({ ok: false, message: 'OBS WebSocket connect not implemented yet' });
  });

  router.post('/obs/test-rule', (_req, res) => {
    res.json({ ok: true });
  });

  return router;
}
