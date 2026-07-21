import 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

declare module 'express-serve-static-core' {
  interface Request {
    userId: string;
    userSupabase: SupabaseClient;
  }
}
