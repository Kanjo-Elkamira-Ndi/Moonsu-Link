import { pool } from '../db/pool';
import { commandHandler } from './commandHandler.service';
import { sendTelegram } from '../channels/telegram.channel';
import { sendSms } from '../channels/sms.channel';
import { sendWhatsApp } from '../channels/whatsapp.channel';
import type { Lang } from '../config/templates';

export type Channel = 'telegram' | 'sms' | 'whatsapp';

export interface IncomingMessage {
  channel: Channel;
  from: string;
  text: string;
  name?: string;
  raw: unknown;
  meta?: Record<string, any>;
}

/**
 * Central message router:
 * 1. Upsert the user (register on first message)
 * 2. Detect language
 * 3. Dispatch to command handler
 * 4. Send reply back through the originating channel
 */
export async function messageRouter(msg: IncomingMessage): Promise<void> {
  try {
    const { user, lang } = await upsertUser(msg);
    const reply = await commandHandler(msg.text, user.id, lang);
    await send(msg.channel, msg.from, reply, msg.meta);
  } catch (err) {
    console.error('[MessageRouter] Error:', err);
    // Best-effort error reply
    try {
      await send(msg.channel, msg.from, 'Error. Please try again. / Erreur. Reessayez.');
    } catch (_) {}
  }
}

async function upsertUser(msg: IncomingMessage) {
  const lang = detectLang(msg.text);
  const result = await pool.query(
    `INSERT INTO users (phone, name, channel, lang)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (phone) DO UPDATE
       SET channel = EXCLUDED.channel,
           name    = COALESCE(EXCLUDED.name, users.name)
     RETURNING *`,
    [msg.from, msg.name ?? null, msg.channel, lang],
  );
  return { user: result.rows[0], lang };
}

/**
 * Detect language from common French trigger words.
 * Defaults to English.
 */
export function detectLang(text: string): Lang {
  const fr = /^(vendre|chercher|prix|alerte|interesse|meslistes|annuler|aide)\b/i;
  return fr.test(text.trim()) ? 'fr' : 'en';
}

async function send(channel: Channel, to: string, text: string, meta?: Record<string, any>): Promise<void> {
  switch (channel) {
    case 'telegram':  return sendTelegram(to, text);
    case 'sms':       return sendSms(to, text);
    case 'whatsapp':  return sendWhatsApp(to, text, meta);
  }
}