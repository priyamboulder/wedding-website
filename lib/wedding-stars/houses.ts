// ──────────────────────────────────────────────────────────────────────────
// House meanings + Moon-sign-relative house resolution.
//
// In Vedic astrology, every transit "activates" a specific house (1..12)
// for a given Moon sign. The house counts forward from the Moon's sign:
// the Moon's sign itself is the 1st house, the next sign is the 2nd, etc.
// This is sometimes called the Chandra Lagna system. It's the same approach
// used by Hindu newspapers when they print weekly horoscopes "by your
// Moon sign."
// ──────────────────────────────────────────────────────────────────────────

import type { HouseMeaning } from "@/types/wedding-stars";
import type { Rashi } from "@/types/kundli";
import { RASHIS } from "@/lib/kundli";

export const HOUSE_MEANINGS: Record<number, HouseMeaning> = {
  1: {
    number: 1,
    area: "Self, appearance, new beginnings",
    weddingContext:
      "Personal confidence and how you show up. Strong window for outfit decisions, self-care planning, and presenting yourself.",
  },
  2: {
    number: 2,
    area: "Finances, family, speech",
    weddingContext:
      "Budget conversations, family money dynamics, and the words you choose with relatives. Productive for financial planning.",
  },
  3: {
    number: 3,
    area: "Communication, siblings, courage",
    weddingContext:
      "Sending invitations, coordinating with siblings and the wedding party, bold creative choices.",
  },
  4: {
    number: 4,
    area: "Home, comfort, mother, property",
    weddingContext:
      "Home-related decisions (where you'll live), mother-of-bride dynamics, and emotional security.",
  },
  5: {
    number: 5,
    area: "Creativity, romance, children",
    weddingContext:
      "Decor theme, sangeet choreography, romance gestures. Creative decisions land cleanly under this transit.",
  },
  6: {
    number: 6,
    area: "Obstacles, health, daily routine",
    weddingContext:
      "Logistics and problem-solving mode. Good for tackling vendor issues, building a wellness routine, and ironing out details.",
  },
  7: {
    number: 7,
    area: "Partnership, marriage, contracts",
    weddingContext:
      "The wedding house. Anything involving your partnership, signed contracts, and the relationship itself.",
  },
  8: {
    number: 8,
    area: "Transformation, shared resources, in-laws",
    weddingContext:
      "Deep conversations about combined finances and in-law dynamics. Intense but productive — surface the hard topics.",
  },
  9: {
    number: 9,
    area: "Luck, blessings, long-distance travel, father",
    weddingContext:
      "Seeking blessings, destination planning, conversations with father figures, spiritual preparation.",
  },
  10: {
    number: 10,
    area: "Career, public image, reputation",
    weddingContext:
      "How the wedding reflects your identity. Vendor negotiations, public-facing decisions, your wedding website.",
  },
  11: {
    number: 11,
    area: "Gains, social network, wishes fulfilled",
    weddingContext:
      "Guest networking, community support, wishes coming true. Strong window for finalizing the guest list.",
  },
  12: {
    number: 12,
    area: "Expenses, foreign travel, retreat",
    weddingContext:
      "Spending awareness — costs may run higher than expected. Productive for honeymoon planning and spiritual prep.",
  },
};

const RASHI_ORDER: Rashi[] = RASHIS.map((r) => r.name);

/**
 * Compute which house (1..12) a transit activates for the given Moon sign.
 * House 1 is the Moon's own sign; the count moves forward through the
 * zodiac in standard order.
 */
export function houseForMoonSign(moonSign: Rashi, transitSign: Rashi): number {
  const moonIdx = RASHI_ORDER.indexOf(moonSign);
  const transitIdx = RASHI_ORDER.indexOf(transitSign);
  if (moonIdx < 0 || transitIdx < 0) return 1;
  const diff = (transitIdx - moonIdx + 12) % 12;
  return diff + 1;
}

export const FAVORABLE_HOUSES = new Set([1, 3, 5, 7, 9, 10, 11]);
export const CHALLENGING_HOUSES = new Set([6, 8, 12]);
export const TRANSFORMATIVE_HOUSES = new Set([2, 4]);
