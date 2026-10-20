import { NextResponse } from 'next/server';

import { captchaRequired, gate } from '~/lib/community/guards';
import { isValidSlug, pickLocale } from '~/lib/community/resolve';
import { serviceDb } from '~/lib/community/server-db';
import { decideSubmission } from '~/lib/moderation/submit';

const UUID = /^[0-9a-f-]{36}$/i;

// Same pipeline as questions: rate limit -> Turnstile -> block list / religious hook -> insert.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const g = await gate(req, 'a');
  if (g.fail) return NextResponse.json({ error: g.fail.error }, { status: g.fail.status });
  const form = g.body as { question_id?: string; body?: string; locale?: string };
  if (!form.question_id || !UUID.test(form.question_id)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const db = serviceDb();
  const { data: community } = await db.from('communities').select('id,pre_moderation').eq('slug', slug).maybeSingle();
  if (!community) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { data: q } = await db.from('questions').select('id').eq('id', form.question_id)
    .eq('community_id', community.id).eq('status', 'published').maybeSingle();
  if (!q) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: terms } = await db.from('blocked_terms').select('term').or(`community_id.is.null,community_id.eq.${community.id}`);
  const locale = pickLocale(form.locale);
  const decision = await decideSubmission({ body: form.body ?? '', locale }, community, (terms ?? []).map((t) => t.term), !captchaRequired());
  if (!decision.ok) return NextResponse.json({ error: decision.reason }, { status: 422 });

  const { error } = await db.from('answers').insert({
    question_id: q.id, community_id: community.id, body: (form.body ?? '').trim(),
    status: decision.status, religious_flag: decision.religious_flag,
  });
  if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  return NextResponse.json({ ok: true, status: decision.status }, { status: decision.status === 'pending' ? 202 : 201 });
}
