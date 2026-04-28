-- ── Migration 0018: Stationery templates catalogue ───────────────────────────
CREATE TABLE IF NOT EXISTS stationery_templates (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  description   text,
  style_tags    text[] DEFAULT '{}',
  preview_image text,
  data          jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE stationery_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stationery templates" ON stationery_templates FOR SELECT USING (true);
CREATE POLICY "Service role manage stationery templates" ON stationery_templates FOR ALL TO service_role USING (true) WITH CHECK (true);
