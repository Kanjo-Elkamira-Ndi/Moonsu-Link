import { Router, Request, Response } from 'express';
import { MessageRouter } from '../services/messageRouter.service';

export const webhookRouter = Router();

// ── Telegram ─────────────────────────────────────────────────────────────────
// Register: POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>/webhooks/telegram
webhookRouter.post('/telegram', async (req: Request, res: Response) => {
  // Acknowledge immediately — Telegram expects 200 fast
  res.sendStatus(200);

  const update = req.body;
  if (!update?.message?.text) return;

  const { message } = update;
  await MessageRouter.handle({
    channel: 'telegram',
    from: message.from.id.toString(),
    phone: message.from.username ? `tg:${message.from.id}` : `tg:${message.from.id}`,
    text: message.text,
    telegramChatId: message.chat.id,
    telegramMessageId: message.message_id,
    displayName: [message.from.first_name, message.from.last_name].filter(Boolean).join(' '),
  });
});

// ── Twilio SMS ────────────────────────────────────────────────────────────────
// Configure in Twilio console: POST <YOUR_URL>/webhooks/sms
webhookRouter.post('/sms', async (req: Request, res: Response) => {
  const { From, Body } = req.body;

  // Twilio expects TwiML response
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>'); // We send replies via REST API, not TwiML

  if (!From || !Body) return;

  await MessageRouter.handle({
    channel: 'sms',
    from: From,
    phone: From,
    text: Body.trim(),
    displayName: undefined,
  });
});

// ── WhatsApp (future — Meta Cloud API) ───────────────────────────────────────
// Webhook verification challenge
webhookRouter.get('/whatsapp', (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];
  if (token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

webhookRouter.post('/whatsapp', async (req: Request, res: Response) => {
  res.sendStatus(200);
  // TODO: Parse Meta Cloud API payload and call MessageRouter.handle()
  // Structure: req.body.entry[0].changes[0].value.messages[0]
  console.log('[WhatsApp webhook] Received — handler not yet implemented');
});
