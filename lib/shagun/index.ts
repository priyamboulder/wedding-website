// ──────────────────────────────────────────────────────────────────────────
// Shagun Calculator — public surface.
// ──────────────────────────────────────────────────────────────────────────

export {
  AUSPICIOUS_LADDER,
  BASE_AMOUNTS_USD,
  BUDGET_CEILING,
  COUPLE_PARTICIPATION_RATE,
  COUPLE_TIERS,
  COUPLE_TIER_LABELS,
  COUPLE_TIER_SUBLABELS,
  EVENT_COUNT_LABELS,
  EVENT_COUNT_MULTIPLIER,
  EVENT_COUNT_SUBLABELS,
  LOCATION_LABELS,
  LOCATION_MULTIPLIER,
  LOCATION_SUBLABELS,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_SUBLABELS,
  TRADITION_LABELS,
  TRADITION_MULTIPLIER,
  TRADITION_SUBLABELS,
  WEDDING_SCALE_LABELS,
  WEDDING_SCALE_MULTIPLIER,
  WEDDING_SCALE_SUBLABELS,
  WEDDING_STYLE_LABELS,
  WEDDING_STYLE_MULTIPLIER,
  WEDDING_STYLE_SUBLABELS,
} from "./defaults";

export {
  calculateShagun,
  estimateCoupleShagun,
  snapToAuspicious,
} from "./calculate";

export {
  decodeShare,
  encodeCoupleInputs,
  encodeGuestInputs,
} from "./share";
