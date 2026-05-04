// ──────────────────────────────────────────────────────────────────────────
// Guest Count Estimator — defaults and catalogs.
//
// Tier structure, default category labels, default per-event attendance
// rates and out-of-town modifiers. Calibrated against typical South Asian
// wedding patterns; every value is overridable in the UI.
// ──────────────────────────────────────────────────────────────────────────

import type {
  EventSlug,
  GuestDistribution,
  GuestEstimateState,
  TierDef,
  TierId,
} from "@/types/guests";

export const TIER_ORDER: TierId[] = [
  "immediate-family",
  "inner-extended",
  "outer-extended",
  "parents-friends",
  "couple-friends",
  "professional",
];

export const TIERS: TierDef[] = [
  {
    id: "immediate-family",
    name: "Immediate Family",
    description: "The people who'd be hurt if they weren't invited.",
    categories: [
      {
        id: "parents",
        label: "Parents",
        helpText: "Adjust for step-parents or non-traditional family setups.",
        defaultCount: 2,
        sideSpecific: true,
      },
      {
        id: "siblings-spouses",
        label: "Siblings + their spouses",
        sideSpecific: true,
      },
      {
        id: "siblings-kids",
        label: "Siblings' children",
        sideSpecific: true,
      },
      {
        id: "grandparents",
        label: "Grandparents",
        sideSpecific: true,
      },
    ],
  },
  {
    id: "inner-extended",
    name: "Extended — Inner Circle",
    description:
      "First cousins, aunts, uncles — the family you see at every holiday.",
    categories: [
      {
        id: "aunts-uncles",
        label: "Aunts & Uncles (parents' siblings + spouses)",
        sideSpecific: true,
      },
      {
        id: "first-cousins",
        label: "First cousins",
        sideSpecific: true,
      },
      {
        id: "first-cousin-spouses",
        label: "First cousins' spouses / partners",
        sideSpecific: true,
      },
      {
        id: "first-cousin-kids",
        label: "First cousins' children",
        helpText: "Be honest — are kids invited? This number adds up fast.",
        sideSpecific: true,
      },
    ],
  },
  {
    id: "outer-extended",
    name: "Extended — Outer Circle",
    description:
      "Second cousins, great-aunts, that uncle in Ahmedabad you've met twice.",
    categories: [
      {
        id: "parents-cousins",
        label: "Parents' cousins + spouses",
        helpText:
          "This is usually where the 'but we have to invite them' list lives.",
        sideSpecific: true,
      },
      {
        id: "second-cousins",
        label: "Second cousins",
        sideSpecific: true,
      },
      {
        id: "other-extended",
        label: "Other extended family",
        helpText: "Catch-all for family who don't fit above.",
        sideSpecific: true,
      },
    ],
  },
  {
    id: "parents-friends",
    name: "Parents' Friends",
    description:
      "Your parents' friends, community, and people they 'owe' an invite.",
    categories: [
      {
        id: "close-friends",
        label: "Parents' close friends",
        helpText: "Would attend any family event.",
        sideSpecific: true,
      },
      {
        id: "community",
        label: "Community / temple / mosque / gurdwara connections",
        sideSpecific: true,
      },
      {
        id: "colleagues",
        label: "Parents' colleagues they socialize with",
        sideSpecific: true,
      },
      {
        id: "obligation",
        label: "'Obligation' invites (reciprocal)",
        helpText:
          "They invited your parents to their kid's wedding. No judgment. How many?",
        sideSpecific: true,
      },
      {
        id: "other-social",
        label: "Parents' other social circles",
        sideSpecific: true,
      },
    ],
  },
  {
    id: "couple-friends",
    name: "Couple's Own Friends",
    description: "Your people. Entered once — shared between both of you.",
    categories: [
      {
        id: "inner-circle",
        label: "Close friend group / inner circle",
        sideSpecific: false,
      },
      {
        id: "college",
        label: "College / university friends",
        sideSpecific: false,
      },
      {
        id: "work",
        label: "Work friends / colleagues",
        sideSpecific: false,
      },
      {
        id: "other-groups",
        label: "Other friend groups (sports, hobbies, etc.)",
        sideSpecific: false,
      },
      {
        id: "plus-ones",
        label: "Friends' plus-ones (estimate)",
        helpText: "Rule of thumb: ~60–70% of single friends bring a +1.",
        sideSpecific: false,
      },
    ],
  },
  {
    id: "professional",
    name: "Professional / VIP",
    description:
      "Boss, clients, business partners — invited for professional reasons.",
    categories: [
      {
        id: "professional-contacts",
        label: "Professional contacts (either partner)",
        sideSpecific: false,
      },
      {
        id: "business-associates",
        label: "Family business associates",
        sideSpecific: false,
      },
      {
        id: "other-vip",
        label: "Other VIP / obligatory professional",
        sideSpecific: false,
      },
    ],
  },
];

