// ── Attire inspiration seed ───────────────────────────────────────────────
// Hand-curated attire references for Q4's second inspiration band. Each
// entry carries role, garment, formality, work level, palette tags, and an
// attribution string so the stylist brief can be generated without an LLM
// round-trip. `url` is null today — tiles render as gradients from
// `paletteHex`, same pattern as inspiration-seed.
//
// Coverage: 8–12 curated looks per event type. Event types that aren't
// spec'd explicitly (mehendi, garba, cocktail, after_party, welcome_dinner,
// farewell_brunch, custom) are mapped into one of four "attire categories"
// below, which also drives the filter-chip set.

import type {
  AttireFormality,
  AttireImage,
  AttireRole,
  AttireGarmentType,
  AttireWorkLevel,
  EventType,
} from "@/types/events";

// ── Attire categories ─────────────────────────────────────────────────────
// Four buckets determine chip set + default formality for each event type.

export type AttireCategory =
  | "daytime_ritual"
  | "sangeet"
  | "ceremony"
  | "reception";

export const ATTIRE_CATEGORY_FOR: Record<EventType, AttireCategory> = {
  pithi: "daytime_ritual",
  haldi: "daytime_ritual",
  mehendi: "daytime_ritual",
  sangeet: "sangeet",
  garba: "sangeet",
  after_party: "sangeet",
  ceremony: "ceremony",
  baraat: "ceremony",
  reception: "reception",
  cocktail: "reception",
  welcome_dinner: "reception",
  farewell_brunch: "reception",
  custom: "reception",
};

// ── Filter chips per category ────────────────────────────────────────────

export interface AttireChip {
  // Matches tokens in AttireImage.tags or role/garment. "All" is special.
  id: string;
  label: string;
  // Which facet this chip narrows. Chips in different kinds combine as AND.
  kind: "role" | "garment" | "tag";
}

export const ATTIRE_CHIPS: Record<AttireCategory, AttireChip[]> = {
  daytime_ritual: [
    { id: "bride", label: "Bride", kind: "role" },
    { id: "groom", label: "Groom", kind: "role" },
    { id: "family", label: "Family", kind: "role" },
    { id: "traditional", label: "Traditional", kind: "tag" },
    { id: "modern", label: "Modern", kind: "tag" },
    { id: "marigold", label: "Yellow/Marigold", kind: "tag" },
    { id: "comfortable", label: "Comfortable", kind: "tag" },
  ],
  sangeet: [
    { id: "bride", label: "Bride", kind: "role" },
    { id: "groom", label: "Groom", kind: "role" },
    { id: "family", label: "Family", kind: "role" },
    { id: "lehenga", label: "Lehenga", kind: "garment" },
    { id: "gown", label: "Gown", kind: "garment" },
    { id: "suit", label: "Suit", kind: "garment" },
    { id: "indo_western", label: "Indo-Western", kind: "garment" },
    { id: "glam", label: "Glam", kind: "tag" },
    { id: "bold_color", label: "Bold color", kind: "tag" },
  ],
  ceremony: [
    { id: "bride", label: "Bride", kind: "role" },
    { id: "groom", label: "Groom", kind: "role" },
    { id: "family", label: "Family", kind: "role" },
    { id: "lehenga", label: "Lehenga", kind: "garment" },
    { id: "saree", label: "Saree", kind: "garment" },
    { id: "sherwani", label: "Sherwani", kind: "garment" },
    { id: "classic_red", label: "Classic red", kind: "tag" },
    { id: "pastel", label: "Pastel", kind: "tag" },
    { id: "heavy_work", label: "Heavy work", kind: "tag" },
    { id: "minimalist", label: "Minimalist", kind: "tag" },
  ],
  reception: [
    { id: "bride", label: "Bride", kind: "role" },
    { id: "groom", label: "Groom", kind: "role" },
    { id: "family", label: "Family", kind: "role" },
    { id: "gown", label: "Gown", kind: "garment" },
    { id: "saree", label: "Saree", kind: "garment" },
    { id: "suit", label: "Suit", kind: "garment" },
    { id: "tuxedo", label: "Tuxedo", kind: "garment" },
    { id: "cocktail", label: "Cocktail", kind: "tag" },
  ],
};

// ── Seed rows ────────────────────────────────────────────────────────────

interface Seed {
  slug: string;
  eventTypes: EventType[];
  role: AttireRole;
  garmentType: AttireGarmentType;
  paletteTags: string[];
  formality: AttireFormality;
  workLevel: AttireWorkLevel;
  sourceCredit: string;
  tags: string[];
  paletteHex: string[];
}

