import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Не настроены переменные окружения Supabase. Добавьте SUPABASE_URL и SUPABASE_ANON_KEY в .env.'
    : '';

export const supabase = supabaseConfigError ? null : createClient(supabaseUrl, supabaseAnonKey);
