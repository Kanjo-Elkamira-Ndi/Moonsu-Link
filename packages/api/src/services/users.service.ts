import { pool } from '../db/pool';
import { t } from '../config/templates';
import type { Lang } from '../config/templates';

export const usersService = {
  async setAlert({
    userId,
    crop,
    region,
    lang,
  }: {
    userId: string;
    crop: string;
    region: string;
    lang: Lang;
  }): Promise<string> {
    await pool.query(
      `INSERT INTO buyer_alerts (user_id, crop, region)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, crop, region) DO UPDATE SET active = TRUE`,
      [userId, crop, region],
    );
    return (t.alertSet[lang] as Function)(crop, region);
  },

  async list() {
    const { rows } = await pool.query(
      `SELECT id,
              name,
              role,
              region,
              lang,
              verified,
              telegram_id AS "telegramId",
              telegram_phone AS "telegramPhone",
              whatsapp_phone AS "whatsappPhone"
       FROM users
       ORDER BY created_at DESC`,
    );
    return rows;
  },

  async getById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
  },
};
