import { z } from 'zod';

const money = z.number().refine(
  (val) => Math.round(val * 100) === val * 100,
  { message: 'amount must have at most 2 decimal places' }
);

export const TransactionCreate = z.object({
  customer_id: z.string().uuid(),
  amount: money,
  type: z.enum(['CREDIT', 'DEBIT']),
  description: z.string().nullable().optional(),
  voice_url: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'CONFIRMED']).optional().default('PENDING'),
});

export type TransactionCreate = z.infer<typeof TransactionCreate>;

export const TransactionUpdate = z
  .object({
    amount: money.optional(),
    type: z.enum(['CREDIT', 'DEBIT']).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(['PENDING', 'CONFIRMED']).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'At least one field must be provided' });

export type TransactionUpdate = z.infer<typeof TransactionUpdate>;

export interface TransactionRead {
  id: string;
  business_id: string;
  customer_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string | null;
  voice_url: string | null;
  status: 'PENDING' | 'CONFIRMED';
  created_at: string;
  updated_at: string;
}
