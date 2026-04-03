import { Request, Response } from 'express';
import { messageRouter } from '../services/messageRouter.service';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number };
    text?: string;
    date: number;
  };
}

/**
 * Handle an incoming Telegram webhook update.
 * Normalizes it and passes to the shared message router.
 */
export async function handleTelegramUpdate(req: Request, res: Response): Promise<void> {
  // Always ACK Telegram immediately
  res.status(200).json({ ok: true });

  const update = req.body as TelegramUpdate;
  const msg = update.message;

  if (!msg?.text) return;

  await messageRouter({
    channel: 'telegram',
    from: String(msg.from.id),
    text: msg.text.trim(),
    name: msg.from.first_name,
    raw: update,
  });
}

/**
 * Send a reply back via Telegram Bot API.
 */
export async function sendTelegram(chatId: string, text: string): Promise<void> {
  const { env } = await import('../config/env');
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[Telegram] sendMessage failed:', body);
  }
}
