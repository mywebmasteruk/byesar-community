import { NextResponse } from 'next/server';

import { gate } from '~/lib/community/guards';
import { isValidSlug } from '~/lib/community/resolve';
import { serviceDb } from '~/lib/community/server-db';

const UUID = /^[0-9a-f-]{36}$/i;

// Anyone can report a question or answer; moderators see reports in the queue.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const g = await gate(req, 'r', 10);
  if (g.fail) return NextResponse.json({ error: g.fail.error }, { status: g.fail.status });
  const f = g.body as { target_type?: string; target_id?: string; reason?: string };
  const reason = (f.reason ?? '').trim().slice(0, 500);
  if (!reason || !f.target_id || !UUID.test(f.target_id) || !['question', 'answer'].includes(f.target_type ?? '')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const db = serviceDb();
  const { data: community } = await db.from('communities').select('id').eq('slug', slug).maybeSingle();
  if (!community) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { error } = await db.from('reports').insert({
    community_id: community.id, target_type: f.target_type, target_id: f.target_id, reason,
  });
  if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
