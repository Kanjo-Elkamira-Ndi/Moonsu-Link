# Moonsu Link

> Multi-channel agricultural marketplace connecting Cameroonian farmers and buyers via Telegram, WhatsApp, and SMS.

---

## Overview

Moonsu Link is a platform that lets farmers list produce, check market prices, and receive alerts — all through basic messaging apps. No smartphone or internet required beyond WhatsApp and Telegram.

**Channels:**
- **Telegram bot** (`@MoonsuBot`) — Full-featured with inline keyboards, role-based onboarding, and AI assistant
- **WhatsApp** — Counter-based conversational flow via Unipile
- **SMS** — Twilio integration (configured, pending implementation)
- **Admin dashboard** — Web app for managing listings, prices, users, and alerts

---

## Architecture

```
User (Telegram / WhatsApp / SMS)
        │
        ▼
  ┌─────────────┐     ┌──────────────┐
  │  Telegram    │     │  WhatsApp    │
  │  Bot API     │     │  Unipile     │
  └──────┬──────┘     └──────┬───────┘
         │                   │
         ▼                   ▼
  ┌─────────────────────────────────┐
  │  server/  (Express + Node.js)   │
  │  - REST API                     │
  │  - Bot logic & webhooks         │
  │  - PostgreSQL queries           │
  └──────────────┬──────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │  PostgreSQL  │
         └──────────────┘
                 ▲
                 │
  ┌──────────────┴──────────────────┐
  │  client/  (React + Vite)        │
  │  - Admin dashboard              │
  │  - CRUD for listings, prices,   │
  │    users, and alerts            │
  └─────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL |
| Telegram | Bot API (long-polling / webhook) |
| WhatsApp | Unipile SDK |
| SMS | Twilio (configured) |
| Admin frontend | React 19, Vite 8, Tailwind CSS 3 |
| AI | OpenAI GPT-4o-mini (optional) |

---

## Project Structure

```
FarmerHack/
├── server/                  # Express backend
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── app.ts           # Express app factory
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Database queries
│   │   ├── middleware/       # Auth, sanitization, rate limiting
│   │   ├── channels/        # Telegram update handler
│   │   ├── whatsapp/        # WhatsApp conversation flows
│   │   ├── bot/             # Telegram bot commands & flows
│   │   ├── db/              # Pool, migrations, seeds
│   │   └── utils/           # JWT, sanitize, errors
│   └── .env
├── client/                  # React admin dashboard
│   ├── src/
│   │   ├── App.tsx          # Routes
│   │   ├── services/api.ts  # API client
│   │   ├── hooks/           # useAuth
│   │   └── components/
│   │       └── pages/       # Login, Listings, Prices, Users, Alerts
│   └── .env
├── .env                     # Root environment variables
├── tsconfig.base.json       # Shared TS config
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL running locally
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Unipile account with WhatsApp connected (optional for WhatsApp)

### Setup

```bash
# 1. Clone and install dependencies
git clone https://github.com/Kanjo-Elkamira-Ndi/Moonsu-Link.git
cd Moonsu-Link
cd server && npm install
cd ../client && npm install
cd ..

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL, TELEGRAM_BOT_TOKEN, etc.

# 3. Create the database
createdb moonsulinkdb
cd server && npm run migrate
```

### Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Admin dashboard
cd client && npm run dev
```

The API runs on `http://localhost:3005` and the dashboard on `http://localhost:5173`.

---

## Features

### Telegram Bot

- `/start` — Role-based onboarding (farmer / buyer)
- Inline keyboard menus for listings, prices, alerts, and AI assistant
- Multi-step listing creation and browsing
- Real-time market price lookup by crop or region
- AI-powered farming assistant (OpenAI, optional)
- EN / FR bilingual support

### WhatsApp (via Unipile)

- Counter-based conversational flow
- Browse verified listings
- Check market prices by region or crop
- Receive broadcast alerts

### Admin Dashboard

- Secure JWT-based login
- **Listings** — View all produce listings with active/expired status
- **Market Prices** — Add, edit, and delete crop prices by region
- **Users** — View registered users and their platform connections
- **Alerts** — Create, verify, dismiss, and broadcast alerts to all users

---

## API Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/admin` | POST | — | Admin login |
| `/auth/user` | POST | — | User login by platform ID |
| `/auth/register` | POST | — | Register new user |
| `/listings` | GET | Admin | List all listings |
| `/listings` | POST | Admin/Farmer | Create listing |
| `/listings/:id` | PUT | Admin/Farmer | Update listing |
| `/listings/:id` | DELETE | Admin | Delete listing |
| `/crop_prices` | GET | All | List market prices |
| `/crop_prices` | POST | Admin | Create price entry |
| `/crop_prices/:id` | PUT | Admin | Update price |
| `/crop_prices/:id` | DELETE | Admin | Delete price |
| `/users` | GET | Admin | List all users |
| `/alerts` | GET | All | List alerts |
| `/alerts` | POST | All | Create alert |
| `/alerts/:id/verify` | PUT | Admin | Verify alert |
| `/alerts/:id/dismiss` | PUT | Admin | Dismiss alert |
| `/alerts/broadcast/:id` | POST | Admin | Broadcast via WhatsApp |
| `/whatsapp` | POST | — | WhatsApp webhook (Unipile) |
| `/webhook/telegram` | POST | — | Telegram webhook |

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 3005) |
| `API_SECRET` | JWT signing secret |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from BotFather |
| `UNIPILE_DSN` | Unipile API hostname |
| `UNIPILE_API_KEY` | Unipile API key |
| `UNIPILE_ACCOUNT_ID` | Unipile account ID |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `VITE_API_URL` | API URL for the frontend |

---

## Deployment

### Backend

Deploy `server/` to any Node.js host (Railway, Render, Fly.io). Set all environment variables in the hosting dashboard. Configure the Telegram webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your-app.com/webhook/telegram"
```

### Frontend

Build and deploy `client/` to Vercel or any static host:

```bash
cd client
npm run build
# Deploy the dist/ folder
```

Set `VITE_API_URL` to your deployed API URL.

### WhatsApp

Expose the server via ngrok or a public URL, then set the webhook URL in the Unipile dashboard to `https://your-url.com/whatsapp`.

---

## License

MIT
