import { Router, Response } from 'express';
import { requireAdmin } from '../middleware';
import { usersService } from '../services/users.service';

export const usersRouter = Router();

// Admin: list all users
usersRouter.get('/', requireAdmin, async (_req, res: Response) => {
  const rows = await usersService.list();
  res.json(rows);
});
