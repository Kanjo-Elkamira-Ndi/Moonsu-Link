import { Router } from 'express';
import { ListingsService } from '../services/listings.service';
import { requireAdmin } from '../middleware/auth';

export const listingsRouter = Router();

listingsRouter.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await ListingsService.getAll(page, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

listingsRouter.patch('/:id/cancel', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await (await import('../db/pool')).pool.query(
      `UPDATE listings SET status = 'cancelled' WHERE id = $1`, [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Listing not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to cancel listing' });
  }
});
