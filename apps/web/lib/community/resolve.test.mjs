import test from 'node:test';
import assert from 'node:assert/strict';
import { communitySlugFromHost as f, isValidSlug, dirFor, pickLocale } from './resolve.ts';

test('subdomain becomes slug', () => assert.equal(f('duaprayer.byesar.community', 'byesar.community'), 'duaprayer'));
test('port ignored, case ignored', () => assert.equal(f('DuaPrayer.byesar.community:3000', 'byesar.community'), 'duaprayer'));
test('root, www, other domains give null', () => {
  assert.equal(f('byesar.community', 'byesar.community'), null);
  assert.equal(f('www.byesar.community', 'byesar.community'), null);
  assert.equal(f('x.evil.com', 'byesar.community'), null);
  assert.equal(f('localhost:3000', 'byesar.community'), null);
});
test('nested subdomain and bad slug give null', () => {
  assert.equal(f('a.b.byesar.community', 'byesar.community'), null);
  assert.equal(f('-bad.byesar.community', 'byesar.community'), null);
});
test('slug validity', () => { assert.ok(isValidSlug('dua-prayer')); assert.ok(!isValidSlug('admin')); assert.ok(!isValidSlug('A b')); });
test('direction and locale', () => { assert.equal(dirFor('ar'), 'rtl'); assert.equal(dirFor('en'), 'ltr'); assert.equal(pickLocale('fr'), 'en'); assert.equal(pickLocale('ar'), 'ar'); });
