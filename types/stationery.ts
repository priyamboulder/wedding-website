// ── Stationery & Invitations data model ───────────────────────────────────
// Stationery is a cohesive communication system for a multi-event Indian
// wedding: identity (palette/typography/motif/foil) → suite (every piece)
// → content per piece → print matrix (who gets what) → timeline → docs.
// Each type below carries one slice of that workflow.

export type StationerySuiteSection =
  | "pre_wedding"
  | "day_of"
  | "post_wedding";

// Canonical paper-good kinds. `custom` is the escape hatch for anything
// outside the catalogue (couples inevitably add their own).
export type StationerySuiteKind =
  // Pre-wedding
  | "save_the_date"
  | "main_invitation"
  | "rsvp_card"
  | "details_card"
  | "event_insert"
  | "map_card"
  | "accommodation_card"
  | "envelope_outer"
  | "envelope_inner"
  | "enclosure"
  // Day-of
  | "ceremony_program"
  | "menu_card"
  | "place_card"
  | "table_number"
  | "signage"
  | "favor_tag"
  | "welcome_bag_insert"
  | "seating_chart"
  // Post-wedding
  | "thank_you_card"
  | "at_home_card"
  // Anything the catalogue doesn't cover.
  | "custom";

export type StationeryItemStatus =
  | "not_started"
  | "in_design"
  | "proof_review"
  | "approved"
  | "in_production"
  | "printed"
  | "shipped";

export type StationeryPrintMethod =
  | "letterpress"
  | "foil"
  | "flat_premium"
  | "digital"
  | "hybrid";

export const STATIONERY_PRINT_METHOD_LABEL: Record<
  StationeryPrintMethod,
  string
> = {
  letterpress: "Letterpress on cotton",
  foil: "Foil-stamped",
  flat_premium: "Flat printed · premium paper",
  digital: "Digital / e-invite",
  hybrid: "Hybrid — physical + digital",
};

// Which WeddingEvent the item attaches to. Free-form string to let users
// name Haldi/Mehendi/etc. events without importing events-store here.
export type StationeryEventTag =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception"
  | "welcome"
  | "brunch";

export const STATIONERY_EVENT_LABEL: Record<StationeryEventTag, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
  welcome: "Welcome",
  brunch: "Post-wedding brunch",
};

export interface StationerySuiteItem {
  id: string;
  section: StationerySuiteSection;
  kind: StationerySuiteKind;
  // Display name: "Main Invitation Card" / "Mehendi Insert" / "Welcome Sign".
  name: string;
  description?: string;
  // Per-event attachment (mostly for event inserts and day-of pieces).
  event?: StationeryEventTag;
  // Is this piece turned on in the suite? Off means we're tracking that it
  // was considered but not commissioned.
  enabled: boolean;
  // "Printed + digital", "Digital only", "Printed insert", etc. Free-form
  // label from the spec's suite overview.
  delivery_mode?: string;
  // Quantity the couple wants to print. Calculator suggests this; user can
  // override.
  quantity: number;
  // Buffer percent on top of quantity (5–10% is typical).
  buffer_pct: number;
  // Unit cost in rupees. May be zero until a vendor quote arrives.
  cost_unit: number;
  status: StationeryItemStatus;
  notes?: string;
  // When true the item is couple-added rather than from the canonical
  // catalogue. Lets us give custom items an "edit name" affordance.
  custom?: boolean;
}

// ── Visual identity system ────────────────────────────────────────────────
// Unlike other categories, stationery has to be cohesive across 5–8 pieces
// — palette, typography, motif, and finishing travel together as a brand
// guide the designer sees on day one.

export type StationeryTypographyDirection =
  | "classic_serif"
  | "modern_sans"
  | "script_calligraphic"
  | "mixed";

export const STATIONERY_TYPOGRAPHY_LABEL: Record<
  StationeryTypographyDirection,
  string
> = {
  classic_serif: "Classic serif — traditional, elegant",
  modern_sans: "Modern sans-serif — clean, contemporary",
  script_calligraphic: "Script / calligraphic — romantic, ornate",
  mixed: "Mixed — script headlines, clean body",
};

export type StationeryMotifDirection =
  | "paisley_traditional"
  | "floral_botanical"
  | "geometric_modern"
  | "illustrated_custom"
  | "type_only";

export const STATIONERY_MOTIF_LABEL: Record<
  StationeryMotifDirection,
  string
> = {
  paisley_traditional: "Paisley & traditional Indian",
  floral_botanical: "Floral & botanical",
  geometric_modern: "Geometric & modern",
  illustrated_custom: "Illustrated & custom",
  type_only: "None — type-only design",
};

export type StationeryFoilOption =
  | "gold_foil"
  | "letterpress"
  | "embossing"
  | "wax_seal"
  | "flat_print";

