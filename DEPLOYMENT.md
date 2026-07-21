# Deploying Hisaab AI

Backend → Render, frontend → Vercel. Do these in order — the frontend needs
the backend's URL, and the backend needs the frontend's URL back for CORS.

## 1. Backend on Render

1. [render.com](https://render.com) → sign in → **New +** → **Blueprint**
2. Connect the `Adamyaaa/VYAPAR-AI` GitHub repo — Render reads `render.yaml`
   at the repo root automatically and proposes the `hisaab-ai-backend` service
3. When prompted for the env vars marked `sync: false`, paste in:
   - `SUPABASE_URL` — from your `.env` (`https://ekbxmcbuaqcjegrdqbvh.supabase.co`)
   - `SUPABASE_ANON_KEY` — from your `.env`
   - `CORS_ORIGINS` — leave blank for now, you'll set this in step 3
4. Deploy. Once live, note the URL Render gives you, e.g.
   `https://hisaab-ai-backend.onrender.com`
5. Sanity check: `curl https://hisaab-ai-backend.onrender.com/health/db`
   should return `{"status":"ok"}` — if it doesn't, the Supabase env vars are
   wrong, not the deploy itself

Free-tier Render web services spin down after 15 minutes idle and take
~30-50s to wake on the next request — expected, not a bug, on this plan.

## 2. Frontend on Vercel

1. [vercel.com](https://vercel.com) → sign in → **Add New** → **Project**
2. Import the same repo. When it asks for the **Root Directory**, set it to
   `frontend` (this is a monorepo — Vercel needs to know not to build from
   the repo root)
3. Framework preset should auto-detect as **Vite** — leave build/output
   settings as detected
4. Add these environment variables (Project Settings → Environment Variables):
   - `VITE_API_URL` = the Render URL from step 1 (no trailing slash)
   - `VITE_SUPABASE_URL` = `https://ekbxmcbuaqcjegrdqbvh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = from your `.env`
5. Deploy. Note the resulting URL, e.g. `https://vyapar-ai.vercel.app`

`frontend/vercel.json` already handles SPA routing (so refreshing on
`/ledger` or `/customers` doesn't 404) — nothing to configure there.

## 3. Close the loop: CORS + Supabase Auth URLs

1. Back in Render → your service → **Environment** → set `CORS_ORIGINS` to
   your Vercel URL from step 2 (e.g. `https://vyapar-ai.vercel.app`) → save
   (Render redeploys automatically on env var change)
2. In Supabase Dashboard → **Authentication** → **URL Configuration**:
   - **Site URL**: your Vercel URL
   - **Redirect URLs**: add your Vercel URL (and `http://localhost:5173` if
     you still want local dev sign-in to keep working)
   Without this, email confirmation links will redirect to the wrong place.

## 4. Before real users touch it

- Apply `supabase/migrations/0002_customer_balance_trigger.sql` in the
  Supabase SQL Editor if you haven't yet — see `supabase/migrations/README.md`.
- The signup rate-limit issue from earlier testing was specific to the
  Supabase free-tier email service and applies here too — don't load-test
  signup against production.

## What's not handled yet

- Custom domain (works the same way on both platforms whenever you're ready —
  just needs DNS records added at your registrar)
- Vercel **preview deployments** (per-branch/PR URLs) won't pass CORS against
  the Render backend unless you add each preview URL to `CORS_ORIGINS` too —
  fine for now since there's only `main`
