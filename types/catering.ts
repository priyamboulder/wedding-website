// ── Catering Menu Studio types ─────────────────────────────────────────────
// The Menu Studio rebuilds catering around three first-class entities —
// events, menu moments (arrival drinks / passed apps / mains / dessert /
// late-night), and dishes. Shape mirrors the Ananya project convention of
// polymorphic records persisted via Zustand + localStorage keyed by
// wedding_id. No backend.
//
// The existing catering tabs (vision, tasting, dietary, bar, event_menus,
// staffing, rentals) continue to work against WorkspaceItem — Menu Studio
// is additive, not a replacement, during the rebuild. A later increment
// can collapse vision + event_menus into the Menu Studio canvas.

// ── Shared scalars ─────────────────────────────────────────────────────────

export type DietaryFlag =
  | "vegetarian"
  | "vegan"
  | "jain"
  | "halal"
  | "kosher"
  | "gluten_free"
  | "nut_allergy"
  | "dairy_free"
  | "non_vegetarian"
  | "swaminarayan";

export const DIETARY_FLAGS: DietaryFlag[] = [
  "vegetarian",
  "vegan",
  "jain",
  "halal",
  "kosher",
  "gluten_free",
  "nut_allergy",
  "dairy_free",
  "non_vegetarian",
  "swaminarayan",
];

export const DIETARY_FLAG_LABEL: Record<DietaryFlag, string> = {
  vegetarian: "Veg",
  vegan: "Vegan",
  jain: "Jain",
  halal: "Halal",
  kosher: "Kosher",
  gluten_free: "GF",
  nut_allergy: "Nut-free",
  dairy_free: "DF",
  non_vegetarian: "Non-veg",
  swaminarayan: "Swami.",
};

// 0 = no heat, 4 = rajasthani-level. Kept coarse so couples without
// culinary vocabulary can still reason about it.
export type SpiceLevel = 0 | 1 | 2 | 3 | 4;

export type ServiceStyle =
  | "plated"
  | "buffet"
  | "stations"
  | "family_style"
  | "passed"
  | "thali";

export type EventSlug =
  | "welcome"
  | "pithi"
  | "mehendi"
  | "haldi"
  | "sangeet"
  | "baraat"
  | "ceremony"
  | "reception"
  | "brunch"
  | "other";

export type DishSource = "manual" | "ai" | "caterer";

// ── Entities ──────────────────────────────────────────────────────────────

// Catering-scoped view of a wedding event. The guest module (see
// app/guests/page.tsx) has its own thinner event seed — Menu Studio
// tracks the food-relevant metadata (cuisine direction, service style,
// vibe tags, guest count) on top of the shared slug/label/date so the
// two surfaces can reconcile later without collision.
export interface MenuEvent {
  id: string;
  wedding_id: string;
  slug: EventSlug;
  label: string;
  date: string;             // ISO yyyy-mm-dd
  start_time?: string;      // "18:30"
  end_time?: string;
  guest_count: number;
  vibe_tags: string[];      // free-form ("intimate", "backyard brunch", "300-guest gala")
  cuisine_direction: string; // "Gujarati thali", "South Indian brunch", "Global fusion"
  venue?: string;
  service_style: ServiceStyle;
  sort_order: number;
  icon?: string;            // emoji fallback (same as guests module)
}

// Service moments inside an event — the beats food is actually served at.
// Order matters (arrival → passed → mains → dessert → late-night).
export interface MenuMoment {
  id: string;
  event_id: string;
  name: string;             // "Arrival drinks", "Passed apps", "Main service"…
  order: number;
  time_window?: string;     // "6:30–7:15pm" display hint
  description?: string;
}

export interface Dish {
  id: string;
  moment_id: string;
  name: string;
  cuisine_tags: string[];
  region?: string;
  dietary_flags: DietaryFlag[];
  spice_level: SpiceLevel;
  description: string;
  why_note?: string;
  source: DishSource;
  caterer_id?: string;
  sort_order: number;
  // Collaboration fields — optional for backward compatibility.
  // added_by defaults to "urvashi" at read time if absent.
  added_by?: PartyId;
  state?: EntityState;       // undefined ≈ "approved" for legacy rows
}

