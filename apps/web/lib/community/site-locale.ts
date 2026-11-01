import { headers } from 'next/headers';

import { SITE_LANG_HEADER, siteLocaleFrom, type Locale } from './resolve';

// Language chosen by the visitor (?lang= or saved cookie), resolved once in proxy.ts.
export async function getSiteLocale(): Promise<Locale | null> {
  return siteLocaleFrom((await headers()).get(SITE_LANG_HEADER), null);
}
