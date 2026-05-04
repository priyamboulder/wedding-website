-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0025 — tools_catalog reconciliation
--
-- Background: the seed in 0022 declared four flagship tools as live
-- (budget, destinations, match, plus the rest as coming_soon). Since
-- then the routes for kundli, wedding-stars, visualizer, ready, guests,
-- dates, and shagun were all built on disk, but their catalog rows were
-- never updated. The hub silently dropped them from the flagship grid
-- (or rendered them as coming_soon links to working pages).
--
-- Also: vendor-match-quiz had cta_route='/tools/vendor-match' which
-- doesn't match its slug — the new catch-all `/tools/[slug]` resolves
-- by slug, so we retarget to '/tools/vendor-match-quiz'.
--
-- Display order is realigned to the FLAGSHIP_SLUGS order in
-- app/(marigold)/tools/page.tsx so listToolsCatalog() returns rows in
-- the same sequence the hub renders them.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Promote tools whose routes exist but were still flagged coming_soon ──

UPDATE tools_catalog SET status = 'live' WHERE slug = 'shagun-calculator';
UPDATE tools_catalog SET status = 'live' WHERE slug = 'date-picker';
UPDATE tools_catalog SET status = 'live' WHERE slug = 'guest-list-estimator';

-- ── Repoint vendor-match-quiz to a slug-aligned route ────────────────────

UPDATE tools_catalog
SET cta_route = '/tools/vendor-match-quiz'
WHERE slug = 'vendor-match-quiz';

-- ── Register flagship tools that were built on disk but never seeded ─────

INSERT INTO tools_catalog (slug, name, tagline, description, icon_or_image, cta_label, cta_route, stats, display_order, status)
VALUES
  (
    'kundli',
    'Kundli Match',
    'do your stars actually align — or is that just a saying',
    'Enter both birth details. Get the full 36-point Ashtakoota compatibility report — translated for parents AND partners.',
    '✦',
    'Match your kundli',
    '/tools/kundli',
    '[{"label": "36 Guna Milan"}, {"label": "Dosha analysis included"}]'::jsonb,
    22,
    'live'
  ),
  (
    'wedding-stars',
    'Wedding Stars',
    'your cosmic calendar for every big decision',
    'Personalized planetary transit timeline mapping the next 12 months — when to book, when to pause, when the stars are practically begging you to dress shop.',
    '✦',
    'Read your stars',
    '/tools/wedding-stars',
    '[{"label": "Vedic transit based"}, {"label": "Personalized timeline"}]'::jsonb,
    23,
    'live'
  ),
  (
    'visualizer',
    'Weekend Visualizer',
    'see your whole wedding weekend before you plan a thing',
    'Pick your events, pick your style. We''ll show you how your 3-day celebration actually flows — hour by hour, outfit change by outfit change.',
    '📅',
    'Visualize your weekend',
    '/tools/visualizer',
    '[{"label": "Multi-event"}, {"label": "Culturally aware"}]'::jsonb,
    35,
    'live'
  ),
  (
    'ready',
    'Am I Ready?',
    'how behind are you, really — and what to do about it',
    'Answer 8 questions. We''ll tell you exactly where you stand and what to lock down this week — whether you''re 18 months out or 18 weeks.',
    '✓',
    'Check your readiness',
    '/tools/ready',
    '[{"label": "2-minute assessment"}, {"label": "South Asian calibrated"}]'::jsonb,
    38,
    'live'
  )
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  tagline       = EXCLUDED.tagline,
  description   = EXCLUDED.description,
  icon_or_image = EXCLUDED.icon_or_image,
  cta_label     = EXCLUDED.cta_label,
  cta_route     = EXCLUDED.cta_route,
  stats         = EXCLUDED.stats,
  display_order = EXCLUDED.display_order,
  status        = EXCLUDED.status,
  active        = true;
