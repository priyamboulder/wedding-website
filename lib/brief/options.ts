import type {
  Budget,
  Destination,
  Events,
  Guests,
  Priority,
  Timeline,
  Vibe,
} from './types';

export const EVENT_OPTIONS: {
  value: Events;
  label: string;
  description: string;
  count: string;
}[] = [
  {
    value: '1',
    label: 'Just the wedding',
    description: 'One big day. Clean and focused.',
    count: '1 event',
  },
  {
    value: '3',
    label: 'The classics',
    description: 'Mehendi, sangeet, wedding.',
    count: '3 events',
  },
  {
    value: '5',
    label: 'The full affair',
    description: 'Haldi, mehendi, sangeet, wedding, reception.',
    count: '5 events',
  },
  {
    value: '7+',
    label: 'All of it',
    description: 'Plus a welcome dinner, farewell brunch, the works.',
    count: '7+ events',
  },
];

export const GUEST_OPTIONS: {
  value: Guests;
  label: string;
  range: string;
  description: string;
}[] = [
  {
    value: 'intimate',
    label: 'Intimate',
    range: 'Under 150 guests',
    description: 'Close family, closest friends.',
  },
  {
    value: 'classic',
    label: 'Classic',
    range: '150–300 guests',
    description: 'The standard South Asian wedding.',
  },
  {
    value: 'grand',
    label: 'Grand',
    range: '300–500 guests',
    description: 'A real event. Real logistics.',
  },
  {
    value: 'epic',
    label: 'Epic',
    range: '500+ guests',
    description: 'A whole wedding-shaped town.',
  },
];

export const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: 'under-50k', label: 'Under $50K' },
  { value: '50-100k', label: '$50K – $100K' },
  { value: '100-250k', label: '$100K – $250K' },
  { value: '250-500k', label: '$250K – $500K' },
  { value: '500k-plus', label: '$500K+' },
  { value: 'unsure', label: 'Honestly, no idea yet' },
];

export const VIBE_OPTIONS: {
  value: Vibe;
  label: string;
  tagline: string;
  palette: string[];
  keywords: string[];
  description: string;
}[] = [
  {
    value: 'mughal',
    label: 'Mughal Grandeur',
    tagline: 'palace energy',
    palette: ['#7A1F2A', '#C29545', '#1F3B2D', '#F0E2C0', '#3D1518'],
    keywords: ['opulent', 'palace', 'jewel tones', 'intricate detail', 'candlelight'],
    description:
      'Cascading marigold garlands, hand-painted mandaps, jewel-toned lehengas, a reception that feels like a royal court. Your photographer will thank you.',
  },
  {
    value: 'modern',
    label: 'Modern Minimalist',
    tagline: 'less, but louder',
    palette: ['#F4EFE6', '#D8C9B5', '#3A3A3A', '#A89175', '#1A1A1A'],
    keywords: ['architectural', 'clean', 'refined', 'editorial', 'monochrome'],
    description:
      'Architectural mandaps, neutral palettes, single-stem florals, a tablescape that could be in a magazine. Discipline as decadence.',
  },
  {
    value: 'garden',
    label: 'Garden Romance',
    tagline: 'florals on florals',
    palette: ['#F4D9DD', '#D9A6AC', '#A4B49A', '#F2E3C9', '#7A4F4A'],
    keywords: ['lush', 'romantic', 'natural light', 'soft pinks', 'greenery'],
    description:
      'Florals everywhere, golden hour ceremonies, hand-tied bouquets, a sense of being inside a hand-painted card. Soft, but anchored.',
  },
  {
    value: 'bollywood',
    label: 'Bollywood Glam',
    tagline: 'main character energy',
    palette: ['#9A1B4F', '#D4A853', '#3F1A52', '#E83E8C', '#F5E6C8'],
    keywords: ['drama', 'sparkle', 'jewel tones', 'baraat-core', 'nightclub'],
    description:
      'Sequins, sparklers, choreographed entrances, a sangeet stage that out-energizes the wedding itself. Loud on purpose.',
  },
  {
    value: 'coastal',
    label: 'Coastal Breeze',
    tagline: 'toes in the sand',
    palette: ['#FFFCF5', '#A6CFE2', '#7BAE8C', '#D9C4A1', '#2A4D5C'],
    keywords: ['airy', 'tropical', 'sun-bleached', 'breezy', 'palm shadow'],
    description:
      'Sun, salt, and shehnai. Whites and blues, breezy linens, fresh fruit, a baraat on a beach. The wedding people don\'t want to leave.',
  },
  {
    value: 'heritage',
    label: 'Heritage Elegance',
    tagline: 'old money temple wedding',
    palette: ['#F5EFDF', '#C4A574', '#7A5A2A', '#4A3520', '#2D1F12'],
    keywords: ['ivory', 'bronze', 'intricate', 'classical', 'temple'],
    description:
      'Ivory and bronze, classical motifs, family heirloom jewelry, hand-block-printed invitations. A wedding that feels like it has always existed.',
  },
];

export const DESTINATION_OPTIONS: {
  value: Destination;
  label: string;
  description: string;
}[] = [
  {
    value: 'local',
    label: 'Hometown / local',
    description: 'Keeping it close. DFW, your city, your people.',
  },
  {
    value: 'us',
    label: 'Destination — US',
    description: 'Napa, Miami, Hudson Valley, somewhere special.',
  },
  {
    value: 'india',
    label: 'Destination — India',
    description: 'Udaipur, Jaipur, Goa, Kerala — going back to the roots.',
  },
  {
    value: 'international',
    label: 'Destination — International',
    description: 'Lake Como, Cancún, Bali, Thailand — the full escape.',
  },
  {
    value: 'undecided',
    label: 'Still deciding',
    description: 'Show me what\'s possible.',
  },
];

export const PRIORITY_OPTIONS: {
  value: Priority;
  label: string;
  icon: string;
}[] = [
  { value: 'food', label: 'Food & catering', icon: '🍽️' },
  { value: 'photography', label: 'Photography & video', icon: '📸' },
  { value: 'decor', label: 'Décor & florals', icon: '🌸' },
  { value: 'music', label: 'Music & entertainment', icon: '🎵' },
  { value: 'attire', label: 'Outfits & jewelry', icon: '👗' },
  { value: 'venue', label: 'Venue & experience', icon: '🏨' },
  { value: 'invitations', label: 'Invitations & stationery', icon: '✉️' },
  { value: 'beauty', label: 'Hair, makeup & styling', icon: '💄' },
];

export const TIMELINE_OPTIONS: {
  value: Timeline;
  label: string;
  description: string;
}[] = [
  {
    value: 'under-6m',
    label: 'Within 6 months',
    description: 'We\'re sprinting. Let\'s go.',
  },
  {
    value: '6-12m',
    label: '6–12 months',
    description: 'Solid runway. Perfect.',
  },
  {
    value: '12-18m',
    label: '12–18 months',
    description: 'Ahead of the game.',
  },
  {
    value: '18m-plus',
    label: '18+ months',
    description: 'Planning era activated.',
  },
  {
    value: 'no-date',
    label: 'No date yet',
    description: 'Just vibing and exploring.',
  },
];
