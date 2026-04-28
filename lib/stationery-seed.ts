// ── Stationery seed data ──────────────────────────────────────────────────
// Ships the canvas with a realistic baseline the moment the couple opens
// the workspace. Covers every section of the suite, a curated set of docs,
// and the canonical month-by-month production milestones.

import type {
  StationeryDocument,
  StationeryGuestTier,
  StationeryMatrixCells,
  StationeryMatrixMode,
  StationeryMatrixPiece,
  StationeryPieceContent,
  StationerySuiteItem,
  StationeryTimelineMilestone,
  StationeryVisualIdentity,
} from "@/types/stationery";
import { matrixCellKey } from "@/types/stationery";

// ── Visual identity ───────────────────────────────────────────────────────
// Palette imported from the Décor story by default; couple can override.

export const SEED_STATIONERY_VISUAL_IDENTITY: StationeryVisualIdentity = {
  palette: [
    { hex: "#F5ECD8", name: "Warm ivory" },
    { hex: "#C19A5B", name: "Antique gold" },
    { hex: "#8C2A1C", name: "Sindoor" },
    { hex: "#3D2B1F", name: "Cocoa ink" },
    { hex: "#A07C4D", name: "Henna" },
  ],
  typography: "mixed",
  motif: "paisley_traditional",
  finishing: ["gold_foil", "letterpress", "wax_seal"],
  brief:
    "When someone opens the envelope, they should feel the weight of the cotton first — thick, almost heirloom. Gold foil catching the light on the couple's monogram. Warm ivory, not cold white. A paisley border subtle enough not to shout.",
};

// ── Suite items ───────────────────────────────────────────────────────────
// Quantities assume a 400-guest / 180-household wedding. The smart
// calculator re-derives these from the live guest count on hover.

