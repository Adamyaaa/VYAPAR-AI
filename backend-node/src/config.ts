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

const DEFAULT_DEV_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

export const settings = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_KEY: supabaseKey,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 8000,
  // Comma-separated in production (e.g. "https://app.vyapar.ai,https://vyapar.ai");
  // falls back to the local Vite dev ports when unset.
  BACKEND_CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : DEFAULT_DEV_CORS_ORIGINS,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 300,
};
