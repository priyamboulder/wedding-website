-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0038: The Brief — 2-minute planning quiz.
--
-- Stores anonymous quiz submissions from /brief. Each submission gets a
-- short, URL-safe public id (used as the bookmarkable results URL) plus a
-- private uuid primary key. Once a quiz-taker signs up, the API can claim
-- the brief by writing user_id (RLS lets them update only their own).
--
-- brief_leads collects emails captured on the results page ("Save Your
-- Brief") and the corresponding brief_id for nurture campaigns.
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brief_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Short public id used in URLs (/brief/abc123de). Generated app-side.
  public_id       text NOT NULL UNIQUE,
  -- Set if the quiz-taker later signs up and claims their brief.
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  events          text NOT NULL,          -- "1" | "3" | "5" | "7+"
  guests          text NOT NULL,          -- "intimate" | "classic" | "grand" | "epic"
  budget          text NOT NULL,          -- "under-50k" | "50-100k" | "100-250k" | "250-500k" | "500k-plus" | "unsure"
  vibe            text NOT NULL,          -- "mughal" | "modern" | "garden" | "bollywood" | "coastal" | "heritage"
  destination     text NOT NULL,          -- "local" | "us" | "india" | "international" | "undecided"
  -- Top 3 priorities ordered by rank (rank 1 first). Stored as a jsonb
  -- array of priority keys, e.g. ["food","photography","decor"].
  priorities      jsonb NOT NULL,
  timeline        text NOT NULL,          -- "under-6m" | "6-12m" | "12-18m" | "18m-plus" | "no-date"

  -- IP/UA captured for spam triage only. Never surfaced.
  client_ip       inet,
  user_agent      text,

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT brief_events_check        CHECK (events IN ('1','3','5','7+')),
  CONSTRAINT brief_guests_check        CHECK (guests IN ('intimate','classic','grand','epic')),
  CONSTRAINT brief_budget_check        CHECK (budget IN ('under-50k','50-100k','100-250k','250-500k','500k-plus','unsure')),
  CONSTRAINT brief_vibe_check          CHECK (vibe IN ('mughal','modern','garden','bollywood','coastal','heritage')),
  CONSTRAINT brief_destination_check   CHECK (destination IN ('local','us','india','international','undecided')),
  CONSTRAINT brief_timeline_check      CHECK (timeline IN ('under-6m','6-12m','12-18m','18m-plus','no-date')),
  CONSTRAINT brief_priorities_shape    CHECK (jsonb_typeof(priorities) = 'array' AND jsonb_array_length(priorities) = 3),
  CONSTRAINT brief_public_id_shape     CHECK (public_id ~ '^[a-z0-9]{8,16}$')
);

CREATE INDEX IF NOT EXISTS brief_responses_public_id_idx
  ON brief_responses (public_id);

CREATE INDEX IF NOT EXISTS brief_responses_user_idx
  ON brief_responses (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS brief_responses_created_idx
  ON brief_responses (created_at DESC);

-- ── Email capture ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brief_leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id        uuid NOT NULL REFERENCES brief_responses(id) ON DELETE CASCADE,
  email           text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT brief_leads_email_shape CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- One email per brief — re-submitting just updates created_at via upsert.
CREATE UNIQUE INDEX IF NOT EXISTS brief_leads_brief_email_uniq
  ON brief_leads (brief_id, lower(email));

CREATE INDEX IF NOT EXISTS brief_leads_email_idx
  ON brief_leads (lower(email));

-- ── RLS ──────────────────────────────────────────────────────────────────
-- Reads are deliberately public-by-public-id: anyone with the URL can see
-- the brief (it's a shareable card). Writes go through the service-role
-- API only — anon inserts are blocked at the RLS layer so spam fingers are
-- handled server-side (rate limit + UA check in the route handler).

ALTER TABLE brief_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_leads     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads briefs by id" ON brief_responses;
CREATE POLICY "Public reads briefs by id"
  ON brief_responses FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Owner updates own brief" ON brief_responses;
CREATE POLICY "Owner updates own brief"
  ON brief_responses FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- brief_leads is service-role only (sensitive — emails). No anon/auth read.
