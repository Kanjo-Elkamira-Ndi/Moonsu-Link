import 'dotenv/config';
import { pool } from '../pool';

const crops = ['maize', 'tomato', 'plantain', 'cassava', 'groundnut', 'cocoa', 'coffee'];

const markets = [
  { market: 'Marché Central', region: 'Centre' },
  { market: 'Marché Mokolo',  region: 'Centre' },
  { market: 'Marché Mboppi',  region: 'Littoral' },
  { market: 'Marché Bafoussam', region: 'Ouest' },
];

// Approximate FCFA prices per kg (min / max) — update weekly from MINADER data
const seedPrices: Record<string, [number, number]> = {
  maize:      [200,  350],
  tomato:     [300,  600],
  plantain:   [150,  300],
  cassava:    [100,  200],
  groundnut:  [600,  900],
  cocoa:      [1200, 1500],
  coffee:     [900,  1200],
};

async function seed() {
  console.log('🌱 Seeding database...');
  const client = await pool.connect();
  try {
    for (const crop of crops) {
      for (const { market, region } of markets) {
        const [min, max] = seedPrices[crop];
        await client.query(
          `INSERT INTO market_prices (crop, market, region, min_price, max_price)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (crop, market, recorded_at) DO NOTHING`,
          [crop, market, region, min, max]
        );
      }
    }
    console.log(`✅ Seeded ${crops.length * markets.length} price records`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
