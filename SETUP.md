# Ananya — Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) account (free tier works)
- An [Anthropic](https://console.anthropic.com) API key

## 1. Clone and install

```bash
git clone <repo-url>
cd ananya
npm install
```

## 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_URL` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → service_role |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (free tier: 3,000 emails/month) |
| `RESEND_FROM_EMAIL` | A verified domain email in Resend |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local, your domain for production |
| `AVIATIONSTACK_API_KEY` | Optional — [aviationstack.com](https://aviationstack.com) |
| `TRIGGER_SECRET_KEY` | Optional — [cloud.trigger.dev](https://cloud.trigger.dev) |

## 3. Database setup

Install the Supabase CLI:
```bash
npm install -g supabase
supabase login
```

Link to your project:
```bash
supabase link --project-ref your-project-ref
```

Run all migrations:
```bash
npm run db:migrate
```

## 4. Supabase Storage

In your Supabase dashboard:
1. Go to **Storage**
2. The `ananya-uploads` bucket is created automatically by migration `0013_storage_buckets.sql`
3. If it doesn't appear, run: `supabase db push`

## 5. Seed initial data (optional)

Populate logo and monogram templates:
```bash
npm run seed
```

## 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 7. Email setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env.local`

Without these, the app works fine — emails are silently skipped (logged as warnings).

## 8. Background jobs (Trigger.dev) — optional

For automated vendor enrichment via Claude:

1. Sign up at [cloud.trigger.dev](https://cloud.trigger.dev)
2. Create a project named `ananya-wedding`
3. Get your secret key and set `TRIGGER_SECRET_KEY`
4. Deploy jobs: `npx trigger.dev@latest deploy`

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

The `vercel.json` in this repo configures:
- Region: `bom1` (Mumbai — closest to Indian users)
- 60-second timeout for AI-heavy routes
- CORS headers for API routes

### Other platforms

The app is a standard Next.js app and works on any platform that supports Node.js:
- **Render**: Connect GitHub repo, set env vars, deploy
- **Railway**: `railway up`
- **Self-hosted**: `npm run build && npm start`

## TypeScript check

```bash
npm run typecheck
```

## Project structure

```
app/          — Next.js App Router pages + API routes
components/   — React components (40+ feature areas)
stores/       — Zustand state (88 stores, all Supabase-synced)
lib/          — Utilities, seeds, email, Supabase helpers
types/        — TypeScript definitions (85 files)
supabase/     — Database migrations (15 files)
trigger/      — Background jobs (Trigger.dev)
```
