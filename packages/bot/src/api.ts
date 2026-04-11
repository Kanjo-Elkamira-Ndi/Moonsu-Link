

import { PlatformUser } from "./types/shared";
import * as userService from "../../api/src/services/userService";
// ── USER / ACCOUNT ────────────────────────────────────────────────────────────

/**
 * Check if a Telegram ID is already linked to a platform account.
 * Returns null if this is a brand new user.
 * Real: GET /users?telegramId=:id
 */
export async function getUserByTelegramId(
  telegramId: number
): Promise<PlatformUser | null> {
  // return null; // always null = every user goes through registration
  // To test returning user flow, temporarily return:
  return await userService.getUserByPlatformId(telegramId.toString());
}

/**
 * Look up an account by phone number (for cross-platform linking).
 * Returns null if no account found with that phone.
 * Real: GET /users?phone=:phone
 */
export async function getUserByPhone(
  phone: string
): Promise<PlatformUser | null> {
  // Simulate a found account for testing link flow
  return await userService.getUserByPlatformId(phone);
}

/**
 * Link a Telegram ID to an existing platform account.
 * Called after getUserByPhone finds a match.
 * Real: PATCH /users/:platformUserId { telegramId }
 */
export async function linkTelegramAccount(
  userId: string,
  platform: "whatsapp" | "telegram" | "sms",
  identifier: string,

): Promise<{ success: boolean }> {
  console.log(`linking user ${userId} on platform ${platform} with identifier ${identifier}`)
  
  const user = await userService.linkUserAccount(userId,platform,identifier)
  if(user){
    return { success: true };
  }
  return { success: false };
}

/**
 * Register a brand new user on the platform.
 * Returns the new platformUserId assigned by the backend.
 * Real: POST /users
 */
export async function registerUser(data: {
  telegramId: string;
  name: string;
  role: 'farmer' | 'buyer';
  region: string;
  lang: 'en' | 'fr';
  platform: "whatsapp" | "telegram" | "sms";
  phone?: string;
  telegramNumber?: string;
  whatsappNumber?: string
}): Promise<{ platformUserId: string } | null>{

   const user = await userService.createUser(data)
   if(user){
    return { platformUserId: user.id };
   }
   return null
  
  
}


// ── AI ────────────────────────────────────────────────────────────────────────

/**
 * Ask the AI assistant an agricultural question.
 * For now calls DeepSeek directly — backend takes this over later.
 * Real: POST /ai/ask { question, language }
 */
export async function askAI(
  question: string,
  language: 'en' | 'fr',
  history: { role: string, content: string }[] = []
): Promise<string> {
  const langHint = {
    en: 'Answer in simple, practical English. Maximum 4 sentences.',
    fr: 'Répondez en français simple et pratique. Maximum 4 phrases.',
  }[language];

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_API_KEY || process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an agricultural assistant helping small-scale farmers in Cameroon. 
                      Be practical and concise. ${langHint}`,
          },
          ...history,
          { role: 'user', content: question },
        ],
      }),
    });

    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || 'Sorry, I could not get an answer right now.';
  } catch (error) {
    console.error("Deepseek API error:", error);
    return 'Sorry, I am currently experiencing technical difficulties evaluating your question.';
  }
}

