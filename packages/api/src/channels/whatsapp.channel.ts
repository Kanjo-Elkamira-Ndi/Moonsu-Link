import { config } from '../config/env';

// ── WhatsApp Cloud API (Meta) ─────────────────────────────────────────────────
// Status: STUB — requires Meta Business verification
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
//
// When ready:
// 1. Complete Meta Business verification
// 2. Create a WhatsApp Business App in Meta Developer Console
// 3. Add WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID to .env
// 4. Register the webhook at /webhooks/whatsapp
// 5. Implement parseIncomingMessage() in webhook.routes.ts
// ─────────────────────────────────────────────────────────────────────────────

export const WhatsAppChannel = {
  async send(phone: string, text: string): Promise<void> {
    if (!config.WHATSAPP_TOKEN || !config.WHATSAPP_PHONE_NUMBER_ID) {
      console.warn('[WhatsApp] Not configured. Would send to', phone, ':', text);
      return;
    }

    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone.replace('+', ''),
            type: 'text',
            text: { body: text },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error('[WhatsApp] Send failed:', err);
      }
    } catch (err) {
      console.error('[WhatsApp] Network error:', err);
    }
  },
};
