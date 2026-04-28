// ── Gifting discovery catalog ─────────────────────────────────────────────
// Read-only data powering the Gifting Vision & Mood tab: a direction picker
// for overall aesthetic, budget-comfort anchors per sub-category, and idea
// catalogs the couple reacts to. Loved ideas surface inside the sub-tabs
// (Welcome Bags, Return Favors, Trousseau) as pre-filled item cards.

export type GiftReaction = "love" | "not_this";

// ── Gift style direction ──────────────────────────────────────────────────

export interface GiftStyleDirection {
  id:
    | "traditional_heritage"
    | "modern_curated"
    | "eco_sustainable"
    | "luxury_premium"
    | "diy_personal";
  label: string;
  description: string;
  emoji: string;
  palette: [string, string, string];
}

export const GIFT_STYLE_DIRECTIONS: GiftStyleDirection[] = [
  {
    id: "traditional_heritage",
    label: "Traditional & heritage",
    description:
      "Shagun envelopes, silver items, dry-fruit boxes in decorative trays, mithai hampers.",
    emoji: "🪔",
    palette: ["#b7532c", "#f3d7a3", "#c98a3c"],
  },
  {
    id: "modern_curated",
    label: "Modern & curated",
    description:
      "Custom hampers, artisanal products, personalized items, editorial wrapping.",
    emoji: "🎁",
    palette: ["#6a7f5e", "#e8e4d8", "#a89d7f"],
  },
  {
    id: "eco_sustainable",
    label: "Eco-friendly & sustainable",
    description:
      "Plantable favors, seed packets, reusable items, recycled paper packaging.",
    emoji: "🌱",
    palette: ["#7a8f5b", "#dee6c7", "#c4a66f"],
  },
  {
    id: "luxury_premium",
    label: "Luxury & premium",
    description:
      "Designer items, branded gifts, high-end packaging, gold-foil monograms.",
    emoji: "✨",
    palette: ["#8a6a1f", "#efe2b4", "#3a3028"],
  },
  {
    id: "diy_personal",
    label: "DIY & personal",
    description:
      "Handmade items, family recipes, custom artwork, letters from the couple.",
    emoji: "💌",
    palette: ["#c16a74", "#f3dede", "#8a6a6a"],
  },
];

// ── Budget comfort ────────────────────────────────────────────────────────

export interface GiftBudgetCategory {
  id:
    | "welcome_bags"
    | "return_favors"
    | "family_exchanges"
    | "trousseau_packaging";
  label: string;
  unit: string; // e.g. "per bag", "per guest"
  ranges: { id: string; label: string; perUnit: [number, number] | null }[];
  scope: "per_unit" | "total";
}

export const GIFT_BUDGET_CATEGORIES: GiftBudgetCategory[] = [
  {
    id: "welcome_bags",
    label: "Welcome bags",
    unit: "per bag",
    scope: "per_unit",
    ranges: [
      { id: "lean", label: "$15–30", perUnit: [15, 30] },
      { id: "mid", label: "$30–60", perUnit: [30, 60] },
      { id: "premium", label: "$60–120", perUnit: [60, 120] },
      { id: "luxe", label: "$120+", perUnit: [120, 250] },
    ],
  },
  {
    id: "return_favors",
    label: "Return favors",
    unit: "per guest",
    scope: "per_unit",
    ranges: [
      { id: "token", label: "$5–15", perUnit: [5, 15] },
      { id: "mid", label: "$15–35", perUnit: [15, 35] },
      { id: "premium", label: "$35–75", perUnit: [35, 75] },
      { id: "luxe", label: "$75+", perUnit: [75, 150] },
    ],
  },
  {
    id: "family_exchanges",
    label: "Family exchanges",
    unit: "per family",
    scope: "per_unit",
    ranges: [
      { id: "lean", label: "$100–300", perUnit: [100, 300] },
      { id: "mid", label: "$300–750", perUnit: [300, 750] },
      { id: "premium", label: "$750–2,000", perUnit: [750, 2000] },
      { id: "luxe", label: "$2,000+", perUnit: [2000, 5000] },
    ],
  },
  {
    id: "trousseau_packaging",
    label: "Trousseau packaging",
    unit: "total budget",
    scope: "total",
    ranges: [
      { id: "lean", label: "$500–1.5k", perUnit: [500, 1500] },
      { id: "mid", label: "$1.5k–4k", perUnit: [1500, 4000] },
      { id: "premium", label: "$4k–10k", perUnit: [4000, 10000] },
      { id: "luxe", label: "$10k+", perUnit: [10000, 25000] },
    ],
  },
];

// ── Gift idea catalog ─────────────────────────────────────────────────────

export type GiftIdeaCategory =
  | "welcome_bags"
  | "return_favors"
  | "trousseau_packaging"
  | "family_exchanges";

export interface GiftIdea {
  id: string;
  category: GiftIdeaCategory;
  name: string;
  description: string;
  estUnitCost: number; // USD per-unit average
  emoji: string;
  tags: string[];
}

