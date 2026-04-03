import { pool } from './pool';

const migrations: Array<{ name: string; sql: string }> = [
  {
    name: 'create users table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone       VARCHAR(20) UNIQUE NOT NULL,
        name        VARCHAR(100),
        channel     VARCHAR(20) NOT NULL DEFAULT 'sms',
        lang        VARCHAR(5)  NOT NULL DEFAULT 'en',
        role        VARCHAR(20) NOT NULL DEFAULT 'farmer',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'create listings table',
    sql: `
      CREATE TABLE IF NOT EXISTS listings (
        id          VARCHAR(8)  PRIMARY KEY,
        farmer_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crop        VARCHAR(50) NOT NULL,
        quantity_kg INTEGER     NOT NULL,
        town        VARCHAR(100) NOT NULL,
        region      VARCHAR(100),
        price_fcfa  INTEGER     NOT NULL,
        status      VARCHAR(20) NOT NULL DEFAULT 'active',
        expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS listings_crop_region ON listings(crop, region);
      CREATE INDEX IF NOT EXISTS listings_status ON listings(status);
      CREATE INDEX IF NOT EXISTS listings_expires_at ON listings(expires_at);
    `,
  },
  {
    name: 'create market_prices table',
    sql: `
      CREATE TABLE IF NOT EXISTS market_prices (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        crop        VARCHAR(50)  NOT NULL,
        market      VARCHAR(100) NOT NULL,
        region      VARCHAR(100),
        min_price   INTEGER NOT NULL,
        max_price   INTEGER NOT NULL,
        recorded_at DATE    NOT NULL DEFAULT CURRENT_DATE,
        created_by  VARCHAR(50) DEFAULT 'admin',
        UNIQUE (crop, market, recorded_at)
      );
      CREATE INDEX IF NOT EXISTS prices_crop_date ON market_prices(crop, recorded_at DESC);
    `,
  },
  {
    name: 'create buyer_alerts table',
    sql: `
      CREATE TABLE IF NOT EXISTS buyer_alerts (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crop        VARCHAR(50) NOT NULL,
        region      VARCHAR(100),
        active      BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, crop, region)
      );
    `,
  },
  {
    name: 'create connection_requests table',
    sql: `
      CREATE TABLE IF NOT EXISTS connection_requests (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id  VARCHAR(8)  NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        buyer_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status      VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (listing_id, buyer_id)
      );
    `,
  },
];

async function migrate(): Promise<void> {
  console.log('🔄 Running database migrations...');

  const client = await pool.connect();

  try {
    for (const m of migrations) {
      try {
        console.log(`  → ${m.name}`);
        await client.query(m.sql);
        console.log(`  ✅ ${m.name}`);
      } catch (err: any) {
        console.error(`  ❌ FAILED: ${m.name}`);
        console.error(`     Code:    ${err.code}`);
        console.error(`     Detail:  ${err.detail ?? 'none'}`);
        console.error(`     Message: ${err.message}`);
        throw err;
      }
    }

    console.log('✅ All migrations complete');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
