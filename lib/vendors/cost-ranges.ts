// ── Vendor cost ranges ─────────────────────────────────────────────────────
// Mirrors the seed in supabase/migrations/0028_vendor_cost_ranges.sql so the
// /vendors-directory cost-transparency bar can render instantly without a
// roundtrip. When/if we add multi-city support or admin-editable ranges,
// swap this for a Supabase fetch — the component reads through
// `getCostRangeForCategory` either way.

export type CostRangeCategory =
  | 'photography'
  | 'decor_florals'
  | 'hmua'
  | 'catering'
  | 'entertainment'
  | 'planning'
  | 'invitation_design'
  | 'mehendi'
  | 'music_dj'
  | 'videography';

export type CostRangeTier = 'budget' | 'mid' | 'premium' | 'luxury';

export type CostRangeUnit =
  | 'per_event'
  | 'per_hour'
  | 'per_plate'
  | 'per_person'
  | 'per_day';

export interface CostRange {
  tier: CostRangeTier;
  minPrice: number;
  maxPrice: number | null; // null = open-ended ("$X+")
  unit: CostRangeUnit;
  notes?: string;
}

export interface CategoryCostBreakdown {
  category: CostRangeCategory;
  city: string;
  cityLabel: string;
  categoryLabel: string;
  ranges: CostRange[]; // ordered: budget → luxury
}

const TIER_LABELS: Record<CostRangeTier, string> = {
  budget: 'Budget',
  mid: 'Mid-range',
  premium: 'Premium',
  luxury: 'Luxury',
};

const UNIT_LABELS: Record<CostRangeUnit, string> = {
  per_event: 'per event',
  per_hour: 'per hour',
  per_plate: 'per plate',
  per_person: 'per person',
  per_day: 'per day',
};

export function tierLabel(tier: CostRangeTier): string {
  return TIER_LABELS[tier];
}

export function unitLabel(unit: CostRangeUnit): string {
  return UNIT_LABELS[unit];
}

// Maps the marigold filter value (the visible label in the filter pill)
// onto the canonical cost-range category. Unmapped categories return null
// and the cost-transparency bar simply doesn't render for them.
export function costRangeCategoryFromFilter(
  filterLabel: string,
): CostRangeCategory | null {
  switch (filterLabel) {
    case 'Photography':
      return 'photography';
    case 'Décor & Florals':
      return 'decor_florals';
    case 'HMUA':
      return 'hmua';
    case 'Catering':
      return 'catering';
    case 'Entertainment':
      return 'entertainment';
    case 'Videography':
      return 'videography';
    case 'Mehendi':
      return 'mehendi';
    case 'Stationery':
      return 'invitation_design';
    default:
      return null;
  }
}

const CATEGORY_LABELS: Record<CostRangeCategory, string> = {
  photography: 'Photography',
  decor_florals: 'Décor & florals',
  hmua: 'HMUA',
  catering: 'Catering',
  entertainment: 'Entertainment / DJ',
  planning: 'Wedding planner',
  invitation_design: 'Invitation design',
  mehendi: 'Mehendi artist',
  music_dj: 'Music / DJ',
  videography: 'Videography',
};

