// What a session looks like
export interface TelegramSession {
  telegramId:      number;
  platformUserId?: string;   // assigned by backend after registration
  language:        'en' | 'fr';
  role?:           'farmer' | 'buyer';
  verified:        boolean;  // backend verification status
  currentStep:     string | null;
  stepData:        Record<string, any>;
}

// In-memory store — key is telegramId
const store = new Map<number, TelegramSession>();

export function getSession(telegramId: number): TelegramSession | null {
  return store.get(telegramId) || null;
}

export function initSession(telegramId: number, lang: 'en' | 'fr'): TelegramSession {
  const session: TelegramSession = {
    telegramId,
    platformUserId: telegramId.toString(),
    language:    lang,
    verified:    false,
    currentStep: null,
    stepData:    {},
  };
  store.set(telegramId, session);
  return session;
}

export function updateSession(telegramId: number, data: Partial<TelegramSession>) {
  const existing = store.get(telegramId);

  if (existing){
    store.set(telegramId, { ...existing, ...data });
    return;
  } 
  // If no existing session, create a new one with the provided data (filling in defaults for missing fields)
  const newSession: TelegramSession = {
    telegramId: telegramId,
    language:    'en',
    verified:    false,
    currentStep: null,
    stepData:    {},
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