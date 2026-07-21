import 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PaginationQuery } from '../schemas/pagination.schema';

declare module 'express-serve-static-core' {
  interface Request {
    userId: string;
    userSupabase: SupabaseClient;
    pagination: PaginationQuery;
  }
}