export const STATIONERY_FOIL_LABEL: Record<StationeryFoilOption, string> = {
  gold_foil: "Gold foil",
  letterpress: "Letterpress",
  embossing: "Embossing",
  wax_seal: "Wax seal",
  flat_print: "Flat print",
};

export interface StationerySwatch {
  hex: string;
  name: string;
}

// Compact "type voice" used by the discovery-first Vision & Mood block and
// guided Session 1. Lives alongside the deeper StationeryTypographyDirection
// so the legacy identity panel keeps working.
export type StationeryTypographyVibe =
  | "classic_serif"
  | "modern_sans"
  | "calligraphic"
  | "mix";

export const STATIONERY_TYPOGRAPHY_VIBE_LABEL: Record<
  StationeryTypographyVibe,
  string
> = {
  classic_serif: "Classic serif",
  modern_sans: "Modern sans",
  calligraphic: "Calligraphic",
  mix: "Mix",
};

export const STATIONERY_TYPOGRAPHY_VIBE_DESCRIPTION: Record<
  StationeryTypographyVibe,
  string
> = {
  classic_serif: "Traditional, elegant — serif headlines and body.",
  modern_sans: "Clean, contemporary — sans-serif throughout.",
  calligraphic: "Romantic, ornate — script lettering in the spotlight.",
  mix: "Script headlines paired with a clean body face.",
};

export const STATIONERY_SCRIPT_LANGUAGES = [
  "english",
  "hindi",
  "gujarati",
  "tamil",
  "punjabi",
  "urdu",
  "telugu",
  "marathi",
] as const;

export type StationeryScriptLanguage =
  (typeof STATIONERY_SCRIPT_LANGUAGES)[number];

export const STATIONERY_SCRIPT_LANGUAGE_LABEL: Record<string, string> = {
  english: "English",
  hindi: "Hindi",
  gujarati: "Gujarati",
  tamil: "Tamil",
  punjabi: "Punjabi",
  urdu: "Urdu",
  telugu: "Telugu",
  marathi: "Marathi",
};

export const STATIONERY_MOTIF_TAGS = [
  "paisley",
  "lotus",
  "elephant",
  "peacock",
  "geometric",
  "floral",
  "mandala",
  "none",
] as const;

export type StationeryMotifTag = (typeof STATIONERY_MOTIF_TAGS)[number];

export const STATIONERY_MOTIF_TAG_LABEL: Record<string, string> = {
  paisley: "Paisley",
  lotus: "Lotus",
  elephant: "Elephant",
  peacock: "Peacock",
  geometric: "Geometric",
  floral: "Floral",
  mandala: "Mandala",
  none: "None",
};

export interface StationeryVisualIdentity {
  // 3–5 swatches — either imported from Décor or set independently.
  palette: StationerySwatch[];
  typography: StationeryTypographyDirection;
  motif: StationeryMotifDirection;
  // Multi-select: any combination of foil/finishing treatments.
  finishing: StationeryFoilOption[];
  // Free-form brief — "the feeling someone has when they open the envelope".
  brief?: string;
  // Discovery-first additions — the "type voice", language, and motif tags
  // surfaced in Vision & Mood so guided + manual modes share the same
  // underlying inputs.
  typographyVibe?: StationeryTypographyVibe;
  bilingual?: boolean;
  scriptLanguages?: string[];
  motifTags?: string[];
}

// ── Per-piece content ─────────────────────────────────────────────────────
// Every piece in the suite has text — couple line, family line, venue,
// dress code, translations. Content is tracked per-item so the designer can
// read off finalized wording without chasing down emails.

export interface StationeryPieceContent {
  // Keyed by suite item id.
  item_id: string;
  couple_line?: string;
  family_line?: string;
  host_line?: string;
  main_text?: string;
  // Second-language translation (Hindi, Gujarati, Tamil, etc.).
  translation?: string;
  translation_language?: string;
  event_date?: string;
  venue_name?: string;
  venue_address?: string;
  dress_code?: string;
  notes?: string;
}

// ── Production timeline milestones ────────────────────────────────────────
// Month-based checklist from the spec. Each milestone has a stable id the
// store keys on; the seed lists the canonical ordered sequence.

export type StationeryTimelineBucket =
  | "6_months_out"
  | "5_months_out"
  | "4_months_out"
  | "3_months_out"
  | "2_months_out"
  | "1_month_out"
  | "1_week_out"
  | "post_wedding";

export const STATIONERY_TIMELINE_BUCKET_LABEL: Record<
  StationeryTimelineBucket,
  string
> = {
  "6_months_out": "6 months out",
  "5_months_out": "5 months out",
  "4_months_out": "4 months out",
  "3_months_out": "3 months out",
  "2_months_out": "2 months out",
  "1_month_out": "1 month out",
  "1_week_out": "1 week out",
  post_wedding: "Post-wedding",
};

