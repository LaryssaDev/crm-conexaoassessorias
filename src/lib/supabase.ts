import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('Supabase URL or Anon Key is missing. The application will use local initial data. Please configure Supabase in the Settings menu to enable cloud sync.');
}

// Use a valid-looking but non-functional URL if not configured to avoid immediate crashes
// but we will guard calls with isConfigured
export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);
