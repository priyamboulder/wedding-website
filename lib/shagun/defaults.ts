// ──────────────────────────────────────────────────────────────────────────
// Shagun Calculator — base amounts, modifiers, and labels.
//
// Source of truth for the calculation. All amounts in USD. Numbers ending
// in 1 is intentional: low/mid/high/premium pre-snap to auspicious values
// so post-modifier results land near the real auspicious ladder.
// ──────────────────────────────────────────────────────────────────────────

import type {
  BudgetComfort,
  CoupleTier,
  EventCount,
  Location,
  RelationshipTier,
  Tradition,
  WeddingScale,
  WeddingStyle,
} from "@/types/shagun";

export interface BaseTier {
  low: number;
  mid: number;
  high: number;
  premium: number;
}

// Standard auspicious USD amounts — every shagun ends in 1.
// Spans the realistic range from college-friend ($51) to elder-immediate-family
// ($10,001). Anything above gets returned uncapped.
export const AUSPICIOUS_LADDER: number[] = [
  11, 21, 31, 51, 71, 101, 151, 201, 251, 301, 351, 401, 501, 601, 701, 751,
  1001, 1251, 1501, 2001, 2501, 3001, 5001, 7501, 10001,
];

export const BASE_AMOUNTS_USD: Record<RelationshipTier, BaseTier> = {
  "immediate-family": {
    low: 501,
    mid: 1001,
    high: 2501,
    premium: 5001,
  },
  "close-extended-family": {
    low: 251,
    mid: 501,
    high: 1001,
    premium: 2001,
  },
  "outer-extended-family": {
    low: 101,
    mid: 201,
    high: 351,
    premium: 501,
  },
  "close-friend": {
    low: 151,
    mid: 251,
    high: 351,
    premium: 501,
  },
  "good-friend": {
    low: 101,
    mid: 151,
    high: 251,
    premium: 351,
  },
  "acquaintance-colleague": {
    low: 51,
    mid: 101,
    high: 151,
    premium: 251,
  },
  "parents-friend-family-friend": {
    low: 101,
    mid: 201,
    high: 351,
    premium: 501,
  },
  "business-relationship": {
    low: 101,
    mid: 151,
    high: 251,
    premium: 501,
  },
  // Non-Indian friends usually default to a friend-tier amount with a
  // gentler note — not a separate ladder. Mirrors close-friend by default.
  "non-indian-friend": {
    low: 101,
    mid: 151,
    high: 251,
    premium: 351,
  },
};

export const RELATIONSHIP_LABELS: Record<RelationshipTier, string> = {
  "immediate-family": "Immediate family",
  "close-extended-family": "Close extended family",
  "outer-extended-family": "Outer extended family",
  "close-friend": "Close friend",
  "good-friend": "Good friend",
  "acquaintance-colleague": "Acquaintance / colleague",
  "parents-friend-family-friend": "Parent's friend / family friend",
  "business-relationship": "Business relationship",
  "non-indian-friend": "Non-Indian friend",
};

export const RELATIONSHIP_SUBLABELS: Record<RelationshipTier, string> = {
  "immediate-family": "parent, sibling, grandparent",
  "close-extended-family": "aunt/uncle, first cousin",
  "outer-extended-family": "second cousin, distant relative",
  "close-friend": "inner circle, ride-or-die",
  "good-friend": "see them a few times a year",
  "acquaintance-colleague": "work friend, neighbor",
  "parents-friend-family-friend": "your parents are close to them",
  "business-relationship": "client, vendor, professional",
  "non-indian-friend": "friend who's not South Asian",
};

// Used by couple mode (no non-indian-friend bucket — couples count their
// guests by relationship, not by background).
export const COUPLE_TIERS: CoupleTier[] = [
  "immediate-family",
  "close-extended-family",
  "outer-extended-family",
  "close-friend",
  "good-friend",
  "acquaintance-colleague",
  "parents-friend-family-friend",
  "business-relationship",
];

export const COUPLE_TIER_LABELS: Record<CoupleTier, string> = {
  "immediate-family": "Immediate family",
  "close-extended-family": "Close extended family",
  "outer-extended-family": "Outer extended family",
  "close-friend": "Close friends",
  "good-friend": "Good friends",
  "acquaintance-colleague": "Acquaintances / colleagues",
  "parents-friend-family-friend": "Parents' friends / family friends",
  "business-relationship": "Business relationships",
};

export const COUPLE_TIER_SUBLABELS: Record<CoupleTier, string> = {
  "immediate-family": "parents, siblings, grandparents",
  "close-extended-family": "aunts, uncles, first cousins",
  "outer-extended-family": "second cousins, distant relatives",
  "close-friend": "ride-or-dies",
  "good-friend": "regulars in your life",
  "acquaintance-colleague": "work, neighbors, friends-of-friends",
  "parents-friend-family-friend": "your parents' world",
  "business-relationship": "clients, vendors, professional",
};

// Per-tier participation: not every guest gives cash. Closer ties always
// give; distant connections give less consistently. Used in couple mode.
export const COUPLE_PARTICIPATION_RATE: Record<CoupleTier, number> = {
  "immediate-family": 0.95,
  "close-extended-family": 0.92,
  "outer-extended-family": 0.85,
  "close-friend": 0.9,
  "good-friend": 0.82,
  "acquaintance-colleague": 0.7,
  "parents-friend-family-friend": 0.85,
  "business-relationship": 0.78,
};

