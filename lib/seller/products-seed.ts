// Seed data for Divya Creations' product catalog.
// 34 active · 3 drafts · 2 out of stock · 1 archived = 40 products total.

export type ProductStatus = "active" | "draft" | "out-of-stock" | "archived" | "low-stock";

export type PricingModel = "fixed" | "per-unit" | "tiered";

export type PricingTier = {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
};

export type CustomFieldType = "text" | "long-text" | "date" | "dropdown" | "number";

export type CustomField = {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
};

export type ProductCategory =
  | "invitations-stationery"
  | "wedding-signs-decor"
  | "favors-gifts"
  | "puja-ceremony"
  | "jewelry-accessories"
  | "digital-products"
  | "outfits-fabric"
  | "home-registry";

export type WeddingEvent =
  | "wedding"
  | "ceremony"
  | "reception"
  | "sangeet"
  | "mehndi"
  | "haldi"
  | "engagement"
  | "baraat"
  | "farewell-brunch"
  | "bachelor";

export type CulturalTradition =
  | "hindu"
  | "sikh"
  | "muslim"
  | "christian"
  | "jain"
  | "interfaith"
  | "universal";

export type Product = {
  id: string;
  title: string;
  photoGlyph: string; // unicode placeholder glyph for mock imagery
  photoTint: string; // hex color for placeholder card background
  photoCount: number;
  category: ProductCategory;
  subcategory: string;
  description: string;
  tags: string[];
  pricingModel: PricingModel;
  price: number;
  compareAtPrice?: number;
  unit?: string; // "card", "set", "each"
  minOrder?: number;
  tiers?: PricingTier[];
  customizable: boolean;
  customFields?: CustomField[];
  proofRequired?: boolean;
  proofTurnaroundDays?: string;
  productType: "physical" | "digital";
  shipsFrom?: "India" | "United States";
  processingTimeDays?: string;
  shippingMode?: "free" | "calculated" | "flat";
  flatShippingRate?: number;
  internationalShipping?: boolean;
  weightOz?: number;
  dimensions?: { l: number; w: number; h: number };
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weddingEvents: WeddingEvent[];
  traditions: CulturalTradition[];
  seoTitle?: string;
  metaDescription?: string;
  slug: string;
  status: ProductStatus;
  views30d: number;
  sold: number;
  rating?: number;
  reviewCount?: number;
  createdDaysAgo: number;
};

export const CATEGORIES: { value: ProductCategory; label: string; subcategories: string[] }[] = [
  {
    value: "invitations-stationery",
    label: "Invitations & Stationery",
    subcategories: [
      "Wedding Invitations",
      "Save-the-Dates",
      "RSVP Cards",
      "Programs",
      "Menus",
      "Place Cards",
      "Thank You Cards",
      "Envelope Liners",
      "Invitation Boxes",
      "Digital E-Invites",
    ],
  },
  {
    value: "wedding-signs-decor",
    label: "Wedding Signs & Decor",
    subcategories: [
      "Welcome Signs",
      "Seating Charts",
      "Table Numbers",
      "Ceremony Signs",
      "Bar Signs",
      "Aisle Markers",
    ],
  },
  {
    value: "favors-gifts",
    label: "Favors & Gifts",
    subcategories: [
      "Guest Favors",
      "Bridesmaid Gifts",
      "Groomsman Gifts",
      "Parent Gifts",
      "Welcome Bags",
      "Gift Tags",
    ],
  },
  {
    value: "puja-ceremony",
    label: "Puja & Ceremony Items",
    subcategories: [
      "Puja Thali Sets",
      "Kalash",
      "Ceremony Garlands",
      "Haldi Kits",
      "Mehndi Cones & Kits",
      "Baraat Accessories",
    ],
  },
  {
    value: "jewelry-accessories",
    label: "Jewelry & Accessories",
    subcategories: [
      "Bridal Jewelry",
      "Hair Accessories",
      "Kaleera",
      "Anklets",
      "Mang Tikka",
      "Nath",
      "Clutches",
      "Dupattas",
    ],
  },
  {
    value: "digital-products",
    label: "Digital Products",
    subcategories: [
      "Seating Chart Templates",
      "Planning Spreadsheets",
      "Timeline Templates",
      "Invitation Templates",
      "Social Media Templates",
      "Wedding Website Themes",
    ],
  },
  {
    value: "outfits-fabric",
    label: "Outfits & Fabric",
    subcategories: ["Turbans & Pagris", "Groom Accessories", "Bridesmaid Sets", "Matching Sets"],
  },
  {
    value: "home-registry",
    label: "Home & Registry",
    subcategories: ["Personalized Home Items", "Wall Art", "Couple Portraits", "Nameplate Signs"],
  },
];

