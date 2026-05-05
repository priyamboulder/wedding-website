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
  | { kind: "vendor_contracted"; category: VendorCategory };

export interface UnlockEvaluation {
  unlocked: boolean;
  // Short copy to show in the muted CTA tooltip when locked.
  tooltipWhenLocked?: string;
}

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
  // exchanges. 4-month threshold matches Indian-imported trousseau
  // packaging (60–90 day shipping) and custom welcome-bag items (~60 day
  // production). Earlier than that the guest count isn't locked yet.
  "gifting:build": { kind: "time_before_event", monthsBefore: 4 },
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

  return evaluateUnlockRule(rule, {
    shortlistedCategories,
    contractedCategories,
    // Time-based gates not wired here — Mehendi Logistics derives this from
    // its own wedding-date selector. Add when generalising further.
    monthsUntilEvent: null,
  });
}

// ── Helpers for tab-level CTAs ─────────────────────────────────────────────

export function isOfficiantBuildUnlocked(
  shortlistedCategories: ReadonlySet<VendorCategory>,
): boolean {
  return shortlistedCategories.has("pandit_ceremony");
}
