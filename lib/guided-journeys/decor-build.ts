// ── Décor & Florals Build journey ───────────────────────────────────────────
// Second guided journey on the Décor workspace. Vision (the 7-session flow
// on Tab 1) covers aesthetic direction, palette, moodboard, brief. Build
// is operational and pulls from the contracted décor vendor:
//
//   1. event_scenes_buildout    — per-event spaces + setup windows + flips
//      (the canonical source for spatial scene zones that cascade to
//      Catering stations, Photography shot anchors, Music DJ booth)
//   2. mandap_and_stages        — mandap spec, stage designs per event
//   3. florals_and_lighting     — floral pulls + lighting plot (lives on
//      journey-meta until first-class on decor-store)
//   4. install_run_of_show      — install tasks + vendor coordination notes
//
// Build does NOT generate a closing brief. Output is operational: every
// scene paired, every fabrication window locked, every install task on
// the timeline. Section 14 of the refinement pass calls this out as the
// second-highest-leverage Build journey (after Venue) — `event_scenes`
// from this Build are the spatial source-of-truth that 4+ workspaces
// (Catering, Photography, Music, Stationery) read from.
//
// Field storage strategy: each session reads & writes through `useDecorStore`
// directly, plus a journey-meta slice on the journey state for fields not
// yet first-class on the decor store (floral pulls list, lighting plot
// fixtures, tablescape spec). This mirrors how venue-build handled its
// day-of contacts.

import type { CategoryKey } from "@/lib/guided-journey/types";
import type {
  EventSpaceAssignment,
  FireSafetyChecklist,
  InstallTask,
  MandapElementState,
  MandapSeating,
  MandapSpec,
  SpaceDetail,
  StageDesign,
  TransitionPlan,
  VendorCoordinationNote,
} from "@/types/decor";

export const DECOR_BUILD_JOURNEY_ID = "build";
export const DECOR_BUILD_CATEGORY: CategoryKey = "decor";

export type DecorBuildSessionKey =
  | "event_scenes_buildout"
  | "mandap_and_stages"
  | "florals_and_lighting"
  | "install_run_of_show";

export interface DecorBuildSessionDef {
  key: DecorBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const DECOR_BUILD_SESSIONS: readonly DecorBuildSessionDef[] = [
  {
    key: "event_scenes_buildout",
    index: 1,
    title: "Event scenes",
    subtitle:
      "Pair every space with the event it hosts. Scenes here cascade to Catering, Photography, and Music.",
    estimatedMinutes: 5,
  },
  {
    key: "mandap_and_stages",
    index: 2,
    title: "Mandap & stages",
    subtitle:
      "The biggest installs of the week — structure, seating, fire safety, per-event stage designs.",
    estimatedMinutes: 5,
  },
  {
    key: "florals_and_lighting",
    index: 3,
    title: "Florals & lighting",
    subtitle:
      "Floral pulls per event, lighting fixtures, palette anchored to your scenes.",
    estimatedMinutes: 4,
  },
  {
    key: "install_run_of_show",
    index: 4,
    title: "Install & run-of-show",
    subtitle:
      "Every install task on the timeline. Vendor coordination notes captured here flow into every contracted vendor.",
    estimatedMinutes: 4,
  },
] as const;

export const DECOR_BUILD_TOTAL_MINUTES = DECOR_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export function getDecorBuildSession(
  key: DecorBuildSessionKey,
): DecorBuildSessionDef {
  const found = DECOR_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown décor build session: ${key}`);
  }
  return found;
}

// ── Form data shapes ────────────────────────────────────────────────────────
// Each session's logical form_data, projected from useDecorStore + a
// small journey-meta slice for fields not yet first-class on the store.

// Session 1 — Event scenes. Reads decor-store: spaces, event_space_assignments,
// transitions. Writes the same. Most operational scene data.
export interface EventScenesBuildoutFormData {
  spaces: SpaceDetail[];
  event_space_assignments: EventSpaceAssignment[];
  transitions: TransitionPlan[];
  computed?: {
    total_spaces: number;
    paired_events: number;
    total_transitions: number;
  };
}

// Session 2 — Mandap & stages. Reads decor-store: mandap, stages.
export interface MandapAndStagesFormData {
  mandap: {
    vision: string;
    structure: MandapSpec["structure"];
    elements: MandapElementState[];
    seating: MandapSeating;
    fire_safety: FireSafetyChecklist;
  };
  stages: StageDesign[];
  computed?: {
    fire_safety_complete: boolean;
    elements_included: number;
    stages_count: number;
  };
}

// Session 3 — Florals & lighting. Mostly journey-meta until decor-store
// gains first-class slices for these. Pulls list = real-vs-faux + species
// counts; lighting plot = fixture types + intensity per event.
export interface FloralPullSpec {
  id: string;
  event_id: string;
  arrangement_label: string; // "Mandap canopy", "Reception centerpiece"
  realness: "real" | "faux" | "mixed";
  primary_flowers: string[]; // free-form labels
  count: number;
  notes: string;
}

export interface LightingFixtureSpec {
  id: string;
  event_id: string;
  fixture_type: string; // "Uplight", "Pin spot", "Chandelier", "Pattern wash"
  count: number;
  color_temp: string; // "warm white", "amber", "rgb"
  intensity_pct: number; // 0–100
  notes: string;
}

export interface FloralsAndLightingFormData {
  floral_pulls: FloralPullSpec[];
  lighting_fixtures: LightingFixtureSpec[];
  computed?: {
    total_arrangements: number;
    real_pct: number;
    total_fixtures: number;
  };
}

// Session 4 — Install & run-of-show. Reads decor-store: install_tasks,
// vendor_coordination_notes. Writes back the same.
export interface InstallRunOfShowFormData {
  install_tasks: InstallTask[];
  vendor_coordination_notes: VendorCoordinationNote[];
  computed?: {
    tasks_done: number;
    tasks_total: number;
    coordination_notes_count: number;
  };
}

// ── Aggregated journey form data ──────────────────────────────────────────

export interface DecorBuildFormData {
  event_scenes_buildout: EventScenesBuildoutFormData;
  mandap_and_stages: MandapAndStagesFormData;
  florals_and_lighting: FloralsAndLightingFormData;
  install_run_of_show: InstallRunOfShowFormData;
}
