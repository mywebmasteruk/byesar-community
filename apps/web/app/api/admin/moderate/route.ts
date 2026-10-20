import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import { clientIp, serviceDb } from '~/lib/community/server-db';
import { rateLimited } from '~/lib/community/guards';

const UUID = /^[0-9a-f-]{36}$/i;
const STATUSES = ['published', 'rejected', 'hidden'];

function tokenOk(given: string | null) {
  const want = process.env.COMMUNITY_MODERATOR_TOKEN;
  if (!want || !given) return false; // fail closed
  const a = Buffer.from(given), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Moderator queue. The token travels in the Authorization header, never in a URL.
export async function GET(req: Request) {
  if (rateLimited(`m:${clientIp(req)}`, 30)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  if (!tokenOk(req.headers.get('authorization')?.replace(/^Bearer /, '') ?? null)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const db = serviceDb();
  const [q, a, r] = await Promise.all([
    db.from('questions').select('id,title,body,religious_flag,status').eq('status', 'pending').limit(50),
    db.from('answers').select('id,body,religious_flag,status').eq('status', 'pending').limit(50),
    db.from('reports').select('id,target_type,target_id,reason').eq('resolved', false).limit(50),
  ]);
  return NextResponse.json({ questions: q.data ?? [], answers: a.data ?? [], reports: r.data ?? [] });
}

export async function POST(req: Request) {
  if (rateLimited(`m:${clientIp(req)}`, 30)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  if (!tokenOk(req.headers.get('authorization')?.replace(/^Bearer /, '') ?? null)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const f = (await req.json().catch(() => null)) as {
    target_type?: string; id?: string; status?: string; report_id?: string;
  } | null;
  if (!f) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const db = serviceDb();
  if (f.report_id && UUID.test(f.report_id)) {
    await db.from('reports').update({ resolved: true }).eq('id', f.report_id);
  }
  if (f.id && UUID.test(f.id) && STATUSES.includes(f.status ?? '') && ['question', 'answer'].includes(f.target_type ?? '')) {
    const { error } = await db.from(f.target_type === 'question' ? 'questions' : 'answers')
      .update({ status: f.status }).eq('id', f.id);
    if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
