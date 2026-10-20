// Works out which community (product space) a request is for.
// duaprayer.community.example -> "duaprayer"; the bare root domain, www, localhost
// and *.vercel.app preview hosts give null, and the path form /c/<slug> is used instead.
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,40}[a-z0-9])?$/;
const RESERVED = new Set(['www', 'app', 'api', 'admin', 'auth', 'mail']);

export function communitySlugFromHost(host: string, rootDomain: string): string | null {
  const h = host.toLowerCase().split(':')[0] ?? '';
  const root = rootDomain.toLowerCase();
  if (!root || h === root || !h.endsWith(`.${root}`)) return null;
  const sub = h.slice(0, -(root.length + 1));
  if (sub.includes('.') || RESERVED.has(sub) || !SLUG.test(sub)) return null;
  return sub;
}

export const isValidSlug = (s: string) => SLUG.test(s) && !RESERVED.has(s);

export type Locale = 'en' | 'ar';
export const dirFor = (l: Locale): 'ltr' | 'rtl' => (l === 'ar' ? 'rtl' : 'ltr');
export const pickLocale = (v: string | null | undefined, fallback: Locale = 'en'): Locale =>
  v === 'ar' || v === 'en' ? v : fallback;
