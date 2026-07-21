import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { TransactionCreate, TransactionUpdate } from '../schemas/transaction.schema';
import { PaginationQuery } from '../schemas/pagination.schema';
import { AppError } from '../utils/AppError';

export const transactionsRouter = Router();

transactionsRouter.get(
  '/',
  requireAuth,
  validateQuery(PaginationQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit, offset } = req.pagination;
    const { data, error, count } = await req.userSupabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('business_id', req.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return next(new AppError(502, `Failed to fetch transactions from Supabase: ${error.message}`));
    }
    res.set('X-Total-Count', String(count ?? data?.length ?? 0));
    res.json(data);
  }
);

transactionsRouter.post(
  '/',
  requireAuth,
  validateBody(TransactionCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    // Verify the customer belongs to this business before attaching a transaction
    // to it — RLS on `transactions` only guarantees business_id is your own, it
    // doesn't check that customer_id is (that's a separate table/relationship).
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

    const record = { ...req.body, business_id: req.userId };

    const { data, error } = await req.userSupabase.from('transactions').insert(record).select().single();

    if (error) {
      return next(new AppError(502, `Failed to insert transaction into Supabase: ${error.message}`));
    }
    res.status(201).json(data);
  }
);

// Deliberately does not allow moving a transaction to a different customer_id —
// that's a re-parenting of financial history, not a "quick edit" of a typo or
// status. The balance trigger (0002_customer_balance_trigger.sql) recalculates
// current_balance correctly for whichever fields do change here.
transactionsRouter.patch(
  '/:transactionId',
  requireAuth,
  validateBody(TransactionUpdate),
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;

    const { data, error } = await req.userSupabase
      .from('transactions')
      .update(req.body)
      .eq('id', transactionId)
      .eq('business_id', req.userId)
      .select()
      .single();

    // .single() errors when zero rows match, which — since business_id is
    // filtered above — covers both "doesn't exist" and "not yours" the same
    // way the nudges send-route already treats that ambiguity, for consistency.
    if (error) {
      return next(new AppError(404, 'Transaction not found or unauthorized'));
    }
    res.json(data);
  }
);
