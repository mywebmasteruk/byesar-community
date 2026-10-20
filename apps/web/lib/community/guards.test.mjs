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
