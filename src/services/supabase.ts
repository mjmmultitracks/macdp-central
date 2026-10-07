import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  'https://sbcecbylxoqqbsextkrt.supabase.co';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
  'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://sua-url-aqui.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
