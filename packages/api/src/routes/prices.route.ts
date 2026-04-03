import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware';
import { pricesService } from '../services/prices.service';

export const pricesRouter = Router();

// Admin: list all prices
pricesRouter.get('/', requireAdmin, async (_req, res: Response) => {
  const rows = await pricesService.list();
  res.json(rows);
});

// Admin: upsert a price entry
pricesRouter.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { crop, market, region, min_price, max_price } = req.body;
  if (!crop || !market || !min_price || !max_price) {
    res.status(400).json({ error: 'crop, market, min_price, max_price required' });
    return;
  }
  await pricesService.upsert({ crop, market, region, minPrice: Number(min_price), maxPrice: Number(max_price) });
  res.json({ ok: true });
});