// ── Demo featured product (the full editor below loads from this) ──
export const FEATURED_PRODUCT: Product = {
  id: "prod-ganesh-suite",
  title: "Gold Foil Ganesh Wedding Invitation Suite",
  photoGlyph: "ॐ",
  photoTint: "#F5E6D0",
  photoCount: 7,
  category: "invitations-stationery",
  subcategory: "Wedding Invitations",
  description:
    "Our signature Ganesh invitation features hand-applied gold foil on 300gsm cotton paper. Each card is printed in India by master artisans and shipped directly to you. Fully customizable — names, date, venue, wording, colors. Matching RSVP cards, programs, and menus available.",
  tags: ["ganesh", "hindu", "gold foil", "luxury", "custom", "indian wedding", "invitation"],
  pricingModel: "tiered",
  price: 8.5,
  compareAtPrice: 12.0,
  unit: "card",
  minOrder: 100,
  tiers: [
    { minQty: 100, maxQty: 199, pricePerUnit: 8.5 },
    { minQty: 200, maxQty: 299, pricePerUnit: 7.5 },
    { minQty: 300, pricePerUnit: 6.5 },
  ],
  customizable: true,
  customFields: [
    { id: "f1", label: "Couple Names", type: "text", required: true },
    { id: "f2", label: "Wedding Date", type: "date", required: true },
    { id: "f3", label: "Venue Name", type: "text", required: true },
    { id: "f4", label: "Invitation Wording", type: "long-text", required: true },
    {
      id: "f5",
      label: "Color Preference",
      type: "dropdown",
      required: false,
      options: ["Gold & Red", "Gold & Ivory", "Rose Gold", "Silver & Navy", "Custom (specify)"],
    },
    { id: "f6", label: "RSVP Information", type: "text", required: false },
  ],
  proofRequired: true,
  proofTurnaroundDays: "3-5",
  productType: "physical",
  shipsFrom: "India",
  processingTimeDays: "7-10",
  shippingMode: "calculated",
  internationalShipping: true,
  weightOz: 0.3,
  dimensions: { l: 6, w: 8, h: 0.5 },
  trackInventory: false,
  weddingEvents: ["wedding", "ceremony", "reception"],
  traditions: ["hindu", "universal"],
  seoTitle: "Gold Foil Ganesh Hindu Wedding Invitation Suite — Handcrafted in India",
  metaDescription:
    "Handcrafted in India, our gold foil Ganesh invitation suite brings heirloom craftsmanship to your wedding. Fully customizable. Matching RSVP, programs, menus.",
  slug: "gold-foil-ganesh-wedding-invitation-suite",
  status: "active",
  views30d: 340,
  sold: 142,
  rating: 4.9,
  reviewCount: 23,
  createdDaysAgo: 280,
};

// ── Factory helpers for compact mock data ──────────────────

type ProductSeed = Partial<Product> &
  Pick<
    Product,
    "id" | "title" | "category" | "subcategory" | "price" | "status"
  >;

