import 'dotenv/config';
import { pool } from './pool';

const migrations = [
  // ── 001: Users ────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone         VARCHAR(20) UNIQUE NOT NULL,
    name          VARCHAR(100),
    role          VARCHAR(10) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer', 'admin')),
    language      VARCHAR(5) NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    region        VARCHAR(100),
    channel       VARCHAR(20) NOT NULL DEFAULT 'sms' CHECK (channel IN ('telegram', 'sms', 'whatsapp')),
    telegram_id   BIGINT UNIQUE,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // ── 002: Listings ─────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop           VARCHAR(50) NOT NULL,
    quantity_kg    NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    price_per_kg   NUMERIC(10,0) NOT NULL CHECK (price_per_kg > 0),
    location       VARCHAR(100) NOT NULL,
    region         VARCHAR(100),
    description    TEXT,
    status         VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
    expires_at     TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // ── 003: Market prices ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS market_prices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop        VARCHAR(50) NOT NULL,
    market      VARCHAR(100) NOT NULL,
    region      VARCHAR(100) NOT NULL,
    min_price   NUMERIC(10,0) NOT NULL,
    max_price   NUMERIC(10,0) NOT NULL,
    unit        VARCHAR(20) NOT NULL DEFAULT 'kg',
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(crop, market, recorded_at)
  )`,

  // ── 004: Buyer alert subscriptions ───────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS buyer_alerts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop       VARCHAR(50) NOT NULL,
    region     VARCHAR(100),
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(buyer_id, crop, region)
  )`,

  // ── 005: Connection requests (buyer interested in listing) ────────────────
  `CREATE TABLE IF NOT EXISTS connection_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(listing_id, buyer_id)
  )`,

  // ── 006: Indexes for common queries ───────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_listings_crop_region   ON listings(crop, region) WHERE status = 'active'`,
  `CREATE INDEX IF NOT EXISTS idx_listings_farmer        ON listings(farmer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_expires       ON listings(expires_at) WHERE status = 'active'`,
  `CREATE INDEX IF NOT EXISTS idx_market_prices_crop     ON market_prices(crop, recorded_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_buyer_alerts_crop      ON buyer_alerts(crop, region) WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS idx_users_telegram         ON users(telegram_id) WHERE telegram_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_users_phone            ON users(phone)`,

  // ── 007: Auto-update updated_at trigger ──────────────────────────────────
  `CREATE OR REPLACE FUNCTION update_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
   $$ LANGUAGE plpgsql`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
      CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_listings_updated_at') THEN
      CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
  END $$`,
];

async function migrate() {
  console.log('🔄 Running database migrations...');
  const client = await pool.connect();
  try {
    for (const [i, sql] of migrations.entries()) {
      await client.query(sql);
      console.log(`  ✅ Migration ${i + 1}/${migrations.length} applied`);
    }
    console.log('✅ All migrations complete');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
