// ── Guided journey unlock rules ─────────────────────────────────────────────
// Generalised gate conditions for journeys. Today the registry holds two
// kinds of journeys: Vision-style flows (always unlocked) and Build-style
// flows that wait until the couple has progressed elsewhere — either by
// time (Mehendi Logistics, ~4 months out) or by dependency (Officiant
// Build, once a vendor is shortlisted).
//
// Journeys aren't hard-blocked when their gate hasn't tripped: every CTA
// stays clickable. The gate determines whether the CTA renders muted with
// a soft-nudge tooltip vs. fully active. This file is a single source of
// truth for evaluating those gates.

import { useVendorsStore } from "@/stores/vendors-store";
import { useAuthStore } from "@/stores/auth-store";
import { useVenueStore } from "@/stores/venue-store";
import type { VendorCategory } from "@/types/vendor-unified";

// ── Gate definitions ───────────────────────────────────────────────────────

export type UnlockRule =
  | { kind: "unconditional" }
  // Time-phased: muted until the wedding is closer than `monthsBefore`.
  | { kind: "time_before_event"; monthsBefore: number }
  // Dependency-phased: muted until at least one vendor in the given
  // category has been hearted (status: shortlisted or contacted).
  | { kind: "vendor_shortlisted"; category: VendorCategory }
  // Stricter: muted until a vendor has moved past shortlisted to
  // contacted/contracted. Reserved for journeys that genuinely need a
  // vendor at the table.
  | { kind: "vendor_contracted"; category: VendorCategory }
  // Venue-specific: venues aren't part of VendorCategory (they live in a
  // separate venue-store with their own status enum), but the gating
  // semantics are identical to vendor_contracted — Venue Build pulls
  // spaces and rules from the contract, so it's gated on the venue
  // shortlist having a "booked" entry.
  | { kind: "venue_booked" };

export interface UnlockEvaluation {
  unlocked: boolean;
  // Short copy to show in the muted CTA tooltip when locked.
  tooltipWhenLocked?: string;
}

// Lightweight context flag instead of pulling the venue-store types in.
// `true` when at least one shortlist venue has status === "booked".
type VenueBookedFlag = boolean;

// ── Registry ───────────────────────────────────────────────────────────────
// Add a new journey gate here when a category gains a Build/Logistics
// journey. Keep keys aligned with EXTRA_JOURNEY_INTROS in session-config.

