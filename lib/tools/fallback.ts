// ──────────────────────────────────────────────────────────────────────────
// Tools catalog fallback.
//
// Returned by data-access helpers when Supabase isn't reachable (missing
// env vars in local dev, migration not yet applied, transient outage).
// Mirrors the seed in
// supabase/migrations/0022_marigold_budget_tools_schema.sql so the public
// Tools surface keeps rendering.
// ──────────────────────────────────────────────────────────────────────────

import type { ToolCatalogRow } from "@/types/tools";

export const FALLBACK_TOOLS_CATALOG: ToolCatalogRow[] = [
  {
    id: "fallback-budget",
    slug: "budget",
    name: "Shaadi Budget™",
    tagline: "the budget tool that actually gets indian weddings",
    description:
      "Mehndi to vidaai. Five tiers from sensible to absurd. Real numbers from real weddings — no generic spreadsheet templates.",
    icon_or_image: null,
    cta_label: "Try it free",
    cta_route: "/tools/budget",
    stats: [{ label: "30+ destinations" }, { label: "$150K–$5M range" }],
    display_order: 10,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-destinations",
    slug: "destinations",
    name: "Destination Explorer",
    tagline: "udaipur to lake como, what it really costs",
    description:
      "A real-money breakdown for 30+ destinations. What 200 guests actually costs in Goa vs Dallas vs Lake Como — with vendors who travel there.",
    icon_or_image: null,
    cta_label: "Explore destinations",
    cta_route: "/tools/destinations",
    stats: [{ label: "30+ destinations" }, { label: "Indian-wedding calibrated" }],
    display_order: 20,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-match",
    slug: "match",
    name: "Match Me",
    tagline: "tell us your budget, we'll show you where you can go",
    description:
      "Punch in your number, your guest count, the things you actually care about. We'll show you the destinations that fit — top to bottom, with reasons.",
    icon_or_image: null,
    cta_label: "Match me",
    cta_route: "/tools/match",
    stats: [{ label: "Reverse search" }, { label: "Budget + vibe matched" }],
    display_order: 30,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-visualizer",
    slug: "visualizer",
    name: "Weekend Visualizer",
    tagline: "see your whole wedding weekend before you plan a thing",
    description:
      "Pick your events, pick your style. We'll show you how your 3-day celebration actually flows — hour by hour, outfit change by outfit change.",
    icon_or_image: "📅",
    cta_label: "Visualize your weekend",
    cta_route: "/tools/visualizer",
    stats: [{ label: "Multi-event" }, { label: "Culturally aware" }],
    display_order: 35,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-ready",
    slug: "ready",
    name: "Am I Ready?",
    tagline: "how behind are you, really — and what to do about it",
    description:
      "Answer 8 questions. We'll tell you exactly where you stand and what to lock down this week — whether you're 18 months out or 18 weeks.",
    icon_or_image: "✓",
    cta_label: "Check your readiness",
    cta_route: "/tools/ready",
    stats: [
      { label: "2-minute assessment" },
      { label: "South Asian calibrated" },
    ],
    display_order: 38,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-shagun",
    slug: "shagun-calculator",
    name: "Shagun Calculator",
    tagline: "how much do you actually give — no, $100 is not the answer",
    description:
      "Your relationship, their wedding, your tradition — we'll give you the real number. No more Googling in the venue parking lot.",
    icon_or_image: null,
    cta_label: "Calculate shagun",
    cta_route: "/tools/shagun",
    stats: [
      { label: "US-dollar calibrated" },
      { label: "Every relationship tier" },
    ],
    display_order: 40,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-kundli",
    slug: "kundli",
    name: "Kundli Match",
    tagline: "do your stars actually align — or is that just a saying",
    description:
      "Enter both birth details. Get your full 36-point Ashtakoota compatibility report — with a translation your parents AND your partner can both understand.",
    icon_or_image: "✦",
    cta_label: "Match your kundli",
    cta_route: "/tools/kundli",
    stats: [{ label: "36 Guna Milan" }, { label: "Dosha analysis included" }],
    display_order: 22,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-wedding-stars",
    slug: "wedding-stars",
    name: "Wedding Stars",
    tagline: "your cosmic calendar for every big decision",
    description:
      "Enter your Moon sign and wedding date. We'll map the next 12 months of planetary windows — when to book vendors, when to pause, and when the stars are practically begging you to go dress shopping.",
    icon_or_image: "✦",
    cta_label: "Read your stars",
    cta_route: "/tools/wedding-stars",
    stats: [
      { label: "Vedic transit based" },
      { label: "Personalized timeline" },
    ],
    display_order: 23,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-dates",
    slug: "date-picker",
    name: "Auspicious Date Finder",
    tagline: "when the stars say yes and so does your venue",
    description:
      "See every shubh muhurat, blocked period, and auspicious window for 2026 and 2027 — filtered by your tradition, your city, and your Saturday-or-bust requirements.",
    icon_or_image: "✦",
    cta_label: "Find your date",
    cta_route: "/tools/dates",
    stats: [{ label: "Multi-tradition" }, { label: "US venue seasons layered" }],
    display_order: 25,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-guests",
    slug: "guest-list-estimator",
    name: "Guest Count Estimator",
    tagline: "your parents say 400. your fiancé says 150. find the real number.",
    description:
      "Build your guest list from the ground up — both sides, every tier, every event. Finally, a number everyone can argue about with data.",
    icon_or_image: "👥",
    cta_label: "Estimate your count",
    cta_route: "/tools/guests",
    stats: [
      { label: "Both-sides breakdown" },
      { label: "Per-event estimates" },
    ],
    display_order: 36,
    active: true,
    status: "live",
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-vendor-match",
    slug: "vendor-match-quiz",
    name: "Vendor Match Quiz",
    tagline: "eight questions, twenty vendors that actually fit",
    description:
      "Style. Budget. Culture. Vibe. Eight questions and we narrow 50,000 vendors down to the ones who shoot weddings like yours.",
    icon_or_image: null,
    cta_label: "Notify me",
    cta_route: "/tools/vendor-match-quiz",
    stats: [{ label: "Coming soon" }],
    display_order: 70,
    active: true,
    status: "coming_soon",
    created_at: new Date(0).toISOString(),
  },
];

export function findFallbackTool(slug: string): ToolCatalogRow | null {
  return FALLBACK_TOOLS_CATALOG.find((t) => t.slug === slug) ?? null;
}