export const SEED_STATIONERY_SUITE: StationerySuiteItem[] = [
  // Pre-wedding
  {
    id: "sui-save-the-date",
    section: "pre_wedding",
    kind: "save_the_date",
    name: "Save the Date",
    description:
      "Physical card + digital mirror. Ship 8–10 months out so destination guests can hold dates.",
    enabled: true,
    delivery_mode: "Printed + digital",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 180,
    status: "in_design",
    notes: "Mailing list: 180 households + 18 extras for late adds.",
  },
  {
    id: "sui-main-invitation",
    section: "pre_wedding",
    kind: "main_invitation",
    name: "Main Invitation Card",
    description:
      "Flagship card for the wedding ceremony. Sets the tone for the full suite.",
    enabled: true,
    delivery_mode: "Printed + digital",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 520,
    status: "proof_review",
  },
  {
    id: "sui-rsvp",
    section: "pre_wedding",
    kind: "rsvp_card",
    name: "RSVP Card",
    description:
      "Reply card with meal selection. Links to wedding-site QR for digital RSVP.",
    enabled: true,
    delivery_mode: "Digital (QR on printed invite)",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 140,
    status: "in_design",
  },
  {
    id: "sui-details",
    section: "pre_wedding",
    kind: "details_card",
    name: "Details & Dress Code Card",
    description: "Venue address, dress code per event, hotel block overview.",
    enabled: true,
    delivery_mode: "Printed insert",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 150,
    status: "not_started",
  },
  {
    id: "sui-mehendi-insert",
    section: "pre_wedding",
    kind: "event_insert",
    event: "mehendi",
    name: "Mehendi Insert",
    description: "Event-specific card for the Mehendi afternoon.",
    enabled: true,
    delivery_mode: "Printed insert",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 140,
    status: "in_design",
  },
  {
    id: "sui-sangeet-insert",
    section: "pre_wedding",
    kind: "event_insert",
    event: "sangeet",
    name: "Sangeet Insert",
    description: "Evening-of-performance insert with call time + dress cue.",
    enabled: true,
    delivery_mode: "Printed insert",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 140,
    status: "in_design",
  },
  {
    id: "sui-reception-insert",
    section: "pre_wedding",
    kind: "event_insert",
    event: "reception",
    name: "Reception Insert",
    description: "Reception details — separate venue, open bar, after-party.",
    enabled: true,
    delivery_mode: "Printed insert",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 140,
    status: "not_started",
  },
  {
    id: "sui-map",
    section: "pre_wedding",
    kind: "map_card",
    name: "Map / Directions Card",
    description: "Venue map, parking + shuttle pickup points.",
    enabled: false,
    delivery_mode: "Printed insert",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 110,
    status: "not_started",
  },
  {
    id: "sui-accommodation",
    section: "pre_wedding",
    kind: "accommodation_card",
    name: "Accommodation Card",
    description: "Hotel room block codes + booking deadline.",
    enabled: false,
    delivery_mode: "Printed insert",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 110,
    status: "not_started",
  },
  {
    id: "sui-envelope-outer",
    section: "pre_wedding",
    kind: "envelope_outer",
    name: "Outer Envelope",
    description: "Envelope + optional liner. Sets first-touch tone.",
    enabled: true,
    delivery_mode: "Calligraphy addressing",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 95,
    status: "not_started",
  },
  {
    id: "sui-enclosure",
    section: "pre_wedding",
    kind: "enclosure",
    name: "Belly Band + Wax Seal",
    description: "Enclosure method — belly band with custom wax seal.",
    enabled: true,
    delivery_mode: "Custom wax seal",
    quantity: 198,
    buffer_pct: 10,
    cost_unit: 75,
    status: "not_started",
  },
  // Day-of
  {
    id: "sui-program",
    section: "day_of",
    kind: "ceremony_program",
    event: "wedding",
    name: "Ceremony Program",
    description:
      "Order of rituals with Hindi/English translation, family role callouts.",
    enabled: true,
    delivery_mode: "Printed, day-of",
    quantity: 400,
    buffer_pct: 5,
    cost_unit: 90,
    status: "not_started",
  },
  {
    id: "sui-menu",
    section: "day_of",
    kind: "menu_card",
    name: "Menu Cards",
    description: "One per place setting. Coordinates with caterer's final menu.",
    enabled: true,
    delivery_mode: "Printed, table setting",
    quantity: 400,
    buffer_pct: 5,
    cost_unit: 70,
    status: "not_started",
  },
  {
    id: "sui-welcome-bag",
    section: "day_of",
    kind: "welcome_bag_insert",
    name: "Welcome Bag Insert",
    description: "Printed card for welcome bags — itinerary + love note.",
    enabled: true,
    delivery_mode: "Printed card",
    quantity: 200,
    buffer_pct: 5,
    cost_unit: 55,
    status: "not_started",
  },
  {
    id: "sui-place",
    section: "day_of",
    kind: "place_card",
    name: "Place / Escort Cards",
    description:
      "Escort cards at entrance + place cards at settings. Coordinated with seating chart.",
    enabled: false,
    delivery_mode: "Calligraphy",
    quantity: 400,
    buffer_pct: 5,
    cost_unit: 55,
    status: "not_started",
  },
  {
    id: "sui-table-numbers",
    section: "day_of",
    kind: "table_number",
    name: "Table Numbers / Names",
    description: "One per table (approx. 40 tables of 10).",
    enabled: false,
    delivery_mode: "Printed",
    quantity: 40,
    buffer_pct: 10,
    cost_unit: 220,
    status: "not_started",
  },
  {
    id: "sui-seating",
    section: "day_of",
    kind: "seating_chart",
    name: "Seating Chart Display",
    description: "Large-format print at the reception entrance.",
    enabled: false,
    delivery_mode: "Large format print",
    quantity: 1,
    buffer_pct: 0,
    cost_unit: 6500,
    status: "not_started",
  },
  // Post-wedding
  {
    id: "sui-thank-you",
    section: "post_wedding",
    kind: "thank_you_card",
    name: "Thank You Cards",
    description: "Mailed within 6 weeks. One per gift-giving household.",
    enabled: false,
    delivery_mode: "Printed, post-wedding",
    quantity: 180,
    buffer_pct: 10,
    cost_unit: 110,
    status: "not_started",
  },
  {
    id: "sui-at-home",
    section: "post_wedding",
    kind: "at_home_card",
    name: "At-Home Card",
    description:
      "Announces the couple's new shared address and surname direction post-wedding.",
    enabled: false,
    delivery_mode: "Printed, post-wedding",
    quantity: 180,
    buffer_pct: 10,
    cost_unit: 95,
    status: "not_started",
  },
  {
    id: "sui-favor-tag",
    section: "post_wedding",
    kind: "favor_tag",
    name: "Favor Tags / Mithai Box Inserts",
    description:
      "Tag for wedding favors or mithai boxes — a small card that reads as a thank-you in miniature.",
    enabled: false,
    delivery_mode: "Printed tag + twine",
    quantity: 400,
    buffer_pct: 5,
    cost_unit: 40,
    status: "not_started",
  },
];

// ── Per-piece content drafts ──────────────────────────────────────────────
// Only seeded for a few flagship pieces so the couple sees the pattern;
// everything else starts blank.

