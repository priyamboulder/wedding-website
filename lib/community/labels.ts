// ── Community labels ────────────────────────────────────────────────────────
// Convenience re-exports and lookup maps used across Community components.

import { GUEST_COUNT_RANGES, type GuestCountRange } from "@/types/community";

export { getInterestTag, getBlogCategory } from "./seed";

export const GUEST_COUNT_LABEL: Record<GuestCountRange, string> =
  GUEST_COUNT_RANGES.reduce(
    (acc, r) => {
      acc[r.id] = r.label;
      return acc;
    },
    {} as Record<GuestCountRange, string>,
  );
