-- External guest RSVP submissions for published wedding websites.
-- Public INSERT (no auth) — guests submit their own RSVP.
-- Couples SELECT their own RSVPs via RLS.

CREATE TABLE IF NOT EXISTS guest_rsvps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id   uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name   text NOT NULL,
  email        text,
  phone        text,
  attending    boolean,
  events       text[] NOT NULL DEFAULT ARRAY[]::text[],
  dietary      text,
  message      text,
  plus_ones    int NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, email)
);

CREATE INDEX IF NOT EXISTS guest_rsvps_wedding_idx ON guest_rsvps (wedding_id);
ALTER TABLE guest_rsvps ENABLE ROW LEVEL SECURITY;

-- Public can insert — no auth needed for external guests
DROP POLICY IF EXISTS "Public can submit RSVP" ON guest_rsvps;
CREATE POLICY "Public can submit RSVP"
  ON guest_rsvps FOR INSERT
  WITH CHECK (true);

-- Couples can read RSVPs for their own weddings
DROP POLICY IF EXISTS "Couples read own RSVPs" ON guest_rsvps;
CREATE POLICY "Couples read own RSVPs"
  ON guest_rsvps FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE couple_id = auth.uid()
    )
  );

-- Couples can update/delete (e.g. remove spam)
DROP POLICY IF EXISTS "Couples manage own RSVPs" ON guest_rsvps;
CREATE POLICY "Couples manage own RSVPs"
  ON guest_rsvps FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE couple_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access guest_rsvps" ON guest_rsvps;
CREATE POLICY "Service role full access guest_rsvps"
  ON guest_rsvps FOR ALL
  USING (auth.role() = 'service_role');
