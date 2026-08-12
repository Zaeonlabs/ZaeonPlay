/**
 * Ko-fi Webhook handler
 *
 * Ko-fi POSTs a form-encoded `data` field containing JSON.
 * Events: Donation, Subscription, Shop Order.
 */

import type { Request, Response } from 'express';

interface KofiData {
  type: string;
  from_name: string;
  message: string;
  amount: string;
  currency: string;
  verification_token: string;
}

export async function handleKofiWebhook(
  req: Request,
  res: Response,
  emit: (event: string, data: unknown) => void,
  _verificationToken?: string,
) {
  try {
    const raw = req.body?.data;
    if (!raw) { res.status(400).json({ error: 'Missing data field' }); return; }

    const payload: KofiData = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // TODO: Validate verification_token against stored config
    // if (verificationToken && payload.verification_token !== verificationToken) { ... }

    if (payload.type !== 'Donation' && payload.type !== 'Subscription') {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    emit('donation', {
      source: 'kofi',
      amount: parseFloat(payload.amount) || 0,
      currency: payload.currency || 'USD',
      donor: payload.from_name || 'Anonymous',
      message: payload.message || '',
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Ko-fi Webhook] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