export const UNLOCK_RULES: Record<string, UnlockRule> = {
  "mehendi:logistics": { kind: "time_before_event", monthsBefore: 4 },
  "priest:build": {
    kind: "vendor_shortlisted",
    category: "pandit_ceremony",
  },
  "cake_sweets:selection": { kind: "time_before_event", monthsBefore: 6 },
  // Wardrobe Build: outfit matrix, family palettes, delivery windows.
  // 6-month threshold is real — couture Indian wedding wear (Sabyasachi,
  // Manish Malhotra, Anita Dongre) needs 4–6 months for custom orders.
  // Earlier than that the couple doesn't have enough specificity to brief
  // a designer.
  "wardrobe:build": { kind: "time_before_event", monthsBefore: 6 },
  // Gifting Build: welcome bags, trousseau, return favors, family
  // exchanges. 5-month threshold (raised from 4 in the cross-category
  // refinement pass) matches return-favor production cycles in addition to
  // Indian-imported trousseau packaging (60–90 day shipping) and custom
  // welcome-bag items (~60 day production). Earlier than that the guest
  // count isn't locked yet.
  "gifting:build": { kind: "time_before_event", monthsBefore: 5 },
  // Travel & Accommodations Build: block-level negotiation tracking with
  // attrition floors and cutoff dates, plus guest-level arrival tracking
  // with cluster pickup rosters. Premium hotel blocks need 6–9 months to
  // negotiate, and attrition terms must be locked before the contract is
  // signed — earlier than that and you don't know your guest count yet.
  "travel:build": { kind: "time_before_event", monthsBefore: 6 },
  // Transportation Build: baraat walkthrough, shuttle/airport math, fleet
  // roster. 4-month threshold matches police escort permits (30–90 days
  // depending on city), premium horse vendors (60–90 day lock-in), and
  // shuttle vendor contracts (typically 60 days). Earlier than that the
  // final guest count isn't locked yet — sizing the fleet would be guesswork.
  "transportation:build": { kind: "time_before_event", monthsBefore: 4 },
  // Jewelry Build: bridal/groom inventory, family heirlooms, fittings &
  // custody. EXTRA_JOURNEY_INTROS has unlocksAtMonthsBeforeEvent: 6;
  // mirroring the gate here keeps unlock-rules the single source of truth
  // for evaluators that don't read EXTRA_JOURNEY_INTROS directly. Custom
  // kundan/polki sets need 8–12 weeks plus shipping.
  "jewelry:build": { kind: "time_before_event", monthsBefore: 6 },

  // ── Pre-registered gates for Build journeys not yet implemented ────────
  // The cross-category refinement pass specifies these thresholds. Adding
  // the registry entries now means the evaluator is the single source of
  // truth: when each Build ships, no second source of unlock copy exists
  // to drift. CTAs that reference these journeys will render muted-but-
  // clickable until the threshold trips.

  // Décor & Florals Build: spaces & scenes, install spec, lighting plot,
  // floral pulls, load-in & run-of-show. Mandap fabrication runs 3–4
  // months and floral sourcing windows compound on top.
  "decor:build": { kind: "time_before_event", monthsBefore: 6 },
  // Catering Build: per-event menu skeleton, station list, special food
  // moments, dietary signage count. Caterer contracts firm 6–9 months out.
  "catering:build": { kind: "time_before_event", monthsBefore: 6 },
  // Music & Entertainment Build: key-moment songs, performance schedule,
  // energy pivots, AV requirements, day-of schedule. Song lists firm late
  // and DJ edits need ~4 weeks.
  "music:build": { kind: "time_before_event", monthsBefore: 3 },
  // Videography Build: audio plan, voiceover decisions, drone logistics,
  // shot additions on top of the Photography baseline. Needs locked venue
  // and a near-final running order.
  "videography:build": { kind: "time_before_event", monthsBefore: 4 },
  // Hair & Makeup Build: per-event looks lock, the chair list & schedule,
  // shelfie & touch-up kit. HMUA trials usually happen 3–6 months out.
  "hmua:build": { kind: "time_before_event", monthsBefore: 4 },
  // Stationery Build: every card and every envelope. Save-the-dates send
  // 6–8 months out and invitations 3–4; 6-month gate covers the earliest
  // operational moment.
  "stationery:build": { kind: "time_before_event", monthsBefore: 6 },

  // Venue Build: spaces & rules, vendor policies, load-in, contacts.
  // `venue_booked` rather than `vendor_contracted` because venues live in
  // a separate venue-store with their own status enum (see types/venue
  // → VenueStatus = "researching" | … | "booked"). Same gating semantics
  // as vendor_contracted — the Build pulls from the contract.
  "venue:build": { kind: "venue_booked" },
};

// ── Pure evaluator ─────────────────────────────────────────────────────────
// Side-effect-free: takes everything it needs as args. Hooks below wrap
// this with the relevant stores so callers don't have to.

