-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0022: Marigold Tools — Budget & Destination schema, plus the
-- tools_catalog used by the public Tools hub landing page.
--
-- Vendor surfacing is unchanged: the Budget tool's "tiers" are cost templates
-- that calculate price points per category. Real vendor recommendations come
-- from the unified `vendors` table (migration 0021) filtered by tier_match.
-- This migration introduces NO duplicate vendor data.
--
-- Adds:
--   1. budget_locations              — US metros + global destinations
--   2. budget_location_regions       — sub-zones within a location
--   3. budget_location_experiences   — what couples actually do there
--   4. budget_cultures               — Punjabi/Sikh, Gujarati, etc.
--   5. budget_culture_events         — events per culture (Mehndi, Sangeet…)
--   6. budget_vendor_tiers           — cost templates per (category, tier)
--   7. budget_addons                 — paan stations, fireworks, kulfi carts
--   8. budget_user_plans             — saved plans (auth + anonymous)
--   9. budget_user_events            — events on a plan
--  10. budget_user_vendor_selections — per-plan tier choices
--  11. budget_user_addon_selections  — per-plan add-ons
--  12. tools_catalog                 — discovery cards for /tools
--  13. tool_waitlist                 — "tell me when this drops" capture
--
-- RLS:
--   - Reference / template tables are publicly readable (active = true).
--   - User plan tables: auth users see/write their own rows; anonymous plans
--     are accessed via SECURITY DEFINER RPCs that verify the anonymous_token
--     supplied by the client.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Enums ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_location_type') THEN
    CREATE TYPE budget_location_type AS ENUM ('us_metro', 'destination');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_tier') THEN
    CREATE TYPE budget_tier AS ENUM ('essential', 'elevated', 'luxury', 'ultra');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tool_status') THEN
    CREATE TYPE tool_status AS ENUM ('live', 'coming_soon', 'beta');
  END IF;
END $$;

-- ── 1. budget_locations ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_locations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            budget_location_type NOT NULL,
  continent       text,
  country         text,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  multiplier      numeric(5,2) NOT NULL DEFAULT 1.00,
  tagline         text NOT NULL DEFAULT '',
  overview        text NOT NULL DEFAULT '',
  best_for        text NOT NULL DEFAULT '',
  best_months     text NOT NULL DEFAULT '',
  min_budget_usd  integer NOT NULL DEFAULT 0,
  tips            text NOT NULL DEFAULT '',
  hero_image_url  text,
  display_order   integer NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS budget_locations_type_active_idx
  ON budget_locations (type, active, display_order);
CREATE INDEX IF NOT EXISTS budget_locations_continent_idx
  ON budget_locations (continent);

-- ── 2. budget_location_regions ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_location_regions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   uuid NOT NULL REFERENCES budget_locations(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS budget_location_regions_location_idx
  ON budget_location_regions (location_id, display_order);

-- ── 3. budget_location_experiences ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_location_experiences (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   uuid NOT NULL REFERENCES budget_locations(id) ON DELETE CASCADE,
  name          text NOT NULL,
  icon          text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS budget_location_experiences_location_idx
  ON budget_location_experiences (location_id, display_order);

-- ── 4. budget_cultures ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_cultures (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS budget_cultures_active_order_idx
  ON budget_cultures (active, display_order);

-- ── 5. budget_culture_events ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_culture_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  culture_id      uuid NOT NULL REFERENCES budget_cultures(id) ON DELETE CASCADE,
  name            text NOT NULL,
  slug            text NOT NULL,
  icon            text NOT NULL DEFAULT '',
  default_guests  integer NOT NULL DEFAULT 200,
  display_order   integer NOT NULL DEFAULT 0,
  ceremony        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (culture_id, slug)
);

CREATE INDEX IF NOT EXISTS budget_culture_events_culture_idx
  ON budget_culture_events (culture_id, display_order);

-- ── 6. budget_vendor_tiers ────────────────────────────────────────────────
-- Cost templates. (vendor_category_id, tier) is unique — exactly one cost
-- bracket per category at each tier. base_cost_usd is the price at the
-- 1.0 multiplier (Dallas baseline). Caller multiplies by location multiplier.

CREATE TABLE IF NOT EXISTS budget_vendor_tiers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_category_id uuid NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
  tier               budget_tier NOT NULL,
  base_cost_usd      integer NOT NULL,
  description        text NOT NULL DEFAULT '',
  display_order      integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_category_id, tier)
);

CREATE INDEX IF NOT EXISTS budget_vendor_tiers_category_idx
  ON budget_vendor_tiers (vendor_category_id, tier);

-- ── 7. budget_addons ──────────────────────────────────────────────────────
-- Optional extras the user can layer on top of a base allocation. `scope`
-- mirrors the vendor_category_scope enum: per_event = applied per attached
-- event; wedding_wide = once for the whole wedding.

CREATE TABLE IF NOT EXISTS budget_addons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  icon          text NOT NULL DEFAULT '',
  base_cost_usd integer NOT NULL DEFAULT 0,
  description   text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT '',
  scope         vendor_category_scope NOT NULL DEFAULT 'per_event',
  per_guest     boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS budget_addons_active_order_idx
  ON budget_addons (active, display_order);
CREATE INDEX IF NOT EXISTS budget_addons_category_idx
  ON budget_addons (category);

-- ── 8. budget_user_plans ──────────────────────────────────────────────────
-- Either user_id (authed) or anonymous_token (anon) must be set. Anonymous
-- plans can be reclaimed at signup via reclaim_anonymous_budget_plan().

CREATE TABLE IF NOT EXISTS budget_user_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_token   text,
  name              text NOT NULL DEFAULT 'My Wedding Budget',
  location_id       uuid REFERENCES budget_locations(id) ON DELETE SET NULL,
  culture_id        uuid REFERENCES budget_cultures(id) ON DELETE SET NULL,
  total_budget      integer,
  global_tier       budget_tier NOT NULL DEFAULT 'elevated',
  source_tool       text NOT NULL DEFAULT 'budget',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  last_viewed_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budget_user_plans_owner_present
    CHECK (user_id IS NOT NULL OR anonymous_token IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS budget_user_plans_user_idx
  ON budget_user_plans (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS budget_user_plans_anon_token_idx
  ON budget_user_plans (anonymous_token) WHERE anonymous_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS budget_user_plans_location_idx
  ON budget_user_plans (location_id);

CREATE OR REPLACE FUNCTION budget_user_plans_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS budget_user_plans_updated_at_trigger ON budget_user_plans;
CREATE TRIGGER budget_user_plans_updated_at_trigger
  BEFORE UPDATE ON budget_user_plans
  FOR EACH ROW EXECUTE FUNCTION budget_user_plans_set_updated_at();

-- ── 9. budget_user_events ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_user_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       uuid NOT NULL REFERENCES budget_user_plans(id) ON DELETE CASCADE,
  event_slug    text NOT NULL,
  guest_count   integer NOT NULL DEFAULT 200,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, event_slug)
);

