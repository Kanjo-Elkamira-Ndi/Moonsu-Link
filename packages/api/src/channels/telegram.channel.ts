import { config } from '../config/env';

const BASE_URL = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`;

export const TelegramChannel = {
  async send(chatId: number, text: string): Promise<void> {
    if (!config.TELEGRAM_BOT_TOKEN) {
      console.warn('[Telegram] TELEGRAM_BOT_TOKEN not set — skipping send');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          // parse_mode not set — plain text to ensure SMS parity
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('[Telegram] sendMessage failed:', err);
      }
    } catch (err) {
      console.error('[Telegram] Network error:', err);
    }
  },

  // Register webhook with Telegram
  async setWebhook(webhookUrl: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (data.ok) {
      console.log(`✅ Telegram webhook set: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to set Telegram webhook:', data.description);
    }
  },

  async getMe(): Promise<{ username: string } | null> {
    try {
      const res = await fetch(`${BASE_URL}/getMe`);
      const data = await res.json() as { ok: boolean; result?: { username: string } };
      return data.ok && data.result ? data.result : null;
    } catch {
      return null;
    }
  },
};
