import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback to anon key if service key is not provided yet, but warn the developer
const keyToUse = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not defined. Using ANON key. Server Actions may fail if RLS is strictly enforced.');
}

export const supabaseServer = createClient(supabaseUrl, keyToUse, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