// ── AI pending edits ──────────────────────────────────────────────────────
// The conversational menu-design flow never mutates the menu silently.
// It emits an edit diff; the couple accepts/rejects each one from the
// Intelligence panel. Once accepted, the edit is applied and archived.

export type PendingEditKind =
  | "add_dish"
  | "update_dish"
  | "remove_dish"
  | "add_moment"
  | "update_moment";

export type PendingEditStatus = "pending" | "accepted" | "rejected";

// Discriminated payload per kind. Keeping it on one interface (instead of
// a union) because the store is a generic record — the component that
// applies the edit narrows by kind at apply time.
export interface PendingEdit {
  id: string;
  event_id: string;
  kind: PendingEditKind;
  // For add_dish: a full Dish minus id + sort_order + moment_id may be
  // nested; for update/remove: dish_id + patch.
  payload: PendingEditPayload;
  reason: string;            // one sentence the couple sees on the card
  created_at: string;        // ISO
  status: PendingEditStatus;
  applied_id?: string;       // id of the created entity once accepted
}

// Narrow, explicit payload shapes so the applier is exhaustive.
export type PendingEditPayload =
  | {
      kind: "add_dish";
      moment_name: string;           // name-resolved at apply time to a moment id
      dish: Omit<Dish, "id" | "moment_id" | "sort_order">;
    }
  | {
      kind: "update_dish";
      dish_id: string;
      patch: Partial<Omit<Dish, "id" | "moment_id" | "sort_order" | "source">>;
    }
  | {
      kind: "remove_dish";
      dish_id: string;
    }
  | {
      kind: "add_moment";
      moment: Omit<MenuMoment, "id" | "event_id" | "order">;
    }
  | {
      kind: "update_moment";
      moment_id: string;
      patch: Partial<Omit<MenuMoment, "id" | "event_id" | "order">>;
    };

// ── Derived read-only shapes ──────────────────────────────────────────────
// Intelligence panel reads. Computed on the client — never persisted.

export interface MenuIntelligence {
  event_id: string;
  dish_count: number;
  moment_count: number;
  veg_ratio: number;            // 0..1
  dietary_coverage: Record<DietaryFlag, number>; // 0..1 per requirement
  spice_distribution: Record<SpiceLevel, number>; // count per level
  repeated_dishes: Array<{ dish_name: string; event_labels: string[] }>;
  flags: MenuFlag[];            // human-readable risks / gaps
}

export interface MenuFlag {
  severity: "info" | "warn" | "risk";
  message: string;
  // Which part of the menu the flag relates to, for deep-linking later.
  scope?: { moment_id?: string; dish_id?: string; dietary?: DietaryFlag };
}

// Per-event dietary totals from the guest list. Sourced from the guest
// module today as seed data; once the guests page is lifted into a store
// (tracked separately), this becomes a live selector off that store.
export interface EventDietaryTotals {
  event_id: string;
  total_guests: number;
  counts: Partial<Record<DietaryFlag, number>>;
}

// ── Collaboration layer ───────────────────────────────────────────────────
// The Catering surfaces are shared between the couple (Priya + Arjun),
// the planner (Urvashi), and the active vendor(s). Entities carry
// attribution (added_by), a lifecycle state, reactions, and comment
// threads so the UI reads like a shared desk rather than a status
// report.

// PartyId is either a couple/planner role or a vendor id from the
// vendors store. The parties registry in lib/catering/parties.ts
// resolves ids → display metadata.
export type PartyId = string;

export type PartyRole = "couple" | "planner" | "vendor";

export interface Party {
  id: PartyId;
  initials: string;
  display_name: string;
  role: PartyRole;
  tone: "saffron" | "rose" | "sage" | "ink";
}

// Generic lifecycle any collaborative entity can sit in.
export type EntityState =
  | "draft"
  | "in_debate"
  | "vendor_proposed"
  | "approved"
  | "parked"
  | "blocked"
  | "rejected";

