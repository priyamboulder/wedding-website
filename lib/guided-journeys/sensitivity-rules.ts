// ── Cross-category sensitivity rules ────────────────────────────────────────
// Section 7 of the cross-category refinement pass codifies how Build
// journeys treat sensitive fields — medical needs, deceased relatives,
// family dynamics, heirloom provenance. The rules:
//
//   1. Planner-only rendering OR explicit sharing-consent UI
//   2. Severity-aware UI treatment (red flag for medical, soft note for deceased)
//   3. Exclusion from default exports unless a toggle is enabled
//
// Per-category modules (e.g. jewelry-build-privacy.ts) keep their domain-
// specific privacy logic. This module gives those modules — and every
// future Build — the cross-cutting primitives so the platform behaves
// consistently regardless of category.

// ── Viewer roles ──────────────────────────────────────────────────────────
// Canonical viewer-role union. Every category that uses planner-side
// privacy gating should converge on this taxonomy; jewelry-build-privacy.ts
// already uses an aligned shape.

export type ViewerRole =
  | "couple"
  | "planner"
  | "stylist"
  | "vendor"
  | "family";

// ── Sensitivity domains ───────────────────────────────────────────────────
// What kind of sensitivity does a field carry? Each domain has different
// implications for redaction, severity, and consent.

export type SensitivityDomain =
  // Medical: allergies, severe reactions, mental health. Highest treatment.
  | "medical"
  // Deceased family member references (Late prefix, In Loving Memory).
  | "deceased"
  // Family dynamics: in-flux discussions, contested ownership, side rivalry.
  | "family_dynamics"
  // Heirloom provenance: not as severe as family_dynamics but still
  // requires care — older relatives often guard the story carefully.
  | "heirloom_provenance";

// ── Severity ──────────────────────────────────────────────────────────────
// Drives UI treatment. `critical` reserved for fields that MUST surface to
// the right people (medical_must_avoid). `caution` is a soft red flag.
// `info` is just metadata — render in a muted treatment.

export type SensitivitySeverity = "info" | "caution" | "critical";

export const SEVERITY_BY_DOMAIN: Record<SensitivityDomain, SensitivitySeverity> = {
  medical: "critical",
  deceased: "info",
  family_dynamics: "caution",
  heirloom_provenance: "info",
};

// ── Field declaration ─────────────────────────────────────────────────────
// Sensitive fields are declared at the call site rather than in a central
// schema — co-locating with the field's domain logic keeps it visible to
// the developer touching the code. A SensitiveField bundles everything
// the rule engine needs to make decisions without coupling to the
// underlying form-data shape.

export interface SensitiveField<TValue = unknown> {
  domain: SensitivityDomain;
  // Optional override of the per-domain default severity. Useful when a
  // single domain has gradations (e.g. deceased member with photo
  // acknowledgment is more visible than a Late prefix in a guest list).
  severity?: SensitivitySeverity;
  // The field value. Generic so callers don't have to box.
  value: TValue;
  // If true, the couple has explicitly opted in to including this field in
  // shareable artifacts (PDFs, vendor packets, share links). Default off.
  shareConsent?: boolean;
}

export function effectiveSeverity<T>(field: SensitiveField<T>): SensitivitySeverity {
  return field.severity ?? SEVERITY_BY_DOMAIN[field.domain];
}

// ── Visibility decisions ──────────────────────────────────────────────────
// The default visibility matrix codifies section 7 rule (1):
//
//   • medical → planner + couple always; vendor only with shareConsent.
//   • deceased → couple + planner + family; vendor only with shareConsent.
//   • family_dynamics → couple + planner. Stylist/vendor never (full stop).
//   • heirloom_provenance → couple + planner + stylist; vendor with consent.
//
// Couples can read what they entered; planners need every signal to do
// their job; stylists need wardrobe-and-jewelry context but not the
// negotiation backstory; vendors only see what the couple deliberately
// shared. Family viewers (e.g. a sibling with workspace access) can see
// most info that doesn't constitute a planning-side note.

