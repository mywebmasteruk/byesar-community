import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dirFor, isValidSlug, pickLocale } from '~/lib/community/resolve';
import { createClient } from '~/lib/community/public-client';


const text = {
  en: { empty: 'No questions yet.', disclaimer: 'Community opinion, not a fatwa or advice.', ask: 'Ask a question' },
  ar: { empty: 'لا توجد أسئلة بعد.', disclaimer: 'رأي المجتمع، وليس فتوى أو نصيحة.', ask: 'اطرح سؤالاً' },
} as const;

async function CommunityContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const supabase = createClient();
  const { data: community } = await supabase
    .from('communities')
    .select('id,name_en,name_ar,default_locale')
    .eq('slug', slug)
    .maybeSingle();
  if (!community) notFound();

  const locale = pickLocale((await searchParams).lang, pickLocale(community.default_locale));
  const t = text[locale];
  const name = locale === 'ar' && community.name_ar ? community.name_ar : community.name_en;

  // RLS only returns published rows
  const { data: questions } = await supabase
    .from('questions')
    .select('id,title,created_at')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main lang={locale} dir={dirFor(locale)} className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{name}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{t.disclaimer}</p>
      {questions?.length ? (
        <ul className="mt-6 space-y-3">
          {questions.map((q) => (
            <li key={q.id} className="rounded border p-3">
              <Link href={`/c/${slug}/q/${q.id}?lang=${locale}`}>{q.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6">{t.empty}</p>
      )}
    </main>
  );
}

export default function CommunityPage(props: Parameters<typeof CommunityContent>[0]) {
  return (
    <Suspense fallback={null}>
      <CommunityContent {...props} />
    </Suspense>
  );
}
