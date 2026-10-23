import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { CommunityHeader } from '~/components/community/community-header';
import { EmptyNote } from '~/components/community/empty-note';
import { PostForm } from '~/components/community/post-form';
import { QuestionCard } from '~/components/community/question-card';
import { createClient } from '~/lib/community/public-client';
import { communityBlurb, communityName, pageCopy } from '~/lib/community/public-copy';
import { dirFor, isValidSlug, pickLocale } from '~/lib/community/resolve';

type QuestionRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  status: string;
};

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
  const t = pageCopy[locale];
  const name = communityName(community, locale);

  // RLS only returns published rows.
  const { data: questions } = await supabase
    .from('questions')
    .select('id,title,body,created_at,status')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })
    .limit(50);
  const rows = (questions ?? []) as QuestionRow[];
  const counts = new Map<string, number>();
  if (rows.length > 0) {
    const { data: answers } = await supabase
      .from('answers')
      .select('question_id')
      .in(
        'question_id',
        rows.map((row) => row.id),
      );
    for (const answer of (answers ?? []) as { question_id: string }[]) {
      counts.set(answer.question_id, (counts.get(answer.question_id) ?? 0) + 1);
    }
  }

  return (
    <main lang={locale} dir={dirFor(locale)} className="public-shell mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <CommunityHeader
        name={name}
        description={communityBlurb(slug, locale)}
        path={`/c/${slug}`}
        locale={locale}
      />
      <section aria-labelledby="questions-heading" className="mt-8">
        <h2 id="questions-heading" className="text-lg font-semibold">
          {t.questions}
        </h2>
        {rows.length ? (
          <ul className="mt-4 space-y-3">
            {rows.map((question) => (
              <QuestionCard
                key={question.id}
                href={`/c/${slug}/q/${question.id}?lang=${locale}`}
                title={question.title}
                body={question.body}
                createdAt={question.created_at}
                status={question.status}
                answerCount={counts.get(question.id) ?? 0}
                locale={locale}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyNote title={t.emptyTitle} body={t.emptyBody} testId="empty-questions" />
          </div>
        )}
      </section>
      <section aria-labelledby="ask-heading" className="mt-10">
        <h2 id="ask-heading" className="text-lg font-semibold">
          {t.ask}
        </h2>
        <PostForm kind="question" slug={slug} locale={locale} />
      </section>
    </main>
  );
}

export default function CommunityPage(props: Parameters<typeof CommunityContent>[0]) {
  return (
    <Suspense fallback={<main className="text-muted-foreground mx-auto max-w-2xl px-4 py-6 text-sm">Loading.</main>}>
      <CommunityContent {...props} />
    </Suspense>
  );
}
