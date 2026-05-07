-- Core weddings table — the root planning entity for every couple.
-- All planning stores (checklist, finance, guests, RSVP) scope to wedding_id.
-- Also creates admin_users for proper role-based admin access.

-- ── weddings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weddings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug                 text,
  partner_one          text NOT NULL DEFAULT '',
  partner_two          text NOT NULL DEFAULT '',
  wedding_date         date,
  venue                text,
  city                 text,
  guest_count          int NOT NULL DEFAULT 0,
  hashtag              text,
  website_template_id  text,
  website_published    boolean NOT NULL DEFAULT false,
  website_domain       text,
  status               text NOT NULL DEFAULT 'planning', -- planning | finalized | completed
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS weddings_couple_idx ON weddings (couple_id);
CREATE UNIQUE INDEX IF NOT EXISTS weddings_slug_idx ON weddings (slug) WHERE slug IS NOT NULL;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples manage own weddings" ON weddings;
CREATE POLICY "Couples manage own weddings"
  ON weddings FOR ALL
  USING (couple_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access weddings" ON weddings;
CREATE POLICY "Service role full access weddings"
  ON weddings FOR ALL
  USING (auth.role() = 'service_role');

-- ── admin_users ───────────────────────────────────────────────────────────────
-- Explicit admin grants — replaces localStorage flag bypass
CREATE TABLE IF NOT EXISTS admin_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by  uuid REFERENCES auth.users(id),
  granted_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
CREATE POLICY "Service role full access admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can read own record to confirm status
DROP POLICY IF EXISTS "Admins read own record" ON admin_users;
CREATE POLICY "Admins read own record"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS weddings_updated_at ON weddings;
CREATE TRIGGER weddings_updated_at
  BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
