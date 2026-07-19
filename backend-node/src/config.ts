import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL must be set in environment');
}
if (!supabaseKey) {
  throw new Error('SUPABASE_KEY or SUPABASE_ANON_KEY must be set in environment');
}

export const settings = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_KEY: supabaseKey,
  BACKEND_CORS_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
  ],
  PORT: Number(process.env.PORT) || 8000,
};
