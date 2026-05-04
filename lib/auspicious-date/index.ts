// ──────────────────────────────────────────────────────────────────────────
// Auspicious-date public API. Re-exports keep call sites tidy.
// ──────────────────────────────────────────────────────────────────────────

export {
  applyFilters,
  buildYearDates,
  buildYearSummary,
  type FilterMatch,
  type YearSummary,
} from "./engine";
export { SUPPORTED_CITIES, type CityValue } from "./data/weather";
