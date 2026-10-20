import test from 'node:test';
import assert from 'node:assert/strict';
import { decideSubmission as d } from './submit.ts';
import { setReligiousTextChecker } from './religious-text-check.ts';

const open = { pre_moderation: false }, strict = { pre_moderation: true };
const q = (body, title = 't') => ({ title, body, locale: 'en' });

test('empty refused', async () => assert.deepEqual(await d({ body: '  ', locale: 'en' }, open, []), { ok: false, reason: 'empty' }));
test('too long refused', async () => assert.equal((await d(q('x'.repeat(5001)), open, [])).reason, 'too_long'));
test('blocked term refused, case-insensitive', async () => assert.equal((await d(q('Best RIBA loan'), open, ['riba'])).reason, 'blocked_term'));
test('pre-moderation holds', async () => assert.equal((await d(q('hello'), strict, [])).status, 'pending'));
test('open community publishes', async () => assert.equal((await d(q('hello'), open, [])).status, 'published'));
test('religious flag forces pending', async () => {
  setReligiousTextChecker({ async check() { return { flagged: true }; } });
  const r = await d(q('hello'), open, []);
  assert.equal(r.status, 'pending'); assert.equal(r.religious_flag, true);
});

test('more than 2 links is refused; forceHold holds even without pre-moderation', async () => {
  const c = { pre_moderation: false };
  const r = await d({ body: 'http://a.com http://b.com www.c.com', locale: 'en' }, c, []);
  assert.equal(r.reason, 'too_many_links');
  const h = await d({ body: 'plain question', locale: 'en' }, c, [], true);
  assert.equal(h.status, 'pending');
});
