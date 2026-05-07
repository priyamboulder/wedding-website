-- Performance indexes on hot columns + creator_services table

-- creator_services: replaces seed-based service lookups in bookings
CREATE TABLE IF NOT EXISTS creator_services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  price       numeric NOT NULL,
  currency    text NOT NULL DEFAULT 'USD',
  duration_minutes int,
  category    text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE creator_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators manage own services"
  ON creator_services FOR ALL
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "public read active services"
  ON creator_services FOR SELECT
  USING (is_active = true);

-- Restore FK on seating_assignments → weddings (now safe since weddings table exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'seating_assignments_wedding_id_fkey'
      AND table_name = 'seating_assignments'
  ) THEN
    ALTER TABLE seating_assignments
      ADD CONSTRAINT seating_assignments_wedding_id_fkey
      FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_checklist_items_couple ON checklist_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_couple_created ON checklist_items(couple_id, created_at DESC);
-- notifications indexes (table may be named couple_notifications)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_couple ON notifications(couple_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_couple_unread ON notifications(couple_id, read)';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_guest_rsvps_wedding ON guest_rsvps(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_rsvps_email ON guest_rsvps(email);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_couple_wedding ON seating_assignments(couple_id, wedding_id);
CREATE INDEX IF NOT EXISTS idx_weddings_couple ON weddings(couple_id);
CREATE INDEX IF NOT EXISTS idx_weddings_couple_status ON weddings(couple_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_products_shop_status ON seller_products(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_orders_shop_status ON seller_orders(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_planner_weddings_date ON planner_weddings(wedding_date ASC);
CREATE INDEX IF NOT EXISTS idx_creator_services_creator ON creator_services(creator_id);
CREATE INDEX IF NOT EXISTS idx_bookings_couple ON bookings(couple_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_creator ON bookings(creator_id);
