// ── Mehendi seed data ──────────────────────────────────────────────────────
// Suggested style directions, keyword presets, symbol presets, and contract
// checklist items. Placeholder content until AI-driven generation lands —
// the tabs read from these so swapping in server-generated values is a
// single-file edit.

import type {
  ContractChecklistItemId,
  VibeTag,
} from "@/types/mehndi";

export interface StyleDirection {
  id: string;
  // Short title shown on the card.
  title: string;
  // One-sentence tagline beneath the title.
  tagline: string;
  // Longer descriptor for the expanded body.
  body: string;
  // Which vibe filter opens alongside this card in the gallery.
  vibe: VibeTag;
}

// Five direction cards the spec calls out. Ordered to pair with the
// reference gallery's primary vibe filters.
export const STYLE_DIRECTIONS: StyleDirection[] = [
  {
    id: "storytelling_bridal",
    title: "Storytelling bridal",
    tagline: "Your love story woven through traditional motifs.",
    body: "Portrait panels, meaningful symbols, hidden initials. Every inch means something. Best with an artist who works from conversation rather than a pattern book.",
    vibe: "storytelling",
  },
  {
    id: "lace_flow",
    title: "Lace & flow",
    tagline: "Arabic-inspired negative space with trailing vines.",
    body: "Elegant, airy, modern. The mehendi equivalent of a whisper — designs that breathe, with long graceful lines instead of dense coverage.",
    vibe: "flowing",
  },
  {
    id: "heritage_maximalist",
    title: "Heritage maximalist",
    tagline: "Dense Rajasthani coverage from fingertip to elbow.",
    body: "Peacocks, paisleys, temple borders. The kind your grandmother wore — and the kind the artist is proud to photograph. Plan for long application time.",
    vibe: "dense_traditional",
  },
  {
    id: "modern_minimal",
    title: "Modern minimal",
    tagline: "Clean lines, geometric patterns, wrist-only or fingertip accents.",
    body: "For the bride who wants mehendi to feel like jewelry, not a sleeve. Works beautifully with simple outfits and modern wedding aesthetics.",
    vibe: "minimal_geometric",
  },
  {
    id: "fusion",
    title: "Fusion",
    tagline: "Mix traditions — your own rules.",
    body: "Arabic negative space with Indian motifs. Geometric borders with organic florals. The design that couldn't exist without you commissioning it.",
    vibe: "storytelling",
  },
];

export function getStyleDirection(id: string): StyleDirection | undefined {
  return STYLE_DIRECTIONS.find((d) => d.id === id);
}

// Suggested keyword chips shown below the brief — "tap the ones that feel
// right. add your own." Kept deliberately small so the couple isn't buried.
export const KEYWORD_SUGGESTIONS: string[] = [
  "intricate",
  "airy",
  "bold",
  "traditional",
  "geometric",
  "floral",
  "dense",
  "delicate",
  "modern",
  "peacock motifs",
  "paisley",
  "mandala",
  "temple borders",
  "hidden initials",
  "portrait panel",
];

// Preset meaningful-symbol chips for the hidden details block. The couple
// can tap any to add to their list, or type their own.
export const SYMBOL_PRESETS: string[] = [
  "wedding date",
  "partner's name",
  "pet",
  "first meeting place",
  "favorite flower",
  "religious symbol",
  "family crest",
  "hometown skyline",
];

// Contract checklist rows surfaced on the Find Your Artist tab. Labels are
// what the couple sees; `body` is the hint beneath the toggle. Pre-populated
// with sensible defaults — the capacity calculator fills the hours and
// tiers once booked.
export interface ContractChecklistTemplate {
  id: ContractChecklistItemId;
  label: string;
  hint: string;
}

export const CONTRACT_CHECKLIST_ITEMS: ContractChecklistTemplate[] = [
  {
    id: "artists_hours",
    label: "Number of artists and hours confirmed",
    hint: "Match to your capacity calculator so no one waits more than 45 min.",
  },
  {
    id: "bride_complexity",
    label: "Bride's design complexity and estimated time",
    hint: "Detailed bridal work runs 3–5 hours. Protect the start time.",
  },
  {
    id: "guest_coverage",
    label: "Guest mehendi included — and which tiers?",
    hint: "Spell out Quick / Classic / Detailed so expectations match the night of.",
  },
  {
    id: "travel_stay",
    label: "Travel and accommodation (for destination weddings)",
    hint: "Pre-wedding trial, travel window, lodging, per-diem.",
  },
  {
    id: "natural_henna",
    label: "Natural henna only — black henna excluded",
    hint: "Black henna contains PPD and can burn skin. Make it contractual.",
  },
  {
    id: "touch_up",
    label: "Touch-up policy",
    hint: "What happens if a motif smudges before the ceremony?",
  },
  {
    id: "cancellation",
    label: "Cancellation and weather terms",
    hint: "Outdoor mehendi? Spell out the rain / heat contingency and refund window.",
  },
];

// Warm editorial guidance keyed by the couple's top loved direction. Keeps
// the tone advisory — "here's what to watch for" — rather than prescriptive.
export const ARTIST_GUIDANCE: Record<string, string> = {
  storytelling_bridal:
    "For storytelling mehendi, you want an artist who works from conversation, not just a pattern book. Ask to see custom pieces they've designed around a couple's story — not only repeated portfolio shots. Pay attention to whether they took their time in the consultation.",
  lace_flow:
    "Lace & flow designs live or die on linework. Look at the artist's trailing vines at arm's length — are the lines confident and even? Ask to see work done under time pressure at a live event, not only finished studio shots.",
  heritage_maximalist:
    "Heritage maximalist mehendi is a test of stamina — ask the artist how long they typically work on a bridal hand and how they stay steady through hour four. Check they can sketch a peacock or paisley from memory rather than from a reference book.",
  modern_minimal:
    "Minimal designs expose every wobble. Look for crisp geometric repetition in their portfolio and ask to see their work on real hands — not flat surfaces. A seasoned minimalist will have opinions about the spacing between motifs.",
  fusion:
    "Fusion is collaboration. Your artist should ask you questions and offer opinions, not just execute. Bring your most specific references to the first conversation — the ones that aren't on their Instagram — and watch how they respond.",
};

export const DEFAULT_GUIDANCE =
  "Before you book, look for an artist whose portfolio feels like a conversation — not a catalog. Ask about application time, henna sourcing (natural only), and how they handle the long bridal hours. A thoughtful artist will ask you questions too.";
