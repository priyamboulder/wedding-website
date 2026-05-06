// ── Venue policy broadcast registry ────────────────────────────────────────
// Section 4 of the cross-category refinement pass marks this as one of two
// highest-leverage features in the platform. Quote:
//
//   "Venue Build's policy broadcast — captures venue rules once and applies
//    them everywhere"
//
// This module is the canonical registry mapping every VenueLogistics field
// (the source of truth for venue rules) to the downstream workspaces that
// must read it. Without this, couples re-enter the same venue restriction
// in 5+ places: catering rules in the catering workspace, fire policy in
// the décor workspace, music curfew in the music workspace, parking notes
// in transportation, etc. With it, the venue contract gets entered once
// and the rules cascade automatically.
//
// The registry is pure metadata — it declares *which* fields broadcast to
// *which* workspaces with *what* transform. Actual reads happen in the
// downstream workspaces via the helpers exported here.

import type { VenueLogistics } from "@/types/venue";

// ── Downstream workspace identifiers ──────────────────────────────────────
// String-literal union, intentional. Keeps the registry compile-time safe
// and prevents drift when a workspace gets renamed.

export type DownstreamWorkspace =
  | "catering"
  | "decor"
  | "music"
  | "photography"
  | "videography"
  | "transportation"
  | "checklist";

// ── Restriction tags ──────────────────────────────────────────────────────
// VenueLogistics.restrictions is `string[]` — couples enter free-form
// strings from a chip picker. To make downstream broadcast deterministic,
// we recognise a controlled vocabulary and ignore unknown tokens for
// gating purposes (they still render as informational notes).

export type RestrictionTag =
  | "open_flame"
  | "drone"
  | "sparklers"
  | "confetti"
  | "rice"
  | "candles"
  | "helium";

const KNOWN_RESTRICTIONS: ReadonlySet<string> = new Set<RestrictionTag>([
  "open_flame",
  "drone",
  "sparklers",
  "confetti",
  "rice",
  "candles",
  "helium",
]);

// ── Policy-field → workspace mapping ──────────────────────────────────────
// Every VenueLogistics key that broadcasts to ≥1 downstream workspace
// appears here. Fields not in the map are venue-internal and don't fan
// out (e.g. `overtime_rate` is contract math couples track on the venue
// workspace itself, not a policy other vendors need).

export interface PolicyBroadcast {
  // Venue logistics field this entry describes.
  field: keyof VenueLogistics;
  // Workspaces that should read this field.
  workspaces: ReadonlyArray<DownstreamWorkspace>;
  // Human-readable label for the field (used in conflict-resolution UI).
  label: string;
  // Brief copy describing what downstream workspaces do with this field.
  // Surfaced in the venue-build session UI as "this policy will appear in
  // your catering / décor / music workspaces" tooltip text.
  downstream_summary: string;
}

