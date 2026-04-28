import type { VendorCategory } from "@/types/vendor";

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  photography: "Photography",
  hmua: "HMUA",
  decor_florals: "Decor & Florals",
  catering: "Catering",
  entertainment: "Entertainment",
  wardrobe: "Wardrobe",
  stationery: "Stationery",
  pandit_ceremony: "Officiant & Ceremony",
};

export const TASK_KEYWORDS_TO_CATEGORY: Array<[RegExp, VendorCategory]> = [
  [/photograph|photo|film|video|cinemato/i, "photography"],
  [/mua|makeup|hair|hmua|beauty|mehndi artist/i, "hmua"],
  [/decor|floral|flower|mandap|stage|pillar/i, "decor_florals"],
  [/cater|menu|kitchen|food|thali|buffet|live station/i, "catering"],
  [/dj|band|sangeet|perform|dance|entertain|music/i, "entertainment"],
  [/lehenga|sherwani|saree|outfit|attire|wardrobe|tailor|trousseau/i, "wardrobe"],
  [/invit|stationery|card|rsvp|save[- ]the[- ]date|monogram/i, "stationery"],
  [/pandit|puja|havan|ceremony|vows|muhurat|samagri/i, "pandit_ceremony"],
];
