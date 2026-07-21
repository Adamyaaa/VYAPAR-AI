import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CustomerCreate } from '../schemas/customer.schema';
import { AppError } from '../utils/AppError';

export const customersRouter = Router();

customersRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const { data, error } = await req.userSupabase
    .from('customers')
    .select('*')
    .eq('business_id', req.userId)
    .order('name');

  if (error) {
    return next(new AppError(502, `Failed to fetch customers from Supabase: ${error.message}`));
  }
  res.json(data);
});

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
