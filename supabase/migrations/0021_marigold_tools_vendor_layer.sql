-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0021: Unified vendor surfacing layer for the Marigold Tools hub.
--
-- Every Tool (Budget, Destination Explorer, future tools) reads vendors from
-- the same source. ONE vendors table, ONE placement model, ONE ranking
-- function. Tool-specific filters are arguments to get_ranked_vendors — never
-- separate vendor tables.
--
-- This migration:
--   1. Extends the existing `vendors` table (from 0001) with the columns
--      tools need (slug, hero/gallery, location, capacity, tier_match,
--      placement metadata, verified flag).
--   2. Creates the canonical `vendor_categories` list shared with the Budget
--      tool, plus an M2M assignment table so a vendor can serve multiple
--      categories.
--   3. Adds `vendor_placements` for granular sponsorship control per tool
--      context (category / location / tier).
--   4. Adds `vendor_pricing_indicators` for rough "from $X" signaling.
--   5. Adds `vendor_inquiries` for tool-driven lead capture (anonymous OK).
--   6. Adds the `get_ranked_vendors` function — single ranking implementation
--      that every Tool calls.
--   7. Seeds vendor_categories with the canonical Indian wedding category
--      list. Vendor records are NOT seeded here — those come from the
--      existing vendor database in a separate migration.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Enums ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_placement_tier') THEN
    CREATE TYPE vendor_placement_tier AS ENUM ('standard', 'featured', 'sponsored');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_category_scope') THEN
    CREATE TYPE vendor_category_scope AS ENUM ('per_event', 'wedding_wide');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_placement_type') THEN
    CREATE TYPE vendor_placement_type AS ENUM (
      'global_featured',
      'category_sponsored',
      'destination_sponsored',
      'tier_sponsored'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_pricing_unit') THEN
    CREATE TYPE vendor_pricing_unit AS ENUM (
      'flat',
      'per_event',
      'per_guest',
      'per_hour',
      'package'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_inquiry_status') THEN
    CREATE TYPE vendor_inquiry_status AS ENUM ('new', 'sent', 'responded', 'closed');
  END IF;
END $$;

-- ── Extend vendors table ──────────────────────────────────────────────────
-- The existing `vendors` table from 0001 has: id, name, category (text),
-- location, price_range, style_tags, rating, review_count, images, bio,
-- contact, turnaround, enriched_at, created_at. Migration 0014 added
-- auth_user_id and email.
--
-- We add tool-driven fields here. The legacy `category` column stays for
-- backward compatibility with old code paths; new tools read categories via
-- the `vendor_category_assignments` junction table.

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS gallery_image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS instagram_handle text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS home_base_city text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS home_base_country text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS travels_globally boolean NOT NULL DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS destinations_served jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tier_match jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS capacity_min integer;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS capacity_max integer;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS placement_tier vendor_placement_tier NOT NULL DEFAULT 'standard';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS placement_expires_at timestamptz;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS vendors_slug_unique_idx ON vendors (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS vendors_active_idx ON vendors (active);
CREATE INDEX IF NOT EXISTS vendors_placement_tier_idx ON vendors (placement_tier);
CREATE INDEX IF NOT EXISTS vendors_home_base_city_idx ON vendors (home_base_city);
CREATE INDEX IF NOT EXISTS vendors_destinations_served_gin ON vendors USING gin (destinations_served);
CREATE INDEX IF NOT EXISTS vendors_tier_match_gin ON vendors USING gin (tier_match);
CREATE INDEX IF NOT EXISTS vendors_verified_idx ON vendors (verified) WHERE verified = true;

-- Keep updated_at in sync.
CREATE OR REPLACE FUNCTION vendors_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendors_updated_at_trigger ON vendors;
CREATE TRIGGER vendors_updated_at_trigger
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION vendors_set_updated_at();

-- ── vendor_categories ─────────────────────────────────────────────────────
-- Canonical category list. Same one used by the Budget tool for allocation
-- buckets and by the vendor surfacing layer for filtering. Tools should
-- always JOIN through here — never hardcode category strings.

CREATE TABLE IF NOT EXISTS vendor_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  icon          text NOT NULL DEFAULT '',
  group_name    text NOT NULL DEFAULT '',
  scope         vendor_category_scope NOT NULL DEFAULT 'per_event',
  per_guest     boolean NOT NULL DEFAULT false,
  ceremony_only boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_categories_active_order_idx
  ON vendor_categories (active, display_order);

-- ── vendor_category_assignments ───────────────────────────────────────────
-- M2M: a vendor can serve multiple categories (e.g., a planner who also
-- does decor; a photographer who also shoots video). `is_primary` flags the
-- vendor's main category for default surfacing.

CREATE TABLE IF NOT EXISTS vendor_category_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, category_id)
);

CREATE INDEX IF NOT EXISTS vca_vendor_idx ON vendor_category_assignments (vendor_id);
CREATE INDEX IF NOT EXISTS vca_category_idx ON vendor_category_assignments (category_id);

-- Only one primary category per vendor.
CREATE UNIQUE INDEX IF NOT EXISTS vca_one_primary_per_vendor
  ON vendor_category_assignments (vendor_id) WHERE is_primary = true;

-- ── vendor_placements ─────────────────────────────────────────────────────
-- Granular placement control. A single vendor can hold multiple placements
-- (e.g., featured globally AND sponsored in "Mumbai photographers"). Each
-- placement has a time window so paid slots auto-expire.

CREATE TABLE IF NOT EXISTS vendor_placements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  placement_type vendor_placement_type NOT NULL,
  category_slug  text,
  location_slug  text,
  tier           text,
  starts_at      timestamptz NOT NULL DEFAULT now(),
  ends_at        timestamptz,
  active         boolean NOT NULL DEFAULT true,
  notes          text NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vp_vendor_idx ON vendor_placements (vendor_id);
CREATE INDEX IF NOT EXISTS vp_active_window_idx
  ON vendor_placements (active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS vp_type_category_idx
  ON vendor_placements (placement_type, category_slug);
CREATE INDEX IF NOT EXISTS vp_type_location_idx
  ON vendor_placements (placement_type, location_slug);
CREATE INDEX IF NOT EXISTS vp_type_tier_idx
  ON vendor_placements (placement_type, tier);

-- ── vendor_pricing_indicators ─────────────────────────────────────────────
-- Rough price signaling. NOT exact quotes — used to show "from $X" or
-- "$X – $Y" on tool surfaces. A vendor can have one indicator per category
-- (e.g., a photographer prices Mehndi differently from full wedding).

CREATE TABLE IF NOT EXISTS vendor_pricing_indicators (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  category_id    uuid NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
  price_low_usd  integer NOT NULL,
  price_high_usd integer NOT NULL,
  price_unit     vendor_pricing_unit NOT NULL DEFAULT 'package',
  notes          text NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, category_id)
);

CREATE INDEX IF NOT EXISTS vpi_vendor_idx ON vendor_pricing_indicators (vendor_id);
CREATE INDEX IF NOT EXISTS vpi_category_idx ON vendor_pricing_indicators (category_id);

-- ── vendor_inquiries ──────────────────────────────────────────────────────
-- Lead capture from tool surfaces. Anonymous inquiries are allowed (couple
-- might not be logged in when they click "I'm interested" from the Budget
-- tool). The richer booking-flow inquiries live in the existing `inquiries`
-- table — that one is for couple→vendor conversations after auth. This one
-- is for top-of-funnel lead capture.

CREATE TABLE IF NOT EXISTS vendor_inquiries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_email  text,
  source_tool      text NOT NULL,
  source_context   jsonb NOT NULL DEFAULT '{}'::jsonb,
  status           vendor_inquiry_status NOT NULL DEFAULT 'new',
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vendor_inquiries_actor_present
    CHECK (user_id IS NOT NULL OR anonymous_email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS vi_vendor_idx ON vendor_inquiries (vendor_id);
CREATE INDEX IF NOT EXISTS vi_user_idx ON vendor_inquiries (user_id);
CREATE INDEX IF NOT EXISTS vi_status_idx ON vendor_inquiries (status);
CREATE INDEX IF NOT EXISTS vi_source_tool_idx ON vendor_inquiries (source_tool);

-- ── get_ranked_vendors ────────────────────────────────────────────────────
-- Single canonical ranking implementation. Every Tool calls this — never
-- reimplement filtering/sorting client-side.
--
-- Filters:
--   • category match (via vendor_category_assignments)
--   • location served (home_base, in destinations_served, OR travels_globally)
--   • tier match (tier in vendors.tier_match)
--   • capacity range (capacity_min/max bracket the request, NULLs are wild)
--   • active = true and any matching placements not yet expired
--
-- Rank buckets (lower = better):
--   1. Sponsored placement matching exact context (category+location+tier)
--   2. Global featured placement
--   3. Verified vendor
--   4. Everyone else
-- Within a bucket, ordering is random — no implicit tie-breaker that would
-- let a vendor game the system by name.

CREATE OR REPLACE FUNCTION get_ranked_vendors(
  p_category_slug text DEFAULT NULL,
  p_location_slug text DEFAULT NULL,
  p_tier          text DEFAULT NULL,
  p_capacity      integer DEFAULT NULL,
  p_limit         integer DEFAULT 24
)
RETURNS TABLE (
  id                   uuid,
  slug                 text,
  name                 text,
  tagline              text,
  bio                  text,
  hero_image_url       text,
  gallery_image_urls   jsonb,
  website_url          text,
  instagram_handle     text,
  email                text,
  phone                text,
  home_base_city       text,
  home_base_country    text,
  travels_globally     boolean,
  destinations_served  jsonb,
  tier_match           jsonb,
  capacity_min         integer,
  capacity_max         integer,
  placement_tier       vendor_placement_tier,
  verified             boolean,
  rank_bucket          integer
)
LANGUAGE sql STABLE AS $$
  WITH active_placements AS (
    SELECT * FROM vendor_placements
    WHERE active = true
      AND starts_at <= now()
      AND (ends_at IS NULL OR ends_at > now())
  ),
  matching AS (
    SELECT v.*
    FROM vendors v
    WHERE v.active = true
      AND (
        p_category_slug IS NULL
        OR EXISTS (
          SELECT 1
          FROM vendor_category_assignments vca
          JOIN vendor_categories vc ON vc.id = vca.category_id
          WHERE vca.vendor_id = v.id
            AND vc.slug = p_category_slug
            AND vc.active = true
        )
      )
      AND (
        p_location_slug IS NULL
        OR v.travels_globally = true
        OR v.destinations_served ? p_location_slug
        OR lower(replace(coalesce(v.home_base_city, ''), ' ', '-')) = lower(p_location_slug)
      )
      AND (
        p_tier IS NULL
        OR v.tier_match ? p_tier
      )
      AND (
        p_capacity IS NULL
        OR (
          (v.capacity_min IS NULL OR v.capacity_min <= p_capacity)
          AND (v.capacity_max IS NULL OR v.capacity_max >= p_capacity)
        )
      )
  ),
  bucketed AS (
    SELECT
      m.*,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM active_placements ap
          WHERE ap.vendor_id = m.id
            AND ap.placement_type IN (
              'category_sponsored',
              'destination_sponsored',
              'tier_sponsored'
            )
            AND (
              ap.placement_type <> 'category_sponsored'
              OR (p_category_slug IS NOT NULL AND ap.category_slug = p_category_slug)
            )
            AND (
              ap.placement_type <> 'destination_sponsored'
              OR (p_location_slug IS NOT NULL AND ap.location_slug = p_location_slug)
            )
            AND (
              ap.placement_type <> 'tier_sponsored'
              OR (p_tier IS NOT NULL AND ap.tier = p_tier)
            )
        ) THEN 1
        WHEN EXISTS (
          SELECT 1 FROM active_placements ap
          WHERE ap.vendor_id = m.id
            AND ap.placement_type = 'global_featured'
        ) THEN 2
        WHEN m.verified THEN 3
        ELSE 4
      END AS rank_bucket
    FROM matching m
  )
  SELECT
    id, slug, name, tagline, bio, hero_image_url, gallery_image_urls,
    website_url, instagram_handle, email, phone,
    home_base_city, home_base_country, travels_globally,
    destinations_served, tier_match, capacity_min, capacity_max,
    placement_tier, verified, rank_bucket
  FROM bucketed
  ORDER BY rank_bucket ASC, random()
  LIMIT GREATEST(p_limit, 1);
$$;

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Public read access for the surfacing tables (active rows only).
-- Inquiries: anyone can insert (anonymous lead capture); reads gated by user.

ALTER TABLE vendors                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_category_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_placements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_pricing_indicators     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_inquiries              ENABLE ROW LEVEL SECURITY;

-- The 0001 policy "vendors readable by authed" requires auth.role() =
-- 'authenticated', which blocks anon Tool users. get_ranked_vendors runs as
-- the caller (LANGUAGE sql STABLE — no SECURITY DEFINER), so without an
-- anon-readable policy the function silently returns zero rows on public
-- Tool surfaces. Add a public-read policy scoped to active vendors. RLS
-- policies are additive, so this expands anon access without changing the
-- existing authed surface.
DROP POLICY IF EXISTS "Public reads active vendors" ON vendors;
CREATE POLICY "Public reads active vendors"
  ON vendors FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public reads active categories" ON vendor_categories;
CREATE POLICY "Public reads active categories"
  ON vendor_categories FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public reads category assignments" ON vendor_category_assignments;
CREATE POLICY "Public reads category assignments"
  ON vendor_category_assignments FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors v
      WHERE v.id = vendor_category_assignments.vendor_id AND v.active = true
    )
  );

