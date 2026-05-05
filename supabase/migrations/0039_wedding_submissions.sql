-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0039: Share Your Shaadi — wedding submission flow.
--
-- Stores submissions from /share, the editorial Real Wedding submission
-- experience that lives alongside the existing /community/real-weddings/new
-- showcase wizard. Two paths share one table:
--
--   submission_path = 'diy'           — couple built their story block-by-block
--   submission_path = 'ai_interview'  — couple did the AI chat first
--
-- The blocks jsonb holds the array of typed StoryBlocks (see
-- types/share-shaadi.ts). interview_transcript + ai_draft are populated only
-- on the AI path; both are kept around so editors can inspect how the AI
-- arrived at the draft.
--
-- couple_id is nullable so couples who haven't signed up can submit (the
-- editorial team can publish under a guest byline). When a couple signs up
-- and matches by email later, the API can claim the submission.
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_submissions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id               uuid REFERENCES couples(id) ON DELETE SET NULL,

  bride_name              text NOT NULL,
  groom_name              text NOT NULL,
  wedding_date            date,
  venue                   text,
  city                    text,
  guest_count             int,
  -- Subset of the EventTag enum from types/share-shaadi.ts.
  events                  text[] DEFAULT '{}',
  hashtag                 text,

  storytelling_angle      text,            -- 'timeline' | 'people' | 'details' | 'unfiltered'
  submission_path         text NOT NULL,   -- 'diy' | 'ai_interview'

  -- Story content. Array of typed StoryBlock objects.
  blocks                  jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- AI path only.
  interview_transcript    jsonb,           -- [{role, content, isFinal?}]
  ai_draft                jsonb,           -- {headline, pullQuote, blocks}

  cover_photos            text[] DEFAULT '{}',

  status                  text NOT NULL DEFAULT 'draft',
  -- Internal editorial review note. Never surfaced to the couple directly.
  editor_notes            text,
  published_at            timestamptz,
  -- Set when an editor publishes the feature; unique so we don't collide.
  published_slug          text UNIQUE,

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT wedding_submissions_path_check
    CHECK (submission_path IN ('diy','ai_interview')),
  CONSTRAINT wedding_submissions_status_check
    CHECK (status IN ('draft','submitted','in_review','revision_requested','published','archived')),
  CONSTRAINT wedding_submissions_angle_check
    CHECK (
      storytelling_angle IS NULL
      OR storytelling_angle IN ('timeline','people','details','unfiltered')
    )
);

CREATE INDEX IF NOT EXISTS wedding_submissions_status_idx
  ON wedding_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS wedding_submissions_couple_idx
  ON wedding_submissions (couple_id);
CREATE INDEX IF NOT EXISTS wedding_submissions_published_idx
  ON wedding_submissions (published_at DESC)
  WHERE status = 'published';

-- updated_at trigger: bump whenever a row changes.
CREATE OR REPLACE FUNCTION wedding_submissions_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wedding_submissions_updated_at ON wedding_submissions;
CREATE TRIGGER wedding_submissions_updated_at
  BEFORE UPDATE ON wedding_submissions
  FOR EACH ROW
  EXECUTE FUNCTION wedding_submissions_set_updated_at();

-- ── Photo uploads ──────────────────────────────────────────────────────────
-- Each photo uploaded as part of a block lives here. block_index pins it to
-- a specific block within blocks[] (used to reconstruct gallery order on the
-- editor side); sort_order sorts within a block.

CREATE TABLE IF NOT EXISTS submission_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   uuid NOT NULL REFERENCES wedding_submissions(id) ON DELETE CASCADE,
  block_index     int,
  storage_path    text NOT NULL,
  caption         text,
  event_tag       text,
  sort_order      int DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS submission_photos_submission_idx
  ON submission_photos (submission_id, block_index, sort_order);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Couples can read/write their own submission rows. Anyone can insert a draft
-- (couple_id may be null for anonymous submissions). Editors get full access
-- via the existing service-role / admin pattern in the rest of the schema.

ALTER TABLE wedding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_photos   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wedding_submissions_select_own"
  ON wedding_submissions;
CREATE POLICY "wedding_submissions_select_own"
  ON wedding_submissions FOR SELECT
  USING (
    -- Published features are public on the read side.
    status = 'published'
    OR (
      couple_id IS NOT NULL
      AND couple_id IN (
        SELECT id FROM couples WHERE owner_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "wedding_submissions_insert_self"
  ON wedding_submissions;
CREATE POLICY "wedding_submissions_insert_self"
  ON wedding_submissions FOR INSERT
  WITH CHECK (
    couple_id IS NULL
    OR couple_id IN (
      SELECT id FROM couples WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wedding_submissions_update_own"
  ON wedding_submissions;
CREATE POLICY "wedding_submissions_update_own"
  ON wedding_submissions FOR UPDATE
  USING (
    couple_id IS NOT NULL
    AND couple_id IN (
      SELECT id FROM couples WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "submission_photos_rw_via_submission"
  ON submission_photos;
CREATE POLICY "submission_photos_rw_via_submission"
  ON submission_photos FOR ALL
  USING (
    submission_id IN (
      SELECT id FROM wedding_submissions
      WHERE couple_id IS NOT NULL
        AND couple_id IN (
          SELECT id FROM couples WHERE owner_user_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    submission_id IN (
      SELECT id FROM wedding_submissions
      WHERE couple_id IS NULL
        OR couple_id IN (
          SELECT id FROM couples WHERE owner_user_id = auth.uid()
        )
    )
  );
