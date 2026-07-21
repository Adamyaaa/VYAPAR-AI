import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { CustomerCreate } from '../schemas/customer.schema';
import { PaginationQuery } from '../schemas/pagination.schema';
import { AppError } from '../utils/AppError';

export const customersRouter = Router();

customersRouter.get(
  '/',
  requireAuth,
  validateQuery(PaginationQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit, offset } = req.pagination;
    const { data, error, count } = await req.userSupabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('business_id', req.userId)
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) {
      return next(new AppError(502, `Failed to fetch customers from Supabase: ${error.message}`));
    }
    res.set('X-Total-Count', String(count ?? data?.length ?? 0));
    res.json(data);
  }
);

customersRouter.post(
  '/',
  requireAuth,
  validateBody(CustomerCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    const record = { ...req.body, business_id: req.userId };

    const { data, error } = await req.userSupabase.from('customers').insert(record).select().single();

    if (error) {
      return next(new AppError(502, `Failed to insert customer into Supabase: ${error.message}`));
    }
    res.status(201).json(data);
  }
);
