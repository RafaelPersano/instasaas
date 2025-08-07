import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// These variables are expected to be set in the environment.
// Do not replace them with hardcoded values.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isSupabaseEnabled = supabaseUrl && supabaseAnonKey;

// Initialize the Supabase client, which will be null if the environment variables are not set.
export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// This check ensures that the rest of the application knows that supabase might be null,
// and it provides a helpful warning for developers.
if (!supabase) {
  console.warn(
    'Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set. Authentication features will be disabled.'
  );
}
