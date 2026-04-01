import { Router } from 'express';
import { PricesService } from '../services/prices.service';
import { requireAdmin } from '../middleware/auth';

export const pricesRouter = Router();

pricesRouter.get('/', async (_req, res) => {
  try {
    const prices = await PricesService.getAll();
    res.json(prices);
  } catch {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

pricesRouter.get('/crops', async (_req, res) => {
  try {
    const crops = await PricesService.getAvailableCrops();
    res.json(crops);
  } catch {
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

pricesRouter.get('/:crop', async (req, res) => {
  try {
    const prices = await PricesService.getLatestForCrop(req.params.crop);
    res.json(prices);
  } catch {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

pricesRouter.post('/', requireAdmin, async (req, res) => {
  try {
    const { crop, market, region, min_price, max_price, unit, recorded_at } = req.body;
    if (!crop || !market || !region || !min_price || !max_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const price = await PricesService.upsert({
      crop, market, region,
      min_price: Number(min_price),
      max_price: Number(max_price),
      unit: unit || 'kg',
      recorded_at: recorded_at || new Date().toISOString().slice(0, 10),
    });
    res.status(201).json(price);
  } catch {
    res.status(500).json({ error: 'Failed to save price' });
  }
});