export const ALL_EVENT_SLUGS: EventSlug[] = [
  "mehndi",
  "haldi",
  "sangeet",
  "ceremony",
  "reception",
  "welcome-dinner",
  "farewell-brunch",
  "cocktail",
  "pooja",
];

export const EVENT_NAMES: Record<EventSlug, string> = {
  mehndi: "Mehndi",
  haldi: "Haldi",
  sangeet: "Sangeet / Garba",
  ceremony: "Wedding Ceremony",
  reception: "Reception",
  "welcome-dinner": "Welcome Dinner",
  "farewell-brunch": "Farewell Brunch",
  cocktail: "Cocktail Party",
  pooja: "Pooja / Ganesh Puja",
};

export const DEFAULT_EVENT_SELECTION: EventSlug[] = [
  "mehndi",
  "sangeet",
  "ceremony",
  "reception",
];

export const DEFAULT_ATTENDANCE_RATES: Record<
  EventSlug,
  Record<TierId, number>
> = {
  mehndi: {
    "immediate-family": 1.0,
    "inner-extended": 0.8,
    "outer-extended": 0.3,
    "parents-friends": 0.2,
    "couple-friends": 0.5,
    professional: 0.05,
  },
  haldi: {
    "immediate-family": 1.0,
    "inner-extended": 0.6,
    "outer-extended": 0.1,
    "parents-friends": 0.05,
    "couple-friends": 0.2,
    professional: 0,
  },
  sangeet: {
    "immediate-family": 1.0,
    "inner-extended": 0.85,
    "outer-extended": 0.5,
    "parents-friends": 0.4,
    "couple-friends": 0.7,
    professional: 0.1,
  },
  ceremony: {
    "immediate-family": 1.0,
    "inner-extended": 0.95,
    "outer-extended": 0.7,
    "parents-friends": 0.65,
    "couple-friends": 0.75,
    professional: 0.4,
  },
  reception: {
    "immediate-family": 1.0,
    "inner-extended": 0.95,
    "outer-extended": 0.75,
    "parents-friends": 0.7,
    "couple-friends": 0.8,
    professional: 0.5,
  },
  "welcome-dinner": {
    "immediate-family": 1.0,
    "inner-extended": 0.7,
    "outer-extended": 0.2,
    "parents-friends": 0.15,
    "couple-friends": 0.3,
    professional: 0.15,
  },
  "farewell-brunch": {
    "immediate-family": 0.95,
    "inner-extended": 0.5,
    "outer-extended": 0.1,
    "parents-friends": 0.1,
    "couple-friends": 0.25,
    professional: 0.05,
  },
  cocktail: {
    "immediate-family": 1.0,
    "inner-extended": 0.85,
    "outer-extended": 0.55,
    "parents-friends": 0.55,
    "couple-friends": 0.85,
    professional: 0.5,
  },
  pooja: {
    "immediate-family": 1.0,
    "inner-extended": 0.7,
    "outer-extended": 0.25,
    "parents-friends": 0.15,
    "couple-friends": 0.2,
    professional: 0.05,
  },
};

export const DEFAULT_OUT_OF_TOWN_MODIFIERS: Record<EventSlug, number> = {
  mehndi: 0.25,
  haldi: 0.3,
  sangeet: 0.2,
  ceremony: 0.15,
  reception: 0.15,
  "welcome-dinner": 0.1,
  "farewell-brunch": 0.2,
  cocktail: 0.15,
  pooja: 0.25,
};

export const GUEST_DISTRIBUTION_MULTIPLIERS: Record<
  GuestDistribution,
  number
> = {
  "mostly-local": 0.15,
  mixed: 0.45,
  "mostly-traveling": 0.7,
  international: 0.85,
};

export const GUEST_DISTRIBUTION_LABELS: Record<GuestDistribution, string> = {
  "mostly-local": "Mostly local (within 2 hours)",
  mixed: "Mixed — about half traveling",
  "mostly-traveling": "Mostly out of town (flying in)",
  international: "Spread across multiple countries",
};

export const DEFAULT_COST_PER_HEAD = 150; // DFW Indian-wedding average for food+venue baseline.

export function buildInitialState(): GuestEstimateState {
  return {
    events: [...DEFAULT_EVENT_SELECTION],
    weddingLocation: "",
    guestDistribution: "mixed",
    costPerHead: DEFAULT_COST_PER_HEAD,
    sides: [
      { id: "a", label: "Side A", enabled: true, counts: seedSideCounts() },
      { id: "b", label: "Side B", enabled: true, counts: seedSideCounts() },
    ],
    shared: { counts: {} },
    eventOverrides: {},
  };
}

function seedSideCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tier of TIERS) {
    for (const cat of tier.categories) {
      if (cat.sideSpecific && cat.defaultCount != null) {
        counts[`${tier.id}:${cat.id}`] = cat.defaultCount;
      }
    }
  }
  return counts;
}

export function getCategoryKey(tierId: TierId, categoryId: string): string {
  return `${tierId}:${categoryId}`;
}
