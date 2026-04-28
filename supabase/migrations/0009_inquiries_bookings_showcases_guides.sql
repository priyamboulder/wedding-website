-- ── 0009: inquiries, bookings, showcases, guides ────────────────────────���────
-- Adds the four core transactional tables that were still running off seed data.

-- ── Inquiries ──────────────────────────���──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
    CREATE TYPE inquiry_status AS ENUM ('submitted','viewed','responded','booked','declined','expired');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_source') THEN
    CREATE TYPE inquiry_source AS ENUM ('direct','recommendation','roulette','marketplace','planner','organic');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS inquiries (
  id              text PRIMARY KEY,
  status          inquiry_status  NOT NULL DEFAULT 'submitted',
  couple_id       text            NOT NULL,
  couple_name     text            NOT NULL,
  vendor_id       text            NOT NULL,
  vendor_name     text            NOT NULL,
  vendor_category text            NOT NULL,
  planner_id      text,
  source          inquiry_source  NOT NULL DEFAULT 'direct',
  package_ids     text[]          NOT NULL DEFAULT '{}',
  wedding_date    date            NOT NULL,
  guest_count     int             NOT NULL DEFAULT 0,
  venue_name      text,
  events          text[]          NOT NULL DEFAULT '{}',
  budget_min      bigint,
  budget_max      bigint,
  messages        jsonb           NOT NULL DEFAULT '[]'::jsonb,
  viewed_at       timestamptz,
  created_at      timestamptz     NOT NULL DEFAULT now(),
  updated_at      timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_couple_id_idx  ON inquiries (couple_id);
CREATE INDEX IF NOT EXISTS inquiries_vendor_id_idx  ON inquiries (vendor_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx     ON inquiries (status);

-- RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples read own inquiries"  ON inquiries;
DROP POLICY IF EXISTS "Vendors read own inquiries"  ON inquiries;
DROP POLICY IF EXISTS "Couples insert inquiries"    ON inquiries;
DROP POLICY IF EXISTS "Service role full access inquiries" ON inquiries;

CREATE POLICY "Couples read own inquiries"
  ON inquiries FOR SELECT
  USING (couple_id = auth.uid()::text);

CREATE POLICY "Vendors read own inquiries"
  ON inquiries FOR SELECT
  USING (vendor_id = auth.uid()::text);

CREATE POLICY "Couples insert inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (couple_id = auth.uid()::text);

CREATE POLICY "Service role full access inquiries"
  ON inquiries FOR ALL
  USING (auth.role() = 'service_role');


-- ── Bookings ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('requested','confirmed','completed','cancelled','refunded');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id           text        NOT NULL,
  creator_id           text        NOT NULL,
  couple_user_id       text        NOT NULL,
  status               booking_status NOT NULL DEFAULT 'requested',
  scheduled_at         timestamptz,
  meeting_link         text,
  price_paid           int         NOT NULL,
  platform_fee         int         NOT NULL,
  creator_payout       int         NOT NULL,
  deliverable_url      text,
  couple_note          text        NOT NULL DEFAULT '',
  cancellation_reason  text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_couple_user_id_idx ON bookings (couple_user_id);
CREATE INDEX IF NOT EXISTS bookings_creator_id_idx     ON bookings (creator_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx         ON bookings (status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples read own bookings"  ON bookings;
DROP POLICY IF EXISTS "Creators read own bookings" ON bookings;
DROP POLICY IF EXISTS "Couples insert bookings"    ON bookings;
DROP POLICY IF EXISTS "Service role full access bookings" ON bookings;

CREATE POLICY "Couples read own bookings"
  ON bookings FOR SELECT
  USING (couple_user_id = auth.uid()::text);

CREATE POLICY "Creators read own bookings"
  ON bookings FOR SELECT
  USING (creator_id = auth.uid()::text);

CREATE POLICY "Couples insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (couple_user_id = auth.uid()::text);

CREATE POLICY "Service role full access bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');


-- ── Showcases ──────────────────────────────��──────────────────────────────────
CREATE TABLE IF NOT EXISTS showcases (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        NOT NULL UNIQUE,
  title           text        NOT NULL,
  couple_names    text        NOT NULL,
  wedding_date    date,
  location_city   text        NOT NULL DEFAULT '',
  location_state  text        NOT NULL DEFAULT '',
  tradition_tags  text[]      NOT NULL DEFAULT '{}',
  style_tags      text[]      NOT NULL DEFAULT '{}',
  budget_range    text,
  hero_image_url  text        NOT NULL DEFAULT '',
  gallery_urls    text[]      NOT NULL DEFAULT '{}',
  description     text        NOT NULL DEFAULT '',
  vendor_credits  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  base_save_count int         NOT NULL DEFAULT 0,
  base_view_count int         NOT NULL DEFAULT 0,
  is_published    boolean     NOT NULL DEFAULT false,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS showcases_published_idx    ON showcases (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS showcases_tradition_idx    ON showcases USING GIN (tradition_tags);
CREATE INDEX IF NOT EXISTS showcases_style_idx        ON showcases USING GIN (style_tags);

ALTER TABLE showcases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published showcases" ON showcases;
DROP POLICY IF EXISTS "Service role full access showcases" ON showcases;

CREATE POLICY "Public read published showcases"
  ON showcases FOR SELECT
  USING (is_published = true);

CREATE POLICY "Service role full access showcases"
  ON showcases FOR ALL
  USING (auth.role() = 'service_role');


-- ── Guides ───────────────────────────────��─────────────────────────────��──────
CREATE TABLE IF NOT EXISTS guides (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        NOT NULL UNIQUE,
  title           text        NOT NULL,
  subtitle        text        NOT NULL DEFAULT '',
  category        text        NOT NULL,
  creator_id      text        NOT NULL,
  cover_image_url text        NOT NULL DEFAULT '',
  read_time_min   int         NOT NULL DEFAULT 5,
  base_save_count int         NOT NULL DEFAULT 0,
  base_view_count int         NOT NULL DEFAULT 0,
  is_published    boolean     NOT NULL DEFAULT false,
  published_at    timestamptz,
  content_json    jsonb,
  tags            text[]      NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guides_published_idx  ON guides (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS guides_category_idx   ON guides (category);
CREATE INDEX IF NOT EXISTS guides_creator_idx    ON guides (creator_id);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published guides" ON guides;
DROP POLICY IF EXISTS "Service role full access guides" ON guides;

CREATE POLICY "Public read published guides"
  ON guides FOR SELECT
  USING (is_published = true);

CREATE POLICY "Service role full access guides"
  ON guides FOR ALL
  USING (auth.role() = 'service_role');


-- ── Vendor shortlist (couple-scoped saves) ───────────────��────────────────────
-- Table was defined in 0001 but with auth.users FK — relax to text so
-- unauthenticated/seed couples still work. We add the upsert-friendly
-- couple_shortlist_v2 table here.
CREATE TABLE IF NOT EXISTS couple_shortlist_v2 (
  couple_id    text        NOT NULL,
  vendor_id    text        NOT NULL,
  saved_at     timestamptz NOT NULL DEFAULT now(),
  notes        text        NOT NULL DEFAULT '',
  status       text        NOT NULL DEFAULT 'shortlisted',
  PRIMARY KEY (couple_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS shortlist_couple_idx ON couple_shortlist_v2 (couple_id);

ALTER TABLE couple_shortlist_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples manage own shortlist" ON couple_shortlist_v2;
DROP POLICY IF EXISTS "Service role full access shortlist" ON couple_shortlist_v2;

CREATE POLICY "Couples manage own shortlist"
  ON couple_shortlist_v2 FOR ALL
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

CREATE POLICY "Service role full access shortlist"
  ON couple_shortlist_v2 FOR ALL
  USING (auth.role() = 'service_role');
