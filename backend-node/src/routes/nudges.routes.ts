import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { NudgeCreate } from '../schemas/nudge.schema';
import { PaginationQuery } from '../schemas/pagination.schema';
import { AppError } from '../utils/AppError';

export const nudgesRouter = Router();

nudgesRouter.get(
  '/',
  requireAuth,
  validateQuery(PaginationQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit, offset } = req.pagination;
    // Filter by business_id via an inner join on transactions.business_id,
    // same approach as the FastAPI version.
    const { data, error, count } = await req.userSupabase
      .from('recovery_nudges')
      .select('*, transactions!inner(business_id)', { count: 'exact' })
      .eq('transactions.business_id', req.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return next(new AppError(502, `Failed to fetch nudges from Supabase: ${error.message}`));
    }

    const cleaned = (data ?? []).map(({ transactions: _transactions, ...rest }) => rest);
    res.set('X-Total-Count', String(count ?? cleaned.length));
    res.json(cleaned);
  }
);

nudgesRouter.post(
  '/',
  requireAuth,
  validateBody(NudgeCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    const { data: customer, error: customerError } = await req.userSupabase
      .from('customers')
      .select('business_id')
      .eq('id', req.body.customer_id)
      .single();

    if (customerError) {
      return next(new AppError(502, `Failed to verify customer in Supabase: ${customerError.message}`));
    }
    if (customer.business_id !== req.userId) {
      return next(new AppError(403, 'Unauthorized: Customer does not belong to this business'));
    }

    const { data, error } = await req.userSupabase.from('recovery_nudges').insert(req.body).select().single();

    if (error) {
      return next(new AppError(502, `Failed to insert nudge into Supabase: ${error.message}`));
    }
    res.status(201).json(data);
  }
);

nudgesRouter.post(
  '/:nudgeId/send',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { nudgeId } = req.params;

    const { error: lookupError } = await req.userSupabase
      .from('recovery_nudges')
      .select('*, transactions!inner(business_id)')
      .eq('id', nudgeId)
      .eq('transactions.business_id', req.userId)
      .single();

    if (lookupError) {
      return next(new AppError(404, 'Nudge not found or unauthorized'));
    }

    const { data, error } = await req.userSupabase
      .from('recovery_nudges')
      .update({ status: 'SENT', sent_at: new Date().toISOString() })
      .eq('id', nudgeId)
      .select()
      .single();

    if (error) {
      return next(new AppError(502, `Failed to send/update nudge in Supabase: ${error.message}`));
    }
    res.json(data);
  }
);
