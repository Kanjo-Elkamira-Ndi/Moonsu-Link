import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
}

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const skip = ['/health'];
  if (!skip.includes(req.path)) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
}
