## What does this change?

<!-- A short description of the change and why it is needed. Link the issue if there is one: Fixes #123 -->

## How did you test it?

<!-- Commands you ran and what you checked by hand. -->

## Checklist

- [ ] `pnpm run lint`, `pnpm run format` and `pnpm run typecheck` pass
- [ ] Unit tests pass (see CONTRIBUTING.md), and I added or updated tests for changed behaviour
- [ ] New write routes apply the write gate first (rate limit, captcha, validation, moderation hold) with a test
- [ ] English and Arabic (right-to-left) both still work, if the interface changed
- [ ] New dependencies are listed in `THIRD-PARTY-NOTICES.md` and have open licences
- [ ] No secrets, tokens or personal data in the diff
- [ ] I have read the [Code of Conduct](CODE_OF_CONDUCT.md)
