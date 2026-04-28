// ── Events module types ────────────────────────────────────────────────────
// The Events module is the AI-first spine of the wedding: a 6-question core
// quiz captures the couple's program, story, scale, vibe, palette, and
// priorities, and everything downstream (event names, attire, cuisine,
// muhurat, budget splits) is AI-generated from that anchor.
//
// Persists to localStorage via Zustand (see stores/events-store.ts). Shape
// mirrors the Supabase schema noted in the feature spec for future swap-over.

// ── Program (which events) ─────────────────────────────────────────────────

export type EventType =
  | "pithi"
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "garba"
  | "baraat"
  | "ceremony"
  | "cocktail"
  | "reception"
  | "after_party"
  | "welcome_dinner"
  | "farewell_brunch"
  | "custom";

export interface EventTypeOption {
  id: EventType;
  name: string;
  // Short mono caption used on option tiles; sits below the name.
  blurb: string;
  // Typical share of the total guest count (0..1). Used to propose a default
  // per-event split when the couple lands on step 3.
  defaultGuestShare: number;
  // Which traditions typically include this event. Drives AI "you might be
  // missing…" nudges on step 1. Empty array means "standard across all".
  traditions?: Tradition[];
}

// ── Traditions & story ────────────────────────────────────────────────────

export type Tradition =
  | "gujarati"
  | "punjabi"
  | "tamil"
  | "telugu"
  | "bengali"
  | "marwari"
  | "marathi"
  | "sindhi"
  | "malayali"
  | "kashmiri"
  | "south_indian_christian"
  | "muslim"
  | "sikh"
  | "jain"
  | "inter_faith"
  | "non_religious"
  | "custom";

// ── Vibe ─────────────────────────────────────────────────────────────────

export type MoodTile =
  | "garden_romance"
  | "jewel_box"
  | "palace_baroque"
  | "desert_glow"
  | "monsoon_modern"
  | "temple_traditional"
  | "coastal_ease"
  | "heritage_haveli";

export interface MoodTileOption {
  id: MoodTile;
  name: string;
  blurb: string;
  // Loose hex swatch used on the tile preview (no image assets yet).
  accentHex: string;
  baseHex: string;
}

// ── Palette ──────────────────────────────────────────────────────────────

export type PaletteRole = "primary" | "secondary" | "accent" | "neutral" | "highlight";

export interface PaletteSwatch {
  hex: string;
  name: string;
  role: PaletteRole;
}

export interface Palette {
  id: string;
  name: string;
  // Short editorial line shown under the palette name.
  description: string;
  colors: PaletteSwatch[];
}

// ── Priorities ───────────────────────────────────────────────────────────

export type Priority =
  | "photography"
  | "videography"
  | "food"
  | "decor"
  | "music"
  | "attire"
  | "venue"
  | "guest_experience"
  | "stationery";

export interface PriorityOption {
  id: Priority;
  name: string;
  blurb: string;
}

// ── Couple context (anchor for all AI) ───────────────────────────────────

// Program-level location intent. Not a venue (that's the Venue workspace) —
// this is the broad "where in the world" frame captured during discovery.
export type ProgramLocationType =
  | "one_venue"
  | "split_venues"
  | "destination"
  | "home_plus_venue"
  | "undecided";

// Guest-tier definition. Couples assign each event to one tier on the
// invitation matrix. Default tiers are created in events-seed; couples can
// rename/add but IDs stay stable so per-event assignments don't break.
export interface GuestTier {
  id: string;
  name: string;
  description: string;
}

export interface CoupleContext {
  traditions: Tradition[];
  // Only set when `traditions` includes "inter_faith". Free text.
  partnerBackground: string;
  storyText: string;
  totalGuestCount: number;
  heroPaletteId: string | null;
  priorityRanking: Priority[];
  // Step 6 free-text capstones. Surface as explicit constraints to the AI
  // when it generates budget splits and vendor recommendations.
  nonNegotiable: string;
  dontCare: string;
  // Percentages, not dollars. Populated by AI after the quiz.
  aiBudgetAllocation: Record<string, number> | null;

