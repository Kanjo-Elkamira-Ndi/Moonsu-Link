// packages/bot/src/core/handlers/start.handler.ts

import { BotSession , PlatformUser} from "../types/shared";
import { getSession, updateSession, setStep, clearStep } from "../utils/session";
import { getMessage } from "../utils/i18n";
import * as backend from "../api"
import { sendMessage } from "../channel/telegram.api";
import { generateVerficationStatus, generateVerificationBadge } from "../utils/logic";
import { getUserByTelegramId } from "../api";


/**
 * Handles the /start command. This is the entry point for new and returning users.
 * It checks if the user has an existing platform account and guides them through
 * onboarding or welcomes them back.
 */
export async function handleStartCommand(
  telegramId: number,
  chatId: number,
  message: any, // Raw Telegram message object
  session: BotSession
) {
  const firstName = message.from.first_name;
  const tgLang = message.from.language_code || 'en';
  const lang: 'en' | 'fr' = tgLang.startsWith('fr') ? 'fr' : 'en';

  // Check if this Telegram ID already has a platform account
//   const existingUser: PlatformUser | null = await backend.getUserByTelegramId(telegramId);
  const existingUser: PlatformUser | null = await getUserByTelegramId(telegramId);
  console.log("Existing user check: ", existingUser);

  if (existingUser) {
    // Returning user — restore/update session, show their menu
    updateSession(telegramId, {
      platformUserId: existingUser.id,
      language:       existingUser.lang,
      role:           existingUser.role,
      verified:       existingUser.verified,
    });

    console.log("Logging session after start: ", getSession(telegramId));

    const welcome = getMessage("welcome_back_message", lang, { firstName });
    const verificationStatus = generateVerficationStatus(existingUser);
    // TODO: Implement sendMainMenu function
    await sendMainMenu(chatId, telegramId, existingUser.role, lang, verificationStatus,welcome);
   
  } else {
    // New user — init a temporary session with detected language
    // Session should already be initialized by bot.ts, just update language if needed
    if (session.language !== lang) {
      updateSession(telegramId, { language: lang });
    }
    setStep(telegramId, 'flow_onboarding_choice');

    const text = getMessage("welcome_message", lang, { firstName });

    await sendMessage({
      chat_id:    chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [
        [{ text: getMessage("create_account_button", lang), callback_data: 'onboard_create' }],
        [{ text: getMessage("link_account_button", lang), callback_data: 'onboard_link' }],
      ]}
    });
  }
}


async function sendMainMenu(
  chatId:   number,
  telegramId: number,
  role:     'farmer' | 'buyer' | 'admin',
  lang:     'en' | 'fr',
  verificationStatus: 'verified' | 'unverified' | 'pending',
  headerText: string
) {
  const session  = getSession(telegramId);
  console.log("Logging session in main menu: ",session)
  updateSession(telegramId, { currentStep: "main_menu" }); // clear any existing flow state

  // Farmer menu buttons
  const farmerKeyboard = [
    [
      { text: getMessage('menu_my_product',lang),
        callback_data: 'menu_my_product' },
      { text: getMessage("menu_prices",lang),
        callback_data: 'menu_prices' },
    ],
    [
      { text: getMessage("menu_alerts",lang),
        callback_data: 'menu_outbreak' },
        //   { text:  getMessage("menu_support",lang),
        // callback_data: 'menu_farm_support' },
        
      { text: getMessage("menu_profile",lang),
        callback_data: 'menu_profile' }
    ],
    [
       { text: getMessage("menu_farmer_ai",lang),
        callback_data: 'menu_ask' }
    ],
  ];

  // Buyer menu buttons
  const buyerKeyboard = [
    [
      { 
        text: getMessage("menu_product",lang),
        callback_data: 'menu_search' 
      },
      { 
        // NEW: This opens the Mini App page to manage their crop watches
        text: getMessage("menu_subscriptions",lang),
        callback_data: 'menu_subscriptions' 
      },
    ],
    [
      { 
        text: getMessage("menu_buyer_ai",lang),
        callback_data: 'menu_ask' 
      },
      { 
        text: getMessage("menu_profile",lang),
        callback_data: 'menu_profile' 
      },
    ]
];


  // Verification notice if not yet verified

  
 const verificationBadge = headerText+generateVerificationBadge(verificationStatus,lang)

 await sendMessage({
      chat_id:    chatId,
      text: verificationBadge,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: role === 'farmer' ? farmerKeyboard : buyerKeyboard
    }
    });
   
 
}