export const VENUE_POLICY_BROADCASTS: ReadonlyArray<PolicyBroadcast> = [
  // ── Curfew & access ──
  {
    field: "music_curfew_indoor",
    workspaces: ["music"],
    label: "Indoor music curfew",
    downstream_summary:
      "Music workspace uses this to flag any DJ/band slots that run past curfew.",
  },
  {
    field: "music_curfew_outdoor",
    workspaces: ["music"],
    label: "Outdoor music curfew",
    downstream_summary:
      "Music workspace flags outdoor performances scheduled past this time.",
  },
  {
    field: "event_end_time",
    workspaces: ["music", "catering", "transportation"],
    label: "Event end time",
    downstream_summary:
      "Music: hard stop. Catering: late-night service window. Transportation: shuttle return.",
  },
  {
    field: "load_in_window",
    workspaces: ["catering", "decor", "music"],
    label: "Load-in window",
    downstream_summary:
      "Every vendor needs to know when they can access the venue. Drives load-in derivation.",
  },
  {
    field: "vendor_access",
    workspaces: ["catering", "decor", "music", "photography", "videography"],
    label: "Vendor access rules",
    downstream_summary:
      "Where vendors check in, badge requirements, escort policies.",
  },
  {
    field: "vendor_loading_window",
    workspaces: ["catering", "decor"],
    label: "Vendor loading window",
    downstream_summary:
      "Specific load-in dock hours; tighter than vendor_access in some venues.",
  },

  // ── Catering ──
  {
    field: "catering_policy",
    workspaces: ["catering"],
    label: "Catering policy",
    downstream_summary:
      "Free-form summary: in-house only, preferred list, fully open, etc.",
  },
  {
    field: "kitchen_access",
    workspaces: ["catering"],
    label: "Kitchen access",
    downstream_summary:
      "What kitchen facilities outside caterers can use (prep only / full kitchen / none).",
  },
  {
    field: "outside_caterer_allowed",
    workspaces: ["catering"],
    label: "Outside caterer allowed",
    downstream_summary:
      "Hard gate: when false, the catering workspace shortlist filters to in-house only.",
  },
  {
    field: "preferred_caterer_list",
    workspaces: ["catering"],
    label: "Preferred caterer list",
    downstream_summary:
      "Names of preferred caterers — surfaces as tagged shortlist suggestions.",
  },
  {
    field: "alcohol_policy",
    workspaces: ["catering"],
    label: "Alcohol policy",
    downstream_summary:
      "Drives bar program decisions: BYOB vs. in-house bar vs. dry venue.",
  },
  {
    field: "corkage_fee",
    workspaces: ["catering"],
    label: "Corkage fee",
    downstream_summary:
      "Per-bottle fee for outside-brought wine/spirits when allowed.",
  },

  // ── Décor ──
  {
    field: "wall_attachment_rules",
    workspaces: ["decor"],
    label: "Wall attachment rules",
    downstream_summary:
      "What can be hung where (no nails / removable hooks only / pre-approved hardware).",
  },
  {
    field: "restrictions",
    workspaces: ["decor", "music", "photography", "videography"],
    label: "Restrictions",
    downstream_summary:
      "Open flame, drone, sparklers, confetti, rice, candles, helium — applied as hard gates by every workspace whose plan would otherwise include them.",
  },

  // ── Power (cross-cutting AV) ──
  {
    field: "power_circuits",
    workspaces: ["music", "decor"],
    label: "Power circuits",
    downstream_summary:
      "How many circuits are available; drives DJ rig planning + lighting plot.",
  },
  {
    field: "power_notes",
    workspaces: ["music", "decor"],
    label: "Power notes",
    downstream_summary:
      "Free-form notes: generators required, dedicated circuit for stage, etc.",
  },

  // ── Ceremony ──
  {
    field: "fire_ceremony_policy",
    workspaces: ["decor"],
    label: "Fire ceremony policy",
    downstream_summary:
      "Whether havan / agni is allowed indoors or outdoors; permit requirements.",
  },
  {
    field: "fire_permit_owner",
    workspaces: ["checklist"],
    label: "Fire permit owner",
    downstream_summary:
      "Who's responsible for pulling the fire permit. Surfaces as a checklist item.",
  },

  // ── Parking & transport ──
  {
    field: "parking_capacity",
    workspaces: ["transportation"],
    label: "Parking capacity",
    downstream_summary:
      "Drives shuttle math: when capacity < expected guest car count, shuttles are required.",
  },
  {
    field: "valet",
    workspaces: ["transportation"],
    label: "Valet",
    downstream_summary:
      "Valet availability and cost — affects guest parking experience.",
  },
  {
    field: "shuttle_drop_off",
    workspaces: ["transportation"],
    label: "Shuttle drop-off",
    downstream_summary:
      "Designated shuttle drop-off zone; drives route plan derivation.",
  },
  {
    field: "baraat_rules",
    workspaces: ["transportation"],
    label: "Baraat rules",
    downstream_summary:
      "Route restrictions, processional permitted areas, dhol decibel limits.",
  },

  // ── Insurance / COI ──
  {
    field: "event_insurance_required",
    workspaces: ["checklist"],
    label: "Event insurance required",
    downstream_summary:
      "Drives COI deadline tracker (lib/calculators/coi-deadline-tracker.ts).",
  },
  {
    field: "liquor_liability",
    workspaces: ["catering", "checklist"],
    label: "Liquor liability rider",
    downstream_summary:
      "Specific COI rider required when bar service is in scope.",
  },
];

