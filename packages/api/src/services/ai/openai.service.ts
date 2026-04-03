import OpenAI from 'openai';
import { env } from '../../config/env';
import type { Lang } from '../../config/templates';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export type ParsedIntent =
  | { intent: 'SELL'; crop: string; quantity: number; town: string; price: number }
  | { intent: 'FIND'; crop: string; town?: string }
  | { intent: 'PRICE'; crop: string }
  | { intent: 'ALERT'; crop: string; region: string }
  | { intent: 'HELP' }
  | { intent: 'UNKNOWN'; message: string };

/**
 * Use OpenAI to parse a free-form message into a structured intent.
 * Called only when the regex command parser cannot match the input.
 */
export async function parseIntent(text: string, lang: Lang): Promise<ParsedIntent> {
  if (!env.OPENAI_ENABLED) return { intent: 'UNKNOWN', message: text };

  try {
    const oai = getClient();
    const response = await oai.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: 200,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a command parser for MoonsuLink, an agricultural marketplace in Cameroon.
The user is a farmer or buyer messaging via SMS or Telegram in ${lang === 'fr' ? 'French' : 'English'}.
Extract the intent from their free-form message and return ONLY valid JSON.

Possible intents:
- SELL: farmer wants to list produce → { intent, crop, quantity (number kg), town, price (FCFA/kg) }
- FIND: buyer looking for produce → { intent, crop, town? }
- PRICE: asking for market price → { intent, crop }
- ALERT: wants notification when crop available → { intent, crop, region }
- HELP: needs assistance → { intent }
- UNKNOWN: cannot determine intent → { intent, message: "original text" }

Return ONLY raw JSON, no explanation, no markdown.`,
        },
        { role: 'user', content: text },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    return JSON.parse(raw) as ParsedIntent;
  } catch (err) {
    console.error('[AI] parseIntent error:', err);
    return { intent: 'UNKNOWN', message: text };
  }
}

/**
 * Generate a short AI-written price insight summary (1-2 sentences).
 * e.g. "Tomato prices are elevated in Douala this week."
 */
export async function generatePriceInsight(
  crop: string,
  rows: Array<{ market: string; min: number; max: number }>,
  lang: Lang,
): Promise<string | null> {
  if (!env.OPENAI_ENABLED || rows.length === 0) return null;

  try {
    const oai = getClient();
    const data = rows.map((r) => `${r.market}: ${r.min}–${r.max} FCFA/kg`).join(', ');
    const response = await oai.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: 80,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You write very short market insights for Cameroonian farmers.
Max 1-2 sentences. Plain text, no formatting. Language: ${lang === 'fr' ? 'French' : 'English'}.
SMS-safe: no special characters.`,
        },
        {
          role: 'user',
          content: `Crop: ${crop}. Today's prices: ${data}. Give a brief market insight.`,
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error('[AI] generatePriceInsight error:', err);
    return null;
  }
}

/**
 * Generate a smart reply for the HELP command — context-aware, conversational.
 */
export async function generateSmartHelp(
  userContext: string,
  lang: Lang,
): Promise<string | null> {
  if (!env.OPENAI_ENABLED) return null;

  try {
    const oai = getClient();
    const response = await oai.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: 120,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You help farmers and buyers use MoonsuLink, an SMS/Telegram marketplace in Cameroon.
Language: ${lang === 'fr' ? 'French' : 'English'}. Max 3 sentences. Plain SMS text only.
If the user seems to be a farmer, suggest SELL and PRICE. If a buyer, suggest FIND and ALERT.`,
        },
        { role: 'user', content: userContext || 'I need help' },
      ],
    });

    return response.choices[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error('[AI] generateSmartHelp error:', err);
    return null;
  }
}
