import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { rateLimited, turnstileOk } from '~/lib/community/guards';
import { isValidSlug, pickLocale } from '~/lib/community/resolve';
import { decideSubmission } from '~/lib/moderation/submit';

// Anonymous or signed-in question submission. Order: slug -> rate limit -> Turnstile ->
// block list / religious hook / pre-moderation -> insert with the service role.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`q:${ip}`)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const form = (await req.json().catch(() => null)) as {
    title?: string; body?: string; locale?: string; token?: string;
  } | null;
  if (!form) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (!(await turnstileOk(form.token, ip))) return NextResponse.json({ error: 'captcha' }, { status: 403 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
  const { data: community } = await db.from('communities').select('id,pre_moderation').eq('slug', slug).maybeSingle();
  if (!community) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: terms } = await db.from('blocked_terms').select('term').or(`community_id.is.null,community_id.eq.${community.id}`);
  const locale = pickLocale(form.locale);
  const decision = await decideSubmission(
    { title: form.title, body: form.body ?? '', locale },
    community,
    (terms ?? []).map((t) => t.term),
  );
  if (!decision.ok) return NextResponse.json({ error: decision.reason }, { status: 422 });

  const { error } = await db.from('questions').insert({
    community_id: community.id,
    title: (form.title ?? '').trim(),
    body: (form.body ?? '').trim(),
    locale,
    status: decision.status,
    religious_flag: decision.religious_flag,
  });
  if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  return NextResponse.json({ ok: true, status: decision.status }, { status: 201 });
}