CREATE INDEX IF NOT EXISTS budget_user_events_plan_idx
  ON budget_user_events (plan_id, display_order);

-- ── 10. budget_user_vendor_selections ─────────────────────────────────────
-- One row per (plan, event_slug, vendor_category) — when event_slug is NULL
-- the selection applies wedding-wide (e.g., photography). When event_slug is
-- set the tier override applies just to that event.

CREATE TABLE IF NOT EXISTS budget_user_vendor_selections (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id            uuid NOT NULL REFERENCES budget_user_plans(id) ON DELETE CASCADE,
  event_slug         text,
  vendor_category_id uuid NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
  selected_tier      budget_tier NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- A plan can only have one tier per (event, category). NULL event slugs use
-- a sentinel via COALESCE so the unique index also catches wedding-wide dupes.
CREATE UNIQUE INDEX IF NOT EXISTS budget_user_vendor_selections_unique_idx
  ON budget_user_vendor_selections
  (plan_id, COALESCE(event_slug, '__wedding_wide__'), vendor_category_id);

CREATE INDEX IF NOT EXISTS budget_user_vendor_selections_plan_idx
  ON budget_user_vendor_selections (plan_id);

-- ── 11. budget_user_addon_selections ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_user_addon_selections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     uuid NOT NULL REFERENCES budget_user_plans(id) ON DELETE CASCADE,
  addon_id    uuid NOT NULL REFERENCES budget_addons(id) ON DELETE CASCADE,
  event_slug  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS budget_user_addon_selections_unique_idx
  ON budget_user_addon_selections
  (plan_id, addon_id, COALESCE(event_slug, '__wedding_wide__'));

CREATE INDEX IF NOT EXISTS budget_user_addon_selections_plan_idx
  ON budget_user_addon_selections (plan_id);

-- ── 12. tools_catalog ─────────────────────────────────────────────────────
-- Card metadata for the /tools landing page. Fully editable in DB so the
-- marketing surface doesn't require code changes.

CREATE TABLE IF NOT EXISTS tools_catalog (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL,
  tagline         text NOT NULL DEFAULT '',
  description     text NOT NULL DEFAULT '',
  icon_or_image   text,
  cta_label       text NOT NULL DEFAULT 'Try it free',
  cta_route       text NOT NULL,
  stats           jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order   integer NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  status          tool_status NOT NULL DEFAULT 'live',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tools_catalog_active_status_idx
  ON tools_catalog (active, status, display_order);

-- ── 13. tool_waitlist ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tool_waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug   text NOT NULL,
  email       text NOT NULL,
  source      text NOT NULL DEFAULT 'tools_hub',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_slug, email)
);

CREATE INDEX IF NOT EXISTS tool_waitlist_tool_idx ON tool_waitlist (tool_slug);

-- ── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE budget_locations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_location_regions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_location_experiences    ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_cultures                ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_culture_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_vendor_tiers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_addons                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_user_plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_user_events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_user_vendor_selections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_user_addon_selections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools_catalog                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_waitlist                  ENABLE ROW LEVEL SECURITY;

-- Public reference tables: read where active. Regions/experiences/events
-- inherit from their parent location/culture's active flag (cascade isn't
-- automatic, but seeded data follows the convention).

DROP POLICY IF EXISTS "Public reads active locations" ON budget_locations;
CREATE POLICY "Public reads active locations"
  ON budget_locations FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public reads location regions" ON budget_location_regions;
CREATE POLICY "Public reads location regions"
  ON budget_location_regions FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_locations bl
      WHERE bl.id = budget_location_regions.location_id AND bl.active = true
    )
  );

DROP POLICY IF EXISTS "Public reads location experiences" ON budget_location_experiences;
CREATE POLICY "Public reads location experiences"
  ON budget_location_experiences FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_locations bl
      WHERE bl.id = budget_location_experiences.location_id AND bl.active = true
    )
  );

DROP POLICY IF EXISTS "Public reads cultures" ON budget_cultures;
CREATE POLICY "Public reads cultures"
  ON budget_cultures FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public reads culture events" ON budget_culture_events;
CREATE POLICY "Public reads culture events"
  ON budget_culture_events FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_cultures bc
      WHERE bc.id = budget_culture_events.culture_id AND bc.active = true
    )
  );

DROP POLICY IF EXISTS "Public reads vendor tiers" ON budget_vendor_tiers;
CREATE POLICY "Public reads vendor tiers"
  ON budget_vendor_tiers FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendor_categories vc
      WHERE vc.id = budget_vendor_tiers.vendor_category_id AND vc.active = true
    )
  );

DROP POLICY IF EXISTS "Public reads active addons" ON budget_addons;
CREATE POLICY "Public reads active addons"
  ON budget_addons FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public reads tools catalog" ON tools_catalog;
CREATE POLICY "Public reads tools catalog"
  ON tools_catalog FOR SELECT TO anon, authenticated
  USING (active = true);

-- User plan tables: authed users see/write their own rows. Anonymous-token
-- access is routed through SECURITY DEFINER RPCs (defined below); the table
-- policies block direct anon access on purpose.

DROP POLICY IF EXISTS "Users read own plans" ON budget_user_plans;
CREATE POLICY "Users read own plans"
  ON budget_user_plans FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own plans" ON budget_user_plans;
CREATE POLICY "Users insert own plans"
  ON budget_user_plans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own plans" ON budget_user_plans;
CREATE POLICY "Users update own plans"
  ON budget_user_plans FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own plans" ON budget_user_plans;
CREATE POLICY "Users delete own plans"
  ON budget_user_plans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users access own plan events" ON budget_user_events;
CREATE POLICY "Users access own plan events"
  ON budget_user_events FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_user_plans p
      WHERE p.id = budget_user_events.plan_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_user_plans p
      WHERE p.id = budget_user_events.plan_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users access own vendor selections" ON budget_user_vendor_selections;
CREATE POLICY "Users access own vendor selections"
  ON budget_user_vendor_selections FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_user_plans p
      WHERE p.id = budget_user_vendor_selections.plan_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_user_plans p
      WHERE p.id = budget_user_vendor_selections.plan_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users access own addon selections" ON budget_user_addon_selections;