  // ── Program-level discovery fields (Phase 1) ────────────────────────
  // The overall wedding story — appears as "YOUR WEDDING STORY" on the
  // program view. Distinct from storyText (which is the couple's personal
  // narrative); this one is the program arc.
  programBrief: string;
  // AI-drafted version of the program brief; kept alongside the edited
  // version so "Refine with AI" can regenerate without losing edits.
  programBriefAiDraft: string;
  // How the couple is imagining the location frame.
  locationType: ProgramLocationType | null;
  destinationLocation: string;
  // Free text captured at step 2 — "just the essentials" / "full celebration"
  // / etc. — for downstream AI context, not UI gating.
  programSize: string | null;
  // Guest tiers. Seeded with defaults but editable.
  guestTiers: GuestTier[];
  // Whether the couple has finished the Program Discovery flow at least
  // once. Drives whether the workspace default view is the discovery flow
  // or the program dashboard.
  programDiscoveryComplete: boolean;
}

// ── Event record ─────────────────────────────────────────────────────────

export interface VibeOption {
  // 2-word family label, e.g. "Bollywood Glam", "Garden Romance".
  vibeLabel: string;
  // 2-5 word evocative event name.
  eventName: string;
  // One-sentence theme description, max ~12 words.
  theme: string;
}

export interface EventRecord {
  id: string;
  type: EventType;
  // Populated when `type === "custom"`, or when the AI has suggested a poetic
  // name for a standard event (e.g. "Under the Banyan" for a Mehendi).
  customName: string | null;
  aiSuggestedName: string | null;
  aiSuggestedTheme: string | null;
  guestCount: number;
  moodTile: MoodTile | null;
  // Per-event palette override. Null until the couple picks one on the
  // per-event canvas. v4 removed the global hero palette — palette is
  // always per-event now.
  paletteId: string | null;
  sortOrder: number;

  // ── Vibe / name / theme (Q4 top) ─────────────────────────────────────
  // IDs into INSPIRATION_IMAGES that the couple has favorited for this
  // event. Order preserved so we can render a "most recent first" stream
  // in the AI prompt if needed.
  favoritedImageIds: string[];
  // IDs into ATTIRE_IMAGES that the couple has favorited for this event.
  // Scoped per-event — the same tile favorited on Pithi is independent of
  // Sangeet. Order preserved for "most recent first" stylist summaries.
  favoritedAttireIds: string[];
  // The 4 (or more) AI-generated direction options currently on screen.
  // Null until the page first loads and generates. Regens replace this
  // list wholesale; we don't keep history past one step.
  aiNameOptions: VibeOption[] | null;
  // Which option the couple selected. Null when they haven't picked one
  // yet, or when they chose "Write my own".
  selectedNameOptionIndex: number | null;
  // "Write my own" path — free text. When either of these is set we
  // treat the couple's answer as custom and ignore selectedNameOptionIndex.
  customEventName: string | null;
  customTheme: string | null;
  // Convenience mirrors — filled from the selected option or custom fields
  // so downstream dashboard / AI modules read one canonical field set.
  vibeLabel: string | null;
  vibeEventName: string | null;
  vibeTheme: string | null;

  // ── Palette (Q4 bottom, Coolors workbench) ───────────────────────────
  // When the couple modifies a curated palette in the workbench, the
  // final swatch set lives here. Null means paletteId is authoritative.
  customPalette: PaletteSwatch[] | null;
  // Indices into the active swatch array that are locked during regen.
  paletteLockedPositions: number[];
  // Optional override name after a workbench save / rename.
  paletteCustomName: string | null;

  // ── Events workspace (Overview / Vibe / Attire / Guest feel) ─────────
  // Per-event date + venue populated on the Overview tab.
  eventDate: string | null;
  venueName: string | null;
  // Per-tab brief textareas ("Describe the feeling you want…" style).
  overviewIntro: string;
  vibeIntro: string;
  attireIntro: string;
  // Style keywords chip set for Vibe & Palette.
  vibeKeywords: string[];
  // "I definitely want…" and "Not for us…" free-text lists, per tab.
  vibeWants: string[];
  vibeAvoids: string[];
  attireWants: string[];
  attireAvoids: string[];
  // Pinterest board hook — URL only; preview hydration is deferred.
  pinterestBoardUrl: string | null;
  // Guest feel structured fields. Free text so couples aren't boxed in.
  dressCode: string;
  formality: AttireFormality | null;
  culturalNotes: string;

