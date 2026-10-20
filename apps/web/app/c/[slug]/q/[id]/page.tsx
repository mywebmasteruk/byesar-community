import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '~/lib/community/public-client';
import { dirFor, isValidSlug, pickLocale } from '~/lib/community/resolve';


const UUID = /^[0-9a-f-]{36}$/i;
const text = {
  en: { back: 'Back', answers: 'Answers', none: 'No answers yet.', disclaimer: 'Community opinion, not a fatwa or advice.' },
  ar: { back: 'رجوع', answers: 'الإجابات', none: 'لا توجد إجابات بعد.', disclaimer: 'رأي المجتمع، وليس فتوى أو نصيحة.' },
} as const;

async function QuestionContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug, id } = await params;
  if (!isValidSlug(slug) || !UUID.test(id)) notFound();

  const supabase = createClient();
  const { data: question } = await supabase
    .from('questions')
    .select('id,title,body,locale,community_id')
    .eq('id', id)
    .maybeSingle();
  if (!question) notFound();

  const locale = pickLocale((await searchParams).lang, pickLocale(question.locale));
  const t = text[locale];
  // RLS returns published answers only
  const { data: answers } = await supabase
    .from('answers')
    .select('id,body,created_at')
    .eq('question_id', id)
    .order('created_at', { ascending: true });

  return (
    <main lang={locale} dir={dirFor(locale)} className="mx-auto max-w-2xl p-6">
      <Link href={`/c/${slug}?lang=${locale}`} className="text-sm underline">{t.back}</Link>
      <h1 className="mt-3 text-2xl font-semibold">{question.title}</h1>
      <p className="mt-2 whitespace-pre-wrap">{question.body}</p>
      <p className="text-muted-foreground mt-2 text-sm">{t.disclaimer}</p>
      <h2 className="mt-6 text-lg font-medium">{t.answers}</h2>
      {answers?.length ? (
        <ul className="mt-2 space-y-3">
          {answers.map((a) => (
            <li key={a.id} className="whitespace-pre-wrap rounded border p-3">{a.body}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">{t.none}</p>
      )}
    </main>
  );
}

export default function QuestionPage(props: Parameters<typeof QuestionContent>[0]) {
  return (
    <Suspense fallback={null}>
      <QuestionContent {...props} />
    </Suspense>
  );
}
