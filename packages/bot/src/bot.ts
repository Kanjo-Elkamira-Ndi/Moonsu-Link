import { BotUpdate, BotSession, ChannelType, PlatformUser } from "./types/shared";
import { getSession, initSession, updateSession, setStep, clearStep } from "./utils/session";
import { getMessage } from "./utils/i18n";
import { answerCallbackQuery, sendMessage } from "./channel/telegram.api";
import { handleStartCommand } from "./handlers/start.handler";
import { handleHelpCommand } from "./handlers/help.handler";
import { handleOnboardingFlow } from "./flows/onboarding.flow";
import { getUserByTelegramId } from "./api";
import { generateVerficationStatus } from "./utils/logic";
import { startAIFlow, handleAIFlowStep } from "./handlers/aiflow.handler";
import { handleMiniAppData } from "./handlers/minidata.handler";

/**
 * Central dispatcher for all incoming bot updates from various channels.
 * This function is responsible for routing updates to the appropriate handlers
 * based on the user's session state and the incoming message content.
 */
export async function handleBotUpdate(channel: ChannelType, rawUpdate: any) {
  // For now, we only handle Telegram updates. Extend this for other channels.
  if (channel !== "telegram") {
    console.warn(`Unsupported channel type: ${channel}`);
    return;
  }



  const message = rawUpdate.message;
  const callbackQuery = rawUpdate.callback_query;
  const miniData = rawUpdate.data

  let telegramId: number | undefined;
  let chatId: number | undefined;
  let text: string | undefined;
  let fromLanguageCode: string | undefined;


  if (message) {
    telegramId = message.from.id;
    chatId = message.chat.id;
    text = message.text;
    fromLanguageCode = message.from.language_code;
  } else if (callbackQuery) {
    await handleCallback(callbackQuery, channel)
    return;
  }
  if (miniData || rawUpdate.message?.web_app_data) {
    return handleMiniAppData(rawUpdate)
  }


  if (!telegramId || !chatId) {
    console.error("Could not extract telegramId or chatId from update:", rawUpdate);
    return;
  }

  let session = getSession(telegramId);
  const lang: 'en' | 'fr' = fromLanguageCode?.startsWith('fr') ? 'fr' : 'en';


  // Initialize session if it doesn't exist
  if (!session) {
    session = initSession(telegramId, lang);
    // For new users, always start with /start flow
    await handleStartCommand(telegramId, chatId, rawUpdate.message || rawUpdate.callback_query?.message, session);
    return;
  }


  // Always handle /start and /help regardless of session state
  if (text === '/start') {
    await handleStartCommand(telegramId, chatId, rawUpdate.message || rawUpdate.callback_query?.message, session);
    return;
  }

  if (text === '/help') {
    await handleHelpCommand(telegramId, chatId, rawUpdate.message || rawUpdate.callback_query?.message, session);
    return;
  }

  if (session.currentStep?.startsWith("flow_") || session.currentStep?.startsWith("create_") || session.currentStep?.startsWith("link_")) {

    const update: BotUpdate = { channel, telegramUpdate: { message: rawUpdate.message } };
    await handleOnboardingFlow(telegramId, chatId, update, session);
    return;
  }

  if (session.currentStep?.startsWith("ai_")) {
    const update: BotUpdate = { channel, telegramUpdate: { message: rawUpdate.message } };
    await handleAIFlowStep(telegramId, chatId, update, session);
    return;
  }

  // If registered and not in a flow, handle menu actions or general text
  // Echo or fallback for non-command text
  // if (session.platformUserId) {
  //   if (text) {
  //     await sendMessage({
  //       chat_id: chatId,
  //       text: getMessage("unknown_command", lang),
  //     });
  //   }
  //   return;
  // }

  // // Fallback for unhandled cases (e.g., new user not starting with /start)
  // if (text) {
  //   await sendMessage({
  //     chat_id: chatId,
  //     text: getMessage("please_start", lang),
  //   });
  // }

  await handleStartCommand(telegramId, chatId, rawUpdate.message || rawUpdate.callback_query?.message, session);
  return;
}


