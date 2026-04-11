// packages/bot/src/core/flows/onboarding.flow.ts

import { BotSession, BotUpdate} from "../types/shared";
import { getSession, updateSession, setStep, clearStep } from "../utils/session";
import { getMessage } from "../utils/i18n";
import { sendMessage, answerCallbackQuery } from "../channel/telegram.api";
import * as backend from "../api"
import { InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton } from "../types/telegram";
import { handleStartCommand } from "../handlers/start.handler";

/**
 * Manages the multi-step onboarding flow for new users, including account creation
 * and linking, and the new phone number collection step.
 */
export async function handleOnboardingFlow(
  telegramId: number,
  chatId: number,
  update: BotUpdate,
  session: BotSession
) {
  const lang = session.language;
  const message = update.telegramUpdate.message;
  const callbackQuery = update.telegramUpdate.callback_query;
  const data = callbackQuery?.data || message?.text; // Use callback data or text as input

  // Ensure we have a session to work with
  if (!session) {
    console.error(`No session found for Telegram ID: ${telegramId} during onboarding flow.`);
    // This should ideally not happen if bot.ts initializes sessions correctly
    return;
  }


  switch (session.currentStep) {
    case 'flow_onboarding_choice':
        console.log("data hers is",data)
      if (data === 'onboard_create') {
        setStep(telegramId, 'create_role_selection', { ...session.stepData });
        await sendRoleSelection(chatId, lang);
      } else if (data === 'onboard_link') {
        setStep(telegramId, 'link_account_phone_input', { ...session.stepData });
        await sendPhoneNumberRequest(chatId, lang);
      } else {
        await sendMessage({
          chat_id: chatId,
          text: getMessage('invalid_onboarding_choice', lang),
        });
      }
      break;

    case 'create_role_selection':
      if (data === 'create_role_farmer' || data === 'create_role_buyer') {
        const role = data === 'create_role_farmer' ? 'farmer' : 'buyer';
        setStep(telegramId, 'create_region_selection', { ...session.stepData, role });
        await sendRegionSelection(chatId, lang);
      } else {
        await sendMessage({
          chat_id: chatId,
          text: getMessage('invalid_role_selection', lang),
        });
      }
      break;

    case 'create_region_selection':
      if (data && data.startsWith('create_reg_')) {
        const region = data.replace('create_reg_', '');
        setStep(telegramId, 'flow_ask_phone_number', { ...session.stepData, region });
        await sendPhoneNumberRequest(chatId, lang);
      } else {
        await sendMessage({
          chat_id: chatId,
          text: getMessage('invalid_region_selection', lang),
        });
      }
      break;

    case 'flow_ask_phone_number':
      const phoneNumber = message?.contact?.phone_number || message?.text;
      if (phoneNumber) {
        // Basic validation for phone number (can be enhanced)
        const cleanedPhoneNumber = phoneNumber.replace(/[^\d+]/g, ''); // Remove non-digit except +
        if (cleanedPhoneNumber.length > 8) { // Simple length check
          // Proceed with registration
          const { role, region } = session.stepData;
          const firstName = message?.from?.first_name || callbackQuery?.from?.first_name || 'User';

          try {
            const result = await backend.registerUser({
              telegramId: telegramId.toString(),
              name: firstName,
              platform: "telegram",
              role,
              region,
              lang,
              telegramNumber: cleanedPhoneNumber
            });
            if(!result){
               await sendMessage({
                  chat_id: chatId,
                  text: getMessage('registration_failed', lang),
                });
                clearStep(telegramId);
                return;
            }

            // Update session with platform identity
            updateSession(telegramId, {
              platformUserId: result.platformUserId,
              role,
              verified: false, // New accounts start unverified
            });
            clearStep(telegramId);

            const successMessageKey = role === 'farmer' ? 'account_created_farmer' : 'account_created_buyer';
            await sendMessage({
              chat_id: chatId,
              text: getMessage(successMessageKey, lang),
              parse_mode: 'Markdown',
              reply_markup: { remove_keyboard: true } // Remove phone number keyboard
            });
            // TODO: Send main menu after successful registration
            handleStartCommand(telegramId,chatId,message,session)

          } catch (error) {
            console.error("Error registering user:", error);
            await sendMessage({
              chat_id: chatId,
              text: getMessage('registration_failed', lang),
            });
            clearStep(telegramId);
          }
        } else {
          await sendMessage({
            chat_id: chatId,
            text: getMessage('invalid_phone_format', lang),
          });
          await sendPhoneNumberRequest(chatId, lang); // Re-prompt
        }
      } else {
        await sendMessage({
          chat_id: chatId,
          text: getMessage('please_provide_phone', lang),
        });
        await sendPhoneNumberRequest(chatId, lang); // Re-prompt
      }
      break;

    case 'link_account_phone_input':
      const linkPhoneNumber = message?.contact?.phone_number || message?.text;
      if (linkPhoneNumber) {
        const cleanedPhoneNumber = linkPhoneNumber.replace(/[^\d+]/g, '');
        if (cleanedPhoneNumber.length > 8) {
          try {
            const existingPlatformUser = await backend.getUserByPhone(cleanedPhoneNumber);
            if (existingPlatformUser) {
              let response = await backend.linkTelegramAccount(existingPlatformUser.userId, 'telegram',telegramId.toString());
              updateSession(telegramId, {
                platformUserId: existingPlatformUser.id,
                role: existingPlatformUser.role,
                language: existingPlatformUser.lang,
                verified: existingPlatformUser.verified,
              });
              clearStep(telegramId);
              if(!response.success){
                  await sendMessage({
                    chat_id: chatId,
                    text: getMessage('account_linked_failed', lang, { name: existingPlatformUser.name }),
                    parse_mode: 'Markdown',
                    reply_markup: { remove_keyboard: true } // Remove phone number keyboard
                  });
                  return;
              }

              await sendMessage({
                chat_id: chatId,
                text: getMessage('linked_failed', lang, { name: existingPlatformUser.name }),
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true } // Remove phone number keyboard
              });
              // TODO: Send main menu
              handleStartCommand(telegramId,chatId,message,session)
            } else {
              await sendMessage({
                chat_id: chatId,
                text: getMessage('no_account_found_phone', lang),
              });
              handleStartCommand(telegramId,chatId,message,session)
              // await sendPhoneNumberRequest(chatId, lang); // Re-prompt
            }
          } catch (error) {
            console.error("Error linking account:", error);
            await sendMessage({
              chat_id: chatId,
              text: getMessage('linking_failed', lang),
            });
            clearStep(telegramId);
          }
        } else {
          await sendMessage({
            chat_id: chatId,
            text: getMessage('invalid_phone_format', lang),
          });
          await sendPhoneNumberRequest(chatId, lang); // Re-prompt
        }
      } else {
        await sendMessage({
          chat_id: chatId,
          text: getMessage('please_provide_phone', lang),
        });
        await sendPhoneNumberRequest(chatId, lang); // Re-prompt
      }
      break;

    default:
      console.warn(`Unhandled onboarding step: ${session.currentStep}`);
      clearStep(telegramId);
      await sendMessage({
        chat_id: chatId,
        text: getMessage('unhandled_flow_error', lang),
      });
      break;
  }
}

