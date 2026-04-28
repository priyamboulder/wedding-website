// ═══════════════════════════════════════════════════════════════════════════════════
//   Wedding site content + brand shapes
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Canonical data the public wedding site (and its template renderers) read from.
//   Templates only know how to *display* this — they never own it. Same content
//   feeds preview, full-screen overlay, and the live /wedding/[slug] route.
//
//   Persistence: lives in Zustand (matching stores/vendor-workspace-store.ts) and
//   maps cleanly to a future Supabase wedding_sites table.
// ═══════════════════════════════════════════════════════════════════════════════════

export interface SiteCouple {
  first: string;
  second: string;
  hashtag: string;
}

export interface SiteHero {
  /** Optional eyebrow/tagline — falls back to date string if absent */
  eyebrow?: string;
  /** Optional photo URL — when null, templates render a typographic hero */
  photoUrl?: string | null;
}

export interface SiteStory {
  title: string;
  paragraphs: string[];
}

export interface SiteEvent {
  id: string;
  name: string;        // "Sangeet"
  date: string;        // ISO date
  timeLabel: string;   // "Evening" | "5:30 PM"
  venue: string;       // "Zenana Mahal, Umaid Bhawan"
  dressCode?: string;
  notes?: string;
}

export interface SiteTravelStay {
  airportCode?: string;
  recommendedHotels: { name: string; tier: "luxury" | "premium" | "comfort"; note?: string }[];
  shuttleNote?: string;
}

export interface SiteRsvp {
  deadlineIso: string;
  instructions: string;
}

export interface SiteGalleryItem {
  url: string;
  caption?: string;
}

export interface SiteContent {
  couple: SiteCouple;
  weddingDate: string;       // ISO
  primaryVenue: string;
  hero: SiteHero;
  story: SiteStory;
  events: SiteEvent[];
  travel: SiteTravelStay;
  rsvp: SiteRsvp;
  gallery: SiteGalleryItem[];
}

// ── Brand cascade ────────────────────────────────────────────────

/**
 * Minimal brand shape templates consume. The studio's BrandSystem (in
 * app/studio/page.tsx) maps to this via brandToRenderBrand() — keeps
 * renderers decoupled from internal studio types.
 */
export interface RenderBrand {
  /** Foreground ink color */
  ink: string;
  /** Page surface (usually ivory) */
  surface: string;
  /** Accent — often gold/saffron, used for hairlines, italics, badges */
  accent: string;
  /** Secondary accent for backgrounds (band, dividers) */
  accentSoft: string;
  /** Display font CSS family (already-resolved, ready to drop into style) */
  displayFont: string;
  /** Body font CSS family */
  bodyFont: string;
  /** Couple's monogram initials, e.g. "P&A" */
  monogramInitials: string;
}

// ── Render props (what every template component receives) ────────

export type RenderDevice = "desktop" | "tablet" | "mobile";

export interface TemplateRenderProps {
  content: SiteContent;
  brand: RenderBrand;
  device: RenderDevice;
  /**
   * "preview" → tight layout for card thumbnail (single hero, no nav)
   * "showcase" → full multi-section site for overlay/public route
   */
  mode: "preview" | "showcase";
}