export const GIFT_IDEAS: GiftIdea[] = [
  // ── Welcome bags ──
  {
    id: "wb-water-bottles",
    category: "welcome_bags",
    name: "Custom water bottles",
    description: "Reusable bottles printed with the couple's monogram.",
    estUnitCost: 8,
    emoji: "🧴",
    tags: ["reusable", "practical"],
  },
  {
    id: "wb-local-snacks",
    category: "welcome_bags",
    name: "Local snacks box",
    description: "Regional sweets, savories, and treats from the wedding city.",
    estUnitCost: 12,
    emoji: "🍿",
    tags: ["edible", "local"],
  },
  {
    id: "wb-itinerary-card",
    category: "welcome_bags",
    name: "Itinerary card",
    description: "Letterpress weekend schedule with addresses and dress codes.",
    estUnitCost: 4,
    emoji: "📜",
    tags: ["informational"],
  },
  {
    id: "wb-hangover-kit",
    category: "welcome_bags",
    name: "Hangover kit",
    description: "Pain reliever, electrolyte packets, eye masks, gum.",
    estUnitCost: 9,
    emoji: "💊",
    tags: ["practical", "fun"],
  },
  {
    id: "wb-chai-packets",
    category: "welcome_bags",
    name: "Chai / masala tea packets",
    description: "Hand-tied pouches of loose-leaf chai or masala blend.",
    estUnitCost: 6,
    emoji: "🍵",
    tags: ["edible", "cultural"],
  },
  {
    id: "wb-hand-sanitizer",
    category: "welcome_bags",
    name: "Mini hand sanitizer",
    description: "Pocket-sized bottles with custom labels.",
    estUnitCost: 3,
    emoji: "🧼",
    tags: ["practical"],
  },
  {
    id: "wb-flip-flops",
    category: "welcome_bags",
    name: "Flip-flops for dancing",
    description: "For when heels come off at the reception.",
    estUnitCost: 5,
    emoji: "🩴",
    tags: ["practical", "fun"],
  },
  {
    id: "wb-tote-bag",
    category: "welcome_bags",
    name: "Custom tote bag",
    description: "Canvas tote printed with the couple's logo — the welcome-bag itself.",
    estUnitCost: 7,
    emoji: "🛍️",
    tags: ["reusable"],
  },
  {
    id: "wb-area-guide",
    category: "welcome_bags",
    name: "Local area guide",
    description: "Curated list of coffee shops, walks, and spots between events.",
    estUnitCost: 3,
    emoji: "🗺️",
    tags: ["informational"],
  },
  {
    id: "wb-mehndi-care",
    category: "welcome_bags",
    name: "Mehndi care instructions",
    description: "Printed card with aftercare tips for guests getting mehendi.",
    estUnitCost: 2,
    emoji: "✋",
    tags: ["cultural"],
  },
  // ── Return favors ──
  {
    id: "rf-diya-set",
    category: "return_favors",
    name: "Mini diya set",
    description: "Two hand-painted brass diyas in a drawstring pouch.",
    estUnitCost: 12,
    emoji: "🪔",
    tags: ["traditional"],
  },
  {
    id: "rf-potli-sweets",
    category: "return_favors",
    name: "Potli bag of sweets",
    description: "Silk potli with assorted mithai — laddoo, kaju katli, barfi.",
    estUnitCost: 15,
    emoji: "🍬",
    tags: ["edible", "traditional"],
  },
  {
    id: "rf-chocolates",
    category: "return_favors",
    name: "Artisanal chocolates",
    description: "Small box of 4 chef-curated chocolates with a custom sleeve.",
    estUnitCost: 18,
    emoji: "🍫",
    tags: ["edible", "premium"],
  },
  {
    id: "rf-brass-items",
    category: "return_favors",
    name: "Brass trinket",
    description: "Small decorative brass piece — ganesh, peacock, or elephant.",
    estUnitCost: 22,
    emoji: "🐘",
    tags: ["traditional", "keepsake"],
  },
  {
    id: "rf-candles",
    category: "return_favors",
    name: "Scented candles",
    description: "Custom-labeled soy candles in jasmine, rose, or sandalwood.",
    estUnitCost: 14,
    emoji: "🕯️",
    tags: ["keepsake"],
  },
  {
    id: "rf-cookies",
    category: "return_favors",
    name: "Custom cookies",
    description: "Iced cookies with the couple's monogram or wedding motif.",
    estUnitCost: 8,
    emoji: "🍪",
    tags: ["edible"],
  },
  {
    id: "rf-seed-packets",
    category: "return_favors",
    name: "Seed packets",
    description: "Wildflower or herb seed packets, custom-printed envelopes.",
    estUnitCost: 3,
    emoji: "🌼",
    tags: ["eco", "keepsake"],
  },
  {
    id: "rf-succulents",
    category: "return_favors",
    name: "Mini succulents",
    description: "Potted succulents with personalized terracotta tags.",
    estUnitCost: 10,
    emoji: "🌵",
    tags: ["eco", "keepsake"],
  },
  {
    id: "rf-keychains",
    category: "return_favors",
    name: "Personalized keychains",
    description: "Acrylic or brass keychains with the couple's names and date.",
    estUnitCost: 6,
    emoji: "🔑",
    tags: ["keepsake"],
  },
  {
    id: "rf-magnets",
    category: "return_favors",
    name: "Custom magnets",
    description: "Illustrated magnets of the wedding venue or couple.",
    estUnitCost: 4,
    emoji: "🧲",
    tags: ["keepsake"],
  },
  {
    id: "rf-spice-jars",
    category: "return_favors",
    name: "Spice jar set",
    description: "Three mini jars — garam masala, chai blend, haldi.",
    estUnitCost: 16,
    emoji: "🧂",
    tags: ["edible", "cultural"],
  },
  {
    id: "rf-honey-jars",
    category: "return_favors",
    name: "Mini honey jars",
    description: "Local raw honey in 2-oz jars with kraft labels.",
    estUnitCost: 9,
    emoji: "🍯",
    tags: ["edible", "eco"],
  },
  // ── Trousseau ──
  {
    id: "tr-saree-trays",
    category: "trousseau_packaging",
    name: "Silk saree trays",
    description: "Velvet-lined trays to present folded sarees with dupattas.",
    estUnitCost: 45,
    emoji: "🧵",
    tags: ["traditional"],
  },
  {
    id: "tr-jewelry-boxes",
    category: "trousseau_packaging",
    name: "Decorated jewelry boxes",
    description: "Meenakari or brocade boxes for sets, bangles, and danglers.",
    estUnitCost: 60,
    emoji: "💎",
    tags: ["traditional"],
  },
  {
    id: "tr-nagphans",
    category: "trousseau_packaging",
    name: "Nagphans",
    description: "Silver or gold-plated decorative trays for ceremonial gifts.",
    estUnitCost: 90,
    emoji: "🪙",
    tags: ["traditional"],
  },
  {
    id: "tr-coconut-decor",
    category: "trousseau_packaging",
    name: "Coconut decoration",
    description: "Decorated coconut with floral and metallic wrap for rituals.",
    estUnitCost: 25,
    emoji: "🥥",
    tags: ["traditional"],
  },
  {
    id: "tr-fruit-trays",
    category: "trousseau_packaging",
    name: "Fruit trays",
    description: "Arranged fruit presentations for the exchange ceremony.",
    estUnitCost: 40,
    emoji: "🍎",
    tags: ["edible", "traditional"],
  },
  {
    id: "tr-dry-fruits",
    category: "trousseau_packaging",
    name: "Dry fruit arrangements",
    description: "Silver thali with cashews, almonds, pistachios, dates.",
    estUnitCost: 75,
    emoji: "🥜",
    tags: ["edible", "traditional"],
  },
  {
    id: "tr-cosmetics",
    category: "trousseau_packaging",
    name: "Cosmetics hamper",
    description: "Curated skincare and beauty set for the bride.",
    estUnitCost: 150,
    emoji: "💄",
    tags: ["personal"],
  },
  {
    id: "tr-kitchenware",
    category: "trousseau_packaging",
    name: "Kitchenware set",
    description: "Traditional brass or copper pieces for the new home.",
    estUnitCost: 200,
    emoji: "🍽️",
    tags: ["traditional", "practical"],
  },
  // ── Family exchanges ──
  {
    id: "fx-silver-coins",
    category: "family_exchanges",
    name: "Silver coin sets",
    description: "Commemorative silver coins in a velvet box — Lakshmi, Ganesha.",
    estUnitCost: 180,
    emoji: "🪙",
    tags: ["traditional"],
  },
  {
    id: "fx-shawls",
    category: "family_exchanges",
    name: "Pashmina shawls",
    description: "Hand-woven pashmina for elders — wrapped with a shagun note.",
    estUnitCost: 220,
    emoji: "🧣",
    tags: ["traditional", "luxury"],
  },
  {
    id: "fx-dry-fruit-boxes",
    category: "family_exchanges",
    name: "Dry-fruit gift box",
    description: "Premium dry-fruit assortment in a decorative wooden case.",
    estUnitCost: 85,
    emoji: "🌰",
    tags: ["edible", "traditional"],
  },
  {
    id: "fx-sweet-boxes",
    category: "family_exchanges",
    name: "Mithai box",
    description: "Curated sweets from a specialty halwai, custom-packaged.",
    estUnitCost: 60,
    emoji: "🧁",
    tags: ["edible", "traditional"],
  },
];

export function getIdeasForCategory(category: GiftIdeaCategory): GiftIdea[] {
  return GIFT_IDEAS.filter((i) => i.category === category);
}

export function getIdeaById(id: string): GiftIdea | undefined {
  return GIFT_IDEAS.find((i) => i.id === id);
}
