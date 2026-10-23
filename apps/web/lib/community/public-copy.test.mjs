import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  answerCountLabel,
  communityBlurb,
  communityInitial,
  excerpt,
  formatWhen,
  formCopy,
  pageCopy,
  statusLabel,
} from './public-copy.ts';

test('excerpt keeps short text and closes a long one on a word', () => {
  assert.equal(excerpt('  hello   world  '), 'hello world');
  const long = 'word '.repeat(80);
  const out = excerpt(long, 40);
  assert.ok(out.endsWith('...'));
  assert.ok(out.length < 45);
  assert.ok(!out.includes('  '));
});

test('status labels stay plain in both languages', () => {
  assert.equal(statusLabel('en', 'pending'), 'Waiting for approval');
  assert.equal(statusLabel('ar', 'published'), 'منشور');
  assert.equal(statusLabel('en', 'custom'), 'custom');
});

test('answer counts use a simple plural', () => {
  assert.equal(answerCountLabel('en', 0), '0 answers');
  assert.equal(answerCountLabel('en', 1), '1 answer');
  assert.equal(answerCountLabel('ar', 0), 'لا إجابات');
  assert.equal(answerCountLabel('ar', 2), 'إجابتان');
  assert.equal(answerCountLabel('ar', 12), '12 إجابة');
});

test('known demos have a short description, others a fallback', () => {
  assert.match(communityBlurb('demo', 'en'), /English/);
  assert.match(communityBlurb('demo-arabic', 'ar'), /العربية/);
  assert.match(communityBlurb('other', 'en'), /moderator/);
});

test('initial is the first character, time is stable in UTC', () => {
  assert.equal(communityInitial('  Masjid'), 'M');
  assert.equal(communityInitial('مسجد'), 'م');
  assert.equal(communityInitial('   '), '');
  assert.equal(formatWhen('en', 'not-a-date'), '');
  assert.match(formatWhen('en', '2026-01-02T15:04:00.000Z'), /2026/);
});

test('public copy has no emoji and names the approval wait', () => {
  const blob = JSON.stringify({ pageCopy, formCopy });
  assert.equal(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(blob), false);
  assert.match(formCopy.en.waitingTitle, /Waiting for approval/);
  assert.match(formCopy.ar.waitingTitle, /بانتظار الموافقة/);
});

function lum(hex) {
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a, b) {
  const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
  return (hi + 0.05) / (lo + 0.05);
}

function tokens(block) {
  return Object.fromEntries(
    [...block.matchAll(/--tone-([a-z-]+):\s*#([0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );
}

test('light and dark brand tokens meet WCAG AA for text', () => {
  const css = readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8');
  const [light, dark] = css.split('.dark');
  for (const block of [tokens(light), tokens(dark)]) {
    assert.ok(contrast(block.ink, block.parchment) >= 4.5);
    assert.ok(contrast(block.ink, block.paper) >= 4.5);
    assert.ok(contrast(block.muted, block.parchment) >= 4.5);
    assert.ok(contrast(block.muted, block.paper) >= 4.5);
    assert.ok(contrast(block['on-pine'], block.pine) >= 4.5);
    assert.ok(contrast(block.ink, block['pine-soft']) >= 4.5);
  }
});
