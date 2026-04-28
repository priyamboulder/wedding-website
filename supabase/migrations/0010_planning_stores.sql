-- ── 0010: Planning stores ────────────────────────────────────────────────────
-- Adds tables for: checklist items, finance, guest roster, RSVP,
-- schedule, notes/ideas, journal entries, music, catering, decor.
-- All tables are couple-scoped (couple_id text). RLS is service-role-only
-- so the server-side client can read/write freely; browser calls go through
-- the API routes which use the service role.

-- ── Checklist items ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_items (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  phase_id        text        NOT NULL,
  subsection      text        NOT NULL DEFAULT '',
  title           text        NOT NULL,
  description     text,
  status          text        NOT NULL DEFAULT 'not_started',
  priority        text        NOT NULL DEFAULT 'medium',
  due_date        date,
  notes           text,
  is_custom       boolean     NOT NULL DEFAULT false,
  category_tags   text[]      NOT NULL DEFAULT '{}',
  assignee_ids    text[]      NOT NULL DEFAULT '{}',
  dependencies    text[]      NOT NULL DEFAULT '{}',
  decision_fields jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS checklist_items_couple_idx ON checklist_items (couple_id);
CREATE INDEX IF NOT EXISTS checklist_items_phase_idx  ON checklist_items (couple_id, phase_id);
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full checklist" ON checklist_items;
CREATE POLICY "Service role full checklist" ON checklist_items FOR ALL USING (auth.role() = 'service_role');

-- ── Finance categories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_categories (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  label       text        NOT NULL,
  icon        text        NOT NULL DEFAULT '💰',
  color       text        NOT NULL DEFAULT '#C4A265',
  sort_order  int         NOT NULL DEFAULT 0,
  is_hidden   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finance_categories_couple_idx ON finance_categories (couple_id);
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full finance_categories" ON finance_categories;
CREATE POLICY "Service role full finance_categories" ON finance_categories FOR ALL USING (auth.role() = 'service_role');

-- ── Finance budgets ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_budgets (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  category_id text        NOT NULL,
  event_id    text        NOT NULL DEFAULT 'all',
  allocated   bigint      NOT NULL DEFAULT 0,
  spent       bigint      NOT NULL DEFAULT 0,
  currency    text        NOT NULL DEFAULT 'INR',
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finance_budgets_couple_idx ON finance_budgets (couple_id);
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full finance_budgets" ON finance_budgets;
CREATE POLICY "Service role full finance_budgets" ON finance_budgets FOR ALL USING (auth.role() = 'service_role');

-- ── Finance invoices ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_invoices (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  vendor_id       text,
  vendor_name     text        NOT NULL DEFAULT '',
  category_id     text        NOT NULL,
  event_id        text,
  status          text        NOT NULL DEFAULT 'draft',
  amount          bigint      NOT NULL DEFAULT 0,
  currency        text        NOT NULL DEFAULT 'INR',
  due_date        date,
  description     text,
  notes           text,
  milestones      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finance_invoices_couple_idx ON finance_invoices (couple_id);
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full finance_invoices" ON finance_invoices;
CREATE POLICY "Service role full finance_invoices" ON finance_invoices FOR ALL USING (auth.role() = 'service_role');

-- ── Finance transactions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_transactions (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  category_id     text        NOT NULL,
  event_id        text,
  invoice_id      text,
  amount          bigint      NOT NULL DEFAULT 0,
  currency        text        NOT NULL DEFAULT 'INR',
  direction       text        NOT NULL DEFAULT 'debit',
  description     text        NOT NULL DEFAULT '',
  paid_at         date,
  payment_method  text,
  source          text        NOT NULL DEFAULT 'manual',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finance_transactions_couple_idx ON finance_transactions (couple_id);
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full finance_transactions" ON finance_transactions;
CREATE POLICY "Service role full finance_transactions" ON finance_transactions FOR ALL USING (auth.role() = 'service_role');

-- ── Finance settings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_settings (
  couple_id       text        PRIMARY KEY,
  total_budget    bigint      NOT NULL DEFAULT 0,
  currency        text        NOT NULL DEFAULT 'INR',
  onboarding_done boolean     NOT NULL DEFAULT false,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full finance_settings" ON finance_settings;
CREATE POLICY "Service role full finance_settings" ON finance_settings FOR ALL USING (auth.role() = 'service_role');

-- ── Guest roster ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_roster (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  first_name      text        NOT NULL,
  last_name       text        NOT NULL DEFAULT '',
  relationship    text        NOT NULL DEFAULT '',
  side            text        NOT NULL DEFAULT 'shared',
  phone           text,
  email           text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guest_roster_couple_idx ON guest_roster (couple_id);
ALTER TABLE guest_roster ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full guest_roster" ON guest_roster;
CREATE POLICY "Service role full guest_roster" ON guest_roster FOR ALL USING (auth.role() = 'service_role');

-- ── RSVP data ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvp_events (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  name        text        NOT NULL,
  date        date,
  time        text,
  venue       text,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rsvp_events_couple_idx ON rsvp_events (couple_id);
ALTER TABLE rsvp_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full rsvp_events" ON rsvp_events;
CREATE POLICY "Service role full rsvp_events" ON rsvp_events FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS rsvp_households (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  name        text        NOT NULL,
  side        text        NOT NULL DEFAULT 'bride',
  city        text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rsvp_households_couple_idx ON rsvp_households (couple_id);
ALTER TABLE rsvp_households ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full rsvp_households" ON rsvp_households;
CREATE POLICY "Service role full rsvp_households" ON rsvp_households FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS rsvp_guests (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  household_id    text        NOT NULL,
  first_name      text        NOT NULL,
  last_name       text        NOT NULL DEFAULT '',
  honorific       text,
  relationship    text,
  side            text        NOT NULL DEFAULT 'bride',
  dietary         text[]      NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rsvp_guests_couple_idx     ON rsvp_guests (couple_id);
CREATE INDEX IF NOT EXISTS rsvp_guests_household_idx  ON rsvp_guests (household_id);
ALTER TABLE rsvp_guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full rsvp_guests" ON rsvp_guests;
CREATE POLICY "Service role full rsvp_guests" ON rsvp_guests FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS rsvp_statuses (
  couple_id   text        NOT NULL,
  guest_id    text        NOT NULL,
  event_id    text        NOT NULL,
  status      text        NOT NULL DEFAULT 'pending',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (couple_id, guest_id, event_id)
);
CREATE INDEX IF NOT EXISTS rsvp_statuses_couple_idx ON rsvp_statuses (couple_id);
ALTER TABLE rsvp_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full rsvp_statuses" ON rsvp_statuses;
CREATE POLICY "Service role full rsvp_statuses" ON rsvp_statuses FOR ALL USING (auth.role() = 'service_role');

-- ── Schedule items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_items (
  id                text        PRIMARY KEY,
  couple_id         text        NOT NULL,
  event_id          text        NOT NULL,
  label             text        NOT NULL,
  description       text,
  start_time        text        NOT NULL DEFAULT '00:00',
  end_time          text        NOT NULL DEFAULT '00:00',
  duration_minutes  int         NOT NULL DEFAULT 0,
  category          text        NOT NULL DEFAULT 'custom',
  is_fixed          boolean     NOT NULL DEFAULT false,
  track             text        NOT NULL DEFAULT 'main',
  location          text,
  notes_for_vendor  text,
  internal_notes    text,
  sort_order        int         NOT NULL DEFAULT 0,
  color             text,
  status            text        NOT NULL DEFAULT 'draft',
  vendor_ids        text[]      NOT NULL DEFAULT '{}',
  assigned_to       text[]      NOT NULL DEFAULT '{}',
  is_photo_moment   boolean     NOT NULL DEFAULT false,
  music_cue         text,
  actual_start_time text,
  actual_end_time   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS schedule_items_couple_idx  ON schedule_items (couple_id);
CREATE INDEX IF NOT EXISTS schedule_items_event_idx   ON schedule_items (couple_id, event_id);
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full schedule_items" ON schedule_items;
CREATE POLICY "Service role full schedule_items" ON schedule_items FOR ALL USING (auth.role() = 'service_role');

-- ── Notes & Ideas ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  title       text        NOT NULL DEFAULT '',
  body        text        NOT NULL DEFAULT '',
  tags        text[]      NOT NULL DEFAULT '{}',
  image_url   text,
  is_private  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  edited_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notes_couple_idx ON notes (couple_id);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full notes" ON notes;
CREATE POLICY "Service role full notes" ON notes FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS quick_captures (
  id            text        PRIMARY KEY,
  couple_id     text        NOT NULL,
  kind          text        NOT NULL DEFAULT 'text',
  content       text        NOT NULL,
  preview_label text,
  captured_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quick_captures_couple_idx ON quick_captures (couple_id);
ALTER TABLE quick_captures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full quick_captures" ON quick_captures;
CREATE POLICY "Service role full quick_captures" ON quick_captures FOR ALL USING (auth.role() = 'service_role');

-- ── Journal entries ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id                    text        PRIMARY KEY,
  couple_id             text        NOT NULL,
  kind                  text        NOT NULL DEFAULT 'note',
  url                   text,
  title                 text        NOT NULL,
  description           text,
  image                 text,
  domain                text,
  body_markdown         text,
  category_tags         text[]      NOT NULL DEFAULT '{}',
  auto_tag_suggestions  text[]      NOT NULL DEFAULT '{}',
  dismissed_suggestions text[]      NOT NULL DEFAULT '{}',
  added_at              timestamptz NOT NULL DEFAULT now(),
  edited_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journal_entries_couple_idx ON journal_entries (couple_id);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full journal_entries" ON journal_entries;
CREATE POLICY "Service role full journal_entries" ON journal_entries FOR ALL USING (auth.role() = 'service_role');

-- ── Music candidates & contracts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS music_candidates (
  id            text        PRIMARY KEY,
  couple_id     text        NOT NULL,
  party_id      text        NOT NULL,
  name          text        NOT NULL,
  type          text        NOT NULL DEFAULT 'dj',
  status        text        NOT NULL DEFAULT 'exploring',
  contact       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS music_candidates_couple_idx ON music_candidates (couple_id);
ALTER TABLE music_candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full music_candidates" ON music_candidates;
CREATE POLICY "Service role full music_candidates" ON music_candidates FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS music_contracts (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  candidate_id    text        NOT NULL,
  status          text        NOT NULL DEFAULT 'draft',
  amount          bigint      NOT NULL DEFAULT 0,
  currency        text        NOT NULL DEFAULT 'INR',
  milestones      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  signed_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS music_contracts_couple_idx ON music_contracts (couple_id);
ALTER TABLE music_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full music_contracts" ON music_contracts;
CREATE POLICY "Service role full music_contracts" ON music_contracts FOR ALL USING (auth.role() = 'service_role');

-- ── Catering data ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catering_proposals (
  id              text        PRIMARY KEY,
  couple_id       text        NOT NULL,
  caterer_name    text        NOT NULL,
  status          text        NOT NULL DEFAULT 'exploring',
  amount          bigint,
  currency        text        NOT NULL DEFAULT 'INR',
  notes           text,
  contact         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catering_proposals_couple_idx ON catering_proposals (couple_id);
ALTER TABLE catering_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full catering_proposals" ON catering_proposals;
CREATE POLICY "Service role full catering_proposals" ON catering_proposals FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS catering_menu_events (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  name        text        NOT NULL,
  date        date,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catering_menu_events_couple_idx ON catering_menu_events (couple_id);
ALTER TABLE catering_menu_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full catering_menu_events" ON catering_menu_events;
CREATE POLICY "Service role full catering_menu_events" ON catering_menu_events FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS catering_dishes (
  id          text        PRIMARY KEY,
  couple_id   text        NOT NULL,
  event_id    text        NOT NULL,
  moment_id   text,
  name        text        NOT NULL,
  category    text        NOT NULL DEFAULT 'main',
  dietary     text[]      NOT NULL DEFAULT '{}',
  notes       text,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catering_dishes_couple_idx ON catering_dishes (couple_id);
ALTER TABLE catering_dishes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full catering_dishes" ON catering_dishes;
CREATE POLICY "Service role full catering_dishes" ON catering_dishes FOR ALL USING (auth.role() = 'service_role');

-- ── Decor data ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decor_state (
  couple_id       text        PRIMARY KEY,
  brief           text        NOT NULL DEFAULT '',
  style_keywords  text[]      NOT NULL DEFAULT '{}',
  quiz_answers    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  moodboard_pins  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  event_palettes  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  space_dreams    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  floral_by_event jsonb       NOT NULL DEFAULT '[]'::jsonb,
  lighting_moods  jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE decor_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full decor_state" ON decor_state;
CREATE POLICY "Service role full decor_state" ON decor_state FOR ALL USING (auth.role() = 'service_role');
