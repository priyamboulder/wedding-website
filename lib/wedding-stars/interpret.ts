// ──────────────────────────────────────────────────────────────────────────
// Transit interpretation engine.
//
// Combines:
//   1. The kind of transit (retrograde / exalted / combust / ingress)
//   2. The planet involved (Jupiter / Venus / Mercury / Saturn / Rahu / Ketu)
//   3. The house it activates for THIS Moon sign
//
// ...and produces a wedding-specific reading: status (color), impact text,
// best-for / avoid action lists, and an optional pro tip.
//
// We avoid pre-writing 12 × ~15 = ~180 unique strings. Instead, we compose
// the impact text from a small grammar:
//
//   <transit clause> + <house clause> + <action implication>
//
// This keeps the dataset compact, lets a single edit propagate everywhere,
// and avoids the maintenance burden of a hand-written matrix.
// ──────────────────────────────────────────────────────────────────────────

import type {
  TransitDef,
  TransitWindow,
  TransitStatus,
  WeddingAction,
} from "@/types/wedding-stars";
import type { Rashi } from "@/types/kundli";

import {
  CHALLENGING_HOUSES,
  FAVORABLE_HOUSES,
  HOUSE_MEANINGS,
  houseForMoonSign,
} from "./houses";

interface PlanetProfile {
  best: WeddingAction[];
  avoid: WeddingAction[];
  governs: string; // short noun phrase
}

const PLANET_PROFILE: Record<string, PlanetProfile> = {
  Jupiter: {
    best: [
      "venue-booking",
      "vendor-contracts",
      "ceremony-planning",
      "family-conversations",
      "general-decisions",
    ],
    avoid: [],
    governs: "wisdom, blessings, and expansion",
  },
  Venus: {
    best: [
      "outfit-shopping",
      "beauty-decisions",
      "decor-aesthetic",
      "honeymoon-planning",
      "music-entertainment",
    ],
    avoid: [],
    governs: "love, beauty, luxury, and aesthetics",
  },
  Mercury: {
    best: ["invitations", "guest-list", "vendor-contracts"],
    avoid: [],
    governs: "communication, contracts, and travel",
  },
  Saturn: {
    best: ["budget-planning", "ceremony-planning", "general-decisions"],
    avoid: [],
    governs: "discipline, structure, and timing",
  },
  Mars: {
    best: ["legal-paperwork"],
    avoid: [],
    governs: "energy, action, and conflict",
  },
  Sun: {
    best: ["family-conversations"],
    avoid: [],
    governs: "vitality, authority, and visibility",
  },
  Moon: {
    best: ["family-conversations"],
    avoid: [],
    governs: "emotion, mother, and the home",
  },
  Rahu: {
    best: ["travel-planning"],
    avoid: [],
    governs: "ambition, the unconventional, and karmic shifts",
  },
  Ketu: {
    best: [],
    avoid: [],
    governs: "release, spirituality, and detachment",
  },
};

/** Actions specifically governed by each house's themes. */
const HOUSE_ACTIONS: Record<number, WeddingAction[]> = {
  1: ["outfit-shopping", "beauty-decisions"],
  2: ["budget-planning", "family-conversations"],
  3: ["invitations", "music-entertainment"],
  4: ["decor-aesthetic", "family-conversations"],
  5: ["decor-aesthetic", "music-entertainment"],
  6: ["vendor-contracts", "legal-paperwork"],
  7: ["vendor-contracts", "ceremony-planning", "general-decisions"],
  8: ["budget-planning", "family-conversations"],
  9: ["travel-planning", "ceremony-planning", "family-conversations"],
  10: ["vendor-contracts", "photography-video"],
  11: ["guest-list", "music-entertainment"],
  12: ["honeymoon-planning"],
};

/** Universally avoid actions for retrogrades — keyed by planet. */
const RETROGRADE_AVOID: Record<string, WeddingAction[]> = {
  Mercury: [
    "vendor-contracts",
    "invitations",
    "legal-paperwork",
    "guest-list",
  ],
  Venus: [
    "outfit-shopping",
    "beauty-decisions",
    "decor-aesthetic",
    "honeymoon-planning",
  ],
  Jupiter: ["ceremony-planning"],
  Saturn: [],
  Mars: ["legal-paperwork"],
};

const RETROGRADE_BEST: Record<string, WeddingAction[]> = {
  Mercury: ["family-conversations"],
  Venus: [],
  Jupiter: ["family-conversations"],
  Saturn: ["budget-planning"],
  Mars: [],
};