// ── Indices ───────────────────────────────────────────────────────────────
// Pre-computed lookup tables; consumers should use these helpers rather
// than scanning the array directly. They're built lazily on first call.

let _byWorkspace: Map<DownstreamWorkspace, PolicyBroadcast[]> | null = null;
let _byField: Map<keyof VenueLogistics, PolicyBroadcast> | null = null;

function indexes(): {
  byWorkspace: Map<DownstreamWorkspace, PolicyBroadcast[]>;
  byField: Map<keyof VenueLogistics, PolicyBroadcast>;
} {
  if (!_byWorkspace || !_byField) {
    const byWorkspace = new Map<DownstreamWorkspace, PolicyBroadcast[]>();
    const byField = new Map<keyof VenueLogistics, PolicyBroadcast>();
    for (const b of VENUE_POLICY_BROADCASTS) {
      byField.set(b.field, b);
      for (const w of b.workspaces) {
        const list = byWorkspace.get(w) ?? [];
        list.push(b);
        byWorkspace.set(w, list);
      }
    }
    _byWorkspace = byWorkspace;
    _byField = byField;
  }
  return { byWorkspace: _byWorkspace, byField: _byField };
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Every policy-broadcast entry that fans out to the given workspace. */
export function policiesForWorkspace(
  workspace: DownstreamWorkspace,
): ReadonlyArray<PolicyBroadcast> {
  return indexes().byWorkspace.get(workspace) ?? [];
}

/** The broadcast entry (if any) for a given VenueLogistics field. */
export function broadcastForField(
  field: keyof VenueLogistics,
): PolicyBroadcast | undefined {
  return indexes().byField.get(field);
}

/** True if a VenueLogistics field broadcasts to ≥1 downstream workspace. */
export function fieldBroadcasts(field: keyof VenueLogistics): boolean {
  return indexes().byField.has(field);
}

// ── Restriction helpers ────────────────────────────────────────────────────
// VenueLogistics.restrictions is a `string[]`. Downstream workspaces want
// to ask "is open flame allowed at this venue?" — these helpers normalise
// the array to a typed set and answer those questions.

export function parseRestrictions(
  raw: ReadonlyArray<string>,
): ReadonlySet<RestrictionTag> {
  const out = new Set<RestrictionTag>();
  for (const r of raw) {
    if (KNOWN_RESTRICTIONS.has(r)) {
      out.add(r as RestrictionTag);
    }
  }
  return out;
}

export function isRestricted(
  raw: ReadonlyArray<string>,
  tag: RestrictionTag,
): boolean {
  return parseRestrictions(raw).has(tag);
}

// ── Read with defaults ────────────────────────────────────────────────────
// Helper for downstream consumers: returns the policy value for a field,
// or null when the venue logistics blob hasn't been filled in. Centralising
// the null-guard prevents 6 different workspaces from each implementing
// "if (!venue.logistics?.field) return null" in slightly-different ways.

export function readPolicy<K extends keyof VenueLogistics>(
  logistics: VenueLogistics | null | undefined,
  field: K,
): VenueLogistics[K] | null {
  if (!logistics) return null;
  const value = logistics[field];
  // Empty strings = unset for free-form fields. Empty arrays = unset for
  // list fields. Boolean false / numeric 0 are valid values, never elided.
  if (typeof value === "string" && value.trim() === "") return null;
  if (Array.isArray(value) && value.length === 0) {
    return value as VenueLogistics[K];
  }
  return value;
}
