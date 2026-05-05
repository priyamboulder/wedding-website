// ── Jewelry Build privacy model ───────────────────────────────────────────
// Heirloom-specific privacy controls. This is the most important non-
// obvious thing in the Build journey: a leaked "Nani still deciding —
// don't share with vendors" note in a vendor-facing export could rupture
// a real family relationship.
//
// Every couple-facing or vendor-facing surface that touches Build session
// 3 (family_heirlooms) MUST run candidate items through `filterHeirloomsForViewer`
// and individual fields through `redactHeirloomForViewer` before render.

import type {
  FamilyHeirloom,
  FamilyHeirloomsFormData,
  HeirloomPrivacyLevel,
} from "./jewelry-build";

// ── Viewer roles ──────────────────────────────────────────────────────────
// The Jewelry workspace already distinguishes between couple, planner,
// stylist, and external vendor surfaces. These are the four viewers we
// gate on.

export type HeirloomViewerRole =
  | "couple"
  | "planner"
  | "stylist"
  | "vendor";

// ── Visibility matrix ────────────────────────────────────────────────────
// Boolean: can this viewer see an heirloom item with this privacy_level?
// `family_only` is the strictest — only the couple sees it, full stop.

const VISIBILITY: Record<HeirloomPrivacyLevel, Record<HeirloomViewerRole, boolean>> = {
  planner_stylist_only: {
    couple: true,
    planner: true,
    stylist: true,
    vendor: false,
  },
  planner_only: {
    couple: true,
    planner: true,
    stylist: false,
    vendor: false,
  },
  family_only: {
    couple: true,
    planner: false,
    stylist: false,
    vendor: false,
  },
};

export function canViewHeirloom(
  heirloom: Pick<FamilyHeirloom, "privacy_level">,
  viewer: HeirloomViewerRole,
): boolean {
  return VISIBILITY[heirloom.privacy_level][viewer];
}

export function filterHeirloomsForViewer(
  heirlooms: ReadonlyArray<FamilyHeirloom>,
  viewer: HeirloomViewerRole,
): FamilyHeirloom[] {
  return heirlooms.filter((h) => canViewHeirloom(h, viewer));
}

// ── Field-level redaction ────────────────────────────────────────────────
// Even when an heirloom is visible, certain fields are still planner-only.
// Notably: `flux_note` and the session-level `cross_side_dynamics` field
// are *always* planner-only regardless of the privacy_level. They exist
// specifically for planner coordination during sensitive family
// conversations and must never appear in any couple-facing or stylist-
// facing surface.

const PLANNER_ONLY_HEIRLOOM_FIELDS = [
  "flux_note",
] as const satisfies ReadonlyArray<keyof FamilyHeirloom>;

export type RedactedHeirloom = Omit<
  FamilyHeirloom,
  (typeof PLANNER_ONLY_HEIRLOOM_FIELDS)[number]
> & {
  flux_note?: string;
};

export function redactHeirloomForViewer(
  heirloom: FamilyHeirloom,
  viewer: HeirloomViewerRole,
): RedactedHeirloom {
  if (viewer === "planner") return heirloom;
  const { flux_note: _flux, ...rest } = heirloom;
  void _flux;
  return rest;
}

// ── Couple-facing exports ────────────────────────────────────────────────
// Couple-facing exports (PDFs, share links, planner handoff packets) hide
// items where `is_confirmed_with_lender` is false — these conversations
// are still in flux and shouldn't surface in any external-facing artefact.

export function selectCoupleFacingHeirlooms(
  heirlooms: ReadonlyArray<FamilyHeirloom>,
): FamilyHeirloom[] {
  return heirlooms.filter(
    (h) => h.is_confirmed_with_lender && canViewHeirloom(h, "couple"),
  );
}

// ── Session-level shape filter ───────────────────────────────────────────
// Returns a viewer-safe version of the FamilyHeirloomsFormData blob.
// `cross_side_dynamics` is always planner-only.

export interface RedactedFamilyHeirloomsFormData {
  heirlooms: RedactedHeirloom[];
  cross_side_dynamics?: string;
  computed?: FamilyHeirloomsFormData["computed"];
}

export function redactFamilyHeirloomsFormData(
  data: FamilyHeirloomsFormData,
  viewer: HeirloomViewerRole,
): RedactedFamilyHeirloomsFormData {
  const heirlooms = filterHeirloomsForViewer(data.heirlooms, viewer).map((h) =>
    redactHeirloomForViewer(h, viewer),
  );
  return {
    heirlooms,
    cross_side_dynamics:
      viewer === "planner" ? data.cross_side_dynamics : undefined,
    computed: data.computed,
  };
}

// ── Audit / debugging helper ─────────────────────────────────────────────
// Surfaces a one-line summary of the privacy state for an heirloom — used
// in planner-facing diagnostics, never in vendor-facing surfaces.

export function describeHeirloomPrivacy(heirloom: FamilyHeirloom): string {
  const labels: Record<HeirloomPrivacyLevel, string> = {
    planner_stylist_only: "Planner + stylist",
    planner_only: "Planner only",
    family_only: "Family only",
  };
  const flux = heirloom.flux_note ? " · in flux" : "";
  const unconfirmed = heirloom.is_confirmed_with_lender
    ? ""
    : " · not confirmed";
  return `${labels[heirloom.privacy_level]}${flux}${unconfirmed}`;
}