// Combust planets temporarily lose their benefic power.
const COMBUST_AVOID: Record<string, WeddingAction[]> = {
  Jupiter: ["ceremony-planning", "vendor-contracts"],
  Venus: ["outfit-shopping", "beauty-decisions"],
  Mercury: ["invitations", "vendor-contracts"],
  Saturn: ["budget-planning"],
};

// ── Public: interpret one transit for one Moon sign ─────────────────────────

export function interpret(t: TransitDef, moonSign: Rashi): TransitWindow {
  const house = houseForMoonSign(moonSign, t.inSign);
  const houseInfo = HOUSE_MEANINGS[house];
  const profile = PLANET_PROFILE[t.planet];

  const status = resolveStatus(t, house);
  const { bestFor, avoid } = resolveActions(t, house);
  const weddingImpact = composeImpact(t, house, status);
  const proTip = resolveProTip(t, house, moonSign);

  return {
    transitId: t.id,
    planet: t.planet,
    event: t.event,
    kind: t.kind,
    startISO: t.startISO,
    endISO: t.endISO,
    inSign: t.inSign,
    highlight: t.highlight,
    warning: t.warning,
    houseForRashi: house,
    status,
    weddingImpact,
    bestFor,
    avoid,
    proTip,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function resolveStatus(t: TransitDef, house: number): TransitStatus {
  // Retrograde Venus is the strongest "avoid" signal for weddings.
  if (t.kind === "retrograde" && t.planet === "Venus") return "avoid";
  if (t.kind === "retrograde" && t.planet === "Mercury") return "caution";

  // Combust softens the planet's gift.
  if (t.kind === "combust") return "caution";

  // Jupiter exalted is the headline auspicious window.
  if (t.kind === "exalted" && t.planet === "Jupiter") {
    return FAVORABLE_HOUSES.has(house) ? "highly-favorable" : "favorable";
  }

  // Saturn / Rahu / Ketu are by default mixed — context-dependent.
  if (t.planet === "Saturn" || t.planet === "Rahu" || t.planet === "Ketu") {
    if (CHALLENGING_HOUSES.has(house)) return "caution";
    if (FAVORABLE_HOUSES.has(house)) return "favorable";
    return "mixed";
  }

  // Default: house tone wins.
  if (t.kind === "retrograde") return "caution";
  if (FAVORABLE_HOUSES.has(house)) return "favorable";
  if (CHALLENGING_HOUSES.has(house)) return "mixed";
  return "favorable";
}

function resolveActions(
  t: TransitDef,
  house: number,
): { bestFor: WeddingAction[]; avoid: WeddingAction[] } {
  const profile = PLANET_PROFILE[t.planet];
  const houseActions = HOUSE_ACTIONS[house] ?? [];

  if (t.kind === "retrograde") {
    return {
      bestFor: dedupe([...(RETROGRADE_BEST[t.planet] ?? [])]),
      avoid: dedupe([
        ...(RETROGRADE_AVOID[t.planet] ?? []),
        ...(profile?.best ?? []),
      ]).filter((a) => !RETROGRADE_BEST[t.planet]?.includes(a)),
    };
  }

  if (t.kind === "combust") {
    return {
      bestFor: [],
      avoid: dedupe([
        ...(COMBUST_AVOID[t.planet] ?? []),
        ...(profile?.best ?? []),
      ]),
    };
  }

  // Ingress / exalted / direct → favorable lean.
  if (t.kind === "exalted" && t.planet === "Jupiter") {
    return {
      bestFor: dedupe([
        ...houseActions,
        ...(profile?.best ?? []),
        "general-decisions",
      ]),
      avoid: [],
    };
  }

  // Standard ingress: bias toward house themes the planet supports.
  const bestFor = dedupe([
    ...houseActions,
    ...(profile?.best ?? []).slice(0, 3),
  ]);

  // For challenging houses, soften by trimming sensitive actions.
  if (CHALLENGING_HOUSES.has(house)) {
    return {
      bestFor: bestFor.filter((a) => a !== "vendor-contracts"),
      avoid: ["vendor-contracts"],
    };
  }
  return { bestFor, avoid: [] };
}

function composeImpact(
  t: TransitDef,
  house: number,
  status: TransitStatus,
): string {
  const houseInfo = HOUSE_MEANINGS[house];
  const profile = PLANET_PROFILE[t.planet];
  const planetGoverns = profile?.governs ?? "";
  const ordinal = ordinalize(house);

  if (t.kind === "retrograde" && t.planet === "Venus") {
    return `Venus governs ${planetGoverns}. When she's retrograde, traditional Vedic astrology counsels against new aesthetic and relationship commitments — what looks perfect today can feel wrong by the time the music starts. With this retrograde activating your ${ordinal} house (${houseInfo.area.toLowerCase()}), focus on revisiting choices you've already made and avoid signing for the new dress, the new vendor, or the new look.`;
  }
  if (t.kind === "retrograde" && t.planet === "Mercury") {
    return `Mercury rules ${planetGoverns}, so when it reverses course, miscommunication and contract slippage spike. With this retrograde landing in your ${ordinal} house (${houseInfo.area.toLowerCase()}), it's a good time to review existing plans, reconnect with vendors you previously passed on, and double-check anything in writing. Hold off on signing or sending.`;
  }
  if (t.kind === "retrograde" && t.planet === "Jupiter") {
    return `Jupiter retrograde isn't a stop sign — it's an invitation to revisit big-picture decisions. Activating your ${ordinal} house (${houseInfo.area.toLowerCase()}), this is a good window to refine the vision you've already committed to and check that your wedding still reflects what matters most to you and your families.`;
  }
  if (t.kind === "retrograde" && t.planet === "Saturn") {
    return `Saturn retrograde slows the pace and asks for accountability. In your ${ordinal} house (${houseInfo.area.toLowerCase()}), it surfaces structural questions — does the budget make sense, does the timeline hold, do the commitments line up with reality? Revisit, refine, and tighten.`;
  }
  if (t.kind === "retrograde") {
    return `${t.planet} retrograde activates your ${ordinal} house (${houseInfo.area.toLowerCase()}) — review and refine rather than sign new commitments.`;
  }

  if (t.kind === "combust" && t.planet === "Jupiter") {
    return `Jupiter is too close to the Sun and temporarily loses its benefic power. With Jupiter in your ${ordinal} house (${houseInfo.area.toLowerCase()}), the gift of this transit returns once Jupiter clears combustion in mid-August. Use this window for planning, not signing.`;
  }
  if (t.kind === "combust") {
    return `${t.planet} is combust — its energy in your ${ordinal} house is muted. Wait for it to clear before making major moves tied to ${houseInfo.area.toLowerCase()}.`;
  }

  if (t.kind === "exalted" && t.planet === "Jupiter") {
    return `Jupiter is exalted in Cancer — the most auspicious transit of the year. In your ${ordinal} house, it lights up ${houseInfo.area.toLowerCase()}. ${houseInfo.weddingContext} This is your green-light window: book vendors, sign contracts, and have the conversations you've been delaying.`;
  }

  // Default ingress / direct.
  if (FAVORABLE_HOUSES.has(house)) {
    return `${t.planet} (${planetGoverns}) moves through your ${ordinal} house, which governs ${houseInfo.area.toLowerCase()}. ${houseInfo.weddingContext}`;
  }
  if (CHALLENGING_HOUSES.has(house)) {
    return `${t.planet} activates your ${ordinal} house — a more demanding placement governing ${houseInfo.area.toLowerCase()}. ${houseInfo.weddingContext} Move methodically; the work done here pays off later.`;
  }
  return `${t.planet} transits your ${ordinal} house (${houseInfo.area.toLowerCase()}). ${houseInfo.weddingContext}`;
}

function resolveProTip(
  t: TransitDef,
  house: number,
  moonSign: Rashi,
): string | undefined {
  if (t.id === "jupiter-cancer-exalted-2026") {
    if (house === 7) {
      return "Jupiter exalted in your 7th house is the rarest possible blessing for a marriage transit. If you can time a major commitment — engagement, vendor contracts, or even the wedding itself — to this window, do it.";
    }
    if (house === 9) {
      return "Jupiter exalted in your 9th house literally governs auspicious long-distance travel. If you're considering a destination wedding, book your venue visit in this window.";
    }
    return "Jupiter stays exalted through October 30. Treat it as your 5-month window to make the major commitments you've been delaying.";
  }
  if (t.kind === "retrograde" && t.planet === "Venus") {
    return "Lock in your outfit, your decor theme, and your hair-and-makeup vendor BEFORE this window opens. During Venus retrograde: don't change anything aesthetic.";
  }
  if (t.kind === "retrograde" && t.planet === "Mercury") {
    return "Send invitations and sign contracts before this window — or wait until it ends. The middle is the danger zone.";
  }
  return undefined;
}

function ordinalize(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

function dedupe(list: WeddingAction[]): WeddingAction[] {
  return Array.from(new Set(list));
}
