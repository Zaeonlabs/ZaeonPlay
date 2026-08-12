/**
 * Webhook routes for incoming payment notifications.
 *
 * Mounted at /webhooks/* on the Express app.
 * Each handler validates the incoming payload and emits a
 * normalized 'donation' event to all WebSocket clients.
 */

import { Router } from 'express';
import { handlePayPalWebhook } from '../webhooks/paypal.js';
import { handleStripeWebhook } from '../webhooks/stripe.js';
import { handleKofiWebhook } from '../webhooks/kofi.js';
import { handleBMCWebhook } from '../webhooks/buymeacoffee.js';
import { handleStreamlabsWebhook } from '../webhooks/streamlabs.js';

export function createWebhookRouter(
  emit: (event: string, data: unknown) => void,
): Router {
  const router = Router();

  router.post('/paypal', (req, res) => handlePayPalWebhook(req, res, emit));

  router.post('/stripe', (req, res) => handleStripeWebhook(req, res, emit));

  router.post('/kofi', (req, res) => handleKofiWebhook(req, res, emit));

  router.post('/buymeacoffee', (req, res) => handleBMCWebhook(req, res, emit));

  router.post('/streamlabs', (req, res) => handleStreamlabsWebhook(req, res, emit));

  return router;
}
