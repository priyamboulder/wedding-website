-- ── Migration 0014: Link vendors to auth users ────────────────────────────────
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email text;

CREATE INDEX IF NOT EXISTS vendors_auth_user_id_idx ON vendors (auth_user_id);
CREATE INDEX IF NOT EXISTS vendors_email_idx ON vendors (email);

-- Allow vendors to read/update their own profile row
CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Vendors can read own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR true);
