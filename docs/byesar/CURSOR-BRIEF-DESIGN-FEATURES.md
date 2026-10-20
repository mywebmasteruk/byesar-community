# Cursor worker brief: design and features (BYE-90)

Owner: Abdelilah. Planner and verifier: BY-CTO1 (Claude). Builder: BY-CTO1-Cursor.
Repo: mywebmasteruk/byesar-community (private until the owner's go). Demo: https://byesar-community-demo.vercel.app

## Rules that never change
1. Branch per batch (`design`, `batch-1`, `batch-2`, `batch-3`). Never push to main. BY-CTO1 verifies and merges.
2. The write gate stays untouched and first on every write: rate limit, then captcha (flag CAPTCHA_REQUIRED), then validation, then moderation hold. See `apps/web/lib/community/guards.ts` and `app/api/c/[slug]/*`. New write routes must call `gate()` first and ship a test proving it.
3. Open licences only (MIT, Apache-2.0, BSD). Add every new dependency to `THIRD-PARTY-NOTICES.md` in the same commit. No paid service, no GPL/AGPL.
4. No emojis anywhere (UI text, code, docs, commits). A tick and a cross are the only symbols allowed.
5. Halal and modest: no imagery of people, modest palette, no fatwa-style content, no AI-generated content.
6. Every new feature sits behind a per-community on/off setting (column on `communities`, default off unless the batch says otherwise), so nothing can break the live demo.
7. No secrets in the repo. No env values printed. Keys live in Vercel env only.
8. Mobile first. Arabic RTL fully mirrored (`/c/masjidweb-demo?lang=ar`). WCAG AA contrast, visible keyboard focus, a label on every field.
9. Run `npx --yes pnpm@11.18.0 --filter web typecheck` and `node --test --experimental-strip-types lib/community/*.test.mjs lib/moderation/*.test.mjs` (from apps/web) before every push. All existing tests (19) must still pass.
10. Do not run SQL on the demo database. Put schema changes in a new file under `apps/web/supabase/migrations/` and tell BY-CTO1; BY-CTO1 applies it.
11. Proof per batch, in `docs/byesar/proof/<batch>/`: screenshots at 375px and desktop, EN and AR, community page and the form; test output; Lighthouse accessibility score. Preview URL first (`vercel deploy`, no `--prod`).
12. Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Commit as myWebmasterUk <youare@mywebmaster.co.uk>.

## Task 0: design (branch `design`), scope = public demo pages only
Home `/`, community page `/c/<slug>`, question detail, post/answer/report forms, the held-for-approval message, `/moderation`. Logic and routes untouched.
- Header with community name, logo slot and short description.
- Question cards: title, excerpt, answer count, time, status.
- Good empty state. Friendly forms with helper text, the Cloudflare box placed cleanly, a clear "waiting for approval" confirmation.
- Calm, trustworthy palette. Use Byesar brand tokens if defined in the repo, otherwise propose a small token set (light and dark) as CSS variables.
- Remove leftover "Makerkit" product name and title text from public pages and env defaults (keep LICENSE and notices).

## Batch 1: reading and finding
Search (Postgres full-text), tags per community, sort (new, unanswered, most answered), pagination, question detail with related questions, "similar questions" while typing, dark mode, SEO (sitemap, Open Graph, QAPage JSON-LD), RSS per community.

## Batch 2: people
Supabase sign-in (magic link) on the demo project, profiles with simple reputation, voting for signed-in users only (route exists: `/api/c/[slug]/votes`, add the buttons), asker marks accepted answer, follow a question, in-app notifications, safe Markdown (no raw HTML; code blocks).

## Batch 3: running a community
Moderation queue filters and bulk approve/reject, report reasons, banned-words auto-hold list, full audit log of every moderator action (who, what, when; append-only table), per-community branding (logo, colours, description), create a community from an admin page, embeddable widget, privacy-friendly stats (no tracking cookies), PWA install.

## Parked: do not build, needs the owner's go
Email notifications, AI answer drafts or AI moderation, any paid service, languages beyond EN and AR.
