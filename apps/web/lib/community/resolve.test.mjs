import test from 'node:test';
import assert from 'node:assert/strict';
import { communitySlugFromHost as f, isValidSlug, dirFor, pickLocale } from './resolve.ts';

test('subdomain becomes slug', () => assert.equal(f('prayer.example.community', 'example.community'), 'prayer'));
test('port ignored, case ignored', () => assert.equal(f('Prayer.example.community:3000', 'example.community'), 'prayer'));
test('root, www, other domains give null', () => {
  assert.equal(f('example.community', 'example.community'), null);
  assert.equal(f('www.example.community', 'example.community'), null);
  assert.equal(f('x.evil.com', 'example.community'), null);
  assert.equal(f('localhost:3000', 'example.community'), null);
});
test('nested subdomain and bad slug give null', () => {
  assert.equal(f('a.b.example.community', 'example.community'), null);
  assert.equal(f('-bad.example.community', 'example.community'), null);
});
test('slug validity', () => { assert.ok(isValidSlug('dua-prayer')); assert.ok(!isValidSlug('admin')); assert.ok(!isValidSlug('A b')); });
test('direction and locale', () => { assert.equal(dirFor('ar'), 'rtl'); assert.equal(dirFor('en'), 'ltr'); assert.equal(pickLocale('fr'), 'en'); assert.equal(pickLocale('ar'), 'ar'); });
