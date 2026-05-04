// ──────────────────────────────────────────────────────────────────────────
// Budget builder — useReducer state, actions, and localStorage persistence.
//
// The builder is fully anonymous-friendly. State is held in React reducer
// state, mirrored to localStorage on every change keyed by the
// anonymous_token. On signup, the saved state can be hydrated into a real
// `budget_user_plans` row via `lib/budget/plans.ts`.
//
// Pure module — no React imports here. The reducer is consumed by the
// `BudgetBuilder` client component.
// ──────────────────────────────────────────────────────────────────────────

import type { BudgetTier } from "@/types/budget";

// ── State shape ───────────────────────────────────────────────────────────

export type BuilderStep =
  | "location"
  | "culture"
  | "budget"
  | "tier"
  | "build";

export interface BuilderState {
  // Phase 1 onboarding — completed when all four are non-null and
  // `step === 'build'`.
  step: BuilderStep;
  locationSlug: string | null;
  cultureSlug: string | null;
  totalBudget: number | null;
  globalTier: BudgetTier;

  // Phase 2 builder
  guestCounts: Record<string, number>;          // event_slug -> count
  vendorTiers: Record<string, BudgetTier>;       // selectionKey -> tier override
  selectedAddons: Record<string, true>;          // selectionKey -> selected
  view: "build" | "summary";
}

export const INITIAL_BUILDER_STATE: BuilderState = {
  step: "location",
  locationSlug: null,
  cultureSlug: null,
  totalBudget: null,
  globalTier: "elevated",
  guestCounts: {},
  vendorTiers: {},
  selectedAddons: {},
  view: "build",
};

// ── Actions ──────────────────────────────────────────────────────────────

export type BuilderAction =
  | { type: "set_step"; step: BuilderStep }
  | { type: "set_location"; slug: string | null }
  | { type: "set_culture"; slug: string | null; defaultGuestCounts: Record<string, number> }
  | { type: "set_total_budget"; total: number | null }
  | { type: "set_global_tier"; tier: BudgetTier }
  | { type: "set_event_guests"; eventSlug: string; count: number }
  | { type: "set_vendor_tier"; selectionKey: string; tier: BudgetTier }
  | { type: "clear_vendor_tier"; selectionKey: string }
  | { type: "set_event_all_tiers"; eventSlug: string; tier: BudgetTier; categorySlugs: string[] }
  | { type: "toggle_addon"; selectionKey: string }
  | { type: "set_view"; view: "build" | "summary" }
  | { type: "hydrate"; state: BuilderState }
  | { type: "reset" };

// ── Reducer ──────────────────────────────────────────────────────────────

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "set_step":
      return { ...state, step: action.step };

    case "set_location":
      return { ...state, locationSlug: action.slug };

    case "set_culture": {
      // Reset guest counts to the new culture's defaults but preserve any
      // explicit overrides for events that exist in both cultures.
      const merged: Record<string, number> = { ...action.defaultGuestCounts };
      for (const slug of Object.keys(state.guestCounts)) {
        if (slug in merged) merged[slug] = state.guestCounts[slug];
      }
      return {
        ...state,
        cultureSlug: action.slug,
        guestCounts: merged,
      };
    }

    case "set_total_budget":
      return { ...state, totalBudget: action.total };

    case "set_global_tier":
      return { ...state, globalTier: action.tier };

    case "set_event_guests":
      return {
        ...state,
        guestCounts: { ...state.guestCounts, [action.eventSlug]: action.count },
      };

    case "set_vendor_tier":
      return {
        ...state,
        vendorTiers: { ...state.vendorTiers, [action.selectionKey]: action.tier },
      };

    case "clear_vendor_tier": {
      if (!(action.selectionKey in state.vendorTiers)) return state;
      const next = { ...state.vendorTiers };
      delete next[action.selectionKey];
      return { ...state, vendorTiers: next };
    }

    case "set_event_all_tiers": {
      const next = { ...state.vendorTiers };
      for (const cat of action.categorySlugs) {
        const key = `v:${action.eventSlug}|${cat}`;
        next[key] = action.tier;
      }
      return { ...state, vendorTiers: next };
    }

    case "toggle_addon": {
      const next = { ...state.selectedAddons };
      if (next[action.selectionKey]) {
        delete next[action.selectionKey];
      } else {
        next[action.selectionKey] = true;
      }
      return { ...state, selectedAddons: next };
    }

    case "set_view":
      return { ...state, view: action.view };

    case "hydrate":
      return action.state;

    case "reset":
      return INITIAL_BUILDER_STATE;

    default:
      return state;
  }
}

// ── localStorage persistence ─────────────────────────────────────────────
// Stored keyed by anonymous_token so a user can theoretically have multiple
// in-flight plans across browsers (matches the budget_user_plans table).

const STATE_PREFIX = "marigold:budget:state:";

function storageKey(anonymousToken: string): string {
  return `${STATE_PREFIX}${anonymousToken}`;
}

export function readPersistedState(anonymousToken: string): BuilderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(anonymousToken));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    // Best-effort merge with defaults so older snapshots still load.
    return { ...INITIAL_BUILDER_STATE, ...(parsed as Partial<BuilderState>) };
  } catch {
    return null;
  }
}

export function writePersistedState(anonymousToken: string, state: BuilderState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(anonymousToken), JSON.stringify(state));
  } catch {
    // Storage quota / private mode — silent fail. The builder still works
    // for the current session.
  }
}

export function clearPersistedState(anonymousToken: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(anonymousToken));
  } catch {
    /* noop */
  }
}

// ── Onboarding gate ───────────────────────────────────────────────────────

export function isOnboardingComplete(state: BuilderState): boolean {
  return (
    state.locationSlug != null &&
    state.cultureSlug != null &&
    state.totalBudget != null &&
    state.totalBudget > 0
  );
}