async function handleCallback(cb: any, channel: ChannelType) {
  const telegramId = cb.from.id as number;
  const chatId = cb.message.chat.id as number;
  const data = cb.data as string;
  const session = getSession(telegramId)!;
  const fromLanguageCode = cb.from.language_code;
  const lang = fromLanguageCode as 'en' | 'fr'
  console.log("Logging session callback: ", session)

  console.log("Logging session callback: ", session)

  // Always answer callback first — removes the loading spinner on the button
  await answerCallbackQuery({
    callback_query_id: cb.id,
  });


  //mid-flow 
  if (session.currentStep?.startsWith("flow_") || session.currentStep?.startsWith("create_") || session.currentStep?.startsWith("link_")) {

    const update: BotUpdate = { channel, telegramUpdate: { callback_query: cb } };
    await handleOnboardingFlow(telegramId, chatId, update, session);
    return;
  }

  if (session.currentStep?.startsWith("ai_")) {
    clearStep(telegramId);
    session.currentStep = null;
  }



  // ── Menu button actions ────────────────────────────────────────────────────
  const MINI_APP = process.env.MINI_APP_URL!;
  let user = await getUserByTelegramId(telegramId);

  // Farmer: My Produce → opens Mini App on farmer dashboard screen
  if (data === 'menu_my_product') {
    //   if (!session.verified) return sendUnverifiedMessage(chatId, session.language);

    const verificationStatus = user
      ? generateVerficationStatus(user)
      : session.verified
        ? 'verified'
        : 'unverified';

    return sendMessage(
      {
        chat_id: chatId,
        text: getMessage("open_dashboard", lang) + (verificationStatus == "verified" ? "" : getMessage("product_unverified", lang)),
        reply_markup: {
          inline_keyboard: [[
            {
              text: getMessage("button_dashboard", lang),
              web_app: { url: `${MINI_APP}/farmer-dashboard` }
            }
          ]]
        }
      }
    )

  }

  // Farmer: Market Prices → opens Mini App prices screen
  if (data === 'menu_prices') {
    return sendMessage({
      chat_id: chatId,
      text: getMessage("open_price", lang),
      reply_markup: {
        inline_keyboard: [[
          {
            text: getMessage("button_price", lang),
            web_app: { url: `${MINI_APP}/prices` }
          }
        ]]
      }
    });
  }

  if (data === 'menu_outbreak') {
    return sendMessage({
      chat_id: chatId,
      text: getMessage("open_crop_alerts", lang),
      reply_markup: {
        inline_keyboard: [[
          {
            text: getMessage("button_crop_alerts", lang),
            web_app: { url: `${MINI_APP}/farmer/crop-alerts` }
          }
        ]]
      }
    });
  }

  // Buyer: Search Produce → opens Mini App marketplace
  if (data === 'menu_search') {

    return sendMessage({
      chat_id: chatId,
      text: getMessage("open_marketplace", lang),
      reply_markup: {
        inline_keyboard: [[
          {
            text: getMessage("button_marketplace", lang),
            web_app: { url: `${MINI_APP}/marketplace` }
          }
        ]]
      }
    });
  }

  // Ask a question → stays in bot, no Mini App needed
  if (data === 'menu_ask') {
    return await startAIFlow(chatId, telegramId, session)
  }

  if (data === 'menu_subscriptions') {
    return sendMessage({
      chat_id: chatId,
      text: getMessage("open_subscription", lang),
      reply_markup: {
        inline_keyboard: [[
          {
            text: getMessage("button_subscription", lang),
            web_app: { url: `${MINI_APP}/buyer/subscriptions` }
          }
        ]]
      }
    });
  }

  // Profile
  if (data === 'menu_profile') {
    const user: PlatformUser | null = await getUserByTelegramId(telegramId);
    console.log("getting user: ",user)
    const userRole = user?.role || session.role || (lang === 'fr' ? 'Non défini' : 'Unknown');
    const verificationStatus = user
      ? generateVerficationStatus(user)
      : session.verified
        ? 'verified'
        : 'unverified';

    const verifiedLabel = verificationStatus === 'verified'
      ? (lang === 'fr' ? '✅ Vérifié' : '✅ Verified')
      : verificationStatus === 'pending'
        ? (lang === 'fr' ? '⏳ En attente de vérification' : '⏳ Pending verification')
        : (lang === 'fr' ? '⏳ Non vérifié' : '⏳ Unverified');

    const profileText = getMessage("profile_text", lang, {
      role: userRole,
      verified: verifiedLabel,
      phone: user?.telegramNumber || (lang === 'fr' ? 'Téléphone non disponible' : 'Phone unavailable'),
    }) + (verificationStatus == 'unverified' ? getMessage("unverified_notice", lang) : '');

    return sendMessage({
      chat_id: chatId,
      text: profileText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: getMessage("button_verify_account", lang),
            web_app: { url: `${MINI_APP}/verify-user` },
          },
        ]],
      },
    });
  }
}

async function sendUnverifiedMessage(chatId: number, lang: 'en' | 'fr') {
  await sendMessage({
    chat_id: chatId,
    text: getMessage("unverified", lang),
  });
}