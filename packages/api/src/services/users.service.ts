import { pool } from '../db/pool';

export type UserRole = 'farmer' | 'buyer' | 'admin';
export type Language = 'fr' | 'en';
export type Channel = 'telegram' | 'sms' | 'whatsapp';

export interface User {
  id: string;
  phone: string;
  name?: string;
  role: UserRole;
  language: Language;
  region?: string;
  channel: Channel;
  telegram_id?: number;
  is_active: boolean;
  registered_at: string;
}

export interface CreateUserInput {
  phone: string;
  name?: string;
  role?: UserRole;
  language?: Language;
  region?: string;
  channel: Channel;
  telegram_id?: number;
}

export const UsersService = {
  async findByPhone(phone: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );
    return rows[0] ?? null;
  },

  async findByTelegramId(telegram_id: number): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `SELECT * FROM users WHERE telegram_id = $1`,
      [telegram_id]
    );
    return rows[0] ?? null;
  },

  async create(input: CreateUserInput): Promise<User> {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (phone, name, role, language, region, channel, telegram_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.phone, input.name, input.role || 'farmer', input.language || 'fr', input.region, input.channel, input.telegram_id]
    );
    return rows[0];
  },

  async update(id: string, data: Partial<Pick<User, 'name' | 'role' | 'language' | 'region'>>): Promise<User> {
    const fields = Object.entries(data).filter(([, v]) => v !== undefined);
    const setClause = fields.map(([k], i) => `${k} = $${i + 2}`).join(', ');
    const values = fields.map(([, v]) => v);
    const { rows } = await pool.query<User>(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  },

  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT * FROM users ORDER BY registered_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query(`SELECT COUNT(*) FROM users`);
    return { users: rows, total: parseInt(countRows[0].count, 10) };
  },

  // Buyer alert subscriptions
  async subscribeToCropAlert(buyer_id: string, crop: string, region?: string): Promise<void> {
    await pool.query(
      `INSERT INTO buyer_alerts (buyer_id, crop, region)
       VALUES ($1, $2, $3)
       ON CONFLICT (buyer_id, crop, region) DO UPDATE SET is_active = true`,
      [buyer_id, crop.toLowerCase(), region]
    );
  },

  async getAlertSubscribers(crop: string, region?: string): Promise<User[]> {
    const { rows } = await pool.query<User>(
      `SELECT u.* FROM users u
       JOIN buyer_alerts ba ON ba.buyer_id = u.id
       WHERE ba.crop = $1
         AND ($2::text IS NULL OR ba.region ILIKE $2 OR ba.region IS NULL)
         AND ba.is_active = true
         AND u.is_active = true`,
      [crop.toLowerCase(), region ? `%${region}%` : null]
    );
    return rows;
  },
};
