import { createClient as create } from '@supabase/supabase-js';

// Anonymous, read-only client. Row level security limits it to published rows.
export function createClient() {
  return create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
