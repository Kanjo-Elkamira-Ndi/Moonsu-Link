/**
 * Telegram long-polling bot.
 * Polls the Telegram Bot API and forwards each update to the API webhook endpoint.
 * Used in development. In production, set up a real Telegram webhook instead.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const API_URL = process.env.VITE_API_URL ?? 'http://localhost:3001';
const WEBHOOK_URL = `${API_URL}/webhook/telegram`;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

let offset = 0;

async function poll(): Promise<void> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?timeout=30&offset=${offset}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[Bot] getUpdates failed:', res.status, await res.text());
      await sleep(5000);
      return;
    }

    const data = (await res.json()) as { ok: boolean; result: any[] };
    if (!data.ok || !data.result.length) return;

    for (const update of data.result) {
      offset = update.update_id + 1;
      await forwardUpdate(update);
    }
  } catch (err) {
    console.error('[Bot] Poll error:', err);
    await sleep(5000);
  }
}

async function forwardUpdate(update: unknown): Promise<void> {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
  } catch (err) {
    console.error('[Bot] Forward error:', err);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`🤖 MoonsuLink bot polling... forwarding to ${WEBHOOK_URL}`);
  while (true) {
    await poll();
  }
}

main();
