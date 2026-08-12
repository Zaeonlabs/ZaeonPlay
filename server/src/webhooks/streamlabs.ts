/**
 * Streamlabs Socket / Webhook handler
 *
 * Streamlabs can deliver events via a Socket.IO connection or webhook POST.
 * This module handles both patterns and emits normalized 'donation' events.
 */

import type { Request, Response } from 'express';

interface StreamlabsEvent {
  type: string;
  message?: Array<{
    name?: string;
    amount?: number | string;
    currency?: string;
    message?: string;
    formatted_amount?: string;
  }>;
}

export async function handleStreamlabsWebhook(
  req: Request,
  res: Response,
  emit: (event: string, data: unknown) => void,
) {
  try {
    const body = req.body as StreamlabsEvent;

    if (body.type !== 'donation') {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    const messages = body.message ?? [];
    for (const msg of messages) {
      emit('donation', {
        source: 'streamlabs',
        amount: typeof msg.amount === 'string' ? parseFloat(msg.amount) : (msg.amount ?? 0),
        currency: msg.currency ?? 'USD',
        donor: msg.name || 'Anonymous',
        message: msg.message || '',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Streamlabs Webhook] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
