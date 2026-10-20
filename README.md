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

## Installation

Pick one route. Route A needs no programming. Route B is for developers.

### Route A: put it online (no programming)

You will create two free accounts (Supabase for the database, Vercel for hosting) and click through a few screens. About 20 minutes.

**Step 1. Create the database.**

1. Sign up at https://supabase.com and click New project. Choose a name, a database password (save it) and a region near your visitors.
2. When the project is ready, open Project settings, then API. Keep this page open; you need three values from it: the Project URL, the publishable key, and the secret key. Treat the secret key like a password.
3. Open the SQL Editor, click New query, and paste the contents of each file in `apps/web/supabase/migrations/` (oldest filename first). Press Run after each one. You should see "Success".

**Step 2. Create the website.**

1. Click this button: [Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmywebmasteruk%2Fbyesar-community&root-directory=apps%2Fweb&install-command=cd%20..%2F..%20%26%26%20npx%20--yes%20pnpm%4011.18.0%20install%20--frozen-lockfile&env=NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,SUPABASE_SECRET_KEY,COMMUNITY_MODERATOR_TOKEN&envDescription=See%20the%20Configuration%20section%20of%20the%20README&project-name=community&repository-name=community)
2. Vercel asks you to sign in and copy the repository into your own account.
3. Fill in the five values it asks for:
   - `NEXT_PUBLIC_SITE_URL`: your site address. If you do not know it yet, enter `https://example.com` now and correct it in Vercel settings after the first deploy.
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`: from Step 1.
   - `COMMUNITY_MODERATOR_TOKEN`: invent a long random password (at least 30 characters). You will use it to approve posts.
4. Click Deploy and wait for the build to finish.

Then continue with [First setup](#first-setup-after-installing). Captcha is on by default, so add your Turnstile keys there before opening the site to visitors.

### Route B: run it on your own computer (developers)

Prerequisites:

| Tool | Version | Needed for |
| --- | --- | --- |
| Node.js | 22.13 or newer | everything |
| pnpm | 11.18.0 (`npx pnpm@11.18.0` works without installing it) | everything |
| Git | any recent | cloning |
| Supabase CLI | 2.x | local database only |
| Docker Desktop | running | local database only |

You can skip the Supabase CLI and Docker by using a free hosted Supabase project as in Route A, Step 1.

```bash
git clone https://github.com/mywebmasteruk/byesar-community.git
cd byesar-community
npx pnpm@11.18.0 install
cp apps/web/.env.example apps/web/.env.local
```

Local database (needs Docker):

```bash
cd apps/web
supabase start          # prints the local API URL and keys
supabase db reset       # applies the migrations in supabase/migrations
```

Put the URL and keys that `supabase start` printed into `apps/web/.env.local`. With a hosted project, run the migrations in the SQL Editor as in Route A and use its URL and keys instead.

Load the sample communities (optional): run `apps/web/supabase/demo-seed.sql` in the SQL Editor (hosted) or with `psql` against the local database.

Start the app and open it:

```bash
cd ../..
npx pnpm@11.18.0 --filter web dev
```

Open http://localhost:3000/c/demo (it exists only if you loaded the sample communities, otherwise follow First setup below).

Run the checks:

```bash
npx pnpm@11.18.0 --filter web typecheck
cd apps/web && node --test --experimental-strip-types lib/community/*.test.mjs lib/moderation/*.test.mjs
```

### First setup after installing

1. **Create your first community.** In the Supabase SQL Editor run, changing the values:

   ```sql
   insert into communities (slug, name_en, name_ar, default_locale)
   values ('my-community', 'My community', 'مجتمعي', 'en');
   ```

   The community is then at `/c/my-community`. (An admin page for this is planned.)
2. **Set the moderator token.** It is the value of `COMMUNITY_MODERATOR_TOKEN`. Changing it in Vercel needs a redeploy; locally restart the dev server.
3. **Open `/moderation`.** Enter the token. You see the posts waiting for approval and can approve or reject each one.
4. **Turn the captcha on.** In the Cloudflare dashboard open Turnstile, add a widget for your domain, and copy the site key and the secret key. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` and `CAPTCHA_REQUIRED=true`, then redeploy. Without a valid captcha, posting is refused.
5. **Try it.** Post a question on your community page. It should say it is waiting for approval; approve it in `/moderation` and it appears.

### Updating

- Vercel route: in your copy of the repository on GitHub use Sync fork, then Vercel redeploys by itself. Run any new files from `apps/web/supabase/migrations/` that you have not run yet (oldest first) before or right after.
- Local: `git pull`, then `npx pnpm@11.18.0 install`, then `supabase db reset` (local database, erases local data) or run only the new migration files.

### Troubleshooting

| Problem | Cause and fix |
| --- | --- |
| Build fails on Vercel with a missing module or lockfile error | The install command was dropped. In Vercel project settings set Root Directory to `apps/web` and Install Command to `cd ../.. && npx --yes pnpm@11.18.0 install --frozen-lockfile` |
| The page shows an error about Supabase, or `/c/<slug>` is empty | A Supabase value is wrong or missing. Re-copy the URL and keys from Project settings, API, then redeploy |
| `/c/<slug>` returns 404 | No community with that slug exists. Run the insert in First setup and check the spelling |
| Posting says "captcha" or returns 403 | Captcha is on but the Turnstile keys are missing or belong to another domain. Add the right keys, or for local testing set `CAPTCHA_REQUIRED=false` |
| Posting returns 429 | Rate limit reached (5 per hour per address). Wait, then try again |
| `/moderation` says "Wrong token." | The token does not match `COMMUNITY_MODERATOR_TOKEN`. Check for extra spaces, and redeploy after changing it |
| `supabase start` fails | Docker Desktop is not running, or a port is in use. Start Docker, or use a hosted Supabase project |

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
