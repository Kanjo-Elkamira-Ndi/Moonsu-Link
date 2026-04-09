// packages/api/src/channels/whatsapp.channel.ts

import { Request, Response } from 'express';
import { UnipileClient } from 'unipile-node-sdk';
import { messageRouter } from '../services/messageRouter.service';
import { env } from '../config/env';

function getClient(): UnipileClient {
  if (!env.UNIPILE_DSN || !env.UNIPILE_API_KEY) {
    throw new Error('UNIPILE_DSN and UNIPILE_API_KEY must be set');
  }
  return new UnipileClient(env.UNIPILE_DSN, env.UNIPILE_API_KEY);
}

/**
 * Receive incoming WhatsApp messages from Unipile webhook.
 * Payload shape: { event, account_id, account_type, chat_id, message, sender }
 */
export async function handleWhatsAppWebhook(req: Request, res: Response): Promise<void> {
  // Always ACK Unipile immediately
  res.status(200).json({ ok: true });

  const body = req.body;

  // Only handle incoming WhatsApp messages, ignore reactions/reads/etc.
  if (body.account_type !== 'WHATSAPP') return;
  if (body.event !== 'message_received') return;

  const text: string = (body.message ?? '').trim();
  const chatId: string = body.chat_id;
  const senderName: string = body.sender?.attendee_name ?? '';

  // Derive a stable phone identifier from sender info
  // Unipile's WhatsApp attendee_provider_id is the phone number in most cases
  const phone: string = body.sender?.attendee_provider_id ?? chatId;

  if (!text || !chatId) return;

  // Skip our own messages echoed back (Unipile sends both sent and received)
  if (body.account_info?.user_id === body.sender?.attendee_provider_id) return;

  await messageRouter({
    channel: 'whatsapp',
    from: phone,
    text,
    name: senderName || undefined,
    raw: body,
    // Pass chat_id through so sendWhatsApp can use it for replies
    ...(chatId && { meta: { chat_id: chatId } }),
  });
}

/**
 * Send a WhatsApp message via Unipile.
 * Uses chat_id when available (preferred), falls back to phone number.
 */
export async function sendWhatsApp(
  to: string,
  text: string,
  meta?: { chat_id?: string },
): Promise<void> {
  if (!env.UNIPILE_ENABLED) {
    console.warn('[WhatsApp] Unipile not enabled — skipping send to', to);
    return;
  }

  try {
    const client = getClient();

    if (meta?.chat_id) {
      // Replying to an existing chat — most reliable path
      await client.messaging.sendMessage({
        chat_id: meta.chat_id,
        text,
      });
    } else {
      // Starting a new conversation (e.g. alert broadcast)
      // attendees_ids accepts the WhatsApp phone number in international format
      await client.messaging.startNewChat({
        account_id: env.UNIPILE_ACCOUNT_ID!,
        text,
        attendees_ids: [to],
      });
    }
  } catch (err) {
    console.error('[WhatsApp] Send failed:', err);
  }
}