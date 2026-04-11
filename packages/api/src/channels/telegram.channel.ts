// packages/bot/src/channels/telegram/telegram.channel.ts

import { TelegramUpdate } from "../../../bot/src/types/telegram";
import { handleBotUpdate } from "../../../bot/src/bot"; 

/**
 * Handles incoming Telegram webhook updates.
 * This function acts as a thin channel adapter, parsing the Telegram update
 * and delegating the core logic to the central bot handler.
 */
export async function handleTelegramUpdate(req: any, res: any) {
  // Respond quickly to Telegram to avoid timeouts
  res.sendStatus(200);

  try {
    const telegramUpdate: TelegramUpdate = req.body;

    // Log the full update for debugging purposes
    console.log("FULL TELEGRAM UPDATE:", JSON.stringify(telegramUpdate, null, 2));

    // Delegate to the core bot logic, passing the channel type and the raw update
    await handleBotUpdate("telegram", telegramUpdate);

  } catch (err: any) {
    console.error("Telegram update error:", err.message);
   
  }
}

/**
 * Send a message via Telegram Bot API.
 * TODO: Implement using the bot's telegram API functions
 */
export async function sendTelegram(_to: string, _text: string): Promise<void> {
  console.warn('[Telegram] Not yet implemented - SMS broadcasting will be used instead');
}