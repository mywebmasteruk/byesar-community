import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CommunityHeader } from '~/components/community/community-header';
import { EmptyNote } from '~/components/community/empty-note';
import { PostForm } from '~/components/community/post-form';
import { createClient } from '~/lib/community/public-client';
import {
  answerCountLabel,
  communityBlurb,
  communityName,
  excerpt,
  formatWhen,
  formCopy,
  pageCopy,
  statusLabel,
} from '~/lib/community/public-copy';
import { dirFor, isValidSlug, pickLocale } from '~/lib/community/resolve';

const UUID = /^[0-9a-f-]{36}$/i;

type QuestionRow = {
  id: string;
  title: string;
  body: string;
  locale: string;
  community_id: string;
  created_at: string;
  status: string;
};

type AnswerRow = { id: string; body: string; created_at: string };

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
    .select('id,title,body,locale,community_id,created_at,status')
    .eq('id', id)
    .maybeSingle();
  if (!question) notFound();
  const row = question as QuestionRow;

  const locale = pickLocale((await searchParams).lang, pickLocale(row.locale));
  const t = pageCopy[locale];
  const f = formCopy[locale];
  const { data: community } = await supabase
    .from('communities')
    .select('id,name_en,name_ar')
    .eq('slug', slug)
    .maybeSingle();
  const sameCommunity = community?.id === row.community_id;

  // RLS returns published answers only.
  const { data: answers } = await supabase
    .from('answers')
    .select('id,body,created_at')
    .eq('question_id', id)
    .order('created_at', { ascending: true });
  const answerRows = (answers ?? []) as AnswerRow[];
  const when = formatWhen(locale, row.created_at);
  const targets = [
    { type: 'question' as const, id: row.id, label: f.thisQuestion },
    ...answerRows.map((answer, index) => ({
      type: 'answer' as const,
      id: answer.id,
      label: `${f.thisAnswer} ${index + 1}: ${excerpt(answer.body, 80)}`,
    })),
  ];

  return (
    <main lang={locale} dir={dirFor(locale)} className="public-shell mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      {sameCommunity && community ? (
        <CommunityHeader
          name={communityName(community, locale)}
          description={communityBlurb(slug, locale)}
          path={`/c/${slug}/q/${id}`}
          locale={locale}
        />
      ) : null}
      <p className="mt-4">
        <Link
          href={`/c/${slug}?lang=${locale}`}
          className="text-primary focus-visible:ring-ring rounded-sm text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2"
        >
          {t.back}
        </Link>
      </p>
      <article className="border-border bg-card mt-4 rounded-lg border p-4">
        {sameCommunity && community ? (
          <h2 className="text-2xl font-semibold tracking-tight">{row.title}</h2>
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">{row.title}</h1>
        )}
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">{row.body}</p>
        <p className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span>{answerCountLabel(locale, answerRows.length)}</span>
          {when ? <time dateTime={row.created_at}>{when}</time> : null}
          <span className="border-border bg-accent text-accent-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
            {statusLabel(locale, row.status)}
          </span>
        </p>
        <p className="text-muted-foreground mt-3 text-sm">{t.disclaimer}</p>
      </article>
      <section aria-labelledby="answers-heading" className="mt-8">
        <h2 id="answers-heading" className="text-lg font-semibold">
          {t.answers}
        </h2>
        {answerRows.length ? (
          <ul className="mt-4 space-y-3">
            {answerRows.map((answer) => {
              const answerWhen = formatWhen(locale, answer.created_at);
              return (
                <li key={answer.id} className="border-border bg-card rounded-lg border p-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{answer.body}</p>
                  {answerWhen ? (
                    <p className="text-muted-foreground mt-3 text-sm">
                      <time dateTime={answer.created_at}>{answerWhen}</time>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyNote title={t.noAnswersTitle} body={t.noAnswersBody} testId="empty-answers" />
          </div>
        )}
        <PostForm kind="answer" slug={slug} locale={locale} questionId={id} />
      </section>
      <section aria-labelledby="report-heading" className="mt-10">
        <h2 id="report-heading" className="text-lg font-semibold">
          {t.report}
        </h2>
        <PostForm kind="report" slug={slug} locale={locale} targets={targets} />
      </section>
    </main>
  );
}

export default function QuestionPage(props: Parameters<typeof QuestionContent>[0]) {
  return (
    <Suspense fallback={<main className="text-muted-foreground mx-auto max-w-2xl px-4 py-6 text-sm">Loading.</main>}>
      <QuestionContent {...props} />
    </Suspense>
  );
}
