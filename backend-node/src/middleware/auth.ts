import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Carried over as-is from the FastAPI version: business identity comes from a
 * client-supplied header, not a verified session. This is a known gap
 * (see Phase 1 of the roadmap) and is not being fixed as part of this port.
 */
export function requireBusinessId(req: Request, _res: Response, next: NextFunction) {
  const businessId = req.header('x-user-id');
  if (!businessId) {
    return next(new AppError(401, 'Missing x-user-id header'));
  }
  req.businessId = businessId;
  next();
}
