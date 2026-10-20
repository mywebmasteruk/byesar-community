'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@kit/ui/button';

type Item = { id: string; title?: string; body: string; religious_flag: boolean };
type Report = { id: string; target_type: 'question' | 'answer'; target_id: string; reason: string };

const controlClass =
  'border-input bg-background text-foreground focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2';

// Moderator queue. The token is kept in memory only and sent as a header.
export default function ModerationQueue() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<{ questions: Item[]; answers: Item[]; reports: Report[] } | null>(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/moderate', { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) return setMsg(res.status === 401 ? 'Wrong token.' : 'Error.');
    setMsg('');
    setData(await res.json());
  }
  async function act(body: object) {
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    await load();
  }

  function onLoad(e: FormEvent) {
    e.preventDefault();
    void load();
  }

  const row = (type: 'question' | 'answer', i: Item) => (
    <li key={i.id} className="border-border bg-card rounded-lg border p-4">
      {i.religious_flag ? <p className="text-sm font-medium">Religious text flag</p> : null}
      {i.title ? <h3 className="mt-1 font-semibold">{i.title}</h3> : null}
      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{i.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" data-test={`publish-${type}`} onClick={() => act({ target_type: type, id: i.id, status: 'published' })}>
          Publish
        </Button>
        <Button type="button" variant="outline" className="min-h-11" data-test={`reject-${type}`} onClick={() => act({ target_type: type, id: i.id, status: 'rejected' })}>
          Reject
        </Button>
      </div>
    </li>
  );

  return (
    <main dir="ltr" className="public-shell mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Moderation queue</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Read what is waiting, then publish it or refuse it. Nothing here is public until you publish it.
      </p>
      <form onSubmit={onLoad} className="mt-6">
        <label htmlFor="moderator-token" className="block text-sm font-medium">
          Moderator token
        </label>
        <p id="moderator-token-help" className="text-muted-foreground mt-1 text-sm">
          Used only to load this queue. It stays in this tab and is not saved.
        </p>
        <input
          id="moderator-token"
          type="password"
          autoComplete="off"
          className={`${controlClass} mt-2`}
          aria-describedby="moderator-token-help"
          value={token}
          data-test="moderator-token"
          onChange={(e) => setToken(e.target.value)}
        />
        <Button type="submit" className="mt-3 min-h-11" data-test="moderation-load">
          Load queue
        </Button>
      </form>
      {msg ? (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {msg}
        </p>
      ) : null}
      {data ? (
        <>
          <section aria-labelledby="pending-questions" className="mt-8">
            <h2 id="pending-questions" className="font-medium">
              Pending questions ({data.questions.length})
            </h2>
            {data.questions.length ? (
              <ul className="mt-3 space-y-3">{data.questions.map((q) => row('question', q))}</ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">No questions are waiting.</p>
            )}
          </section>
          <section aria-labelledby="pending-answers" className="mt-8">
            <h2 id="pending-answers" className="font-medium">
              Pending answers ({data.answers.length})
            </h2>
            {data.answers.length ? (
              <ul className="mt-3 space-y-3">{data.answers.map((a) => row('answer', a))}</ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">No answers are waiting.</p>
            )}
          </section>
          <section aria-labelledby="open-reports" className="mt-8">
            <h2 id="open-reports" className="font-medium">
              Open reports ({data.reports.length})
            </h2>
            {data.reports.length ? (
              <ul className="mt-3 space-y-3">
                {data.reports.map((r) => (
                  <li key={r.id} className="border-border bg-card rounded-lg border p-4">
                    <p className="text-sm font-medium">
                      {r.target_type === 'question' ? 'Question' : 'Answer'}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">{r.target_id}</p>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{r.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        onClick={() => act({ target_type: r.target_type, id: r.target_id, status: 'hidden', report_id: r.id })}
                      >
                        Hide content
                      </Button>
                      <Button type="button" variant="outline" className="min-h-11" onClick={() => act({ report_id: r.id })}>
                        Dismiss
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">No open reports.</p>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
