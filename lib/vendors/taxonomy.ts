// ── Hyper-specific vendor category taxonomy ────────────────────────────────
// Two-tier system: top-level VendorCategory (8 buckets) + many subcategories.
// Drives the sidebar, autocomplete, and chip-based multi-filter on the
// discovery surface.
//
// The taxonomy is data (not code) — subcategories can be added here without
// touching any component. In production this would live in a remote config
// table; for now the file is the config.

import type {
  SubcategoryDef,
  SubcategoryId,
  VendorTag,
} from "@/types/vendor-discovery";
import type { VendorCategory } from "@/types/vendor-unified";

// The current top-level set uses 8 buckets that match the existing Vendor
// shape. Spec named additional top-levels (Transportation, Stationery,
// Technology, Attire, Honeymoon, Specialty) — we fold those into the eight
// existing buckets via subcategory, so the shortlist store / recommendation
// engine keeps working.

export const SUBCATEGORIES: SubcategoryDef[] = [
  // ── Photography ───────────────────────────────────────────────────────────
  { id: "wedding_photography", parent: "photography", label: "Wedding Photography", synonyms: ["photographer", "photo"], emoji: "📷", popular_tags: ["candid", "editorial", "documentary"] },
  { id: "pre_wedding_photography", parent: "photography", label: "Engagement / Pre-Wedding Photography", synonyms: ["engagement shoot", "e-shoot", "pre-wedding"], emoji: "💍" },
  { id: "cinematic_videography", parent: "photography", label: "Cinematic Videography", synonyms: ["videographer", "wedding film", "cinema"], emoji: "🎬", popular_tags: ["storytelling", "film-look"] },
  { id: "drone_photography", parent: "photography", label: "Drone Photography & Videography", synonyms: ["aerial", "drone"], emoji: "🛸" },
  { id: "same_day_edit", parent: "photography", label: "Same-Day Edit Specialists", synonyms: ["SDE", "same day"], emoji: "⚡" },
  { id: "photo_booth", parent: "photography", label: "Photo Booth Rentals", synonyms: ["booth"], emoji: "📸" },
  { id: "photo_booth_360", parent: "photography", label: "360° Photo/Video Booths", synonyms: ["360 booth", "spin booth"], emoji: "🌀" },
  { id: "instant_print_station", parent: "photography", label: "Instant Print Stations", synonyms: ["polaroid station", "print bar"], emoji: "🖨️" },

  // ── Music & Entertainment ─────────────────────────────────────────────────
  { id: "dj", parent: "entertainment", label: "DJ", synonyms: ["disc jockey", "dj"], emoji: "🎧", popular_tags: ["bollywood", "punjabi", "open-format"] },
  { id: "live_band", parent: "entertainment", label: "Live Band", synonyms: ["band", "live music"], emoji: "🎸" },
  { id: "dhol_players", parent: "entertainment", label: "Dhol Players", synonyms: ["dhol", "drummer"], emoji: "🥁" },
  { id: "baraat_band", parent: "entertainment", label: "Baraat Band", synonyms: ["baraat", "procession"], emoji: "🐎" },
  { id: "sangeet_choreographer", parent: "entertainment", label: "Sangeet Choreographer", synonyms: ["choreographer", "dance teacher"], emoji: "💃" },
  { id: "emcee_host", parent: "entertainment", label: "Emcee / Host", synonyms: ["mc", "host", "anchor"], emoji: "🎤" },
  { id: "live_painter", parent: "entertainment", label: "Live Painter", synonyms: ["live art", "painter"], emoji: "🎨" },
  { id: "magician", parent: "entertainment", label: "Magician / Illusionist", synonyms: ["magic", "illusionist"], emoji: "🎩" },
  { id: "fireworks", parent: "entertainment", label: "Fireworks & Pyrotechnics", synonyms: ["pyro", "fireworks"], emoji: "🎆" },
  { id: "laser_show", parent: "entertainment", label: "LED / Laser Show", synonyms: ["laser", "led show"], emoji: "✨" },
  { id: "cultural_dance", parent: "entertainment", label: "Cultural Dance Performers", synonyms: ["folk dance", "bhangra", "garba"], emoji: "🪘" },

  // ── Beauty & Grooming (HMUA bucket) ───────────────────────────────────────
  { id: "bridal_hmua", parent: "hmua", label: "Bridal Makeup Artist (HMUA)", synonyms: ["makeup artist", "mua", "bridal makeup"], emoji: "💄", popular_tags: ["airbrush", "traditional", "editorial"] },
  { id: "groom_styling", parent: "hmua", label: "Groom Styling", synonyms: ["groom grooming", "men grooming"], emoji: "🧔" },
  { id: "mehndi_artist", parent: "hmua", label: "Bridal Mehndi / Henna Artist", synonyms: ["henna", "mehendi", "mehndi"], emoji: "🌿" },
  { id: "hair_stylist", parent: "hmua", label: "Hair Stylist", synonyms: ["hair", "hairdresser"], emoji: "💇" },
  { id: "turban_tying", parent: "hmua", label: "Turban Tying Specialist", synonyms: ["safa", "pagdi", "turban"], emoji: "👳" },
  { id: "nail_artist", parent: "hmua", label: "Nail Artist", synonyms: ["nails", "manicure"], emoji: "💅" },
  { id: "saree_draping", parent: "hmua", label: "Saree Draping Specialist", synonyms: ["draping", "saree"], emoji: "🥻" },

  // ── Decor & Design ────────────────────────────────────────────────────────
  { id: "mandap_design", parent: "decor_florals", label: "Mandap Design & Construction", synonyms: ["mandap", "ceremony stage"], emoji: "🛕", popular_tags: ["minimalist", "floral-heavy"] },
  { id: "floral_design", parent: "decor_florals", label: "Floral Design", synonyms: ["florist", "flowers"], emoji: "💐" },
  { id: "lighting_design", parent: "decor_florals", label: "Lighting Design", synonyms: ["lighting", "uplighting"], emoji: "💡" },
  { id: "stage_backdrop", parent: "decor_florals", label: "Stage & Backdrop Design", synonyms: ["backdrop", "stage"], emoji: "🎭" },
  { id: "tent_structure", parent: "decor_florals", label: "Tent & Structure Rentals", synonyms: ["tent", "marquee"], emoji: "⛺" },
  { id: "furniture_rental", parent: "decor_florals", label: "Furniture Rentals", synonyms: ["furniture"], emoji: "🪑" },
  { id: "linen_tabletop", parent: "decor_florals", label: "Linen & Tabletop Rentals", synonyms: ["linens", "tablescape"], emoji: "🍽️" },
  { id: "signage_displays", parent: "decor_florals", label: "Signage & Welcome Displays", synonyms: ["signage", "welcome sign"], emoji: "🪧" },
  { id: "aisle_design", parent: "decor_florals", label: "Aisle Design", synonyms: ["aisle", "processional"], emoji: "🌸" },

  // ── Food & Beverage ───────────────────────────────────────────────────────
  { id: "full_catering", parent: "catering", label: "Full-Service Catering", synonyms: ["caterer", "catering"], emoji: "🍛", popular_tags: ["north-indian", "south-indian", "multi-cuisine"] },
  { id: "live_food_station", parent: "catering", label: "Live Food Stations", synonyms: ["chaat cart", "live station"], emoji: "🍢" },
  { id: "dessert_cart", parent: "catering", label: "Dessert Carts", synonyms: ["dessert"], emoji: "🍰" },
  { id: "coffee_chai_cart", parent: "catering", label: "Coffee & Chai Carts", synonyms: ["chai", "coffee", "cart"], emoji: "☕" },
  { id: "ice_cream_cart", parent: "catering", label: "Ice Cream Carts", synonyms: ["kulfi", "ice cream"], emoji: "🍦" },
  { id: "paan_station", parent: "catering", label: "Paan Station", synonyms: ["paan"], emoji: "🌿" },
  { id: "cocktail_bar", parent: "catering", label: "Cocktail Bar & Mixology", synonyms: ["bartender", "mixology", "bar"], emoji: "🍸" },
  { id: "food_truck", parent: "catering", label: "Food Trucks", synonyms: ["food truck"], emoji: "🚚" },
  { id: "late_night_snack", parent: "catering", label: "Late-Night Snack Service", synonyms: ["late night"], emoji: "🌙" },
  { id: "custom_cake", parent: "catering", label: "Cake & Custom Desserts", synonyms: ["cake", "baker", "desserts"], emoji: "🎂" },
  { id: "chaat_street_food", parent: "catering", label: "Chaat & Street Food", synonyms: ["chaat", "street food"], emoji: "🥘" },

  // ── Transportation (folded under a catering-adjacent bucket via entertainment for now) ──
  // We keep transportation as a subcategory under "entertainment" since there
  // is no dedicated top-level yet; the spec allows us to surface it via search.
  { id: "luxury_car", parent: "entertainment", label: "Luxury Car Rentals", synonyms: ["rolls royce", "vintage car", "luxury car"], emoji: "🚗" },
  { id: "horse_carriage", parent: "entertainment", label: "Horse & Carriage (Baraat)", synonyms: ["horse", "carriage", "ghodi"], emoji: "🐴" },
  { id: "guest_shuttle", parent: "entertainment", label: "Shuttle & Guest Transportation", synonyms: ["shuttle", "bus", "guest transport"], emoji: "🚌" },
  { id: "valet", parent: "entertainment", label: "Valet Services", synonyms: ["valet"], emoji: "🅿️" },
  { id: "party_bus", parent: "entertainment", label: "Party Bus", synonyms: ["party bus"], emoji: "🎉" },

  // ── Planning & Coordination (folded under pandit_ceremony for now) ────────
  { id: "full_planner", parent: "pandit_ceremony", label: "Full-Service Wedding Planner", synonyms: ["planner", "wedding planner"], emoji: "🗓️" },
  { id: "day_of_coordinator", parent: "pandit_ceremony", label: "Day-Of Coordinator", synonyms: ["coordinator", "doc"], emoji: "📋" },
  { id: "destination_planner", parent: "pandit_ceremony", label: "Destination Wedding Specialist", synonyms: ["destination planner"], emoji: "✈️" },
  { id: "month_of_coordinator", parent: "pandit_ceremony", label: "Month-Of Coordinator", synonyms: ["moc"], emoji: "📆" },
  { id: "rehearsal_planner", parent: "pandit_ceremony", label: "Rehearsal Dinner Planner", synonyms: ["rehearsal"], emoji: "🍽️" },

  // ── Stationery & Invitations ──────────────────────────────────────────────
  { id: "physical_invitation", parent: "stationery", label: "Physical Invitation Design & Print", synonyms: ["invitations", "invites", "card"], emoji: "✉️" },
  { id: "digital_invitation", parent: "stationery", label: "Digital Invitations (e-invites)", synonyms: ["e-invite", "digital card"], emoji: "📧" },
  { id: "save_the_date", parent: "stationery", label: "Save the Dates", synonyms: ["save the date", "std"], emoji: "📅" },
  { id: "wedding_website", parent: "stationery", label: "Wedding Website Design", synonyms: ["website", "wedding site"], emoji: "🌐" },
  { id: "welcome_bag", parent: "stationery", label: "Welcome Bag Curation", synonyms: ["welcome bag", "hospitality bag"], emoji: "🎁" },
  { id: "programs_menus", parent: "stationery", label: "Programs & Menus", synonyms: ["programs", "menu cards"], emoji: "📜" },
  { id: "seating_chart", parent: "stationery", label: "Seating Charts", synonyms: ["seating", "chart"], emoji: "🪑" },

  // ── Technology & AV (folded under entertainment) ──────────────────────────
  { id: "sound_av", parent: "entertainment", label: "Sound & AV Equipment", synonyms: ["sound", "av", "audio"], emoji: "🔊" },
  { id: "live_streaming", parent: "entertainment", label: "Live Streaming Services", synonyms: ["stream", "live stream"], emoji: "📡" },
  { id: "led_wall", parent: "entertainment", label: "LED Screens & Video Walls", synonyms: ["led wall", "video wall"], emoji: "📺" },
  { id: "projection_mapping", parent: "entertainment", label: "Projection Mapping", synonyms: ["projection"], emoji: "🖥️" },
  { id: "dance_floor", parent: "decor_florals", label: "Dance Floor Rentals (LED, custom)", synonyms: ["dance floor", "led floor"], emoji: "💃" },

  // ── Attire & Accessories (wardrobe bucket) ────────────────────────────────
  { id: "bridal_lehenga", parent: "wardrobe", label: "Bridal Lehenga / Gown Designers", synonyms: ["lehenga", "gown", "designer"], emoji: "👰", popular_tags: ["sabyasachi-inspired", "manish-malhotra-inspired"] },
  { id: "groom_sherwani", parent: "wardrobe", label: "Groom Sherwani / Suit", synonyms: ["sherwani", "suit", "tuxedo"], emoji: "🤵" },
  { id: "bridal_jewelry_buy", parent: "wardrobe", label: "Bridal Jewelry (Purchase)", synonyms: ["jewelry", "jewellery"], emoji: "💎" },
  { id: "bridal_jewelry_rent", parent: "wardrobe", label: "Bridal Jewelry (Rental)", synonyms: ["jewelry rental"], emoji: "💍" },
  { id: "flower_jewelry", parent: "wardrobe", label: "Flower Jewelry (Haldi/Mehndi)", synonyms: ["floral jewelry", "gota"], emoji: "🌼" },
  { id: "alterations", parent: "wardrobe", label: "Alteration Specialists", synonyms: ["tailor", "alterations"], emoji: "🧵" },

  // ── Ceremony & Rituals ────────────────────────────────────────────────────
  { id: "pandit", parent: "pandit_ceremony", label: "Pandit / Priest / Officiant", synonyms: ["priest", "pandit", "officiant"], emoji: "🕉️" },
  { id: "granthi", parent: "pandit_ceremony", label: "Granthi (Sikh Ceremonies)", synonyms: ["granthi", "sikh priest"], emoji: "☬" },
  { id: "maulvi", parent: "pandit_ceremony", label: "Maulvi / Imam", synonyms: ["maulvi", "imam", "nikah"], emoji: "☪️" },
  { id: "registrar", parent: "pandit_ceremony", label: "Wedding Registrar", synonyms: ["registrar", "license"], emoji: "📝" },
  { id: "ceremony_design", parent: "pandit_ceremony", label: "Custom Ceremony Design", synonyms: ["ceremony scripting"], emoji: "📖" },

  // ── Honeymoon & Travel (folded under pandit_ceremony for now) ─────────────
  { id: "honeymoon_agent", parent: "pandit_ceremony", label: "Honeymoon Travel Agent", synonyms: ["honeymoon", "travel agent"], emoji: "🏝️" },
  { id: "destination_specialist", parent: "pandit_ceremony", label: "Destination Specialist", synonyms: ["destination"], emoji: "🗺️" },
  { id: "guest_travel", parent: "pandit_ceremony", label: "Guest Travel Coordination", synonyms: ["guest travel"], emoji: "🧳" },

  // ── Specialty & Unique ────────────────────────────────────────────────────
  { id: "astrologer", parent: "pandit_ceremony", label: "Astrologer / Muhurat Specialist", synonyms: ["muhurat", "astrology"], emoji: "🔮" },
  { id: "trousseau_packer", parent: "wardrobe", label: "Trousseau Packing", synonyms: ["trousseau"], emoji: "🎀" },
  { id: "gifting_favors", parent: "stationery", label: "Gifting & Favors", synonyms: ["favors", "return gifts"], emoji: "🎁" },
  { id: "pet_handler", parent: "entertainment", label: "Pet Handlers (Pet-friendly weddings)", synonyms: ["pet", "dog handler"], emoji: "🐕" },
  { id: "calligrapher", parent: "stationery", label: "Calligrapher", synonyms: ["calligraphy", "handwriting"], emoji: "✒️" },
  { id: "after_party_dj", parent: "entertainment", label: "After-Party DJ / Producer", synonyms: ["after party", "afterparty"], emoji: "🌌" },
];