CREATE POLICY "Users access own addon selections"
  ON budget_user_addon_selections FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_user_plans p
      WHERE p.id = budget_user_addon_selections.plan_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_user_plans p
      WHERE p.id = budget_user_addon_selections.plan_id AND p.user_id = auth.uid()
    )
  );

-- Waitlist: anyone can submit, but no one reads through PostgREST.
DROP POLICY IF EXISTS "Anyone joins waitlist" ON tool_waitlist;
CREATE POLICY "Anyone joins waitlist"
  ON tool_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (length(email) > 3);

-- ── Anonymous plan RPCs ───────────────────────────────────────────────────
-- These run as SECURITY DEFINER so they bypass RLS for anonymous_token-
-- scoped rows. Each one verifies the token matches the row before reading
-- or writing — never trust the token without that check.

CREATE OR REPLACE FUNCTION get_anonymous_budget_plan(p_token text)
RETURNS budget_user_plans
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM budget_user_plans
  WHERE anonymous_token = p_token
    AND user_id IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION create_anonymous_budget_plan(
  p_token       text,
  p_name        text DEFAULT 'My Wedding Budget',
  p_location_id uuid DEFAULT NULL,
  p_culture_id  uuid DEFAULT NULL,
  p_total_budget integer DEFAULT NULL,
  p_global_tier budget_tier DEFAULT 'elevated'
)
RETURNS budget_user_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan budget_user_plans;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RAISE EXCEPTION 'anonymous_token must be at least 16 characters';
  END IF;

  INSERT INTO budget_user_plans (
    anonymous_token, name, location_id, culture_id, total_budget, global_tier
  ) VALUES (
    p_token, p_name, p_location_id, p_culture_id, p_total_budget, p_global_tier
  )
  RETURNING * INTO v_plan;

  RETURN v_plan;
END $$;

CREATE OR REPLACE FUNCTION update_anonymous_budget_plan(
  p_token       text,
  p_name        text DEFAULT NULL,
  p_location_id uuid DEFAULT NULL,
  p_culture_id  uuid DEFAULT NULL,
  p_total_budget integer DEFAULT NULL,
  p_global_tier budget_tier DEFAULT NULL
)
RETURNS budget_user_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan budget_user_plans;
BEGIN
  UPDATE budget_user_plans SET
    name          = COALESCE(p_name, name),
    location_id   = COALESCE(p_location_id, location_id),
    culture_id    = COALESCE(p_culture_id, culture_id),
    total_budget  = COALESCE(p_total_budget, total_budget),
    global_tier   = COALESCE(p_global_tier, global_tier),
    last_viewed_at = now()
  WHERE anonymous_token = p_token
    AND user_id IS NULL
  RETURNING * INTO v_plan;

  IF v_plan.id IS NULL THEN
    RAISE EXCEPTION 'No anonymous plan found for token';
  END IF;

  RETURN v_plan;
END $$;

-- Reclaim: when a user signs up, claim their anonymous token's plan into
-- their auth.uid(). Refuses to overwrite a plan that's already claimed.
CREATE OR REPLACE FUNCTION reclaim_anonymous_budget_plan(p_token text)
RETURNS budget_user_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_plan budget_user_plans;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'reclaim_anonymous_budget_plan requires an authenticated session';
  END IF;

  UPDATE budget_user_plans SET
    user_id         = v_user,
    anonymous_token = NULL,
    last_viewed_at  = now()
  WHERE anonymous_token = p_token
    AND user_id IS NULL
  RETURNING * INTO v_plan;

  IF v_plan.id IS NULL THEN
    RAISE EXCEPTION 'No anonymous plan found for token';
  END IF;

  RETURN v_plan;
END $$;

GRANT EXECUTE ON FUNCTION get_anonymous_budget_plan(text)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_anonymous_budget_plan(text, text, uuid, uuid, integer, budget_tier) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_anonymous_budget_plan(text, text, uuid, uuid, integer, budget_tier) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reclaim_anonymous_budget_plan(text)     TO authenticated;

-- ── Seed: tools_catalog ───────────────────────────────────────────────────

INSERT INTO tools_catalog (slug, name, tagline, description, cta_label, cta_route, stats, display_order, status)
VALUES
  (
    'budget',
    'Shaadi Budget™',
    'the budget tool that actually gets indian weddings',
    'Mehndi to vidaai. Five tiers from sensible to absurd. Real numbers from real weddings — no generic spreadsheet templates.',
    'Try it free',
    '/tools/budget',
    '[{"label": "30+ destinations"}, {"label": "$150K–$5M range"}]'::jsonb,
    10,
    'live'
  ),
  (
    'destinations',
    'Destination Explorer',
    'udaipur to lake como, what it really costs',
    'A real-money breakdown for 30+ destinations. What 200 guests actually costs in Goa vs Dallas vs Lake Como — with vendors who travel there.',
    'Explore destinations',
    '/tools/destinations',
    '[{"label": "30+ destinations"}, {"label": "Indian-wedding calibrated"}]'::jsonb,
    20,
    'live'
  ),
  (
    'match',
    'Match Me',
    'tell us your budget, we''ll show you where you can go',
    'Punch in your number, your culture, your guest count. We''ll show you the destinations that fit — and the ones that almost fit, with what to cut.',
    'Notify me',
    '/tools/match',
    '[{"label": "Coming soon"}, {"label": "Budget-aware matching"}]'::jsonb,
    30,
    'coming_soon'
  ),
  (
    'shagun-calculator',
    'Shagun Calculator',
    'how much do you owe the cousin who got married last year',
    'A reciprocity tracker for the family that keeps a mental ledger. Inputs how much they gave, how recent, how related — outputs what to give back.',
    'Notify me',
    '/tools/shagun',
    '[{"label": "Coming soon"}]'::jsonb,
    40,
    'coming_soon'
  ),
  (
    'date-picker',
    'Date Picker',
    'auspicious dates that don''t make grandma cry',
    'Cross-references the panchang, your anniversary, peak vendor pricing, and family travel windows. Spits out dates that won''t start a fight.',
    'Notify me',
    '/tools/dates',
    '[{"label": "Coming soon"}]'::jsonb,
    50,
    'coming_soon'
  ),
  (
    'guest-list-estimator',
    'Guest List Estimator',
    'mom''s list + dad''s list + reality check',
    'Inputs from both families. Estimates how many actually show up. Tells you which side is in denial.',
    'Notify me',
    '/tools/guests',
    '[{"label": "Coming soon"}]'::jsonb,
    60,
    'coming_soon'
  ),
  (
    'vendor-match-quiz',
    'Vendor Match Quiz',
    'eight questions, twenty vendors that actually fit',
    'Style. Budget. Culture. Vibe. Eight questions and we narrow 50,000 vendors down to the ones who shoot weddings like yours.',
    'Notify me',
    '/tools/vendor-match',
    '[{"label": "Coming soon"}]'::jsonb,
    70,
    'coming_soon'
  )
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  tagline       = EXCLUDED.tagline,
  description   = EXCLUDED.description,
  cta_label     = EXCLUDED.cta_label,
  cta_route     = EXCLUDED.cta_route,
  stats         = EXCLUDED.stats,
  display_order = EXCLUDED.display_order,
  status        = EXCLUDED.status,
  active        = true;

