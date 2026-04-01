import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== config.ADMIN_USERNAME || password !== config.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, config.ADMIN_JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});
