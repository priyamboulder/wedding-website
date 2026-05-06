// ── Décor Build field-mapping table ────────────────────────────────────────
// Single source of truth for where each Build-journey field lives in the
// underlying decor-store. Most fields land on first-class decor-store
// slices — spaces, event_space_assignments, transitions, mandap, stages,
// install_tasks, vendor_coordination_notes. Two operational concepts
// (floral pulls + lighting fixtures) don't have first-class slices yet
// and persist on a journey-meta blob until decor-store gains them.
//
// This file is documentation as much as runtime mapping — the one place
// to look when fields change in either the Build schema OR the decor
// store, so they can be reconciled atomically.

import type { DecorBuildSessionKey } from "./decor-build";

export type DecorStoreSlice =
  | "spaces"
  | "event_space_assignments"
  | "transitions"
  | "mandap"
  | "stages"
  | "install_tasks"
  | "vendor_coordination_notes"
  | "journeyMeta";

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** decor-store slice that holds the canonical value. */
  slice: DecorStoreSlice;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<DecorBuildSessionKey, FieldMapping[]> = {
  // ── Session 1 · Event scenes ────────────────────────────────────────────
  event_scenes_buildout: [
    {
      formDataPath: "spaces[]",
      slice: "spaces",
      storePath: "spaces[]",
      notes:
        "Direct projection — SpaceDetail is the canonical shape used by the Spaces & Events tab.",
    },
    {
      formDataPath: "event_space_assignments[]",
      slice: "event_space_assignments",
      storePath: "event_space_assignments[]",
      notes:
        "Pairs an event_id with a space_id, plus setup window + turnover. The cross-workspace anchor for spatial scene zones.",
    },
    {
      formDataPath: "transitions[]",
      slice: "transitions",
      storePath: "transitions[]",
      notes:
        "TransitionPlan: ordered steps for flipping a space between events. The Sangeet→Wedding flip is the classic case.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "eventScenesComputed",
    },
  ],

  // ── Session 2 · Mandap & stages ─────────────────────────────────────────
  mandap_and_stages: [
    {
      formDataPath: "mandap.vision",
      slice: "mandap",
      storePath: "mandap.vision",
    },
    {
      formDataPath: "mandap.structure.*",
      slice: "mandap",
      storePath: "mandap.structure",
      notes:
        "Style / dimensions / material / orientation. Orientation broadcasts to Officiant Build.",
    },
    {
      formDataPath: "mandap.elements[]",
      slice: "mandap",
      storePath: "mandap.elements[]",
      notes:
        "Per-element include / detail. `included: true` means the element ships in the build.",
    },
    {
      formDataPath: "mandap.seating.*",
      slice: "mandap",
      storePath: "mandap.seating",
    },
    {
      formDataPath: "mandap.fire_safety.*",
      slice: "mandap",
      storePath: "mandap.fire_safety",
      notes:
        "Drives the fire-permit checklist task. Cross-reads from venue-store fire policy.",
    },
    {
      formDataPath: "stages[]",
      slice: "stages",
      storePath: "stages[]",
      notes:
        "One StageDesign per event that needs a stage (sangeet, reception, etc.).",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "mandapAndStagesComputed",
    },
  ],

  // ── Session 3 · Florals & lighting ──────────────────────────────────────
  florals_and_lighting: [
    {
      formDataPath: "floral_pulls[]",
      slice: "journeyMeta",
      storePath: "floralPulls",
      notes:
        "Not first-class on decor-store yet. When the store gains a floral_pulls slice, migrate (move-only).",
    },
    {
      formDataPath: "lighting_fixtures[]",
      slice: "journeyMeta",
      storePath: "lightingFixtures",
      notes:
        "Not first-class on decor-store yet. When the store gains a lighting_plot slice, migrate (move-only).",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "floralsAndLightingComputed",
    },
  ],

  // ── Session 4 · Install & run-of-show ───────────────────────────────────
  install_run_of_show: [
    {
      formDataPath: "install_tasks[]",
      slice: "install_tasks",
      storePath: "install_tasks[]",
      notes:
        "Per-day task list — the Install Plan tab renders the same data.",
    },
    {
      formDataPath: "vendor_coordination_notes[]",
      slice: "vendor_coordination_notes",
      storePath: "vendor_coordination_notes[]",
      notes:
        "Notes per vendor role — flow into every contracted vendor's day-of packet.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "installRunOfShowComputed",
    },
  ],
};
