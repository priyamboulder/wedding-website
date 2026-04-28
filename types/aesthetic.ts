// ── Aesthetic Studio types ──────────────────────────────────────────────────
// Décor & Florals Part 1: the locked-source-of-truth for a wedding's aesthetic.
// Every Part 2 surface (scenes, florals, lighting, shortlist, load-in) reads
// from the AestheticDNA produced here.

// ── Palette ─────────────────────────────────────────────────────────────────

export interface PaletteSwatch {
  hex: string;           // #RRGGBB
  name: string;          // human-readable ("dusk saffron", "bone")
}

// ── Inspiration image ────────────────────────────────────────────────────────
// Any image saved for this wedding. Sourced from Pinterest board links,
// pins, Instagram posts/reels, vendor portfolios, or direct upload.

export type InspirationSource =
  | "pinterest_pin"
  | "pinterest_board"
  | "instagram_post"
  | "instagram_reel"
  | "vendor_portfolio"
  | "upload"
  | "unknown";

export type TagStatus = "pending" | "tagging" | "ready" | "failed";

export interface InspirationTags {
  palette: PaletteSwatch[];            // 3-5 dominant colors
  textures: string[];                   // "matte ceramic", "raw silk"
  era?: string;                         // "modern", "vintage garden", …
  scale?: string;                       // "intimate", "grand", …
  mood: string[];                       // "candlelit", "lush", "quiet"
  elements: string[];                   // "taper candles", "bud vases"
  cultural_cues: string[];              // "Rajasthani color story", …
}

export interface InspirationImage {
  id: string;
  source_url: string;                   // original Pinterest/IG/etc URL
  source_type: InspirationSource;
  storage_url: string | null;           // null while fetching; gradient fallback
  content_hash: string;                 // for dedup (stubbed: hash of source_url)
  tag_status: TagStatus;
  ai_tags: InspirationTags | null;      // populated once tag_status === "ready"
  user_notes: string;
  direction_id: string | null;          // null = unassigned
  position: number;                     // ordering within direction
  created_at: string;
}

// ── Direction ────────────────────────────────────────────────────────────────
// Competing aesthetic theses. A wedding usually considers 2-4 before locking.

export interface DirectionSynthesis {
  manifesto: string;                    // 3-5 sentences — what this IS and IS NOT
  palette_primary: PaletteSwatch[];
  palette_secondary: PaletteSwatch[];
  textures: string[];
  mood_tags: string[];
  implied_moves: string[];              // "low centerpieces, taper candles, …"
  synthesized_at: string;
  image_set_hash: string;               // cache key — re-synth only when images change
}

export interface AestheticDirection {
  id: string;
  name: string;
  description?: string;                 // optional user-written framing
  synthesis: DirectionSynthesis | null; // null until first synthesize
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── The Aesthetic DNA ────────────────────────────────────────────────────────
// The locked source of truth. Exists once per wedding; every Part 2 surface
// reads from this.

export interface AestheticDNA {
  direction_id: string;                 // which direction was locked
  palette_primary: PaletteSwatch[];
  palette_secondary: PaletteSwatch[];
  textures: string[];
  forbidden: string[];                  // AI-derived, user-editable
  mood_tags: string[];
  cultural_notes: string;               // AI-derived, user-editable
  implied_moves: string[];
  locked_at: string;
  locked_by: string;
  amended_at: string | null;
}

// ── Amendment audit ─────────────────────────────────────────────────────────
// Every change after lock is recorded. Downstream surfaces in Part 2 will
// surface "this quote/scene depends on a field that was amended".

export type AestheticField =
  | "palette_primary"
  | "palette_secondary"
  | "textures"
  | "forbidden"
  | "mood_tags"
  | "cultural_notes"
  | "implied_moves";

export interface AestheticAmendment {
  id: string;
  amended_at: string;
  amended_by: string;
  field_changed: AestheticField;
  old_value: unknown;
  new_value: unknown;
  reason: string;
}

// ── Synthesis streaming ─────────────────────────────────────────────────────
// Direction synthesis is streamed progressively. The store reconciles partial
// updates from the API into the direction's synthesis field.

export type SynthesisChunk =
  | { kind: "manifesto"; value: string }
  | { kind: "palette_primary"; value: PaletteSwatch[] }
  | { kind: "palette_secondary"; value: PaletteSwatch[] }
  | { kind: "textures"; value: string[] }
  | { kind: "mood_tags"; value: string[] }
  | { kind: "implied_moves"; value: string[] }
  | { kind: "done" };
