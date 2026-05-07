# Deploy Audit Log

**Date:** 2026-05-08  
**Auditor:** Claude (deploy skill)  
**Rollback checkpoint:** `9c2c23ff`  
**Repo:** https://github.com/priyamboulder/weddin-website

---

## Security Audit Findings & Fixes

### ✅ SSRF Protection — link-preview route
`app/api/link-preview/route.ts` blocks requests to private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, IPv6 ULA/link-local) before fetching any user-supplied URL.

### ✅ IDOR Prevention — vendor shortlist
`app/api/vendors/shortlist/route.ts` — GET, POST, DELETE all verify `user.id === coupleId`. POST ignores client-supplied `couple_id` and always uses `user.id`.

### ✅ IDOR Prevention — partnerships
All 4 partnership route files authenticated with `requireAuth`. Ownership checked against `vendorId`, `creatorId`. `senderId` derived server-side from `user.id`.

### ✅ Admin gate
`app/api/admin/verify/route.ts` — domain whitelist (`@ananya.local`, `@ananya.team`) removed. Admin status checked exclusively against `admin_users` table.  
`app/admin/layout.tsx` — rewrote to call `/api/admin/verify` with Bearer token. Shows blank screen while verifying.

### ✅ RSVP input validation
`app/api/rsvp/submit/route.ts` — Zod schema added: UUID for `wedding_id`, bounded integers for `plus_ones` (0–50), max lengths, email format.

### ✅ Path traversal — vendor images
`app/api/vendor-images/[...path]/route.ts` — URL-decode applied before `..` check to prevent encoded bypass.

### ✅ XSS — ShowcaseWizard
`components/community/showcases/ShowcaseWizard.tsx:452–466` — `apply()` HTML-escapes all entities (`&`, `<`, `>`, `"`, `'`) before storing as `storyText`. `dangerouslySetInnerHTML` receives only escaped content. No risk.

### ✅ Security headers
`next.config.mjs` — Added COOP (`same-origin`), CORP (`same-site`), `X-Permitted-Cross-Domain-Policies: none`. HSTS, CSP, X-Frame-Options already present.

### ✅ Sentry PII scrubbing
`sentry.client.config.ts` + `sentry.server.config.ts` — `beforeSend` strips cookies and replaces Authorization header with `[Filtered]`.

### ✅ Demo auth gate
`stores/auth-store.ts` — `signInAsDemo()` exits early in production (`NODE_ENV === 'production'`).

### ✅ Seed script guard
`scripts/seed-vendors.mjs` — exits with error code 1 if `NODE_ENV === 'production'`.

### ✅ Finance parallel writes
`app/api/finance/data/route.ts` — `Promise.allSettled` correctly checks both `status === 'rejected'` and fulfilled `.error` values.

### ✅ Seating payload limit
`app/api/seating/save/route.ts` — 2 MB payload cap. Wedding ownership verified before save.

### ✅ Debug log removal
`app/api/link-preview/route.ts` — two `console.log` statements removed.

### ✅ Dependency audit
`npm audit fix` applied. 8 remaining advisories all in `node-tar` via `@mapbox/node-pre-gyp` (transitive dev-only dependency, not in production bundle). Accepted risk.

---

## Deployment Configuration

### ✅ Standalone output
`next.config.mjs` — `output: "standalone"` added. Build produces `.next/standalone/server.js` for direct Node.js execution without full `node_modules`.

### ✅ PM2 config
`ecosystem.config.js` created at repo root. Runs `.next/standalone/server.js` on port 3000.

---

## Migrations Needed in Supabase (run in order)

| File | Purpose |
|------|---------|
| `supabase/migrations/0053_rsvp_rls_published_check.sql` | Tighten RSVP insert — requires `website_published = true` |
| `supabase/migrations/0054_finance_dedupe_hash.sql` | Add `dedupe_hash` column + unique index to prevent duplicate finance imports |
| `supabase/migrations/0055_performance_indexes.sql` | Composite index on `finance_transactions(couple_id, paid_at)` |

---

## Outstanding Major Version Upgrades (manual)

These cannot be auto-bumped — review breaking changes before upgrading:

| Package | Current | Latest |
|---------|---------|--------|
| `@anthropic-ai/sdk` | 0.35.0 | 0.95.1 |
| `zod` | 3.25.x | 4.4.3 |
| `fabric` | 5.5.2 | 7.3.1 |
| `@trigger.dev/sdk` | 3.3.17 | 4.4.5 |

---

## Pre-Launch Checklist

- [ ] Run 3 new migrations in Supabase SQL editor
- [ ] Add self to `admin_users` table: `INSERT INTO admin_users (user_id) VALUES ('<your-uuid>');`
- [ ] Create `vendor-images` storage bucket in Supabase (public read)
- [ ] Set all env vars in `.env.local` on production server
- [ ] Rotate all credentials (Supabase service role key, Anthropic key, Resend key, Upstash token)
- [ ] `npm ci && npm run build`
- [ ] Copy `.next/standalone`, `.next/static`, `public/` to server
- [ ] Start with PM2: `pm2 start ecosystem.config.js && pm2 save`
- [ ] Configure Nginx reverse proxy to `localhost:3000`
- [ ] Add SSL via win-acme (Let's Encrypt)
- [ ] Verify admin access at `/admin`
