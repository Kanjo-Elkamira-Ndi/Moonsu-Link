import { pool } from '../pool';

const prices = [
  // Maize / Maïs
  { crop: 'maize', market: 'Yaoundé', region: 'Centre', min: 180, max: 220 },
  { crop: 'maize', market: 'Douala', region: 'Littoral', min: 190, max: 230 },
  { crop: 'maize', market: 'Bafoussam', region: 'West', min: 160, max: 200 },
  { crop: 'maize', market: 'Bafia', region: 'Centre', min: 150, max: 190 },
  // Tomato / Tomate
  { crop: 'tomato', market: 'Yaoundé', region: 'Centre', min: 300, max: 450 },
  { crop: 'tomato', market: 'Douala', region: 'Littoral', min: 320, max: 480 },
  { crop: 'tomato', market: 'Bafoussam', region: 'West', min: 250, max: 380 },
  // Cassava / Manioc
  { crop: 'cassava', market: 'Yaoundé', region: 'Centre', min: 100, max: 150 },
  { crop: 'cassava', market: 'Douala', region: 'Littoral', min: 110, max: 160 },
  { crop: 'cassava', market: 'Ebolowa', region: 'South', min: 80, max: 120 },
  // Beans / Haricots
  { crop: 'beans', market: 'Yaoundé', region: 'Centre', min: 500, max: 700 },
  { crop: 'beans', market: 'Bafoussam', region: 'West', min: 450, max: 620 },
  { crop: 'beans', market: 'Bamenda', region: 'Northwest', min: 400, max: 580 },
  // Plantain
  { crop: 'plantain', market: 'Douala', region: 'Littoral', min: 200, max: 280 },
  { crop: 'plantain', market: 'Yaoundé', region: 'Centre', min: 220, max: 300 },
  // Groundnuts / Arachides
  { crop: 'groundnuts', market: 'Ngaoundéré', region: 'Adamawa', min: 600, max: 900 },
  { crop: 'groundnuts', market: 'Garoua', region: 'North', min: 550, max: 850 },
];

async function seed(): Promise<void> {
  console.log('🌱 Seeding market prices...');

  const client = await pool.connect();
  try {
    for (const p of prices) {
      await client.query(
        `INSERT INTO market_prices (crop, market, region, min_price, max_price)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (crop, market, recorded_at) DO UPDATE
           SET min_price = EXCLUDED.min_price,
               max_price = EXCLUDED.max_price`,
        [p.crop, p.market, p.region, p.min, p.max],
      );
    }
    console.log(`✅ Seeded ${prices.length} price records`);
  } catch (err: any) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
