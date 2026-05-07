-- Brand systems and studio designs persistence layer.
-- Enables couples to save their brand kit and design choices.

-- ── brand_systems ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_systems (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT 'My Brand',
  monogram        jsonb,
  palette         jsonb,
  typography      jsonb,
  motifs          jsonb DEFAULT '[]'::jsonb,
  completion_pct  int  NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brand_systems_wedding_idx ON brand_systems (wedding_id);
ALTER TABLE brand_systems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples manage own brand systems" ON brand_systems;
CREATE POLICY "Couples manage own brand systems"
  ON brand_systems FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE couple_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access brand_systems" ON brand_systems;
CREATE POLICY "Service role full access brand_systems"
  ON brand_systems FOR ALL
  USING (auth.role() = 'service_role');

-- ── studio_designs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studio_designs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id          uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  kind                text NOT NULL DEFAULT 'website',   -- website | invitation | print
  sub_kind            text,                              -- hero | save-the-date | menu | ...
  event_id            uuid,                              -- optional: sangeet | mehndi | ...
  template_id         text,
  brand_system_id     uuid REFERENCES brand_systems(id) ON DELETE SET NULL,
  overrides           jsonb DEFAULT '{}'::jsonb,
  content             jsonb DEFAULT '{}'::jsonb,
  status              text NOT NULL DEFAULT 'draft',     -- draft | review | finalized
  current_version_id  uuid,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_designs_wedding_idx ON studio_designs (wedding_id);
CREATE INDEX IF NOT EXISTS studio_designs_kind_idx    ON studio_designs (wedding_id, kind);
ALTER TABLE studio_designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples manage own studio designs" ON studio_designs;
CREATE POLICY "Couples manage own studio designs"
  ON studio_designs FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE couple_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access studio_designs" ON studio_designs;
CREATE POLICY "Service role full access studio_designs"
  ON studio_designs FOR ALL
  USING (auth.role() = 'service_role');

-- ── design_versions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_versions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id   uuid NOT NULL REFERENCES studio_designs(id) ON DELETE CASCADE,
  snapshot    jsonb NOT NULL,
  author      text,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS design_versions_design_idx ON design_versions (design_id);
ALTER TABLE design_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples read own design versions" ON design_versions;
CREATE POLICY "Couples read own design versions"
  ON design_versions FOR SELECT
  USING (
    design_id IN (
      SELECT sd.id FROM studio_designs sd
      JOIN weddings w ON w.id = sd.wedding_id
      WHERE w.couple_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access design_versions" ON design_versions;
CREATE POLICY "Service role full access design_versions"
  ON design_versions FOR ALL
  USING (auth.role() = 'service_role');

-- ── studio_assets ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studio_assets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  kind        text NOT NULL DEFAULT 'photo',   -- photo | graphic | ai_image
  url         text NOT NULL,
  prompt      text,
  tags        text[] DEFAULT ARRAY[]::text[],
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_assets_wedding_idx ON studio_assets (wedding_id);
ALTER TABLE studio_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples manage own studio assets" ON studio_assets;
CREATE POLICY "Couples manage own studio assets"
  ON studio_assets FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE couple_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access studio_assets" ON studio_assets;
CREATE POLICY "Service role full access studio_assets"
  ON studio_assets FOR ALL
  USING (auth.role() = 'service_role');

-- ── updated_at triggers ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS brand_systems_updated_at  ON brand_systems;
CREATE TRIGGER brand_systems_updated_at
  BEFORE UPDATE ON brand_systems
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS studio_designs_updated_at ON studio_designs;
CREATE TRIGGER studio_designs_updated_at
  BEFORE UPDATE ON studio_designs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