const DEFAULT_VISIBILITY: Record<SensitivityDomain, Record<ViewerRole, boolean>> = {
  medical: {
    couple: true,
    planner: true,
    family: false,
    stylist: false,
    vendor: false, // gated on shareConsent
  },
  deceased: {
    couple: true,
    planner: true,
    family: true,
    stylist: false,
    vendor: false, // gated on shareConsent
  },
  family_dynamics: {
    couple: true,
    planner: true,
    family: false,
    stylist: false,
    vendor: false,
  },
  heirloom_provenance: {
    couple: true,
    planner: true,
    family: true,
    stylist: true,
    vendor: false, // gated on shareConsent
  },
};

// Domains where shareConsent CAN unlock vendor-side visibility.
const CONSENT_UNLOCKS_VENDOR: ReadonlySet<SensitivityDomain> = new Set([
  "medical",
  "deceased",
  "heirloom_provenance",
]);

export function isSensitiveFieldVisible<T>(
  field: SensitiveField<T>,
  viewer: ViewerRole,
): boolean {
  const allowed = DEFAULT_VISIBILITY[field.domain][viewer];
  if (allowed) return true;
  if (
    viewer === "vendor" &&
    field.shareConsent &&
    CONSENT_UNLOCKS_VENDOR.has(field.domain)
  ) {
    return true;
  }
  return false;
}

// ── Export-context decisions ──────────────────────────────────────────────
// Section 7 rule (3): exclusion from default exports unless a toggle is
// enabled. Export context is "what kind of artifact is being produced?":
//
//   • internal: planner-side handoff packets — show everything.
//   • couple_facing: couple-side PDFs (e.g. "your wedding plan summary").
//   • vendor_facing: caterer/HMUA/etc. packets. Honour shareConsent.
//   • public: ceremony programs, signage, anything guests see. Strictest.

export type ExportContext =
  | "internal"
  | "couple_facing"
  | "vendor_facing"
  | "public";

export function shouldIncludeInExport<T>(
  field: SensitiveField<T>,
  context: ExportContext,
): boolean {
  switch (context) {
    case "internal":
      return true;
    case "couple_facing":
      // Couples can read everything they entered.
      return true;
    case "vendor_facing":
      // Honour shareConsent. Without it, exclude.
      return Boolean(field.shareConsent);
    case "public":
      // Public surfaces never include sensitive material by default. The
      // ceremony program's "In Loving Memory" section is the lone exception
      // — that one is opt-in by the couple at the per-record level via
      // shareConsent, not a class-wide rule here.
      return Boolean(field.shareConsent && field.domain === "deceased");
  }
}

// ── UI tokens ─────────────────────────────────────────────────────────────
// Severity-driven color hints for badge / icon rendering. Intentionally
// referential (named tokens) rather than hex literals — components import
// the design-system palette and look these up.

export interface SeverityUiToken {
  // Token name from the design system (consumer maps to actual hex).
  badgeColorToken: "muted" | "amber" | "rose";
  icon: "info" | "alert-triangle" | "alert-octagon";
  ariaLabel: string;
}

export function getSeverityUiToken(
  severity: SensitivitySeverity,
): SeverityUiToken {
  switch (severity) {
    case "info":
      return {
        badgeColorToken: "muted",
        icon: "info",
        ariaLabel: "Informational note",
      };
    case "caution":
      return {
        badgeColorToken: "amber",
        icon: "alert-triangle",
        ariaLabel: "Sensitive — handle with care",
      };
    case "critical":
      return {
        badgeColorToken: "rose",
        icon: "alert-octagon",
        ariaLabel: "Critical — must surface to the right people",
      };
  }
}

// ── Convenience: bulk filter ──────────────────────────────────────────────
// Common pattern: an array of records, each with a sensitive field. Filter
// to only the records visible to a given viewer.

export function filterVisibleForViewer<TRecord, TField>(
  records: ReadonlyArray<TRecord>,
  pickField: (r: TRecord) => SensitiveField<TField>,
  viewer: ViewerRole,
): TRecord[] {
  return records.filter((r) => isSensitiveFieldVisible(pickField(r), viewer));
}