-- ── Seed: budget_locations ────────────────────────────────────────────────
-- Calibrated min_budget_usd for realistic 200-300 guest multi-day Indian
-- weddings. Multipliers are vs. Dallas (1.0).

INSERT INTO budget_locations (type, continent, country, name, slug, multiplier, tagline, min_budget_usd, display_order)
VALUES
  -- US metros
  ('us_metro',    'North America', 'USA',          'Dallas',          'dallas',         1.00, 'The South Asian Houston-of-the-South.', 150000, 10),
  ('us_metro',    'North America', 'USA',          'Houston',         'houston',        1.05, 'Big halls, bigger guest counts.',       160000, 20),
  ('us_metro',    'North America', 'USA',          'Austin',          'austin',         1.15, 'Hill country with a side of biryani.',  175000, 30),
  ('us_metro',    'North America', 'USA',          'Bay Area',        'bay-area',       2.30, 'The most expensive place to say I do.', 350000, 40),
  ('us_metro',    'North America', 'USA',          'New Jersey / NYC','nyc-nj',         2.60, 'East Coast wedding industrial complex.',400000, 50),
  ('us_metro',    'North America', 'USA',          'Chicago',         'chicago',        1.30, 'Indoor weather-proofed glamour.',       200000, 60),
  ('us_metro',    'North America', 'USA',          'Atlanta',         'atlanta',        0.95, 'South Asian South. Underrated.',        140000, 70),
  ('us_metro',    'North America', 'USA',          'Los Angeles',     'los-angeles',    2.00, 'Bollywood adjacent.',                   300000, 80),
  -- India
  ('destination', 'Asia',          'India',        'Udaipur',         'udaipur',        2.00, 'Palace weddings on the lake.',          300000, 100),
  ('destination', 'Asia',          'India',        'Goa',             'goa',            1.00, 'Beach, susegad, sunset baraat.',        150000, 110),
  ('destination', 'Asia',          'India',        'Jaipur',          'jaipur',         1.35, 'Pink city, royal courtyards.',          200000, 120),
  ('destination', 'Asia',          'India',        'Kerala',          'kerala',         0.65, 'Backwaters and houseboats.',            100000, 130),
  ('destination', 'Asia',          'India',        'Mumbai / Delhi',  'mumbai-delhi',   0.80, 'Hometown, hotel banquet, heart.',       120000, 140),
  -- Europe
  ('destination', 'Europe',        'Italy',        'Lake Como',       'lake-como',      3.30, 'The flex destination of flex destinations.',500000, 200),
  ('destination', 'Europe',        'France',       'France',          'france',         4.00, 'Châteaux and chiffon.',                 600000, 210),
  ('destination', 'Europe',        'Spain',        'Spain',           'spain',          1.65, 'Iberian flair, sangeet ole.',           250000, 220),
  ('destination', 'Europe',        'United Kingdom','UK',             'uk',             2.30, 'Manor house mehndi.',                   350000, 230),
  ('destination', 'Europe',        'Greece',       'Greece',          'greece',         1.65, 'Cycladic blue, gold-hour ceremonies.',  250000, 240),
  ('destination', 'Europe',        'Portugal',     'Portugal',        'portugal',       1.35, 'Quietly luxe. Quintas and tile work.',  200000, 250),
  ('destination', 'Europe',        'Turkey',       'Turkey',          'turkey',         1.00, 'Bosphorus baraat.',                     150000, 260),
  -- Middle East
  ('destination', 'Middle East',   'UAE',          'Dubai',           'dubai',          2.00, 'Skyline + sand + zero-tax glam.',       300000, 300),
  ('destination', 'Middle East',   'Oman',         'Oman',            'oman',           1.35, 'Quiet desert luxury.',                  200000, 310),
  -- SE Asia
  ('destination', 'Asia',          'Thailand',     'Thailand',        'thailand',       1.35, 'Bangkok, Phuket, Krabi — pick a vibe.', 200000, 400),
  ('destination', 'Asia',          'Indonesia',    'Bali',            'bali',           1.35, 'Cliffside ceremonies and frangipani.',  200000, 410),
  ('destination', 'Asia',          'Singapore',    'Singapore',       'singapore',      2.00, 'City-state precision.',                 300000, 420),
  -- Caribbean
  ('destination', 'North America', 'Jamaica',      'Jamaica',         'jamaica',        1.35, 'No problem, mon.',                      200000, 500),
  ('destination', 'North America', 'Turks & Caicos','turks-caicos',   'turks-caicos',   2.30, 'Powder beaches, polished.',             350000, 510),
  -- Africa
  ('destination', 'Africa',        'South Africa', 'Cape Town',       'cape-town',      1.15, 'Wine country with a baraat.',           175000, 600),
  ('destination', 'Africa',        'Morocco',      'Morocco',         'morocco',        1.65, 'Riad mehndi, desert sangeet.',          250000, 610),
  ('destination', 'Africa',        'Kenya',        'Kenya',           'kenya',          1.00, 'Safari + ceremony.',                    150000, 620),
  -- Oceania
  ('destination', 'Oceania',       'Australia',    'Sydney',          'sydney',         1.85, 'Harbour-side glam.',                    275000, 700)
ON CONFLICT (slug) DO UPDATE SET
  type           = EXCLUDED.type,
  continent      = EXCLUDED.continent,
  country        = EXCLUDED.country,
  name           = EXCLUDED.name,
  multiplier     = EXCLUDED.multiplier,
  tagline        = EXCLUDED.tagline,
  min_budget_usd = EXCLUDED.min_budget_usd,
  display_order  = EXCLUDED.display_order,
  active         = true;

-- ── Seed: budget_cultures ─────────────────────────────────────────────────

INSERT INTO budget_cultures (name, slug, display_order)
VALUES
  ('Punjabi / Sikh',        'punjabi-sikh',     10),
  ('Gujarati',              'gujarati',         20),
  ('South Indian',          'south-indian',     30),
  ('Bengali',               'bengali',          40),
  ('Pan-Indian / Fusion',   'pan-indian',       50),
  ('Muslim / Nikah',        'muslim-nikah',     60),
  ('Christian Indian',      'christian-indian', 70),
  ('Interfaith / Fusion',   'interfaith',       80)
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  active        = true;

