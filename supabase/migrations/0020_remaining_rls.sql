-- ── Migration 0020: Remaining authenticated RLS (workspace_files + community) ─
-- 0019 failed on workspace_files (uses wedding_id not couple_id).
-- This migration covers what 0019 couldn't finish.

-- workspace_files uses uploaded_by (uuid) for user scoping
DROP POLICY IF EXISTS "Couple access workspace_files" ON workspace_files;
CREATE POLICY "Couple access workspace_files" ON workspace_files FOR ALL TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Community stores (couple_id scoped)
DROP POLICY IF EXISTS "Couple access comments_state" ON comments_state;
CREATE POLICY "Couple access comments_state" ON comments_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access conversation_state" ON conversation_state;
CREATE POLICY "Couple access conversation_state" ON conversation_state FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);

DROP POLICY IF EXISTS "Couple access confessional_posts" ON confessional_posts;
CREATE POLICY "Couple access confessional_posts" ON confessional_posts FOR ALL TO authenticated
  USING (couple_id = auth.uid()::text)
  WITH CHECK (couple_id = auth.uid()::text);
