import { NextResponse } from 'next/server';

import { rateLimited, turnstileOk } from '~/lib/community/guards';
import { isValidSlug } from '~/lib/community/resolve';
import { clientIp, serviceDb } from '~/lib/community/server-db';

const UUID = /^[0-9a-f-]{36}$/i;

// Anyone can report a question or answer; moderators see reports in the queue.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const ip = clientIp(req);
  if (rateLimited(`r:${ip}`, 10)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const f = (await req.json().catch(() => null)) as {
    target_type?: string; target_id?: string; reason?: string; token?: string;
  } | null;
  const reason = (f?.reason ?? '').trim().slice(0, 500);
  if (!f || !reason || !f.target_id || !UUID.test(f.target_id) || !['question', 'answer'].includes(f.target_type ?? '')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (!(await turnstileOk(f.token, ip))) return NextResponse.json({ error: 'captcha' }, { status: 403 });
  const db = serviceDb();
  const { data: community } = await db.from('communities').select('id').eq('slug', slug).maybeSingle();
  if (!community) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { error } = await db.from('reports').insert({
    community_id: community.id, target_type: f.target_type, target_id: f.target_id, reason,
  });
  if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