const TINTS = ["#F5E6D0", "#E8D5D0", "#D9E8E4", "#E8DEF5", "#F5EDD9", "#EAE5D8"];

function makeProduct(seed: ProductSeed, idx: number): Product {
  const unit = seed.unit ?? (seed.pricingModel === "fixed" ? undefined : "card");
  return {
    photoGlyph: "✦",
    photoTint: TINTS[idx % TINTS.length],
    photoCount: 4,
    description: "",
    tags: [],
    pricingModel: "per-unit",
    customizable: true,
    proofRequired: true,
    proofTurnaroundDays: "3-5",
    productType: "physical",
    shipsFrom: "India",
    processingTimeDays: "7-10",
    shippingMode: "calculated",
    internationalShipping: true,
    trackInventory: false,
    weddingEvents: ["wedding"],
    traditions: ["hindu", "universal"],
    views30d: 50,
    sold: 0,
    rating: undefined,
    reviewCount: 0,
    createdDaysAgo: 30,
    slug: seed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    ...seed,
    unit,
  } as Product;
}

// ── The catalog: 40 products ───────────────────────────────
// Distribution target:
//   Invitations & Stationery: 18
//   Wedding Signs & Decor:     5
//   Favors & Gifts:            4
//   Puja & Ceremony:           3
//   Digital Products:          4
//   (Drafts + OOS + archived intermixed across categories)

