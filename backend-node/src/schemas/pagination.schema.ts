import { z } from 'zod';

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

export const PaginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type PaginationQuery = z.infer<typeof PaginationQuery>;