export const SEED_STATIONERY_PIECE_CONTENT: StationeryPieceContent[] = [
  {
    item_id: "sui-main-invitation",
    couple_line: "Priya & Raj",
    family_line: "Sharma & Malhotra families",
    host_line: "Together with their families",
    main_text:
      "Request the pleasure of your company at the wedding celebration of their children",
    translation_language: "Hindi",
    translation:
      "हम आपको अपने परिवार के विवाहोत्सव में सादर आमंत्रित करते हैं",
    event_date: "Saturday, April 12, 2026",
    venue_name: "The Leela Palace, Dallas",
    venue_address: "200 N Pearl St, Dallas, TX 75201",
    dress_code: "Indian formal",
  },
  {
    item_id: "sui-mehendi-insert",
    main_text: "Mehendi afternoon — bring your palms, leave with stories.",
    event_date: "Thursday, April 10, 2026 · 2:00 PM",
    venue_name: "Sharma Residence, Plano",
    dress_code: "Garden casual · yellows & greens",
  },
  {
    item_id: "sui-sangeet-insert",
    main_text: "Sangeet — we've been rehearsing since November. Come dance.",
    event_date: "Friday, April 11, 2026 · 7:30 PM",
    venue_name: "The Ritz-Carlton, Dallas",
    dress_code: "Cocktail Indian · jewel tones",
  },
];

// ── Production timeline milestones ────────────────────────────────────────
// Canonical ordered sequence from the spec. Stored as a seed so a couple
// who deletes an item can always restore it from the catalogue.

export const SEED_STATIONERY_TIMELINE_MILESTONES: StationeryTimelineMilestone[] =
  [
    { id: "m6-visual-identity", bucket: "6_months_out", label: "Visual identity finalized" },
    { id: "m6-suite-decided", bucket: "6_months_out", label: "Suite components decided" },
    { id: "m6-vendor", bucket: "6_months_out", label: "Vendor selected and contracted" },

    { id: "m5-std-content", bucket: "5_months_out", label: "Save the date — content finalized" },
    { id: "m5-std-proof-1", bucket: "5_months_out", label: "Save the date — design proof #1" },

    { id: "m4-std-approved", bucket: "4_months_out", label: "Save the date — approved and printed" },
    { id: "m4-std-mailed", bucket: "4_months_out", label: "Save the date — mailed / sent digitally" },
    { id: "m4-main-content", bucket: "4_months_out", label: "Main invitation — content finalized (all languages)" },
    { id: "m4-main-proof-1", bucket: "4_months_out", label: "Main invitation — design proof #1" },

    { id: "m3-main-proof-final", bucket: "3_months_out", label: "Main invitation — design proof #2 (final)" },
    { id: "m3-main-print", bucket: "3_months_out", label: "Main invitation — print run begins" },
    { id: "m3-event-content", bucket: "3_months_out", label: "Event cards — content finalized" },
    { id: "m3-rsvp-form", bucket: "3_months_out", label: "RSVP mechanism — online form built and tested" },

    { id: "m2-suite-printed", bucket: "2_months_out", label: "Full suite printed and delivered" },
    { id: "m2-assembly", bucket: "2_months_out", label: "Assembly — stuffing, ribboning, sealing" },
    { id: "m2-addressing", bucket: "2_months_out", label: "Address envelopes (calligraphy or printed labels)" },
    { id: "m2-mailed", bucket: "2_months_out", label: "Mail suite to guests" },
    { id: "m2-rsvp-tracking", bucket: "2_months_out", label: "RSVP tracking begins" },

    { id: "m1-rsvp-deadline", bucket: "1_month_out", label: "RSVP deadline" },
    { id: "m1-followup", bucket: "1_month_out", label: "Follow up with non-responders" },
    { id: "m1-menu", bucket: "1_month_out", label: "Menu cards — finalized (after RSVP dietary info collected)" },
    { id: "m1-place-cards", bucket: "1_month_out", label: "Place cards — names confirmed" },
    { id: "m1-program", bucket: "1_month_out", label: "Ceremony program — content finalized with Officiant" },

    { id: "w1-day-of", bucket: "1_week_out", label: "Day-of pieces delivered (menu, program, place, table numbers)" },
    { id: "w1-welcome-bag", bucket: "1_week_out", label: "Welcome bag inserts printed" },

    { id: "post-ty-designed", bucket: "post_wedding", label: "Thank you cards — designed" },
    { id: "post-ty-mailed", bucket: "post_wedding", label: "Thank you cards — addressed and mailed within 6 weeks" },
  ];

