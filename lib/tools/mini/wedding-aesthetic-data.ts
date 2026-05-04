// Quiz data for the Wedding Aesthetic Quiz (Tool 28).
// Five questions, six possible aesthetic outcomes. Each answer maps points to
// one or more aesthetics; highest score wins (ties broken by FIRST in the
// AESTHETICS list).

export type AestheticId =
  | 'modern-maharani'
  | 'garden-romantic'
  | 'minimalist-bride'
  | 'bollywood-maximalist'
  | 'boho-wanderer'
  | 'classic-elegance';

export type Aesthetic = {
  id: AestheticId;
  name: string;
  tagline: string;
  description: string;
  palette: { name: string; hex: string }[];
  keywords: string[];
  vendorStyle: string;
};

export const AESTHETICS: Aesthetic[] = [
  {
    id: 'bollywood-maximalist',
    name: 'The Bollywood Maximalist',
    tagline: 'more is more, and then a little more',
    description:
      "If it sparkles, you want it. Your wedding is a full-color, full-volume celebration — jewel tones, layered florals, and an entrance that makes everyone pull out their phones. You're not afraid of dramatic. You invented it.",
    palette: [
      { name: 'Maharani Red', hex: '#9B1B30' },
      { name: 'Marigold', hex: '#E8A547' },
      { name: 'Imperial Gold', hex: '#C9A96E' },
      { name: 'Royal Emerald', hex: '#1F5F4F' },
    ],
    keywords: ['lush', 'jewel-toned', 'dramatic', 'grand', 'unapologetic'],
    vendorStyle:
      'Look for decorators known for floral installations and dramatic mandap structures. You want the photographer who shoots editorial, not documentary.',
  },
  {
    id: 'modern-maharani',
    name: 'The Modern Maharani',
    tagline: 'tradition with a sharp edit',
    description:
      "You want the rituals, the lehenga, the everything — but rendered through a 2026 lens. Clean lines, monochrome moments, ivory and gold instead of red and gold. Your nani approves. Your design-school friends do too.",
    palette: [
      { name: 'Ivory', hex: '#F5EFE3' },
      { name: 'Burnished Gold', hex: '#B8924A' },
      { name: 'Champagne', hex: '#D8C9A8' },
      { name: 'Smoked Wine', hex: '#5A1F2B' },
    ],
    keywords: ['refined', 'monochrome', 'editorial', 'considered', 'gilded'],
    vendorStyle:
      'Find vendors with a strong visual portfolio — minimalist florists, photographers who shoot for magazines, planners who edit ruthlessly.',
  },
  {
    id: 'garden-romantic',
    name: 'The Garden Romantic',
    tagline: 'soft, lush, and a little dreamy',
    description:
      "Pastels, peonies, candlelight, and a venue that feels like it grew there. You want the wedding to feel intimate even at 300 guests — gauzy fabrics, blush tones, and florals that look picked, not arranged.",
    palette: [
      { name: 'Blush', hex: '#E8B4B8' },
      { name: 'Sage', hex: '#A8B5A0' },
      { name: 'Soft Cream', hex: '#F5EFE3' },
      { name: 'Dusty Rose', hex: '#C68B92' },
    ],
    keywords: ['soft', 'romantic', 'organic', 'candlelit', 'pastoral'],
    vendorStyle:
      'Garden venues, estate properties, lush florists who specialize in cascading and untamed arrangements. Soft natural-light photographers.',
  },
  {
    id: 'minimalist-bride',
    name: 'The Minimalist Bride',
    tagline: 'less, but the best of it',
    description:
      "Negative space is your love language. A single statement floral piece. One perfect lehenga. One song that means everything. You'd rather spend on five great vendors than fifty mediocre details.",
    palette: [
      { name: 'Bone', hex: '#EFE9DD' },
      { name: 'Putty', hex: '#C8BBA8' },
      { name: 'Ink', hex: '#2A1F2D' },
      { name: 'Brushed Brass', hex: '#A88554' },
    ],
    keywords: ['restrained', 'architectural', 'intentional', 'sculptural'],
    vendorStyle:
      'Modern venues, sculptural florists, photographers who understand negative space. Skip the chair covers — chairs that are already nice.',
  },
  {
    id: 'boho-wanderer',
    name: 'The Boho Wanderer',
    tagline: 'desert sunsets and dried pampas',
    description:
      "Rust, terracotta, dried palms, leather settees, and a string of bistro lights against a desert sky. You're getting married outdoors, you're serving family-style, and you're absolutely playing folk music during cocktail hour.",
    palette: [
      { name: 'Terracotta', hex: '#C66E47' },
      { name: 'Dried Sage', hex: '#9DA68C' },
      { name: 'Rust', hex: '#8B3A1F' },
      { name: 'Sand', hex: '#D8C8A8' },
    ],
    keywords: ['earthy', 'organic', 'sun-drenched', 'textured', 'unstructured'],
    vendorStyle:
      'Outdoor venues — vineyards, ranches, desert resorts. Florists who use dried elements and pampas. Photographers who chase golden hour.',
  },
  {
    id: 'classic-elegance',
    name: 'The Classic Elegance',
    tagline: 'old-money calm in a wine-red palette',
    description:
      'Black-tie energy. Ballroom venue. Long banquet tables draped in deep wine. The kind of wedding that looks the same beautiful in 2026 as it would have in 1996 or 2056. Quiet luxury, loud taste.',
    palette: [
      { name: 'Wine', hex: '#5A1F2B' },
      { name: 'Antique Gold', hex: '#9D7D3C' },
      { name: 'Cream', hex: '#F0E8D6' },
      { name: 'Forest', hex: '#2C4435' },
    ],
    keywords: ['timeless', 'formal', 'composed', 'refined'],
    vendorStyle:
      'Hotel ballrooms, country clubs, heritage estates. Classically-trained photographers, traditional florists, sit-down service over buffet.',
  },
];

