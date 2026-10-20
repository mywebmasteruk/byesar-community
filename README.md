# Byesar Community

An open-source question-and-answer community engine. One deployment runs many separate community spaces, each with its own questions, answers, moderators and settings. It supports English and Arabic (right-to-left) and is built so that nothing becomes public until a moderator has approved it.

Byesar Community is part of the Byesar group. It is MIT licensed and built on the Makerkit Lite starter (see [Licence](#licence)).

## Live demo

- English: https://byesar-community-demo.vercel.app/c/demo
- Arabic (right-to-left): https://byesar-community-demo.vercel.app/c/demo-arabic?lang=ar

The demo holds sample data only and may be reset at any time. Posts you submit there are held for approval and may never appear.

## Screenshots

Screenshots (phone and desktop, English and Arabic) will be added here after the current design work is merged, so they show the final look.

## Features

| Status | Feature |
| --- | --- |
| Built | Many community spaces on one engine, each at `/c/<slug>` (or `<slug>.<your-domain>`) |
| Built | Questions and answers with public reading of approved content |
| Built | Posting without an account, protected by a captcha and rate limits |
| Built | Moderation: every new post is held until a moderator approves or rejects it |
| Built | Reports, with a moderator queue |
| Built | Blocked-terms list and a limit of two links per post |
| Built | English and Arabic, with full right-to-left layout |
| In progress | New design for the public pages |
| Planned, batch 1 | Search, tags, sorting, pagination, related questions, dark mode, SEO and RSS |
| Planned, batch 2 | Sign-in, profiles and reputation, voting buttons, accepted answers, following, in-app notifications, safe Markdown |
| Planned, batch 3 | Moderation filters and bulk actions, audit log, per-community branding, community admin page, embeddable widget, privacy-friendly statistics, installable app |

Voting exists as a server route for signed-in users, but there is no sign-in or voting button in the interface yet.

## How it works

1. **Spaces.** Each community is a row in the `communities` table. A request to `/c/<slug>` (or to a subdomain, when `COMMUNITY_ROOT_DOMAIN` is set) is resolved to that community. Unknown communities return a real 404.
2. **Reading.** Anyone can read approved content. Database row-level security allows public reads of published rows only.
3. **Writing.** All writes go through server routes using a server-side database key. Every write passes the same gate, in this order:
   1. rate limit per IP address (5 per hour, 20 per day);
   2. captcha check (Cloudflare Turnstile);
   3. validation (length limits, at most two links, blocked terms);
   4. moderation hold.
4. **Moderation flow.** A new question or answer is saved as pending and the visitor is told it is waiting for approval. A moderator reviews the queue at `/moderation` and approves or rejects each item. Only approved items are public. Reports skip the hold and go straight to the moderator queue.

## Tech stack

- Next.js and React, TypeScript
- Supabase (PostgreSQL, row-level security, Auth)
- Cloudflare Turnstile for captcha
- pnpm workspace with Turborepo
- Node test runner for unit tests

## Quick start

You need Node.js 22.13 or newer, a Supabase project (or the Supabase CLI for a local one), and optionally a Cloudflare Turnstile widget.

```bash
git clone https://github.com/mywebmasteruk/byesar-community.git
cd byesar-community
npx pnpm@11.18.0 install
# then create apps/web/.env.local with the variables listed under Configuration
```

1. Apply the migrations in `apps/web/supabase/migrations/` to your Supabase database (with the Supabase CLI: `supabase db push`, or paste the files into the SQL editor in order).
2. Optionally load the sample content: run `apps/web/supabase/demo-seed.sql` in the SQL editor. It creates two sample communities, `demo` and `demo-arabic`.
3. Fill in `apps/web/.env.local` (see [Configuration](#configuration)).
4. Start the app:

```bash
npx pnpm@11.18.0 --filter web dev
```

Open http://localhost:3000/c/demo.

Checks to run before sending changes:

```bash
npx pnpm@11.18.0 --filter web typecheck
cd apps/web && node --test --experimental-strip-types lib/community/*.test.mjs lib/moderation/*.test.mjs
```

## Configuration

Use placeholder values in documentation and never commit real ones.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase public (publishable) key, used for reads. The older name `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works |
| `SUPABASE_SECRET_KEY` | yes | Supabase server-side secret key, used by the write routes. Keep it server-only |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL of the site |
| `NEXT_PUBLIC_PRODUCT_NAME` | no | Name shown in the interface |
| `NEXT_PUBLIC_COMMUNITY_DEMO` | no | Set to `true` to show the demo banner |
| `COMMUNITY_ROOT_DOMAIN` | no | Root domain for subdomain routing, for example `example.com` makes `demo.example.com` serve the `demo` community |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | for captcha | Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | for captcha | Turnstile secret key (server-only) |
| `CAPTCHA_REQUIRED` | no | Defaults to on. Set to `false` only for local development. With it on and no valid captcha token, write routes return 403 |
| `COMMUNITY_MODERATOR_TOKEN` | for moderation | A long random secret. The moderator page and the admin moderation API require it as a bearer token. Generate your own, for example with `openssl rand -hex 32` |

## Deploying

The app deploys to Vercel with Supabase as the database.

1. Create a Supabase project and apply the migrations.
2. Create a Vercel project from this repository. The root `vercel.json` sets the build for the `apps/web` app.
3. Add the environment variables above in the Vercel project settings (production), not in the repository.
4. Create a Turnstile widget for your domain and add its keys.
5. Deploy, then open `/c/<slug>` for one of your communities.

## Security

- **Reporting a problem:** please use GitHub private vulnerability reporting: open the Security tab of this repository and choose "Report a vulnerability". Do not post details in a public issue.
- **Spam protection:** every write is rate limited per IP, protected by a captcha, validated, and held for moderator approval before it becomes public. Reads are limited to approved rows by database policy.
- **Keys:** the server-side database key and moderator token are used only in server code and are never exposed to the browser.

## Contributing

Issues and pull requests are welcome. Please work on a branch, keep the write gate (rate limit, captcha, validation, moderation) first on every new write route with a test proving it, run the typecheck and tests above, add any new dependency to `THIRD-PARTY-NOTICES.md` (open licences only), and avoid secrets in commits.

## Licence

MIT. See [LICENSE](LICENSE). This project is built on the MIT-licensed Makerkit Lite starter; see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and [README.upstream.md](README.upstream.md).
