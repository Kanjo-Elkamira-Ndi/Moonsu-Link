import { pool } from '../pool';

const prices = [
  // Maize / Maïs
  { crop: 'maize', region: 'Centre', min: 180, max: 220 },
  { crop: 'maize', region: 'Littoral', min: 190, max: 230 },
  { crop: 'maize', region: 'Ouest', min: 160, max: 200 },
  // Tomato / Tomate
  { crop: 'tomato', region: 'Centre', min: 300, max: 450 },
  { crop: 'tomato', region: 'Littoral', min: 320, max: 480 },
  { crop: 'tomato', region: 'Ouest', min: 250, max: 380 },
  // Cassava / Manioc
  { crop: 'cassava', region: 'Centre', min: 100, max: 150 },
  { crop: 'cassava', region: 'Littoral', min: 110, max: 160 },
  { crop: 'cassava', region: 'Sud', min: 80, max: 120 },
  // Beans / Haricots
  { crop: 'beans', region: 'Centre', min: 500, max: 700 },
  { crop: 'beans', region: 'Ouest', min: 450, max: 620 },
  { crop: 'beans', region: 'Nord-Ouest', min: 400, max: 580 },
  // Plantain
  { crop: 'plantain', region: 'Littoral', min: 200, max: 280 },
  { crop: 'plantain', region: 'Centre', min: 220, max: 300 },
  // Groundnuts / Arachides
  { crop: 'groundnuts', region: 'Adamaoua', min: 600, max: 900 },
  { crop: 'groundnuts', region: 'Nord', min: 550, max: 850 },
];

async function seed(): Promise<void> {
  console.log('🌱 Seeding market prices...');

  const client = await pool.connect();
  try {
    for (const p of prices) {
      // First, try to get or create the crop
      let cropId: number;
      const existingCrop = await client.query(
        `SELECT id FROM crops WHERE name = $1`,
        [p.crop],
      );

      if (existingCrop.rows.length > 0) {
        cropId = existingCrop.rows[0].id;
      } else {
        const newCrop = await client.query(
          `INSERT INTO crops (name) VALUES ($1) RETURNING id`,
          [p.crop],
        );
        cropId = newCrop.rows[0].id;
      }

      // Calculate average price
      const avgPrice = Math.floor((p.min + p.max) / 2);

      // Check if this crop_id/region combo already exists
      const existingResult = await client.query(
        `SELECT id FROM crop_prices WHERE crop_id = $1 AND region = $2`,
        [cropId, p.region],
      );

      if (existingResult.rows.length === 0) {
        // Insert the market price
        await client.query(
          `INSERT INTO crop_prices (crop_id, region, min_price, max_price, avg_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [cropId, p.region, p.min, p.max, avgPrice],
        );
      }
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
