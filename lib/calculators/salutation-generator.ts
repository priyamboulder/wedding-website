// ── Salutation generator ───────────────────────────────────────────────────
// Envelope addressing is one of the highest-stakes "small" details in
// wedding stationery. Get a couple's salutation wrong and they remember it
// 30 years later. Indian conventions (Shri/Shrimati, family-name elders,
// joint vs. plural addressing) interleave with Western ones (Mr./Mrs./Ms./
// Mx., honorifics like Dr./The Hon.), and couples mix-and-match per guest.
//
// This module is the single source of truth for those rules. It's a pure
// function used by Stationery Build's address-the-envelopes session, plus
// Hair & Makeup's chair list, Travel's room-block manifest, and the
// Photography group-photo card. Domain-specific overrides should live at
// the call site; this module covers the defaults.

// ── Input shape ────────────────────────────────────────────────────────────

export type SalutationStyle =
  // "Mr. and Mrs. Sharma" — Western family-style, one envelope per couple.
  | "western_traditional"
  // "Mr. Arjun Sharma & Ms. Priya Mehta" — Western modern, both names.
  | "western_modern"
  // "Shri & Shrimati Sharma" — Hindi traditional, family-name only.
  | "indian_traditional"
  // "Shri Arjun Sharma & Shrimati Priya Mehta" — Hindi traditional, both
  // names. The most common choice in modern Indian invitations.
  | "indian_modern"
  // Single guest, no joint addressing needed.
  | "individual"
  // Family unit: "The Sharma Family" or "The Sharma family" — used when
  // the invitation goes to a household with kids/extended family.
  | "family";

export type Honorific =
  // Western
  | "mr"
  | "mrs"
  | "ms"
  | "miss"
  | "mx"
  | "dr"
  | "prof"
  | "hon"
  | "rev"
  | "captain"
  | "colonel"
  // Indian / South Asian
  | "shri"
  | "shrimati"
  | "kumari"
  | "smt"
  | "sri";

export interface PersonName {
  honorific?: Honorific;
  // Couples often prefer first names that differ from the legal record;
  // we honour what the couple typed without lookup.
  first_name?: string;
  // Middle name optional but common in South Indian conventions.
  middle_name?: string;
  // Last name / family name. Required for traditional joint salutations.
  last_name?: string;
  // Suffix like "Jr.", "Sr.", "PhD", "MBBS" — preserved as-typed.
  suffix?: string;
}

export interface SalutationInput {
  primary: PersonName;
  partner?: PersonName;
  style: SalutationStyle;
  // For "family" style — overrides last_name when the family chooses a
  // hyphenated or non-shared surname.
  family_name_override?: string;
  // Number of children when style === "family". Affects the suffix:
  // "and family" vs. "and your family".
  family_member_count?: number;
}

// ── Honorific labels ──────────────────────────────────────────────────────
// Default English-script labels. Stationery Build's MultilingualTypesetter
// will swap in Devanagari / Gurmukhi / etc. variants when the invitation
// language calls for them.

const HONORIFIC_LABEL: Record<Honorific, string> = {
  mr: "Mr.",
  mrs: "Mrs.",
  ms: "Ms.",
  miss: "Miss",
  mx: "Mx.",
  dr: "Dr.",
  prof: "Prof.",
  hon: "The Hon.",
  rev: "Rev.",
  captain: "Capt.",
  colonel: "Col.",
  shri: "Shri",
  shrimati: "Shrimati",
  kumari: "Kumari",
  smt: "Smt.",
  sri: "Sri",
};

// ── Public API ─────────────────────────────────────────────────────────────

export function generateSalutation(input: SalutationInput): string {
  switch (input.style) {
    case "individual":
      return formatIndividual(input.primary);
    case "family":
      return formatFamily(input);
    case "western_traditional":
      return formatWesternTraditional(input);
    case "western_modern":
      return formatWesternModern(input);
    case "indian_traditional":
      return formatIndianTraditional(input);
    case "indian_modern":
      return formatIndianModern(input);
  }
}

// ── Individual ────────────────────────────────────────────────────────────

function formatIndividual(p: PersonName): string {
  const honorific = p.honorific ? HONORIFIC_LABEL[p.honorific] : "";
  const fullName = [p.first_name, p.middle_name, p.last_name]
    .filter(Boolean)
    .join(" ");
  const suffix = p.suffix ? `, ${p.suffix}` : "";
  return [honorific, fullName].filter(Boolean).join(" ").trim() + suffix;
}

