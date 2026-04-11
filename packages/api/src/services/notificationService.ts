import { getUsers } from "./userService";
import { sendTelegram } from "../channels/telegram.channel";
import { sendSms } from "../channels/sms.channel";
import { sendWhatsApp } from "../channels/whatsapp.channel";
import type { CropPrice } from "../routes/models/cropPrice";
import type { Alert } from "../routes/models/alert";

function getMessage(price: CropPrice, lang: string) {
  const crop = price.crop_name ?? 'crop';
  const region = price.region === 'General' ? '' : ` (${price.region})`;

  if (lang === 'fr') {
    return `Mise à jour des prix du marché pour ${crop}${region}: ${price.min_price}-${price.max_price} FCFA/kg.`;
  }

  return `Market price update for ${crop}${region}: ${price.min_price}-${price.max_price} FCFA/kg.`;
}

function getAlertMessage(alert: Alert, lang: string) {
  const severityEmoji = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨'
  };

  const region = alert.region ? ` (${alert.region})` : '';

  if (lang === 'fr') {
    return `${severityEmoji[alert.severity]} *ALERTE ${alert.severity.toUpperCase()}*${region}\n\n${alert.title}\n\n${alert.message}`;
  }

  return `${severityEmoji[alert.severity]} *${alert.severity.toUpperCase()} ALERT*${region}\n\n${alert.title}\n\n${alert.message}`;
}

export async function broadcastMarketPriceUpdate(price: CropPrice): Promise<void> {
  const users = await getUsers();
  await Promise.all(users.map(async (user) => {
    const message = getMessage(price, user.lang ?? 'en');

    try {
      if (user.telegram_id) {
        await sendTelegram(user.telegram_id, message);
        return;
      }

      if (user.whatsapp_number) {
        await sendWhatsApp(user.whatsapp_number, message);
        return;
      }

      if (user.phone) {
        await sendSms(user.phone, message);
      }
    } catch (err) {
      console.error('[Broadcast] Failed to send market price update to user', user.id, err);
    }
  }));
}

export async function broadcastAlert(alert: Alert): Promise<void> {
  const users = await getUsers();
  await Promise.all(users.map(async (user) => {
    const message = getAlertMessage(alert, user.lang ?? 'en');

    try {
      if (user.telegram_id) {
        await sendTelegram(user.telegram_id, message);
        return;
      }

      if (user.whatsapp_number) {
        await sendWhatsApp(user.whatsapp_number, message);
        return;
      }

      if (user.phone) {
        await sendSms(user.phone, message);
      }
    } catch (err) {
      console.error('[Broadcast] Failed to send alert to user', user.id, err);
    }
  }));
}
