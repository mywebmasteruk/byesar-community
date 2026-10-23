# Task 0 proof: design

Branch `design`, rebased on the latest `main`. Public pages only. Write routes, the write gate, and API logic were not changed.

## What changed

- Home `/` is a generic community page with links to `/c/demo` (English) and `/c/demo-arabic` (Arabic, right to left).
- Community pages have a header: name, a logo slot (first character of the name), and a short description. The two demo slugs have a generic line of copy. Other communities get the same fallback. Descriptions are not stored in the database.
- Question cards show the title, an excerpt, the answer count, the time (UTC), and the status.
- Empty states explain that a post appears after a moderator reads it.
- Question, answer, and report forms have labels, helper text, and a bordered slot for the Cloudflare check. A held post (HTTP 202) shows "Waiting for approval".
- `/moderation` uses the same palette, with a labelled token field and empty states. The requests it sends are unchanged.
- Light and dark colour tokens live in `apps/web/styles/tokens.css`. Text pairs used on these pages meet WCAG AA (checked in `public-copy.test.mjs`).
- Public product name, title, and description defaults are the generic word Community. Demo communities are `demo` and `demo-arabic`.

## Checks run here

- `npx --yes pnpm@11.18.0 --filter web typecheck` passed (`tsc --noEmit`, exit 0).
- `node --test --experimental-strip-types lib/community/*.test.mjs lib/moderation/*.test.mjs` from `apps/web`: 26 passed, 0 failed. The original 19 are included. Full output: `test-output.txt`.

## Proof checklist

| Item | Status |
| --- | --- |
| Header with community name, logo slot, and short description | done |
| Question cards: title, excerpt, answer count, time, status | done |
| Empty state | done |
| Forms with helper text, a Cloudflare slot, and a waiting-for-approval confirmation | done |
| Report form on the question page, posting to the existing route | done |
| Calm light and dark tokens | done |
| Starter product name removed from public pages and env defaults | done |
| Demo slugs are `demo` and `demo-arabic` only | done |
| Write gate and API logic left untouched | done |
| Existing tests still pass, plus the new display tests | done |
| Screenshots at 375px and desktop, English and Arabic, community page and the form | not done |
| Lighthouse accessibility score | not done |
| Preview URL | not done |

Screenshots and Lighthouse were not taken. Browser tools were unavailable, and a local dev server returned HTTP 500 before any page rendered because the existing proxy calls `URLPattern` and this Node build throws "URLPattern is not a constructor". There is no demo database in this environment.
