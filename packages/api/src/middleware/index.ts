import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// ─── Auth middleware

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    jwt.verify(auth.slice(7), env.ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireApiSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-api-secret'];
  if (secret !== env.API_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// ─── Error handler 

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (env.NODE_ENV === 'development') console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
}

// ─── Request logger 

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
  });
  next();
}
