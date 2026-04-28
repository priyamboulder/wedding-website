// ── Bridal Shower module types ─────────────────────────────────────────────
// Non-vendor celebration module. Planner is almost always someone *other*
// than the bride — so the model centers a "Bride Brief" (what would *she*
// love) rather than direct couple inputs. Six tabs in the canvas:
// Bride Brief · Concepts · Menu & Flow · Guest List · Budget · Checklist.
//
// All state persists via stores/bridal-shower-store.ts to localStorage.

// ── Planner role (who is filling this out) ─────────────────────────────────

export type PlannerRole =
  | "moh"
  | "bridesmaid"
  | "mother_of_bride"
  | "mother_of_groom"
  | "sister_family"
  | "friend"
  | "bride_herself"
  | "co_planning";

// ── Bride personality (the most important filter) ──────────────────────────

export type BridePersonality =
  | "classic_elegant"
  | "creative_eclectic"
  | "life_of_party"
  | "earthy_relaxed"
  | "foodie"
  | "sentimental";

// ── Guest count bracket ────────────────────────────────────────────────────

export type GuestCountBracket =
  | "under_10"
  | "10_20"
  | "20_35"
  | "35_50"
  | "50_plus";

// ── Guest composition tags (multi-select) ──────────────────────────────────

export type GuestCompositionTag =
  | "bridesmaids_friends"
  | "friends_family_mix"
  | "multi_generational"
  | "includes_kids"
  | "co_ed"
  | "work_friends";

// ── Shower format / vibe ───────────────────────────────────────────────────

export type ShowerFormat =
  | "brunch"
  | "afternoon_tea"
  | "dinner_party"
  | "party"
  | "experience"
  | "backyard"
  | "outdoor"
  | "shower_trip";

// ── Budget tier (total event budget, not per-person) ───────────────────────

export type BudgetTier =
  | "under_300"
  | "300_750"
  | "750_1500"
  | "1500_3000"
  | "3000_5000"
  | "5000_plus";

// ── Contribution model ─────────────────────────────────────────────────────

export type ContributionModel = "hosted" | "potluck" | "guests_cover";

// ── Venue type ─────────────────────────────────────────────────────────────

export type VenueType =
  | "home"
  | "restaurant"
  | "venue_space"
  | "outdoors"
  | "experience"
  | "undecided";

// ── Time of day ────────────────────────────────────────────────────────────

export type TimeOfDay = "morning" | "afternoon" | "evening" | "unsure";

// ── Day of week ────────────────────────────────────────────────────────────

export type DayOfWeek = "saturday" | "sunday" | "weekday_evening";

// ── Bride Brief (Phase 1 — the discovery quiz result) ──────────────────────

export interface BrideBrief {
  plannerRole: PlannerRole | null;
  coPlannerName: string;
  bridePersonality: BridePersonality[];
  guestCount: GuestCountBracket | null;
  guestComposition: GuestCompositionTag[];
  format: ShowerFormat | null;
  budgetTier: BudgetTier | null;
  contribution: ContributionModel | null;
  venueType: VenueType | null;
  city: string;
  dateTarget: string;
  dayOfWeek: DayOfWeek | null;
  timeOfDay: TimeOfDay | null;
  updatedAt: string | null;
}

// ── Specific bride preferences ─────────────────────────────────────────────

export interface BridePreferences {
  loves: string[];
  dislikes: string[];
  weddingColors: string;
  registryAt: string;
}

// ── Concept library (Phase 2 — the inspiration cards) ──────────────────────

export type ConceptTag =
  | "works_at_home"
  | "mixed_generations"
  | "intimate"
  | "crowd_friendly"
  | "spring_summer"
  | "fall_winter"
  | "low_lift"
  | "experience_focused"
  | "food_forward"
  | "photogenic";

export interface ConceptMenu {
  welcomeDrink: string;
  welcomeDrinkRecipe: string;
  mocktail: string;
  mocktailRecipe: string;
  appetizers: string[];
  mainCourse: string;
  mainStyle: "plated" | "family_style" | "buffet" | "stations";
  sides: string[];
  dessert: string;
  drinksGuidance: string;
  dietaryNotes: string;
}

export interface ConceptActivity {
  id: string;
  title: string;
  description: string;
  kind: "icebreaker" | "interactive" | "classic_game" | "low_key" | "experience";
  timeMinutes: number;
  multiGenerationalFriendly: boolean;
  skipIf?: string;
}

export interface TimelineBeat {
  time: string;
  title: string;
  body: string;
}

export interface DecorDirection {
  palette: { label: string; hex: string }[];
  florals: string;
  tableSetting: string;
  signage: string;
  statementMoment: string;
  skipThese: string;
}

export interface BudgetLine {
  label: string;
  pct: number;
  note: string;
}

export interface BudgetBreakdown {
  saveOn: string;
  splurgeOn: string;
  lines: BudgetLine[];
}

export interface ChecklistItem {
  id: string;
  phase: "6_8_weeks" | "4_6_weeks" | "2_weeks" | "day_before" | "day_of";
  label: string;
}

export interface ShowerConcept {
  id: string;
  name: string;
  tagline: string;
  narrative: string;
  heroPalette: string[];
  tags: ConceptTag[];
  // Which brief inputs this concept plays well with — used for a soft
  // "match" tag (e.g. "Great for your crew", "Perfect for mixed generations").
  personalities: BridePersonality[];
  formats: ShowerFormat[];
  venueTypes: VenueType[];
  budgetTiers: BudgetTier[];
  maxGuests: number; // hard ceiling where the concept stops scaling nicely
  seasons: ("spring" | "summer" | "fall" | "winter")[];

  menu: ConceptMenu;
  activities: ConceptActivity[];
  timeline: TimelineBeat[];
  decor: DecorDirection;
  budget: BudgetBreakdown;
  checklist: ChecklistItem[];
  invitation: {
    sendAt: string;
    toneExample: string;
    format: string;
  };
}

// ── Selection state ────────────────────────────────────────────────────────

export interface ConceptSelection {
  conceptId: string | null;
  selectedAt: string | null;
}

// ── Guest list ─────────────────────────────────────────────────────────────

export type ShowerRsvp = "going" | "pending" | "cant_make_it";

export interface ShowerGuest {
  id: string;
  name: string;
  relationship: string; // "MOH", "Bridesmaid", "Bride's mom", "Aunt", etc.
  rsvp: ShowerRsvp;
  dietary: string;
  notes: string;
}

// ── Budget overlay (planner's actual tracked spend) ────────────────────────

export interface BudgetOverlay {
  totalBudgetCents: number;
  lines: {
    id: string;
    label: string;
    plannedCents: number;
    actualCents: number;
    paidBy: string;
    note: string;
  }[];
}

// ── Checklist completion overlay ───────────────────────────────────────────

export interface ChecklistCompletion {
  // concept.id → item.id[] of completed items from the canonical checklist.
  done: Record<string, string[]>;
  // Planner-added custom items keyed by concept id.
  custom: Record<string, { id: string; label: string; phase: ChecklistItem["phase"]; done: boolean }[]>;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface BridalShowerState {
  brideName: string;
  brief: BrideBrief;
  preferences: BridePreferences;
  selection: ConceptSelection;
  guests: ShowerGuest[];
  budget: BudgetOverlay;
  checklist: ChecklistCompletion;
}
