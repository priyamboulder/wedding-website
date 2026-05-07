# Marigold — Luxury Indian Wedding Planning Platform

![CI](https://github.com/priyamboulder/weddin-website/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Anthropic](https://img.shields.io/badge/AI-Claude%20Sonnet-orange?logo=anthropic)
![License](https://img.shields.io/badge/license-Private-red)

A full-stack, AI-powered wedding planning platform built for Indian weddings. Marigold covers every dimension of wedding planning — vendor discovery, guest management, catering, seating, budgeting, studio design, community, creator economy, and more — in a single cohesive product.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS, Framer Motion |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (JWT, Bearer tokens) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| State | Zustand (131 stores) |
| Email | Resend |
| Rate Limiting | Upstash Redis |
| Error Monitoring | Sentry |
| Canvas/Studio | Fabric.js |
| PDF | jsPDF |
| Validation | Zod |
| Drag & Drop | @dnd-kit |

---

## Features

### For Couples
- **Dashboard** — weekly digest, milestones, decision board, check-ins
- **Vendor Discovery** — search, filter, shortlist, and inquire with 10,000+ Indian wedding vendors across the US
- **Guest Management** — roster, RSVPs, seating chart, dietary tracking, travel coordination
- **Catering Command** — menu studio, caterer proposals, tasting journal, dietary atlas, staffing
- **Finance** — budget tracking, invoice management, receipt parsing (AI), bank statement import
- **Checklist** — AI-generated wedding checklist with smart task management
- **Studio** — design invitations, menus, save-the-dates, monograms, photo albums
- **Documents** — contract management, AI document classification
- **Aesthetic Board** — inspiration boards, palette synthesis, AI aesthetic manifesto
- **Seating Planner** — drag-and-drop seating with AI suggestions
- **Week-Of Coordination** — vendor coordination portal, timeline builder
- **RSVP Website** — public wedding website with guest RSVP

### For Vendors
- **Vendor Portal** — profile, portfolio, inquiry management, invoicing, analytics
- **Booking System** — quote, confirm, schedule, complete bookings
- **Partnerships** — collaborate with creators on sponsored content

### For Creators
- **Creator Portal** — collections, drops, guides, exhibitions, earnings
- **Partnerships** — propose and manage brand deals with vendors
- **Creator Tier System** — performance-based tier progression

### For Planners
- **Planner Dashboard** — manage multiple client weddings
- **Client Management** — wedding overviews, task tracking

### Community
- **The Confessional** — anonymous wedding confession feed
- **The Grapevine** — expert Q&A sessions
- **Real Weddings** — couple stories and inspiration
- **The Great Debate** — community polls and opinions
- **Rishta Circle** — curated community directory

### AI Features (39 AI-powered endpoints)
- Checklist generation
- Receipt and bank statement parsing
- Catering menu design and fit scoring
- Seating suggestions
- RSVP draft generation
- Aesthetic manifesto synthesis
- HMUA consultation briefs
- Social media post generation
- Document classification
- Vendor match scoring
- Hashtag generation
- Vow mad libs, sangeet songs, mehndi phrases

---

## Project Structure

```
├── app/
│   ├── (marigold)/          # Marketing & public pages
│   ├── (wedding)/           # Authenticated couple pages
│   ├── admin/               # Admin panel
│   ├── api/                 # 51 API route groups (161 endpoints)
│   ├── creator/             # Creator portal
│   ├── vendor/              # Vendor portal
│   ├── seller/              # Marketplace seller portal
│   ├── planner/             # Wedding planner portal
│   └── studio/              # Design studio
├── components/              # 61 component groups
├── stores/                  # 131 Zustand stores
├── lib/                     # Utilities, Supabase clients, AI helpers
├── types/                   # TypeScript type definitions
├── supabase/
│   └── migrations/          # 55 SQL migrations
├── scripts/                 # Seed scripts
└── tests/
    └── e2e/                 # Playwright smoke tests
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Anthropic API key (for AI features)
- A Resend account (for emails)
- An Upstash Redis database (for rate limiting)

### Installation

```bash
git clone https://github.com/yourname/marigold.git
cd marigold
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-key

# Resend
RESEND_API_KEY=your-resend-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Database Setup

Run all migrations in order using the Supabase SQL editor or CLI:

```bash
npm run db:migrate
```

Or paste each file from `supabase/migrations/` into the Supabase SQL Editor in order (0001 → 0055).

### Seed Vendor Data

```bash
npm run seed:vendors
```

> **Warning:** Never run seed scripts in production — they wipe and re-insert all vendor data.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

---

## Deployment (Self-Hosted, Windows Server)

1. Copy the project to your server (e.g. `C:\sites\marigold`)
2. Create `.env.local` with production credentials
3. Install dependencies and build:
   ```powershell
   npm install
   npm run build
   ```
4. Start with PM2:
   ```powershell
   npm install -g pm2
   pm2 start npm --name "marigold" -- start
   pm2 save
   ```
5. Set up Nginx as a reverse proxy to `localhost:3000`
6. Add SSL via win-acme (Let's Encrypt)

---

## Security

- JWT-based authentication via Supabase Auth on all protected routes
- Row Level Security (RLS) on all database tables
- IDOR prevention — all endpoints verify resource ownership
- Rate limiting on all AI and public endpoints (Upstash Redis)
- Input validation with Zod on all API routes
- Security headers: HSTS, CSP, COOP, CORP, X-Frame-Options, X-Content-Type-Options
- Sentry error monitoring with PII scrubbing
- No secrets in source code — all credentials via environment variables

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run seed:vendors` | Seed vendor data |
| `npm run seed:checklist` | Seed checklist templates |
| `npm run seed` | Run all seed scripts |
| `npm run db:migrate` | Push migrations to Supabase |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Stats

| Metric | Count |
|--------|-------|
| Pages | 365 |
| API Endpoints | 161 |
| AI-Powered Routes | 39 |
| Zustand Stores | 131 |
| Database Migrations | 55 |
| Lines of Code | ~72,000 |
| Vendors in Database | 10,000+ |

---

## Roadmap

- [ ] Mobile app (React Native)
- [ ] WhatsApp notifications for guests and vendors
- [ ] Vendor video portfolios
- [ ] AI wedding day timeline generator
- [ ] Multi-language support (Hindi, Punjabi, Gujarati)
- [ ] Payment processing — deposits and installments
- [ ] Live wedding day coordination mode

---

## License

Private — all rights reserved.
