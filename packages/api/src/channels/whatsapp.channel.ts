import { Request, Response } from 'express';

/**
 * WhatsApp channel — stub for future Meta Business API integration.
 * Awaiting Meta Business verification.
 */

export async function handleWhatsAppVerification(req: Request, res: Response): Promise<void> {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const { env } = await import('../config/env');

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
}

export async function handleWhatsAppWebhook(req: Request, res: Response): Promise<void> {
  res.status(200).json({ ok: true });
  // TODO: parse Meta webhook payload and route through messageRouter
  console.log('[WhatsApp] Webhook received — not yet implemented');
}

export async function sendWhatsApp(_to: string, _text: string): Promise<void> {
  console.warn('[WhatsApp] Not yet implemented');
}