  // ── Rebuild (discovery-first) fields ────────────────────────────────
  // Where this event sits on the program arc (0 = quiet & intimate,
  // 100 = full celebration). Drives music, décor, catering cues downstream.
  energyLevel: number;
  // Which guest tier is invited (id refers to CoupleContext.guestTiers[].id).
  // Null until the couple assigns one on the invitation matrix.
  guestTier: string | null;
  // Whether this event uses its own palette or inherits the wedding default.
  paletteInherits: boolean;

  // Per-tab quiz answers. Free-shape record — each tab defines its own
  // question keys. Kept separate from the resolved "wants/keywords" so we
  // can retake quizzes without destroying the tab's structured outputs.
  vibeQuizAnswers: Record<string, unknown>;
  attireQuizAnswers: Record<string, unknown>;
  // Free-text "what movie is this night" answer from the vibe quiz — kept
  // separately because it's a particularly evocative anchor for AI.
  movieReference: string;

  // ── Attire tab fields ───────────────────────────────────────────────
  attireColorGuidance: AttireColorGuidance | null;
  attireCulturalExpectation: AttireCulturalExpectation | null;
  attireCoordinationLevel: AttireCoordinationLevel | null;
  attireKeywords: string[];
  brideLookDirection: string;
  groomLookDirection: string;
  // Auto-generated guest attire card copy — the shareable dress-code text
  // that flows into the wedding website and invitation suite.
  guestAttireCardText: string;

  // ── Guest feel tab fields ───────────────────────────────────────────
  arrivalFeel: string;
  peakMoment: string;
  departureFeel: string;
  sensorySmell: string;
  sensorySound: string;
  sensoryLighting: string;
  sensoryTemperature: string;
  // Hospitality ideas the couple has "loved" (ids into the seeded list) +
  // any they've added themselves.
  lovedHospitalityIds: string[];
  customHospitalityIdeas: string[];
  guestFeelBrief: string;

  // ── The Brief tab ───────────────────────────────────────────────────
  // The assembled master brief for this event. Auto-drafts whenever the
  // couple hits "Refine with AI"; edits are preserved in briefText.
  briefText: string;
  briefAiDraft: string;
}

// Attire answers are small enums. Kept separate from AttireFormality so
// the formality ladder (already used elsewhere) stays untouched.
export type AttireColorGuidance =
  | "specific_palette"
  | "general_vibe"
  | "code_only"
  | "themed";

export type AttireCulturalExpectation =
  | "traditional_required"
  | "traditional_encouraged"
  | "western_preferred"
  | "mixed"
  | "no_preference";

export type AttireCoordinationLevel =
  | "exactly_matched"
  | "same_palette"
  | "same_vibe"
  | "no_wedding_party";

// ── Attire inspiration (Q4 vibe boards, second band) ─────────────────────
// Structured attire references per event. Favorited independently per event
// so Pithi looks stay scoped to Pithi. Feeds the vendor brief, stylist
// handoff, and the future Wardrobe/Outfits module.

export type AttireRole = "bride" | "groom" | "family" | "guest";

export type AttireGarmentType =
  | "lehenga"
  | "saree"
  | "sherwani"
  | "suit"
  | "gown"
  | "kurta"
  | "anarkali"
  | "indo_western"
  | "tuxedo"
  | "kurta_set"
  | "co_ord";

export type AttireFormality = "casual" | "semi_formal" | "formal" | "black_tie";

export type AttireWorkLevel = "minimal" | "moderate" | "heavy";

