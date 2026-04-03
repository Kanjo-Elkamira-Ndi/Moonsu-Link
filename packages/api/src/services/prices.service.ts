import { pool } from '../db/pool';
import { t } from '../config/templates';
import type { Lang } from '../config/templates';
import { generatePriceInsight } from './ai/openai.service';

export const pricesService = {
  async lookup({ crop, lang }: { crop: string; lang: Lang }): Promise<string> {
    const { rows } = await pool.query(
      `SELECT market, min_price, max_price
       FROM market_prices
       WHERE crop ILIKE $1
         AND recorded_at = (
           SELECT MAX(recorded_at) FROM market_prices WHERE crop ILIKE $1
         )
       ORDER BY market`,
      [crop],
    );

    if (rows.length === 0) return (t.priceNotFound[lang] as Function)(crop);

    const priceRows = rows.map((r) => ({
      market: r.market,
      min: r.min_price,
      max: r.max_price,
    }));

    const baseReply = (t.priceResult[lang] as Function)(crop, priceRows);

    // Append AI insight if enabled (non-blocking — falls back silently)
    const insight = await generatePriceInsight(crop, priceRows, lang);
    return insight ? `${baseReply}\n\n${insight}` : baseReply;
  },

  // Admin methods
  async upsert({
    crop,
    market,
    region,
    minPrice,
    maxPrice,
  }: {
    crop: string;
    market: string;
    region?: string;
    minPrice: number;
    maxPrice: number;
  }) {
    await pool.query(
      `INSERT INTO market_prices (crop, market, region, min_price, max_price)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (crop, market, recorded_at) DO UPDATE
         SET min_price = EXCLUDED.min_price,
             max_price = EXCLUDED.max_price`,
      [crop, market, region ?? null, minPrice, maxPrice],
    );
  },

  async list() {
    const { rows } = await pool.query(
      `SELECT * FROM market_prices ORDER BY recorded_at DESC, crop, market`,
    );
    return rows;
  },
};
