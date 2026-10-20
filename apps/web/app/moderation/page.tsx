'use client';

import { useState } from 'react';

type Item = { id: string; title?: string; body: string; religious_flag: boolean };
type Report = { id: string; target_type: 'question' | 'answer'; target_id: string; reason: string };

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
      method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    await load();
  }

  const row = (type: 'question' | 'answer', i: Item) => (
    <li key={i.id} className="rounded border p-3">
      {i.religious_flag && <strong>[religious text flag] </strong>}
      <div>{i.title ?? ''}</div>
      <p className="whitespace-pre-wrap">{i.body}</p>
      <button className="me-2 underline" onClick={() => act({ target_type: type, id: i.id, status: 'published' })}>Publish</button>
      <button className="underline" onClick={() => act({ target_type: type, id: i.id, status: 'rejected' })}>Reject</button>
    </li>
  );

  return (
    <main dir="ltr" className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold">Moderation queue</h1>
      <input type="password" className="mt-3 w-full rounded border p-2" placeholder="Moderator token"
        value={token} onChange={(e) => setToken(e.target.value)} />
      <button className="mt-2 rounded border px-3 py-1" onClick={load}>Load</button>
      {msg && <p role="alert">{msg}</p>}
      {data && (
        <>
          <h2 className="mt-4 font-medium">Pending questions ({data.questions.length})</h2>
          <ul className="space-y-2">{data.questions.map((q) => row('question', q))}</ul>
          <h2 className="mt-4 font-medium">Pending answers ({data.answers.length})</h2>
          <ul className="space-y-2">{data.answers.map((a) => row('answer', a))}</ul>
          <h2 className="mt-4 font-medium">Open reports ({data.reports.length})</h2>
          <ul className="space-y-2">
            {data.reports.map((r) => (
              <li key={r.id} className="rounded border p-3">
                {r.target_type} {r.target_id}: {r.reason}
                <div>
                  <button className="me-2 underline" onClick={() => act({ target_type: r.target_type, id: r.target_id, status: 'hidden', report_id: r.id })}>Hide content</button>
                  <button className="underline" onClick={() => act({ report_id: r.id })}>Dismiss</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
