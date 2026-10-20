import { NextResponse } from 'next/server';

import { rateLimited, turnstileOk } from '~/lib/community/guards';
import { isValidSlug, pickLocale } from '~/lib/community/resolve';
import { clientIp, serviceDb } from '~/lib/community/server-db';
import { decideSubmission } from '~/lib/moderation/submit';

const UUID = /^[0-9a-f-]{36}$/i;

// Same pipeline as questions: rate limit -> Turnstile -> block list / religious hook -> insert.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const ip = clientIp(req);
  if (rateLimited(`a:${ip}`)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const form = (await req.json().catch(() => null)) as {
    question_id?: string; body?: string; locale?: string; token?: string;
  } | null;
  if (!form || !form.question_id || !UUID.test(form.question_id)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (!(await turnstileOk(form.token, ip))) return NextResponse.json({ error: 'captcha' }, { status: 403 });

  const db = serviceDb();
  const { data: community } = await db.from('communities').select('id,pre_moderation').eq('slug', slug).maybeSingle();
  if (!community) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { data: q } = await db.from('questions').select('id').eq('id', form.question_id)
    .eq('community_id', community.id).eq('status', 'published').maybeSingle();
  if (!q) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: terms } = await db.from('blocked_terms').select('term').or(`community_id.is.null,community_id.eq.${community.id}`);
  const locale = pickLocale(form.locale);
  const decision = await decideSubmission({ body: form.body ?? '', locale }, community, (terms ?? []).map((t) => t.term));
  if (!decision.ok) return NextResponse.json({ error: decision.reason }, { status: 422 });

  const { error } = await db.from('answers').insert({
    question_id: q.id, community_id: community.id, body: (form.body ?? '').trim(),
    status: decision.status, religious_flag: decision.religious_flag,
  });
  if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  return NextResponse.json({ ok: true, status: decision.status }, { status: 201 });
}
