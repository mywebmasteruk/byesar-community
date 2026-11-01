import Link from 'next/link';

import { headerCopy } from '~/lib/community/public-copy';
import { dirFor, type Locale } from '~/lib/community/resolve';

const REPO_URL = 'https://github.com/mywebmasteruk/byesar-community';

const focus =
  'focus-visible:ring-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = headerCopy[locale];
  const item = (code: Locale) =>
    `${focus} inline-flex min-h-11 items-center px-1 ${locale === code ? 'font-semibold' : 'text-primary'}`;

  return (
    <header dir={dirFor(locale)} lang={locale} className="border-border bg-background border-b" data-test="site-header">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-1 sm:px-6">
        <Link href="/" className={`${focus} inline-flex min-h-11 items-center font-semibold`}>
          {t.product}
        </Link>
        <nav aria-label={t.nav} className="flex flex-wrap items-center gap-x-4 text-sm">
          <Link href="/c/demo" className={`${focus} inline-flex min-h-11 items-center`}>
            {t.demo}
          </Link>
          <Link href="/c/demo?lang=ar" className={`${focus} inline-flex min-h-11 items-center`}>
            {t.arabicDemo}
          </Link>
          <Link href="/moderation" className={`${focus} inline-flex min-h-11 items-center`}>
            {t.moderation}
          </Link>
          <a href={REPO_URL} rel="noopener noreferrer" className={`${focus} inline-flex min-h-11 items-center`}>
            {t.github}
          </a>
          <span role="group" aria-label={t.language} className="flex items-center gap-2">
            <Link
              href="?lang=en"
              prefetch={false}
              hrefLang="en"
              lang="en"
              aria-current={locale === 'en' ? 'true' : undefined}
              className={item('en')}
              data-test="lang-en"
            >
              EN
            </Link>
            <Link
              href="?lang=ar"
              prefetch={false}
              hrefLang="ar"
              lang="ar"
              aria-current={locale === 'ar' ? 'true' : undefined}
              className={item('ar')}
              data-test="lang-ar"
            >
              عربي
            </Link>
          </span>
        </nav>
      </div>
    </header>
  );
}