export interface StationeryTimelineMilestone {
  id: string;
  bucket: StationeryTimelineBucket;
  label: string;
}

// ── Documents binder ──────────────────────────────────────────────────────
// Proof PDFs, printer quotes, content drafts, print specs, shipping
// confirmations. URL-based so Drive / Dropbox / CDN links all work.

export type StationeryDocumentKind =
  | "proof"
  | "quote"
  | "content_draft"
  | "print_spec"
  | "shipping"
  | "other";

export const STATIONERY_DOCUMENT_KIND_LABEL: Record<
  StationeryDocumentKind,
  string
> = {
  proof: "Proof",
  quote: "Quote",
  content_draft: "Content draft",
  print_spec: "Print spec",
  shipping: "Shipping",
  other: "Other",
};

export interface StationeryDocument {
  id: string;
  kind: StationeryDocumentKind;
  title: string;
  url: string;
  note?: string;
  created_at: string;
  // Optional link back to a suite item (e.g. a proof for the main invite).
  item_id?: string | null;
}

// ── Guest print matrix (tiered who-gets-what planning) ────────────────────
// Couples hand the same wedding invitation to three audiences at once:
// immediate family (full printed suite), distant cousins/colleagues
// (digital only), and everyone in between. The matrix captures those
// per-tier choices so the Suite Builder's quantity totals are grounded in
// real decisions, not whole-list guesses.

// Fixed set of pieces the matrix covers. Kept narrow so the grid stays
// scannable — event-specific inserts roll up into `event_insert`.
export const STATIONERY_MATRIX_PIECES = [
  "save_the_date",
  "main_invitation",
  "event_insert",
  "menu_card",
  "ceremony_program",
] as const;

export type StationeryMatrixPiece = (typeof STATIONERY_MATRIX_PIECES)[number];

export const STATIONERY_MATRIX_PIECE_LABEL: Record<
  StationeryMatrixPiece,
  string
> = {
  save_the_date: "Save the Date",
  main_invitation: "Main Invite",
  event_insert: "Event Cards",
  menu_card: "Menu",
  ceremony_program: "Program",
};

export type StationeryMatrixMode = "printed" | "digital" | "omit";

export const STATIONERY_MATRIX_MODE_LABEL: Record<
  StationeryMatrixMode,
  string
> = {
  printed: "Printed",
  digital: "Digital",
  omit: "Skip",
};

export interface StationeryGuestTier {
  id: string;
  label: string;
  // Household count for this tier — the quantity multiplier for printed
  // pieces (we send one physical suite per household, not per guest).
  households: number;
  // Optional description the couple jots down when the tier label isn't
  // self-explanatory ("Priya's med-school friends, local only").
  description?: string;
  sort_order: number;
}

// Flat cell storage keyed by `${tierId}:${piece}`. A missing cell implies
// the default mode — so removing a tier or renaming a piece never leaves
// orphan rows behind.
export type StationeryMatrixCells = Record<string, StationeryMatrixMode>;

export function matrixCellKey(
  tierId: string,
  piece: StationeryMatrixPiece,
): string {
  return `${tierId}:${piece}`;
}

// ── Palette source (shared with Décor) ────────────────────────────────────

export type StationeryPaletteSource = "wedding" | "independent";

// ── Item status rendering helpers ─────────────────────────────────────────

export const STATIONERY_ITEM_STATUS_LABEL: Record<
  StationeryItemStatus,
  string
> = {
  not_started: "Not started",
  in_design: "In design",
  proof_review: "Proof review",
  approved: "Approved",
  in_production: "In production",
  printed: "Printed",
  shipped: "Shipped / Delivered",
};

export const STATIONERY_ITEM_STATUS_ORDER: StationeryItemStatus[] = [
  "not_started",
  "in_design",
  "proof_review",
  "approved",
  "in_production",
  "printed",
  "shipped",
];

export const STATIONERY_SECTION_LABEL: Record<
  StationerySuiteSection,
  string
> = {
  pre_wedding: "Pre-wedding pieces",
  day_of: "Day-of pieces",
  post_wedding: "Post-wedding",
};

// ── Discovery-first workspace state ───────────────────────────────────────
// Added when the workspace moved from production-tool to discovery-led.
// Tracks the couple's emotional reactions rather than SKUs: which pieces
// they want in the suite, which samples they've requested, which paper
// stocks they want to feel, and the inspiration they keep coming back to.

export type StationerySuitePreference = "want" | "maybe" | "skip";

export type StationeryPaperTexture = "cotton" | "linen" | "vellum" | "shimmer";

