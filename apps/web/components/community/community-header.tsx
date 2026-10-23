import Link from 'next/link';

import { communityInitial, pageCopy } from '~/lib/community/public-copy';
import type { Locale } from '~/lib/community/resolve';

const fieldClass =
  'focus-visible:ring-ring rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function CommunityHeader({
  name,
  description,
  path,
  locale,
}: {
  name: string;
  description: string;
  path: string;
  locale: Locale;
}) {
  const t = pageCopy[locale];
  const initial = communityInitial(name);

  return (
    <header className="border-border bg-card rounded-lg border p-4 sm:p-5">
      <p className="text-sm">
        <Link href="/" className={`${fieldClass} text-primary font-medium underline-offset-4 hover:underline`}>
          {t.product}
        </Link>
      </p>
      <div className="mt-4 flex items-start gap-4">
        <div
          className="border-border bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-lg border text-xl font-semibold"
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <nav aria-label={t.language} className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link
          href={`${path}?lang=en`}
          hrefLang="en"
          lang="en"
          aria-current={locale === 'en' ? 'page' : undefined}
          className={`${fieldClass} underline-offset-4 hover:underline ${locale === 'en' ? 'font-semibold' : 'text-primary'}`}
          data-test="lang-en"
        >
          {t.english}
        </Link>
        <Link
          href={`${path}?lang=ar`}
          hrefLang="ar"
          lang="ar"
          aria-current={locale === 'ar' ? 'page' : undefined}
          className={`${fieldClass} underline-offset-4 hover:underline ${locale === 'ar' ? 'font-semibold' : 'text-primary'}`}
          data-test="lang-ar"
        >
          {t.arabic}
        </Link>
      </nav>
      <p className="text-muted-foreground mt-4 text-sm">{t.disclaimer}</p>
    </header>
  );
}