const RAW: ProductSeed[] = [
  // Featured one first (already defined)
  // Invitations & Stationery (18 — includes featured)
  {
    ...FEATURED_PRODUCT,
  },
  {
    id: "prod-laser-mehndi",
    title: "Laser-Cut Mehndi Night Invitation",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 6.5,
    unit: "card",
    minOrder: 50,
    status: "active",
    sold: 98,
    views30d: 220,
    rating: 4.8,
    reviewCount: 18,
    weddingEvents: ["mehndi", "sangeet"],
    photoGlyph: "🌿",
    tags: ["mehndi", "laser cut", "green", "modern"],
  },
  {
    id: "prod-velvet-box",
    title: "Velvet Box Invitation Set",
    category: "invitations-stationery",
    subcategory: "Invitation Boxes",
    pricingModel: "per-unit",
    price: 18.0,
    unit: "set",
    minOrder: 25,
    status: "active",
    sold: 67,
    views30d: 180,
    rating: 5.0,
    reviewCount: 12,
    photoGlyph: "◈",
    tags: ["luxury", "velvet", "box", "keepsake"],
    weddingEvents: ["wedding", "ceremony"],
  },
  {
    id: "prod-sangeet-einvite",
    title: "Sangeet Night Digital E-Invite",
    category: "invitations-stationery",
    subcategory: "Digital E-Invites",
    pricingModel: "fixed",
    price: 45.0,
    status: "active",
    sold: 234,
    views30d: 890,
    rating: 4.9,
    reviewCount: 52,
    productType: "digital",
    proofRequired: true,
    proofTurnaroundDays: "1-2",
    shipsFrom: undefined,
    processingTimeDays: "1-2",
    shippingMode: undefined,
    internationalShipping: false,
    photoGlyph: "✧",
    tags: ["sangeet", "digital", "animated", "whatsapp"],
    weddingEvents: ["sangeet"],
    traditions: ["hindu", "sikh", "universal"],
  },
  {
    id: "prod-rsvp-set",
    title: "Gold Foil RSVP Card Set",
    category: "invitations-stationery",
    subcategory: "RSVP Cards",
    pricingModel: "per-unit",
    price: 3.25,
    unit: "card",
    minOrder: 100,
    status: "active",
    sold: 312,
    views30d: 410,
    rating: 4.8,
    reviewCount: 41,
    photoGlyph: "✉",
    tags: ["rsvp", "gold foil", "matching"],
  },
  {
    id: "prod-program-booklet",
    title: "Hindu Ceremony Program Booklet",
    category: "invitations-stationery",
    subcategory: "Programs",
    pricingModel: "per-unit",
    price: 5.75,
    unit: "booklet",
    minOrder: 50,
    status: "active",
    sold: 156,
    views30d: 230,
    rating: 4.9,
    reviewCount: 28,
    photoGlyph: "☸",
    tags: ["program", "hindu", "ceremony", "booklet"],
    weddingEvents: ["ceremony"],
  },
  {
    id: "prod-sikh-invite",
    title: "Sikh Wedding Invitation Suite",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 9.25,
    unit: "card",
    minOrder: 75,
    status: "active",
    sold: 89,
    views30d: 340,
    rating: 4.9,
    reviewCount: 19,
    photoGlyph: "☬",
    tags: ["sikh", "ek onkar", "anand karaj"],
    traditions: ["sikh"],
    weddingEvents: ["wedding", "ceremony"],
  },
  {
    id: "prod-muslim-invite",
    title: "Nikah Ceremony Invitation",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 8.0,
    unit: "card",
    minOrder: 75,
    status: "active",
    sold: 54,
    views30d: 150,
    rating: 4.7,
    reviewCount: 11,
    photoGlyph: "☪",
    tags: ["muslim", "nikah", "crescent"],
    traditions: ["muslim"],
    weddingEvents: ["ceremony"],
  },
  {
    id: "prod-menu-card",
    title: "Custom Reception Menu Card",
    category: "invitations-stationery",
    subcategory: "Menus",
    pricingModel: "per-unit",
    price: 2.5,
    unit: "card",
    minOrder: 100,
    status: "active",
    sold: 420,
    views30d: 265,
    rating: 4.8,
    reviewCount: 37,
    photoGlyph: "◉",
    tags: ["menu", "reception", "dinner"],
    weddingEvents: ["reception"],
  },
  {
    id: "prod-place-cards",
    title: "Calligraphy Place Cards",
    category: "invitations-stationery",
    subcategory: "Place Cards",
    pricingModel: "per-unit",
    price: 1.85,
    unit: "card",
    minOrder: 50,
    status: "active",
    sold: 540,
    views30d: 320,
    rating: 4.9,
    reviewCount: 62,
    photoGlyph: "✍",
    tags: ["calligraphy", "place card", "hand-lettered"],
    weddingEvents: ["reception"],
  },
  {
    id: "prod-envelope-liner",
    title: "Marigold Envelope Liner Set",
    category: "invitations-stationery",
    subcategory: "Envelope Liners",
    pricingModel: "per-unit",
    price: 1.25,
    unit: "liner",
    minOrder: 100,
    status: "active",
    sold: 278,
    views30d: 140,
    rating: 4.8,
    reviewCount: 24,
    photoGlyph: "❁",
    tags: ["marigold", "liner", "floral"],
  },
  {
    id: "prod-thank-you",
    title: "Monogram Thank You Cards",
    category: "invitations-stationery",
    subcategory: "Thank You Cards",
    pricingModel: "per-unit",
    price: 2.95,
    unit: "card",
    minOrder: 50,
    status: "active",
    sold: 198,
    views30d: 210,
    rating: 4.9,
    reviewCount: 33,
    photoGlyph: "♡",
    tags: ["thank you", "monogram", "flat card"],
  },
  {
    id: "prod-save-date",
    title: "Peacock Save-the-Date Magnet",
    category: "invitations-stationery",
    subcategory: "Save-the-Dates",
    pricingModel: "per-unit",
    price: 4.25,
    unit: "magnet",
    minOrder: 75,
    status: "active",
    sold: 146,
    views30d: 195,
    rating: 4.7,
    reviewCount: 22,
    photoGlyph: "⦿",
    tags: ["save the date", "magnet", "peacock"],
  },
  {
    id: "prod-watercolor-invite",
    title: "Watercolor Floral Invitation",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 7.25,
    unit: "card",
    minOrder: 75,
    status: "active",
    sold: 203,
    views30d: 285,
    rating: 4.8,
    reviewCount: 29,
    photoGlyph: "❀",
    tags: ["watercolor", "floral", "soft"],
  },
  {
    id: "prod-telugu-invite",
    title: "Telugu Bilingual Invitation",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 8.75,
    unit: "card",
    minOrder: 100,
    status: "active",
    sold: 72,
    views30d: 160,
    rating: 5.0,
    reviewCount: 8,
    photoGlyph: "అ",
    tags: ["telugu", "bilingual", "south indian"],
  },
  {
    id: "prod-tamil-invite",
    title: "Tamil Wedding Invitation Card",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 8.75,
    unit: "card",
    minOrder: 100,
    status: "active",
    sold: 61,
    views30d: 140,
    rating: 4.9,
    reviewCount: 7,
    photoGlyph: "த",
    tags: ["tamil", "south indian", "bilingual"],
  },
  {
    id: "prod-bengali-invite",
    title: "Bengali Wedding Invitation",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 8.5,
    unit: "card",
    minOrder: 100,
    status: "draft",
    sold: 0,
    views30d: 0,
    rating: undefined,
    reviewCount: 0,
    photoGlyph: "অ",
    tags: ["bengali", "bangla"],
  },
  {
    id: "prod-gujarati-invite",
    title: "Gujarati Wedding Invitation (Kankotri)",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 8.25,
    unit: "card",
    minOrder: 100,
    status: "active",
    sold: 88,
    views30d: 175,
    rating: 4.8,
    reviewCount: 14,
    photoGlyph: "ગ",
    tags: ["gujarati", "kankotri"],
  },

  // Wedding Signs & Decor (5)
  {
    id: "prod-seating-chart",
    title: "Custom Mirrored Seating Chart",
    category: "wedding-signs-decor",
    subcategory: "Seating Charts",
    pricingModel: "fixed",
    price: 125.0,
    status: "active",
    sold: 45,
    views30d: 150,
    rating: 4.9,
    reviewCount: 18,
    photoGlyph: "◫",
    tags: ["seating chart", "mirror", "acrylic"],
    productType: "physical",
    shipsFrom: "United States",
    processingTimeDays: "10-14",
    weightOz: 48,
    dimensions: { l: 24, w: 36, h: 0.25 },
    weddingEvents: ["reception"],
  },
  {
    id: "prod-welcome-sign",
    title: "Wedding Welcome Sign — Acrylic",
    category: "wedding-signs-decor",
    subcategory: "Welcome Signs",
    pricingModel: "fixed",
    price: 175.0,
    status: "out-of-stock",
    trackInventory: true,
    stockQuantity: 0,
    lowStockThreshold: 3,
    sold: 41,
    views30d: 120,
    rating: 4.8,
    reviewCount: 15,
    photoGlyph: "✥",
    tags: ["welcome sign", "acrylic", "large"],
    productType: "physical",
    shipsFrom: "United States",
    processingTimeDays: "10-14",
    weightOz: 32,
    weddingEvents: ["reception", "ceremony"],
  },
  {
    id: "prod-table-numbers",
    title: "Gold Foil Table Number Set",
    category: "wedding-signs-decor",
    subcategory: "Table Numbers",
    pricingModel: "fixed",
    price: 42.0,
    status: "active",
    sold: 112,
    views30d: 130,
    rating: 4.8,
    reviewCount: 20,
    photoGlyph: "№",
    tags: ["table numbers", "gold foil", "set of 20"],
    weddingEvents: ["reception"],
  },
  {
    id: "prod-bar-sign",
    title: "\"Shaadi Bar\" Signature Drink Sign",
    category: "wedding-signs-decor",
    subcategory: "Bar Signs",
    pricingModel: "fixed",
    price: 65.0,
    status: "active",
    sold: 58,
    views30d: 95,
    rating: 4.9,
    reviewCount: 12,
    photoGlyph: "🥂",
    tags: ["bar sign", "signature drinks", "cocktail"],
    weddingEvents: ["reception", "sangeet"],
  },
  {
    id: "prod-aisle-marker",
    title: "Marigold Aisle Marker Pair",
    category: "wedding-signs-decor",
    subcategory: "Aisle Markers",
    pricingModel: "fixed",
    price: 85.0,
    status: "active",
    sold: 34,
    views30d: 78,
    rating: 4.8,
    reviewCount: 9,
    photoGlyph: "❋",
    tags: ["aisle markers", "marigold", "ceremony"],
    weddingEvents: ["ceremony"],
  },

  // Favors & Gifts (4)
  {
    id: "prod-mini-ganesh",
    title: "Mini Ganesh Idol Guest Favor",
    category: "favors-gifts",
    subcategory: "Guest Favors",
    pricingModel: "tiered",
    price: 6.5,
    unit: "favor",
    minOrder: 50,
    tiers: [
      { minQty: 50, maxQty: 99, pricePerUnit: 6.5 },
      { minQty: 100, maxQty: 199, pricePerUnit: 5.75 },
      { minQty: 200, pricePerUnit: 5.0 },
    ],
    status: "active",
    sold: 420,
    views30d: 310,
    rating: 4.9,
    reviewCount: 47,
    photoGlyph: "🕉",
    tags: ["favor", "ganesh", "idol", "hindu"],
    weddingEvents: ["wedding", "ceremony"],
  },
  {
    id: "prod-bridesmaid-box",
    title: "Bridesmaid Gift Box (Personalized)",
    category: "favors-gifts",
    subcategory: "Bridesmaid Gifts",
    pricingModel: "fixed",
    price: 48.0,
    status: "active",
    sold: 156,
    views30d: 185,
    rating: 4.9,
    reviewCount: 34,
    photoGlyph: "🎁",
    tags: ["bridesmaid", "gift box", "personalized"],
    weddingEvents: ["bachelor", "mehndi"],
  },
  {
    id: "prod-welcome-bag",
    title: "Hotel Welcome Bag Set",
    category: "favors-gifts",
    subcategory: "Welcome Bags",
    pricingModel: "per-unit",
    price: 12.5,
    unit: "bag",
    minOrder: 25,
    status: "active",
    sold: 89,
    views30d: 110,
    rating: 4.7,
    reviewCount: 17,
    photoGlyph: "👜",
    tags: ["welcome bag", "hotel", "out of town"],
    weddingEvents: ["wedding"],
  },
  {
    id: "prod-gift-tags",
    title: "Custom Mithai Gift Tags",
    category: "favors-gifts",
    subcategory: "Gift Tags",
    pricingModel: "per-unit",
    price: 0.85,
    unit: "tag",
    minOrder: 100,
    status: "draft",
    sold: 0,
    views30d: 0,
    rating: undefined,
    reviewCount: 0,
    photoGlyph: "⟡",
    tags: ["mithai", "gift tag", "sweets"],
  },

  // Puja & Ceremony (3)
  {
    id: "prod-puja-thali",
    title: "Brass Puja Thali Set (7pc)",
    category: "puja-ceremony",
    subcategory: "Puja Thali Sets",
    pricingModel: "fixed",
    price: 65.0,
    status: "draft",
    sold: 0,
    views30d: 0,
    rating: undefined,
    reviewCount: 0,
    photoGlyph: "☸",
    tags: ["puja", "thali", "brass", "ceremony"],
    customizable: false,
    traditions: ["hindu"],
    weddingEvents: ["ceremony"],
    productType: "physical",
    shipsFrom: "India",
    weightOz: 24,
  },
  {
    id: "prod-haldi-kit",
    title: "Haldi Ceremony Kit (Complete)",
    category: "puja-ceremony",
    subcategory: "Haldi Kits",
    pricingModel: "fixed",
    price: 85.0,
    status: "low-stock",
    trackInventory: true,
    stockQuantity: 12,
    lowStockThreshold: 5,
    sold: 28,
    views30d: 95,
    rating: 4.9,
    reviewCount: 11,
    photoGlyph: "🌼",
    tags: ["haldi", "kit", "turmeric", "ceremony"],
    traditions: ["hindu"],
    weddingEvents: ["haldi"],
  },
  {
    id: "prod-mehndi-cones",
    title: "Mehndi Cone Party Pack (20ct)",
    category: "puja-ceremony",
    subcategory: "Mehndi Cones & Kits",
    pricingModel: "fixed",
    price: 38.0,
    status: "active",
    sold: 167,
    views30d: 210,
    rating: 4.8,
    reviewCount: 29,
    photoGlyph: "◊",
    tags: ["mehndi", "henna", "cones", "party pack"],
    weddingEvents: ["mehndi"],
  },

  // Digital Products (4)
  {
    id: "prod-seating-template",
    title: "Editable Seating Chart Template",
    category: "digital-products",
    subcategory: "Seating Chart Templates",
    pricingModel: "fixed",
    price: 18.0,
    status: "active",
    sold: 612,
    views30d: 840,
    rating: 4.9,
    reviewCount: 118,
    photoGlyph: "⌘",
    tags: ["template", "canva", "editable", "digital"],
    productType: "digital",
    shipsFrom: undefined,
    processingTimeDays: "instant",
    shippingMode: undefined,
    internationalShipping: false,
    proofRequired: false,
    weddingEvents: ["reception"],
  },
  {
    id: "prod-timeline-template",
    title: "Wedding Day Timeline Template",
    category: "digital-products",
    subcategory: "Timeline Templates",
    pricingModel: "fixed",
    price: 12.0,
    status: "active",
    sold: 438,
    views30d: 520,
    rating: 4.9,
    reviewCount: 76,
    photoGlyph: "◷",
    tags: ["timeline", "template", "planning"],
    productType: "digital",
    shipsFrom: undefined,
    processingTimeDays: "instant",
    proofRequired: false,
    weddingEvents: ["wedding"],
  },
  {
    id: "prod-invitation-template",
    title: "DIY Hindu Invitation Template",
    category: "digital-products",
    subcategory: "Invitation Templates",
    pricingModel: "fixed",
    price: 25.0,
    status: "active",
    sold: 289,
    views30d: 460,
    rating: 4.8,
    reviewCount: 54,
    photoGlyph: "❖",
    tags: ["diy", "template", "canva", "invitation"],
    productType: "digital",
    shipsFrom: undefined,
    processingTimeDays: "instant",
    proofRequired: false,
  },
  {
    id: "prod-website-theme",
    title: "Wedding Website Theme — Mehndi",
    category: "digital-products",
    subcategory: "Wedding Website Themes",
    pricingModel: "fixed",
    price: 65.0,
    status: "archived",
    sold: 23,
    views30d: 0,
    rating: 4.7,
    reviewCount: 5,
    photoGlyph: "⬡",
    tags: ["website", "theme", "mehndi"],
    productType: "digital",
    shipsFrom: undefined,
    processingTimeDays: "instant",
    proofRequired: false,
  },

  // A few extras to bring active count up to 34
  {
    id: "prod-puja-card",
    title: "Puja Invitation Card (Pocket Fold)",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 7.95,
    unit: "card",
    minOrder: 75,
    status: "active",
    sold: 76,
    views30d: 140,
    rating: 4.8,
    reviewCount: 13,
    photoGlyph: "⌬",
    tags: ["puja", "pocket fold"],
  },
  {
    id: "prod-foil-menu",
    title: "Rose Gold Foil Menu Cards",
    category: "invitations-stationery",
    subcategory: "Menus",
    pricingModel: "per-unit",
    price: 3.25,
    unit: "card",
    minOrder: 75,
    status: "active",
    sold: 184,
    views30d: 195,
    rating: 4.9,
    reviewCount: 26,
    photoGlyph: "✶",
    tags: ["menu", "rose gold", "foil"],
    weddingEvents: ["reception"],
  },
  {
    id: "prod-ceremony-sign",
    title: "Acrylic Ceremony Order Sign",
    category: "wedding-signs-decor",
    subcategory: "Ceremony Signs",
    pricingModel: "fixed",
    price: 95.0,
    status: "active",
    sold: 52,
    views30d: 105,
    rating: 4.8,
    reviewCount: 11,
    photoGlyph: "❂",
    tags: ["ceremony", "order of events", "acrylic"],
    productType: "physical",
    shipsFrom: "United States",
  },
  {
    id: "prod-parent-gift",
    title: "Parent Tribute Frame Set",
    category: "favors-gifts",
    subcategory: "Parent Gifts",
    pricingModel: "fixed",
    price: 95.0,
    status: "active",
    sold: 37,
    views30d: 88,
    rating: 5.0,
    reviewCount: 8,
    photoGlyph: "❖",
    tags: ["parent gift", "frame", "tribute"],
    productType: "physical",
    shipsFrom: "United States",
    weddingEvents: ["wedding"],
  },
  {
    id: "prod-social-template",
    title: "Wedding Social Media Template Pack",
    category: "digital-products",
    subcategory: "Social Media Templates",
    pricingModel: "fixed",
    price: 22.0,
    status: "active",
    sold: 312,
    views30d: 410,
    rating: 4.8,
    reviewCount: 48,
    photoGlyph: "◎",
    tags: ["instagram", "canva", "social media"],
    productType: "digital",
    shipsFrom: undefined,
    processingTimeDays: "instant",
    proofRequired: false,
  },
  {
    id: "prod-monogram-invite",
    title: "Minimalist Monogram Invitation",
    category: "invitations-stationery",
    subcategory: "Wedding Invitations",
    pricingModel: "per-unit",
    price: 7.5,
    unit: "card",
    minOrder: 75,
    status: "out-of-stock",
    trackInventory: true,
    stockQuantity: 0,
    lowStockThreshold: 25,
    sold: 142,
    views30d: 255,
    rating: 4.8,
    reviewCount: 24,
    photoGlyph: "◇",
    tags: ["monogram", "minimalist", "modern"],
  },
];

