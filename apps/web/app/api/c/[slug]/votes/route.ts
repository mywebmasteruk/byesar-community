import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { rateLimited } from '~/lib/community/guards';
import { isValidSlug } from '~/lib/community/resolve';
import { clientIp, serviceDb } from '~/lib/community/server-db';

const UUID = /^[0-9a-f-]{36}$/i;

// Signed-in users only. No anonymous voting: the votes table is keyed by user.
// Order: rate limit -> session -> validation -> target must be published in this community.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (rateLimited(`v:${clientIp(req)}`, 60)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: 'sign_in_required' }, { status: 401 });

  const b = (await req.json().catch(() => ({}))) as { target_type?: string; target_id?: string; value?: number };
  if (!['question', 'answer'].includes(b.target_type ?? '') || !b.target_id || !UUID.test(b.target_id) || ![-1, 0, 1].includes(b.value as number)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const db = serviceDb();
  const { data: community } = await db.from('communities').select('id').eq('slug', slug).maybeSingle();
  if (!community) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const table = b.target_type === 'question' ? 'questions' : 'answers';
  const { data: target } = await db.from(table).select('id').eq('id', b.target_id)
    .eq('community_id', community.id).eq('status', 'published').maybeSingle();
  if (!target) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const key = { user_id: user.id, target_type: b.target_type, target_id: b.target_id };
  const { error } = b.value === 0
    ? await db.from('votes').delete().match(key)
    : await db.from('votes').upsert({ ...key, value: b.value });
  if (error) return NextResponse.json({ error: 'server' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
