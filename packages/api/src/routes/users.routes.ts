import { Router } from 'express';
import { UsersService } from '../services/users.service';
import { requireAdmin } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await UsersService.getAll(page, limit);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
