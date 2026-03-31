# 🌱 Moonsu Link

> Connecting Cameroonian farmers with buyers via Telegram, SMS (MTN/Orange/Camtel), and WhatsApp.
> Built for FarmerHack 2026 — Rebase Code Camp.

---

## What it does

Moonu Link is a multi-channel messaging platform that lets:
- **Farmers** post their available produce and check real market prices
- **Buyers/Aggregators** search available produce and subscribe to crop alerts
- **Admins** update weekly market prices via a web dashboard

All interactions happen over **Telegram**, **SMS**, or **WhatsApp** — no app download, no smartphone required beyond basic messaging.

---

## Monorepo Structure

```
Moonu Link/
├── packages/
│   ├── api/          # Node.js + Express backend — handles all bot logic, webhooks, DB
│   ├── bot/          # Telegram polling process (local dev only)
│   └── admin/        # React + Vite admin dashboard
├── docs/             # Architecture notes, API docs
├── scripts/          # Utility scripts
├── .env.example      # Copy this to .env and fill in values
└── package.json      # Workspace root
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Bot channels | Telegram Bot API, Twilio SMS, Orange/MTN API (stubs) |
| Admin frontend | React 18, Vite, Tailwind CSS |
| Deployment | Railway / Render (API + DB), Vercel (Admin) |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- PostgreSQL running locally
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone and install

```bash
git clone https://github.com/Kanjo-Elkamira-Ndi/Moonsu-Link.git
cd Moonu-Link
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values — at minimum:
# DATABASE_URL, TELEGRAM_BOT_TOKEN, API_SECRET, ADMIN_PASSWORD, ADMIN_JWT_SECRET
```

### 3. Create and seed the database

```bash
# Create a PostgreSQL database named 'Moonu Link', then:
npm run migrate
npm run seed
```

### 4. Start all services

```bash
npm run dev
# API:   http://localhost:3001
# Admin: http://localhost:5173
# Bot:   Telegram polling active (forwards to API)
```

### 5. Test the bot

Open Telegram, search for your bot by username, and send:
```
HELP
```

---

## Bot Commands

| English | French | Description |
|---|---|---|
| `SELL maize 80kg Bafia 250` | `VENDRE maïs 80kg Bafia 250` | Post a harvest listing |
| `FIND maize Bafia` | `CHERCHER maïs Bafia` | Find available produce |
| `PRICE maize` | `PRIX maïs` | Get today's market prices |
| `ALERT tomato West` | `ALERTE tomate Ouest` | Subscribe to crop alerts |
| `INTERESTED abc12345` | `INTERESSE abc12345` | Express interest in a listing |
| `MY LISTINGS` | `MESLISTES` | View your active listings |
| `CANCEL abc12345` | `ANNULER abc12345` | Cancel a listing |
| `HELP` | `AIDE` | Show all commands |

---

## Deployment (Production)

### API + Database → Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

railway login
railway init
railway up

# Add environment variables in Railway dashboard
# Set the Telegram webhook after deploy:
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.railway.app/webhooks/telegram"
```

### Admin Dashboard → Vercel

```bash
cd packages/admin
npx vercel --prod
# Set VITE_API_URL to your Railway API URL in Vercel dashboard
```

### SMS via Twilio

1. Create a Twilio account at twilio.com
2. Get a phone number
3. In Twilio console, set the SMS webhook URL to: `https://your-api-url/webhooks/sms`
4. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` to your env

---

## Team Task Split

| Task | File(s) | Who |
|---|---|---|
| DB schema & migrations | `packages/api/src/db/migrate.ts` | Backend lead |
| Command handlers | `packages/api/src/services/commandHandler.service.ts` | Backend lead |
| Message templates | `packages/api/src/config/templates.ts` | Anyone |
| SMS channel (Twilio) | `packages/api/src/channels/sms.channel.ts` | Backend |
| Telegram channel | `packages/api/src/channels/telegram.channel.ts` | Backend |
| Admin dashboard | `packages/admin/src/` | Frontend |
| Seed data (real prices) | `packages/api/src/db/seeds/index.ts` | Anyone |
| Deployment | `railway.toml`, Vercel | DevOps |

---

## Environment Variables Reference

See `.env.example` for all variables with descriptions.

**Minimum required to run locally:**
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `API_SECRET` (any random 32-char string)
- `ADMIN_PASSWORD`
- `ADMIN_JWT_SECRET` (any random 32-char string)

---

## Adding WhatsApp (Future)

When Meta Business verification is complete:

1. Add `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` to `.env`
2. Implement the incoming message parser in `packages/api/src/routes/webhook.routes.ts` (the route stub is already there)
3. The `WhatsAppChannel.send()` in `packages/api/src/channels/whatsapp.channel.ts` is already implemented

---

## License

MIT
