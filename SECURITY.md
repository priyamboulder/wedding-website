# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Marigold, please **do not open a public GitHub issue**.

Instead, report it privately by emailing:

**admin@marigold.wedding**

Please include:
- A description of the vulnerability
- Steps to reproduce it
- Potential impact
- Any suggested fix (optional)

We will acknowledge your report within 48 hours and aim to resolve confirmed vulnerabilities within 7 days.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x (current) | ✅ |

---

## Security Measures

Marigold is built with the following security controls:

- JWT-based authentication via Supabase Auth on all protected routes
- Row Level Security (RLS) enforced at the database level on all tables
- IDOR prevention — every endpoint verifies the authenticated user owns the requested resource
- Rate limiting on all AI and public endpoints via Upstash Redis
- Input validation with Zod on all API routes
- Security headers: HSTS, CSP, COOP, CORP, X-Frame-Options, X-Content-Type-Options, X-Permitted-Cross-Domain-Policies
- Sentry error monitoring with PII scrubbing (cookies and auth headers stripped)
- No secrets in source code — all credentials via environment variables only
