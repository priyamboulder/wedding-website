-- Seller portal: shops, products, orders, payouts

CREATE TABLE IF NOT EXISTS seller_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  bio text,
  city text,
  avatar_url text,
  public_shop_url text,
  marketplace_fee_pct numeric NOT NULL DEFAULT 12,
  payout_method text,
  payout_schedule text DEFAULT 'biweekly',
  payout_minimum numeric NOT NULL DEFAULT 25,
  w9_on_file boolean NOT NULL DEFAULT false,
  stripe_account_id text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS seller_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES seller_shops(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  category text,
  subcategory text,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  pricing_model text NOT NULL DEFAULT 'fixed',
  price numeric NOT NULL,
  compare_at_price numeric,
  unit text,
  min_order int,
  tiers jsonb,
  customizable boolean NOT NULL DEFAULT false,
  custom_fields jsonb,
  proof_required boolean NOT NULL DEFAULT false,
  proof_turnaround_days text,
  product_type text NOT NULL DEFAULT 'physical',
  ships_from text,
  processing_time_days text,
  shipping_mode text,
  flat_shipping_rate numeric,
  international_shipping boolean NOT NULL DEFAULT false,
  weight_oz numeric,
  dimensions jsonb,
  track_inventory boolean NOT NULL DEFAULT false,
  stock_quantity int,
  low_stock_threshold int,
  wedding_events text[] NOT NULL DEFAULT ARRAY[]::text[],
  traditions text[] NOT NULL DEFAULT ARRAY[]::text[],
  seo_title text,
  meta_description text,
  photo_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'draft',
  views_30d int NOT NULL DEFAULT 0,
  sold int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES seller_shops(id) ON DELETE CASCADE,
  product_id uuid REFERENCES seller_products(id) ON DELETE SET NULL,
  wedding_id uuid REFERENCES weddings(id) ON DELETE SET NULL,
  couple_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  couple_name text,
  order_number text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  paid_amount numeric NOT NULL,
  paid_at timestamptz,
  ship_by date,
  shipped_at timestamptz,
  tracking_number text,
  status text NOT NULL DEFAULT 'pending',
  urgency text,
  custom_fields jsonb,
  proof_sent_at timestamptz,
  proof_approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES seller_shops(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'bank_transfer',
  status text NOT NULL DEFAULT 'pending',
  reference text,
  paid_at timestamptz,
  period_start date,
  period_end date,
  gross_sales numeric,
  marketplace_fee numeric,
  processing_fee numeric,
  shipping_labels numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE seller_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sellers manage own shop"
  ON seller_shops FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "sellers manage own products"
  ON seller_products FOR ALL
  USING (shop_id IN (SELECT id FROM seller_shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM seller_shops WHERE owner_id = auth.uid()));

CREATE POLICY "public read active products"
  ON seller_products FOR SELECT
  USING (status IN ('active', 'low-stock'));

CREATE POLICY "sellers manage own orders"
  ON seller_orders FOR ALL
  USING (shop_id IN (SELECT id FROM seller_shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM seller_shops WHERE owner_id = auth.uid()));

CREATE POLICY "sellers manage own payouts"
  ON seller_payouts FOR ALL
  USING (shop_id IN (SELECT id FROM seller_shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM seller_shops WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_seller_products_shop ON seller_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_shop ON seller_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_shop ON seller_payouts(shop_id);
