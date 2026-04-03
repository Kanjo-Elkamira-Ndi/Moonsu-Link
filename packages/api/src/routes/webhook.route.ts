import { Router } from 'express';
import { handleTelegramUpdate } from '../channels/telegram.channel';
import { handleSmsWebhook } from '../channels/sms.channel';
import { handleWhatsAppVerification, handleWhatsAppWebhook } from '../channels/whatsapp.channel';

export const webhookRouter = Router();

// Telegram
webhookRouter.post('/telegram', handleTelegramUpdate);

// SMS (Twilio)
webhookRouter.post('/sms', handleSmsWebhook);

// WhatsApp (future)
webhookRouter.get('/whatsapp', handleWhatsAppVerification);
webhookRouter.post('/whatsapp', handleWhatsAppWebhook);
