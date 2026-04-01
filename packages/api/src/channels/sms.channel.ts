import { config } from '../config/env';

// SMS has a 160-char limit per segment. We keep messages under this.
const SMS_MAX_CHARS = 160;

function truncateForSms(text: string): string {
  if (text.length <= SMS_MAX_CHARS) return text;
  return text.slice(0, SMS_MAX_CHARS - 3) + '...';
}

function isSmsChannel(phone: string): boolean {
  // Telegram users are stored as tg:123456789 — skip SMS for them
  return !phone.startsWith('tg:');
}

export const SmsChannel = {
  async send(phone: string, text: string): Promise<void> {
    if (!isSmsChannel(phone)) return;

    const message = truncateForSms(text);

    // ── Try Twilio first (works for MTN/Orange/Camtel via international gateway) ──
    if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN && config.TWILIO_PHONE_NUMBER) {
      await this.sendViaTwilio(phone, message);
      return;
    }

    // ── Fallback: MTN Cameroon direct API ──
    if (config.MTN_SMS_API_KEY && config.MTN_SMS_API_URL) {
      await this.sendViaMtn(phone, message);
      return;
    }

    // ── Fallback: Orange Cameroon direct API ──
    if (config.ORANGE_SMS_API_KEY) {
      await this.sendViaOrange(phone, message);
      return;
    }

    console.warn(`[SMS] No SMS provider configured. Would send to ${phone}:`, message);
  },

  async sendViaTwilio(phone: string, message: string): Promise<void> {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = config;
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: TWILIO_PHONE_NUMBER!,
            To: phone,
            Body: message,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error('[SMS/Twilio] Send failed:', err);
      }
    } catch (err) {
      console.error('[SMS/Twilio] Network error:', err);
    }
  },

  // ── MTN Cameroon Developer API ────────────────────────────────────────────
  // Docs: https://developer.mtn.com/
  // Status: Stub — fill in when API access is granted
  async sendViaMtn(phone: string, message: string): Promise<void> {
    try {
      const res = await fetch(config.MTN_SMS_API_URL!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.MTN_SMS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [{ phoneNumber: phone }],
          message,
          senderAddress: 'AgriBridge',
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[SMS/MTN] Send failed:', err);
      }
    } catch (err) {
      console.error('[SMS/MTN] Network error:', err);
    }
  },

  // ── Orange Cameroon Developer API ─────────────────────────────────────────
  // Docs: https://developer.orange.com/apis/sms-cm/
  // Status: Stub — fill in after OAuth token exchange
  async sendViaOrange(phone: string, message: string): Promise<void> {
    try {
      // Orange requires OAuth2 — in production, cache the token and refresh it
      const tokenRes = await fetch('https://api.orange.com/oauth/v3/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.ORANGE_SMS_CLIENT_ID}:${config.ORANGE_SMS_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const { access_token } = await tokenRes.json() as { access_token: string };

      const senderAddress = 'tel:+237000000000'; // replace with your Orange sender number
      const res = await fetch(
        `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(senderAddress)}/requests`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            outboundSMSMessageRequest: {
              address: [`tel:${phone}`],
              senderAddress,
              outboundSMSTextMessage: { message },
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error('[SMS/Orange] Send failed:', err);
      }
    } catch (err) {
      console.error('[SMS/Orange] Network error:', err);
    }
  },
};
