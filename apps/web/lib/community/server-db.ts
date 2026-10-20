import { createClient } from '@supabase/supabase-js';

// Service-role client. Server routes only, after Turnstile / rate limit / moderator checks.
export function serviceDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
}

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
