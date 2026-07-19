import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ detail: 'Route not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ detail: err.message });
  }
  console.error(err);
  res.status(500).json({ detail: 'Internal server error' });
}
