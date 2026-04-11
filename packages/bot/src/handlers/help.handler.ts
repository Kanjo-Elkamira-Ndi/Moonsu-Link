// packages/bot/src/core/handlers/help.handler.ts

import { BotSession } from "../types/shared";
import { getMessage } from "../utils/i18n";
import { sendMessage } from "../channel/telegram.api";

/**
 * Handles the /help command, sending the user a guide on how to use the bot.
 */
export async function handleHelpCommand(
  telegramId: number,
  chatId: number,
  message: any, // Raw Telegram message object
  session: BotSession
) {
  const lang = session.language;

  const helpText = getMessage("help_guide", lang);

  return sendMessage({
    chat_id: chatId,
    text: helpText,
    parse_mode: "Markdown",
  });
}