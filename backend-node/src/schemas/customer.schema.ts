import { z } from 'zod';

export const CustomerCreate = z.object({
  name: z.string().min(1),
  phone_number: z.string().nullable().optional(),
  current_balance: z.number().optional().default(0),
});

export type CustomerCreate = z.infer<typeof CustomerCreate>;

export interface CustomerRead {
  id: string;
  business_id: string;
  name: string;
  phone_number: string | null;
  current_balance: number;
  created_at: string;
  updated_at: string;
}
