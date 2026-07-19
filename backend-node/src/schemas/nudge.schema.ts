import { z } from 'zod';

export const NudgeCreate = z.object({
  transaction_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  message_text: z.string().min(1),
  status: z.enum(['DRAFT', 'SENT']).optional().default('DRAFT'),
});

export type NudgeCreate = z.infer<typeof NudgeCreate>;

export interface NudgeRead {
  id: string;
  transaction_id: string;
  customer_id: string;
  message_text: string;
  status: 'DRAFT' | 'SENT';
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}
