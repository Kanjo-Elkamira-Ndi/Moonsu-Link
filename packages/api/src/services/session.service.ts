import { pool } from '../db/pool';

export interface Session {
  user_id: string;
  flow: string | null;
  step: string | null;
  data: Record<string, any>;
}

export const sessionService = {
  async get(userId: string): Promise<Session | null> {
    const { rows } = await pool.query(
      `SELECT * FROM sessions WHERE user_id = $1`, [userId]
    );
    return rows[0] ?? null;
  },

  async set(userId: string, flow: string, step: string, data: Record<string, any> = {}) {
    await pool.query(
      `INSERT INTO sessions (user_id, flow, step, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
         SET flow = $2, step = $3, data = $4, updated_at = NOW()`,
      [userId, flow, step, JSON.stringify(data)]
    );
  },

  async clear(userId: string) {
    await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  },
};