export type Question = {
  id: string;
  prompt: string;
  options: { label: string; weights: Partial<Record<AestheticId, number>> }[];
};

export const QUESTIONS: Question[] = [
  {
    id: 'venue',
    prompt: 'Pick a venue vibe',
    options: [
      {
        label: 'Ornate palace ballroom',
        weights: { 'bollywood-maximalist': 3, 'classic-elegance': 2 },
      },
      {
        label: 'Lush garden estate',
        weights: { 'garden-romantic': 3, 'classic-elegance': 1 },
      },
      {
        label: 'Modern industrial loft',
        weights: { 'minimalist-bride': 3, 'modern-maharani': 2 },
      },
      {
        label: 'Intimate boutique hotel',
        weights: { 'modern-maharani': 2, 'minimalist-bride': 2 },
      },
      {
        label: 'Desert resort or ranch',
        weights: { 'boho-wanderer': 3, 'garden-romantic': 1 },
      },
    ],
  },
  {
    id: 'palette',
    prompt: 'Your dream color palette',
    options: [
      {
        label: 'Rich jewel tones — emerald, ruby, sapphire',
        weights: { 'bollywood-maximalist': 3, 'classic-elegance': 1 },
      },
      {
        label: 'Pastels and blush',
        weights: { 'garden-romantic': 3 },
      },
      {
        label: 'Ivory and gold monochrome',
        weights: { 'modern-maharani': 3, 'minimalist-bride': 2 },
      },
      {
        label: 'Bold and bright — fuchsia, orange, marigold',
        weights: { 'bollywood-maximalist': 3 },
      },
      {
        label: 'Earth tones — terracotta, sage, rust',
        weights: { 'boho-wanderer': 3 },
      },
    ],
  },
  {
    id: 'flowers',
    prompt: 'Your flower situation',
    options: [
      {
        label: 'Cascading over-the-top floral installations',
        weights: { 'bollywood-maximalist': 3, 'garden-romantic': 1 },
      },
      {
        label: 'Elegant and structured arrangements',
        weights: { 'classic-elegance': 3, 'modern-maharani': 1 },
      },
      {
        label: 'Minimal greenery with a few statement pieces',
        weights: { 'minimalist-bride': 3, 'modern-maharani': 1 },
      },
      {
        label: 'Dried flowers and boho textures',
        weights: { 'boho-wanderer': 3 },
      },
      {
        label: 'No flowers — all candles and lights',
        weights: { 'minimalist-bride': 2, 'classic-elegance': 1 },
      },
    ],
  },
  {
    id: 'entry',
    prompt: 'Your bridal entry would be',
    options: [
      {
        label: 'Grand double-door reveal with fog machines',
        weights: { 'bollywood-maximalist': 3 },
      },
      {
        label: 'Simple walk down the aisle with dad',
        weights: { 'classic-elegance': 3, 'garden-romantic': 1 },
      },
      {
        label: 'Surprise entrance from somewhere unexpected',
        weights: { 'modern-maharani': 2, 'boho-wanderer': 2 },
      },
      {
        label: 'Dancing in with your squad',
        weights: { 'bollywood-maximalist': 2, 'garden-romantic': 1 },
      },
      {
        label: 'Quiet moment — just you and your partner',
        weights: { 'minimalist-bride': 3 },
      },
    ],
  },
  {
    id: 'hashtag',
    prompt: 'Your wedding hashtag would be',
    options: [
      {
        label: '#RoyalAffair',
        weights: { 'bollywood-maximalist': 2, 'classic-elegance': 2 },
      },
      {
        label: '#SaidYesIn[Year]',
        weights: { 'garden-romantic': 2, 'classic-elegance': 1 },
      },
      {
        label: '#KeepItChic',
        weights: { 'modern-maharani': 3 },
      },
      {
        label: '#GoesWild',
        weights: { 'bollywood-maximalist': 2, 'boho-wanderer': 2 },
      },
      {
        label: '#UnpluggedWedding',
        weights: { 'minimalist-bride': 3, 'boho-wanderer': 1 },
      },
    ],
  },
];

export function scoreAnswers(answers: Record<string, number>): Aesthetic {
  const totals: Record<string, number> = {};
  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    for (const [aid, weight] of Object.entries(opt.weights)) {
      totals[aid] = (totals[aid] ?? 0) + (weight ?? 0);
    }
  }
  let winner: AestheticId = AESTHETICS[0]!.id;
  let topScore = -1;
  for (const a of AESTHETICS) {
    const s = totals[a.id] ?? 0;
    if (s > topScore) {
      topScore = s;
      winner = a.id;
    }
  }
  return AESTHETICS.find((a) => a.id === winner) ?? AESTHETICS[0]!;
}