-- ── Seed: budget_culture_events ───────────────────────────────────────────
-- Realistic guest defaults. The `ceremony` flag is the canonical event for
-- ceremony_only vendors (mandap, pandit, baraat transport).

INSERT INTO budget_culture_events (culture_id, name, slug, icon, default_guests, display_order, ceremony)
SELECT bc.id, e.name, e.slug, e.icon, e.default_guests, e.display_order, e.ceremony
FROM budget_cultures bc
JOIN (VALUES
  -- Punjabi / Sikh
  ('punjabi-sikh',     'Mehndi',     'mehndi',     '🪷', 100, 10, false),
  ('punjabi-sikh',     'Sangeet',    'sangeet',    '💃', 250, 20, false),
  ('punjabi-sikh',     'Anand Karaj','anand-karaj','🕉️', 350, 30, true),
  ('punjabi-sikh',     'Reception',  'reception',  '🥂', 450, 40, false),
  -- Gujarati
  ('gujarati',         'Pithi',      'pithi',      '🌼',  60, 10, false),
  ('gujarati',         'Garba',      'garba',      '💃', 250, 20, false),
  ('gujarati',         'Mehndi',     'mehndi',     '🪷',  80, 30, false),
  ('gujarati',         'Ceremony',   'ceremony',   '🕉️', 350, 40, true),
  ('gujarati',         'Reception',  'reception',  '🥂', 450, 50, false),
  -- South Indian
  ('south-indian',     'Mehndi',     'mehndi',     '🪷',  80, 10, false),
  ('south-indian',     'Sangeet',    'sangeet',    '💃', 200, 20, false),
  ('south-indian',     'Muhurtham',  'muhurtham',  '🕉️', 350, 30, true),
  ('south-indian',     'Reception',  'reception',  '🥂', 400, 40, false),
  -- Bengali
  ('bengali',          'Aiburo Bhat','aiburo-bhat','🍚',  60, 10, false),
  ('bengali',          'Gaye Holud', 'gaye-holud', '🌼',  80, 20, false),
  ('bengali',          'Sangeet',    'sangeet',    '💃', 200, 30, false),
  ('bengali',          'Bibaho',     'bibaho',     '🕉️', 350, 40, true),
  ('bengali',          'Reception',  'reception',  '🥂', 450, 50, false),
  -- Pan-Indian / Fusion
  ('pan-indian',       'Mehndi',     'mehndi',     '🪷',  80, 10, false),
  ('pan-indian',       'Sangeet',    'sangeet',    '💃', 250, 20, false),
  ('pan-indian',       'Haldi',      'haldi',      '💛',  60, 30, false),
  ('pan-indian',       'Ceremony',   'ceremony',   '🕉️', 350, 40, true),
  ('pan-indian',       'Reception',  'reception',  '🥂', 450, 50, false),
  -- Muslim / Nikah
  ('muslim-nikah',     'Mehndi',     'mehndi',     '🪷', 100, 10, false),
  ('muslim-nikah',     'Sangeet',    'sangeet',    '💃', 200, 20, false),
  ('muslim-nikah',     'Nikah',      'nikah',      '☪️', 350, 30, true),
  ('muslim-nikah',     'Walima',     'walima',     '🥂', 500, 40, false),
  -- Christian Indian
  ('christian-indian', 'Mehndi',     'mehndi',     '🪷',  80, 10, false),
  ('christian-indian', 'Sangeet',    'sangeet',    '💃', 200, 20, false),
  ('christian-indian', 'Ceremony',   'ceremony',   '⛪', 300, 30, true),
  ('christian-indian', 'Reception',  'reception',  '🥂', 400, 40, false),
  -- Interfaith / Fusion
  ('interfaith',       'Mehndi',     'mehndi',     '🪷',  80, 10, false),
  ('interfaith',       'Sangeet',    'sangeet',    '💃', 250, 20, false),
  ('interfaith',       'Haldi',      'haldi',      '💛',  60, 30, false),
  ('interfaith',       'Ceremony',   'ceremony',   '🕉️', 350, 40, true),
  ('interfaith',       'Reception',  'reception',  '🥂', 450, 50, false)
) AS e(culture_slug, name, slug, icon, default_guests, display_order, ceremony)
  ON e.culture_slug = bc.slug
ON CONFLICT (culture_id, slug) DO UPDATE SET
  name           = EXCLUDED.name,
  icon           = EXCLUDED.icon,
  default_guests = EXCLUDED.default_guests,
  display_order  = EXCLUDED.display_order,
  ceremony       = EXCLUDED.ceremony;

-- ── Seed: budget_vendor_tiers ─────────────────────────────────────────────
-- Calibrated cost templates per (vendor_category, tier) at the 1.0 multiplier.
-- Keep this in sync with the canonical vendor_categories from migration 0021.

