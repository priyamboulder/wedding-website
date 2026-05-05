// ── Mehendi capacity calculator ──────────────────────────────────────────
// Pure function used by both the full Mehendi workspace (Tab 2 — Who Gets
// Mehendi) and the guided Logistics journey (Session 1 — Tiers & Capacity).
// Lifting it out of the mehndi-store guarantees both surfaces compute the
// same answer from the same inputs.

import type { DesignTier } from "@/types/mehndi";

export interface CapacityInputs {
  artistCount: number;
  hoursOnSite: number;
  expectedGuests: number;
  defaultTier: DesignTier;
  // Minutes per guest per tier. Defaults to 15/30/45 if omitted.
  tierMinutes?: Partial<Record<DesignTier, number>>;
}

export interface CapacityResult {
  artistHoursNeeded: number;
  artistHoursAvailable: number;
  servableGuests: number;
  unservableGuests: number;
  minutesPerGuest: number;
  suggestions: string[];
}

const DEFAULT_TIER_MINUTES: Record<DesignTier, number> = {
  quick: 15,
  classic: 30,
  detailed: 45,
};

const TIER_LABEL: Record<DesignTier, string> = {
  quick: "Quick & Pretty",
  classic: "Classic",
  detailed: "Detailed",
};

export function computeMehendiCapacity(
  inputs: CapacityInputs,
): CapacityResult {
  const tierMinutes = {
    ...DEFAULT_TIER_MINUTES,
    ...(inputs.tierMinutes ?? {}),
  };
  const minutesPerGuest = tierMinutes[inputs.defaultTier];
  const safeArtists = Math.max(1, inputs.artistCount);
  const safeHours = Math.max(0, inputs.hoursOnSite);
  const safeGuests = Math.max(0, inputs.expectedGuests);

  const artistHoursNeeded = (safeGuests * minutesPerGuest) / 60;
  const artistHoursAvailable = safeArtists * safeHours;
  const servableGuests =
    minutesPerGuest > 0
      ? Math.floor((artistHoursAvailable * 60) / minutesPerGuest)
      : 0;
  const unservableGuests = Math.max(0, safeGuests - servableGuests);

  const suggestions: string[] = [];
  if (unservableGuests > 0 && safeHours > 0) {
    const extraArtists = Math.ceil(
      (unservableGuests * minutesPerGuest) / 60 / safeHours,
    );
    suggestions.push(
      `Add ${extraArtists} more artist${extraArtists === 1 ? "" : "s"} to serve every guest at ${TIER_LABEL[inputs.defaultTier]}.`,
    );
    const extraHours = Math.ceil(
      (unservableGuests * minutesPerGuest) / 60 / safeArtists,
    );
    suggestions.push(
      `Or extend the event by ${extraHours} hour${extraHours === 1 ? "" : "s"}.`,
    );
    if (inputs.defaultTier !== "quick") {
      suggestions.push(
        `Or default to Quick & Pretty (${tierMinutes.quick} min) and offer Classic as a VIP upgrade.`,
      );
    }
  }

  return {
    artistHoursNeeded,
    artistHoursAvailable,
    servableGuests,
    unservableGuests,
    minutesPerGuest,
    suggestions,
  };
}

export function tierMinutesFor(tier: DesignTier): number {
  return DEFAULT_TIER_MINUTES[tier];
}

export function tierLabelFor(tier: DesignTier): string {
  return TIER_LABEL[tier];
}
