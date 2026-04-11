import { Request, Response } from 'express';
import twilio from 'twilio';
import { messageRouter } from '../services/messageRouter.service';
import { env } from '../config/env';

/**
 * Handle an incoming Twilio SMS webhook.
 */
export async function handleSmsWebhook(req: Request, res: Response): Promise<void> {
  // Twilio expects a TwiML response
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');

  const from: string = req.body.From ?? '';
  const text: string = (req.body.Body ?? '').trim();

  if (!from || !text) return;

  await messageRouter({
    channel: 'sms',
    from,
    text,
    name: undefined,
    raw: req.body,
  });
}

/**
 * Send an SMS reply via Twilio.
 * Splits messages > 160 chars into multiple segments.
 */
export async function sendSms(to: string, text: string): Promise<void> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    console.warn('[SMS] Twilio not configured — skipping send to', to);
    return;
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  // Split at 155 chars to leave room for " (1/2)" suffixes if needed
  const chunks = splitSms(text, 155);

  for (let i = 0; i < chunks.length; i++) {
    const body = chunks.length > 1 ? `${chunks[i]} (${i + 1}/${chunks.length})` : chunks[i];
    try {
      await client.messages.create({
        from: env.TWILIO_PHONE_NUMBER,
        to,
        body,
      });
    } catch (err) {
      console.error('[SMS] Send failed:', err);
    }
  }
}

function splitSms(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  const lines = text.split('\n');
  let current = '';
  for (const line of lines) {
    if ((current + '\n' + line).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = line;
    } else {
      current = current ? current + '\n' + line : line;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}