// ── Documents binder ──────────────────────────────────────────────────────

export const SEED_STATIONERY_DOCUMENTS: StationeryDocument[] = [
  {
    id: "doc-main-proof-v3",
    kind: "proof",
    title: "Main invitation — proof v3 (warm ivory)",
    url: "https://drive.example.com/main-invite-v3.pdf",
    note: "Warm ivory #F5ECD8, production-ready. Waiting on couple sign-off.",
    created_at: "2026-04-15T09:40:00Z",
    item_id: "sui-main-invitation",
  },
  {
    id: "doc-bond-quote",
    kind: "quote",
    title: "Bond Street Press — full-suite quote",
    url: "https://drive.example.com/bond-street-quote.pdf",
    note: "Letterpress cotton, 6-week turnaround, 2 rounds of proofs included.",
    created_at: "2026-02-28T17:00:00Z",
  },
  {
    id: "doc-content-main",
    kind: "content_draft",
    title: "Main invitation — final copy (English + Hindi)",
    url: "https://docs.example.com/main-invite-copy",
    note: "Signed off by both sets of parents on 2026-03-22.",
    created_at: "2026-03-22T20:15:00Z",
    item_id: "sui-main-invitation",
  },
  {
    id: "doc-print-spec",
    kind: "print_spec",
    title: "Print spec sheet — cotton weights + foil color chips",
    url: "https://drive.example.com/print-spec-2026.pdf",
    created_at: "2026-03-02T10:00:00Z",
  },
  {
    id: "doc-ship-std",
    kind: "shipping",
    title: "Save-the-date shipping confirmation",
    url: "https://tracking.example.com/std-batch",
    note: "Delivered 2026-04-10 across 162 domestic households.",
    created_at: "2026-04-10T18:00:00Z",
    item_id: "sui-save-the-date",
  },
];

// ── Guest print matrix (tiered who-gets-what planning) ────────────────────

export const SEED_STATIONERY_TIERS: StationeryGuestTier[] = [
  {
    id: "tier-immediate",
    label: "Immediate family",
    households: 12,
    description: "Parents, siblings, grandparents. Full printed suite.",
    sort_order: 0,
  },
  {
    id: "tier-extended",
    label: "Extended family",
    households: 38,
    description: "Aunts, uncles, cousins. Printed mail everyone expects.",
    sort_order: 1,
  },
  {
    id: "tier-close-friends",
    label: "Close friends",
    households: 34,
    description: "Childhood, college, chosen family. Mostly printed.",
    sort_order: 2,
  },
  {
    id: "tier-colleagues",
    label: "Colleagues",
    households: 26,
    description: "Work circles. Digital-first; wedding card only for seniors.",
    sort_order: 3,
  },
  {
    id: "tier-casual",
    label: "Casual guests",
    households: 30,
    description: "Reception-only guests. Digital invites + QR RSVP.",
    sort_order: 4,
  },
];

function buildSeedMatrix(
  rows: Array<[string, Partial<Record<StationeryMatrixPiece, StationeryMatrixMode>>]>,
): StationeryMatrixCells {
  const out: StationeryMatrixCells = {};
  for (const [tierId, modes] of rows) {
    for (const [piece, mode] of Object.entries(modes)) {
      out[matrixCellKey(tierId, piece as StationeryMatrixPiece)] =
        mode as StationeryMatrixMode;
    }
  }
  return out;
}

export const SEED_STATIONERY_MATRIX_CELLS: StationeryMatrixCells =
  buildSeedMatrix([
    [
      "tier-immediate",
      {
        save_the_date: "printed",
        main_invitation: "printed",
        event_insert: "printed",
        menu_card: "printed",
        ceremony_program: "printed",
      },
    ],
    [
      "tier-extended",
      {
        save_the_date: "printed",
        main_invitation: "printed",
        event_insert: "printed",
        menu_card: "printed",
        ceremony_program: "omit",
      },
    ],
    [
      "tier-close-friends",
      {
        save_the_date: "digital",
        main_invitation: "printed",
        event_insert: "printed",
        menu_card: "omit",
        ceremony_program: "omit",
      },
    ],
    [
      "tier-colleagues",
      {
        save_the_date: "digital",
        main_invitation: "digital",
        event_insert: "omit",
        menu_card: "omit",
        ceremony_program: "omit",
      },
    ],
    [
      "tier-casual",
      {
        save_the_date: "omit",
        main_invitation: "digital",
        event_insert: "omit",
        menu_card: "omit",
        ceremony_program: "omit",
      },
    ],
  ]);
