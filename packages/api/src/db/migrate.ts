import { pool } from './pool';

const migrations: Array<{ name: string; sql: string }> = [
  {
    name: 'enable pgcrypto extension',
    sql: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
  },
  {
    name: 'create updated_at trigger function',
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `,
  },
  {
    name: 'create users table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          VARCHAR(100) UNIQUE,
        name             VARCHAR(100) NOT NULL,
        phone            VARCHAR(20) UNIQUE,
        email            VARCHAR(150) UNIQUE,
        role             VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
        region           VARCHAR(20) NOT NULL DEFAULT 'General' CHECK (
                            region IN (
                              'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
                              'Littoral', 'Nord', 'Nord-Ouest',
                              'Ouest', 'Sud', 'Sud-Ouest', 'General'
                            )
                         ),
        telegram_id      VARCHAR(100) UNIQUE,
        telegram_number  VARCHAR(20) UNIQUE,
        whatsapp_number  VARCHAR(20) UNIQUE,
        lang             VARCHAR(5) NOT NULL CHECK (lang IN ('en', 'fr')),
        pic_folder       TEXT,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        verified         BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  {
    name: 'seed admin user',
    sql: `
      INSERT INTO users (user_id, name, phone, email, role, region, telegram_number, whatsapp_number, lang, verified)
      VALUES (
        'AA19952262',
        'The Alchemist',
        'admin-login',
        'moonsulink@admin.com',
        'admin',
        'Centre',
        '651650173',
        '651650173',
        'en',
        true
      )
      ON CONFLICT DO NOTHING;
    `,
  },
  {
    name: 'create crops table',
    sql: `
      CREATE TABLE IF NOT EXISTS crops (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_updated_at_crops
      BEFORE UPDATE ON crops
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  {
    name: 'create listings table',
    sql: `
      CREATE TABLE IF NOT EXISTS listings (
        id          SERIAL PRIMARY KEY,
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crop_id     INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        quantity_kg INTEGER NOT NULL,
        price       INTEGER NOT NULL,
        town        VARCHAR(100) NOT NULL,
        image_url   TEXT,
        expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_updated_at_listings
      BEFORE UPDATE ON listings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  {
    name: 'create crop_prices table',
    sql: `
      CREATE TABLE IF NOT EXISTS crop_prices (
        id         SERIAL PRIMARY KEY,
        crop_id    INTEGER REFERENCES crops(id) ON DELETE SET NULL,
        region     VARCHAR(20) NOT NULL DEFAULT 'General' CHECK (
                      region IN (
                        'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
                        'Littoral', 'Nord', 'Nord-Ouest',
                        'Ouest', 'Sud', 'Sud-Ouest', 'General'
                      )
                   ),
        min_price  INTEGER NOT NULL,
        max_price  INTEGER NOT NULL,
        avg_price  INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (min_price <= avg_price AND avg_price <= max_price),
        UNIQUE (crop_id, region)
      );

      CREATE TRIGGER set_updated_at_crop_prices
      BEFORE UPDATE ON crop_prices
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  {
    name: 'create listing_interests table',
    sql: `
      CREATE TABLE IF NOT EXISTS listing_interests (
        id         SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message    TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (listing_id, user_id)
      );

      CREATE TRIGGER set_updated_at_listing_interests
      BEFORE UPDATE ON listing_interests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  {
    name: 'create alerts table',
    sql: `
      CREATE TABLE IF NOT EXISTS alerts (
        id         SERIAL PRIMARY KEY,
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notice     TEXT NOT NULL,
        advice     TEXT,
        verified   BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_updated_at_alerts
      BEFORE UPDATE ON alerts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  {
    name: 'create processed_messages',
    sql: `
      CREATE TABLE processed_messages (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message_id TEXT UNIQUE NOT NULL,
        chat_id TEXT,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  }
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
