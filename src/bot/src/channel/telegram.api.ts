

import { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove, ForceReply } from "../types/telegram";

const TG_BASE = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

interface SendMessagePayload {
  chat_id: number;
  method?: String,
  payload?: any,
  text: string;
  parse_mode?: string;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  // Add other sendMessage parameters as needed
}

interface AnswerCallbackQueryPayload {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

// Add other Telegram API method payloads as needed

/**
 * Generic function to make POST requests to the Telegram Bot API.
 * @param method The Telegram API method (e.g., 'sendMessage', 'answerCallbackQuery' ).
 * @param body The payload for the API method.
 * @returns The response from the Telegram API.
 */
export async function tgPost(method: string, body: object): Promise<Response | undefined> {
  try {
    const res = await fetch(`${TG_BASE()}/${method}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error(`Telegram API error [${method}]:`, res.status, errorData);
      return undefined;
    }

    return res;
  } catch (err: any) {
    console.error(`Telegram API error [${method}]:`, err.message);
    return undefined;
  }
}

/**
 * Sends a text message to a Telegram chat.
 */
export async function sendMessage(payload: SendMessagePayload): Promise<Response | undefined> {
  return tgPost('sendMessage', payload);
}

/**
 * Answers a callback query from an inline keyboard button press.
 */
export async function answerCallbackQuery(payload: AnswerCallbackQueryPayload): Promise<Response | undefined> {
  return tgPost('answerCallbackQuery', payload);
}

// Add more specific Telegram API functions as needed (e.g., sendPhoto, sendVoice, etc.)