/**
 * Stripe Webhook handler
 *
 * Stripe sends POST requests with a signature header for validation.
 * On checkout.session.completed or payment_intent.succeeded, we emit
 * a 'donation' event to all connected WebSocket clients.
 */

import type { Request, Response } from 'express';

export async function handleStripeWebhook(
  req: Request,
  res: Response,
  emit: (event: string, data: unknown) => void,
  _webhookSecret?: string,
) {
  try {
    // TODO: Validate Stripe-Signature header using the webhook secret
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    const body = req.body;
    const eventType: string = body.type ?? '';

    const DONATION_EVENTS = [
      'checkout.session.completed',
      'payment_intent.succeeded',
    ];

    if (!DONATION_EVENTS.includes(eventType)) {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    const obj = body.data?.object ?? {};
    const amount = (obj.amount_total ?? obj.amount ?? 0) / 100;
    const currency = (obj.currency ?? 'usd').toUpperCase();
    const donor = obj.customer_details?.name ?? obj.metadata?.donor ?? 'Anonymous';
    const message = obj.metadata?.message ?? '';

    emit('donation', {
      source: 'stripe',
      amount,
      currency,
      donor,
      message,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
