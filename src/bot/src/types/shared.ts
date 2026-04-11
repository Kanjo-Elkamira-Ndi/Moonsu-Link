// packages/bot/src/types/shared.types.ts

export interface PlatformUser {
    id: string; // uuid
    userId: string; // from identification documents added by admin when verifying users
    name: string;
    phone?: string; // use for sms account
    email?: string; // can be null for unverified users but must be unique when provided
    role: "farmer" | "buyer" | "admin";
    region: string;
    telegramId?: string;
    telegramNumber?: string; // use for telegram account
    whatsappNumber?: string; // use for whatsapp account
    lang: "en" | "fr";
    pic_folder: string; // folder name in claudinary where user's pictures are stored
    createdAt?: Date;
    updatedAt?: Date;
    verified: boolean;
}

export interface BotSession {
  telegramId:      number;
  platformUserId?: string;   // assigned by backend after registration
  language:        'en' | 'fr';
  role?:           'farmer' | 'buyer' | 'admin';
  verified:        boolean;  // backend verification status
  currentStep:     string | null;
  stepData:        Record<string, any>;
}

export type ChannelType = 'telegram' | 'whatsapp'; // Extend as needed

export interface BotUpdate {
  channel: ChannelType;
  telegramUpdate?: any; // Raw Telegram update object
  // Add other channel-specific update types here
  message?: {
    from: { id: number; first_name: string; username?: string; language_code?: string };
    chat: { id: number };
    text?: string;
    voice?: any;
    photo?: any;
    web_app_data?: any;
    contact?: { phone_number: string; first_name: string; user_id?: number };
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name: string; username?: string; language_code?: string };
    message: { chat: { id: number } };
    data: string;
  };
  // Add other common update properties as needed
}

export interface BotResponse {
  chatId: number;
  method: string;
  payload: object;
}