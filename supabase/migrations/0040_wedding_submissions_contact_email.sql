-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0040: contact email + anonymous upload session for Share Your
-- Shaadi submissions.
--
-- The /share submission flow is fully public — couples don't need to log in.
-- couple_id stays nullable for anonymous submissions; we add a `contact_email`
-- so editors have a way to reach back. Also adds `upload_session_id` for
-- correlating Supabase Storage uploads under `share/{session}/…` with the
-- final submission row when it's written.
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE wedding_submissions
  ADD COLUMN IF NOT EXISTS contact_email      text,
  ADD COLUMN IF NOT EXISTS upload_session_id  text;

-- Editors filter their inbox by status + contact email. A trigram-friendly
-- btree index keeps that lookup cheap.
CREATE INDEX IF NOT EXISTS wedding_submissions_contact_email_idx
  ON wedding_submissions (contact_email)
  WHERE contact_email IS NOT NULL;

-- Storage joins use the upload session id to find the photo rows that
-- belonged to a draft before the submission row existed.
CREATE INDEX IF NOT EXISTS wedding_submissions_upload_session_idx
  ON wedding_submissions (upload_session_id)
  WHERE upload_session_id IS NOT NULL;

-- ── submission_photos: also tag photos with the upload session so anonymous
-- uploads can be linked to the submission once it's written. The submit
-- handler updates submission_id when claiming a session.

ALTER TABLE submission_photos
  ADD COLUMN IF NOT EXISTS upload_session_id text;

-- Allow uploads to land before the submission row exists (anonymous flow):
-- relax the NOT NULL constraint on submission_id and require either a
-- submission_id or an upload_session_id via a check constraint. Once the
-- submission row is written, the API rewrites submission_id from session
-- and the constraint is satisfied either way.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'submission_photos'
      AND column_name = 'submission_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE submission_photos ALTER COLUMN submission_id DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE submission_photos
  DROP CONSTRAINT IF EXISTS submission_photos_session_or_submission_check;
ALTER TABLE submission_photos
  ADD CONSTRAINT submission_photos_session_or_submission_check
  CHECK (submission_id IS NOT NULL OR upload_session_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS submission_photos_upload_session_idx
  ON submission_photos (upload_session_id, sort_order)
  WHERE upload_session_id IS NOT NULL;

-- ── RLS: anonymous flow needs to be allowed to write its own submission
-- row, so loosen the insert policy. The select policy stays scoped to the
-- couple (or to `published`); editors continue to read all rows via the
-- service role.

DROP POLICY IF EXISTS "wedding_submissions_insert_self"
  ON wedding_submissions;
CREATE POLICY "wedding_submissions_insert_self"
  ON wedding_submissions FOR INSERT
  WITH CHECK (
    -- Anonymous public submission: allowed when no couple is associated.
    couple_id IS NULL
    -- Authed couple submitting their own row.
    OR couple_id IN (
      SELECT id FROM couples WHERE owner_user_id = auth.uid()
    )
  );

-- Anonymous photo uploads (submission_id NULL, session set) need a permissive
-- policy too. We tighten this to "the storage path matches the session id"
-- once the storage bucket is configured.
DROP POLICY IF EXISTS "submission_photos_anon_session_insert"
  ON submission_photos;
CREATE POLICY "submission_photos_anon_session_insert"
  ON submission_photos FOR INSERT
  WITH CHECK (
    -- Existing path: photo belongs to an authed couple's submission.
    (
      submission_id IS NOT NULL
      AND submission_id IN (
        SELECT id FROM wedding_submissions
        WHERE couple_id IS NULL
          OR couple_id IN (
            SELECT id FROM couples WHERE owner_user_id = auth.uid()
          )
      )
    )
    -- New path: anonymous upload tagged only with a session id.
    OR (submission_id IS NULL AND upload_session_id IS NOT NULL)
  );