export type ReactionKind = "up" | "down" | "question";

export type ReactionEntityKind =
  | "dish"
  | "proposal"
  | "assessment"
  | "tasting_dish"
  | "staff_slot"
  | "rental_item"
  | "cocktail"
  | "dietary_cell"
  | "action_item";

export interface Reaction {
  id: string;
  entity_id: string;
  entity_kind: ReactionEntityKind;
  party_id: PartyId;
  kind: ReactionKind;
  comment?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  entity_id: string;
  entity_kind: ReactionEntityKind;
  party_id: PartyId;
  body: string;
  created_at: string;
  resolved_at?: string;
}

// Open question targeted at a specific party. Rendered in the
// "Questions for the caterer" rail and per-caterer "Open questions".
export interface OpenQuestion {
  id: string;
  wedding_id: string;
  entity_kind: ReactionEntityKind | "caterer" | "event";
  entity_id: string;
  raised_by: PartyId;
  for_party: PartyId;
  body: string;
  created_at: string;
  answered_at?: string;
  answer?: string;
  answered_by?: PartyId;
}

// Per-caterer stated lean from each party, per event or overall.
export type Lean = "lean" | "undecided" | "against";

export interface PartyLean {
  id: string;
  wedding_id: string;
  party_id: PartyId;
  caterer_id: string;
  event_id?: string;
  lean: Lean;
  note?: string;
  updated_at: string;
}

// Per-attendee rating on a tasting dish — so each party's reaction
// to a bite is first-class. The single-score fields on TastingDish
// stay as a computed average for backward compatibility.
export interface AttendeeRating {
  id: string;
  tasting_dish_id: string;
  party_id: PartyId;
  appearance?: number;
  flavor?: number;
  portion?: number;
  temperature?: number;
  memorability?: number;
  note?: string;
}

// Upcoming tasting with prep checklist — distinct from a logged
// TastingVisit. When the date passes and ratings start arriving it
// converts into a TastingVisit.
export interface UpcomingTasting {
  id: string;
  wedding_id: string;
  caterer_id: string;
  scheduled_for: string;
  location?: string;
  attendees: PartyId[];
  prep_questions: Array<{ id: string; body: string; resolved: boolean }>;
  dishes_to_request: string[];
  dietary_constraints_to_test: string[];
  created_at: string;
}

// Presence signal — last time a party viewed or acted on the
// workspace. Surfaced in the top-right of each tab so the couple can
// see that Urvashi checked in this morning, Foodlink replied 4h ago.
export interface PresenceSignal {
  party_id: PartyId;
  last_seen_at: string;
  last_action?: string;        // "replied", "viewed", "added dish"
}

// ── Caterer Decision Board entities ───────────────────────────────────────
// Proposals and fit scores sit on top of the existing vendors store —
// caterer_id points at a Vendor record (category = "catering") and a
// ShortlistEntry for the same vendor is the couple's signal that this
// caterer is in the running.

export type ProposalStatus = "requested" | "received" | "declined";

export interface CatererProposal {
  id: string;
  wedding_id: string;
  caterer_id: string;
  event_id: string;
  price_per_plate_low?: number;
  price_per_plate_high?: number;
  currency: string;
  min_guaranteed?: number;
  inclusions: string[];
  exclusions: string[];
  status: ProposalStatus;
  received_at?: string;
  requested_at?: string;       // when the couple/planner sent the request
  notes?: string;
  source_doc_url?: string;
  added_by?: PartyId;          // who logged this proposal in the workspace
}

// One dimension of the fit score. AI produces 4–6 of these per assessment.
export interface FitDimension {
  dimension:
    | "cuisine"
    | "scale"
    | "budget"
    | "flexibility"
    | "reviews"
    | "cultural_fit"
    | "logistics";
  score: number;               // 0–100
  rationale: string;           // one sentence
}