export function evaluateUnlockRule(
  rule: UnlockRule,
  ctx: {
    monthsUntilEvent?: number | null;
    shortlistedCategories?: ReadonlySet<VendorCategory>;
    contractedCategories?: ReadonlySet<VendorCategory>;
    venueBooked?: VenueBookedFlag;
  },
): UnlockEvaluation {
  switch (rule.kind) {
    case "unconditional":
      return { unlocked: true };

    case "time_before_event": {
      const m = ctx.monthsUntilEvent;
      if (m == null) return { unlocked: true }; // no date set = no gate
      if (m <= rule.monthsBefore) return { unlocked: true };
      return {
        unlocked: false,
        tooltipWhenLocked: `Unlocks ${rule.monthsBefore} months before your wedding.`,
      };
    }

    case "vendor_shortlisted": {
      const has = ctx.shortlistedCategories?.has(rule.category) ?? false;
      if (has) return { unlocked: true };
      return {
        unlocked: false,
        tooltipWhenLocked:
          "Build unlocks once you've shortlisted an officiant. The decisions are easier with a pandit at the table.",
      };
    }

    case "vendor_contracted": {
      const has = ctx.contractedCategories?.has(rule.category) ?? false;
      if (has) return { unlocked: true };
      return {
        unlocked: false,
        tooltipWhenLocked:
          "Unlocks once you've signed a contract with this vendor.",
      };
    }

    case "venue_booked": {
      if (ctx.venueBooked) return { unlocked: true };
      return {
        unlocked: false,
        tooltipWhenLocked:
          "Spaces & rules pull from your venue contract — unlocks once a venue is booked.",
      };
    }
  }
}

// ── React hooks ────────────────────────────────────────────────────────────
// Convenience wrappers that wire the evaluator to live store state.

export function useUnlockEvaluation(journeyKey: string): UnlockEvaluation {
  const rule = UNLOCK_RULES[journeyKey] ?? { kind: "unconditional" };

  // Pull from vendors-store. Selecting at the slice level keeps re-renders
  // tight; we recompute the category set from the shortlist on each render.
  const shortlist = useVendorsStore((s) => s.shortlist);
  const vendors = useVendorsStore((s) => s.vendors);

  const shortlistedCategories = new Set<VendorCategory>();
  const contractedCategories = new Set<VendorCategory>();

  for (const entry of shortlist) {
    const v = vendors.find((x) => x.id === entry.vendor_id);
    if (!v) continue;
    if (entry.status === "ruled_out") continue;
    // Anything not ruled out counts as "shortlisted" for the soft gate.
    shortlistedCategories.add(v.category);
    if (entry.status === "contracted" || entry.status === "booked") {
      contractedCategories.add(v.category);
    }
  }

  // Wedding date → months-until-event for time-based gates. Approximate
  // (1 month ≈ 30.44 days), matching the per-Build dual-CTA wrappers that
  // pre-dated this hook plumbing it themselves.
  const weddingDate = useAuthStore((s) => s.user?.wedding?.weddingDate ?? null);
  const monthsUntilEvent = monthsUntilEventFrom(weddingDate);

  // Venue contract status — true when at least one shortlist venue has
  // moved to "booked". Driven by venue-store; cheap to subscribe to,
  // recomputed only when the shortlist array changes.
  const venueBooked = useVenueStore((s) =>
    s.shortlist.some((v) => v.status === "booked"),
  );

  return evaluateUnlockRule(rule, {
    shortlistedCategories,
    contractedCategories,
    monthsUntilEvent,
    venueBooked,
  });
}

// Pure helper — kept exported so non-hook call sites (e.g. server-rendered
// pre-fetch components) can compute the same value without pulling in the
// store. Returns `null` when the date is missing/invalid; the evaluator
// treats null as "no gate" so unlock defaults to true.
export function monthsUntilEventFrom(
  weddingDate: string | null | undefined,
): number | null {
  if (!weddingDate) return null;
  const target = new Date(weddingDate);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return diffMs / (1000 * 60 * 60 * 24) / 30.44;
}

// ── Helpers for tab-level CTAs ─────────────────────────────────────────────

export function isOfficiantBuildUnlocked(
  shortlistedCategories: ReadonlySet<VendorCategory>,
): boolean {
  return shortlistedCategories.has("pandit_ceremony");
}
