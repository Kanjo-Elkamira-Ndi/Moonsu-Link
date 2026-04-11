export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface KeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  is_persistent?: boolean;
}

export interface ReplyKeyboardRemove {
  remove_keyboard: boolean;
  selective?: boolean;
}

export interface ForceReply {
  force_reply: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string; language_code?: string };
    chat: { id: number };
    text?: string;
    date: number;
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
  data?: any;
}