// One row per (category, city, tier) — mirrors the seed in 0028. Ordered
// budget → luxury so consumers can take this as-is for the breakdown.
const RANGES: CategoryCostBreakdown[] = [
  {
    category: 'photography',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.photography,
    ranges: [
      { tier: 'budget',  minPrice: 2500,  maxPrice: 4000,  unit: 'per_event' },
      { tier: 'mid',     minPrice: 4000,  maxPrice: 8000,  unit: 'per_event' },
      { tier: 'premium', minPrice: 8000,  maxPrice: 12000, unit: 'per_event' },
      { tier: 'luxury',  minPrice: 12000, maxPrice: null,  unit: 'per_event' },
    ],
  },
  {
    category: 'decor_florals',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.decor_florals,
    ranges: [
      { tier: 'budget',  minPrice: 3000,  maxPrice: 6000,  unit: 'per_event' },
      { tier: 'mid',     minPrice: 6000,  maxPrice: 15000, unit: 'per_event' },
      { tier: 'premium', minPrice: 15000, maxPrice: 30000, unit: 'per_event' },
      { tier: 'luxury',  minPrice: 30000, maxPrice: null,  unit: 'per_event' },
    ],
  },
  {
    category: 'hmua',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.hmua,
    ranges: [
      { tier: 'budget',  minPrice: 300,  maxPrice: 600,  unit: 'per_person', notes: 'Per event, per person' },
      { tier: 'mid',     minPrice: 600,  maxPrice: 1200, unit: 'per_person', notes: 'Per event, per person' },
      { tier: 'premium', minPrice: 1200, maxPrice: 2000, unit: 'per_person', notes: 'Per event, per person' },
      { tier: 'luxury',  minPrice: 2000, maxPrice: null, unit: 'per_person', notes: 'Per event, per person' },
    ],
  },
  {
    category: 'catering',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.catering,
    ranges: [
      { tier: 'budget',  minPrice: 30,  maxPrice: 50,  unit: 'per_plate' },
      { tier: 'mid',     minPrice: 50,  maxPrice: 85,  unit: 'per_plate' },
      { tier: 'premium', minPrice: 85,  maxPrice: 125, unit: 'per_plate' },
      { tier: 'luxury',  minPrice: 125, maxPrice: null, unit: 'per_plate' },
    ],
  },
  {
    category: 'entertainment',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.entertainment,
    ranges: [
      { tier: 'budget',  minPrice: 800,  maxPrice: 1500, unit: 'per_event' },
      { tier: 'mid',     minPrice: 1500, maxPrice: 3000, unit: 'per_event' },
      { tier: 'premium', minPrice: 3000, maxPrice: 5000, unit: 'per_event' },
      { tier: 'luxury',  minPrice: 5000, maxPrice: null, unit: 'per_event' },
    ],
  },
  {
    category: 'music_dj',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.music_dj,
    ranges: [
      { tier: 'budget',  minPrice: 800,  maxPrice: 1500, unit: 'per_event' },
      { tier: 'mid',     minPrice: 1500, maxPrice: 3000, unit: 'per_event' },
      { tier: 'premium', minPrice: 3000, maxPrice: 5000, unit: 'per_event' },
      { tier: 'luxury',  minPrice: 5000, maxPrice: null, unit: 'per_event' },
    ],
  },
  {
    category: 'mehendi',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.mehendi,
    ranges: [
      { tier: 'budget',  minPrice: 200,  maxPrice: 500,  unit: 'per_event' },
      { tier: 'mid',     minPrice: 500,  maxPrice: 1000, unit: 'per_event' },
      { tier: 'premium', minPrice: 1000, maxPrice: 2000, unit: 'per_event' },
      { tier: 'luxury',  minPrice: 2000, maxPrice: null, unit: 'per_event' },
    ],
  },
  {
    category: 'videography',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.videography,
    ranges: [
      { tier: 'budget',  minPrice: 2000,  maxPrice: 4000,  unit: 'per_event' },
      { tier: 'mid',     minPrice: 4000,  maxPrice: 7000,  unit: 'per_event' },
      { tier: 'premium', minPrice: 7000,  maxPrice: 12000, unit: 'per_event' },
      { tier: 'luxury',  minPrice: 12000, maxPrice: null,  unit: 'per_event' },
    ],
  },
  {
    category: 'planning',
    city: 'dallas',
    cityLabel: 'DFW',
    categoryLabel: CATEGORY_LABELS.planning,
    ranges: [
      { tier: 'budget',  minPrice: 2000,  maxPrice: 5000,  unit: 'per_event', notes: 'Full planning' },
      { tier: 'mid',     minPrice: 5000,  maxPrice: 12000, unit: 'per_event', notes: 'Full planning' },
      { tier: 'premium', minPrice: 12000, maxPrice: 25000, unit: 'per_event', notes: 'Full planning' },
      { tier: 'luxury',  minPrice: 25000, maxPrice: null,  unit: 'per_event', notes: 'Full planning' },
    ],
  },
];

export function getCostRangeForCategory(
  category: CostRangeCategory,
  city: string = 'dallas',
): CategoryCostBreakdown | null {
  return (
    RANGES.find((r) => r.category === category && r.city === city) ?? null
  );
}

// "$2,500" / "$30" — strips trailing zeros for round thousands so headline
// reads cleanly ("$2,500 – $15,000+" not "$2500.00 – $15000.00+").
export function formatPrice(amount: number): string {
  if (amount >= 1000 && amount % 1000 === 0) {
    return `$${(amount / 1000).toLocaleString()},000`;
  }
  return `$${amount.toLocaleString()}`;
}

// "$2,500–$4,000" or "$12,000+"
export function formatRange(min: number, max: number | null): string {
  if (max === null) return `${formatPrice(min)}+`;
  return `${formatPrice(min)}–${formatPrice(max)}`;
}

// Headline range across the breakdown — lowest min to the lowest "open
// luxury" anchor (e.g. Photography → "$2,500 – $15,000+"). The user asked
// for the headline to convey the full spread, so we cap at the *premium*
// max as the open-ended "+" anchor when luxury has no max — that gives a
// realistic "most weddings fall here" range without anchoring to a
// luxury floor that would feel unreachable.
export function formatHeadlineRange(breakdown: CategoryCostBreakdown): string {
  const min = breakdown.ranges[0]?.minPrice ?? 0;
  const luxury = breakdown.ranges.find((r) => r.tier === 'luxury');
  const premium = breakdown.ranges.find((r) => r.tier === 'premium');
  const anchor =
    luxury && luxury.maxPrice === null
      ? premium?.maxPrice ?? luxury.minPrice
      : luxury?.maxPrice ?? premium?.maxPrice ?? min;
  const openEnded = luxury?.maxPrice === null;
  return openEnded
    ? `${formatPrice(min)} – ${formatPrice(anchor)}+`
    : `${formatPrice(min)} – ${formatPrice(anchor)}`;
}