async function sendRoleSelection(chatId: number, lang: 'en' | 'fr') {
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: getMessage('role_farmer_button', lang), callback_data: 'create_role_farmer' }],
      [{ text: getMessage('role_buyer_button', lang), callback_data: 'create_role_buyer' }],
    ],
  };
  await sendMessage({
    chat_id: chatId,
    text: getMessage('choose_your_role', lang),
    reply_markup: replyMarkup,
  });
}

async function sendRegionSelection(chatId: number, lang: 'en' | 'fr') {
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text:'📍 West',      callback_data:'create_reg_West'      },
       { text:'📍 Centre',    callback_data:'create_reg_Centre'    }],
      [{ text:'📍 Littoral',  callback_data:'create_reg_Littoral'  },
       { text:'📍 North West',callback_data:'create_reg_NorthWest' }],
      [{ text:'📍 South West',callback_data:'create_reg_SouthWest' },
       { text:'📍 Adamawa',   callback_data:'create_reg_Adamawa'   }],
      [{ text:'📍 North',     callback_data:'create_reg_North'     },
       { text:'📍 Far North', callback_data:'create_reg_FarNorth'  }],
      [{ text:'📍 East',      callback_data:'create_reg_East'      },
       { text:'📍 South',     callback_data:'create_reg_South'     }],
    ],
  };
  await sendMessage({
    chat_id: chatId,
    text: getMessage('which_region_question', lang),
    reply_markup: replyMarkup,
  });
}

async function sendPhoneNumberRequest(chatId: number, lang: 'en' | 'fr') {
  const replyMarkup: ReplyKeyboardMarkup = {
    keyboard: [
      [{ text: getMessage('share_phone_button', lang), request_contact: true } as KeyboardButton],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
  await sendMessage({
    chat_id: chatId,
    text: getMessage('ask_phone_number', lang),
    reply_markup: replyMarkup,
  });
}

// Add new messages to i18n.utils.ts for the new flow steps
// - invalid_onboarding_choice
// - invalid_role_selection
// - invalid_region_selection
// - registration_failed
// - invalid_phone_format
// - please_provide_phone
// - account_linked_success
// - no_account_found_phone
// - linking_failed
// - unhandled_flow_error
// - role_farmer_button
// - role_buyer_button
// - choose_your_role
// - share_phone_button
// - unknown_command (for bot.ts fallback)
// - please_start (for bot.ts fallback)