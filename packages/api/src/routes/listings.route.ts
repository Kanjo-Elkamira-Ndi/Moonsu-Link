import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware';
import { listingsService } from '../services/listings.service';

export const listingsRouter = Router();

// Admin: get all listings
listingsRouter.get('/', requireAdmin, async (_req: Request, res: Response) => {
  const { pool } = await import('../db/pool');
  const { rows } = await pool.query(
    `SELECT l.*, u.phone as farmer_phone, u.name as farmer_name
     FROM listings l JOIN users u ON u.id = l.farmer_id
     ORDER BY l.created_at DESC`,
  );
  res.json(rows);
});
