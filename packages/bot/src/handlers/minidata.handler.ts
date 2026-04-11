import { tgPost } from '../channel/telegram.api';
import * as backend from '../api'
import { getSession, initSession, updateSession } from "../utils/session";


export async function handleMiniAppData(msg: any) {
  let chatId: number;
  let telegramId: number;
  let data: any;

  if (msg.message && msg.message.web_app_data) {
    chatId = msg.message.chat.id;
    telegramId = msg.message.from.id;
    try {
      data = JSON.parse(msg.message.web_app_data.data);
    } catch {
      data = msg.message.web_app_data.data;
    }
  } else {
    chatId = msg.chatId as number;
    telegramId = msg.telegramId as number;
    data = msg.data as any;
  }

  let session = getSession(telegramId);
  if (!session || !session.platformUserId) {
    const user = await backend.getUserByTelegramId(telegramId);
    if (user) {
      if (!session) {
        const lang = msg.message?.from?.language_code?.startsWith('fr') ? 'fr' : 'en';
        session = initSession(telegramId, lang);
      }
      updateSession(telegramId, {
        platformUserId: user.userId,
        role: user.role,
        language: user.lang,
        verified: user.verified
      });
      session = getSession(telegramId); // Reload updated session
    }
  }

  console.log("MiniApp Session:", session)

  if (!session?.platformUserId || !data) {
    console.warn('Received Mini App data without valid session or data:', { telegramId, data });
    return;
  }
  // let data: any;
  // try { data = JSON.parse(raw); } catch { return; }

  // ── Buyer expressed interest ───────────────────────────────────────────────
  if (data.action === 'interested') {
    //also send sms message via twilio
      await tgPost('sendMessage', {
        chat_id: data.farmerTelegramId,
        parse_mode: 'Markdown',
        text:
          `🔔 *New Interest in Your Listing!*\n\n` +
          `${msg.from.first_name} is interested in your *${data.crop}*.\n` +
          `📞 Contact: @${msg.from.username || 'check their profile'}\n\n` +
          `Listing #${data.listingId}`,
      });

    // Summary to buyer
    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text:
        `✅ *Interest Sent!*\n\n` +
        `You expressed interest in:\n` +
        `🌱 *${data.crop}* — ${data.quantity}kg @ ${data.price} FCFA/kg\n` +
        `📍 ${data.location}\n` +
        `👨‍🌾 Farmer: ${data.farmer}\n\n` +
        `They have been notified and will contact you soon.`,
    });
  }

  // ── Farmer created a listing ───────────────────────────────────────────────
  if (data.action === 'listing_created') {
    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text:
        `🎉 *Listing Published!*\n\n` +
        `Your listing is now live:\n` +
        `🌱 *${data.crop}*\n` +
        `⚖️ ${data.quantityKg}kg\n` +
        `💵 ${data.priceFcfa.toLocaleString()} FCFA/kg\n` +
        `📍 ${data.location}, ${data.region}\n` +
        `🆔 ID: \`${data.listingId}\`\n\n` +
        `Buyers in your region can now find your produce!`,
    });
  }


  // ── Farmer marked listing as sold ─────────────────────────────────────────
  if (data.action === 'listing_sold') {
    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text:
        `✅ *Listing Marked as Sold!*\n\n` +
        `🌱 *${data.crop}* — ${data.quantityKg}kg\n` +
        `📍 ${data.location}\n` +
        `🆔 #${data.listingId}\n\n` +
        `Great job! Your farm score has been updated. 🌟`,
    });
  }

  // ── Farmer renewed a listing ──────────────────────────────────────────────
  if (data.action === 'listing_renewed') {
    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text:
        `🔄 *Listing Renewed!*\n\n` +
        `🌱 *${data.crop}* — ${data.quantityKg}kg\n` +
        `📍 ${data.location}\n` +
        `🆔 #${data.listingId}\n\n` +
        `Your listing is active for another 7 days. ⏰`,
    });
  }

  // ── Farmer deleted a listing ──────────────────────────────────────────────
  if (data.action === 'listing_cancelled') {
    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text:
        `🗑️ *Listing Removed*\n\n` +
        `Your *${data.crop}* listing (#${data.listingId}) has been removed.\n\n` +
        `Tap *📦 My Produce* to manage your other listings.`,
    });
  }

  // ── Buyer subscribed to crop alert ────────────────────────────────────────
  if (data.action === 'subscribed' || data.action === 'unsubscribe') {
    const regions = data.region.join(', ');


    const isFrench = session.language === 'fr';

    const text = isFrench
      ? `🔔 *Alerte activée !*\n\n` +
      `Vous serez notifié lorsque *${data.crop}* sera disponible à *${regions}*.\n`
      : `🔔 *Alert Activated!*\n\n` +
      `You will be notified when *${data.crop}* is available in *${regions}*.\n`;
    const messageText = isFrench
      ? `🔕 *Abonnement annulé*\n\n` +
      `Vous ne recevrez plus de notifications pour *${data.crop}* dans *${data.region}*.\n\n` +
      `Vous pouvez vous réabonner à tout moment.`
      : `🔕 *Unsubscribed*\n\n` +
      `You will no longer receive notifications for *${data.crop}* in *${data.region}*.\n\n` +
      `You can subscribe again anytime .`;

    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text: data.action === 'subscribed' ? text : messageText,
    });
  }

  //farmer reported a pest outbreak

  if (data.action === 'outbreak_reported') {

    const text = session.language === 'fr'
      ? `🚨 *Signalement reçu !*\n\n` +
      `Merci d’avoir signalé une infestation de *${data.crop}* dans la région *${data.region}*.\n\n` +
      `Les autres agriculteurs de votre zone seront informés afin qu’ils puissent prendre des précautions. 🌱`
      : `🚨 *Report received!*\n\n` +
      `Thank you for reporting a *${data.crop}* outbreak in *${data.region}*.\n\n` +
      `Farmers in your area will be notified so they can take preventive action. 🌱`;

    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text
    });
  }

  // ── User reported a listing ────────────────────────────────────────────────
  if (data.action === 'report') {
    return tgPost('sendMessage', {
      chat_id: chatId,
      parse_mode: 'Markdown',
      text:
        `🚩 *Listing Reported*\n\n` +
        `Listing #${data.listingId} has been flagged.\n` +
        `Our team will review it shortly. Thank you!`,
    });
  }
}