// ──────────────────────────────────────────────────────────────────────────
// Guest Count Estimator — public surface.
// ──────────────────────────────────────────────────────────────────────────

export {
  ALL_EVENT_SLUGS,
  DEFAULT_ATTENDANCE_RATES,
  DEFAULT_COST_PER_HEAD,
  DEFAULT_EVENT_SELECTION,
  DEFAULT_OUT_OF_TOWN_MODIFIERS,
  EVENT_NAMES,
  GUEST_DISTRIBUTION_LABELS,
  GUEST_DISTRIBUTION_MULTIPLIERS,
  TIERS,
  TIER_ORDER,
  buildInitialState,
  getCategoryKey,
} from "./defaults";

export {
  computeEstimate,
  computeEventBreakdown,
  computeSharedTierTotals,
  computeSideTotals,
  computeTotalNames,
  computeTotalsByTier,
} from "./calculate";

export { generateInsights } from "./insights";

export { decodeState, encodeState } from "./share";

export { downloadGuestPdf, exportGuestPdf } from "./pdf";
