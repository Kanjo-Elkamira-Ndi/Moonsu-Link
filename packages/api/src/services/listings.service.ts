import { pool } from '../db/pool';

export interface Listing {
  id: string;
  farmer_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  location: string;
  region?: string;
  status: string;
  expires_at: string;
  created_at: string;
  farmer_name?: string;
  farmer_phone?: string;
}

export interface CreateListingInput {
  farmer_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  location: string;
  region?: string;
}

export const ListingsService = {
  async create(input: CreateListingInput): Promise<Listing> {
    const { rows } = await pool.query<Listing>(
      `INSERT INTO listings (farmer_id, crop, quantity_kg, price_per_kg, location, region)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.farmer_id, input.crop.toLowerCase(), input.quantity_kg, input.price_per_kg, input.location, input.region]
    );
    return rows[0];
  },

  async findByCropAndRegion(crop: string, region: string, limit = 5): Promise<Listing[]> {
    const { rows } = await pool.query<Listing>(
      `SELECT l.*, u.name as farmer_name, u.phone as farmer_phone
       FROM listings l
       JOIN users u ON l.farmer_id = u.id
       WHERE l.crop = $1
         AND (l.region ILIKE $2 OR l.location ILIKE $2)
         AND l.status = 'active'
         AND l.expires_at > NOW()
       ORDER BY l.created_at DESC
       LIMIT $3`,
      [crop.toLowerCase(), `%${region}%`, limit]
    );
    return rows;
  },

  async findByFarmer(farmer_id: string): Promise<Listing[]> {
    const { rows } = await pool.query<Listing>(
      `SELECT * FROM listings
       WHERE farmer_id = $1 AND status = 'active' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [farmer_id]
    );
    return rows;
  },

  async countActiveByFarmer(farmer_id: string): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM listings
       WHERE farmer_id = $1 AND status = 'active' AND expires_at > NOW()`,
      [farmer_id]
    );
    return parseInt(rows[0].count, 10);
  },

  async markSold(id: string, farmer_id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE listings SET status = 'sold' WHERE id = $1 AND farmer_id = $2`,
      [id, farmer_id]
    );
    return (rowCount ?? 0) > 0;
  },

  async cancel(id: string, farmer_id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE listings SET status = 'cancelled' WHERE id = $1 AND farmer_id = $2`,
      [id, farmer_id]
    );
    return (rowCount ?? 0) > 0;
  },

  // Cron: expire old listings
  async expireOld(): Promise<number> {
    const { rowCount } = await pool.query(
      `UPDATE listings SET status = 'expired'
       WHERE status = 'active' AND expires_at < NOW()`
    );
    return rowCount ?? 0;
  },

  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT l.*, u.name as farmer_name, u.phone as farmer_phone
       FROM listings l
       JOIN users u ON l.farmer_id = u.id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query(`SELECT COUNT(*) FROM listings`);
    return { listings: rows, total: parseInt(countRows[0].count, 10) };
  },
};
