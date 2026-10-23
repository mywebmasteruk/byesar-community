import Link from 'next/link';

import {
  answerCountLabel,
  excerpt,
  formatWhen,
  statusLabel,
} from '~/lib/community/public-copy';
import type { Locale } from '~/lib/community/resolve';

export function QuestionCard({
  href,
  title,
  body,
  createdAt,
  status,
  answerCount,
  locale,
}: {
  href: string;
  title: string;
  body: string;
  createdAt: string;
  status: string;
  answerCount: number;
  locale: Locale;
}) {
  const summary = excerpt(body);
  const when = formatWhen(locale, createdAt);

  return (
    <li>
      <Link
        href={href}
        className="border-border bg-card focus-visible:ring-ring block rounded-lg border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        data-test="question-card"
      >
        <h3 className="text-lg font-semibold leading-snug">{title}</h3>
        {summary ? (
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{summary}</p>
        ) : null}
        <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span>{answerCountLabel(locale, answerCount)}</span>
          {when ? <time dateTime={createdAt}>{when}</time> : null}
          <span className="border-border bg-accent text-accent-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
            {statusLabel(locale, status)}
          </span>
        </p>
      </Link>
    </li>
  );
}
