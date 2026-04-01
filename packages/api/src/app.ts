import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.routes';
import { listingsRouter } from './routes/listings.routes';
import { pricesRouter } from './routes/prices.routes';
import { usersRouter } from './routes/users.routes';
import { webhookRouter } from './routes/webhook.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.ADMIN_ORIGIN || 'http://localhost:5173' }));

// ── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for Twilio SMS webhooks

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'agribridge-api', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/users', usersRouter);

// Webhook routes (no /api prefix — Twilio/Telegram call these directly)
app.use('/webhooks', webhookRouter);

// ── Error handling ───────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