export const PRODUCTS: Product[] = RAW.map((p, idx) =>
  p.id === FEATURED_PRODUCT.id ? FEATURED_PRODUCT : makeProduct(p, idx),
);

export const PRODUCT_STATS = {
  total: PRODUCTS.length,
  active: PRODUCTS.filter((p) => p.status === "active" || p.status === "low-stock").length,
  draft: PRODUCTS.filter((p) => p.status === "draft").length,
  outOfStock: PRODUCTS.filter((p) => p.status === "out-of-stock").length,
  archived: PRODUCTS.filter((p) => p.status === "archived").length,
};

export const WEDDING_EVENT_LABELS: Record<WeddingEvent, string> = {
  wedding: "Wedding (general)",
  ceremony: "Ceremony",
  reception: "Reception",
  sangeet: "Sangeet",
  mehndi: "Mehndi",
  haldi: "Haldi",
  engagement: "Engagement",
  baraat: "Baraat",
  "farewell-brunch": "Farewell Brunch",
  bachelor: "Bachelor/Bachelorette",
};

export const TRADITION_LABELS: Record<CulturalTradition, string> = {
  hindu: "Hindu",
  sikh: "Sikh",
  muslim: "Muslim",
  christian: "Christian",
  jain: "Jain",
  interfaith: "Interfaith/Fusion",
  universal: "Universal",
};

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function categoryLabel(value: ProductCategory): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
