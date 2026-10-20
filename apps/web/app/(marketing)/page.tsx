import Link from 'next/link';

const REPO_URL = 'https://github.com/mywebmasteruk/byesar-community';

export default function HomePage() {
  return (
    <main className={'mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16'}>
      <h1 className={'text-3xl font-semibold tracking-tight'}>Byesar Community (demo)</h1>
      <p className={'text-lg'}>
        An open-source question and answer forum for communities, in English and Arabic.
        Every post is read by a moderator before it appears.
      </p>
      <div className={'flex flex-wrap gap-3'}>
        <Link className={'rounded-md bg-primary px-4 py-2 text-primary-foreground'} href={'/c/demo'}>
          Open the demo
        </Link>
        <Link className={'rounded-md border px-4 py-2'} href={'/c/demo-arabic?lang=ar'} lang={'ar'}>
          Open the Arabic demo
        </Link>
      </div>
      <p>
        <a className={'underline'} href={REPO_URL} rel={'noopener noreferrer'}>
          Source code on GitHub
        </a>
      </p>
      <p className={'text-sm text-muted-foreground'}>
        This is a demo. Its data may be reset at any time.
      </p>
    </main>
  );
}
