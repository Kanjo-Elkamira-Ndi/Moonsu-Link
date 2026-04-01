/**
 * LOCAL DEVELOPMENT ONLY — Telegram long-polling
 *
 * In production, Telegram sends updates directly to your webhook URL.
 * This process is only needed locally when you don't have a public HTTPS URL.
 * Use ngrok (https://ngrok.com) as an alternative to expose localhost.
 *
 * Usage:
 *   1. Set TELEGRAM_BOT_TOKEN and API_URL in .env
 *   2. npm run dev:bot
 */

import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:3001';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Telegram bot polling started (local dev mode)');

bot.on('message', async (msg) => {
  if (!msg.text) return;

  try {
    // Forward the update to the API's webhook handler
    const update = {
      message: {
        message_id: msg.message_id,
        from: msg.from,
        chat: msg.chat,
        text: msg.text,
      },
    };

    const res = await fetch(`${API_URL}/webhooks/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    if (!res.ok) {
      console.error('[Bot] API returned error:', res.status);
    }
  } catch (err) {
    console.error('[Bot] Failed to forward message:', err);
  }
});

bot.on('polling_error', (err) => {
  console.error('[Bot] Polling error:', err.message);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});
