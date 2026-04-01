import { UsersService } from './users.service';
import { CommandHandler } from './commandHandler.service';
import { NotificationService } from './notification.service';
import type { Channel } from './users.service';

export interface IncomingMessage {
  channel: Channel;
  from: string;           // Telegram user ID or phone number
  phone: string;          // Normalized identifier
  text: string;
  displayName?: string;
  telegramChatId?: number;
  telegramMessageId?: number;
}

// Command keywords in both EN and FR
const COMMANDS: Record<string, string> = {
  // English
  sell:       'SELL',
  find:       'FIND',
  price:      'PRICE',
  alert:      'ALERT',
  interested: 'INTERESTED',
  help:       'HELP',
  mylistings: 'MY_LISTINGS',
  cancel:     'CANCEL',
  // French
  vendre:     'SELL',
  chercher:   'FIND',
  prix:       'PRICE',
  alerte:     'ALERT',
  interesse:  'INTERESTED',
  aide:       'HELP',
  meslistes:  'MY_LISTINGS',
  annuler:    'CANCEL',
};

function parseCommand(text: string): { command: string; args: string[] } | null {
  const parts = text.trim().split(/\s+/);
  const keyword = parts[0].toLowerCase().replace(/[^a-z]/g, '');
  const command = COMMANDS[keyword];
  if (!command) return null;
  return { command, args: parts.slice(1) };
}

export const MessageRouter = {
  async handle(msg: IncomingMessage) {
    try {
      console.log(`[${msg.channel}] From: ${msg.from} | Text: ${msg.text}`);

      // Resolve or register the user
      let user = msg.channel === 'telegram'
        ? await UsersService.findByTelegramId(parseInt(msg.from))
        : await UsersService.findByPhone(msg.phone);

      // Unknown user — start onboarding
      if (!user) {
        await CommandHandler.handleOnboarding(msg, null);
        return;
      }

      // Parse the command
      const parsed = parseCommand(msg.text);
      if (!parsed) {
        await NotificationService.send(user, 'UNKNOWN_COMMAND');
        return;
      }

      // Dispatch to the appropriate handler
      await CommandHandler.dispatch(parsed.command, parsed.args, user, msg);

    } catch (err) {
      console.error('[MessageRouter] Error:', err);
    }
  },
};
