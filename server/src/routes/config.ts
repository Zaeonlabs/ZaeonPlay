import { Router } from 'express';
import { loadConfig, mergeConfig } from '../config/store.js';

export function createConfigRouter(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(loadConfig());
  });

  router.put('/', (req, res) => {
    const partial = req.body ?? {};
    res.json(mergeConfig(partial));
  });

  return router;
}
