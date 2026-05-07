# Changelog

All notable changes to Marigold are documented here.

---

## [1.0.0] — 2026-05-08

### Initial Production Release

#### Added
- Full wedding planning platform for Indian weddings
- Vendor discovery with 10,000+ US Indian wedding vendors
- AI-powered checklist generation, receipt parsing, bank statement import
- Catering Command — menu studio, proposals, tasting journal, dietary atlas
- Guest management — roster, RSVPs, seating chart, travel coordination
- Finance module — budgets, invoices, transaction tracking
- Studio — invitation, menu, save-the-date, monogram designer (Fabric.js)
- Aesthetic board — inspiration boards, AI palette synthesis, manifesto generation
- Week-of coordination portal for vendors
- Community — Confessional, Grapevine AMA, Real Weddings, The Great Debate
- Creator economy — drops, collections, guides, exhibitions, partnerships
- Vendor portal — inquiries, bookings, invoicing, analytics
- Wedding planner portal — multi-client management
- Marketplace — seller products, orders, payouts
- 39 AI-powered API endpoints via Anthropic Claude (claude-sonnet-4-6)
- Row Level Security on all 55+ database tables
- JWT authentication with IDOR prevention on all endpoints
- Rate limiting via Upstash Redis on all public and AI routes
- Sentry error monitoring with PII scrubbing
- Playwright E2E smoke test suite (17 tests)
- Security headers — HSTS, CSP, COOP, CORP, X-Frame-Options
- Zod input validation on all API routes
- Resend transactional email integration
