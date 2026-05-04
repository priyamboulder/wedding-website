-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0028: Vendor cost ranges — DFW pricing transparency.
--
-- Powers the cost-transparency info bar on /vendors-directory. When a
-- couple filters by category (e.g. "Photography"), the bar surfaces a
-- realistic price range for that category in their city, broken down by
-- tier (budget / mid / premium / luxury).
--
-- Data model:
--   - One row per (category, city, tier). The UI rolls these up into a
--     single bar per (category, city), with each tier as a segment.
--   - max_price is nullable to express open-ended luxury tiers
--     ("$12,000+"). The UI renders a trailing "+" when max_price IS NULL.
--   - `unit` keeps the price comparable across categories (per_event vs
--     per_plate vs per_person). The UI shows it next to the headline.
--
-- Seed scope:
--   - Initial seed covers Dallas / Dallas-Fort Worth ("dallas") for the
--     eight categories the marigold landing surfaces today. Other cities
--     and categories can be added without code changes.
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_cost_ranges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,
  city        text NOT NULL,
  tier        text NOT NULL,
  min_price   integer NOT NULL,
  max_price   integer,
  unit        text NOT NULL,
  notes       text,
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT vendor_cost_ranges_category_check CHECK (category IN (
    'photography',
    'decor_florals',
    'hmua',
    'catering',
    'entertainment',
    'planning',
    'invitation_design',
    'mehendi',
    'music_dj',
    'videography'
  )),
  CONSTRAINT vendor_cost_ranges_tier_check CHECK (tier IN (
    'budget', 'mid', 'premium', 'luxury'
  )),
  CONSTRAINT vendor_cost_ranges_unit_check CHECK (unit IN (
    'per_event', 'per_hour', 'per_plate', 'per_person', 'per_day'
  )),
  CONSTRAINT vendor_cost_ranges_price_order CHECK (
    max_price IS NULL OR max_price >= min_price
  ),
  CONSTRAINT vendor_cost_ranges_unique UNIQUE (category, city, tier)
);

CREATE INDEX IF NOT EXISTS vendor_cost_ranges_lookup_idx
  ON vendor_cost_ranges (category, city);

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE vendor_cost_ranges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads cost ranges" ON vendor_cost_ranges;
CREATE POLICY "Public reads cost ranges"
  ON vendor_cost_ranges FOR SELECT TO anon, authenticated
  USING (true);

-- ── Seed: Dallas-Fort Worth ───────────────────────────────────────────────

INSERT INTO vendor_cost_ranges (category, city, tier, min_price, max_price, unit, notes) VALUES
  -- Photography (per event)
  ('photography', 'dallas', 'budget',   2500,  4000, 'per_event', NULL),
  ('photography', 'dallas', 'mid',      4000,  8000, 'per_event', NULL),
  ('photography', 'dallas', 'premium',  8000, 12000, 'per_event', NULL),
  ('photography', 'dallas', 'luxury',  12000, NULL,  'per_event', NULL),

  -- Décor & florals (per event)
  ('decor_florals', 'dallas', 'budget',   3000,  6000, 'per_event', NULL),
  ('decor_florals', 'dallas', 'mid',      6000, 15000, 'per_event', NULL),
  ('decor_florals', 'dallas', 'premium', 15000, 30000, 'per_event', NULL),
  ('decor_florals', 'dallas', 'luxury',  30000, NULL,  'per_event', NULL),

  -- HMUA (per event per person)
  ('hmua', 'dallas', 'budget',    300,   600, 'per_person', 'Per event, per person'),
  ('hmua', 'dallas', 'mid',       600,  1200, 'per_person', 'Per event, per person'),
  ('hmua', 'dallas', 'premium',  1200,  2000, 'per_person', 'Per event, per person'),
  ('hmua', 'dallas', 'luxury',   2000,  NULL, 'per_person', 'Per event, per person'),

  -- Catering (per plate)
  ('catering', 'dallas', 'budget',    30,   50, 'per_plate', NULL),
  ('catering', 'dallas', 'mid',       50,   85, 'per_plate', NULL),
  ('catering', 'dallas', 'premium',   85,  125, 'per_plate', NULL),
  ('catering', 'dallas', 'luxury',   125,  NULL, 'per_plate', NULL),

  -- Entertainment / DJ (per event)
  ('entertainment', 'dallas', 'budget',   800, 1500, 'per_event', NULL),
  ('entertainment', 'dallas', 'mid',     1500, 3000, 'per_event', NULL),
  ('entertainment', 'dallas', 'premium', 3000, 5000, 'per_event', NULL),
  ('entertainment', 'dallas', 'luxury',  5000, NULL, 'per_event', NULL),

  -- Music / DJ (mirrors entertainment for now; kept separate so DJ-only
  -- pricing can diverge later without affecting live bands / dhol crews).
  ('music_dj', 'dallas', 'budget',   800, 1500, 'per_event', NULL),
  ('music_dj', 'dallas', 'mid',     1500, 3000, 'per_event', NULL),
  ('music_dj', 'dallas', 'premium', 3000, 5000, 'per_event', NULL),
  ('music_dj', 'dallas', 'luxury',  5000, NULL, 'per_event', NULL),

  -- Mehendi artist (per event)
  ('mehendi', 'dallas', 'budget',    200,  500, 'per_event', NULL),
  ('mehendi', 'dallas', 'mid',       500, 1000, 'per_event', NULL),
  ('mehendi', 'dallas', 'premium',  1000, 2000, 'per_event', NULL),
  ('mehendi', 'dallas', 'luxury',   2000, NULL, 'per_event', NULL),

  -- Videography (per event)
  ('videography', 'dallas', 'budget',   2000,  4000, 'per_event', NULL),
  ('videography', 'dallas', 'mid',      4000,  7000, 'per_event', NULL),
  ('videography', 'dallas', 'premium',  7000, 12000, 'per_event', NULL),
  ('videography', 'dallas', 'luxury',  12000, NULL,  'per_event', NULL),

  -- Wedding planner (full planning)
  ('planning', 'dallas', 'budget',    2000,  5000, 'per_event', 'Full planning'),
  ('planning', 'dallas', 'mid',       5000, 12000, 'per_event', 'Full planning'),
  ('planning', 'dallas', 'premium',  12000, 25000, 'per_event', 'Full planning'),
  ('planning', 'dallas', 'luxury',   25000,  NULL, 'per_event', 'Full planning')
ON CONFLICT (category, city, tier) DO NOTHING;
