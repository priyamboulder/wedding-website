// Shop profile editor seed — drives both the form defaults and the live
// storefront preview for Divya Creations. Build-time only; nothing persists.

export type ShopIdentity = {
  shopName: string;
  tagline: string;
  logoInitials: string; // stand-in for uploaded logo in the preview
  logoUrl: string | null;
  bannerHue: string; // hex stand-in while banner upload is cosmetic
  bannerUrl: string | null;
  instagramHandle: string;
};

export type ShopAbout = {
  story: string;
};

export type SellerDetails = {
  ownerName: string;
  location: string;
  yearsInBusiness: number;
  languages: string[]; // free list, not toggles
  responseTime: string;
};

export type Toggle = { key: string; label: string; on: boolean };

export type ShopSpecialties = {
  productTypes: Toggle[];
  culturalFocus: Toggle[];
  styleTags: Toggle[];
  materials: Toggle[];
};

export type ShopPolicies = {
  processingTime: string;
  shippingPolicy: string;
  returnPolicy: string;
  customOrderPolicy: string;
  rushOrdersAvailable: boolean;
};

export type PaymentTax = {
  paymentMethods: string[]; // platform-managed, read-only
  collectSalesTax: boolean;
  wholesaleTaxExempt: boolean;
};

export type ShopProduct = {
  id: string;
  title: string;
  price: number;
  swatch: string; // color stand-in for product photo
  glyph: string;
  salesCount: number;
  isPinned: boolean;
};

export type ShopReview = {
  id: string;
  coupleName: string;
  weddingLabel: string;
  rating: number;
  excerpt: string;
  productTitle: string;
  postedAgo: string;
};

export type ShopCollection = {
  id: string;
  name: string;
  productIds: string[];
};

export type ShopStats = {
  rating: number;
  reviewCount: number;
  productCount: number;
  totalSales: number;
};

export type ShopProfile = {
  identity: ShopIdentity;
  about: ShopAbout;
  seller: SellerDetails;
  specialties: ShopSpecialties;
  policies: ShopPolicies;
  payment: PaymentTax;
  products: ShopProduct[];
  collections: ShopCollection[];
  reviews: ShopReview[];
  stats: ShopStats;
};

// ── Seed ───────────────────────────────────────────────────

