# Contributing to Marigold

Thank you for your interest in contributing. Please follow these guidelines to keep the codebase clean and consistent.

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/description` | `feat/vendor-reviews` |
| Bug fix | `fix/description` | `fix/rsvp-validation` |
| Chore | `chore/description` | `chore/update-deps` |
| Hotfix | `hotfix/description` | `hotfix/auth-bypass` |

---

## Commit Messages

Use concise, imperative commit messages:

```
Add vendor review API endpoint
Fix RSVP double-submission bug
Update Supabase client to v2.x
```

---

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- All PRs must pass CI (build + typecheck) before merging
- Add a description of what changed and why
- Reference any related issues

---

## Code Style

- TypeScript strict mode — no `any` unless absolutely necessary
- No `console.log` in production code — use `Sentry.captureException`
- All API routes must call `requireAuth()` unless intentionally public
- All public API routes must call `checkRateLimit()`
- Input validation with Zod on all POST/PATCH endpoints
- Generic error messages to clients — never expose raw DB errors

---

## Database Changes

- All schema changes go in a new migration file: `supabase/migrations/XXXX_description.sql`
- Always add RLS policies for new tables
- Always add indexes on `couple_id`, `vendor_id`, or any frequently filtered column
- Never modify existing migration files — create a new one

---

## Running Locally

```bash
npm install
npm run dev        # development server
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run build      # production build
npm run test:e2e   # Playwright tests
```

---

## Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) and do **not** open a public issue.
