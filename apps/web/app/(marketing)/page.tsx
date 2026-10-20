import Link from 'next/link';

import { communityBlurb } from '~/lib/community/public-copy';

const communities = [
  {
    slug: 'demo',
    name: 'Demo',
    href: '/c/demo',
  },
  {
    slug: 'demo-arabic',
    name: 'Demo (Arabic)',
    href: '/c/demo-arabic?lang=ar',
  },
] as const;

function Home() {
  return (
    <main className="public-shell mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-primary text-sm font-medium">Community</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        A calm place for community questions
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
        Ask in English or Arabic. A moderator reads every post before it appears.
        What you read is community opinion, not a fatwa or advice.
      </p>
      <section aria-labelledby="demo-communities" className="mt-10">
        <h2 id="demo-communities" className="text-lg font-semibold">
          Demo communities
        </h2>
        <ul className="mt-4 grid gap-4" data-test="home-communities">
          {communities.map((community) => (
            <li key={community.slug} className="border-border bg-card rounded-lg border p-4">
              <h3 className="text-lg font-semibold">
                <Link
                  href={community.href}
                  className="focus-visible:ring-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2"
                >
                  {community.name}
                </Link>
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {communityBlurb(community.slug, 'en')}
              </p>
              <p className="mt-3 flex flex-wrap gap-4 text-sm">
                <Link
                  href={`/c/${community.slug}`}
                  className="text-primary focus-visible:ring-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2"
                >
                  English
                </Link>
                <Link
                  href={`/c/${community.slug}?lang=ar`}
                  hrefLang="ar"
                  lang="ar"
                  className="text-primary focus-visible:ring-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2"
                >
                  العربية
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Home;
