-- Saved seating chart assignments per couple/wedding/event.

DROP TABLE IF EXISTS seating_assignments CASCADE;

CREATE TABLE seating_assignments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id   uuid NOT NULL,
  event_id     uuid,
  assignments  jsonb NOT NULL DEFAULT '{}'::jsonb,
  table_zones  jsonb NOT NULL DEFAULT '{}'::jsonb,
  strategy     text NOT NULL DEFAULT 'family_first',
  saved_at     timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX seating_couple_wedding_event_idx
  ON seating_assignments (couple_id, wedding_id, (event_id IS NULL))
  WHERE event_id IS NULL;

CREATE UNIQUE INDEX seating_couple_wedding_event_nn_idx
  ON seating_assignments (couple_id, wedding_id, event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX seating_couple_wedding_idx ON seating_assignments (couple_id, wedding_id);

ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples manage own seating" ON seating_assignments;
CREATE POLICY "Couples manage own seating"
  ON seating_assignments FOR ALL
  USING (couple_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access seating" ON seating_assignments;
CREATE POLICY "Service role full access seating"
  ON seating_assignments FOR ALL
  USING (auth.role() = 'service_role');