// ── Vendor self-tags (inside a subcategory) ────────────────────────────────

export const VENDOR_TAGS: VendorTag[] = [
  // Photographer
  { id: "tag_candid", label: "Candid Specialist", subcategory_ids: ["wedding_photography"] },
  { id: "tag_drone", label: "Drone", subcategory_ids: ["wedding_photography", "cinematic_videography"] },
  { id: "tag_cinematic", label: "Cinematic", subcategory_ids: ["wedding_photography", "cinematic_videography"] },
  { id: "tag_documentary", label: "Documentary Style", subcategory_ids: ["wedding_photography"] },
  { id: "tag_destination_photo", label: "Destination", subcategory_ids: ["wedding_photography", "cinematic_videography"] },
  { id: "tag_same_day", label: "Same-Day Edit", subcategory_ids: ["cinematic_videography"] },
  // Decorator
  { id: "tag_minimalist", label: "Minimalist", subcategory_ids: ["mandap_design", "floral_design", "stage_backdrop"] },
  { id: "tag_maximalist", label: "Maximalist", subcategory_ids: ["mandap_design", "floral_design", "stage_backdrop"] },
  { id: "tag_floral_heavy", label: "Floral-Heavy", subcategory_ids: ["mandap_design", "floral_design"] },
  { id: "tag_south_indian", label: "South Indian", subcategory_ids: ["mandap_design", "floral_design", "full_catering"] },
  { id: "tag_punjabi", label: "Punjabi", subcategory_ids: ["mandap_design", "dj", "live_band", "full_catering"] },
  { id: "tag_fusion", label: "Fusion", subcategory_ids: ["mandap_design", "floral_design", "full_catering"] },
  // Caterer
  { id: "tag_north_indian", label: "North Indian", subcategory_ids: ["full_catering"] },
  { id: "tag_indo_chinese", label: "Indo-Chinese", subcategory_ids: ["full_catering", "live_food_station"] },
  { id: "tag_vegan", label: "Vegan / Plant-Based", subcategory_ids: ["full_catering"] },
  { id: "tag_jain", label: "Jain", subcategory_ids: ["full_catering"] },
  { id: "tag_halal", label: "Halal", subcategory_ids: ["full_catering"] },
  { id: "tag_multi_cuisine", label: "Multi-Cuisine", subcategory_ids: ["full_catering"] },
  // HMUA
  { id: "tag_airbrush", label: "Airbrush", subcategory_ids: ["bridal_hmua"] },
  { id: "tag_traditional_makeup", label: "Traditional", subcategory_ids: ["bridal_hmua"] },
  { id: "tag_editorial_makeup", label: "Editorial", subcategory_ids: ["bridal_hmua"] },
];

