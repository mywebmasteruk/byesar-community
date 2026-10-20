import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimited, turnstileOk } from './guards.ts';

test('6th post in the window is limited, other IPs are not', () => {
  for (let i = 0; i < 5; i++) assert.equal(rateLimited('a', 5, 1000, 100 + i), false);
  assert.equal(rateLimited('a', 5, 1000, 110), true);
  assert.equal(rateLimited('b', 5, 1000, 110), false);
});
test('window expires', () => { assert.equal(rateLimited('a', 5, 1000, 5000), false); });
test('turnstile fails closed with no secret or no token', async () => {
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal(await turnstileOk('tok', '1.1.1.1'), false);
  process.env.TURNSTILE_SECRET_KEY = 's';
  assert.equal(await turnstileOk(undefined, '1.1.1.1'), false);
});

import { gate } from './guards.ts';
const post = (body, ip) => new Request('http://x/', { method: 'POST', body, headers: { 'x-forwarded-for': ip } });
test('gate: empty, malformed and tokenless bodies get 403 before any validation', async () => {
  process.env.TURNSTILE_SECRET_KEY = 's';
  for (const [i, b] of ['', 'not json', '{}', '[]', '{"body":"x"}'].entries()) {
    const g = await gate(post(b, `9.9.9.${i}`), 'g');
    assert.equal(g.fail?.status, 403, `body ${JSON.stringify(b)}`);
  }
});
test('gate: rate limit runs before the captcha check', async () => {
  for (let i = 0; i < 5; i++) await gate(post('{}', '8.8.8.8'), 'rl');
  assert.equal((await gate(post('{}', '8.8.8.8'), 'rl')).fail?.status, 429);
});

test('captcha off: no token needed, strict 5/hour per IP, default stays required', async () => {
  delete process.env.CAPTCHA_REQUIRED;
  assert.equal((await gate(post('{}', '7.7.7.1'), 'dflt')).fail?.status, 403);
  process.env.CAPTCHA_REQUIRED = 'false';
  for (let i = 0; i < 5; i++) assert.equal((await gate(post('{}', '7.7.7.2'), 'off')).fail, null);
  assert.equal((await gate(post('{}', '7.7.7.2'), 'off')).fail?.status, 429);
  delete process.env.CAPTCHA_REQUIRED;
});