export interface AttireImage {
  id: string;
  eventTypes: EventType[];
  role: AttireRole;
  garmentType: AttireGarmentType;
  // Free-form color cues (e.g. ["marigold", "coral"]) used for chip filtering
  // and for propagating color notes into the stylist brief.
  paletteTags: string[];
  formality: AttireFormality;
  workLevel: AttireWorkLevel;
  // Designer or photographer attribution — display on hover only.
  sourceCredit: string;
  url: string | null;
  // Extra descriptive chips matched against filter chips (e.g. ["modern",
  // "comfortable", "classic_red"]). Union with role + garment at filter time.
  tags: string[];
  // 3 dominant colors — drives the placeholder gradient while url is null.
  paletteHex: string[];
}

// ── Inspiration images (Q4 vibe boards) ───────────────────────────────────
// Each image is an editorial reference with tags + dominant palette. The
// AI reads the tag intersection across a couple's favorites to propose a
// vibe label + event name + theme. `url` is nullable so we can ship the
// UX now with gradient placeholders and swap in real Unsplash/Pexels URLs
// without touching call sites.

export interface InspirationImage {
  id: string;
  // Which event categories this image fits. Most are single-event but some
  // (e.g. a mandap shot) span multiple rituals.
  eventTypes: EventType[];
  url: string | null;
  attribution: string | null;
  source: "unsplash" | "pexels" | "ananya" | "placeholder";
  // Drives AI reasoning. Union of three axis flavors:
  //   · mood (bollywood, garden, baroque, haveli, coastal, modern)
  //   · formality (formal, semi, casual)
  //   · color cues (saturated, pastel, jewel, neutral, warm, cool)
  // Plus the obvious venue/material tags (outdoor, marigold, brass…).
  tags: string[];
  // 3–5 dominant colors. Renders as the placeholder gradient when url is
  // null; feeds palette suggestions when the couple advances to Q5.
  paletteHex: string[];
}

// ── AI suggestion record ─────────────────────────────────────────────────
// Every AI-generated card logs its output here so the couple can "Keep /
// See alternatives / Refine with a note" and we can track iterations.

export type AISuggestionScope =
  | "event_name"
  | "event_theme"
  | "attire"
  | "palette_per_event"
  | "cuisine"
  | "muhurat"
  | "budget"
  | "ritual_checklist"
  | "wedding_party"
  | "hotel_blocks";

export type AISuggestionStatus = "pending" | "accepted" | "refined" | "rejected";

export interface AISuggestion {
  id: string;
  scope: AISuggestionScope;
  eventId: string | null;
  // Shape varies per scope — renderers narrow it at use-time. See
  // lib/events/ai.ts for the per-scope shapes we emit today.
  suggestion: unknown;
  status: AISuggestionStatus;
  refinementPrompt: string | null;
  generatedAt: string;
}

// ── Quiz state ───────────────────────────────────────────────────────────

export interface EventsQuizState {
  // Null until the couple applies the quiz. Once set, the dashboard
  // surfaces instead of the quiz on subsequent visits. Resets to null
  // when the couple hits "Start over" on the dashboard.
  completedAt: string | null;
  // Which step the couple last left off on. Persisted so we can resume
  // mid-quiz after a refresh.
  stepIndex: number;
  // True the first time the couple reaches the final step. Unlike
  // completedAt, never resets — gates the full-bleed first-run welcome.
  hasCompletedOnce: boolean;
  // True once the couple has clicked "Start the brief →" on the welcome
  // screen. Drives whether the gate shows the welcome splash or drops
  // straight into the quiz on return visits.
  hasStartedBrief: boolean;
  // True after the couple has seen the left-rail coachmark once.
  coachmarkDismissed: boolean;
}

// ── Cascade notifications ────────────────────────────────────────────────
// A minimal log of brief edits that downstream surfaces (Décor, Catering,
// etc.) can read to flag "needs re-confirmation" state. Notifications are
// stubbed for now — real surface UIs will filter by `kind` and render
// their own inline banners.

export type CascadeKind =
  | "event_added"
  | "event_removed"
  | "guest_count_changed";

export interface CascadeNotification {
  id: string;
  kind: CascadeKind;
  // Free-form context — event label, count delta, etc.
  payload: Record<string, unknown>;
  createdAt: string;
  // Surfaces mark their own acknowledgement rather than deleting the
  // record. Lets multiple consumers each track their state.
  acknowledgedBy: string[];
}
