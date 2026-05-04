-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0031: Moodboards — homepage aesthetic discovery.
--
-- Powers the "Moodboards for Every Kind of Shaadi" gallery on the marigold
-- homepage and the /moodboards/[slug] detail pages. Each moodboard captures
-- a wedding aesthetic (e.g. "Mughal Grandeur") with a color palette, style
-- tags, and a small set of cover images for the 2x2 collage card.
--
-- Data model:
--   - `moodboards` is the catalog row. `cover_images` is a JSON array of
--     four image URLs used by the homepage card grid; `color_palette` is
--     the matching set of hex codes used as gradient fallbacks until real
--     images are wired up.
--   - `moodboard_items` is the inspiration feed surfaced on the detail
--     page. Items can either point at an internal entity (real_wedding,
--     vendor, product) via item_id or stand alone as a standalone image.
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS moodboards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  description   text NOT NULL,
  color_palette jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_images  jsonb NOT NULL DEFAULT '[]'::jsonb,
  style_tags    jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moodboards_sort_idx
  ON moodboards (sort_order, created_at);

CREATE TABLE IF NOT EXISTS moodboard_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id  uuid NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  item_type     text NOT NULL,
  item_id       uuid,
  image_url     text,
  caption       text,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT moodboard_items_type_check CHECK (item_type IN (
    'image', 'real_wedding', 'vendor', 'product'
  ))
);

CREATE INDEX IF NOT EXISTS moodboard_items_board_idx
  ON moodboard_items (moodboard_id, sort_order);

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads moodboards" ON moodboards;
CREATE POLICY "Public reads moodboards"
  ON moodboards FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public reads moodboard items" ON moodboard_items;
CREATE POLICY "Public reads moodboard items"
  ON moodboard_items FOR SELECT TO anon, authenticated
  USING (true);

-- ── Seed: 10 starter moodboards ───────────────────────────────────────────

INSERT INTO moodboards (slug, name, description, color_palette, cover_images, style_tags, sort_order) VALUES
  (
    'mughal-grandeur',
    'Mughal Grandeur',
    'Opulent jewel tones, gilded archways, and palatial detail — for the couple whose mandap deserves a Mughal court.',
    '["#8B0000", "#C4A265", "#1B5E20", "#FFFDF5"]'::jsonb,
    '[]'::jsonb,
    '["opulent", "gold", "traditional", "maximalist"]'::jsonb,
    1
  ),
  (
    'modern-minimalist',
    'Modern Minimalist',
    'Clean lines, generous white space, and architectural restraint with a single thread of gold.',
    '["#FFFFFF", "#E0E0E0", "#2C2C2C", "#C4A265"]'::jsonb,
    '[]'::jsonb,
    '["minimal", "modern", "monochrome", "architectural"]'::jsonb,
    2
  ),
  (
    'garden-party',
    'Garden Party',
    'Soft florals, garden tents, and sun-warmed pastels — whimsy without losing the romance.',
    '["#FFB7C5", "#90EE90", "#FFFDF5", "#DDA0DD"]'::jsonb,
    '[]'::jsonb,
    '["pastel", "floral", "outdoor", "whimsical"]'::jsonb,
    3
  ),
  (
    'temple-elegance',
    'Temple Elegance',
    'Silk drapes, brass lamps, and the quiet grandeur of a temple ceremony at golden hour.',
    '["#FF6347", "#FFD700", "#8B4513", "#FFFFF0"]'::jsonb,
    '[]'::jsonb,
    '["traditional", "spiritual", "silk", "brass"]'::jsonb,
    4
  ),
  (
    'coastal-sunset',
    'Coastal Sunset',
    'Warm corals, salt air, and a barefoot pheras under a sky that did most of the styling.',
    '["#FF7F50", "#FFD700", "#87CEEB", "#FFEFD5"]'::jsonb,
    '[]'::jsonb,
    '["beach", "sunset", "breezy", "romantic"]'::jsonb,
    5
  ),
  (
    'jewel-tone-maximalist',
    'Jewel Tone Maximalist',
    'Emerald, sapphire, ruby — and gold absolutely everywhere. More is more, and then more again.',
    '["#0F5132", "#1A237E", "#B71C1C", "#FFD700"]'::jsonb,
    '[]'::jsonb,
    '["maximalist", "jewel-tones", "rich", "gold"]'::jsonb,
    6
  ),
  (
    'pastel-dream',
    'Pastel Dream',
    'Lavender, blush, and sage with whispers of gold — a wedding that feels lit from within.',
    '["#E6E6FA", "#FFB6C1", "#98FB98", "#C4A265"]'::jsonb,
    '[]'::jsonb,
    '["pastel", "soft", "romantic", "airy"]'::jsonb,
    7
  ),
  (
    'old-world-romance',
    'Old World Romance',
    'Candlelit tables, deep burgundy velvet, and antique lace — the timeless side of a haveli evening.',
    '["#722F37", "#C4A265", "#FFFDD0", "#8B4513"]'::jsonb,
    '[]'::jsonb,
    '["vintage", "candlelit", "burgundy", "lace"]'::jsonb,
    8
  ),
  (
    'bollywood-glam',
    'Bollywood Glam',
    'High-voltage color, sequins, and a sangeet that doubles as the after-party. Loud, unapologetic, alive.',
    '["#FF1493", "#FFD700", "#00CED1", "#FF4500"]'::jsonb,
    '[]'::jsonb,
    '["glam", "vibrant", "sparkle", "high-energy"]'::jsonb,
    9
  ),
  (
    'rustic-charm',
    'Rustic Charm',
    'Wooden beams, wildflowers in mason jars, and lanterns swaying over a backyard sangeet.',
    '["#8B7355", "#556B2F", "#FFFDF5", "#DEB887"]'::jsonb,
    '[]'::jsonb,
    '["rustic", "earthy", "outdoor", "lantern-lit"]'::jsonb,
    10
  )
ON CONFLICT (slug) DO NOTHING;
