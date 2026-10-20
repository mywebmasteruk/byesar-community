import { findBlockedTerm } from './blocklist.ts';
import { checkReligiousText } from './religious-text-check.ts';

export type SubmitInput = { title?: string; body: string; locale: 'en' | 'ar' };
export type Community = { pre_moderation: boolean };
export type Decision =
  | { ok: true; status: 'pending' | 'published'; religious_flag: boolean }
  | { ok: false; reason: 'empty' | 'too_long' | 'too_many_links' | 'blocked_term' };

const MAX_TITLE = 200;
const MAX_BODY = 5000;
const MAX_LINKS = 2;

export function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

// Decides what happens to a new question/answer. Blocked terms are refused outright;
// the religious-text hook flags a post and forces it to the moderator queue; communities
// with pre-moderation (the default) hold every post until a moderator publishes it.
export async function decideSubmission(
  input: SubmitInput,
  community: Community,
  blockedTerms: string[],
  forceHold = false, // captcha-off fallback: every post waits for a moderator
): Promise<Decision> {
  const title = (input.title ?? '').trim();
  const body = input.body.trim();
  if (!body && !title) return { ok: false, reason: 'empty' };
  if (title.length > MAX_TITLE || body.length > MAX_BODY) return { ok: false, reason: 'too_long' };
  if (countLinks(`${title}\n${body}`) > MAX_LINKS) return { ok: false, reason: 'too_many_links' };
  if (findBlockedTerm(`${title}\n${body}`, blockedTerms)) return { ok: false, reason: 'blocked_term' };
  const check = await checkReligiousText(`${title}\n${body}`, input.locale);
  const status = forceHold || community.pre_moderation || check.flagged ? 'pending' : 'published';
  return { ok: true, status, religious_flag: check.flagged };
}