export const SHOP_PROFILE_SEED: ShopProfile = {
  identity: {
    shopName: "Divya Creations",
    tagline: "Handcrafted South Asian Wedding Stationery, Made in India",
    logoInitials: "DC",
    logoUrl: null,
    bannerHue: "#E8C7A8",
    bannerUrl: null,
    instagramHandle: "@divyacreations",
  },
  about: {
    story:
      "Divya Creations was born from my own wedding planning experience. When I couldn't find invitations that reflected both the luxury I wanted and the cultural richness of our Hindu ceremony, I partnered with master artisans in Jaipur to create what I wished had existed. Every suite we make is hand-finished — from the pressed gold foil to the hand-tied silk tassels — and carries the fingerprint of a specific artisan. We work with couples six to nine months before their wedding to craft invitation suites that feel as considered as the ceremonies they announce.",
  },
  seller: {
    ownerName: "Priya Mehta",
    location: "Edison, NJ · Made in Jaipur, India",
    yearsInBusiness: 7,
    languages: ["English", "Hindi", "Gujarati"],
    responseTime: "Usually responds within 12 hours",
  },
  specialties: {
    productTypes: [
      { key: "invitations", label: "Wedding Invitations", on: true },
      { key: "save-the-dates", label: "Save the Dates", on: true },
      { key: "programs", label: "Programs", on: true },
      { key: "menus", label: "Menus", on: true },
      { key: "favors", label: "Favors", on: false },
      { key: "signs", label: "Signs", on: false },
    ],
    culturalFocus: [
      { key: "hindu", label: "Hindu", on: true },
      { key: "sikh", label: "Sikh", on: true },
      { key: "muslim", label: "Muslim", on: false },
      { key: "interfaith", label: "Interfaith / Fusion", on: true },
      { key: "universal", label: "Universal", on: true },
    ],
    styleTags: [
      { key: "luxury", label: "Luxury", on: true },
      { key: "traditional", label: "Traditional", on: true },
      { key: "foil", label: "Foil", on: true },
      { key: "letterpress", label: "Letterpress", on: true },
      { key: "minimalist", label: "Minimalist", on: false },
      { key: "modern", label: "Modern", on: false },
    ],
    materials: [
      { key: "handmade-paper", label: "Handmade paper", on: true },
      { key: "gold-foil", label: "Gold foil", on: true },
      { key: "laser-cut", label: "Laser-cut", on: true },
      { key: "acrylic", label: "Acrylic", on: false },
      { key: "fabric", label: "Fabric", on: false },
    ],
  },
  policies: {
    processingTime: "7-10 business days after proof approval",
    shippingPolicy:
      "Standard US shipping is complimentary and arrives in 5-7 business days via UPS Ground with tracking. Expedited (2-day) shipping is $38 flat. International orders ship via DHL and typically arrive within 7-10 business days; buyers are responsible for any customs duties.",
    returnPolicy:
      "Because every suite is custom-printed with your names and ceremony details, we do not accept returns. If your order arrives damaged, send us a photo within 48 hours and we will reprint and reship at no cost.",
    customOrderPolicy:
      "We welcome custom orders! Message us with your vision — including ceremony type, desired color palette, quantity, and event date — and we'll provide a quote within 24 hours. Custom work requires a 50% deposit to begin.",
    rushOrdersAvailable: true,
  },
  payment: {
    paymentMethods: ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"],
    collectSalesTax: true,
    wholesaleTaxExempt: false,
  },
  products: [
    {
      id: "p-foil-ganesh",
      title: "Gold Foil Ganesh Invitation Suite",
      price: 12,
      swatch: "#C4A265",
      glyph: "卐",
      salesCount: 184,
      isPinned: true,
    },
    {
      id: "p-laser-mehndi",
      title: "Laser-Cut Mehndi Night Invitation",
      price: 9,
      swatch: "#C97B63",
      glyph: "✿",
      salesCount: 142,
      isPinned: true,
    },
    {
      id: "p-sikh-suite",
      title: "Sikh Wedding Invitation Suite",
      price: 14,
      swatch: "#A17A48",
      glyph: "☬",
      salesCount: 98,
      isPinned: true,
    },
    {
      id: "p-velvet-box",
      title: "Velvet Invitation Box Set",
      price: 28,
      swatch: "#8E4A3A",
      glyph: "◆",
      salesCount: 76,
      isPinned: true,
    },
    {
      id: "p-letterpress-save",
      title: "Letterpress Save the Date",
      price: 6,
      swatch: "#D8B484",
      glyph: "❖",
      salesCount: 203,
      isPinned: true,
    },
    {
      id: "p-menu-programs",
      title: "Ceremony Program — Hindu",
      price: 4,
      swatch: "#C4A265",
      glyph: "۞",
      salesCount: 167,
      isPinned: true,
    },
    {
      id: "p-acrylic-sign",
      title: "Acrylic Welcome Sign",
      price: 185,
      swatch: "#E8D5D0",
      glyph: "◇",
      salesCount: 41,
      isPinned: false,
    },
    {
      id: "p-foil-menu",
      title: "Gold Foil Reception Menu",
      price: 5,
      swatch: "#C4A265",
      glyph: "✦",
      salesCount: 132,
      isPinned: false,
    },
    {
      id: "p-thank-you",
      title: "Handmade Paper Thank You Cards",
      price: 3,
      swatch: "#E8C7A8",
      glyph: "✉",
      salesCount: 289,
      isPinned: false,
    },
    {
      id: "p-seal-wax",
      title: "Monogram Wax Seal Set",
      price: 22,
      swatch: "#8E4A3A",
      glyph: "⊛",
      salesCount: 54,
      isPinned: false,
    },
  ],
  collections: [
    {
      id: "col-2027",
      name: "Wedding Season 2027",
      productIds: ["p-foil-ganesh", "p-letterpress-save", "p-sikh-suite"],
    },
    {
      id: "col-sangeet",
      name: "Sangeet Night Collection",
      productIds: ["p-laser-mehndi", "p-velvet-box"],
    },
    {
      id: "col-destination",
      name: "Destination Wedding Stationery",
      productIds: ["p-acrylic-sign", "p-menu-programs", "p-foil-menu"],
    },
  ],
  reviews: [
    {
      id: "rev-1",
      coupleName: "Isha & Rohan",
      weddingLabel: "Houston, TX · Nov 2026",
      rating: 5,
      excerpt:
        "Absolutely stunning work. Priya hand-walked us through every foil option and our guests are STILL talking about the invitations. The little touches — the wax seal, the silk ribbon — felt like heirlooms.",
      productTitle: "Gold Foil Ganesh Invitation Suite",
      postedAgo: "2 weeks ago",
    },
    {
      id: "rev-2",
      coupleName: "Simran & Dev",
      weddingLabel: "Vancouver, BC · Feb 2027",
      rating: 5,
      excerpt:
        "We had a very specific vision for our Sikh ceremony invitations and Divya Creations nailed it on the first proof. Communication was fast and warm. Shipped earlier than promised.",
      productTitle: "Sikh Wedding Invitation Suite",
      postedAgo: "1 month ago",
    },
    {
      id: "rev-3",
      coupleName: "Meera & Karan",
      weddingLabel: "Edison, NJ · Jan 2027",
      rating: 5,
      excerpt:
        "The velvet box arrived wrapped like a gift and our parents cried. Worth every dollar. Priya even included extra programs when we told her our guest count had grown.",
      productTitle: "Velvet Invitation Box Set",
      postedAgo: "6 weeks ago",
    },
  ],
  stats: {
    rating: 4.9,
    reviewCount: 89,
    productCount: 34,
    totalSales: 547,
  },
};
