# Deployment Guide — Vercel + Neon

## 1. Create Neon database (free)

1. Go to [https://neon.tech](https://neon.tech) and sign up
2. Create a new project (e.g. `nbr-assist`)
3. Copy the **connection string** (pooled recommended for serverless)
   - Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

## 2. Push to GitHub

```bash
git add .
git commit -m "Deploy NBR Assist"
git push -u origin main
```

## 3. Deploy on Vercel

### Option A — Vercel Dashboard
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import `NazmusSakib3/nbr-assist`
3. Add environment variables (see below)
4. Deploy

### Option B — Vercel CLI
```bash
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel env add JWT_SECRET production
npx vercel env add GEMINI_API_KEY production
npx vercel env add GEMINI_CHAT_MODEL production
npx vercel env add GEMINI_EMBED_MODEL production
npx vercel env add NEXT_PUBLIC_APP_URL production
npx vercel env add DEMO_ADMIN_PASSWORD production
npx vercel --prod
```

## 4. Required environment variables

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...@neon.tech/neondb?sslmode=require` | From Neon dashboard |
| `JWT_SECRET` | random 32+ char string | `openssl rand -base64 32` — rotate if ever leaked |
| `GEMINI_API_KEY` | `AIza...` | From Google AI Studio |
| `GEMINI_CHAT_MODEL` | `gemini-3.5-flash-lite` | |
| `GEMINI_EMBED_MODEL` | `gemini-embedding-001` | |
| `NEXT_PUBLIC_APP_URL` | `https://nbr-assist.vercel.app` | Your Vercel URL |
| `DEMO_ADMIN_PASSWORD` | strong private password | Admin seed account only |
| `DEMO_OWNER_PASSWORD` | `Demo@NBR2026!` | Optional; public demo default |

## 5. Seed production database

After deploy (and whenever you change demo passwords), run locally with Neon `DATABASE_URL`:

```bash
npm run db:seed
```

## 6. Verify

- Visit your Vercel URL
- Public demo: `owner@nbrassist.local` / `Demo@NBR2026!`
- Admin: `admin@nbrassist.local` + your private `DEMO_ADMIN_PASSWORD`

## Production hardening (long-term public)

Already in the app:

- Rate limits: login (10/min), register (5/hour), chat (12/min), admin ingest (5/min)
- Chat messages capped at 2000 characters
- Public demo uses owner role only; admin password is not advertised on the login page
- Cookies use `secure: true` in production

You should also:

1. **Rotate `JWT_SECRET`** in Vercel if it was ever shared in chat/email, then redeploy (forces re-login)
2. Set a strong unique **`DEMO_ADMIN_PASSWORD`** in Vercel + local `.env`, then re-run `npm run db:seed`
3. Watch Gemini usage in Google AI Studio (rate limits protect spend)
4. Optionally add a custom domain in Vercel → Domains
5. Use Vercel → Logs / Observability for errors (Sentry optional later)

## Notes

- `vercel-build` runs `prisma db push` to sync schema on each deploy
- Keep `.env` out of git — set secrets only in Vercel dashboard
