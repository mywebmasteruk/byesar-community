'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { Button } from '@kit/ui/button';

import { formCopy } from '~/lib/community/public-copy';

type Target = { type: 'question' | 'answer'; id: string; label: string };

type Props =
  | { kind: 'question'; slug: string; locale: 'en' | 'ar' }
  | { kind: 'answer'; slug: string; locale: 'en' | 'ar'; questionId: string }
  | { kind: 'report'; slug: string; locale: 'en' | 'ar'; targets: Target[] };

type FormState =
  | 'idle'
  | 'sending'
  | 'waiting'
  | 'published'
  | 'reported'
  | 'captcha'
  | 'rate'
  | 'rules'
  | 'err';

type TurnstileApi = {
  render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void }) => void;
};

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const controlClass =
  'border-input bg-background text-foreground focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2';

function whenTurnstile(): Promise<TurnstileApi | null> {
  const w = window as unknown as { turnstile?: TurnstileApi };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
  const script = existing ?? document.createElement('script');
  if (!existing) {
    script.src = SCRIPT;
    script.async = true;
    document.head.appendChild(script);
  }
  return new Promise((resolve) => {
    const ready = () => resolve(w.turnstile ?? null);
    if (w.turnstile) ready();
    else script.addEventListener('load', ready, { once: true });
  });
}

// Anonymous question, answer, and report forms. The request body is unchanged:
// the server gate still runs before anything is saved.
export function PostForm(props: Props) {
  const t = formCopy[props.locale];
  const uid = useId();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [token, setToken] = useState('');
  const [targetKey, setTargetKey] = useState(
    props.kind === 'report' ? `${props.targets[0]?.type ?? 'question'}:${props.targets[0]?.id ?? ''}` : '',
  );
  const [state, setState] = useState<FormState>('idle');
  const [widgetKey, setWidgetKey] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !box.current) return;
    let cancelled = false;
    const el = box.current;
    void whenTurnstile().then((api) => {
      if (cancelled || !el.isConnected) return;
      api?.render(el, { sitekey: siteKey, callback: setToken });
    });
    return () => {
      cancelled = true;
    };
  }, [siteKey, widgetKey]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');

    const path = props.kind === 'question' ? 'questions' : props.kind === 'answer' ? 'answers' : 'reports';
    let payload: Record<string, string>;
    if (props.kind === 'question') {
      payload = { title, body, locale: props.locale, token };
    } else if (props.kind === 'answer') {
      payload = { question_id: props.questionId, body, locale: props.locale, token };
    } else {
      const [type, id] = targetKey.split(':');
      payload = { target_type: type ?? '', target_id: id ?? '', reason: body, token };
    }

    const res = await fetch(`/api/c/${props.slug}/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 202) setState('waiting');
    else if (res.ok && props.kind === 'report') setState('reported');
    else if (res.ok) setState('published');
    else if (res.status === 403) setState('captcha');
    else if (res.status === 429) setState('rate');
    else if (res.status === 422) setState('rules');
    else setState('err');

    if (res.ok) {
      setTitle('');
      setBody('');
    }
  }

  if (state === 'waiting' || state === 'published' || state === 'reported') {
    const heading = state === 'waiting' ? t.waitingTitle : state === 'reported' ? t.reportOkTitle : t.publishedTitle;
    const message = state === 'waiting' ? t.waitingBody : state === 'reported' ? t.reportOkBody : t.publishedBody;
    return (
      <div role="status" className="border-border bg-accent mt-6 rounded-lg border p-4" data-test="form-confirmation">
        <h3 className="text-base font-semibold">{heading}</h3>
        <p className="mt-1 text-sm leading-relaxed">{message}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 min-h-11"
          data-test="form-another"
          onClick={() => {
            setToken('');
            setState('idle');
            setWidgetKey((key) => key + 1);
          }}
        >
          {t.another}
        </Button>
      </div>
    );
  }

  const error =
    state === 'captcha' ? t.errCaptcha : state === 'rate' ? t.errRate : state === 'rules' ? t.errRules : state === 'err' ? t.err : '';

  const titleId = `${uid}-title`;
  const bodyId = `${uid}-body`;
  const reasonId = `${uid}-reason`;
  const securityId = `${uid}-security`;

  return (
    <form onSubmit={submit} className="mt-4 space-y-4" data-test={`form-${props.kind}`}>
      {props.kind === 'question' && (
        <div>
          <label htmlFor={titleId} className="block text-sm font-medium">
            {t.title}
          </label>
          <input
            id={titleId}
            className={`${controlClass} mt-1`}
            value={title}
            maxLength={200}
            required
            aria-describedby={`${titleId}-help`}
            data-test="question-title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <p id={`${titleId}-help`} className="text-muted-foreground mt-1 text-sm">
            {t.titleHelp}
          </p>
        </div>
      )}

      {props.kind === 'report' && props.targets.length > 1 && (
        <fieldset>
          <legend className="text-sm font-medium">{t.reportLegend}</legend>
          <div className="mt-2 space-y-2">
            {props.targets.map((target) => {
              const value = `${target.type}:${target.id}`;
              const id = `${uid}-${target.id}`;
              return (
                <label key={value} htmlFor={id} className="flex items-start gap-2 text-sm leading-relaxed">
                  <input
                    id={id}
                    type="radio"
                    name={`${uid}-target`}
                    className="mt-1 size-4"
                    value={value}
                    checked={targetKey === value}
                    onChange={() => setTargetKey(value)}
                  />
                  <span>{target.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor={props.kind === 'report' ? reasonId : bodyId} className="block text-sm font-medium">
          {props.kind === 'question' ? t.details : props.kind === 'answer' ? t.answer : t.reportReason}
        </label>
        <textarea
          id={props.kind === 'report' ? reasonId : bodyId}
          className={`${controlClass} mt-1 min-h-32`}
          value={body}
          maxLength={props.kind === 'report' ? 500 : 5000}
          rows={4}
          required
          aria-describedby={`${bodyId}-help`}
          data-test="form-body"
          onChange={(e) => setBody(e.target.value)}
        />
        <p id={`${bodyId}-help`} className="text-muted-foreground mt-1 text-sm">
          {props.kind === 'question' ? t.detailsHelp : props.kind === 'answer' ? t.answerHelp : t.reportHelp}
        </p>
      </div>

      <div>
        <p id={securityId} className="text-sm font-medium">
          {t.security}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{t.securityHelp}</p>
        <div
          ref={box}
          className="border-border bg-card mt-2 min-h-16 rounded-md border p-2"
          aria-labelledby={securityId}
          data-test="turnstile-slot"
        />
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="min-h-11 px-4" disabled={state === 'sending'} data-test="form-submit">
        {state === 'sending' ? t.sending : props.kind === 'report' ? t.reportSend : t.send}
      </Button>
    </form>
  );
}
