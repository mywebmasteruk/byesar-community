'use client';

import { useEffect, useRef, useState } from 'react';

type Props =
  | { kind: 'question'; slug: string; locale: 'en' | 'ar' }
  | { kind: 'answer'; slug: string; locale: 'en' | 'ar'; questionId: string };

const T = {
  en: { title: 'Title', body: 'Details', send: 'Send', ok: 'Thanks. It will appear after a moderator checks it.', err: 'Could not send. Please check your text and try again.', note: 'Community opinion, not a fatwa or advice.' },
  ar: { title: 'العنوان', body: 'التفاصيل', send: 'إرسال', ok: 'شكراً. سيظهر بعد مراجعة المشرف.', err: 'تعذر الإرسال. تحقق من النص وحاول مرة أخرى.', note: 'رأي المجتمع، وليس فتوى أو نصيحة.' },
} as const;

type TurnstileApi = { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void }) => void };

// Anonymous posting form with a Turnstile widget. Posts to the community API routes.
export function PostForm(props: Props) {
  const t = T[props.locale];
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [token, setToken] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');
  const box = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !box.current) return;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => box.current && (window as unknown as { turnstile?: TurnstileApi }).turnstile?.render(box.current, { sitekey: siteKey, callback: setToken });
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, [siteKey]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const path = props.kind === 'question' ? 'questions' : 'answers';
    const payload = props.kind === 'question'
      ? { title, body, locale: props.locale, token }
      : { question_id: props.questionId, body, locale: props.locale, token };
    const res = await fetch(`/api/c/${props.slug}/${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    });
    setState(res.ok ? 'ok' : 'err');
    if (res.ok) { setTitle(''); setBody(''); }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-2">
      {props.kind === 'question' && (
        <input className="w-full rounded border p-2" placeholder={t.title} value={title} maxLength={200}
          onChange={(e) => setTitle(e.target.value)} required />
      )}
      <textarea className="w-full rounded border p-2" placeholder={t.body} value={body} maxLength={5000} rows={4}
        onChange={(e) => setBody(e.target.value)} required={props.kind === 'answer'} />
      <div ref={box} />
      <p className="text-sm">{t.note}</p>
      <button type="submit" className="rounded border px-3 py-1">{t.send}</button>
      {state === 'ok' && <p role="status">{t.ok}</p>}
      {state === 'err' && <p role="alert">{t.err}</p>}
    </form>
  );
}
