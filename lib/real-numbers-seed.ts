// ── Real Numbers seed data ────────────────────────────────────────────────
// Realistic anonymized cost breakdowns across a mix of cities, cultures, and
// guest counts. The seed hydrates once (gated by `seeded: true`) so the
// browsing experience isn't an empty state on first visit. All figures are
// integer cents (USD).

import type { WorkspaceCategorySlug } from "@/types/workspace";
import type {
  CostItem,
  CostSubmission,
  CulturalTradition,
  WeddingStyle,
  WorthIt,
} from "@/types/real-numbers";

function uid(prefix: string, idx: number): string {
  return `${prefix}_seed_${idx.toString(36)}`;
}

interface SeedRow {
  city: string;
  state: string;
  month: number;
  year: number;
  guest_count: number;
  days: number;
  events: number;
  styles: WeddingStyle[];
  cultures: CulturalTradition[];
  advice: string;
  helpful: number;
  // budgeted / actual / worth_it per category
  items: Array<{
    cat: WorkspaceCategorySlug;
    budget: number; // dollars (converted to cents below)
    actual: number;
    worth: WorthIt;
  }>;
}

const ROWS: SeedRow[] = [
  {
    city: "Dallas",
    state: "TX",
    month: 11,
    year: 2026,
    guest_count: 150,
    days: 3,
    events: 4,
    styles: ["modern", "luxury"],
    cultures: ["south_asian"],
    advice:
      "Budget 20% more for catering than you think. And invest in a good photographer — those are the only things that last.",
    helpful: 23,
    items: [
      { cat: "venue", budget: 25000, actual: 27500, worth: "absolutely" },
      { cat: "catering", budget: 18000, actual: 21000, worth: "fair" },
      { cat: "decor_florals", budget: 12000, actual: 15500, worth: "absolutely" },
      { cat: "photography", budget: 6000, actual: 7200, worth: "absolutely" },
      { cat: "videography", budget: 4000, actual: 4000, worth: "fair" },
      { cat: "entertainment", budget: 2000, actual: 2000, worth: "fair" },
      { cat: "hmua", budget: 1500, actual: 1800, worth: "absolutely" },
      { cat: "wardrobe", budget: 8000, actual: 9500, worth: "absolutely" },
      { cat: "stationery", budget: 2000, actual: 2400, worth: "overpaid" },
      { cat: "mehndi", budget: 800, actual: 1200, worth: "fair" },
      { cat: "jewelry", budget: 2000, actual: 2000, worth: "absolutely" },
    ],
  },
  {
    city: "Houston",
    state: "TX",
    month: 3,
    year: 2027,
    guest_count: 250,
    days: 4,
    events: 5,
    styles: ["traditional", "grand"],
    cultures: ["south_asian"],
    advice:
      "For a multi-day wedding, decor eats way more than you expect — mandap, stage, lounges, three event backdrops. Get itemized quotes.",
    helpful: 41,
    items: [
      { cat: "venue", budget: 38000, actual: 42000, worth: "absolutely" },
      { cat: "catering", budget: 32000, actual: 38000, worth: "fair" },
      { cat: "decor_florals", budget: 22000, actual: 28000, worth: "absolutely" },
      { cat: "photography", budget: 8000, actual: 9500, worth: "absolutely" },
      { cat: "videography", budget: 6000, actual: 6500, worth: "absolutely" },
      { cat: "entertainment", budget: 5000, actual: 5800, worth: "absolutely" },
      { cat: "hmua", budget: 3200, actual: 3500, worth: "absolutely" },
      { cat: "wardrobe", budget: 10000, actual: 11000, worth: "absolutely" },
      { cat: "stationery", budget: 2500, actual: 2400, worth: "fair" },
      { cat: "mehndi", budget: 1200, actual: 1500, worth: "absolutely" },
      { cat: "jewelry", budget: 2500, actual: 2800, worth: "fair" },
      { cat: "transportation", budget: 3000, actual: 3200, worth: "fair" },
    ],
  },
  {
    city: "Dallas",
    state: "TX",
    month: 2,
    year: 2026,
    guest_count: 110,
    days: 2,
    events: 3,
    styles: ["modern", "minimalist"],
    cultures: ["south_asian"],
    advice: "Skip the elaborate favors. Nobody remembered them.",
    helpful: 12,
    items: [
      { cat: "venue", budget: 18000, actual: 19500, worth: "absolutely" },
      { cat: "catering", budget: 14000, actual: 15800, worth: "fair" },
      { cat: "decor_florals", budget: 8000, actual: 9200, worth: "absolutely" },
      { cat: "photography", budget: 5500, actual: 5500, worth: "absolutely" },
      { cat: "videography", budget: 3500, actual: 3500, worth: "fair" },
      { cat: "entertainment", budget: 1800, actual: 1800, worth: "fair" },
      { cat: "hmua", budget: 1200, actual: 1500, worth: "absolutely" },
      { cat: "wardrobe", budget: 6500, actual: 7800, worth: "absolutely" },
      { cat: "stationery", budget: 1200, actual: 1100, worth: "fair" },
      { cat: "gifting", budget: 800, actual: 1000, worth: "overpaid" },
    ],
  },
  {
    city: "Dallas",
    state: "TX",
    month: 5,
    year: 2026,
    guest_count: 200,
    days: 3,
    events: 4,
    styles: ["classic", "grand"],
    cultures: ["south_asian"],
    advice:
      "Tips can silently add 10–15%. Budget them explicitly per vendor instead of scrambling the week-of.",
    helpful: 34,
    items: [
      { cat: "venue", budget: 30000, actual: 32000, worth: "absolutely" },
      { cat: "catering", budget: 26000, actual: 29500, worth: "fair" },
      { cat: "decor_florals", budget: 15000, actual: 18500, worth: "absolutely" },
      { cat: "photography", budget: 7000, actual: 8200, worth: "absolutely" },
      { cat: "videography", budget: 5000, actual: 5000, worth: "fair" },
      { cat: "entertainment", budget: 3000, actual: 3500, worth: "fair" },
      { cat: "hmua", budget: 2200, actual: 2400, worth: "absolutely" },
      { cat: "wardrobe", budget: 9000, actual: 10500, worth: "absolutely" },
      { cat: "pandit_ceremony", budget: 1500, actual: 1500, worth: "absolutely" },
      { cat: "mehndi", budget: 900, actual: 900, worth: "absolutely" },
      { cat: "stationery", budget: 1800, actual: 2000, worth: "overpaid" },
    ],
  },
  {
    city: "Dallas",
    state: "TX",
    month: 10,
    year: 2025,
    guest_count: 175,
    days: 3,
    events: 4,
    styles: ["modern"],
    cultures: ["south_asian", "fusion"],
    advice:
      "Hire a day-of coordinator even if you plan yourself. It saved us from three separate meltdowns.",
    helpful: 28,
    items: [
      { cat: "venue", budget: 26000, actual: 28000, worth: "absolutely" },
      { cat: "catering", budget: 20000, actual: 22800, worth: "absolutely" },
      { cat: "decor_florals", budget: 13000, actual: 16200, worth: "absolutely" },
      { cat: "photography", budget: 6500, actual: 6500, worth: "absolutely" },
      { cat: "videography", budget: 4500, actual: 4500, worth: "absolutely" },
      { cat: "entertainment", budget: 2500, actual: 2800, worth: "fair" },
      { cat: "hmua", budget: 1800, actual: 2100, worth: "absolutely" },
      { cat: "wardrobe", budget: 8500, actual: 10200, worth: "absolutely" },
      { cat: "stationery", budget: 1500, actual: 1800, worth: "overpaid" },
      { cat: "transportation", budget: 1800, actual: 2100, worth: "fair" },
    ],
  },
  {
    city: "Austin",
    state: "TX",
    month: 4,
    year: 2026,
    guest_count: 90,
    days: 1,
    events: 1,
    styles: ["bohemian", "intimate"],
    cultures: ["western"],
    advice:
      "We did one long ceremony-reception and spent it all on food and photography. Zero regrets.",
    helpful: 18,
    items: [
      { cat: "venue", budget: 12000, actual: 13500, worth: "absolutely" },
      { cat: "catering", budget: 11000, actual: 12800, worth: "absolutely" },
      { cat: "decor_florals", budget: 6000, actual: 7200, worth: "absolutely" },
      { cat: "photography", budget: 5500, actual: 5500, worth: "absolutely" },
      { cat: "videography", budget: 2500, actual: 2500, worth: "fair" },
      { cat: "entertainment", budget: 2000, actual: 2200, worth: "fair" },
      { cat: "hmua", budget: 800, actual: 900, worth: "absolutely" },
      { cat: "wardrobe", budget: 3500, actual: 4200, worth: "absolutely" },
      { cat: "stationery", budget: 700, actual: 800, worth: "fair" },
    ],
  },
  {
    city: "Houston",
    state: "TX",
    month: 12,
    year: 2025,
    guest_count: 180,
    days: 3,
    events: 4,
    styles: ["traditional"],
    cultures: ["south_asian"],
    advice: "",
    helpful: 9,
    items: [
      { cat: "venue", budget: 22000, actual: 24000, worth: "fair" },
      { cat: "catering", budget: 19000, actual: 22000, worth: "fair" },
      { cat: "decor_florals", budget: 11000, actual: 13500, worth: "absolutely" },
      { cat: "photography", budget: 5500, actual: 6000, worth: "absolutely" },
      { cat: "videography", budget: 3800, actual: 3800, worth: "fair" },
      { cat: "entertainment", budget: 2200, actual: 2400, worth: "fair" },
      { cat: "hmua", budget: 1600, actual: 1800, worth: "absolutely" },
      { cat: "wardrobe", budget: 7500, actual: 8800, worth: "absolutely" },
      { cat: "pandit_ceremony", budget: 1200, actual: 1200, worth: "absolutely" },
    ],
  },
  {
    city: "Chicago",
    state: "IL",
    month: 6,
    year: 2026,
    guest_count: 220,
    days: 3,
    events: 4,
    styles: ["grand", "luxury"],
    cultures: ["south_asian"],
    advice:
      "Chicago venues charge a premium for weekend dates. A Friday wedding saved us ~$8K with barely any guest drop-off.",
    helpful: 36,
    items: [
      { cat: "venue", budget: 45000, actual: 48000, worth: "absolutely" },
      { cat: "catering", budget: 32000, actual: 36000, worth: "fair" },
      { cat: "decor_florals", budget: 20000, actual: 25000, worth: "absolutely" },
      { cat: "photography", budget: 8500, actual: 9500, worth: "absolutely" },
      { cat: "videography", budget: 6000, actual: 6000, worth: "absolutely" },
      { cat: "entertainment", budget: 5500, actual: 6200, worth: "absolutely" },
      { cat: "hmua", budget: 2800, actual: 3200, worth: "absolutely" },
      { cat: "wardrobe", budget: 11000, actual: 12500, worth: "absolutely" },
      { cat: "jewelry", budget: 3500, actual: 3500, worth: "absolutely" },
      { cat: "stationery", budget: 2800, actual: 3200, worth: "overpaid" },
      { cat: "transportation", budget: 3500, actual: 3800, worth: "fair" },
    ],
  },
  {
    city: "New York",
    state: "NY",
    month: 9,
    year: 2026,
    guest_count: 140,
    days: 2,
    events: 3,
    styles: ["modern", "luxury"],
    cultures: ["south_asian", "fusion"],
    advice:
      "NYC venues quote before tax, service charge, and admin fee. Our $18K venue became $26K by the time we signed.",
    helpful: 52,
    items: [
      { cat: "venue", budget: 35000, actual: 42000, worth: "fair" },
      { cat: "catering", budget: 28000, actual: 32000, worth: "fair" },
      { cat: "decor_florals", budget: 15000, actual: 19500, worth: "absolutely" },
      { cat: "photography", budget: 9000, actual: 10500, worth: "absolutely" },
      { cat: "videography", budget: 6500, actual: 6500, worth: "absolutely" },
      { cat: "entertainment", budget: 4000, actual: 4500, worth: "fair" },
      { cat: "hmua", budget: 2500, actual: 2800, worth: "absolutely" },
      { cat: "wardrobe", budget: 12000, actual: 14500, worth: "absolutely" },
      { cat: "stationery", budget: 3000, actual: 3500, worth: "overpaid" },
    ],
  },
  {
    city: "Chicago",
    state: "IL",
    month: 8,
    year: 2025,
    guest_count: 160,
    days: 2,
    events: 3,
    styles: ["classic"],
    cultures: ["south_asian"],
    advice: "",
    helpful: 14,
    items: [
      { cat: "venue", budget: 28000, actual: 30000, worth: "absolutely" },
      { cat: "catering", budget: 22000, actual: 24500, worth: "fair" },
      { cat: "decor_florals", budget: 12000, actual: 14500, worth: "absolutely" },
      { cat: "photography", budget: 6000, actual: 6800, worth: "absolutely" },
      { cat: "videography", budget: 4000, actual: 4000, worth: "fair" },
      { cat: "entertainment", budget: 2500, actual: 2500, worth: "fair" },
      { cat: "hmua", budget: 1800, actual: 2000, worth: "absolutely" },
      { cat: "wardrobe", budget: 8500, actual: 9500, worth: "absolutely" },
      { cat: "stationery", budget: 1800, actual: 2000, worth: "overpaid" },
    ],
  },
  {
    city: "Atlanta",
    state: "GA",
    month: 11,
    year: 2025,
    guest_count: 300,
    days: 3,
    events: 5,
    styles: ["grand", "traditional"],
    cultures: ["south_asian"],
    advice:
      "350+ guest weddings need professional planners. We saved maybe $12K DIY-ing and lost easily that much in vendor gotchas.",
    helpful: 47,
    items: [
      { cat: "venue", budget: 40000, actual: 44000, worth: "absolutely" },
      { cat: "catering", budget: 38000, actual: 45000, worth: "fair" },
      { cat: "decor_florals", budget: 22000, actual: 28500, worth: "absolutely" },
      { cat: "photography", budget: 8000, actual: 9200, worth: "absolutely" },
      { cat: "videography", budget: 6000, actual: 6500, worth: "absolutely" },
      { cat: "entertainment", budget: 5000, actual: 6000, worth: "absolutely" },
      { cat: "hmua", budget: 3000, actual: 3400, worth: "absolutely" },
      { cat: "wardrobe", budget: 10000, actual: 11500, worth: "absolutely" },
      { cat: "pandit_ceremony", budget: 1500, actual: 1500, worth: "absolutely" },
      { cat: "transportation", budget: 4000, actual: 4500, worth: "fair" },
      { cat: "stationery", budget: 2500, actual: 2800, worth: "overpaid" },
    ],
  },
  {
    city: "San Francisco",
    state: "CA",
    month: 7,
    year: 2026,
    guest_count: 120,
    days: 2,
    events: 3,
    styles: ["modern", "minimalist"],
    cultures: ["fusion"],
    advice:
      "Bay Area pricing is its own universe. Look outside the city (wine country, peninsula) for better venue value.",
    helpful: 31,
    items: [
      { cat: "venue", budget: 32000, actual: 36000, worth: "fair" },
      { cat: "catering", budget: 24000, actual: 28000, worth: "fair" },
      { cat: "decor_florals", budget: 14000, actual: 17000, worth: "absolutely" },
      { cat: "photography", budget: 8000, actual: 9000, worth: "absolutely" },
      { cat: "videography", budget: 5500, actual: 5500, worth: "absolutely" },
      { cat: "entertainment", budget: 3500, actual: 3800, worth: "fair" },
      { cat: "hmua", budget: 2200, actual: 2500, worth: "absolutely" },
      { cat: "wardrobe", budget: 7500, actual: 8800, worth: "absolutely" },
      { cat: "stationery", budget: 1800, actual: 2000, worth: "fair" },
    ],
  },
  {
    city: "Dallas",
    state: "TX",
    month: 6,
    year: 2025,
    guest_count: 60,
    days: 1,
    events: 2,
    styles: ["intimate", "minimalist"],
    cultures: ["south_asian"],
    advice:
      "Tiny wedding, zero regrets. Spent what most people spend on the venue on the photographer and honeymoon instead.",
    helpful: 22,
    items: [
      { cat: "venue", budget: 8000, actual: 8800, worth: "absolutely" },
      { cat: "catering", budget: 7500, actual: 8200, worth: "absolutely" },
      { cat: "decor_florals", budget: 4500, actual: 5200, worth: "absolutely" },
      { cat: "photography", budget: 5500, actual: 5500, worth: "absolutely" },
      { cat: "hmua", budget: 900, actual: 1100, worth: "absolutely" },
      { cat: "wardrobe", budget: 4500, actual: 5500, worth: "absolutely" },
      { cat: "entertainment", budget: 800, actual: 900, worth: "fair" },
    ],
  },
  {
    city: "Seattle",
    state: "WA",
    month: 9,
    year: 2025,
    guest_count: 130,
    days: 2,
    events: 3,
    styles: ["modern", "bohemian"],
    cultures: ["south_asian"],
    advice: "",
    helpful: 11,
    items: [
      { cat: "venue", budget: 20000, actual: 22500, worth: "absolutely" },
      { cat: "catering", budget: 16000, actual: 18500, worth: "fair" },
      { cat: "decor_florals", budget: 10000, actual: 12000, worth: "absolutely" },
      { cat: "photography", budget: 6000, actual: 6800, worth: "absolutely" },
      { cat: "videography", budget: 4000, actual: 4000, worth: "fair" },
      { cat: "entertainment", budget: 2200, actual: 2500, worth: "fair" },
      { cat: "hmua", budget: 1600, actual: 1800, worth: "absolutely" },
      { cat: "wardrobe", budget: 7000, actual: 8200, worth: "absolutely" },
      { cat: "stationery", budget: 1300, actual: 1400, worth: "fair" },
    ],
  },
];

