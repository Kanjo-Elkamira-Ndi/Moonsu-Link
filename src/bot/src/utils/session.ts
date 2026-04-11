// packages/bot/src/utils/session.utils.ts

import { BotSession } from "../types/shared";

// In-memory store — key is telegramId
const store = new Map<number, BotSession>();

export function getSession(telegramId: number): BotSession | null {
  return store.get(telegramId) || null;
}

export function initSession(telegramId: number, lang: 'en' | 'fr'): BotSession {
  const session: BotSession = {
    telegramId,
    language:    lang,
    verified:    false,
    currentStep: null,
    stepData:    {},
  };
  store.set(telegramId, session);
  return session;
}

export function updateSession(telegramId: number, data: Partial<BotSession>) {
  const existing = store.get(telegramId);

  if (existing){
    store.set(telegramId, { ...existing, ...data });
    return;
  }
  // If no existing session, create a new one with the provided data (filling in defaults for missing fields)
  // This might happen if the session was cleared or bot restarted.
  const newSession: BotSession = {
    telegramId: telegramId,
    language:    data.language || 'en', // Default to 'en' if not provided in update
    verified:    data.verified || false,
    currentStep: data.currentStep || null,
    stepData:    data.stepData || {},
    platformUserId: data.platformUserId || undefined,
    role: data.role || undefined,
  };
  store.set(telegramId, { ...newSession, ...data });
}

export function setStep(telegramId: number, step: string, stepData: Record<string, any> = {}) {
  const s = store.get(telegramId);
  if (s) { s.currentStep = step; s.stepData = stepData; }
}

export function clearStep(telegramId: number) {
  const s = store.get(telegramId);
  if (s) { s.currentStep = null; s.stepData = {}; }
}

export function deleteSession(telegramId: number) {
  store.delete(telegramId);
}