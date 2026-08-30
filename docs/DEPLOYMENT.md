# Deployment Guide — Vercel + Neon

## 1. Create Neon database (free)

1. Go to [https://neon.tech](https://neon.tech) and sign up
2. Create a new project (e.g. `nbr-assist`)
3. Copy the **connection string** (pooled recommended for serverless)
   - Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

## 2. Push to GitHub

```bash
git add .
git commit -m "Add NBR Assist MVP"
git push -u origin master
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
npx vercel --prod
```

## 4. Required environment variables

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...@neon.tech/neondb?sslmode=require` | From Neon dashboard |
| `JWT_SECRET` | random 32+ char string | `openssl rand -base64 32` |
| `GEMINI_API_KEY` | `AIza...` | From Google AI Studio |
| `GEMINI_CHAT_MODEL` | `gemini-3.5-flash-lite` | |
| `GEMINI_EMBED_MODEL` | `gemini-embedding-001` | |
| `NEXT_PUBLIC_APP_URL` | `https://nbr-assist.vercel.app` | Your Vercel URL |

## 5. Seed production database (one time)

After first deploy, run locally pointing at Neon:

```bash
# Temporarily set DATABASE_URL to your Neon connection string in .env
npm run db:seed
```

Or use Neon SQL editor to verify tables were created by `vercel-build` (`prisma db push`).

## 6. Verify

- Visit your Vercel URL
- Login: `admin@nbrassist.local` / `Admin123!`
- Test AI chat, calendar, checklists

## Notes

- `vercel-build` runs `prisma db push` to sync schema on each deploy
- Cookies use `secure: true` in production automatically
- Keep `.env` out of git — set secrets only in Vercel dashboard
