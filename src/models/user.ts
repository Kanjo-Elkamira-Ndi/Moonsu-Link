export interface User {
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
    chat_id?: string;
    lang: "en" | "fr";
    pic_folder: string; // folder name in claudinary where user's pictures are stored
    createdAt?: Date;
    updatedAt?: Date;
    verified: boolean;
} // different accounnt may have the same number but for many cameroonian the use different number for each