// Static moodboard data — mirrors migration 0030 seed rows. Used as a
// fallback when Supabase is unreachable or the table hasn't been migrated
// yet, so the homepage gallery always renders.

import type { MoodboardRow } from '@/types/moodboard';

export const FALLBACK_MOODBOARDS: MoodboardRow[] = [
  {
    id: 'fallback-mughal-grandeur',
    slug: 'mughal-grandeur',
    name: 'Mughal Grandeur',
    description:
      'Opulent jewel tones, gilded archways, and palatial detail — for the couple whose mandap deserves a Mughal court.',
    color_palette: ['#8B0000', '#C4A265', '#1B5E20', '#FFFDF5'],
    cover_images: [],
    style_tags: ['opulent', 'gold', 'traditional', 'maximalist'],
    sort_order: 1,
    created_at: '',
  },
  {
    id: 'fallback-modern-minimalist',
    slug: 'modern-minimalist',
    name: 'Modern Minimalist',
    description:
      'Clean lines, generous white space, and architectural restraint with a single thread of gold.',
    color_palette: ['#FFFFFF', '#E0E0E0', '#2C2C2C', '#C4A265'],
    cover_images: [],
    style_tags: ['minimal', 'modern', 'monochrome', 'architectural'],
    sort_order: 2,
    created_at: '',
  },
  {
    id: 'fallback-garden-party',
    slug: 'garden-party',
    name: 'Garden Party',
    description:
      'Soft florals, garden tents, and sun-warmed pastels — whimsy without losing the romance.',
    color_palette: ['#FFB7C5', '#90EE90', '#FFFDF5', '#DDA0DD'],
    cover_images: [],
    style_tags: ['pastel', 'floral', 'outdoor', 'whimsical'],
    sort_order: 3,
    created_at: '',
  },
  {
    id: 'fallback-temple-elegance',
    slug: 'temple-elegance',
    name: 'Temple Elegance',
    description:
      'Silk drapes, brass lamps, and the quiet grandeur of a temple ceremony at golden hour.',
    color_palette: ['#FF6347', '#FFD700', '#8B4513', '#FFFFF0'],
    cover_images: [],
    style_tags: ['traditional', 'spiritual', 'silk', 'brass'],
    sort_order: 4,
    created_at: '',
  },
  {
    id: 'fallback-coastal-sunset',
    slug: 'coastal-sunset',
    name: 'Coastal Sunset',
    description:
      'Warm corals, salt air, and a barefoot pheras under a sky that did most of the styling.',
    color_palette: ['#FF7F50', '#FFD700', '#87CEEB', '#FFEFD5'],
    cover_images: [],
    style_tags: ['beach', 'sunset', 'breezy', 'romantic'],
    sort_order: 5,
    created_at: '',
  },
  {
    id: 'fallback-jewel-tone-maximalist',
    slug: 'jewel-tone-maximalist',
    name: 'Jewel Tone Maximalist',
    description:
      'Emerald, sapphire, ruby — and gold absolutely everywhere. More is more, and then more again.',
    color_palette: ['#0F5132', '#1A237E', '#B71C1C', '#FFD700'],
    cover_images: [],
    style_tags: ['maximalist', 'jewel-tones', 'rich', 'gold'],
    sort_order: 6,
    created_at: '',
  },
  {
    id: 'fallback-pastel-dream',
    slug: 'pastel-dream',
    name: 'Pastel Dream',
    description:
      'Lavender, blush, and sage with whispers of gold — a wedding that feels lit from within.',
    color_palette: ['#E6E6FA', '#FFB6C1', '#98FB98', '#C4A265'],
    cover_images: [],
    style_tags: ['pastel', 'soft', 'romantic', 'airy'],
    sort_order: 7,
    created_at: '',
  },
  {
    id: 'fallback-old-world-romance',
    slug: 'old-world-romance',
    name: 'Old World Romance',
    description:
      'Candlelit tables, deep burgundy velvet, and antique lace — the timeless side of a haveli evening.',
    color_palette: ['#722F37', '#C4A265', '#FFFDD0', '#8B4513'],
    cover_images: [],
    style_tags: ['vintage', 'candlelit', 'burgundy', 'lace'],
    sort_order: 8,
    created_at: '',
  },
  {
    id: 'fallback-bollywood-glam',
    slug: 'bollywood-glam',
    name: 'Bollywood Glam',
    description:
      'High-voltage color, sequins, and a sangeet that doubles as the after-party. Loud, unapologetic, alive.',
    color_palette: ['#FF1493', '#FFD700', '#00CED1', '#FF4500'],
    cover_images: [],
    style_tags: ['glam', 'vibrant', 'sparkle', 'high-energy'],
    sort_order: 9,
    created_at: '',
  },
  {
    id: 'fallback-rustic-charm',
    slug: 'rustic-charm',
    name: 'Rustic Charm',
    description:
      'Wooden beams, wildflowers in mason jars, and lanterns swaying over a backyard sangeet.',
    color_palette: ['#8B7355', '#556B2F', '#FFFDF5', '#DEB887'],
    cover_images: [],
    style_tags: ['rustic', 'earthy', 'outdoor', 'lantern-lit'],
    sort_order: 10,
    created_at: '',
  },
];

export function findFallbackMoodboard(slug: string): MoodboardRow | null {
  return FALLBACK_MOODBOARDS.find((m) => m.slug === slug) ?? null;
}
