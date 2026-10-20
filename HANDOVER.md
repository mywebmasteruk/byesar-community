# Byesar Community — handover
Fresh repo (no old history), plain Next.js + Supabase. Private until the owner says go, after a full secret scan and a chosen licence (Apache-2.0 suggested).
Rules: never commit keys; preview deploys only; switching on for any product needs the owner's go; the old whatz-it code has committed secrets, so never copy its files.
Reference only: mywebmasteruk/byesar-community-makerkit-reference (plan + engine note in docs/byesar/).
Done (week 1, in progress): scaffold, core schema with RLS (supabase/migrations/0001_core.sql), religious-text checker hook, block list helper, EN/AR messages.
Next: subdomain-to-community routing, EN/AR RTL layout (dir="rtl"), Q&A pages, server routes (Turnstile, rate limit, moderation queue), Groq tagging, tests, preview deploy on a NEW Vercel project.