// ── Modifiers ──────────────────────────────────────────────────────────────

export const WEDDING_SCALE_MULTIPLIER: Record<WeddingScale, number> = {
  intimate: 0.85,
  standard: 1.0,
  grand: 1.15,
  mega: 1.25,
};

export const WEDDING_SCALE_LABELS: Record<WeddingScale, string> = {
  intimate: "Intimate",
  standard: "Standard",
  grand: "Grand",
  mega: "Mega",
};

export const WEDDING_SCALE_SUBLABELS: Record<WeddingScale, string> = {
  intimate: "under 100 guests",
  standard: "100 – 250 guests",
  grand: "250 – 500 guests",
  mega: "500+ guests",
};

export const WEDDING_STYLE_MULTIPLIER: Record<WeddingStyle, number> = {
  "traditional-banquet": 1.0,
  "upscale-hotel": 1.15,
  "luxury-destination": 1.3,
  "casual-backyard": 0.8,
  "destination-travel": 1.1,
};

export const WEDDING_STYLE_LABELS: Record<WeddingStyle, string> = {
  "traditional-banquet": "Traditional banquet hall or temple",
  "upscale-hotel": "Upscale hotel or resort",
  "luxury-destination": "Luxury / destination wedding",
  "casual-backyard": "Backyard / casual / low-key",
  "destination-travel": "Destination — you're flying for it",
};

export const WEDDING_STYLE_SUBLABELS: Record<WeddingStyle, string> = {
  "traditional-banquet": "the standard for most weddings",
  "upscale-hotel": "ballroom-tier celebration",
  "luxury-destination": "significant travel involved",
  "casual-backyard": "small, intimate, home-feeling",
  "destination-travel": "you flew in to be there",
};

export const TRADITION_MULTIPLIER: Record<Tradition, number> = {
  "north-indian": 1.0,
  punjabi: 1.1,
  gujarati: 1.05,
  "south-indian": 0.9,
  bengali: 0.95,
  marathi: 0.95,
  muslim: 1.0,
  sikh: 1.05,
  jain: 1.0,
  "mixed-fusion": 1.0,
  general: 1.0,
};

export const TRADITION_LABELS: Record<Tradition, string> = {
  "north-indian": "North Indian",
  punjabi: "Punjabi",
  gujarati: "Gujarati",
  "south-indian": "South Indian",
  bengali: "Bengali",
  marathi: "Marathi",
  muslim: "Muslim",
  sikh: "Sikh",
  jain: "Jain",
  "mixed-fusion": "Mixed / Fusion",
  general: "Not sure / General Indian",
};

export const TRADITION_SUBLABELS: Record<Tradition, string> = {
  "north-indian": "UP, Rajasthani, etc.",
  punjabi: "trends slightly higher",
  gujarati: "",
  "south-indian": "Tamil, Telugu, Kannada, Malayalam",
  bengali: "",
  marathi: "",
  muslim: "any region",
  sikh: "",
  jain: "",
  "mixed-fusion": "the modern default",
  general: "we'll use a balanced average",
};

export const LOCATION_MULTIPLIER: Record<Location, number> = {
  "both-us": 1.0,
  "us-guest-india-wedding": 0.6,
  "india-guest-us-wedding": 0.7,
  "both-india": 0.3,
};

export const LOCATION_LABELS: Record<Location, string> = {
  "both-us": "Both of us in the US",
  "us-guest-india-wedding": "I'm in the US, wedding's in India",
  "india-guest-us-wedding": "I'm in India, wedding's in the US",
  "both-india": "Both in India",
};

export const LOCATION_SUBLABELS: Record<Location, string> = {
  "both-us": "US-calibrated amount",
  "us-guest-india-wedding": "amounts in India run lower",
  "india-guest-us-wedding": "adjusted for INR-context guests",
  "both-india": "INR-equivalent amount",
};

// Multi-event modifier — kept at 1.0 across the board: one shagun covers
// all events, no matter how many you attend. Tracked in the type system
// but currently a no-op so we can change it easily without touching math.
export const EVENT_COUNT_MULTIPLIER: Record<EventCount, number> = {
  "1-event": 1.0,
  "2-3-events": 1.0,
  "full-week": 1.0,
};

export const EVENT_COUNT_LABELS: Record<EventCount, string> = {
  "1-event": "Just the ceremony / reception",
  "2-3-events": "2 – 3 events",
  "full-week": "Full wedding week",
};

export const EVENT_COUNT_SUBLABELS: Record<EventCount, string> = {
  "1-event": "1 event",
  "2-3-events": "sangeet + ceremony + reception",
  "full-week": "4+ events",
};

// ── Budget ceiling ────────────────────────────────────────────────────────
// Maps a stated comfort range to the upper bound used to determine
// whether the calculator's recommendation exceeds the user's stated budget.
export const BUDGET_CEILING: Record<Exclude<BudgetComfort, "skip">, number> = {
  "under-100": 101,
  "100-200": 201,
  "200-500": 501,
  "500-1000": 1001,
  "1000-plus": Number.POSITIVE_INFINITY,
};
