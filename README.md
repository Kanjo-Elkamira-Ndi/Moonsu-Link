# MoonsuLink

> Admin dashboard for the MoonsuLink agricultural platform.
> Built for FarmerHack 2026, organized by Rebase Code Camp, Cameroon.

## What is MoonsuLink?

MoonsuLink is a multi-channel messaging platform that connects
Cameroonian farmers with buyers and aggregators via Telegram,
SMS, and WhatsApp.

This repository contains the **admin dashboard** — a React web
application used by platform administrators to manage market
prices, monitor listings, manage users, and broadcast alerts
to all platform users.

The bot logic and API live on the `backend` branch.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM v6 |
| HTTP | Native fetch with typed wrapper |
| Auth | JWT (stored in localStorage) |
| Deployment | Vercel / Railway |

---

## Features

### Market Prices
Add and update weekly crop prices per market. Prices are what
the bot returns to farmers when they send `PRIX maïs` or
`PRICE maize`. Covers 7 crops across 4 major Cameroonian
markets (Yaoundé, Douala, Bafoussam, Bafia).

### Listings Management
View all active, expired, sold, and cancelled farmer produce
listings. Admins can cancel fraudulent or duplicate listings.
Listings auto-expire after 7 days.

### Users
View all registered farmers and buyers. Shows channel
(Telegram or SMS), preferred language (FR/EN), region,
and registration date.

### Alerts
Create and broadcast platform alerts to all users — pest
outbreaks, sharp price changes, weather warnings, market
closures, and more. Alerts have three severity levels
(Info, Warning, Critical) and can be targeted to a specific
region or sent nationwide. Admins review pending alerts and
publish or dismiss them. Published alerts are broadcast via
the bot to all active users.

---

## Project Structure

```
src/
├── components/
│   └── pages/
│       ├── DashboardLayout.tsx   # Sidebar, header, stats
│       ├── LoginPage.tsx         # Admin authentication
│       ├── ListingsPage.tsx      # Farmer listings table
│       ├── PricesPage.tsx        # Market price management
│       ├── UsersPage.tsx         # Registered users
│       └── AlertsPage.tsx        # Alert creation & broadcast
├── hooks/
│   └── useAuth.ts                # JWT auth state management
├── services/
│   └── api.ts                    # Typed API fetch wrapper
├── App.tsx                       # Route definitions
├── main.tsx                      # Entry point
└── index.css                     # Tailwind directives
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- The backend service running (see `backend` branch)

### Installation

```bash
git clone https://github.com/Kanjo-Elkamira-Ndi/Moonsu-Link.git
cd Moonsu-Link
git checkout frontend
npm install
```

### Environment variables

Create a `.env` file at the root:

```env
VITE_API_URL=http://localhost:3005
```

Point `VITE_API_URL` at your running backend instance.
In production this is your Railway backend URL.

### Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build with:

```bash
npm run preview
```

---

## Deployment

The frontend is deployed on **Railway** (or Vercel).

Set the following in your deployment environment:

```
VITE_API_URL=https://your-backend.railway.app
```

Build command: `npm install && npm run build`
Start command: `npm run preview`

> Vite bakes `VITE_API_URL` into the bundle at build time.
> If you change the variable, you must redeploy.

---

## Related

| | Branch | Description |
|---|---|---|
| Backend | `backend` | Node.js + Express + TypeScript API |
| Bot | `backend` | Telegram bot + SMS channel handlers |
| Database | PostgreSQL | Hosted on Railway |

---

## Bot Commands Reference

Farmers and buyers interact with MoonsuLink entirely via chat.
No app download required.

| English | French | Action |
|---|---|---|
| `PRICE maize` | `PRIX maïs` | Get market prices |
| `SELL maize 80kg Bafia 250` | `VENDRE maïs 80kg Bafia 250` | Post a listing |
| `FIND maize Bafia` | `CHERCHER maïs Bafia` | Search produce |
| `ALERT tomato West` | `ALERTE tomate Ouest` | Subscribe to alerts |
| `INTERESTED abc12345` | `INTERESSE abc12345` | Contact a farmer |
| `MY LISTINGS` | `MESLISTES` | View active listings |
| `CANCEL abc12345` | `ANNULER abc12345` | Cancel a listing |
| `HELP` | `AIDE` | Show all commands |

---

## Team

Built by team **The Alchemist** for FarmerHack 2026
— Rebase Code Camp, Cameroon.
```
