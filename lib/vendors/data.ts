// ── Vendors dashboard mock data ────────────────────────────────────────────
// Static seed for the two-tier /vendors layout (essentials + experiences).
// Counts and statuses are placeholders; wire to vendors-store.getVendorsByCategory
// and shortlist status once the layout is locked in.

export type EssentialStatus =
  | "open"
  | "contacted"
  | "quoted"
  | "shortlisted"
  | "booked";

export type EssentialCategory = {
  slug: string;
  name: string;
  count: number;
  status: EssentialStatus;
  topPick: { name: string; why: string };
  paletteColors: [string, string, string];
};

export type ExperienceCategory =
  | "food-drink"
  | "entertainment"
  | "decor-moments";

export type Experience = {
  slug: string;
  name: string;
  icon: string;
  toneColor: string;
  category: ExperienceCategory;
  moment: string;
  added: boolean;
  thumbnail: string;
};

export const STATUS_LABEL: Record<EssentialStatus, string> = {
  open: "Not started",
  contacted: "Contacted",
  quoted: "Quoted",
  shortlisted: "Shortlisted",
  booked: "Booked",
};

export const ESSENTIAL_CATEGORIES: EssentialCategory[] = [
  {
    slug: "photography",
    name: "Photography",
    count: 142,
    status: "shortlisted",
    topPick: {
      name: "Stories by Joseph Radhik",
      why: "Editorial film aesthetic, North-Indian wedding pedigree",
    },
    paletteColors: ["#C49B7B", "#7E5B45", "#2A2421"],
  },
  {
    slug: "decor_florals",
    name: "Décor & florals",
    count: 88,
    status: "quoted",
    topPick: {
      name: "Devika Narain & Co.",
      why: "Restrained botanical palettes, garden-wedding specialists",
    },
    paletteColors: ["#E8D5BE", "#9CAF88", "#C97B63"],
  },
  {
    slug: "catering",
    name: "Catering",
    count: 64,
    status: "contacted",
    topPick: {
      name: "Foodlink",
      why: "Live regional stations, strong vegetarian craft",
    },
    paletteColors: ["#D4A24C", "#8B5A2B", "#F5E6C8"],
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    count: 96,
    status: "open",
    topPick: {
      name: "The Wedding Filmer × DJ Suketu",
      why: "Sangeet-grade production, smooth crossover sets",
    },
    paletteColors: ["#5B8E8A", "#1A1A1A", "#D4A843"],
  },
  {
    slug: "hmua",
    name: "Hair & makeup",
    count: 73,
    status: "open",
    topPick: {
      name: "Namrata Soni",
      why: "Editorial bridal looks, low-maintenance through long days",
    },
    paletteColors: ["#DDA08A", "#C97B63", "#F5E0D6"],
  },
  {
    slug: "wardrobe",
    name: "Wardrobe",
    count: 51,
    status: "open",
    topPick: {
      name: "Sabyasachi Mukherjee",
      why: "Heritage hand-embroidery, archival lehengas",
    },
    paletteColors: ["#7A1F1F", "#B8860B", "#2A1A0F"],
  },
  {
    slug: "stationery",
    name: "Stationery",
    count: 32,
    status: "open",
    topPick: {
      name: "Studio Voylla",
      why: "Letterpress + foil suites with bilingual typesetting",
    },
    paletteColors: ["#F0E4C8", "#B8860B", "#2E2E2E"],
  },
  {
    slug: "pandit_ceremony",
    name: "Officiant & ceremony",
    count: 19,
    status: "open",
    topPick: {
      name: "Pandit Vivek Shastri",
      why: "English-translated rituals, modern couples",
    },
    paletteColors: ["#D4A24C", "#9CAF88", "#FBF9F4"],
  },
];

// TODO(vendors-experiences): Source editorial-quality 16:9 photos for each
// experience. Prefer South Asian wedding context (boba cart at a sangeet,
// dhol players at a baraat, mehndi artist mid-application). Drop the files
// into /public/vendors/experiences/<slug>.jpg. Until they exist,
// ExperienceTile falls back to a solid toneColor placeholder with the
// unicode icon centered on top.
export const EXPERIENCES: Experience[] = [
  { slug: "boba-cart",       name: "Boba cart",       icon: "◉", toneColor: "#C97B63", category: "food-drink",    moment: "Cocktail hour",    added: false, thumbnail: "/vendors/experiences/boba-cart.jpg"       },
  { slug: "mehndi-artist",   name: "Mehndi artist",   icon: "✦", toneColor: "#9CAF88", category: "entertainment", moment: "Pre-wedding",      added: true,  thumbnail: "/vendors/experiences/mehndi-artist.jpg"   },
  { slug: "dhol-players",    name: "Dhol players",    icon: "◐", toneColor: "#D4A24C", category: "entertainment", moment: "Baraat must-have", added: false, thumbnail: "/vendors/experiences/dhol-players.jpg"    },
  { slug: "mentalist",       name: "Mentalist",       icon: "◈", toneColor: "#5B8E8A", category: "entertainment", moment: "Cocktail hour",    added: false, thumbnail: "/vendors/experiences/mentalist.jpg"       },
  { slug: "ice-cream-cart",  name: "Ice cream cart",  icon: "✧", toneColor: "#DDA08A", category: "food-drink",    moment: "Reception",        added: false, thumbnail: "/vendors/experiences/ice-cream-cart.jpg"  },
  { slug: "drone-show",      name: "Drone show",      icon: "◇", toneColor: "#5B8E8A", category: "decor-moments", moment: "Sangeet hit",      added: false, thumbnail: "/vendors/experiences/drone-show.jpg"      },
  { slug: "live-painter",    name: "Live painter",    icon: "◯", toneColor: "#C97B63", category: "decor-moments", moment: "Reception",        added: false, thumbnail: "/vendors/experiences/live-painter.jpg"    },
  { slug: "photo-booth",     name: "Photo booth",     icon: "◑", toneColor: "#B8860B", category: "decor-moments", moment: "Reception",        added: true,  thumbnail: "/vendors/experiences/photo-booth.jpg"     },
  { slug: "qawwali-singers", name: "Qawwali singers", icon: "◉", toneColor: "#7A1F1F", category: "entertainment", moment: "Mehndi night",     added: false, thumbnail: "/vendors/experiences/qawwali-singers.jpg" },
  { slug: "champagne-wall",  name: "Champagne wall",  icon: "✦", toneColor: "#D4A843", category: "food-drink",    moment: "Cocktail hour",    added: false, thumbnail: "/vendors/experiences/champagne-wall.jpg"  },
  { slug: "shisha-lounge",   name: "Shisha lounge",   icon: "◐", toneColor: "#8B5A2B", category: "food-drink",    moment: "Late night",       added: false, thumbnail: "/vendors/experiences/shisha-lounge.jpg"   },
  { slug: "tarot-reader",    name: "Tarot reader",    icon: "◈", toneColor: "#9CAF88", category: "entertainment", moment: "Cocktail hour",    added: false, thumbnail: "/vendors/experiences/tarot-reader.jpg"    },
];

export const EXPERIENCES_TOTAL = 36;
export const EXPERIENCES_HIDDEN_HINT =
  "drone shows, anchors, calligraphers, qawwali, mixologists…";
