import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const authRouter = Router();

// Admin login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password required' });
    return;
  }

  const valid = password === env.ADMIN_PASSWORD ||
    (await bcrypt.compare(password, env.ADMIN_PASSWORD).catch(() => false));

  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, env.ADMIN_JWT_SECRET, {
    expiresIn: env.ADMIN_JWT_EXPIRES_IN as any,
  });

  res.json({ token });
});
