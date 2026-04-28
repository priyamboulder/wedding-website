-- ── Migration 0012: Platform & community store tables ────────────────────────
-- All stores wired in the second pass. Single-row per couple pattern
-- (couple_id PRIMARY KEY, data jsonb) for straightforward state blobs.

-- ── Album ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS album_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE album_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON album_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Article Links ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_links_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE article_links_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON article_links_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Brand Overrides ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_overrides_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE brand_overrides_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON brand_overrides_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Cart ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE cart_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON cart_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Comments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE comments_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON comments_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Community Discussions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_discussions_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE community_discussions_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON community_discussions_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Community Huddles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_huddles_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE community_huddles_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON community_huddles_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Community Live Events ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_live_events_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE community_live_events_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON community_live_events_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Community Meetups ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_meetups_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE community_meetups_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON community_meetups_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Community Profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_profiles_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE community_profiles_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON community_profiles_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Community Social ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_social_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE community_social_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON community_social_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Content Studio ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_studio_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE content_studio_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON content_studio_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Conversation ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON conversation_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Coordination ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coordination_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE coordination_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON coordination_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Creator Applications ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_applications_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE creator_applications_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON creator_applications_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Creator Portal ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_portal_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE creator_portal_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON creator_portal_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Creators ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creators_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE creators_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON creators_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Discovery ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discovery_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE discovery_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON discovery_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Drops ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drops_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE drops_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON drops_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Exhibitions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exhibitions_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE exhibitions_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON exhibitions_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Grapevine ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grapevine_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE grapevine_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON grapevine_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Guest Categories ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_categories_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE guest_categories_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON guest_categories_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Guest Experiences ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_experiences_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE guest_experiences_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON guest_experiences_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Guides ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guides_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE guides_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON guides_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Marketplace ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE marketplace_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON marketplace_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Matching ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matching_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE matching_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON matching_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Mentoring ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentoring_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE mentoring_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON mentoring_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── One Look ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS one_look_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE one_look_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON one_look_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Partnerships ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partnerships_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE partnerships_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON partnerships_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Performances ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performances_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE performances_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON performances_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Real Numbers ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS real_numbers_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE real_numbers_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON real_numbers_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Recommendations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE recommendations_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON recommendations_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Roulette ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roulette_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE roulette_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON roulette_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Seating Drag ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seating_drag_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE seating_drag_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON seating_drag_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Showcases ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS showcases_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE showcases_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON showcases_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── User Designs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_designs_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_designs_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON user_designs_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Vendor Needs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_needs_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE vendor_needs_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON vendor_needs_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Vendor Packages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_packages_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE vendor_packages_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON vendor_packages_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Vendor Reviews ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_reviews_state (
  couple_id  text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE vendor_reviews_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON vendor_reviews_state FOR ALL TO service_role USING (true) WITH CHECK (true);
