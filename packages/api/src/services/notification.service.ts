import type { User } from './users.service';
import type { IncomingMessage } from './messageRouter.service';
import { renderTemplate } from '../config/templates';
import { TelegramChannel } from '../channels/telegram.channel';
import { SmsChannel } from '../channels/sms.channel';

export const NotificationService = {
  // Send a templated message to a user
  async send(
    user: User,
    templateKey: string,
    data: Record<string, unknown> = {},
    incomingMsg?: IncomingMessage
  ) {
    const text = renderTemplate(templateKey, user.language, data);
    await this.dispatch(user, text, incomingMsg);
  },

  // Send a raw string (used for onboarding before language is set)
  async sendRaw(incomingMsg: IncomingMessage, _lang: string, text: string) {
    switch (incomingMsg.channel) {
      case 'telegram':
        if (incomingMsg.telegramChatId) {
          await TelegramChannel.send(incomingMsg.telegramChatId, text);
        }
        break;
      case 'sms':
        await SmsChannel.send(incomingMsg.phone, text);
        break;
      case 'whatsapp':
        // TODO: implement when WhatsApp is set up
        console.log('[WhatsApp] sendRaw not implemented:', text);
        break;
    }
  },

  async dispatch(user: User, text: string, incomingMsg?: IncomingMessage) {
    const channel = incomingMsg?.channel ?? user.channel;

    switch (channel) {
      case 'telegram':
        const chatId = incomingMsg?.telegramChatId ?? user.telegram_id;
        if (chatId) {
          await TelegramChannel.send(chatId, text);
        } else {
          console.warn(`[Notification] No Telegram chat ID for user ${user.id}`);
        }
        break;

      case 'sms':
        await SmsChannel.send(user.phone, text);
        break;

      case 'whatsapp':
        // TODO: implement when Meta Business verification is done
        console.log(`[WhatsApp] Would send to ${user.phone}:`, text);
        break;

      default:
        console.warn(`[Notification] Unknown channel: ${channel}`);
    }
  },
};
