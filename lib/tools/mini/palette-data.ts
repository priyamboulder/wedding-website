// Curated palette library for the Color Palette Generator.
// Tagged by season + vibe + tradition. Each palette is hand-picked.

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type Vibe = 'romantic' | 'bold' | 'earthy' | 'modern' | 'traditional' | 'regal';
export type Tradition = 'north' | 'south' | 'gujarati' | 'sikh' | 'fusion' | 'minimal';

export type PaletteColor = {
  name: string;
  hex: string;
  use: string;
};

export type Palette = {
  id: string;
  name: string;
  seasons: Season[];
  vibes: Vibe[];
  traditions: Tradition[];
  mustInclude?: string[]; // hex prefixes that satisfy "must include" filter
  colors: PaletteColor[];
};

export const PALETTES: Palette[] = [
  {
    id: 'maharani-jewel',
    name: 'Maharani Jewel',
    seasons: ['fall', 'winter'],
    vibes: ['regal', 'traditional', 'bold'],
    traditions: ['north', 'sikh'],
    mustInclude: ['#9B', '#C9'],
    colors: [
      { name: 'Maharani Red', hex: '#9B1B30', use: 'Primary — lehenga, mandap draping' },
      { name: 'Imperial Gold', hex: '#C9A96E', use: 'Accent — embroidery, table runners' },
      { name: 'Royal Emerald', hex: '#1F5F4F', use: 'Statement — bridesmaid sarees' },
      { name: 'Cream', hex: '#F5EFE3', use: 'Neutral — linens, stationery base' },
    ],
  },
  {
    id: 'garden-blush',
    name: 'Garden Blush',
    seasons: ['spring', 'summer'],
    vibes: ['romantic'],
    traditions: ['fusion', 'minimal'],
    mustInclude: ['#E8B'],
    colors: [
      { name: 'Blush', hex: '#E8B4B8', use: 'Primary — florals, table linens' },
      { name: 'Sage', hex: '#A8B5A0', use: 'Accent — greenery, ribbon' },
      { name: 'Soft Cream', hex: '#F5EFE3', use: 'Neutral — invitations, candles' },
      { name: 'Rose Gold', hex: '#B79082', use: 'Metallic — flatware, signage' },
    ],
  },
  {
    id: 'modern-monochrome',
    name: 'Modern Monochrome',
    seasons: ['fall', 'winter', 'spring'],
    vibes: ['modern'],
    traditions: ['minimal', 'fusion'],
    mustInclude: ['#F5'],
    colors: [
      { name: 'Ivory', hex: '#F5EFE3', use: 'Primary — linens, walls' },
      { name: 'Burnished Gold', hex: '#B8924A', use: 'Accent — metallics, stationery' },
      { name: 'Champagne', hex: '#D8C9A8', use: 'Mid-tone — florals' },
      { name: 'Smoked Wine', hex: '#5A1F2B', use: 'Anchor — bridesmaid lehengas' },
    ],
  },
  {
    id: 'bollywood-fuchsia',
    name: 'Bollywood Fuchsia',
    seasons: ['summer', 'fall'],
    vibes: ['bold', 'traditional'],
    traditions: ['north', 'gujarati'],
    mustInclude: ['#D14'],
    colors: [
      { name: 'Hot Fuchsia', hex: '#D1438C', use: 'Primary — lehenga, decor' },
      { name: 'Marigold', hex: '#E8A547', use: 'Accent — florals, draping' },
      { name: 'Royal Saffron', hex: '#FF8C32', use: 'Pop — sangeet color' },
      { name: 'Ivory', hex: '#F5EFE3', use: 'Neutral — break for the eyes' },
    ],
  },
  {
    id: 'desert-rust',
    name: 'Desert Rust',
    seasons: ['fall', 'spring'],
    vibes: ['earthy'],
    traditions: ['fusion', 'minimal'],
    mustInclude: ['#C66'],
    colors: [
      { name: 'Terracotta', hex: '#C66E47', use: 'Primary — florals, signage' },
      { name: 'Dried Sage', hex: '#9DA68C', use: 'Accent — greenery' },
      { name: 'Rust', hex: '#8B3A1F', use: 'Anchor — outfits, mandap' },
      { name: 'Sand', hex: '#D8C8A8', use: 'Neutral — linens, paper' },
    ],
  },
  {
    id: 'south-temple-gold',
    name: 'South Temple Gold',
    seasons: ['fall', 'winter', 'spring', 'summer'],
    vibes: ['traditional', 'regal'],
    traditions: ['south'],
    mustInclude: ['#C9A', '#FF'],
    colors: [
      { name: 'Temple Gold', hex: '#C9A055', use: 'Primary — saree zari, mandap' },
      { name: 'Pure White', hex: '#FFFFFF', use: 'Foundation — saree, linens' },
      { name: 'Maroon', hex: '#7A1F3E', use: 'Accent — bridal blouse, kumkum' },
      { name: 'Banana Leaf Green', hex: '#3E5C3A', use: 'Pop — florals, decor' },
    ],
  },
  {
    id: 'dusty-mauve',
    name: 'Dusty Mauve',
    seasons: ['fall', 'winter'],
    vibes: ['romantic', 'modern'],
    traditions: ['fusion', 'minimal'],
    mustInclude: ['#7A'],
    colors: [
      { name: 'Dusty Mauve', hex: '#7A5965', use: 'Primary — bridesmaids, decor' },
      { name: 'Plum', hex: '#5A2840', use: 'Anchor — accents' },
      { name: 'Champagne', hex: '#D8C9A8', use: 'Neutral — linens' },
      { name: 'Antique Brass', hex: '#A88554', use: 'Metallic — flatware' },
    ],
  },
  {
    id: 'classic-wine',
    name: 'Classic Wine',
    seasons: ['fall', 'winter'],
    vibes: ['regal', 'traditional'],
    traditions: ['fusion', 'sikh'],
    mustInclude: ['#5A1', '#9D7'],
    colors: [
      { name: 'Wine', hex: '#5A1F2B', use: 'Primary — bridesmaid lehengas, draping' },
      { name: 'Antique Gold', hex: '#9D7D3C', use: 'Accent — embroidery, signage' },
      { name: 'Forest Green', hex: '#2C4435', use: 'Anchor — florals' },
      { name: 'Cream', hex: '#F0E8D6', use: 'Neutral — linens' },
    ],
  },
  {
    id: 'spring-pastel',
    name: 'Spring Pastel',
    seasons: ['spring'],
    vibes: ['romantic'],
    traditions: ['minimal', 'fusion'],
    mustInclude: ['#F5C'],
    colors: [
      { name: 'Powder Pink', hex: '#F5C8C8', use: 'Primary — florals, accents' },
      { name: 'Lavender', hex: '#C8B8D8', use: 'Accent — bridesmaids' },
      { name: 'Mint', hex: '#B5C8B0', use: 'Pop — greenery, ribbon' },
      { name: 'Pearl', hex: '#EFE9DD', use: 'Neutral — linens' },
    ],
  },
  {
    id: 'gujarati-celebration',
    name: 'Gujarati Celebration',
    seasons: ['fall', 'winter'],
    vibes: ['bold', 'traditional'],
    traditions: ['gujarati'],
    mustInclude: ['#FF8'],
    colors: [
      { name: 'Marigold Orange', hex: '#FF8C32', use: 'Primary — florals, mandap' },
      { name: 'Hot Pink', hex: '#D1438C', use: 'Pop — sangeet, garba night' },
      { name: 'Apple Green', hex: '#7BAB3C', use: 'Accent — drapery' },
      { name: 'Yellow', hex: '#F5C547', use: 'Pop — secondary draping' },
    ],
  },
  {
    id: 'sage-cream',
    name: 'Sage & Cream',
    seasons: ['spring', 'summer', 'fall'],
    vibes: ['earthy', 'modern'],
    traditions: ['minimal', 'fusion'],
    colors: [
      { name: 'Sage', hex: '#A8B5A0', use: 'Primary — bridesmaids, ribbon' },
      { name: 'Cream', hex: '#F5EFE3', use: 'Neutral — linens, walls' },
      { name: 'Olive', hex: '#7A8048', use: 'Accent — florals, foliage' },
      { name: 'Brushed Brass', hex: '#A88554', use: 'Metallic — flatware' },
    ],
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    seasons: ['fall', 'winter'],
    vibes: ['regal', 'modern'],
    traditions: ['fusion', 'minimal'],
    mustInclude: ['#1A', '#C9A'],
    colors: [
      { name: 'Midnight Navy', hex: '#1A2447', use: 'Primary — outfits, signage' },
      { name: 'Burnished Gold', hex: '#C9A96E', use: 'Accent — metallics' },
      { name: 'Plum', hex: '#5A2840', use: 'Anchor — florals' },
      { name: 'Champagne', hex: '#D8C9A8', use: 'Neutral — linens' },
    ],
  },
];

export type Filter = {
  season: Season;
  vibe: Vibe;
  tradition: Tradition;
  mustInclude?: string;
};

export function rankPalettes(filter: Filter): Palette[] {
  const ranked = PALETTES.map((p) => {
    let score = 0;
    if (p.seasons.includes(filter.season)) score += 3;
    if (p.vibes.includes(filter.vibe)) score += 3;
    if (p.traditions.includes(filter.tradition)) score += 2;
    if (filter.mustInclude && p.mustInclude) {
      const target = filter.mustInclude.toUpperCase();
      if (p.mustInclude.some((m) => m.toUpperCase().startsWith(target.slice(0, 3))))
        score += 4;
      else if (
        p.colors.some((c) =>
          c.hex.toUpperCase().startsWith(target.slice(0, 3)),
        )
      )
        score += 2;
    }
    return { palette: p, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.palette);

  return ranked.length > 0 ? ranked.slice(0, 3) : PALETTES.slice(0, 3);
}