export const STATIONERY_PAPER_TEXTURE_LABEL: Record<
  StationeryPaperTexture,
  string
> = {
  cotton: "Cotton · heavyweight",
  linen: "Linen · textured",
  vellum: "Vellum · translucent",
  shimmer: "Shimmer · pearl finish",
};

export const STATIONERY_PAPER_TEXTURE_DESCRIPTION: Record<
  StationeryPaperTexture,
  string
> = {
  cotton:
    "Thick, soft, takes letterpress beautifully. The heirloom choice — guests know it's serious before they read a word.",
  linen:
    "Woven texture with a quiet tooth. Warm under the fingers, subtle under the eye.",
  vellum:
    "Translucent overlay. Layers over a base card to show colour through softened edges.",
  shimmer:
    "Pearlescent finish that catches light at the edges. Modern-glamorous rather than ornate.",
};

export type StationerySampleRequestStatus =
  | "requested"
  | "received"
  | "reviewed";

export type StationerySampleReaction = "love" | "good" | "not_right" | null;

export interface StationerySampleRequest {
  id: string;
  vendor_id: string;
  vendor_name: string;
  status: StationerySampleRequestStatus;
  reaction: StationerySampleReaction;
  notes?: string;
  requested_at: string;
}

export interface StationeryInspirationEntry {
  id: string;
  text: string;
  created_at: string;
}

// Reference reactions (keyed by "scope:url") — captures Love / Not for us on
// both piece-level refs (scope = piece kind) and broader style refs (scope
// = theme). Stationery keeps its own reactions separate from the shared
// moodboard because "Love" here also means "seed my moodboard."
export type StationeryRefReaction = "love" | "not";

export type StationeryRefReactions = Record<string, StationeryRefReaction>;

// ── Suite detail panel (Suite Builder → slide-over) ───────────────────────
// Editorial catalogue that powers the rich detail panel when a couple
// clicks a suite card. Kept separate from StationerySuiteItem so the
// production fields (quantity, cost, status) a couple edits daily stay
// clean, while catalogue copy is sourced from seed + (later) planner edits.

// Coarser grouping used by the panel's event badge. "wedding_day" covers
// ceremony + reception day-of pieces; "pre_wedding" mirrors invitation
// suite; "post_wedding" covers thank-you flow.
export type StationerySuiteEventGroup =
  | "pre_wedding"
  | "wedding_day"
  | "post_wedding";

export interface StationerySuiteDetail {
  // Keyed back to StationerySuiteItem.id.
  item_id: string;
  // URL-friendly identifier used for deep-linking (?suite=save-the-date).
  slug: string;
  event_group: StationerySuiteEventGroup;
  // Short poetic-but-practical one-liner shown under the hero heading.
  tagline: string;
  // 1–2 paragraph editorial context. Supports basic markdown (**bold**,
  // *italic*, blank-line paragraph breaks).
  editorial_intro: string;
  // Single paragraph on why the piece matters — rendered as a pull-quote.
  why_it_matters: string;
  // 3–5 "notes from your planner" tips.
  pro_tips: string[];
  // 2–3 framed-positively mistakes to avoid.
  common_mistakes: string[];
  // e.g. "Ship 8–10 months before the wedding".
  timeline_guidance: string;
  // Optional — e.g. "1 per household, not per guest".
  typical_quantity_note?: string;
  // Introductory line above the inspiration gallery.
  inspiration_notes: string;
  // Starting price in paise (₹ × 100) for display. Optional.
  starting_price_cents?: number;
  // Pre-formatted label like "Starting from ₹180 per card".
  price_range_label?: string;
  // Upsell block at the bottom of the panel.
  upsell_headline: string;
  upsell_body: string;
  upsell_cta_label?: string;
  // Optional blog/resource cross-link.
  blog_post_url?: string;
  blog_post_title?: string;
  blog_post_excerpt?: string;
}

export interface StationerySuiteInspiration {
  id: string;
  item_id: string;
  image_url: string;
  caption?: string;
  // Photographer / designer attribution.
  credit?: string;
  style_tags: string[];
  sort_order: number;
}

// How an add-on relates to its parent item.
export type StationerySuiteAddonRelationship =
  | "pairs_well"
  | "often_added"
  | "upgrade";

export const STATIONERY_ADDON_RELATIONSHIP_LABEL: Record<
  StationerySuiteAddonRelationship,
  string
> = {
  pairs_well: "Pairs well with",
  often_added: "Most couples add",
  upgrade: "Worth upgrading to",
};

export interface StationerySuiteAddon {
  id: string;
  // The parent item this add-on is suggested alongside.
  item_id: string;
  // The item being cross-sold.
  addon_item_id: string;
  relationship: StationerySuiteAddonRelationship;
  recommendation_copy: string;
  sort_order: number;
}