// ── Family ────────────────────────────────────────────────────────────────

function formatFamily(input: SalutationInput): string {
  const family = input.family_name_override ?? input.primary.last_name ?? "";
  if (!family) {
    // Fall back to individual when we can't pin a family name.
    return formatIndividual(input.primary);
  }
  const count = input.family_member_count ?? 0;
  // Convention: "The Sharma Family" reads warmly; "The Sharmas" is too
  // casual for invitation envelopes. Keep capital F.
  const suffix = count >= 4 ? "and Family" : "Family";
  return `The ${family} ${suffix}`;
}

// ── Western traditional ───────────────────────────────────────────────────
// "Mr. and Mrs. Arjun Sharma". Single envelope, primary's first name.

function formatWesternTraditional(input: SalutationInput): string {
  const p = input.primary;
  const partner = input.partner;
  const family = p.last_name ?? "";
  const primaryHon = p.honorific ?? defaultWesternHon(p);
  const partnerHon = partner?.honorific ?? defaultWesternPartnerHon(partner);
  const honPair = [HONORIFIC_LABEL[primaryHon], "and", HONORIFIC_LABEL[partnerHon]].join(" ");
  const namePart = p.first_name && family ? `${p.first_name} ${family}` : family;
  return `${honPair} ${namePart}`.trim();
}

// ── Western modern ────────────────────────────────────────────────────────
// "Mr. Arjun Sharma & Ms. Priya Mehta" — both names spelled.

function formatWesternModern(input: SalutationInput): string {
  const a = formatIndividual(input.primary);
  if (!input.partner) return a;
  const b = formatIndividual(input.partner);
  return `${a} & ${b}`;
}

// ── Indian traditional ────────────────────────────────────────────────────
// "Shri & Shrimati Sharma" — honorifics + family name. Most formal.

function formatIndianTraditional(input: SalutationInput): string {
  const family = input.primary.last_name ?? "";
  if (!family) return formatIndianModern(input);
  const primaryHon =
    HONORIFIC_LABEL[input.primary.honorific ?? "shri"];
  const partnerHon = input.partner
    ? HONORIFIC_LABEL[input.partner.honorific ?? "shrimati"]
    : "";
  if (!input.partner) {
    return `${primaryHon} ${family}`.trim();
  }
  return `${primaryHon} & ${partnerHon} ${family}`.trim();
}

// ── Indian modern ─────────────────────────────────────────────────────────
// "Shri Arjun Sharma & Shrimati Priya Mehta" — both names spelled.

function formatIndianModern(input: SalutationInput): string {
  const a = formatIndianIndividual(input.primary, "shri");
  if (!input.partner) return a;
  const b = formatIndianIndividual(input.partner, "shrimati");
  return `${a} & ${b}`;
}

function formatIndianIndividual(p: PersonName, defaultHon: Honorific): string {
  const honorific = HONORIFIC_LABEL[p.honorific ?? defaultHon];
  const fullName = [p.first_name, p.middle_name, p.last_name]
    .filter(Boolean)
    .join(" ");
  return `${honorific} ${fullName}`.trim();
}

// ── Default-honorific heuristics ──────────────────────────────────────────
// When the couple hasn't picked an honorific and the style requires one,
// default to gendered conventions only when explicitly requested. Avoid
// guessing from name — names map to gender unreliably across cultures.

function defaultWesternHon(_p: PersonName): Honorific {
  return "mr";
}

function defaultWesternPartnerHon(p?: PersonName): Honorific {
  // Pre-2010 default was "mrs"; post-2010 weddings increasingly default to
  // "ms" so the call site can override. Keep "mrs" here for traditional
  // style; modern style uses formatWesternModern which renders both names.
  if (!p) return "mrs";
  return "mrs";
}

// ── Utility: bulk formatting ──────────────────────────────────────────────
// Stationery Build's address-the-envelopes session feeds an entire guest
// list through the generator. Wrap the loop here so call sites stay tidy.

export function generateSalutationBatch(
  inputs: ReadonlyArray<SalutationInput>,
): string[] {
  return inputs.map(generateSalutation);
}
