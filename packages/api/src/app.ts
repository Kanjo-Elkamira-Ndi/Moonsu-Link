import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLogger, errorHandler } from './middleware';

export function createApp() {
  const app = express();

    // This tells Express to trust proxy headers from ngrok/reverse proxies
  app.set('trust proxy', 1);
  // ── Security ──────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: process.env.ADMIN_ORIGIN ?? '*' }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      message: { error: 'Too many requests' },
    }),
  );

  // ── Body parsing ──────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Logging ───────────────────────────────────────────────
  app.use(requestLogger);

  // ── Health check ──────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
  });

  // ── Routes (imported lazily so env is loaded first) ───────
  const { webhookRouter } = require('./routes/webhook.route');
  const { authRouter } = require('./routes/auth.route');
  const { listingsRouter } = require('./routes/listings.route');
  const { pricesRouter } = require('./routes/prices.route');
  const { usersRouter } = require('./routes/users.route');
  const { handleWhatsAppWebhook } = require('./channels/whatsapp.channel');

  // Support Unipile webhooks that are configured at the root path.
  // The official route is /webhook/whatsapp, but some setups post directly to /.
  app.post('/', handleWhatsAppWebhook);

  app.use('/webhook', webhookRouter);
  app.use('/auth', authRouter);
  app.use('/listings', listingsRouter);
  app.use('/prices', pricesRouter);
  app.use('/users', usersRouter);

  // ── Error handler (must be last) ──────────────────────────
  app.use(errorHandler);

  return app;
}
