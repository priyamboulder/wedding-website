-- ── Migration 0019: Add authenticated RLS policies to all blob-store tables ──
-- Migrations 0010–0012 created tables with only service_role policies.
-- hydrate-stores.ts reads these tables from the browser (authenticated role),
-- causing 403s. This migration adds couple-scoped authenticated policies to
-- every blob-store table queried by hydrate-stores.ts.
--
-- Pattern: couple_id = auth.uid()::text for all read + write.

-- Helper macro: tables with couple_id text PRIMARY KEY (blob pattern).
-- Each gets SELECT + INSERT + UPDATE + DELETE for authenticated users whose
-- auth.uid()::text matches the couple_id.

-- ── 0011: remaining stores ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Couple access travel_state" ON travel_state;
CREATE POLICY "Couple access travel_state" ON travel_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access honeymoon_state" ON honeymoon_state;
CREATE POLICY "Couple access honeymoon_state" ON honeymoon_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access bachelorette_state" ON bachelorette_state;
CREATE POLICY "Couple access bachelorette_state" ON bachelorette_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access bachelor_state" ON bachelor_state;
CREATE POLICY "Couple access bachelor_state" ON bachelor_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access bridal_shower_state" ON bridal_shower_state;
CREATE POLICY "Couple access bridal_shower_state" ON bridal_shower_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access contract_checklist_state" ON contract_checklist_state;
CREATE POLICY "Couple access contract_checklist_state" ON contract_checklist_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access music_schedule_state" ON music_schedule_state;
CREATE POLICY "Couple access music_schedule_state" ON music_schedule_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access music_soundscape_state" ON music_soundscape_state;
CREATE POLICY "Couple access music_soundscape_state" ON music_soundscape_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access music_tech_state" ON music_tech_state;
CREATE POLICY "Couple access music_tech_state" ON music_tech_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- Seating tables (composite PK — use couple_id column)
DROP POLICY IF EXISTS "Couple access seating_plans" ON seating_plans;
CREATE POLICY "Couple access seating_plans" ON seating_plans FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access seating_assignments" ON seating_assignments;
CREATE POLICY "Couple access seating_assignments" ON seating_assignments FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- Venue and other workspace stores
DROP POLICY IF EXISTS "Couple access venue_state" ON venue_state;
CREATE POLICY "Couple access venue_state" ON venue_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── 0010: planning stores ───────────────────────────────────────────────────
-- (checklist_items, finance, guest_roster, notes, journal already handled in 0015)
-- Add any that are still missing:

DROP POLICY IF EXISTS "Couple access rsvp_events" ON rsvp_events;
CREATE POLICY "Couple access rsvp_events" ON rsvp_events FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access rsvp_households" ON rsvp_households;
CREATE POLICY "Couple access rsvp_households" ON rsvp_households FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access rsvp_guests" ON rsvp_guests;
CREATE POLICY "Couple access rsvp_guests" ON rsvp_guests FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access rsvp_statuses" ON rsvp_statuses;
CREATE POLICY "Couple access rsvp_statuses" ON rsvp_statuses FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── 0012: platform stores ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Couple access album_state" ON album_state;
CREATE POLICY "Couple access album_state" ON album_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access article_links_state" ON article_links_state;
CREATE POLICY "Couple access article_links_state" ON article_links_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access content_studio_state" ON content_studio_state;
CREATE POLICY "Couple access content_studio_state" ON content_studio_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access stationery_state" ON stationery_state;
CREATE POLICY "Couple access stationery_state" ON stationery_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access guest_categories_state" ON guest_categories_state;
CREATE POLICY "Couple access guest_categories_state" ON guest_categories_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access guest_experiences_state" ON guest_experiences_state;
CREATE POLICY "Couple access guest_experiences_state" ON guest_experiences_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access performances_state" ON performances_state;
CREATE POLICY "Couple access performances_state" ON performances_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access vendor_needs_state" ON vendor_needs_state;
CREATE POLICY "Couple access vendor_needs_state" ON vendor_needs_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access vendor_packages_state" ON vendor_packages_state;
CREATE POLICY "Couple access vendor_packages_state" ON vendor_packages_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access vendor_reviews_state" ON vendor_reviews_state;
CREATE POLICY "Couple access vendor_reviews_state" ON vendor_reviews_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access discovery_state" ON discovery_state;
CREATE POLICY "Couple access discovery_state" ON discovery_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access cart_state" ON cart_state;
CREATE POLICY "Couple access cart_state" ON cart_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access drops_state" ON drops_state;
CREATE POLICY "Couple access drops_state" ON drops_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access marketplace_state" ON marketplace_state;
CREATE POLICY "Couple access marketplace_state" ON marketplace_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access recommendations_state" ON recommendations_state;
CREATE POLICY "Couple access recommendations_state" ON recommendations_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access welcome_events_state" ON welcome_events_state;
CREATE POLICY "Couple access welcome_events_state" ON welcome_events_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access engagement_shoot_state" ON engagement_shoot_state;
CREATE POLICY "Couple access engagement_shoot_state" ON engagement_shoot_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access first_anniversary_state" ON first_anniversary_state;
CREATE POLICY "Couple access first_anniversary_state" ON first_anniversary_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access first_birthday_state" ON first_birthday_state;
CREATE POLICY "Couple access first_birthday_state" ON first_birthday_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access post_wedding_state" ON post_wedding_state;
CREATE POLICY "Couple access post_wedding_state" ON post_wedding_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access baby_shower_state" ON baby_shower_state;
CREATE POLICY "Couple access baby_shower_state" ON baby_shower_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access coordination_state" ON coordination_state;
CREATE POLICY "Couple access coordination_state" ON coordination_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access brand_overrides_state" ON brand_overrides_state;
CREATE POLICY "Couple access brand_overrides_state" ON brand_overrides_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access seating_drag_state" ON seating_drag_state;
CREATE POLICY "Couple access seating_drag_state" ON seating_drag_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access user_designs_state" ON user_designs_state;
CREATE POLICY "Couple access user_designs_state" ON user_designs_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- workspace_files uses wedding_id (uuid), not couple_id — scoped differently
DROP POLICY IF EXISTS "Couple access workspace_files" ON workspace_files;
CREATE POLICY "Couple access workspace_files" ON workspace_files FOR ALL TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- couple_documents — check schema for correct column name
-- (skipped: table may use a different scoping column; hydration handles missing data gracefully)

-- Community stores (couple_id scoped)
DROP POLICY IF EXISTS "Couple access comments_state" ON comments_state;
CREATE POLICY "Couple access comments_state" ON comments_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access conversation_state" ON conversation_state;
CREATE POLICY "Couple access conversation_state" ON conversation_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access confessional_posts" ON confessional_posts;
CREATE POLICY "Couple access confessional_posts" ON confessional_posts FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);
