/**
 * Buy Me a Coffee Webhook handler
 *
 * BMC sends POST requests when a supporter buys a coffee or membership.
 */

import type { Request, Response } from 'express';

interface BMCPayload {
  type: string;
  supporter_name?: string;
  supporter_message?: string;
  amount?: number;
  currency?: string;
}

export async function handleBMCWebhook(
  req: Request,
  res: Response,
  emit: (event: string, data: unknown) => void,
) {
  try {
    const body = req.body as BMCPayload;

    if (body.type !== 'payment.completed' && body.type !== 'one-time-payment') {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    emit('donation', {
      source: 'buymeacoffee',
      amount: body.amount ?? 0,
      currency: body.currency ?? 'USD',
      donor: body.supporter_name || 'Anonymous',
      message: body.supporter_message || '',
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[BMC Webhook] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
