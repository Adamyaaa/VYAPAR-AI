import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
import { requireBusinessId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { TransactionCreate } from '../schemas/transaction.schema';
import { AppError } from '../utils/AppError';

export const transactionsRouter = Router();

transactionsRouter.get('/', requireBusinessId, async (req: Request, res: Response, next: NextFunction) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', req.businessId)
    .order('created_at', { ascending: false });

  if (error) {
    return next(new AppError(502, `Failed to fetch transactions from Supabase: ${error.message}`));
  }
  res.json(data);
});

transactionsRouter.post(
  '/',
  requireBusinessId,
  validateBody(TransactionCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    const record = { ...req.body, business_id: req.businessId };

    const { data, error } = await supabase.from('transactions').insert(record).select().single();

    if (error) {
      return next(new AppError(502, `Failed to insert transaction into Supabase: ${error.message}`));
    }
    res.status(201).json(data);
  }
);
