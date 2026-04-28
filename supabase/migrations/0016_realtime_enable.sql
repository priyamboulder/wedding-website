-- ── Migration 0016: Enable Realtime on community tables ───────────────────────
-- Required for Supabase Realtime subscriptions to receive row-level change events.

ALTER TABLE confessional_posts REPLICA IDENTITY FULL;
ALTER TABLE grapevine_state REPLICA IDENTITY FULL;
ALTER TABLE community_discussions_state REPLICA IDENTITY FULL;
ALTER TABLE community_huddles_state REPLICA IDENTITY FULL;
ALTER TABLE couple_notifications REPLICA IDENTITY FULL;
ALTER TABLE seating_plans REPLICA IDENTITY FULL;
ALTER TABLE checklist_items REPLICA IDENTITY FULL;

-- Add tables to the Supabase realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE confessional_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE grapevine_state;
ALTER PUBLICATION supabase_realtime ADD TABLE community_discussions_state;
ALTER PUBLICATION supabase_realtime ADD TABLE community_huddles_state;
ALTER PUBLICATION supabase_realtime ADD TABLE couple_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;
