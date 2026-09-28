# Supabase backend

Project: **TAG-test** (ref `lorbyyzwrrhonckbaoxq`, free plan, $0; pauses after 1 week without activity).
Dashboard: https://supabase.com/dashboard/project/lorbyyzwrrhonckbaoxq

## Layout
- Schema, triggers, RPCs, row level security and the `images` storage bucket: `supabase/migrations/`.
- Client: `apps/web/src/data/supabase/supabaseDataSource.ts`. Row mapping (camelCase to snake_case): `rows.ts`.
- Members are created by admins before they sign in. `claim_member()` links an auth user to the member with the same verified email on first sign-in (`accounts` table).
- Seed: `apps/web/scripts/seed-supabase.ts` upserts every `createSeed()` fixture (the mock data) and creates confirmed auth users. Re-runnable.

## Keys
- `apps/web/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Public by design; row level security guards data.
- `apps/web/.env.local` (gitignored): `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (service role). Bypasses row level security. Seed script only. Never prefix with `VITE_`, never commit.

## Go live
1. Apply schema (repo root): `supabase db push`
2. Seed: `pnpm --filter web seed:supabase`
   - Add `-- --dev-passwords` to set the repo's dev password on every seeded user so "Dev sign-in" works. Test projects only.
3. Dashboard, Auth, URL Configuration: Site URL = production URL; redirect URLs = `http://localhost:5173`, production URL.
4. `apps/web/.env`: `VITE_BACKEND=supabase`. Restart dev server.
5. Vercel env: `VITE_BACKEND=supabase`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Email
Built-in email sender is rate-limited (a few messages per hour) and meant for testing. Set custom SMTP (Auth, SMTP Settings) before real members sign in.

## Schema changes
New file in `supabase/migrations/` (`supabase migration new <name>`), then `supabase db push`. Never edit an applied migration.