INSERT INTO budget_vendor_tiers (vendor_category_id, tier, base_cost_usd, description, display_order)
SELECT vc.id, t.tier::budget_tier, t.cost, t.descr, t.display_order
FROM vendor_categories vc
JOIN (VALUES
  -- Venue (wedding-wide)
  ('venue',                'essential',  5000,  'Banquet hall, hotel ballroom, basic in-house decor.',                            10),
  ('venue',                'elevated',   25000, 'Boutique resort or estate, partial buyout, in-house service.',                   20),
  ('venue',                'luxury',     60000, 'Full estate buyout or destination resort, multi-day, exclusive use.',            30),
  ('venue',                'ultra',      100000,'Palace, private island, château — destination flagship.',                        40),
  -- Mandap (per_event, ceremony_only)
  ('mandap',               'essential',  2500,  'Pre-built mandap, simple drape, minimal florals.',                               10),
  ('mandap',               'elevated',   8000,  'Custom-designed mandap with seasonal florals and lighting.',                     20),
  ('mandap',               'luxury',     20000, 'Architectural mandap, heavy floral installation, custom craft.',                 30),
  ('mandap',               'ultra',      50000, 'Statement build, named designer, weeks of fabrication.',                         40),
  -- Hotel block (per_guest)
  ('hotel-block',          'essential',  120,   'Mid-tier chain, group rate, ~3 nights.',                                          10),
  ('hotel-block',          'elevated',   220,   'Upscale brand, welcome amenities, hospitality desk.',                            20),
  ('hotel-block',          'luxury',     400,   'Five-star hotel, suites for VIPs, dedicated concierge.',                         30),
  ('hotel-block',          'ultra',      650,   'Resort buyout, butler service, private transfers.',                              40),
  -- Catering (per_guest, per_event)
  ('catering',             'essential',  55,    'Buffet, two-three live stations, standard table service.',                       10),
  ('catering',             'elevated',   110,   'Plated or curated stations, regional specialists, late-night snack.',            20),
  ('catering',             'luxury',     220,   'Multi-cuisine chefs, plated tasting menu, premium bar.',                          30),
  ('catering',             'ultra',      400,   'Michelin chefs, custom menus per event, top-shelf bar.',                          40),
  -- Welcome dinner / brunch (per_guest)
  ('welcome-dinner',       'essential',  45,    'Casual welcome, family-style menu.',                                              10),
  ('welcome-dinner',       'elevated',   90,    'Themed dinner, welcome cocktails, signature menu.',                              20),
  ('welcome-dinner',       'luxury',     160,   'Destination chef, plated, full open bar.',                                       30),
  ('welcome-dinner',       'ultra',      300,   'Multi-course tasting, sommelier, custom production.',                            40),

  ('day-after-brunch',     'essential',  35,    'Coffee, pastries, simple buffet.',                                                10),
  ('day-after-brunch',     'elevated',   70,    'Made-to-order stations, mimosa bar.',                                             20),
  ('day-after-brunch',     'luxury',     120,   'Plated brunch, live music, signature drinks.',                                    30),
  ('day-after-brunch',     'ultra',      220,   'Chef-led tasting, full production carry-over.',                                   40),
  -- Decor & florals (per_event)
  ('decor-florals',        'essential',  3500,  'Standard linens, basic centerpieces, minimal florals.',                          10),
  ('decor-florals',        'elevated',   12000, 'Designer-led florals, lighting, custom drape.',                                  20),
  ('decor-florals',        'luxury',     35000, 'Floor-to-ceiling florals, multiple designers, custom builds.',                   30),
  ('decor-florals',        'ultra',      80000, 'Named decorator, ground-up production, museum-grade installation.',              40),
  -- Rentals
  ('rentals',              'essential',  1500,  'Standard tables, chairs, glassware.',                                            10),
  ('rentals',              'elevated',   5000,  'Premium chair upgrades, chargers, specialty linens.',                            20),
  ('rentals',              'luxury',     12000, 'Custom dancefloor, lounge furniture, draping.',                                  30),
  ('rentals',              'ultra',      25000, 'Bespoke fabrication, multi-event sets, designer rentals.',                       40),
  -- Production (per_event)
  ('production',           'essential',  2500,  'In-house lighting + sound.',                                                     10),
  ('production',           'elevated',   8000,  'Lighting design, dance-floor wash, professional sound rig.',                     20),
  ('production',           'luxury',     20000, 'Full production crew, intelligent lighting, IMAG screens.',                      30),
  ('production',           'ultra',      55000, 'Concert-grade rig, named LD, multi-stage builds.',                               40),
  -- Staffing (per_event)
  ('staffing',             'essential',  1200,  'Banquet staff, basic captains.',                                                  10),
  ('staffing',             'elevated',   3000,  'Trained service team, sommelier, dedicated coordinator.',                        20),
  ('staffing',             'luxury',     7500,  'Butler-style service, named maître d''.',                                        30),
  ('staffing',             'ultra',      18000, 'White-glove staffing, 1-to-4 ratio, multilingual team.',                          40),
  -- Photography (wedding-wide)
  ('photography',          'essential',  5000,  'One photographer, full-day cover, online gallery.',                              10),
  ('photography',          'elevated',   15000, 'Two-person team, multi-day, edited album.',                                      20),
  ('photography',          'luxury',     35000, 'Editorial named shooter, fine-art prints, hand-bound album.',                    30),
  ('photography',          'ultra',      70000, 'Globally-known photographer, full crew, museum-quality output.',                 40),
  -- Videography
  ('videography',          'essential',  4000,  'Highlight reel, ceremony cover.',                                                10),
  ('videography',          'elevated',   12000, 'Cinematic film, drone, multi-day cover.',                                        20),
  ('videography',          'luxury',     30000, 'Feature-length film, multi-cam, documentary cuts.',                              30),
  ('videography',          'ultra',      65000, 'Named cinematographer, broadcast-grade crew, international travel.',             40),
  -- Bridal outfits (wedding-wide)
  ('bridal-outfits',       'essential',  3500,  'Off-the-rack lehenga + saree + outfit changes.',                                 10),
  ('bridal-outfits',       'elevated',   12000, 'Designer label, custom fittings, multiple pieces.',                              20),
  ('bridal-outfits',       'luxury',     35000, 'Couture label, multiple custom outfits, accessory sets.',                        30),
  ('bridal-outfits',       'ultra',      90000, 'Named couturier, archival or first-look pieces, hand-embroidered.',              40),
  -- Groom outfits
  ('groom-outfits',        'essential',  1200,  'Off-the-rack sherwani, indo-western suit.',                                      10),
  ('groom-outfits',        'elevated',   4500,  'Designer label, custom tailoring, multiple looks.',                              20),
  ('groom-outfits',        'luxury',     12000, 'Couture sherwani, custom shoes, accessory set.',                                 30),
  ('groom-outfits',        'ultra',      30000, 'Named menswear designer, multiple bespoke pieces.',                              40),
  -- Hair & makeup (per_event)
  ('hair-makeup',          'essential',  600,   'In-studio bridal HMU, mom + sister included.',                                   10),
  ('hair-makeup',          'elevated',   1800,  'Travel artist, full party glam, second-day refresh.',                            20),
  ('hair-makeup',          'luxury',     5000,  'Celebrity-tier MUA, full team, all events.',                                     30),
  ('hair-makeup',          'ultra',      12000, 'Named MUA, dedicated team across all events, international travel.',             40),
  -- Mehndi artist
  ('mehndi-artist',        'essential',  400,   'Bridal mehndi, basic family applications.',                                      10),
  ('mehndi-artist',        'elevated',   1500,  'Featured artist, multi-day cover, glitter & jewels.',                            20),
  ('mehndi-artist',        'luxury',     4000,  'Named artist, full team, intricate bridal hands & feet.',                         30),
  ('mehndi-artist',        'ultra',      10000, 'Globally-recognized artist, traveling, multi-event cover.',                      40),
  -- DJ
  ('dj',                   'essential',  1500,  'Standard DJ + basic light show.',                                                 10),
  ('dj',                   'elevated',   4500,  'Bollywood specialist DJ, MC, dancefloor production.',                            20),
  ('dj',                   'luxury',     12000, 'Multi-genre rotation, named talent, premium rig.',                                30),
  ('dj',                   'ultra',      30000, 'Internationally-touring DJ, custom set, full production.',                       40),
  -- Dhol / live music
  ('dhol-live-music',      'essential',  600,   '90-min dhol set for baraat / sangeet entry.',                                    10),
  ('dhol-live-music',      'elevated',   2500,  'Live band 2-3 hrs, multiple instrumentation.',                                   20),
  ('dhol-live-music',      'luxury',     7500,  'Named ensemble, multi-event coverage.',                                          30),
  ('dhol-live-music',      'ultra',      20000, 'Headliner act, full orchestra, custom arrangements.',                            40),
  -- Sangeet choreographer
  ('sangeet-choreographer','essential',  500,   'Three sessions, two routines.',                                                  10),
  ('sangeet-choreographer','elevated',   2000,  'Six-eight sessions, multiple routines, props.',                                  20),
  ('sangeet-choreographer','luxury',     6000,  'Named choreographer, full sangeet show production.',                             30),
  ('sangeet-choreographer','ultra',      18000, 'Bollywood choreographer, professional dancers, custom show.',                    40),
  -- Invitations
  ('invitations',          'essential',  600,   'Digital + simple printed invites.',                                              10),
  ('invitations',          'elevated',   2500,  'Designer suite, calligraphy, multiple inserts.',                                 20),
  ('invitations',          'luxury',     7500,  'Custom letterpress / foil, hand-assembled boxes.',                               30),
  ('invitations',          'ultra',      20000, 'Named stationer, hand-painted, museum-grade boxed sets.',                        40),
  -- Baraat transport (per_event, ceremony_only)
  ('baraat-transport',     'essential',  500,   'Decorated horse + groom''s entrance.',                                            10),
  ('baraat-transport',     'elevated',   2000,  'Vintage car or chariot, multi-vehicle procession.',                              20),
  ('baraat-transport',     'luxury',     6000,  'Elephant, helicopter, or fleet of luxury cars.',                                 30),
  ('baraat-transport',     'ultra',      15000, 'Multiple novelty vehicles, drone shoot, full production.',                       40),
  -- Guest transport (per_guest)
  ('guest-transport',      'essential',  35,    'Shuttle service between hotel and venue.',                                       10),
  ('guest-transport',      'elevated',   75,    'Coach buses + VIP black cars.',                                                  20),
  ('guest-transport',      'luxury',     150,   'Luxury coach + dedicated VIP fleet + airport transfers.',                        30),
  ('guest-transport',      'ultra',      300,   'Helicopter / private car for every guest.',                                      40),
  -- Pandit (ceremony_only)
  ('pandit',               'essential',  300,   'Local pandit, standard ceremony.',                                                10),
  ('pandit',               'elevated',   1000,  'Bilingual pandit, customized ceremony script.',                                  20),
  ('pandit',               'luxury',     3000,  'Named pandit traveling for the wedding, full samagri.',                          30),
  ('pandit',               'ultra',      8000,  'Multi-faith officiant or globally-recognized pandit, full crew.',                40),
  -- Wedding planner
  ('wedding-planner',      'essential',  3500,  'Month-of coordinator, vendor management.',                                       10),
  ('wedding-planner',      'elevated',   15000, 'Partial planning, design support, day-of team.',                                 20),
  ('wedding-planner',      'luxury',     45000, 'Full planning + design, multi-event coverage.',                                  30),
  ('wedding-planner',      'ultra',      120000,'Named planner, dedicated team, international logistics.',                       40),
  -- Guest gifting (per_guest)
  ('guest-gifting',        'essential',  15,    'Curated welcome bag with snacks + itinerary.',                                   10),
  ('guest-gifting',        'elevated',   45,    'Tiered gift baskets, custom packaging.',                                         20),
  ('guest-gifting',        'luxury',     120,   'Designer gift sets per event, themed welcome rooms.',                            30),
  ('guest-gifting',        'ultra',      275,   'Bespoke commissioned gifts, jewelry, heirlooms.',                                40),
  -- Security
  ('security',             'essential',  800,   'Two on-site security guards.',                                                    10),
  ('security',             'elevated',   3000,  'Full security team, ID check, on-site coordination.',                            20),
  ('security',             'luxury',     8000,  'Executive protection, VIP details.',                                              30),
  ('security',             'ultra',      20000, 'Full executive protection team, multi-day, perimeter + close-protection.',      40),
  -- Insurance
  ('insurance',            'essential',  500,   'Basic event liability.',                                                          10),
  ('insurance',            'elevated',   1500,  'Liability + cancellation rider.',                                                 20),
  ('insurance',            'luxury',     4000,  'Multi-event policy, weather + vendor default.',                                  30),
  ('insurance',            'ultra',      10000, 'Full custom policy, named-perils, international coverage.',                       40)
) AS t(category_slug, tier, cost, descr, display_order)
  ON t.category_slug = vc.slug