// The result of one AI assessment of a caterer against the wedding.
// Cached per caterer; regenerated on demand when the couple clicks
// refresh or the underlying context changes materially.
export interface CatererAssessment {
  id: string;
  wedding_id: string;
  caterer_id: string;
  fit_score: number;           // 0–100, computed by model from breakdown
  breakdown: FitDimension[];
  tradeoffs: string[];         // 3–5 plain-language bullets
  what_missing: string[];      // 2–4 information gaps
  narrative: string;           // one paragraph — "if you picked X, here's what that looks like"
  generated_at: string;        // ISO
  model: string;               // claude-sonnet-4-6 | offline
}

// ── Tasting Journal entities ──────────────────────────────────────────────

export type TastingCategory =
  | "welcome"
  | "passed_app"
  | "main"
  | "bread"
  | "side"
  | "dessert"
  | "beverage"
  | "other";

export interface TastingVisit {
  id: string;
  wedding_id: string;
  caterer_id: string;
  date: string;                // ISO yyyy-mm-dd
  location?: string;
  attendees: string[];         // free-text names
  notes?: string;
  // AI-generated synthesis, stored only after the couple explicitly
  // generates it. Regenerates on request.
  synthesis?: TastingSynthesis;
}

export interface TastingSynthesis {
  summary: string;             // 3–4 sentence read, not bullets
  wins: string[];              // 2–4 short phrases
  misses: string[];            // 2–4 short phrases
  recommendation: string;      // one line — "this caterer wins sangeet, not reception"
  generated_at: string;
  model: string;
}

// Dish evaluated inside a tasting visit. Ratings are 1–5 each. memorability
// is the "would we talk about this dish after the wedding" axis — the
// one that really predicts whether a dish earns its place on the menu.
export interface TastingDish {
  id: string;
  visit_id: string;
  name: string;
  category: TastingCategory;
  appearance?: number;         // 1–5
  flavor?: number;
  portion?: number;
  temperature?: number;
  memorability?: number;
  notes?: string;
  photo_url?: string;
  sort_order: number;
}

// ── Service & Flow entities ───────────────────────────────────────────────
// Operational backbone: staff counts, rental inventory, bar program. All
// scoped to an event_id. Industry ratios (1 server per 15 plated, 1 per
// 25 buffet, 1 bartender per 75 guests) live in the component layer as
// computed warnings, not as stored state — they can evolve without a
// migration.

export type StaffRole =
  | "server"
  | "bartender"
  | "captain"
  | "chef"
  | "runner"
  | "dishwasher"
  | "other";

export interface StaffSlot {
  id: string;
  event_id: string;
  role: StaffRole;
  count: number;
  moment_id?: string;
  notes?: string;
  sort_order: number;
  added_by?: PartyId;
  state?: EntityState;
}

export type RentalCategory =
  | "service"                  // chafers, stations, chinaware
  | "glassware"
  | "linens"
  | "furniture"                // chairs, tables
  | "bar"
  | "other";

export interface RentalItem {
  id: string;
  event_id: string;
  name: string;
  category: RentalCategory;
  quantity: number;
  unit?: string;
  supplier?: string;
  covered_by?: "caterer" | "venue" | "separate";
  notes?: string;
  sort_order: number;
  added_by?: PartyId;
  state?: EntityState;
}

export interface SignatureCocktail {
  id: string;
  event_id: string;
  name: string;
  ingredients: string[];       // short phrases, one per line
  garnish?: string;
  description: string;         // one-sentence sensory description
  source: "manual" | "ai";
  sort_order: number;
}

// ── Catering Command "what needs you next" ────────────────────────────────

export type ActionSeverity = "info" | "soon" | "blocker";

export interface NextAction {
  id: string;
  title: string;               // short imperative — "Confirm reception menu"
  reason: string;              // one sentence — WHY it's the next move
  severity: ActionSeverity;
  // Optional deep-links for the couple to act on the item.
  link?: { surface: CateringSurface; event_id?: string; caterer_id?: string };
}

export type CateringSurface =
  | "command"
  | "menu_studio"
  | "dietary_atlas"
  | "decision_board"
  | "tasting_journal"
  | "service_flow";

export interface CommandBrief {
  id: string;
  wedding_id: string;
  actions: NextAction[];
  generated_at: string;
  model: string;
}
