import { createClient } from '@supabase/supabase-js';
import { settings } from '../config';

export const supabase = createClient(settings.SUPABASE_URL, settings.SUPABASE_KEY);
