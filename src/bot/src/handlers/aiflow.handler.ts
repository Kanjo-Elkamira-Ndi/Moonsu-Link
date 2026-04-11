import { sendMessage } from "../channel/telegram.api";
import { setStep, clearStep } from "../utils/session";
import { BotSession, BotUpdate } from "../types/shared";
import { getMessage } from "../utils/i18n";
import { askAI } from "../api";

export async function startAIFlow(
  chatId: number,
  telegramId: number,
  session: BotSession
) {

  setStep(telegramId, 'ai_asking');
  return sendMessage({
    chat_id: chatId,
    text: getMessage("ask_ai", session.language),
    reply_markup: { remove_keyboard: true }
  });
}

export async function handleAIFlowStep(
  telegramId: number,
  chatId: number,
  update: BotUpdate,
  session: BotSession
) {
  const text = update.telegramUpdate?.message?.text || update.telegramUpdate?.message?.voice?.text || "";

  if (session.currentStep === 'ai_asking') {
    if (!text) {
      return sendMessage({
        chat_id: chatId,
        text: getMessage("ask_ai", session.language),
      });
    }

    const history = session.stepData.aiHistory || [];
    const answer = await askAI(text, session.language, history);

    const newHistory = [
      ...history,
      { role: 'user', content: text },
      { role: 'assistant', content: answer }
    ].slice(-10);

    setStep(telegramId, 'ai_asking', { ...session.stepData, aiHistory: newHistory });

    return sendMessage({ chat_id: chatId, text: `🤖 ${answer}` });
  }
}