const SEEDS: Seed[] = [
  // ── Pithi (daytime ritual, yellow/marigold family) ─────────────────────
  { slug: "attire-pithi-01", eventTypes: ["pithi"], role: "bride", garmentType: "lehenga", paletteTags: ["marigold", "turmeric"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: ["traditional", "marigold", "comfortable"], paletteHex: ["#E5A72C", "#F5E6C8", "#C64F2A"] },
  { slug: "attire-pithi-02", eventTypes: ["pithi"], role: "bride", garmentType: "anarkali", paletteTags: ["lemon", "ivory"], formality: "casual", workLevel: "minimal", sourceCredit: "Raw Mango", tags: ["traditional", "marigold", "comfortable", "chikankari"], paletteHex: ["#F4D98A", "#FBF3DE", "#C99A45"] },
  { slug: "attire-pithi-03", eventTypes: ["pithi"], role: "groom", garmentType: "kurta", paletteTags: ["ivory", "marigold"], formality: "casual", workLevel: "minimal", sourceCredit: "Kunal Rawal", tags: ["traditional", "comfortable", "linen"], paletteHex: ["#FBF9F4", "#D4A24C", "#5C3A1E"] },
  { slug: "attire-pithi-04", eventTypes: ["pithi"], role: "family", garmentType: "kurta_set", paletteTags: ["mustard", "ivory"], formality: "casual", workLevel: "minimal", sourceCredit: "House of Masaba", tags: ["traditional", "comfortable", "marigold"], paletteHex: ["#D4A24C", "#FBF4E3", "#3F6B3A"] },
  { slug: "attire-pithi-05", eventTypes: ["pithi"], role: "bride", garmentType: "co_ord", paletteTags: ["sunshine", "saffron"], formality: "casual", workLevel: "minimal", sourceCredit: "Arpita Mehta", tags: ["modern", "comfortable", "marigold"], paletteHex: ["#E5732A", "#F5E6C8", "#E5A72C"] },
  { slug: "attire-pithi-06", eventTypes: ["pithi"], role: "groom", garmentType: "kurta", paletteTags: ["saffron", "dupatta"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Raghavendra Rathore", tags: ["traditional", "marigold"], paletteHex: ["#E08A2E", "#FBF3DE", "#3F6B3A"] },
  { slug: "attire-pithi-07", eventTypes: ["pithi"], role: "bride", garmentType: "lehenga", paletteTags: ["modern", "pastel"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Torani", tags: ["modern", "comfortable"], paletteHex: ["#F5E0D6", "#E8D4A0", "#FBF6EF"] },
  { slug: "attire-pithi-08", eventTypes: ["pithi"], role: "family", garmentType: "saree", paletteTags: ["yellow", "gold"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: ["traditional", "marigold"], paletteHex: ["#E5A72C", "#C99A45", "#FBF3DE"] },
  { slug: "attire-pithi-09", eventTypes: ["pithi"], role: "bride", garmentType: "anarkali", paletteTags: ["sunflower", "gota"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Anamika Khanna", tags: ["traditional", "marigold", "heavy_work"], paletteHex: ["#D4A24C", "#F5E6C8", "#E5732A"] },
  { slug: "attire-pithi-10", eventTypes: ["pithi"], role: "groom", garmentType: "kurta", paletteTags: ["oat", "brass"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: ["modern", "comfortable"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },

  // ── Haldi ──────────────────────────────────────────────────────────────
  { slug: "attire-haldi-01", eventTypes: ["haldi"], role: "bride", garmentType: "lehenga", paletteTags: ["turmeric", "cream"], formality: "casual", workLevel: "minimal", sourceCredit: "Punit Balana", tags: ["traditional", "marigold", "comfortable"], paletteHex: ["#E08A2E", "#D4A24C", "#FBF3DE"] },
  { slug: "attire-haldi-02", eventTypes: ["haldi"], role: "bride", garmentType: "anarkali", paletteTags: ["pastel", "gold"], formality: "casual", workLevel: "minimal", sourceCredit: "Raw Mango", tags: ["modern", "comfortable"], paletteHex: ["#F4D98A", "#FBF6EF", "#B88A3A"] },
  { slug: "attire-haldi-03", eventTypes: ["haldi"], role: "groom", garmentType: "kurta", paletteTags: ["ivory", "marigold"], formality: "casual", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: ["traditional", "comfortable"], paletteHex: ["#FBF9F4", "#D4A24C", "#5C3A1E"] },
  { slug: "attire-haldi-04", eventTypes: ["haldi"], role: "family", garmentType: "kurta_set", paletteTags: ["mustard", "ivory"], formality: "casual", workLevel: "minimal", sourceCredit: "Fabindia", tags: ["traditional", "comfortable", "marigold"], paletteHex: ["#D4A24C", "#FBF4E3", "#3F6B3A"] },
  { slug: "attire-haldi-05", eventTypes: ["haldi"], role: "bride", garmentType: "co_ord", paletteTags: ["lemon", "chiffon"], formality: "casual", workLevel: "minimal", sourceCredit: "Arpita Mehta", tags: ["modern", "comfortable"], paletteHex: ["#F4D98A", "#FBF6EF", "#E8D4A0"] },
  { slug: "attire-haldi-06", eventTypes: ["haldi"], role: "groom", garmentType: "kurta", paletteTags: ["sage", "linen"], formality: "casual", workLevel: "minimal", sourceCredit: "Sabyasachi", tags: ["modern", "comfortable"], paletteHex: ["#8FA398", "#EDE4D3", "#2A1914"] },
  { slug: "attire-haldi-07", eventTypes: ["haldi"], role: "bride", garmentType: "lehenga", paletteTags: ["marigold", "emerald"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Rahul Mishra", tags: ["traditional", "marigold", "heavy_work"], paletteHex: ["#D4A24C", "#1F4D3F", "#F4EAD0"] },
  { slug: "attire-haldi-08", eventTypes: ["haldi"], role: "family", garmentType: "saree", paletteTags: ["turmeric", "rust"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: ["traditional", "marigold"], paletteHex: ["#E5732A", "#D4A24C", "#F5E6C8"] },
  { slug: "attire-haldi-09", eventTypes: ["haldi"], role: "bride", garmentType: "anarkali", paletteTags: ["canary", "ivory"], formality: "casual", workLevel: "minimal", sourceCredit: "Masaba", tags: ["modern", "marigold", "comfortable"], paletteHex: ["#F4D98A", "#FBF9F4", "#E8D4A0"] },
  { slug: "attire-haldi-10", eventTypes: ["haldi"], role: "groom", garmentType: "kurta", paletteTags: ["oat", "gold"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Kunal Rawal", tags: ["modern", "comfortable"], paletteHex: ["#EDE4D3", "#C99A45", "#3B3E45"] },

  // ── Mehendi (shares daytime_ritual chips) ──────────────────────────────
  { slug: "attire-mehendi-01", eventTypes: ["mehendi"], role: "bride", garmentType: "lehenga", paletteTags: ["rose", "sage"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Sabyasachi", tags: ["traditional", "comfortable"], paletteHex: ["#C98B9C", "#8FA276", "#F7EEE4"] },
  { slug: "attire-mehendi-02", eventTypes: ["mehendi"], role: "bride", garmentType: "anarkali", paletteTags: ["peacock", "emerald"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: ["traditional", "marigold"], paletteHex: ["#0F6A6B", "#1F4D3F", "#F1EADA"] },
  { slug: "attire-mehendi-03", eventTypes: ["mehendi"], role: "groom", garmentType: "kurta", paletteTags: ["ivory", "emerald"], formality: "casual", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: ["modern", "comfortable"], paletteHex: ["#FBF9F4", "#1F4D3F", "#5C3A1E"] },
  { slug: "attire-mehendi-04", eventTypes: ["mehendi"], role: "family", garmentType: "saree", paletteTags: ["rose", "cream"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: ["traditional"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "attire-mehendi-05", eventTypes: ["mehendi"], role: "bride", garmentType: "co_ord", paletteTags: ["bougainvillea", "magenta"], formality: "casual", workLevel: "minimal", sourceCredit: "Arpita Mehta", tags: ["modern", "comfortable"], paletteHex: ["#B1245F", "#F2A65A", "#FBF3E8"] },
  { slug: "attire-mehendi-06", eventTypes: ["mehendi"], role: "groom", garmentType: "kurta", paletteTags: ["bandhani", "indigo"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Raw Mango", tags: ["traditional"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "attire-mehendi-07", eventTypes: ["mehendi"], role: "bride", garmentType: "lehenga", paletteTags: ["matcha", "rose"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Torani", tags: ["modern", "comfortable"], paletteHex: ["#8FA276", "#C98B9C", "#F7EEE4"] },
  { slug: "attire-mehendi-08", eventTypes: ["mehendi"], role: "family", garmentType: "kurta_set", paletteTags: ["oat", "brass"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Fabindia", tags: ["modern", "comfortable"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },

  // ── Sangeet / A Night in Bombay ────────────────────────────────────────
  { slug: "attire-sangeet-01", eventTypes: ["sangeet"], role: "bride", garmentType: "lehenga", paletteTags: ["midnight", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Manish Malhotra", tags: ["glam", "bold_color"], paletteHex: ["#161A36", "#8A6A2E", "#5C1A2B"] },
  { slug: "attire-sangeet-02", eventTypes: ["sangeet"], role: "bride", garmentType: "gown", paletteTags: ["ruby", "sequin"], formality: "formal", workLevel: "heavy", sourceCredit: "Gaurav Gupta", tags: ["glam", "bold_color"], paletteHex: ["#7E1A2C", "#B7892E", "#1A1A1A"] },
  { slug: "attire-sangeet-03", eventTypes: ["sangeet"], role: "groom", garmentType: "suit", paletteTags: ["velvet", "midnight"], formality: "formal", workLevel: "moderate", sourceCredit: "SS Homme", tags: ["glam"], paletteHex: ["#161A36", "#8A6A2E", "#0A0A0A"] },
  { slug: "attire-sangeet-04", eventTypes: ["sangeet"], role: "groom", garmentType: "indo_western", paletteTags: ["emerald", "gold"], formality: "formal", workLevel: "moderate", sourceCredit: "Kunal Rawal", tags: ["glam"], paletteHex: ["#1F4D3F", "#D4A843", "#161A36"] },
  { slug: "attire-sangeet-05", eventTypes: ["sangeet"], role: "bride", garmentType: "lehenga", paletteTags: ["magenta", "fuchsia"], formality: "formal", workLevel: "heavy", sourceCredit: "Tarun Tahiliani", tags: ["glam", "bold_color"], paletteHex: ["#B1245F", "#D4A843", "#0A0A0A"] },
  { slug: "attire-sangeet-06", eventTypes: ["sangeet"], role: "family", garmentType: "saree", paletteTags: ["sapphire", "silver"], formality: "formal", workLevel: "moderate", sourceCredit: "Raw Mango", tags: ["glam"], paletteHex: ["#1B3A6B", "#EDEAE2", "#9A9A9A"] },
  { slug: "attire-sangeet-07", eventTypes: ["sangeet"], role: "bride", garmentType: "gown", paletteTags: ["noir", "metallic"], formality: "black_tie", workLevel: "moderate", sourceCredit: "Gaurav Gupta", tags: ["glam", "bold_color"], paletteHex: ["#0A0A0A", "#B88A3A", "#FFFFFF"] },
  { slug: "attire-sangeet-08", eventTypes: ["sangeet"], role: "groom", garmentType: "suit", paletteTags: ["ivory", "gold"], formality: "black_tie", workLevel: "minimal", sourceCredit: "Raghavendra Rathore", tags: ["glam"], paletteHex: ["#FBF9F4", "#B88A3A", "#1A1A1A"] },
  { slug: "attire-sangeet-09", eventTypes: ["sangeet"], role: "bride", garmentType: "indo_western", paletteTags: ["emerald", "fringe"], formality: "formal", workLevel: "moderate", sourceCredit: "Amit Aggarwal", tags: ["glam", "bold_color"], paletteHex: ["#1F4D3F", "#D4A843", "#0A0A0A"] },
  { slug: "attire-sangeet-10", eventTypes: ["sangeet"], role: "family", garmentType: "lehenga", paletteTags: ["teal", "rose"], formality: "formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: ["glam"], paletteHex: ["#0F6A6B", "#C98B9C", "#F7EEE4"] },

  // ── Garba / Dandiya (sangeet chip set) ─────────────────────────────────
  { slug: "attire-garba-01", eventTypes: ["garba"], role: "bride", garmentType: "lehenga", paletteTags: ["marigold", "fuchsia"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Sabyasachi", tags: ["glam", "bold_color"], paletteHex: ["#E5732A", "#B1245F", "#F4D98A"] },
  { slug: "attire-garba-02", eventTypes: ["garba"], role: "groom", garmentType: "kurta", paletteTags: ["indigo", "mirror"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Raghavendra Rathore", tags: ["bold_color"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "attire-garba-03", eventTypes: ["garba"], role: "bride", garmentType: "anarkali", paletteTags: ["emerald", "ruby"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: ["glam", "bold_color"], paletteHex: ["#1F4D3F", "#8A1A2B", "#D4A843"] },
  { slug: "attire-garba-04", eventTypes: ["garba"], role: "family", garmentType: "kurta_set", paletteTags: ["mirror", "turquoise"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "House of Masaba", tags: ["bold_color"], paletteHex: ["#0F6A6B", "#A37A3A", "#F1EADA"] },
  { slug: "attire-garba-05", eventTypes: ["garba"], role: "bride", garmentType: "lehenga", paletteTags: ["fuchsia", "gold"], formality: "semi_formal", workLevel: "heavy", sourceCredit: "Tarun Tahiliani", tags: ["glam", "bold_color"], paletteHex: ["#B1245F", "#F2A65A", "#FBF3E8"] },
  { slug: "attire-garba-06", eventTypes: ["garba"], role: "groom", garmentType: "indo_western", paletteTags: ["bandhani", "navy"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Kunal Rawal", tags: ["glam"], paletteHex: ["#161A36", "#D4A843", "#F6F0E0"] },
  { slug: "attire-garba-07", eventTypes: ["garba"], role: "family", garmentType: "saree", paletteTags: ["marigold", "emerald"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: ["bold_color"], paletteHex: ["#E5732A", "#1F4D3F", "#F4EAD0"] },
  { slug: "attire-garba-08", eventTypes: ["garba"], role: "bride", garmentType: "co_ord", paletteTags: ["neon", "saffron"], formality: "casual", workLevel: "minimal", sourceCredit: "Arpita Mehta", tags: ["glam", "bold_color"], paletteHex: ["#D93878", "#F2A65A", "#161A36"] },

  // ── After-party (sangeet chip set, glam-heavy) ─────────────────────────
  { slug: "attire-after_party-01", eventTypes: ["after_party"], role: "bride", garmentType: "gown", paletteTags: ["noir", "sequin"], formality: "black_tie", workLevel: "moderate", sourceCredit: "Gaurav Gupta", tags: ["glam", "bold_color"], paletteHex: ["#0A0A0A", "#B1245F", "#D93878"] },
  { slug: "attire-after_party-02", eventTypes: ["after_party"], role: "groom", garmentType: "tuxedo", paletteTags: ["onyx", "gold"], formality: "black_tie", workLevel: "minimal", sourceCredit: "SS Homme", tags: ["glam"], paletteHex: ["#111111", "#B88A3A", "#9A9A9A"] },
  { slug: "attire-after_party-03", eventTypes: ["after_party"], role: "bride", garmentType: "indo_western", paletteTags: ["hot_pink", "neon"], formality: "formal", workLevel: "moderate", sourceCredit: "Amit Aggarwal", tags: ["glam", "bold_color"], paletteHex: ["#D93878", "#F2A65A", "#0F1024"] },
  { slug: "attire-after_party-04", eventTypes: ["after_party"], role: "groom", garmentType: "suit", paletteTags: ["midnight", "navy"], formality: "formal", workLevel: "minimal", sourceCredit: "Raghavendra Rathore", tags: ["glam"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "attire-after_party-05", eventTypes: ["after_party"], role: "bride", garmentType: "gown", paletteTags: ["ruby", "sapphire"], formality: "formal", workLevel: "moderate", sourceCredit: "Tarun Tahiliani", tags: ["glam", "bold_color"], paletteHex: ["#8A1A2B", "#1B3A6B", "#D4A843"] },
  { slug: "attire-after_party-06", eventTypes: ["after_party"], role: "family", garmentType: "suit", paletteTags: ["charcoal", "gold"], formality: "black_tie", workLevel: "minimal", sourceCredit: "SS Homme", tags: ["glam"], paletteHex: ["#3B3E45", "#B88A3A", "#9A9A9A"] },
  { slug: "attire-after_party-07", eventTypes: ["after_party"], role: "bride", garmentType: "co_ord", paletteTags: ["metallic", "silver"], formality: "formal", workLevel: "moderate", sourceCredit: "Rahul Mishra", tags: ["glam", "bold_color"], paletteHex: ["#EDEAE2", "#9A9A9A", "#0A0A0A"] },
  { slug: "attire-after_party-08", eventTypes: ["after_party"], role: "groom", garmentType: "indo_western", paletteTags: ["brass", "peacock"], formality: "formal", workLevel: "moderate", sourceCredit: "Kunal Rawal", tags: ["glam"], paletteHex: ["#0F6A6B", "#A37A3A", "#0F1A1A"] },

  // ── Wedding Ceremony ───────────────────────────────────────────────────
  { slug: "attire-ceremony-01", eventTypes: ["ceremony"], role: "bride", garmentType: "lehenga", paletteTags: ["classic_red", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Sabyasachi", tags: ["classic_red", "heavy_work"], paletteHex: ["#8A1A2B", "#D4A843", "#F4EAD0"] },
  { slug: "attire-ceremony-02", eventTypes: ["ceremony"], role: "bride", garmentType: "saree", paletteTags: ["kanjeevaram", "crimson"], formality: "formal", workLevel: "heavy", sourceCredit: "Ekaya Banaras", tags: ["classic_red", "heavy_work"], paletteHex: ["#A6182D", "#D4A843", "#FBF3DE"] },
  { slug: "attire-ceremony-03", eventTypes: ["ceremony"], role: "groom", garmentType: "sherwani", paletteTags: ["ivory", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Raghavendra Rathore", tags: ["heavy_work"], paletteHex: ["#FBF9F4", "#D4A24C", "#5C3A1E"] },
  { slug: "attire-ceremony-04", eventTypes: ["ceremony"], role: "groom", garmentType: "sherwani", paletteTags: ["oxblood", "brass"], formality: "formal", workLevel: "moderate", sourceCredit: "Anamika Khanna", tags: ["classic_red", "heavy_work"], paletteHex: ["#5C1A2B", "#A37A3A", "#F1EADA"] },
  { slug: "attire-ceremony-05", eventTypes: ["ceremony"], role: "bride", garmentType: "lehenga", paletteTags: ["pastel", "rose"], formality: "formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: ["pastel", "minimalist"], paletteHex: ["#E6C2B6", "#8FA276", "#FBF6EF"] },
  { slug: "attire-ceremony-06", eventTypes: ["ceremony"], role: "bride", garmentType: "saree", paletteTags: ["ivory", "gold"], formality: "formal", workLevel: "moderate", sourceCredit: "Raw Mango", tags: ["pastel", "minimalist"], paletteHex: ["#FBF9F4", "#D4A843", "#CDBFA6"] },
  { slug: "attire-ceremony-07", eventTypes: ["ceremony"], role: "family", garmentType: "saree", paletteTags: ["emerald", "maroon"], formality: "formal", workLevel: "heavy", sourceCredit: "Tarun Tahiliani", tags: ["heavy_work"], paletteHex: ["#1F4D3F", "#5C1A2B", "#D4A843"] },
  { slug: "attire-ceremony-08", eventTypes: ["ceremony"], role: "family", garmentType: "sherwani", paletteTags: ["sand", "brass"], formality: "formal", workLevel: "moderate", sourceCredit: "Kunal Rawal", tags: ["minimalist"], paletteHex: ["#CDBFA6", "#8A6A2E", "#3B3E45"] },
  { slug: "attire-ceremony-09", eventTypes: ["ceremony"], role: "bride", garmentType: "lehenga", paletteTags: ["emerald", "ruby"], formality: "formal", workLevel: "heavy", sourceCredit: "Manish Malhotra", tags: ["heavy_work", "classic_red"], paletteHex: ["#1F4D3F", "#8A1A2B", "#D4A843"] },
  { slug: "attire-ceremony-10", eventTypes: ["ceremony"], role: "bride", garmentType: "lehenga", paletteTags: ["blush", "champagne"], formality: "formal", workLevel: "moderate", sourceCredit: "Rahul Mishra", tags: ["pastel", "minimalist"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "attire-ceremony-11", eventTypes: ["ceremony"], role: "groom", garmentType: "sherwani", paletteTags: ["emerald", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Shantanu & Nikhil", tags: ["heavy_work"], paletteHex: ["#1F4D3F", "#D4A843", "#F4EAD0"] },
  { slug: "attire-ceremony-12", eventTypes: ["ceremony"], role: "bride", garmentType: "saree", paletteTags: ["magenta", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Sabyasachi", tags: ["heavy_work", "classic_red"], paletteHex: ["#B1245F", "#D4A843", "#FBF3E8"] },

  // ── Baraat (ceremony chip set) ─────────────────────────────────────────
  { slug: "attire-baraat-01", eventTypes: ["baraat"], role: "groom", garmentType: "sherwani", paletteTags: ["ivory", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Raghavendra Rathore", tags: ["heavy_work"], paletteHex: ["#FBF9F4", "#D4A24C", "#5C3A1E"] },
  { slug: "attire-baraat-02", eventTypes: ["baraat"], role: "groom", garmentType: "sherwani", paletteTags: ["marigold", "brass"], formality: "formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: ["classic_red", "heavy_work"], paletteHex: ["#E08A2E", "#A37A3A", "#F1EADA"] },
  { slug: "attire-baraat-03", eventTypes: ["baraat"], role: "family", garmentType: "saree", paletteTags: ["marigold", "emerald"], formality: "formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: ["heavy_work"], paletteHex: ["#D4A24C", "#1F4D3F", "#F4EAD0"] },
  { slug: "attire-baraat-04", eventTypes: ["baraat"], role: "bride", garmentType: "lehenga", paletteTags: ["crimson", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Sabyasachi", tags: ["classic_red", "heavy_work"], paletteHex: ["#A6182D", "#C99A45", "#F6ECD6"] },
  { slug: "attire-baraat-05", eventTypes: ["baraat"], role: "family", garmentType: "sherwani", paletteTags: ["oat", "brass"], formality: "formal", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: ["minimalist"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },
  { slug: "attire-baraat-06", eventTypes: ["baraat"], role: "groom", garmentType: "sherwani", paletteTags: ["indigo", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Kunal Rawal", tags: ["heavy_work"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "attire-baraat-07", eventTypes: ["baraat"], role: "groom", garmentType: "sherwani", paletteTags: ["maroon", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Anamika Khanna", tags: ["classic_red", "heavy_work"], paletteHex: ["#5C1A2B", "#D4A843", "#F1EADA"] },
  { slug: "attire-baraat-08", eventTypes: ["baraat"], role: "bride", garmentType: "saree", paletteTags: ["blush", "gold"], formality: "formal", workLevel: "moderate", sourceCredit: "Rahul Mishra", tags: ["pastel", "minimalist"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },

  // ── Reception ──────────────────────────────────────────────────────────
  { slug: "attire-reception-01", eventTypes: ["reception"], role: "bride", garmentType: "gown", paletteTags: ["ivory", "gold"], formality: "formal", workLevel: "moderate", sourceCredit: "Gaurav Gupta", tags: ["cocktail"], paletteHex: ["#FBF9F4", "#B88A3A", "#1A1A1A"] },
  { slug: "attire-reception-02", eventTypes: ["reception"], role: "bride", garmentType: "saree", paletteTags: ["emerald", "gold"], formality: "formal", workLevel: "heavy", sourceCredit: "Sabyasachi", tags: [], paletteHex: ["#1F4D3F", "#D4A843", "#F4EAD0"] },
  { slug: "attire-reception-03", eventTypes: ["reception"], role: "groom", garmentType: "tuxedo", paletteTags: ["midnight", "satin"], formality: "black_tie", workLevel: "minimal", sourceCredit: "SS Homme", tags: ["cocktail"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "attire-reception-04", eventTypes: ["reception"], role: "groom", garmentType: "suit", paletteTags: ["charcoal", "silver"], formality: "formal", workLevel: "minimal", sourceCredit: "Raghavendra Rathore", tags: ["cocktail"], paletteHex: ["#3B3E45", "#CDBFA6", "#F2EDE1"] },
  { slug: "attire-reception-05", eventTypes: ["reception"], role: "bride", garmentType: "gown", paletteTags: ["champagne", "blush"], formality: "formal", workLevel: "moderate", sourceCredit: "Rahul Mishra", tags: ["cocktail"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "attire-reception-06", eventTypes: ["reception"], role: "bride", garmentType: "saree", paletteTags: ["black", "gold"], formality: "black_tie", workLevel: "heavy", sourceCredit: "Tarun Tahiliani", tags: [], paletteHex: ["#0A0A0A", "#B88A3A", "#FFFFFF"] },
  { slug: "attire-reception-07", eventTypes: ["reception"], role: "family", garmentType: "saree", paletteTags: ["navy", "silver"], formality: "formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: [], paletteHex: ["#161A36", "#EDEAE2", "#8A6A2E"] },
  { slug: "attire-reception-08", eventTypes: ["reception"], role: "family", garmentType: "suit", paletteTags: ["onyx", "ivory"], formality: "black_tie", workLevel: "minimal", sourceCredit: "SS Homme", tags: ["cocktail"], paletteHex: ["#0A0A0A", "#FFFFFF", "#B88A3A"] },
  { slug: "attire-reception-09", eventTypes: ["reception"], role: "bride", garmentType: "gown", paletteTags: ["ruby", "velvet"], formality: "formal", workLevel: "moderate", sourceCredit: "Gaurav Gupta", tags: ["cocktail"], paletteHex: ["#7E1A2C", "#B7892E", "#1A1A1A"] },
  { slug: "attire-reception-10", eventTypes: ["reception"], role: "groom", garmentType: "tuxedo", paletteTags: ["ivory", "velvet"], formality: "black_tie", workLevel: "minimal", sourceCredit: "Kunal Rawal", tags: ["cocktail"], paletteHex: ["#FBF9F4", "#B88A3A", "#3B3E45"] },

  // ── Cocktail (reception chip set) ──────────────────────────────────────
  { slug: "attire-cocktail-01", eventTypes: ["cocktail"], role: "bride", garmentType: "gown", paletteTags: ["blush", "metallic"], formality: "formal", workLevel: "moderate", sourceCredit: "Gaurav Gupta", tags: ["cocktail"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "attire-cocktail-02", eventTypes: ["cocktail"], role: "groom", garmentType: "suit", paletteTags: ["midnight", "satin"], formality: "formal", workLevel: "minimal", sourceCredit: "SS Homme", tags: ["cocktail"], paletteHex: ["#161A36", "#B88A3A", "#F6F0E0"] },
  { slug: "attire-cocktail-03", eventTypes: ["cocktail"], role: "bride", garmentType: "gown", paletteTags: ["emerald", "sapphire"], formality: "formal", workLevel: "moderate", sourceCredit: "Amit Aggarwal", tags: ["cocktail"], paletteHex: ["#1F4D3F", "#1B3A6B", "#D4A843"] },
  { slug: "attire-cocktail-04", eventTypes: ["cocktail"], role: "groom", garmentType: "tuxedo", paletteTags: ["onyx", "gold"], formality: "black_tie", workLevel: "minimal", sourceCredit: "Raghavendra Rathore", tags: ["cocktail"], paletteHex: ["#0A0A0A", "#FFFFFF", "#B88A3A"] },
  { slug: "attire-cocktail-05", eventTypes: ["cocktail"], role: "bride", garmentType: "saree", paletteTags: ["navy", "shimmer"], formality: "formal", workLevel: "moderate", sourceCredit: "Rahul Mishra", tags: [], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "attire-cocktail-06", eventTypes: ["cocktail"], role: "family", garmentType: "suit", paletteTags: ["smoke", "sand"], formality: "formal", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: ["cocktail"], paletteHex: ["#3B3E45", "#CDBFA6", "#F2EDE1"] },
  { slug: "attire-cocktail-07", eventTypes: ["cocktail"], role: "bride", garmentType: "gown", paletteTags: ["noir", "sequin"], formality: "black_tie", workLevel: "heavy", sourceCredit: "Gaurav Gupta", tags: ["cocktail"], paletteHex: ["#0A0A0A", "#B88A3A", "#D93878"] },
  { slug: "attire-cocktail-08", eventTypes: ["cocktail"], role: "family", garmentType: "saree", paletteTags: ["rose", "pearl"], formality: "formal", workLevel: "moderate", sourceCredit: "Anita Dongre", tags: [], paletteHex: ["#E6C2B6", "#EDEAE2", "#C79B7A"] },

  // ── Welcome dinner (reception chip set) ────────────────────────────────
  { slug: "attire-welcome_dinner-01", eventTypes: ["welcome_dinner"], role: "bride", garmentType: "saree", paletteTags: ["rose", "gold"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Raw Mango", tags: [], paletteHex: ["#C98B9C", "#D4A843", "#F7EEE4"] },
  { slug: "attire-welcome_dinner-02", eventTypes: ["welcome_dinner"], role: "groom", garmentType: "kurta", paletteTags: ["linen", "sand"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: [], paletteHex: ["#F1EDE4", "#8FA8B3", "#D4A24C"] },
  { slug: "attire-welcome_dinner-03", eventTypes: ["welcome_dinner"], role: "bride", garmentType: "co_ord", paletteTags: ["oat", "champagne"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Torani", tags: [], paletteHex: ["#EDE4D3", "#E8D4A0", "#3B3E45"] },
  { slug: "attire-welcome_dinner-04", eventTypes: ["welcome_dinner"], role: "family", garmentType: "saree", paletteTags: ["emerald", "gold"], formality: "semi_formal", workLevel: "moderate", sourceCredit: "Ekaya Banaras", tags: [], paletteHex: ["#1F4D3F", "#D4A843", "#F4EAD0"] },
  { slug: "attire-welcome_dinner-05", eventTypes: ["welcome_dinner"], role: "groom", garmentType: "suit", paletteTags: ["sage", "ivory"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "SS Homme", tags: ["cocktail"], paletteHex: ["#8FA398", "#EDE4D3", "#3B3E45"] },
  { slug: "attire-welcome_dinner-06", eventTypes: ["welcome_dinner"], role: "bride", garmentType: "gown", paletteTags: ["sand", "slate"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Rahul Mishra", tags: [], paletteHex: ["#F2EDE1", "#CDBFA6", "#3B3E45"] },

  // ── Farewell brunch (reception chip set, lighter formality) ────────────
  { slug: "attire-farewell_brunch-01", eventTypes: ["farewell_brunch"], role: "bride", garmentType: "saree", paletteTags: ["cream", "blush"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Raw Mango", tags: [], paletteHex: ["#E6C2B6", "#FBF6EF", "#C79B7A"] },
  { slug: "attire-farewell_brunch-02", eventTypes: ["farewell_brunch"], role: "groom", garmentType: "kurta", paletteTags: ["oat", "brass"], formality: "casual", workLevel: "minimal", sourceCredit: "Fabindia", tags: [], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },
  { slug: "attire-farewell_brunch-03", eventTypes: ["farewell_brunch"], role: "bride", garmentType: "anarkali", paletteTags: ["sage", "mist"], formality: "casual", workLevel: "minimal", sourceCredit: "Torani", tags: [], paletteHex: ["#B8C4BD", "#8FA398", "#EFEADF"] },
  { slug: "attire-farewell_brunch-04", eventTypes: ["farewell_brunch"], role: "family", garmentType: "saree", paletteTags: ["marigold", "cream"], formality: "semi_formal", workLevel: "minimal", sourceCredit: "Ekaya Banaras", tags: [], paletteHex: ["#D4A24C", "#E5732A", "#FBF3DE"] },
  { slug: "attire-farewell_brunch-05", eventTypes: ["farewell_brunch"], role: "groom", garmentType: "kurta", paletteTags: ["indigo", "ivory"], formality: "casual", workLevel: "minimal", sourceCredit: "Antar-Agni", tags: [], paletteHex: ["#3C4F8C", "#E8DFCE", "#D4A843"] },
  { slug: "attire-farewell_brunch-06", eventTypes: ["farewell_brunch"], role: "bride", garmentType: "co_ord", paletteTags: ["linen", "sand"], formality: "casual", workLevel: "minimal", sourceCredit: "House of Masaba", tags: [], paletteHex: ["#F2EDE1", "#CDBFA6", "#3B3E45"] },
];

export const ATTIRE_IMAGES: AttireImage[] = SEEDS.map((s) => ({
  id: s.slug,
  eventTypes: s.eventTypes,
  role: s.role,
  garmentType: s.garmentType,
  paletteTags: s.paletteTags,
  formality: s.formality,
  workLevel: s.workLevel,
  sourceCredit: s.sourceCredit,
  url: null,
  tags: s.tags,
  paletteHex: s.paletteHex,
}));

const BY_ID: Record<string, AttireImage> = Object.fromEntries(
  ATTIRE_IMAGES.map((img) => [img.id, img]),
);

export function getAttireImage(id: string): AttireImage | undefined {
  return BY_ID[id];
}

export function getAttireImagesFor(eventType: EventType): AttireImage[] {
  return ATTIRE_IMAGES.filter((img) => img.eventTypes.includes(eventType));
}

export function getAttireCategoryFor(eventType: EventType): AttireCategory {
  return ATTIRE_CATEGORY_FOR[eventType];
}

export function getAttireChipsFor(eventType: EventType): AttireChip[] {
  return ATTIRE_CHIPS[ATTIRE_CATEGORY_FOR[eventType]];
}

// Garment-type display labels — used in the hover overlay.
export const GARMENT_LABEL: Record<AttireGarmentType, string> = {
  lehenga: "Lehenga",
  saree: "Saree",
  sherwani: "Sherwani",
  suit: "Suit",
  gown: "Gown",
  kurta: "Kurta",
  anarkali: "Anarkali",
  indo_western: "Indo-Western",
  tuxedo: "Tuxedo",
  kurta_set: "Kurta Set",
  co_ord: "Co-ord Set",
};

// Intersection test: chips combine within a kind as OR, across kinds as AND.
// "All" is represented by an empty active-chip set.
export function attireMatchesChips(
  image: AttireImage,
  activeChipIds: string[],
  chips: AttireChip[],
): boolean {
  if (activeChipIds.length === 0) return true;
  const byKind: Record<AttireChip["kind"], string[]> = {
    role: [],
    garment: [],
    tag: [],
  };
  for (const id of activeChipIds) {
    const chip = chips.find((c) => c.id === id);
    if (chip) byKind[chip.kind].push(id);
  }
  if (byKind.role.length > 0 && !byKind.role.includes(image.role)) return false;
  if (
    byKind.garment.length > 0 &&
    !byKind.garment.includes(image.garmentType)
  ) {
    return false;
  }
  if (byKind.tag.length > 0) {
    const haystack = new Set([...image.tags, ...image.paletteTags]);
    if (!byKind.tag.some((t) => haystack.has(t))) return false;
  }
  return true;
}
