-- ── Migration 0017: Collections, Products, and Referrals ─────────────────────

-- ── Creator Collections ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_collections (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  creator_id    text NOT NULL,
  title         text NOT NULL DEFAULT '',
  description   text DEFAULT '',
  cover_image   text DEFAULT '',
  is_published  boolean DEFAULT false,
  item_count    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE creator_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON creator_collections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published collections" ON creator_collections FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Authenticated can read published collections" ON creator_collections FOR SELECT TO authenticated USING (is_published = true);
CREATE INDEX IF NOT EXISTS creator_collections_creator_idx ON creator_collections (creator_id);

-- ── Collection Items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collection_items (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  collection_id   text NOT NULL REFERENCES creator_collections(id) ON DELETE CASCADE,
  creator_id      text NOT NULL,
  title           text NOT NULL DEFAULT '',
  description     text DEFAULT '',
  price_cents     integer DEFAULT 0,
  currency        text DEFAULT 'INR',
  images          jsonb DEFAULT '[]',
  category        text DEFAULT '',
  tags            jsonb DEFAULT '[]',
  is_available    boolean DEFAULT true,
  showcase_ids    jsonb DEFAULT '[]',
  guide_ids       jsonb DEFAULT '[]',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON collection_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can read available items" ON collection_items FOR SELECT TO anon USING (is_available = true);
CREATE POLICY "Authenticated can read available items" ON collection_items FOR SELECT TO authenticated USING (is_available = true);
CREATE INDEX IF NOT EXISTS collection_items_collection_idx ON collection_items (collection_id);
CREATE INDEX IF NOT EXISTS collection_items_creator_idx ON collection_items (creator_id);

-- ── Product → Showcase links ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_showcase_links (
  product_id    text NOT NULL,
  showcase_id   text NOT NULL,
  linked_at     timestamptz DEFAULT now(),
  PRIMARY KEY (product_id, showcase_id)
);
ALTER TABLE product_showcase_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON product_showcase_links FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public read" ON product_showcase_links FOR SELECT TO anon USING (true);
CREATE INDEX IF NOT EXISTS product_showcase_product_idx ON product_showcase_links (product_id);
CREATE INDEX IF NOT EXISTS product_showcase_showcase_idx ON product_showcase_links (showcase_id);

-- ── Product → Guide links ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_guide_links (
  product_id    text NOT NULL,
  guide_id      text NOT NULL,
  linked_at     timestamptz DEFAULT now(),
  PRIMARY KEY (product_id, guide_id)
);
ALTER TABLE product_guide_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON product_guide_links FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public read" ON product_guide_links FOR SELECT TO anon USING (true);
CREATE INDEX IF NOT EXISTS product_guide_product_idx ON product_guide_links (product_id);

-- ── Referrals ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  referrer_id   text NOT NULL,
  referee_id    text,
  referee_email text,
  source        text DEFAULT 'link',
  campaign      text DEFAULT '',
  status        text DEFAULT 'pending',
  converted_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON referrals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users see own referrals" ON referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid()::text);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referee_email_idx ON referrals (referee_email);

-- ── Enable Realtime on collections ───────────────────────────────────────────
ALTER TABLE creator_collections REPLICA IDENTITY FULL;
ALTER TABLE collection_items REPLICA IDENTITY FULL;