ON CONFLICT (vendor_category_id, tier) DO UPDATE SET
  base_cost_usd = EXCLUDED.base_cost_usd,
  description   = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- ── Seed: budget_addons ───────────────────────────────────────────────────

INSERT INTO budget_addons (name, slug, icon, base_cost_usd, description, category, scope, per_guest, display_order)
VALUES
  -- Food & Beverage
  ('Chai Cart',            'chai-cart',           '☕',  1500,  'Tandoor chai, kulhads, served live.',                                'Food & Beverage',     'per_event',     false,  10),
  ('Paan Station',          'paan-station',        '🌿', 1200,  'Sweet paan, mukhwas, traditional finishing.',                        'Food & Beverage',     'per_event',     false,  20),
  ('Kulfi Cart',           'kulfi-cart',          '🍦', 1800,  'Live kulfi pulled from matkas with kesar-pista garnish.',             'Food & Beverage',     'per_event',     false,  30),
  ('Chaat Cart',           'chaat-cart',          '🥟', 2200,  'Live chaat: pani puri, dahi puri, papdi.',                            'Food & Beverage',     'per_event',     false,  40),
  ('Late-Night Pizza',     'late-night-pizza',    '🍕', 1500,  'After-midnight wood-fired pizza station.',                            'Food & Beverage',     'per_event',     false,  50),
  ('Coffee Bar',           'coffee-bar',          '☕', 1800,  'Barista pulling espresso + Indian filter coffee.',                    'Food & Beverage',     'per_event',     false,  60),
  ('Mocktail Bar',         'mocktail-bar',        '🍹', 2500,  'Custom mocktail menu, fresh fruit, no-alc cocktails.',                'Food & Beverage',     'per_event',     false,  70),
  ('Premium Bar Upgrade',  'premium-bar',         '🥃', 8000,  'Top-shelf liquor, signature cocktails, mixologist.',                  'Food & Beverage',     'per_event',     false,  80),
  ('Whisky Tasting',       'whisky-tasting',      '🥃', 5000,  'Curated single-malt flight with sommelier.',                          'Food & Beverage',     'per_event',     false,  90),
  -- Entertainment
  ('Mentalist',            'mentalist',           '🔮', 4500,  '60-min interactive mentalist set.',                                   'Entertainment',       'per_event',     false, 100),
  ('360° Photo Booth',     '360-booth',           '📸', 3500,  '360 video capture station with branded overlays.',                    'Entertainment',       'per_event',     false, 110),
  ('Photo Booth',          'photo-booth',         '📷', 1500,  'Open-air booth with props + instant prints.',                         'Entertainment',       'per_event',     false, 120),
  ('Caricature Artist',    'caricature-artist',   '🎨', 1200,  'Live caricature sketches per guest.',                                 'Entertainment',       'per_event',     false, 130),
  ('Tarot Reader',         'tarot-reader',        '🔮', 1000,  'On-site psychic / tarot card reader.',                                'Entertainment',       'per_event',     false, 140),
  ('Bollywood Performer',  'bollywood-performer', '💃', 6000,  'Bollywood dance troupe, 2-3 numbers.',                                'Entertainment',       'per_event',     false, 150),
  ('Celebrity Performer',  'celebrity-performer', '🎤', 75000, 'Touring artist, full set, dressing room rider.',                      'Entertainment',       'per_event',     false, 160),
  ('Stand-up Comic',       'standup-comic',       '🎙️', 3500,  '20-min set, family-friendly.',                                       'Entertainment',       'per_event',     false, 170),
  ('Live Band',            'live-band',           '🎸', 8000,  'Bollywood + classic-rock cover band.',                                'Entertainment',       'per_event',     false, 180),
  -- Production & Tech
  ('Drone Show',           'drone-show',          '🛸', 35000, '500-drone aerial show after ceremony.',                               'Production & Tech',   'per_event',     false, 200),
  ('Fireworks Display',    'fireworks',           '🎆', 12000, 'Choreographed fireworks set to music.',                               'Production & Tech',   'per_event',     false, 210),
  ('Sparkler Send-off',    'sparkler-sendoff',    '✨', 800,   'Sparklers for a formal exit moment.',                                 'Production & Tech',   'per_event',     false, 220),
  ('LED Wall',             'led-wall',            '📺', 8000,  'Full LED wall backdrop for the stage.',                               'Production & Tech',   'per_event',     false, 230),
  ('Live Streaming',       'live-streaming',      '📡', 2500,  'Multi-cam live stream for remote family.',                            'Production & Tech',   'per_event',     false, 240),
  ('Drone Coverage',       'drone-coverage',      '🚁', 1800,  '4K drone aerial footage of the event.',                               'Production & Tech',   'per_event',     false, 250),
  -- Guest Experience
  ('Welcome Bags',         'welcome-bags',        '🎁', 25,    'Curated arrival bags per guest.',                                     'Guest Experience',    'wedding_wide',  true,  300),
  ('Hospitality Suite',    'hospitality-suite',   '🛋️', 5000, 'Always-open guest lounge with snacks + helpdesk.',                    'Guest Experience',    'wedding_wide',  false, 310),
  ('Custom Itinerary',     'custom-itinerary',    '📋', 1800,  'Designer-printed multi-event itinerary with map.',                    'Guest Experience',    'wedding_wide',  false, 320),
  ('Airport Transfers',    'airport-transfers',   '🚐', 65,    'Black-car transfer per guest from airport.',                          'Guest Experience',    'wedding_wide',  true,  330),
  ('Group Excursion',      'group-excursion',     '🗺️', 8000, 'Half-day excursion the day before the wedding.',                      'Guest Experience',    'wedding_wide',  false, 340),
  ('Concierge Desk',       'concierge-desk',      '🛎️', 3500, 'On-site multilingual concierge for the weekend.',                     'Guest Experience',    'wedding_wide',  false, 350),
  -- Beauty & Wellness
  ('Bridal Mehndi VIP',    'bridal-mehndi-vip',   '🪷', 2500,  'Featured artist, full hands + feet, custom motifs.',                  'Beauty & Wellness',   'per_event',     false, 400),
  ('Spa Day',              'spa-day',             '🧖', 4500,  'Pre-wedding spa morning for bridal party.',                           'Beauty & Wellness',   'wedding_wide',  false, 410),
  ('On-site Touch-ups',    'on-site-touchups',    '💄', 2000,  'Beauty team on call across the wedding day.',                         'Beauty & Wellness',   'per_event',     false, 420),
  ('Hair Stylist for Mom', 'hair-mom',            '💇', 350,   'HMU upgrade for mom across multiple events.',                         'Beauty & Wellness',   'wedding_wide',  false, 430),
  ('Wellness Lounge',      'wellness-lounge',     '🧘', 3500,  'Yoga / meditation space the morning of.',                             'Beauty & Wellness',   'wedding_wide',  false, 440),
  -- Luxury Extras
  ('Helicopter Entrance',  'helicopter-entry',    '🚁', 25000, 'Helicopter arrival for groom or bride.',                              'Luxury Extras',       'per_event',     false, 500),
  ('Vintage Car Send-off', 'vintage-car',         '🚗', 3500,  'Vintage Rolls / Bentley for the post-ceremony exit.',                 'Luxury Extras',       'per_event',     false, 510),
  ('Private Yacht',        'private-yacht',       '⛵', 18000, 'Yacht charter for a sangeet or post-event evening.',                  'Luxury Extras',       'per_event',     false, 520),
  ('Floral Tunnel',        'floral-tunnel',       '🌸', 12000, 'Walkway floral tunnel — Instagram-bait moment.',                      'Luxury Extras',       'per_event',     false, 530),
  ('Custom Mandap Design', 'custom-mandap',       '🕉️', 15000,'Architectural custom-built mandap with named designer.',              'Luxury Extras',       'per_event',     true,  540),
  ('Live Painter',         'live-painter',        '🎨', 4500,  'Live oil-painter capturing the ceremony.',                            'Luxury Extras',       'per_event',     false, 550),
  ('Calligrapher',         'calligrapher',        '🖋️', 2000, 'On-site place cards, signage, vow scrolls.',                          'Luxury Extras',       'wedding_wide',  false, 560)
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  icon          = EXCLUDED.icon,
  base_cost_usd = EXCLUDED.base_cost_usd,
  description   = EXCLUDED.description,
  category      = EXCLUDED.category,
  scope         = EXCLUDED.scope,
  per_guest     = EXCLUDED.per_guest,
  display_order = EXCLUDED.display_order,
  active        = true;
