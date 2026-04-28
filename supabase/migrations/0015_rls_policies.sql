-- ── Migration 0015: Proper RLS policies ───────────────────────────────────────
-- Replace blanket service_role_all policies with proper per-user policies
-- on the most security-sensitive tables.

-- ── vendors table ─────────────────────────────────────────────────────────────
-- All authenticated users can read vendors (public directory)
DROP POLICY IF EXISTS "Authenticated users can read vendors" ON vendors;
CREATE POLICY "Authenticated users can read vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can also read vendors (public marketplace)
DROP POLICY IF EXISTS "Public can read vendors" ON vendors;
CREATE POLICY "Public can read vendors"
  ON vendors FOR SELECT
  TO anon
  USING (true);

-- ── couple_shortlist ──────────────────────────────────────────────────────────
-- couple_shortlist.couple_id is uuid (from 0001_vendors.sql), so compare directly
DROP POLICY IF EXISTS "Couples manage own shortlist" ON couple_shortlist;
CREATE POLICY "Couples manage own shortlist"
  ON couple_shortlist FOR ALL
  TO authenticated
  USING (couple_id = auth.uid())
  WITH CHECK (couple_id = auth.uid());

-- ── checklist_items ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Couples manage own checklist" ON checklist_items;
CREATE POLICY "Couples manage own checklist"
  ON checklist_items FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── guest_roster ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Couples manage own guests" ON guest_roster;
CREATE POLICY "Couples manage own guests"
  ON guest_roster FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── notes ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Couples manage own notes" ON notes;
CREATE POLICY "Couples manage own notes"
  ON notes FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── journal_entries ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Couples manage own journal" ON journal_entries;
CREATE POLICY "Couples manage own journal"
  ON journal_entries FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── finance tables ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Couples manage own finance" ON finance_categories;
CREATE POLICY "Couples manage own finance"
  ON finance_categories FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couples manage own invoices" ON finance_invoices;
CREATE POLICY "Couples manage own invoices"
  ON finance_invoices FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couples manage own transactions" ON finance_transactions;
CREATE POLICY "Couples manage own transactions"
  ON finance_transactions FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- ── seating ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Couples manage own seating" ON seating_plans;
CREATE POLICY "Couples manage own seating"
  ON seating_plans FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couples manage own seating assignments" ON seating_assignments;
CREATE POLICY "Couples manage own seating assignments"
  ON seating_assignments FOR ALL
  TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

-- Keep service_role policies on ALL tables for background sync from stores
-- (Zustand stores use service role for fire-and-forget writes — this is intentional)
