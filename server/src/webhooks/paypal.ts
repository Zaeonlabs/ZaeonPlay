/**
 * PayPal IPN / Webhook handler
 *
 * PayPal sends POST requests when a payment is completed.
 * We validate the webhook event and emit a 'donation' event to
 * all connected WebSocket clients.
 */

import type { Request, Response } from 'express';

interface PayPalEvent {
  event_type: string;
  resource: {
    amount?: { total?: string; currency_code?: string };
    payer?: { name?: { given_name?: string; surname?: string } };
    custom_id?: string;
    note_to_payer?: string;
  };
}

export async function handlePayPalWebhook(
  req: Request,
  res: Response,
  emit: (event: string, data: unknown) => void,
) {
  try {
    const body = req.body as PayPalEvent;

    if (body.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    const resource = body.resource ?? {};
    const amount = parseFloat(resource.amount?.total ?? '0');
    const currency = resource.amount?.currency_code ?? 'USD';
    const name = resource.payer?.name;
    const donor = name ? `${name.given_name ?? ''} ${name.surname ?? ''}`.trim() : 'Anonymous';

    emit('donation', {
      source: 'paypal',
      amount,
      currency,
      donor,
      message: resource.note_to_payer ?? '',
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[PayPal Webhook] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
