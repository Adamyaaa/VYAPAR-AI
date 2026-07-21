import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { settings } from '../config';
import { AppError } from '../utils/AppError';

/**
 * Verifies the caller's Supabase Auth JWT and attaches:
 *  - req.userId: the authenticated user's id (== profiles.id == business_id)
 *  - req.userSupabase: a Supabase client scoped to this user's token, so
 *    every query it makes runs as that user and RLS is enforced correctly
 *    (auth.uid() resolves instead of being NULL, as it would on the shared
 *    anon-key client with no bearer token attached).
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) {
    return next(new AppError(401, 'Missing Authorization bearer token'));
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return next(new AppError(401, 'Invalid or expired session'));
  }

  req.userId = data.user.id;
  req.userSupabase = createClient(settings.SUPABASE_URL, settings.SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  next();
}
