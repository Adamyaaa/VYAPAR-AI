import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
import { requireBusinessId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { NudgeCreate } from '../schemas/nudge.schema';
import { AppError } from '../utils/AppError';

export const nudgesRouter = Router();

nudgesRouter.get('/', requireBusinessId, async (req: Request, res: Response, next: NextFunction) => {
  // Filter by business_id via an inner join on transactions.business_id,
  // same approach as the FastAPI version.
  const { data, error } = await supabase
    .from('recovery_nudges')
    .select('*, transactions!inner(business_id)')
    .eq('transactions.business_id', req.businessId);

  if (error) {
    return next(new AppError(502, `Failed to fetch nudges from Supabase: ${error.message}`));
  }

  const cleaned = (data ?? []).map(({ transactions: _transactions, ...rest }) => rest);
  res.json(cleaned);
});

nudgesRouter.post(
  '/',
  requireBusinessId,
  validateBody(NudgeCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('business_id')
      .eq('id', req.body.customer_id)
      .single();

    if (customerError) {
      return next(new AppError(502, `Failed to verify customer in Supabase: ${customerError.message}`));
    }
    if (customer.business_id !== req.businessId) {
      return next(new AppError(403, 'Unauthorized: Customer does not belong to this business'));
    }

    const { data, error } = await supabase.from('recovery_nudges').insert(req.body).select().single();

    if (error) {
      return next(new AppError(502, `Failed to insert nudge into Supabase: ${error.message}`));
    }
    res.status(201).json(data);
  }
);

nudgesRouter.post(
  '/:nudgeId/send',
  requireBusinessId,
  async (req: Request, res: Response, next: NextFunction) => {
    const { nudgeId } = req.params;

    const { error: lookupError } = await supabase
      .from('recovery_nudges')
      .select('*, transactions!inner(business_id)')
      .eq('id', nudgeId)
      .eq('transactions.business_id', req.businessId)
      .single();

    if (lookupError) {
      return next(new AppError(404, 'Nudge not found or unauthorized'));
    }

    const { data, error } = await supabase
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
