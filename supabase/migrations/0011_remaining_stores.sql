-- ── Migration 0011: All remaining store tables ────────────────────────────────
-- Strategy: localStorage-first with Supabase as background sync.
-- All tables use couple_id scoping and service_role full access.
-- JSON/JSONB fields used for complex nested state to avoid over-normalisation.

-- ── Seating ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seating_plans (
  couple_id   text NOT NULL,
  event_id    text NOT NULL,
  room        jsonb DEFAULT '{}',
  tables      jsonb DEFAULT '[]',
  fixed       jsonb DEFAULT '[]',
  zones       jsonb DEFAULT '[]',
  preset_id   text,
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (couple_id, event_id)
);
ALTER TABLE seating_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON seating_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS seating_plans_couple_idx ON seating_plans (couple_id);

CREATE TABLE IF NOT EXISTS seating_assignments (
  couple_id   text NOT NULL,
  event_id    text NOT NULL,
  assignments jsonb DEFAULT '{}',
  table_meta  jsonb DEFAULT '{}',
  must_pairs  jsonb DEFAULT '[]',
  dining      jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (couple_id, event_id)
);
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON seating_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Venue ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venue_state (
  couple_id     text PRIMARY KEY,
  profile       jsonb DEFAULT '{}',
  discovery     jsonb DEFAULT '{}',
  shortlist     jsonb DEFAULT '[]',
  requirements  jsonb DEFAULT '[]',
  spaces        jsonb DEFAULT '[]',
  pairings      jsonb DEFAULT '[]',
  transitions   jsonb DEFAULT '[]',
  logistics     jsonb DEFAULT '{}',
  site_visits   jsonb DEFAULT '[]',
  documents     jsonb DEFAULT '[]',
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE venue_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON venue_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Photography ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photography_state (
  couple_id            text PRIMARY KEY,
  shots                jsonb DEFAULT '[]',
  vips                 jsonb DEFAULT '[]',
  group_shots          jsonb DEFAULT '[]',
  rituals              jsonb DEFAULT '[]',
  day_of               jsonb DEFAULT '[]',
  crew                 jsonb DEFAULT '[]',
  deliverables         jsonb DEFAULT '[]',
  custom_events        jsonb DEFAULT '[]',
  dismissed_suggestions jsonb DEFAULT '{}',
  updated_at           timestamptz DEFAULT now()
);
ALTER TABLE photography_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON photography_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Videography ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videography_state (
  couple_id         text PRIMARY KEY,
  reference_films   jsonb DEFAULT '[]',
  film_brief        jsonb,
  event_arcs        jsonb DEFAULT '[]',
  interviews        jsonb DEFAULT '[]',
  mic_assignments   jsonb DEFAULT '[]',
  coverage          jsonb DEFAULT '[]',
  camera_positions  jsonb DEFAULT '[]',
  coordination      jsonb DEFAULT '[]',
  deliverables      jsonb DEFAULT '[]',
  day_of            jsonb DEFAULT '[]',
  updated_at        timestamptz DEFAULT now()
);
ALTER TABLE videography_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON videography_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Aesthetic ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aesthetic_state (
  couple_id   text PRIMARY KEY,
  images      jsonb DEFAULT '[]',
  directions  jsonb DEFAULT '[]',
  dna         jsonb,
  amendments  jsonb DEFAULT '[]',
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE aesthetic_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON aesthetic_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Confessional ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS confessional_posts (
  id          text PRIMARY KEY,
  couple_id   text NOT NULL,
  data        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE confessional_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON confessional_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS confessional_posts_couple_idx ON confessional_posts (couple_id);

CREATE TABLE IF NOT EXISTS confessional_replies (
  id          text PRIMARY KEY,
  post_id     text NOT NULL,
  couple_id   text NOT NULL,
  data        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE confessional_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON confessional_replies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS confessional_replies_couple_idx ON confessional_replies (couple_id);

-- ── HMUA ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hmua_state (
  couple_id   text PRIMARY KEY,
  profiles    jsonb DEFAULT '{}',
  schedules   jsonb DEFAULT '{}',
  touch_ups   jsonb DEFAULT '{}',
  ai          jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE hmua_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON hmua_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Pandit / Ceremony ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pandit_state (
  couple_id     text PRIMARY KEY,
  brief         jsonb DEFAULT '{}',
  rituals       jsonb DEFAULT '[]',
  additions     jsonb DEFAULT '[]',
  roles         jsonb DEFAULT '[]',
  samagri       jsonb DEFAULT '[]',
  logistics     jsonb DEFAULT '{}',
  saptapadi_vows jsonb DEFAULT '[]',
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE pandit_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON pandit_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Events (wedding program) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events_state (
  couple_id       text PRIMARY KEY,
  couple_context  jsonb DEFAULT '{}',
  events          jsonb DEFAULT '[]',
  suggestions     jsonb DEFAULT '[]',
  quiz            jsonb DEFAULT '{}',
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE events_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON events_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Workspace (vendor coordination) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_state (
  couple_id     text PRIMARY KEY,
  categories    jsonb DEFAULT '[]',
  items         jsonb DEFAULT '[]',
  decisions     jsonb DEFAULT '[]',
  notes         jsonb DEFAULT '[]',
  moodboard     jsonb DEFAULT '[]',
  coverage      jsonb DEFAULT '[]',
  contracts     jsonb DEFAULT '[]',
  vendor_order  jsonb,
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE workspace_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON workspace_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Vision (workspace vision board) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vision_state (
  couple_id            text PRIMARY KEY,
  style_keywords       jsonb DEFAULT '{}',
  alignment            jsonb DEFAULT '[]',
  sections             jsonb DEFAULT '[]',
  moodboard_section_map jsonb DEFAULT '{}',
  shot_list            jsonb DEFAULT '[]',
  updated_at           timestamptz DEFAULT now()
);
ALTER TABLE vision_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON vision_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Quiz onboarding ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_completions (
  couple_id    text NOT NULL,
  quiz_key     text NOT NULL,
  data         jsonb DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  PRIMARY KEY (couple_id, quiz_key)
);
ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON quiz_completions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS quiz_completions_couple_idx ON quiz_completions (couple_id);

-- ── Documents ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couple_documents (
  id          text PRIMARY KEY,
  couple_id   text NOT NULL,
  data        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE couple_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON couple_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS couple_documents_couple_idx ON couple_documents (couple_id);

-- ── Files (couple-scoped file store — separate from workspace_files in 0007) ──
CREATE TABLE IF NOT EXISTS couple_files (
  id          text PRIMARY KEY,
  couple_id   text NOT NULL,
  data        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE couple_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON couple_files FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS couple_files_couple_idx ON couple_files (couple_id);

-- ── Stationery ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stationery_state (
  couple_id           text PRIMARY KEY,
  suite               jsonb DEFAULT '[]',
  piece_content       jsonb DEFAULT '[]',
  documents           jsonb DEFAULT '[]',
  tiers               jsonb DEFAULT '[]',
  matrix              jsonb DEFAULT '{}',
  timeline_milestones jsonb DEFAULT '[]',
  milestone_done      jsonb DEFAULT '{}',
  visual_identity     jsonb DEFAULT '{}',
  piece_preferences   jsonb DEFAULT '{}',
  piece_priority      jsonb DEFAULT '[]',
  sample_requests     jsonb DEFAULT '[]',
  inspiration_entries jsonb DEFAULT '[]',
  ref_reactions       jsonb DEFAULT '{}',
  data                jsonb DEFAULT '{}',
  updated_at          timestamptz DEFAULT now()
);
ALTER TABLE stationery_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON stationery_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Engagement Shoot ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engagement_shoot_state (
  couple_id    text PRIMARY KEY,
  vision       jsonb DEFAULT '{}',
  mood_board   jsonb DEFAULT '{}',
  looks        jsonb DEFAULT '[]',
  outfit_items jsonb DEFAULT '[]',
  locations    jsonb DEFAULT '[]',
  trip_days    jsonb DEFAULT '[]',
  trip_items   jsonb DEFAULT '[]',
  logistics    jsonb DEFAULT '[]',
  run_sheet    jsonb DEFAULT '[]',
  emergency_kit jsonb DEFAULT '[]',
  contingencies jsonb DEFAULT '[]',
  shared_board jsonb DEFAULT '{}',
  data         jsonb DEFAULT '{}',
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE engagement_shoot_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON engagement_shoot_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Mehndi ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mehndi_state (
  couple_id          text PRIMARY KEY,
  briefs             jsonb DEFAULT '[]',
  ref_images         jsonb DEFAULT '[]',
  style_prefs        jsonb DEFAULT '[]',
  personal_touch_images jsonb DEFAULT '[]',
  guest_slots        jsonb DEFAULT '[]',
  vip_guests         jsonb DEFAULT '[]',
  detailed_tier_guests jsonb DEFAULT '[]',
  setups             jsonb DEFAULT '[]',
  schedule_items     jsonb DEFAULT '[]',
  bride_care         jsonb DEFAULT '[]',
  logistics_checks   jsonb DEFAULT '[]',
  contract_checklist jsonb DEFAULT '[]',
  documents          jsonb DEFAULT '[]',
  updated_at         timestamptz DEFAULT now()
);
ALTER TABLE mehndi_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON mehndi_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Sangeet ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sangeet_state (
  couple_id  text PRIMARY KEY,
  acts       jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE sangeet_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON sangeet_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Cake & Sweets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cake_sweets_state (
  couple_id        text PRIMARY KEY,
  flavor           jsonb DEFAULT '{}',
  allergens        jsonb DEFAULT '{}',
  cake_inspirations jsonb DEFAULT '{}',
  dessert_catalog  jsonb DEFAULT '{}',
  dessert_meta     jsonb DEFAULT '{}',
  table_config     jsonb DEFAULT '{}',
  cutting_song     jsonb DEFAULT '{}',
  tasting_sessions jsonb DEFAULT '[]',
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE cake_sweets_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON cake_sweets_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Honeymoon ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS honeymoon_state (
  couple_id       text PRIMARY KEY,
  vision          jsonb DEFAULT '{}',
  brief           jsonb DEFAULT '{}',
  vibe_profile    jsonb DEFAULT '{}',
  moodboard       jsonb DEFAULT '[]',
  destinations    jsonb DEFAULT '[]',
  bookings        jsonb DEFAULT '[]',
  days            jsonb DEFAULT '[]',
  items           jsonb DEFAULT '[]',
  budget          jsonb DEFAULT '{}',
  budget_lines    jsonb DEFAULT '[]',
  registry_fund   jsonb DEFAULT '[]',
  checklist       jsonb DEFAULT '[]',
  documents       jsonb DEFAULT '[]',
  data            jsonb DEFAULT '{}',
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE honeymoon_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON honeymoon_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Travel ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_state (
  couple_id         text PRIMARY KEY,
  strategies        jsonb DEFAULT '[]',
  blocks            jsonb DEFAULT '[]',
  guests            jsonb DEFAULT '[]',
  welcome_bag_plans jsonb DEFAULT '[]',
  welcome_bag_items jsonb DEFAULT '[]',
  documents         jsonb DEFAULT '[]',
  data              jsonb DEFAULT '{}',
  updated_at        timestamptz DEFAULT now()
);
ALTER TABLE travel_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON travel_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Bachelorette ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bachelorette_state (
  couple_id        text PRIMARY KEY,
  basics           jsonb DEFAULT '{}',
  vibe_profile     jsonb DEFAULT '{}',
  vibe             jsonb DEFAULT '{}',
  moodboard        jsonb DEFAULT '[]',
  bride_prefs      jsonb DEFAULT '{}',
  guests           jsonb DEFAULT '[]',
  rooms            jsonb DEFAULT '[]',
  days             jsonb DEFAULT '[]',
  events           jsonb DEFAULT '[]',
  expenses         jsonb DEFAULT '[]',
  budget           jsonb DEFAULT '{}',
  payments         jsonb DEFAULT '{}',
  organizer_notes  jsonb DEFAULT '[]',
  documents        jsonb DEFAULT '[]',
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE bachelorette_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON bachelorette_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Bachelor ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bachelor_state (
  couple_id       text PRIMARY KEY,
  basics          jsonb DEFAULT '{}',
  vibe_profile    jsonb DEFAULT '{}',
  vibe            jsonb DEFAULT '{}',
  moodboard       jsonb DEFAULT '[]',
  groom_prefs     jsonb DEFAULT '{}',
  guests          jsonb DEFAULT '[]',
  rooms           jsonb DEFAULT '[]',
  days            jsonb DEFAULT '[]',
  events          jsonb DEFAULT '[]',
  expenses        jsonb DEFAULT '[]',
  budget          jsonb DEFAULT '{}',
  payments        jsonb DEFAULT '{}',
  organizer_notes jsonb DEFAULT '[]',
  documents       jsonb DEFAULT '[]',
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE bachelor_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON bachelor_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Bridal Shower ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bridal_shower_state (
  couple_id   text PRIMARY KEY,
  bride_name  text DEFAULT '',
  brief       jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  selection   jsonb DEFAULT '{}',
  guests      jsonb DEFAULT '[]',
  budget      jsonb DEFAULT '{}',
  checklist   jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE bridal_shower_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON bridal_shower_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Baby Shower ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS baby_shower_state (
  couple_id   text PRIMARY KEY,
  parent_name text DEFAULT '',
  plan        jsonb DEFAULT '{}',
  funding     jsonb DEFAULT '{}',
  rec_status  jsonb DEFAULT '{}',
  guests      jsonb DEFAULT '[]',
  co_hosts    jsonb DEFAULT '[]',
  itinerary   jsonb DEFAULT '[]',
  budget      jsonb DEFAULT '{}',
  expenses    jsonb DEFAULT '[]',
  documents   jsonb DEFAULT '[]',
  data        jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE baby_shower_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON baby_shower_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Welcome Events ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS welcome_events_state (
  couple_id    text PRIMARY KEY,
  basics       jsonb DEFAULT '{}',
  vibe         jsonb DEFAULT '{}',
  invite_scope jsonb DEFAULT '{}',
  guests       jsonb DEFAULT '[]',
  service_style text DEFAULT 'buffet',
  menu         jsonb DEFAULT '[]',
  bar          jsonb DEFAULT '{}',
  setup        jsonb DEFAULT '{}',
  comms        jsonb DEFAULT '{}',
  documents    jsonb DEFAULT '[]',
  data         jsonb DEFAULT '{}',
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE welcome_events_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON welcome_events_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Post-Wedding ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_wedding_state (
  couple_id          text PRIMARY KEY,
  gifts              jsonb DEFAULT '[]',
  deliveries         jsonb DEFAULT '[]',
  reviews            jsonb DEFAULT '[]',
  name_change        jsonb DEFAULT '[]',
  manual_unlock      boolean DEFAULT false,
  banner_dismissed   boolean DEFAULT false,
  data               jsonb DEFAULT '{}',
  updated_at         timestamptz DEFAULT now()
);
ALTER TABLE post_wedding_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON post_wedding_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── First Anniversary ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS first_anniversary_state (
  couple_id             text PRIMARY KEY,
  basics                jsonb DEFAULT '{}',
  vibe                  jsonb DEFAULT '{}',
  recommendation_states jsonb DEFAULT '{}',
  itinerary             jsonb DEFAULT '[]',
  expenses              jsonb DEFAULT '[]',
  documents             jsonb DEFAULT '[]',
  data                  jsonb DEFAULT '{}',
  updated_at            timestamptz DEFAULT now()
);
ALTER TABLE first_anniversary_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON first_anniversary_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── First Birthday ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS first_birthday_state (
  couple_id     text PRIMARY KEY,
  plan          jsonb DEFAULT '{}',
  ceremony      jsonb DEFAULT '{}',
  funding       jsonb DEFAULT '{}',
  rec_states    jsonb DEFAULT '{}',
  itinerary     jsonb DEFAULT '[]',
  families      jsonb DEFAULT '[]',
  budget        jsonb DEFAULT '{}',
  expenses      jsonb DEFAULT '[]',
  contributions jsonb DEFAULT '[]',
  memories      jsonb DEFAULT '[]',
  shot_list     jsonb DEFAULT '[]',
  album         jsonb DEFAULT '{}',
  reflections   jsonb DEFAULT '{}',
  documents     jsonb DEFAULT '[]',
  data          jsonb DEFAULT '{}',
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE first_birthday_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON first_birthday_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Contract Checklist ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_checklist_state (
  couple_id  text PRIMARY KEY,
  rows       jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE contract_checklist_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON contract_checklist_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Music Schedule ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS music_schedule_state (
  couple_id  text PRIMARY KEY,
  slots      jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE music_schedule_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON music_schedule_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Music Soundscape ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS music_soundscape_state (
  couple_id        text PRIMARY KEY,
  energy_arc       jsonb DEFAULT '[]',
  sangeet_style    jsonb DEFAULT '{}',
  live_dj_mix      jsonb DEFAULT '{}',
  genre_mix        jsonb DEFAULT '[]',
  non_negotiables  jsonb DEFAULT '[]',
  soundscapes      jsonb DEFAULT '[]',
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE music_soundscape_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON music_soundscape_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Music Tech ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS music_tech_state (
  couple_id  text PRIMARY KEY,
  specs      jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE music_tech_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON music_tech_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Vendor Workspace ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_workspaces (
  couple_id   text PRIMARY KEY,
  workspaces  jsonb DEFAULT '[]',
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE vendor_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON vendor_workspaces FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Finance (missing tables from 0010) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_contributors (
  id          text PRIMARY KEY,
  couple_id   text NOT NULL,
  name        text NOT NULL DEFAULT '',
  relationship text DEFAULT '',
  pledged_cents bigint DEFAULT 0,
  paid_cents  bigint DEFAULT 0,
  visibility_scope text DEFAULT 'all',
  notes       text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE finance_contributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON finance_contributors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS finance_contributors_couple_idx ON finance_contributors (couple_id);

CREATE TABLE IF NOT EXISTS finance_payments (
  id             text PRIMARY KEY,
  couple_id      text NOT NULL,
  invoice_id     text NOT NULL,
  amount_cents   bigint DEFAULT 0,
  paid_date      text,
  payment_method text DEFAULT 'other',
  notes          text,
  created_at     timestamptz DEFAULT now()
);
ALTER TABLE finance_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON finance_payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS finance_payments_couple_idx ON finance_payments (couple_id);

-- ── RSVP (households + guests tables from 0010) ───────────────────────────────
-- rsvp_events, rsvp_households, rsvp_guests already defined in 0010 but
-- the store didn't wire CRUD for them. Tables exist, just add if missing.
CREATE TABLE IF NOT EXISTS rsvp_household_notes (
  couple_id    text NOT NULL,
  household_id text NOT NULL,
  notes        text DEFAULT '',
  PRIMARY KEY (couple_id, household_id)
);
ALTER TABLE rsvp_household_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON rsvp_household_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couple_notifications (
  couple_id     text PRIMARY KEY,
  notifications jsonb DEFAULT '[]',
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE couple_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON couple_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Uploads ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couple_uploads (
  id          text PRIMARY KEY,
  couple_id   text NOT NULL,
  entity_id   text,
  data        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE couple_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON couple_uploads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS couple_uploads_couple_idx ON couple_uploads (couple_id);
