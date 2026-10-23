# Contributing to Byesar Community

Thanks for helping. Issues and pull requests are welcome. By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md), and your contributions are licensed under the project's [MIT licence](LICENSE).

## Reporting problems

- Bugs: open a GitHub issue using the bug report form.
- Security problems: do not open a public issue. Follow [SECURITY.md](SECURITY.md).

## Setting up

You need Node.js 24 and pnpm 11.18.0 (`npx pnpm@11.18.0` works without installing pnpm). The local database also needs the Supabase CLI and Docker, or you can use a free hosted Supabase project. The README has the full steps, including the environment variables: see [Route B in the README](README.md#route-b-run-it-on-your-own-computer-developers).

```bash
git clone https://github.com/mywebmasteruk/byesar-community.git
cd byesar-community
npx pnpm@11.18.0 install
cp apps/web/.env.example apps/web/.env.local   # then fill in your own values
npx pnpm@11.18.0 --filter web dev              # http://localhost:3000
```

Never commit `.env.local` or any real key, token or password.

## Checks to run before you open a pull request

```bash
npx pnpm@11.18.0 run lint                      # oxlint
npx pnpm@11.18.0 run format                    # oxfmt check; use format:fix to fix
npx pnpm@11.18.0 run typecheck                 # TypeScript, all workspaces
cd apps/web && node --test --experimental-strip-types lib/community/*.test.mjs lib/moderation/*.test.mjs
```

`pnpm run healthcheck` runs lint fixes, formatting and typecheck together. The unit tests above are the ones the README documents; the repository also has database tests (`pnpm --filter web supabase:test`) that need a running local Supabase.

## Making a change

1. Fork the repository or create a branch. Do not commit to `main`.
2. Keep the change small and focused on one thing.
3. Add or update tests when you change behaviour.
4. Open a pull request and fill in the template.

Project rules:

- Every new write route must apply the write gate first, in this order: rate limit, captcha, validation, moderation hold. Include a test that proves it.
- Nothing becomes public until a moderator has approved it. Do not add a path that skips this.
- Both English and Arabic (right-to-left) must keep working. Check your change in both.
- If you add a dependency, add it to [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Open licences only.
- No secrets or personal data in commits, issues, screenshots or test fixtures.
