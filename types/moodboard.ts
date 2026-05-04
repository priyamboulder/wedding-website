// Moodboards — row shapes for the homepage gallery and /moodboards/[slug].
// Mirrors migration 0030 (moodboards, moodboard_items).

export type MoodboardItemType = 'image' | 'real_wedding' | 'vendor' | 'product';

export interface MoodboardRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  color_palette: string[];
  cover_images: string[];
  style_tags: string[];
  sort_order: number;
  created_at: string;
}

export interface MoodboardItemRow {
  id: string;
  moodboard_id: string;
  item_type: MoodboardItemType;
  item_id: string | null;
  image_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}
