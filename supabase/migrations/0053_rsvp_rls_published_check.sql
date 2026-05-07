-- Tighten RSVP insert policy: only allow RSVPs for published weddings
DROP POLICY IF EXISTS "Public can submit RSVP" ON guest_rsvps;
CREATE POLICY "Public can submit RSVP for published weddings"
  ON guest_rsvps FOR INSERT
  WITH CHECK (
    wedding_id IN (
      SELECT id FROM weddings WHERE website_published = true
    )
  );
