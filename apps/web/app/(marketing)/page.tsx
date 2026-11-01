import Link from 'next/link';

import { homeCopy } from '~/lib/community/public-copy';
import { dirFor } from '~/lib/community/resolve';
import { getSiteLocale } from '~/lib/community/site-locale';

const REPO_URL = 'https://github.com/mywebmasteruk/byesar-community';
const INSTALL_URL = `${REPO_URL}#installation`;
const LICENCE_URL = `${REPO_URL}/blob/main/LICENSE`;

const focus =
  'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const button = `${focus} inline-flex min-h-11 items-center rounded-md px-5 py-2 font-medium`;
const section = 'mx-auto w-full max-w-3xl px-4 py-10 sm:px-6';

export default async function HomePage() {
  const locale = (await getSiteLocale()) ?? 'en';
  const t = homeCopy[locale];

  return (
    <div dir={dirFor(locale)} lang={locale} className={'flex w-full flex-1 flex-col'}>
      <main className={'flex flex-1 flex-col'}>
        <section className={`${section} flex flex-col gap-6 py-14 sm:py-20`} aria-labelledby={'hero-title'}>
          <h1 id={'hero-title'} className={'text-3xl font-semibold tracking-tight sm:text-4xl'}>
            {t.heroTitle}
          </h1>
          <p className={'text-lg'}>{t.heroLine}</p>
          <div className={'flex flex-wrap gap-3'}>
            <Link className={`${button} bg-primary text-primary-foreground`} href={'/c/demo'}>
              {t.viewDemo}
            </Link>
            <a
              className={`${button} border`}
              href={INSTALL_URL}
              rel={'noopener noreferrer'}
            >
              {t.install}
            </a>
          </div>
        </section>

        <section className={`${section} border-t`} aria-labelledby={'features-title'}>
          <h2 id={'features-title'} className={'text-2xl font-semibold'}>
            {t.featuresTitle}
          </h2>
          <p className={'text-muted-foreground mt-2'}>{t.featuresIntro}</p>
          <ul className={'mt-6 flex flex-col gap-3'}>
            {t.features.map((feature) => (
              <li key={feature} className={'flex items-start gap-3'}>
                <span className={'bg-secondary text-secondary-foreground shrink-0 rounded-md px-2 py-0.5 text-sm'}>
                  {t.built}
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${section} border-t`} aria-labelledby={'steps-title'}>
          <h2 id={'steps-title'} className={'text-2xl font-semibold'}>
            {t.stepsTitle}
          </h2>
          <ol className={'mt-6 flex flex-col gap-5'}>
            {t.steps.map((step, index) => (
              <li key={step.title} className={'flex items-start gap-4'}>
                <span
                  aria-hidden={'true'}
                  className={'border-border flex size-9 shrink-0 items-center justify-center rounded-full border font-semibold'}
                >
                  {new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en').format(index + 1)}
                </span>
                <div>
                  <h3 className={'font-semibold'}>{step.title}</h3>
                  <p className={'mt-1'}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${section} border-t`} aria-labelledby={'install-title'}>
          <h2 id={'install-title'} className={'text-2xl font-semibold'}>
            {t.installTitle}
          </h2>
          <p className={'mt-2'}>{t.installBody}</p>
          <p className={'mt-4'}>
            <a className={`${focus} inline-flex min-h-11 items-center rounded-sm underline`} href={INSTALL_URL} rel={'noopener noreferrer'}>
              {t.installLink}
            </a>
          </p>
        </section>

        <section className={`${section} border-t`} aria-labelledby={'licence-title'}>
          <h2 id={'licence-title'} className={'text-2xl font-semibold'}>
            {t.licenceTitle}
          </h2>
          <p className={'mt-2'}>
            {t.licenceLine}{' '}
            <a className={`${focus} rounded-sm underline`} href={LICENCE_URL} rel={'noopener noreferrer'}>
              {t.licenceLink}
            </a>
          </p>
        </section>
      </main>

      <footer className={'border-border border-t'}>
        <div className={'mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-6 text-sm sm:px-6'}>
          <p className={'text-muted-foreground'}>{t.footerDemo}</p>
          <p>
            <a className={`${focus} inline-flex min-h-11 items-center rounded-sm underline`} href={REPO_URL} rel={'noopener noreferrer'}>
              {t.footerSource}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