// ── Lookups ────────────────────────────────────────────────────────────────

export const SUBCATEGORY_BY_ID: Map<SubcategoryId, SubcategoryDef> = new Map(
  SUBCATEGORIES.map((s) => [s.id, s]),
);

export function getSubcategoriesForParent(
  parent: VendorCategory,
): SubcategoryDef[] {
  return SUBCATEGORIES.filter((s) => s.parent === parent);
}

export function getTagsForSubcategory(subId: SubcategoryId): VendorTag[] {
  return VENDOR_TAGS.filter((t) => t.subcategory_ids.includes(subId));
}

// ── Fuzzy search with synonyms ─────────────────────────────────────────────
// Couple types "tur" → surface "Turban Tying Specialist"
// "car" → "Luxury Car Rentals", "Horse & Carriage", "Dessert Carts", ...
// "henna" (synonym for mehndi) → "Bridal Mehndi / Henna Artist"

export interface SearchHit {
  subcategory: SubcategoryDef;
  score: number;
  matched_on: "label" | "synonym";
}

export function searchSubcategories(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const s of SUBCATEGORIES) {
    const label = s.label.toLowerCase();
    if (label.startsWith(q)) {
      hits.push({ subcategory: s, score: 100, matched_on: "label" });
      continue;
    }
    if (label.includes(q)) {
      hits.push({ subcategory: s, score: 60, matched_on: "label" });
      continue;
    }
    const synonymHit = (s.synonyms ?? []).find(
      (syn) => syn.toLowerCase().startsWith(q) || syn.toLowerCase().includes(q),
    );
    if (synonymHit) {
      hits.push({
        subcategory: s,
        score: synonymHit.toLowerCase().startsWith(q) ? 80 : 40,
        matched_on: "synonym",
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score);
}

// ── Labels for top-level buckets (richer than the spartan existing ones) ──

export const TOP_CATEGORY_LABEL: Record<VendorCategory, string> = {
  photography: "Photography & Videography",
  entertainment: "Music & Entertainment",
  hmua: "Beauty & Grooming",
  decor_florals: "Decor & Design",
  catering: "Food & Beverage",
  wardrobe: "Attire & Accessories",
  stationery: "Stationery & Invitations",
  pandit_ceremony: "Ceremony & Planning",
};

export const TOP_CATEGORY_ICON: Record<VendorCategory, string> = {
  photography: "📷",
  entertainment: "🎵",
  hmua: "💄",
  decor_florals: "🎨",
  catering: "🍽️",
  wardrobe: "👗",
  stationery: "✉️",
  pandit_ceremony: "🕉️",
};