DROP POLICY IF EXISTS "Public reads active placements" ON vendor_placements;
CREATE POLICY "Public reads active placements"
  ON vendor_placements FOR SELECT
  TO anon, authenticated
  USING (
    active = true
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
  );

DROP POLICY IF EXISTS "Public reads pricing indicators" ON vendor_pricing_indicators;
CREATE POLICY "Public reads pricing indicators"
  ON vendor_pricing_indicators FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors v
      WHERE v.id = vendor_pricing_indicators.vendor_id AND v.active = true
    )
  );

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON vendor_inquiries;
CREATE POLICY "Anyone can submit inquiry"
  ON vendor_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Authenticated users must claim their own inquiry; anon submitters must
    -- supply a contact email.
    (auth.uid() IS NULL AND user_id IS NULL AND anonymous_email IS NOT NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Couples read own inquiries" ON vendor_inquiries;
CREATE POLICY "Couples read own inquiries"
  ON vendor_inquiries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Vendor-admin read policies are deferred — service-role access from server
-- code is sufficient until the vendor portal needs to surface these.

-- ── Seed: vendor_categories ───────────────────────────────────────────────
-- Canonical Indian wedding category list. Shared with the Budget tool.
-- Inserts are idempotent on slug.

INSERT INTO vendor_categories (name, slug, icon, group_name, scope, per_guest, ceremony_only, display_order)
VALUES
  -- Venue & space
  ('Venue',                'venue',                '🏛️', 'Venue & Space',          'wedding_wide', false, false,  10),
  ('Mandap',               'mandap',               '🕉️', 'Venue & Space',          'per_event',    false, true,   20),
  ('Hotel Block',          'hotel-block',          '🏨', 'Venue & Space',          'wedding_wide', true,  false,  30),

  -- Food & beverage
  ('Catering',             'catering',             '🍽️', 'Food & Beverage',        'per_event',    true,  false,  40),
  ('Welcome Dinner',       'welcome-dinner',       '🥂', 'Food & Beverage',        'per_event',    true,  false,  50),
  ('Day-After Brunch',     'day-after-brunch',     '🍳', 'Food & Beverage',        'per_event',    true,  false,  60),

  -- Production
  ('Decor & Florals',      'decor-florals',        '🌸', 'Production',             'per_event',    false, false,  70),
  ('Rentals',              'rentals',              '🪑', 'Production',             'per_event',    false, false,  80),
  ('Production',           'production',           '⚙️', 'Production',             'per_event',    false, false,  90),
  ('Staffing',             'staffing',             '🧑‍🍳', 'Production',           'per_event',    false, false, 100),

  -- Visual
  ('Photography',          'photography',          '📸', 'Visual',                 'wedding_wide', false, false, 110),
  ('Videography',          'videography',          '🎥', 'Visual',                 'wedding_wide', false, false, 120),

  -- Attire & beauty
  ('Bridal Outfits',       'bridal-outfits',       '👰',  'Attire & Beauty',       'wedding_wide', false, false, 130),
  ('Groom Outfits',        'groom-outfits',        '🤵',  'Attire & Beauty',       'wedding_wide', false, false, 140),
  ('Hair & Makeup',        'hair-makeup',          '💄',  'Attire & Beauty',       'per_event',    false, false, 150),
  ('Mehndi Artist',        'mehndi-artist',        '🪷',  'Attire & Beauty',       'per_event',    false, false, 160),

  -- Music & entertainment
  ('DJ',                   'dj',                   '🎧',  'Music & Entertainment', 'per_event',    false, false, 170),
  ('Dhol/Live Music',      'dhol-live-music',      '🥁',  'Music & Entertainment', 'per_event',    false, false, 180),
  ('Sangeet Choreographer','sangeet-choreographer','💃',  'Music & Entertainment', 'per_event',    false, false, 190),

  -- Stationery
  ('Invitations',          'invitations',          '✉️', 'Stationery',             'wedding_wide', false, false, 200),

  -- Transport
  ('Baraat Transport',     'baraat-transport',     '🐎',  'Transport',             'per_event',    false, true,  210),
  ('Guest Transport',      'guest-transport',      '🚐',  'Transport',             'wedding_wide', true,  false, 220),

  -- Ceremony & planning
  ('Pandit',               'pandit',               '🪔',  'Ceremony & Planning',   'per_event',    false, true,  230),
  ('Wedding Planner',      'wedding-planner',      '📋',  'Ceremony & Planning',   'wedding_wide', false, false, 240),

  -- Guest experience & risk
  ('Guest Gifting',        'guest-gifting',        '🎁',  'Guest Experience',      'wedding_wide', true,  false, 250),
  ('Security',             'security',             '🛡️', 'Guest Experience',      'wedding_wide', false, false, 260),
  ('Insurance',            'insurance',            '📜',  'Guest Experience',      'wedding_wide', false, false, 270)
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  icon          = EXCLUDED.icon,
  group_name    = EXCLUDED.group_name,
  scope         = EXCLUDED.scope,
  per_guest     = EXCLUDED.per_guest,
  ceremony_only = EXCLUDED.ceremony_only,
  display_order = EXCLUDED.display_order,
  active        = true;
