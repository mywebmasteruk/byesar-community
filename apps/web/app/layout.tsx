import { getMessages } from 'next-intl/server';

import { routing } from '@kit/i18n/routing';
import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { SiteHeader } from '~/components/site-header';
import { RootProviders } from '~/components/root-providers';
import appConfig from '~/config/app.config';
import { heading, sans } from '~/lib/fonts';
import { dirFor } from '~/lib/community/resolve';
import { getSiteLocale } from '~/lib/community/site-locale';
import { generateRootMetadata } from '~/lib/root-metdata';

import '../styles/globals.css';

/**
 * The site language (cookie / ?lang=) is read from a header set by proxy.ts, which
 * makes every route dynamic; that is the cost of server-rendering dir="rtl".
 *
 * Previously: the root layout awaited nothing request-bound on purpose. Reading the theme
 * cookie, the locale cookie or the session here makes every route in the app
 * dynamic, because nothing below it can prerender until that resolves.
 *
 * `getMessages` is safe to await: the locale is passed explicitly so next-intl
 * never falls back to its `requestLocale` getter, which reads `headers()`. What
 * is left is a set of static JSON imports — async, but not request data.
 *
 * The theme is resolved on the client instead: next-themes runs a script before
 * paint to apply the stored theme. `suppressHydrationWarning` is required
 * because it writes the theme class onto `<html>` before React hydrates.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = routing.defaultLocale;
  const siteLocale = (await getSiteLocale()) ?? 'en';
  const messages = await getMessages({ locale });

  return (
    <html lang={siteLocale} dir={dirFor(siteLocale)} className={getClassName()} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProviders
          theme={appConfig.theme}
          locale={locale}
          messages={messages}
        >
          <SiteHeader locale={siteLocale} />
          {children}

          {/* inside the providers so it can follow next-themes reactively */}
          <Toaster richColors={true} position="top-center" />
        </RootProviders>
      </body>
    </html>
  );
}

function getClassName() {
  const font = [sans.variable, heading.variable].reduce<string[]>(
    (acc, curr) => {
      if (acc.includes(curr)) return acc;

      return [...acc, curr];
    },
    [],
  );

  return cn('bg-background min-h-screen antialiased', ...font);
}

export const generateMetadata = generateRootMetadata;

export const instant = false;
