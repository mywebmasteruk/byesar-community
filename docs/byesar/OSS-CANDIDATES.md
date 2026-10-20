# Open-source parts to consider (not added yet)
Licences below were read from GitHub on 20 Oct 2026. Nothing here is adopted until listed in THIRD-PARTY-NOTICES.md.

| Need | Candidate | Licence | Note |
|---|---|---|---|
| Markdown / rich editor for questions and answers | Tiptap (ueberdosis/tiptap) | MIT | Active; RTL needs testing |
| Showing Markdown safely | react-markdown (remarkjs) | MIT | Pair with a sanitiser |
| Rate limiting | Upstash ratelimit-js | MIT | Needs a Redis; alternative is a small Postgres table |
| Arabic / RTL UI | Tailwind logical properties (ms-/me-/start-/end-) + `dir="rtl"` | MIT (Tailwind) | No extra library needed; Lite already has i18n |
| Spam / bad-word filtering | To be searched (npm bad-word lists vary in licence) | check each | Our own block list table already exists |
| Voting | Plain Postgres table + RLS (already in our schema) | ours | No library needed |
| Reference engines (ideas only, not copied) | Apache Answer (Apache-2.0), Flarum (MIT) | permissive | NodeBB (GPL-3.0) and Discourse (GPL-2.0) are NOT to be copied without owner OK |
