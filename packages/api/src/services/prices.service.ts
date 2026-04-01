import { pool } from '../db/pool';

export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  region: string;
  min_price: number;
  max_price: number;
  unit: string;
  recorded_at: string;
}

export const PricesService = {
  async getLatestForCrop(crop: string): Promise<MarketPrice[]> {
    const { rows } = await pool.query<MarketPrice>(
      `SELECT DISTINCT ON (market) *
       FROM market_prices
       WHERE crop = $1
       ORDER BY market, recorded_at DESC`,
      [crop.toLowerCase()]
    );
    return rows;
  },

  async upsert(data: Omit<MarketPrice, 'id'>): Promise<MarketPrice> {
    const { rows } = await pool.query<MarketPrice>(
      `INSERT INTO market_prices (crop, market, region, min_price, max_price, unit, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (crop, market, recorded_at)
       DO UPDATE SET min_price = EXCLUDED.min_price, max_price = EXCLUDED.max_price
       RETURNING *`,
      [data.crop.toLowerCase(), data.market, data.region, data.min_price, data.max_price, data.unit || 'kg', data.recorded_at]
    );
    return rows[0];
  },

  async getAll(): Promise<MarketPrice[]> {
    const { rows } = await pool.query<MarketPrice>(
      `SELECT DISTINCT ON (crop, market) *
       FROM market_prices
       ORDER BY crop, market, recorded_at DESC`
    );
    return rows;
  },

  async getAvailableCrops(): Promise<string[]> {
    const { rows } = await pool.query(`SELECT DISTINCT crop FROM market_prices ORDER BY crop`);
    return rows.map(r => r.crop);
  },
};