export function buildRealNumbersSeed(): {
  submissions: CostSubmission[];
  items: CostItem[];
} {
  const submissions: CostSubmission[] = [];
  const items: CostItem[] = [];

  ROWS.forEach((row, idx) => {
    const subId = uid("sub", idx);
    const totalBudget = row.items.reduce((s, it) => s + it.budget, 0) * 100;
    const totalActual = row.items.reduce((s, it) => s + it.actual, 0) * 100;
    const publishedAt = new Date(
      Date.UTC(row.year, Math.max(0, row.month - 1) + 1, 10),
    ).toISOString();

    submissions.push({
      id: subId,
      wedding_city: row.city,
      wedding_state: row.state,
      wedding_country: "US",
      wedding_month: row.month,
      wedding_year: row.year,
      guest_count: row.guest_count,
      wedding_style: row.styles,
      cultural_tradition: row.cultures,
      wedding_duration_days: row.days,
      number_of_events: row.events,
      total_budget_cents: totalBudget,
      total_actual_cents: totalActual,
      advice_text: row.advice,
      is_published: true,
      published_at: publishedAt,
      auto_populated: true,
      manually_adjusted: false,
      helpful_count: row.helpful,
      created_at: publishedAt,
      updated_at: publishedAt,
    });

    row.items.forEach((it, jdx) => {
      items.push({
        id: uid(`item_${idx}`, jdx),
        submission_id: subId,
        vendor_category: it.cat,
        budgeted_cents: it.budget * 100,
        actual_cents: it.actual * 100,
        vendor_count: 1,
        includes_tip: false,
        notes: "",
        worth_it: it.worth,
        created_at: publishedAt,
      });
    });
  });

  return { submissions, items };
}
