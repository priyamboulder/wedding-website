"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Ananya Catering Workspace — narrative, discovery-first, AI as a whisper.
// Six tabs: Taste & Vision · Menu Builder · Dietary & Guests · Shortlist &
// Tasting · Service Plan · Documents.  Inline styles, ivory/champagne/cocoa.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useQuizStore } from "@/stores/quiz-store";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

const CATERING_CATEGORY_ID = "cat-catering";

// ── Palette & type ──────────────────────────────────────────────────────────

const C = {
  ivory: "#FFFDF7",
  champagne: "#F5E6D3",
  champagneSoft: "#FBF2E3",
  cocoa: "#3D2B1F",
  cocoaSoft: "#6A4F3B",
  cocoaFaint: "#9A8773",
  rose: "#C4766E",
  marigold: "#D4A853",
  sage: "#8B9E7E",
  sindoor: "#C94030",
  line: "#E8DBC3",
  lineSoft: "#F1E6D1",
  amberPale: "#FFF6E0",
};

const SERIF = `"Cormorant Garamond", "EB Garamond", Georgia, serif`;
const SANS = `"Outfit", "Inter", system-ui, sans-serif`;

// ── Types ───────────────────────────────────────────────────────────────────

type TabId =
  | "vision"
  | "menu"
  | "dietary"
  | "shortlist"
  | "service"
  | "documents";

type DietTag =
  | "Veg"
  | "Non"
  | "Vegan"
  | "Jain"
  | "GF"
  | "Halal"
  | "Nut-free";

type ServiceStyle = "Buffet" | "Live station" | "Passed" | "Plated" | "Family-style";

type Status =
  | "Not started"
  | "In progress"
  | "Needs review"
  | "Approved"
  | "Blocked";

interface Dish {
  id: string;
  // `name` stays as the canonical display string — readers that don't know
  // about creative naming still see something. New code should set both
  // `name_standard` and `name_creative` so the UI can toggle which one
  // shows up. When only `name` exists, both fall back to it.
  name: string;
  name_standard?: string;
  name_creative?: string;
  description?: string;
  diet: DietTag;
  service: ServiceStyle;
  aiSuggested?: boolean;
}

interface AIMenuDraft {
  rationale: string;
  presentation_notes: string;
  dishes: Array<{
    section: "starters" | "mains" | "desserts" | "beverages";
    name_standard: string;
    name_creative: string;
    description: string;
    diet: DietTag;
    service: ServiceStyle;
    why_note: string;
  }>;
  model: string;
}

const AI_INSPIRATION_IMAGES: Array<{ src: string; caption: string }> = [
  {
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format",
    caption: "Live chaat counter — chef visible, spice bowls open",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format",
    caption: "Long buffet — dish names hand-lettered on cards",
  },
  {
    src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format",
    caption: "Pani puri station with six waters labelled",
  },
  {
    src: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format",
    caption: "Brass thali on banana leaf — passed plated style",
  },
  {
    src: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&auto=format",
    caption: "Late-night kebab spread — copper plates, marigold edge",
  },
  {
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format",
    caption: "Signature cocktail moment behind the bar",
  },
];

interface EventMenu {
  key: string;
  label: string;
  guests: number;
  serviceStyle: string;
  dietarySplit: string;
  status: Status;
  starters: Dish[];
  mains: Dish[];
  desserts: Dish[];
  beverages: Dish[];
}

interface Pin {
  id: string;
  bucket: "FOOD" | "PRESENTATION" | "STATIONS" | "TABLE SETUP" | "LATE-NIGHT";
  src: string;
  caption: string;
}

interface Suggestion {
  id: string;
  event: "Haldi" | "Mehendi" | "Sangeet" | "Wedding" | "Reception" | "Late Night";
  src: string;
  caption: string;
  reaction?: "love" | "pass";
}

interface DietaryRow {
  id: string;
  need: string;
  guests: number;
  events: string;
  severity: "soft" | "firm" | "safety";
}

interface Caterer {
  id: string;
  name: string;
  city: string;
  cuisine: string;
  perPlate: string;
  status: Status;
  notes: string;
}

interface Tasting {
  id: string;
  caterer: string;
  date: string;
  location: string;
  guests: string;
  notes: string;
  overall: "strong" | "weak" | "neutral";
  dishes: { name: string; stars: 1 | 2 | 3 | 4 | 5; verdict: string }[];
}

// ── Live tasting types ────────────────────────────────────────────────────
// Replaces the retrospective Tasting model with a session-based model that
// captures per-person reactions in real time. The aggregate consensus
// across participants becomes the input to the Shortlist ranking.

type TastingRating = "love" | "neutral" | "dislike";

type TastingStatus = "upcoming" | "in_progress" | "completed";

interface TastingParticipant {
  id: string;
  name: string;
  initials: string;
  // Soft accent for the avatar chip background — kept palette-neutral.
  tint: string;
}

interface TastingDishCard {
  id: string;
  name: string;
  description: string;
  photo_url?: string;
  // ratings keyed by participant id
  ratings: Record<string, { rating: TastingRating; note: string }>;
}

interface TastingSession {
  id: string;
  caterer: string;
  date: string;
  time: string;
  location: string;
  status: TastingStatus;
  participants: TastingParticipant[];
  dishes: TastingDishCard[];
  // Optional general session note — separate from per-dish per-person notes.
  general_note: string;
}

interface ServiceRow {
  event: string;
  time: string;
  style: string;
  staff: number;
  setupBy: string;
}

interface DocEntry {
  id: string;
  title: string;
  vendor: string;
  type: "Menu" | "Proposal" | "Tasting notes" | "Dietary" | "Contract" | "Invoice" | "Permit";
  updated: string;
}

// ── Mock data ───────────────────────────────────────────────────────────────

const CUISINE_KEYWORDS = [
  "punjabi",
  "mughlai",
  "gujarati",
  "south-indian",
  "chaat",
  "live-stations",
  "fusion",
  "indo-chinese",
  "street-food",
  "traditional",
  "bengali",
  "rajasthani",
  "jain-friendly",
  "halal",
  "coastal",
];

const INITIAL_MOODBOARD: Pin[] = [
  {
    id: "p1",
    bucket: "FOOD",
    src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format",
    caption: "Dal makhani, slow-simmered",
  },
  {
    id: "p2",
    bucket: "STATIONS",
    src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format",
    caption: "Live pani puri counter",
  },
  {
    id: "p3",
    bucket: "PRESENTATION",
    src: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format",
    caption: "Brass thali, banana leaf",
  },
  {
    id: "p4",
    bucket: "TABLE SETUP",
    src: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=600&auto=format",
    caption: "Marigold runners, tall candles",
  },
];

const REFERENCE_IMAGES: Suggestion[] = [
  {
    id: "s1",
    event: "Sangeet",
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format",
    caption: "Cocktail chaat station",
  },
  {
    id: "s2",
    event: "Sangeet",
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format",
    caption: "Passed small plates",
  },
  {
    id: "s3",
    event: "Sangeet",
    src: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&auto=format",
    caption: "Late-night kebab spread",
  },
  {
    id: "s4",
    event: "Sangeet",
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format",
    caption: "Signature cocktail pairing",
  },
];

const INITIAL_MENUS: EventMenu[] = [
  {
    key: "haldi",
    label: "Haldi",
    guests: 120,
    serviceStyle: "Stations, light bites",
    dietarySplit: "70% veg · 30% non-veg",
    status: "In progress",
    starters: [
      { id: "h1", name: "Seasonal fruit chaat", diet: "Veg", service: "Passed" },
      { id: "h2", name: "Mini samosas", diet: "Veg", service: "Passed" },
    ],
    mains: [],
    desserts: [
      { id: "h3", name: "Jalebi with rabri", diet: "Veg", service: "Live station" },
    ],
    beverages: [
      { id: "h4", name: "Masala chai", diet: "Veg", service: "Live station" },
      { id: "h5", name: "Kesar lassi", diet: "Veg", service: "Buffet" },
    ],
  },
  {
    key: "mehendi",
    label: "Mehendi",
    guests: 180,
    serviceStyle: "Stations · passed",
    dietarySplit: "65% veg · 30% non-veg · 5% Jain",
    status: "Not started",
    starters: [
      { id: "m1", name: "Assorted chaat bar", diet: "Veg", service: "Live station" },
      { id: "m2", name: "Tandoori paneer skewers", diet: "Veg", service: "Passed" },
    ],
    mains: [],
    desserts: [{ id: "m3", name: "Kulfi cart", diet: "Veg", service: "Live station" }],
    beverages: [{ id: "m4", name: "Aam panna", diet: "Veg", service: "Buffet" }],
  },
  {
    key: "sangeet",
    label: "Sangeet",
    guests: 300,
    serviceStyle: "Buffet + open bar",
    dietarySplit: "55% veg · 40% non-veg · 5% vegan",
    status: "In progress",
    starters: [
      { id: "s1", name: "Hara bhara kebab", diet: "Veg", service: "Passed" },
      { id: "s2", name: "Chicken malai tikka", diet: "Non", service: "Passed" },
    ],
    mains: [
      { id: "s3", name: "Butter chicken", diet: "Non", service: "Buffet" },
      { id: "s4", name: "Paneer makhani", diet: "Veg", service: "Buffet" },
      { id: "s5", name: "Naan, roti", diet: "Veg", service: "Live station" },
    ],
    desserts: [{ id: "s6", name: "Gulab jamun", diet: "Veg", service: "Buffet" }],
    beverages: [
      { id: "s7", name: "Signature cocktail — Mango Sunset", diet: "Veg", service: "Buffet" },
    ],
  },
  {
    key: "wedding",
    label: "Wedding",
    guests: 350,
    serviceStyle: "Grand buffet + live stations",
    dietarySplit: "60% veg · 30% non-veg · 10% vegan/Jain",
    status: "Approved",
    starters: [
      { id: "w1", name: "Paneer tikka", diet: "Veg", service: "Buffet" },
      { id: "w2", name: "Chicken malai tikka", diet: "Non", service: "Buffet" },
      { id: "w3", name: "Pani puri", diet: "Veg", service: "Live station" },
      { id: "w4", name: "Dahi kebab", diet: "Veg", service: "Passed" },
    ],
    mains: [
      { id: "w5", name: "Dal makhani", diet: "Veg", service: "Buffet" },
      { id: "w6", name: "Palak paneer", diet: "Veg", service: "Buffet" },
      { id: "w7", name: "Chicken biryani", diet: "Non", service: "Buffet" },
      { id: "w8", name: "Lamb rogan josh", diet: "Non", service: "Buffet" },
      { id: "w9", name: "Jain dal (no onion/garlic)", diet: "Jain", service: "Live station" },
      { id: "w10", name: "Naan / roti", diet: "Veg", service: "Live station" },
      { id: "w11", name: "Steamed rice", diet: "Veg", service: "Buffet" },
    ],
    desserts: [
      { id: "w12", name: "Gulab jamun", diet: "Veg", service: "Buffet" },
      { id: "w13", name: "Ras malai", diet: "Veg", service: "Buffet" },
      { id: "w14", name: "Kulfi station", diet: "Veg", service: "Live station" },
    ],
    beverages: [
      { id: "w15", name: "Masala chai", diet: "Veg", service: "Live station" },
      { id: "w16", name: "Mango lassi", diet: "Veg", service: "Buffet" },
      { id: "w17", name: "Water, soft drinks", diet: "Veg", service: "Buffet" },
    ],
  },
  {
    key: "reception",
    label: "Reception",
    guests: 280,
    serviceStyle: "Plated, 6-course",
    dietarySplit: "50% veg · 45% non-veg · 5% GF",
    status: "Needs review",
    starters: [
      { id: "r1", name: "Tandoori broccoli amuse", diet: "Veg", service: "Plated" },
    ],
    mains: [
      { id: "r2", name: "Saffron risotto", diet: "Veg", service: "Plated", aiSuggested: true },
      { id: "r3", name: "Lamb shank dum", diet: "Non", service: "Plated" },
    ],
    desserts: [{ id: "r4", name: "Saffron-pistachio trifle", diet: "Veg", service: "Plated" }],
    beverages: [{ id: "r5", name: "Champagne toast", diet: "Veg", service: "Passed" }],
  },
  {
    key: "late",
    label: "Late Night",
    guests: 120,
    serviceStyle: "Stations, casual",
    dietarySplit: "Mixed",
    status: "Not started",
    starters: [
      { id: "l1", name: "Wood-fired pizza", diet: "Veg", service: "Live station" },
      { id: "l2", name: "Mini chicken sliders", diet: "Non", service: "Passed" },
    ],
    mains: [],
    desserts: [
      { id: "l3", name: "Paan ice cream", diet: "Veg", service: "Live station" },
    ],
    beverages: [],
  },
];

const INITIAL_DIETARY: DietaryRow[] = [
  { id: "d1", need: "Vegetarian", guests: 210, events: "All events", severity: "firm" },
  { id: "d2", need: "Non-vegetarian", guests: 105, events: "All events", severity: "soft" },
  { id: "d3", need: "Strict Jain", guests: 15, events: "Wedding, Reception", severity: "firm" },
  { id: "d4", need: "Vegan", guests: 8, events: "Sangeet, Reception", severity: "firm" },
  { id: "d5", need: "Gluten-free", guests: 4, events: "All events", severity: "safety" },
  { id: "d6", need: "Nut allergy", guests: 3, events: "All events", severity: "safety" },
  { id: "d7", need: "Halal", guests: 12, events: "All events", severity: "firm" },
  { id: "d8", need: "Diabetic-friendly", guests: 6, events: "All events", severity: "soft" },
  { id: "d9", need: "Child meals", guests: 18, events: "All events", severity: "soft" },
];

// ── Dietary deep-link data ────────────────────────────────────────────────
// Sample guest list that backs the per-row drill-down on Dietary & Guests.
// The shape mirrors what a real Guest workspace export would feed in:
// guest name + which events they're attending + which dietary needs apply
// + free-text notes the caterer should know about specifically.
//
// TODO: Guest Experience Portal — this data feeds into the guest-facing app
// so each guest sees their personal "what can I eat" view per event.

interface DietaryGuest {
  id: string;
  name: string;
  events: string[]; // e.g. ["Wedding", "Reception"]
  dietary_needs: string[]; // labels matching DietaryRow.need
  notes: string;
}

const ALL_EVENTS = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"];

const INITIAL_DIETARY_GUESTS: DietaryGuest[] = [
  {
    id: "g-gf-1",
    name: "Grandfather Sharma",
    events: ["Wedding", "Reception"],
    dietary_needs: ["Gluten-free"],
    notes:
      "Celiac disease, diagnosed 2019. Cross-contamination is a real risk — needs separate prep area, not just GF dishes.",
  },
  {
    id: "g-gf-2",
    name: "Aunty Meera",
    events: ALL_EVENTS,
    dietary_needs: ["Gluten-free", "Vegetarian"],
    notes: "Mild gluten sensitivity, not celiac. Trace amounts are okay.",
  },
  {
    id: "g-gf-3",
    name: "Cousin Rohan",
    events: ["Sangeet", "Wedding"],
    dietary_needs: ["Gluten-free"],
    notes: "",
  },
  {
    id: "g-gf-4",
    name: "Mira (friend of bride)",
    events: ["Wedding"],
    dietary_needs: ["Gluten-free", "Vegan"],
    notes: "Both GF and vegan — flag any dish with both safe.",
  },
  {
    id: "g-na-1",
    name: "Little Aarav (5 yrs)",
    events: ALL_EVENTS,
    dietary_needs: ["Nut allergy", "Child meals"],
    notes:
      "Severe peanut allergy, EpiPen carried by mom. Mom will personally supervise his plate.",
  },
  {
    id: "g-na-2",
    name: "Cousin Jaya",
    events: ALL_EVENTS,
    dietary_needs: ["Nut allergy"],
    notes: "Tree nut allergy (almonds, cashews). Peanuts okay.",
  },
  {
    id: "g-na-3",
    name: "Uncle Pradeep",
    events: ["Wedding", "Reception"],
    dietary_needs: ["Nut allergy"],
    notes: "",
  },
  {
    id: "g-jain-1",
    name: "Bua-ji (paternal aunt)",
    events: ["Wedding", "Reception"],
    dietary_needs: ["Strict Jain"],
    notes: "No root vegetables (no onion, garlic, potato, ginger).",
  },
  {
    id: "g-jain-2",
    name: "Jain family (4 ppl)",
    events: ["Wedding", "Reception"],
    dietary_needs: ["Strict Jain"],
    notes: "Group of four — sit together if possible.",
  },
  {
    id: "g-vegan-1",
    name: "Friend Anika",
    events: ["Sangeet", "Reception"],
    dietary_needs: ["Vegan"],
    notes: "Strict vegan — no dairy, no honey.",
  },
  {
    id: "g-vegan-2",
    name: "Sangeet plus-one — Marcus",
    events: ["Sangeet"],
    dietary_needs: ["Vegan"],
    notes: "",
  },
  {
    id: "g-halal-1",
    name: "Hassan family (4 ppl)",
    events: ALL_EVENTS,
    dietary_needs: ["Halal"],
    notes: "Will eat veg if no halal-certified meat available.",
  },
  {
    id: "g-diab-1",
    name: "Naani-ji",
    events: ALL_EVENTS,
    dietary_needs: ["Diabetic-friendly"],
    notes: "Type 2 diabetes — please offer a sugar-free dessert option.",
  },
];

// Maps the user-facing dietary need label to the set of dish diet tags
// that are SAFE for that need. Tags not in the safe set are flagged as
// "needs caterer confirmation" rather than auto-marked unsafe — most
// dishes can be adapted, just not without checking.
const DIET_NEED_SAFE_TAGS: Record<string, ReadonlyArray<DietTag>> = {
  Vegetarian: ["Veg", "Vegan", "Jain"],
  "Non-vegetarian": ["Veg", "Non", "Vegan", "Jain", "GF", "Halal", "Nut-free"],
  "Strict Jain": ["Jain"],
  Vegan: ["Vegan"],
  "Gluten-free": ["GF"],
  "Nut allergy": ["Nut-free"],
  Halal: ["Halal", "Veg", "Vegan", "Jain"],
  "Diabetic-friendly": [],
  "Child meals": [],
};

// Returns "safe" | "unsafe" | "check" for a dish given a dietary need.
function dishStatusFor(need: string, dish: Dish): "safe" | "unsafe" | "check" {
  const safeTags = DIET_NEED_SAFE_TAGS[need] ?? [];
  if (safeTags.includes(dish.diet)) return "safe";
  // Only "Strict Jain" and "Vegan" hard-exclude dishes outside the safe set.
  if (need === "Strict Jain" || need === "Vegan") {
    if (dish.diet === "Non") return "unsafe";
  }
  if (need === "Vegetarian" && dish.diet === "Non") return "unsafe";
  return "check";
}

const INITIAL_CATERERS: Caterer[] = [
  {
    id: "c1",
    name: "Royal Indian Kitchen",
    city: "Plano, TX",
    cuisine: "North Indian · Mughlai",
    perPlate: "$85",
    status: "In progress",
    notes: "Tasting #1 went well. Biryani needs rework. Mom wants the dal exactly as-is.",
  },
  {
    id: "c2",
    name: "Saffron & Co.",
    city: "Dallas, TX",
    cuisine: "Pan-Indian · Fusion",
    perPlate: "$92",
    status: "Needs review",
    notes: "Strong on live stations. Jain kitchen setup not yet confirmed.",
  },
  {
    id: "c3",
    name: "Madras Silk Route",
    city: "Irving, TX",
    cuisine: "South Indian · Chettinad",
    perPlate: "$78",
    status: "Not started",
    notes: "Recommended by Priya's aunt. Menu proposal requested.",
  },
];

const INITIAL_TASTINGS: Tasting[] = [
  {
    id: "t1",
    caterer: "Royal Indian Kitchen",
    date: "March 20, 2026",
    location: "Their kitchen, Plano",
    guests: "Priya, Raj, Mom (bride), Mom (groom), Urvashi",
    overall: "strong",
    notes:
      "Mom loved the dal — wants it exactly like this. Biryani needs more moisture. Ask about their Jain kitchen setup. Gulab jamun is too sweet — can they reduce sugar by 20%?",
    dishes: [
      { name: "Dal makhani", stars: 5, verdict: "Must have" },
      { name: "Paneer tikka", stars: 4, verdict: "Good" },
      { name: "Chicken biryani", stars: 3, verdict: "Too dry" },
      { name: "Lamb rogan josh", stars: 5, verdict: "Perfect" },
      { name: "Gulab jamun", stars: 4, verdict: "Less sweet" },
    ],
  },
  {
    id: "t2",
    caterer: "Saffron & Co.",
    date: "April 02, 2026",
    location: "Saffron tasting room, Dallas",
    guests: "Priya, Raj, Dad (bride)",
    overall: "neutral",
    notes:
      "Live dosa station was a highlight. Mains were slightly under-seasoned. Ask for a revised tasting with stronger masalas.",
    dishes: [
      { name: "Live dosa station", stars: 5, verdict: "Wow" },
      { name: "Butter chicken", stars: 3, verdict: "Under-seasoned" },
      { name: "Palak paneer", stars: 4, verdict: "Good" },
      { name: "Ras malai", stars: 4, verdict: "Light, balanced" },
    ],
  },
];

// ── Live tasting seed data ────────────────────────────────────────────────

const TASTING_PARTICIPANTS: TastingParticipant[] = [
  { id: "priya", name: "Priya", initials: "PR", tint: "#F5E6D3" },
  { id: "raj", name: "Raj", initials: "RA", tint: "#F0DCC4" },
  { id: "mom_b", name: "Mom (bride)", initials: "MB", tint: "#FFE3D5" },
  { id: "mom_g", name: "Mom (groom)", initials: "MG", tint: "#E8D8C0" },
  { id: "urvashi", name: "Urvashi (planner)", initials: "UR", tint: "#E5DACA" },
];

const INITIAL_TASTING_SESSIONS: TastingSession[] = [
  {
    id: "ts1",
    caterer: "Royal Indian Kitchen",
    date: "March 20, 2026",
    time: "2:00 PM",
    location: "Their kitchen, Plano",
    status: "completed",
    participants: TASTING_PARTICIPANTS,
    general_note:
      "Mom loved the dal — wants it exactly like this. Ask about their Jain kitchen setup.",
    dishes: [
      {
        id: "d-rk-1",
        name: "Dal makhani",
        description: "Slow-simmered black dal, butter, cream.",
        photo_url:
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format",
        ratings: {
          priya: { rating: "love", note: "Yes — exactly the right richness." },
          raj: { rating: "love", note: "Family-grade." },
          mom_b: {
            rating: "love",
            note: "EXACTLY like this. No changes.",
          },
          mom_g: { rating: "love", note: "" },
          urvashi: { rating: "love", note: "Strongest dal we've had." },
        },
      },
      {
        id: "d-rk-2",
        name: "Paneer tikka",
        description: "Tandoor-charred paneer, mint chutney.",
        photo_url:
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format",
        ratings: {
          priya: { rating: "love", note: "Char is good." },
          raj: { rating: "neutral", note: "A touch dry." },
          mom_b: { rating: "love", note: "" },
          mom_g: { rating: "neutral", note: "Marinade could go deeper." },
          urvashi: { rating: "love", note: "" },
        },
      },
      {
        id: "d-rk-3",
        name: "Chicken biryani",
        description: "Sealed dum, kewra, fried onion.",
        photo_url:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format",
        ratings: {
          priya: { rating: "dislike", note: "Too dry." },
          raj: { rating: "neutral", note: "Rice is fine, chicken is dry." },
          mom_b: { rating: "dislike", note: "Needs more moisture." },
          mom_g: { rating: "neutral", note: "" },
          urvashi: { rating: "dislike", note: "Ask for a redo." },
        },
      },
      {
        id: "d-rk-4",
        name: "Lamb rogan josh",
        description: "Slow-braised lamb, deggi mirch, fennel.",
        ratings: {
          priya: { rating: "love", note: "Perfect heat." },
          raj: { rating: "love", note: "" },
          mom_b: { rating: "love", note: "" },
          mom_g: { rating: "love", note: "Best of the day." },
          urvashi: { rating: "love", note: "" },
        },
      },
      {
        id: "d-rk-5",
        name: "Gulab jamun",
        description: "Khoya dumplings, cardamom syrup.",
        ratings: {
          priya: { rating: "neutral", note: "Too sweet." },
          raj: { rating: "neutral", note: "Sugar dial it back 20%." },
          mom_b: { rating: "love", note: "" },
          mom_g: { rating: "neutral", note: "" },
          urvashi: { rating: "neutral", note: "Reduce sugar 20%." },
        },
      },
    ],
  },
  {
    id: "ts2",
    caterer: "Saffron & Co.",
    date: "April 02, 2026",
    time: "1:00 PM",
    location: "Saffron tasting room, Dallas",
    status: "completed",
    participants: TASTING_PARTICIPANTS.slice(0, 3),
    general_note: "Live dosa station was the highlight. Mains under-seasoned.",
    dishes: [
      {
        id: "d-sa-1",
        name: "Live dosa station",
        description: "Crisp dosa folded over masala potato, sambar, chutneys.",
        ratings: {
          priya: { rating: "love", note: "Theatre + flavour." },
          raj: { rating: "love", note: "" },
          mom_b: { rating: "love", note: "Wow." },
        },
      },
      {
        id: "d-sa-2",
        name: "Butter chicken",
        description: "Tomato-cashew, cream, slow-cooked chicken.",
        ratings: {
          priya: { rating: "neutral", note: "Under-seasoned." },
          raj: { rating: "neutral", note: "Needs salt and depth." },
          mom_b: { rating: "dislike", note: "Flat." },
        },
      },
      {
        id: "d-sa-3",
        name: "Palak paneer",
        description: "Spinach gravy, soft paneer cubes.",
        ratings: {
          priya: { rating: "love", note: "" },
          raj: { rating: "neutral", note: "" },
          mom_b: { rating: "love", note: "" },
        },
      },
    ],
  },
  {
    id: "ts3",
    caterer: "Madras Silk Route",
    date: "April 15, 2026",
    time: "3:00 PM",
    location: "Their banquet hall, Irving",
    status: "upcoming",
    participants: TASTING_PARTICIPANTS.slice(0, 4),
    general_note: "",
    dishes: [],
  },
];

const SERVICE_PLAN: ServiceRow[] = [
  { event: "Mehendi", time: "2:00 PM", style: "Stations", staff: 8, setupBy: "12:00 PM" },
  { event: "Sangeet", time: "7:00 PM", style: "Buffet + bar", staff: 15, setupBy: "5:00 PM" },
  { event: "Wedding", time: "12:00 PM", style: "Buffet + live", staff: 20, setupBy: "9:00 AM" },
  { event: "Reception", time: "7:00 PM", style: "Plated (6 courses)", staff: 25, setupBy: "5:00 PM" },
  { event: "Late night", time: "11:00 PM", style: "Stations", staff: 6, setupBy: "10:00 PM" },
];

const INITIAL_DOCS: DocEntry[] = [
  { id: "doc1", title: "Wedding dinner menu — v3", vendor: "Royal Indian Kitchen", type: "Menu", updated: "Apr 14" },
  { id: "doc2", title: "Proposal + pricing", vendor: "Saffron & Co.", type: "Proposal", updated: "Mar 29" },
  { id: "doc3", title: "Tasting #1 notes", vendor: "Royal Indian Kitchen", type: "Tasting notes", updated: "Mar 21" },
  { id: "doc4", title: "Dietary rollup — April", vendor: "Internal", type: "Dietary", updated: "Apr 18" },
  { id: "doc5", title: "Signed contract", vendor: "Royal Indian Kitchen", type: "Contract", updated: "Apr 02" },
  { id: "doc6", title: "Deposit invoice", vendor: "Royal Indian Kitchen", type: "Invoice", updated: "Apr 03" },
  { id: "doc7", title: "Open-flame permit", vendor: "City of Plano", type: "Permit", updated: "Apr 10" },
];

// ── Tiny primitives ─────────────────────────────────────────────────────────

const Sparkle = ({ size = 14, color = C.marigold }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path
      fill={color}
      d="M8 0l1.6 5.2L14.8 6.8 9.6 8.4 8 13.6 6.4 8.4 1.2 6.8 6.4 5.2z"
    />
  </svg>
);

const labelStyle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.cocoaFaint,
  fontWeight: 500,
};

const titleStyle: CSSProperties = {
  fontFamily: SERIF,
  fontSize: 34,
  lineHeight: 1.1,
  color: C.cocoa,
  fontWeight: 400,
  margin: "6px 0 10px 0",
};

const leadStyle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 14,
  color: C.cocoaSoft,
  lineHeight: 1.55,
  maxWidth: 640,
};

const emptyStyle: CSSProperties = {
  fontFamily: SERIF,
  fontStyle: "italic",
  color: C.cocoaFaint,
  fontSize: 15,
  lineHeight: 1.5,
};

function SectionHeader({
  label,
  title,
  body,
  action,
}: {
  label: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, margin: "48px 0 20px" }}>
      <div>
        <div style={labelStyle}>{label}</div>
        <div style={titleStyle}>{title}</div>
        {body && <div style={leadStyle}>{body}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; fg: string }> = {
    "Not started": { bg: "#EFEAE0", fg: "#8A7F6E" },
    "In progress": { bg: "#FAE9C4", fg: "#8C6A1C" },
    "Needs review": { bg: "#F1D5D0", fg: "#8B3A33" },
    Approved: { bg: "#E1EAD7", fg: "#4C6040" },
    Blocked: { bg: "#F4D6D0", fg: "#8B2E22" },
  };
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontFamily: SANS,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        background: s.bg,
        color: s.fg,
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}

function Chip({
  label,
  selected,
  onClick,
  tone = "default",
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  tone?: "default" | "diet" | "service";
}) {
  const base: CSSProperties = {
    fontFamily: SANS,
    fontSize: 12,
    padding: "5px 11px",
    borderRadius: 999,
    border: `1px solid ${selected ? C.cocoa : C.line}`,
    background: selected ? C.cocoa : C.ivory,
    color: selected ? C.ivory : C.cocoaSoft,
    cursor: onClick ? "pointer" : "default",
    letterSpacing: "0.02em",
  };
  if (tone === "diet" && !selected) {
    base.background = C.champagneSoft;
    base.border = `1px solid ${C.line}`;
  }
  if (tone === "service" && !selected) {
    base.background = C.ivory;
    base.border = `1px dashed ${C.line}`;
  }
  return (
    <button type="button" onClick={onClick} style={base}>
      {label}
    </button>
  );
}

function SoftButton({ children, onClick, variant = "ghost" }: { children: ReactNode; onClick?: () => void; variant?: "ghost" | "primary" }) {
  const style: CSSProperties = {
    fontFamily: SANS,
    fontSize: 12.5,
    letterSpacing: "0.04em",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    border:
      variant === "primary"
        ? `1px solid ${C.cocoa}`
        : `1px solid ${C.line}`,
    background: variant === "primary" ? C.cocoa : "transparent",
    color: variant === "primary" ? C.ivory : C.cocoaSoft,
  };
  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

function CardShell({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: C.ivory,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DietBadge({ diet }: { diet: DietTag }) {
  const map: Record<DietTag, { bg: string; fg: string }> = {
    Veg: { bg: "#E6EFDD", fg: "#4E6A3C" },
    Non: { bg: "#F1D7C9", fg: "#8A4730" },
    Vegan: { bg: "#DDE9CE", fg: "#4A6138" },
    Jain: { bg: "#F5E1B8", fg: "#7A5618" },
    GF: { bg: "#EADCC5", fg: "#6C4F2B" },
    Halal: { bg: "#E6D7C3", fg: "#6B4D2A" },
    "Nut-free": { bg: "#F5DCDA", fg: "#89453E" },
  };
  const s = map[diet];
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 10,
        letterSpacing: "0.08em",
        padding: "2px 7px",
        borderRadius: 4,
        background: s.bg,
        color: s.fg,
        fontWeight: 600,
      }}
    >
      {diet}
    </span>
  );
}

// ── Photography-aligned primitives ─────────────────────────────────────────
// Local mirrors of Photography's SectionHead / primaryButtonStyle /
// secondaryButtonStyle / statusPill so every tab in this file renders
// against the same editorial chrome as /workspace/photography.

function SectionHead({
  eyebrow,
  title,
  hint,
  action,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex items-end justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] pb-2.5">
      <div>
        {eyebrow && (
          <div
            className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </div>
        )}
        <h3 className="m-0 font-serif text-[22px] font-bold leading-[1.2] text-ink">
          {title}
        </h3>
        {hint && (
          <p className="mx-0 mb-0 mt-1 text-[13px] leading-[1.45] text-ink-muted">
            {hint}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="cursor-pointer rounded-[2px] border-0 bg-ink px-[18px] py-2 font-sans text-[12.5px] font-medium tracking-[0.04em] text-ivory transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="cursor-pointer rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-transparent px-4 py-2 font-sans text-[12.5px] text-ink-soft transition-colors hover:border-ink/20"
    >
      {children}
    </button>
  );
}

function StatusChip({
  status,
  tone,
}: {
  status: string;
  tone: "neutral" | "progress" | "caution" | "success" | "danger";
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: "border-[rgba(26,26,26,0.08)] bg-ivory-warm text-ink-muted",
    progress: "border-[rgba(26,26,26,0.08)] bg-ivory-warm text-ink-soft",
    caution: "border-gold/30 bg-gold-pale/60 text-[#8B6508]",
    success: "border-sage/40 bg-sage-pale text-[#4C6040]",
    danger: "border-rose/40 bg-rose-pale text-[#8B3A33]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-[3px] font-sans text-[10.5px] font-semibold uppercase tracking-[0.14em]",
        toneClass[tone],
      )}
    >
      {status}
    </span>
  );
}

function statusTone(status: Status): "neutral" | "progress" | "caution" | "success" | "danger" {
  if (status === "Approved") return "success";
  if (status === "Needs review") return "danger";
  if (status === "Blocked") return "danger";
  if (status === "In progress") return "caution";
  return "neutral";
}

// ── Tab 1: Taste & Vision ──────────────────────────────────────────────────

export function TasteAndVisionTab() {
  const cateringQuiz = getQuizSchema("catering", "vision");
  const quizCompletion = useQuizStore((s) =>
    s.getCompletion("catering", "vision"),
  );
  const [brief, setBrief] = useState(
    "Our food should feel like a Delhi-Hyderabad crossover — the dal makhani Priya's Dadi makes at home, the biryani Raj grew up on in Banjara Hills, and a playful chaat station to set the sangeet apart. We want guests who travelled 10,000 miles to leave saying 'that's the best wedding food I've ever had.'"
  );
  const [keywords, setKeywords] = useState<string[]>([
    "punjabi",
    "mughlai",
    "chaat",
    "live-stations",
    "jain-friendly",
  ]);
  const [newKeyword, setNewKeyword] = useState("");
  const [moodboard, setMoodboard] = useState<Pin[]>(INITIAL_MOODBOARD);
  const [newPin, setNewPin] = useState("");
  const [activeBucket, setActiveBucket] = useState<Pin["bucket"]>("FOOD");
  const [activeGalleryEvent, setActiveGalleryEvent] = useState<Suggestion["event"]>("Sangeet");
  const [reactions, setReactions] = useState<Record<string, "love" | "pass">>({});
  const [mustHaves, setMustHaves] = useState<string[]>([
    "Mom's dal makhani recipe",
    "Pani puri station at Sangeet",
    "Gulab jamun (less sweet)",
  ]);
  const [dontServe, setDontServe] = useState<string[]>([
    "No mushrooms (Priya's allergy)",
    "Nothing too spicy for kids",
  ]);
  const [newMust, setNewMust] = useState("");
  const [newDont, setNewDont] = useState("");

  const toggleKeyword = (k: string) =>
    setKeywords((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const addKeyword = () => {
    const v = newKeyword.trim();
    if (!v) return;
    if (!keywords.includes(v)) setKeywords([...keywords, v]);
    setNewKeyword("");
  };

  const addPin = () => {
    const v = newPin.trim();
    if (!v) return;
    setMoodboard([
      ...moodboard,
      { id: `p${Date.now()}`, bucket: activeBucket, src: v, caption: "Added reference" },
    ]);
    setNewPin("");
  };

  return (
    <div>
      {/* 1.1 Quiz Entry — uses the shared QuizRunner so Next/Back/Review work.
          Once completed, the entry card auto-hides; we surface a visible
          retake affordance in its place so the quiz never disappears. */}
      {cateringQuiz && !quizCompletion && (
        <QuizEntryCard
          schema={cateringQuiz}
          categoryId={CATERING_CATEGORY_ID}
        />
      )}
      {cateringQuiz && quizCompletion && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/25 bg-ivory-warm/40 px-4 py-3">
          <div className="min-w-0">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Taste quiz complete
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">
              Your answers are shaping the brief, keywords, and menu drafts
              below.
            </p>
          </div>
          <QuizRetakeLink
            schema={cateringQuiz}
            categoryId={CATERING_CATEGORY_ID}
          />
        </section>
      )}

      {/* 1.2 Cuisine Keywords — mirrors Photography KeywordsSection */}
      <section className="mt-12">
        <div className="mb-[18px] flex items-end justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] pb-2.5">
          <div>
            <div
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Cuisine direction
            </div>
            <h3 className="m-0 font-serif text-[22px] font-bold leading-[1.2] text-ink">
              Tap the ones that matter
            </h3>
            <p className="mx-0 mb-0 mt-1 text-[13px] leading-[1.45] text-ink-muted">
              Add your own if we missed something. These help your caterer
              pitch the right menu.
            </p>
          </div>
        </div>
        {keywords.length > 0 && (
          <div className="mb-3.5 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#8B6508] bg-ink py-[5px] pl-3 pr-1.5 font-sans text-[12px] tracking-[0.02em] text-ivory"
              >
                {k}
                <button
                  type="button"
                  onClick={() => toggleKeyword(k)}
                  className="cursor-pointer border-none bg-transparent px-1 text-[14px] text-gold-pale"
                  aria-label={`Remove ${k}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-[rgba(26,26,26,0.04)] pt-3.5">
          {CUISINE_KEYWORDS.filter((k) => !keywords.includes(k)).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleKeyword(k)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(26,26,26,0.08)] bg-transparent px-3 py-[5px] font-sans text-[12px] tracking-[0.02em] text-ink-soft transition-colors hover:border-ink/20"
            >
              + {k}
            </button>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addKeyword();
            }}
            className="inline-flex"
          >
            <input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="+ add your own"
              className="min-w-[140px] rounded-full border border-dashed border-[rgba(26,26,26,0.08)] bg-transparent px-3 py-1.5 font-sans text-[12px] text-ink-soft outline-none"
            />
          </form>
        </div>
      </section>

      {/* 1.3 Reference Gallery — visual selectors per event, react before pinning. */}
      <section className="mt-12">
        <div className="mb-[18px] flex items-end justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] pb-2.5">
          <div>
            <div
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Food inspiration by event
            </div>
            <h3 className="m-0 font-serif text-[22px] font-bold leading-[1.2] text-ink">
              What should your {activeGalleryEvent} food experience feel like?
            </h3>
            <p className="mx-0 mb-0 mt-1 text-[13px] leading-[1.45] text-ink-muted">
              Love keeps it in your board. Pass tells us what to skip.
            </p>
          </div>
        </div>
        <div className="mb-[18px] inline-flex gap-1">
          {(["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception", "Late Night"] as Suggestion["event"][]).map(
            (ev) => {
              const active = activeGalleryEvent === ev;
              return (
                <button
                  key={ev}
                  type="button"
                  onClick={() => setActiveGalleryEvent(ev)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-[5px] font-sans text-[11.5px] uppercase tracking-[0.04em] transition-colors",
                    active
                      ? "border-[#8B6508] bg-ink text-ivory"
                      : "border-[rgba(26,26,26,0.08)] bg-transparent text-ink-muted hover:border-ink/20",
                  )}
                >
                  {ev}
                </button>
              );
            },
          )}
        </div>
        <div
          className="grid gap-3.5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
        >
          {REFERENCE_IMAGES.map((s) => {
            const reaction = reactions[s.id];
            return (
              <div
                key={s.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white transition-opacity",
                  reaction === "pass" && "opacity-40",
                )}
              >
                <div
                  className="bg-ivory-warm"
                  style={{
                    aspectRatio: "4 / 5",
                    backgroundImage: `url(${s.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="flex flex-col gap-2 p-2.5">
                  <div className="font-sans text-[12px] text-ink-soft">
                    {s.caption}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setReactions({ ...reactions, [s.id]: "love" })
                      }
                      className={cn(
                        "flex-1 cursor-pointer rounded-full border px-2.5 py-1.5 font-sans text-[11px] transition-colors",
                        reaction === "love"
                          ? "border-[#8B6508] bg-ink text-ivory"
                          : "border-[rgba(26,26,26,0.08)] bg-transparent text-ink-muted hover:border-ink/20",
                      )}
                    >
                      ♡ Love
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReactions({ ...reactions, [s.id]: "pass" })
                      }
                      className="flex-1 cursor-pointer rounded-full border border-[rgba(26,26,26,0.08)] bg-transparent px-2.5 py-1.5 font-sans text-[11px] text-ink-faint transition-colors hover:border-ink/20"
                    >
                      Not for us
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 1.4 Food Moodboard — pin loved references after they survive the gallery. */}
      <section className="mt-12">
        <div className="mb-[18px] flex items-end justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] pb-2.5">
          <div>
            <div
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              The shortlist
            </div>
            <h3 className="m-0 font-serif text-[22px] font-bold leading-[1.2] text-ink">
              Food moodboard
            </h3>
            <p className="mx-0 mb-0 mt-1 text-[13px] leading-[1.45] text-ink-muted">
              Pin the dishes, presentations, and setups that inspire you.
            </p>
          </div>
        </div>
        <div className="mb-3.5 flex flex-wrap items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addPin();
            }}
            className="flex min-w-[260px] flex-1 gap-1.5"
          >
            <input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Paste an image URL…"
              className="min-w-0 flex-1 rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-3 py-2 font-sans text-[13px] text-ink outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-transparent px-4 py-2 font-sans text-[12.5px] text-ink-soft transition-colors hover:border-ink/20"
            >
              Add
            </button>
          </form>
          <button
            type="button"
            className="cursor-pointer rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-transparent px-4 py-2 font-sans text-[12.5px] text-ink-soft transition-colors hover:border-ink/20"
          >
            ⬆ Upload
          </button>
          <div className="ml-auto inline-flex gap-1">
            {(["FOOD", "PRESENTATION", "STATIONS", "TABLE SETUP", "LATE-NIGHT"] as Pin["bucket"][]).map((b) => {
              const active = activeBucket === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setActiveBucket(b)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-[5px] font-sans text-[11.5px] uppercase tracking-[0.04em] transition-colors",
                    active
                      ? "border-[#8B6508] bg-ink text-ivory"
                      : "border-[rgba(26,26,26,0.08)] bg-transparent text-ink-muted hover:border-ink/20",
                  )}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
        {moodboard.filter((p) => p.bucket === activeBucket).length === 0 ? (
          <div className="rounded-[2px] border border-dashed border-[rgba(26,26,26,0.08)] bg-ivory-warm px-7 py-11 text-center text-ink-muted">
            <div className="mb-2.5 text-[30px] text-[#8B6508]">🍽</div>
            <div className="mb-1.5 font-serif text-[20px] italic text-ink">
              Pin what inspires you.
            </div>
            <div className="mx-auto max-w-[440px] text-[13.5px] leading-[1.55]">
              Tag each pin — food, presentation, stations, table setup,
              late-night — so your caterer knows what to study.
            </div>
          </div>
        ) : (
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
          >
            {moodboard
              .filter((p) => p.bucket === activeBucket)
              .map((pin) => (
                <div
                  key={pin.id}
                  className="flex flex-col overflow-hidden rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white"
                >
                  <div
                    className="bg-ivory-warm"
                    style={{
                      aspectRatio: "4 / 5",
                      backgroundImage: `url(${pin.src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="px-2.5 py-2 font-sans text-[11.5px] text-ink-soft">
                    {pin.caption}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* 1.5 Must-have / Don't-serve — mirrors Photography body tokens */}
      <section className="mt-12">
        <div className="mb-[18px] flex items-end justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] pb-2.5">
          <div>
            <div
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Personal non-negotiables
            </div>
            <h3 className="m-0 font-serif text-[22px] font-bold leading-[1.2] text-ink">
              Must-haves and please-don&rsquo;ts
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <NonNegotiableColumn
            label="Must-have dishes"
            hint="These are non-negotiable — the dishes that must be on the menu."
            items={mustHaves}
            onRemove={(i) => setMustHaves(mustHaves.filter((_, j) => j !== i))}
            onAdd={(v) => setMustHaves([...mustHaves, v])}
            draft={newMust}
            setDraft={setNewMust}
            placeholder="e.g. Mom's dal makhani"
          />
          <NonNegotiableColumn
            label="Please don't serve"
            hint="Anything you want off the table — for any reason."
            items={dontServe}
            onRemove={(i) => setDontServe(dontServe.filter((_, j) => j !== i))}
            onAdd={(v) => setDontServe([...dontServe, v])}
            draft={newDont}
            setDraft={setNewDont}
            placeholder="e.g. no mushrooms"
          />
        </div>
      </section>

      {/* 1.6 Food Brief — pulled to the bottom: it's the OUTPUT of everything above. */}
      <section className="mt-12">
        <div className="mb-[18px] flex items-end justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] pb-2.5">
          <div>
            <div
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              The story your caterer reads first
            </div>
            <h3 className="m-0 font-serif text-[22px] font-bold leading-[1.2] text-ink">
              Your Food Brief
            </h3>
            <p className="mx-0 mb-0 mt-1 text-[13px] leading-[1.45] text-ink-muted">
              We've drafted this from your quiz, keywords, and pins above.
              Tighten it before you send it to a caterer.
            </p>
          </div>
          <button
            type="button"
            className="rounded-[2px] border-0 bg-transparent px-2.5 py-1.5 font-sans text-[12px] font-medium text-[#8B6508] transition-colors hover:text-gold"
          >
            ✨ Refine with AI
          </button>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Click to write a brief — a few sentences about what your wedding food should feel like. Don't worry about structure; we'll help you polish it."
          className="w-full resize-y rounded-[6px] border border-[rgba(26,26,26,0.08)] bg-white px-[18px] py-4 font-serif text-[15px] leading-[1.6] text-ink outline-none"
          style={{ minHeight: 160 }}
        />
      </section>
    </div>
  );
}

function NonNegotiableColumn({
  label,
  hint,
  items,
  onRemove,
  onAdd,
  draft,
  setDraft,
  placeholder,
}: {
  label: string;
  hint: string;
  items: string[];
  onRemove: (index: number) => void;
  onAdd: (value: string) => void;
  draft: string;
  setDraft: (value: string) => void;
  placeholder: string;
}) {
  const commitDraft = () => {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };
  return (
    <div>
      <div
        className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <p className="mb-3.5 text-[13px] leading-[1.45] text-ink-muted">{hint}</p>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-3 py-2.5 font-sans text-[13px] text-ink"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="cursor-pointer border-none bg-transparent px-1 text-[14px] text-ink-faint hover:text-ink"
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commitDraft();
        }}
        className="mt-2.5 flex gap-1.5"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-3 py-2 font-sans text-[13px] text-ink outline-none"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-transparent px-4 py-2 font-sans text-[12.5px] text-ink-soft transition-colors hover:border-ink/20"
        >
          Add
        </button>
      </form>
    </div>
  );
}

// ── Tab 2: Menu Builder ────────────────────────────────────────────────────

export function MenuBuilderTab() {
  const [menus, setMenus] = useState<EventMenu[]>(INITIAL_MENUS);
  const [activeKey, setActiveKey] = useState<string>("wedding");
  const active = useMemo(() => menus.find((m) => m.key === activeKey)!, [menus, activeKey]);

  // ── AI menu draft state — keyed per event so switching events doesn't
  // wipe a draft you generated for another one. The draft is independent
  // of the saved dish list; the couple chooses what to copy in.
  const [aiDrafts, setAiDrafts] = useState<Record<string, AIMenuDraft>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<Record<string, string | undefined>>({});
  const [useCreativeNames, setUseCreativeNames] = useState(true);
  const [showInspiration, setShowInspiration] = useState(false);

  const activeDraft = aiDrafts[activeKey];
  const activeLoading = Boolean(aiLoading[activeKey]);
  const activeErr = aiError[activeKey];

  const addDish = (section: "starters" | "mains" | "desserts" | "beverages") => {
    const name = window.prompt(`Add a ${section.slice(0, -1)} dish name`);
    if (!name) return;
    setMenus(
      menus.map((m) =>
        m.key === activeKey
          ? {
              ...m,
              [section]: [
                ...m[section],
                {
                  id: `${section}-${Date.now()}`,
                  name: name.trim(),
                  diet: "Veg" as DietTag,
                  service: "Buffet" as ServiceStyle,
                },
              ],
            }
          : m
      )
    );
  };

  const removeDish = (section: keyof EventMenu, id: string) => {
    setMenus(
      menus.map((m) =>
        m.key === activeKey
          ? {
              ...m,
              [section]: (m[section] as Dish[]).filter((d) => d.id !== id),
            }
          : m
      )
    );
  };

  const generateAIMenu = async () => {
    setAiLoading((p) => ({ ...p, [activeKey]: true }));
    setAiError((p) => ({ ...p, [activeKey]: undefined }));
    try {
      const res = await fetch("/api/catering/event-menu-suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event_label: active.label,
          guest_count: active.guests,
          service_style: active.serviceStyle,
          dietary_split: active.dietarySplit,
          cuisine_keywords: ["punjabi", "mughlai", "chaat", "live-stations"],
          must_haves: ["Mom's dal makhani recipe", "Pani puri station"],
          dont_serve: ["mushrooms"],
          vibe: "Warm, abundant, deeply personal — feels like family cooked it.",
        }),
      });
      const data = (await res.json()) as AIMenuDraft & {
        ok: boolean;
        error?: string;
      };
      if (!data.ok) {
        setAiError((p) => ({
          ...p,
          [activeKey]: data.error ?? "AI menu suggestion failed.",
        }));
      } else {
        setAiDrafts((p) => ({
          ...p,
          [activeKey]: {
            rationale: data.rationale,
            presentation_notes: data.presentation_notes,
            dishes: data.dishes,
            model: data.model,
          },
        }));
      }
    } catch (e) {
      setAiError((p) => ({
        ...p,
        [activeKey]: e instanceof Error ? e.message : "Network error.",
      }));
    } finally {
      setAiLoading((p) => ({ ...p, [activeKey]: false }));
    }
  };

  const adoptAIDraft = (draftDishesOnly?: AIMenuDraft["dishes"]) => {
    const draft = aiDrafts[activeKey];
    if (!draft) return;
    const sourceDishes = draftDishesOnly ?? draft.dishes;
    setMenus((prev) =>
      prev.map((m) => {
        if (m.key !== activeKey) return m;
        const next = { ...m };
        for (const d of sourceDishes) {
          const newDish: Dish = {
            id: `${d.section}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: useCreativeNames ? d.name_creative : d.name_standard,
            name_standard: d.name_standard,
            name_creative: d.name_creative,
            description: d.description,
            diet: d.diet,
            service: d.service,
            aiSuggested: true,
          };
          next[d.section] = [...next[d.section], newDish];
        }
        return next;
      }),
    );
  };

  const adoptOneDish = (dish: AIMenuDraft["dishes"][number]) => {
    adoptAIDraft([dish]);
  };

  const totalDishes =
    active.starters.length + active.mains.length + active.desserts.length + active.beverages.length;
  const vegCount = [active.starters, active.mains, active.desserts].flat().filter((d) => d.diet === "Veg").length;
  const nonCount = [active.starters, active.mains, active.desserts].flat().filter((d) => d.diet === "Non").length;
  const jainCount = [active.starters, active.mains, active.desserts].flat().filter((d) => d.diet === "Jain").length;
  const estCost = 85 * active.guests;

  return (
    <div>
      {/* Event Selector */}
      <SectionHead
        eyebrow="Build your menu"
        title="Choose the event"
        hint="Each event has its own menu — and its own guest count, service style, and dietary split."
      />
      <div className="flex flex-wrap gap-2">
        {menus.map((m) => {
          const isActive = activeKey === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveKey(m.key)}
              className={cn(
                "min-w-[130px] cursor-pointer rounded-[2px] border px-4 py-2.5 text-left transition-colors",
                isActive
                  ? "border-[#8B6508] bg-ink text-ivory"
                  : "border-[rgba(26,26,26,0.08)] bg-white text-ink hover:border-ink/20",
              )}
            >
              <div className="font-serif text-[18px] leading-tight">{m.label}</div>
              <div
                className={cn(
                  "mt-1 font-sans text-[10px] uppercase tracking-[0.12em]",
                  isActive ? "text-ivory/75" : "text-ink-muted",
                )}
              >
                {m.status}
              </div>
            </button>
          );
        })}
      </div>

      {/* Menu Builder */}
      <div className="mt-12">
        <SectionHead
          eyebrow={`${active.label} menu`}
          title={`${active.label} — ${active.serviceStyle.toLowerCase().includes("plated") ? "Dinner" : "Meal"} menu`}
          action={<StatusChip status={active.status} tone={statusTone(active.status)} />}
        />
        {/* Meta row */}
        <div className="mb-6 grid grid-cols-3 gap-4 border-b border-[rgba(26,26,26,0.04)] pb-[18px]">
          <MetaBlock label="Guest count" value={`${active.guests}`} hint="from Guest workspace" />
          <MetaBlock label="Service style" value={active.serviceStyle} />
          <MetaBlock label="Dietary split" value={active.dietarySplit} />
        </div>

        {/* AI menu draft panel */}
        <AIMenuPanel
          activeLabel={active.label}
          status={active.status}
          loading={activeLoading}
          error={activeErr}
          draft={activeDraft}
          useCreativeNames={useCreativeNames}
          onToggleCreative={() => setUseCreativeNames((v) => !v)}
          onGenerate={generateAIMenu}
          onAdoptAll={() => adoptAIDraft()}
          onAdoptOne={adoptOneDish}
          showInspiration={showInspiration}
          onToggleInspiration={() => setShowInspiration((v) => !v)}
        />

        {(["starters", "mains", "desserts", "beverages"] as const).map((section) => (
          <MenuSectionBlock
            key={section}
            title={section.toUpperCase()}
            dishes={active[section] as Dish[]}
            useCreativeNames={useCreativeNames}
            onAdd={() => addDish(section)}
            onRemove={(id) => removeDish(section, id)}
          />
        ))}
      </div>

      {/* Place Cards — generated from the menu, styled from Stationery */}
      <PlaceCardsSection
        eventLabel={active.label}
        dishes={[
          ...active.starters,
          ...active.mains,
          ...active.desserts,
          ...active.beverages,
        ]}
        useCreativeNames={useCreativeNames}
        caterer="Royal Indian Kitchen"
      />

      {/* Summary Card */}
      <div className="mt-12">
        <SectionHead eyebrow="Menu summary" title={`${active.label} at a glance`} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <SummaryRow label="Total dishes" value={String(totalDishes)} />
            <SummaryRow
              label="Veg / Non-veg"
              value={`${vegCount} veg · ${nonCount} non-veg · ${jainCount} Jain`}
            />
            <SummaryRow
              label="Service style"
              value={`Buffet (${[...active.starters, ...active.mains, ...active.desserts, ...active.beverages].filter((d) => d.service === "Buffet").length}) · Live (${[...active.starters, ...active.mains, ...active.desserts, ...active.beverages].filter((d) => d.service === "Live station").length}) · Passed (${[...active.starters, ...active.mains, ...active.desserts, ...active.beverages].filter((d) => d.service === "Passed").length})`}
            />
            <SummaryRow
              label="Estimated cost"
              value={`$85 per plate × ${active.guests} = $${estCost.toLocaleString()}`}
            />
          </div>
          <div className="rounded-[2px] border border-gold/30 bg-gold-pale/40 p-4">
            <div
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6508]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ⚠ Gap detected
            </div>
            <div className="mb-2 font-serif text-[18px] leading-tight text-ink">
              No gluten-free main on this menu
            </div>
            <div className="mb-3 font-sans text-[13px] leading-[1.5] text-ink-muted">
              4 guests are GF. <Sparkle /> Suggestion: Add a GF label to dal
              makhani (already GF) and add a GF bread option.
            </div>
            <PrimaryButton>Apply suggestion</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaBlock({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div
        className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div className="font-serif text-[19px] leading-[1.2] text-ink">{value}</div>
      {hint && (
        <div className="mt-0.5 font-sans text-[11px] text-ink-faint">{hint}</div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[rgba(26,26,26,0.04)] py-2.5">
      <span className="font-sans text-[12px] tracking-[0.06em] text-ink-faint">
        {label}
      </span>
      <span className="text-right font-sans text-[13px] text-ink">{value}</span>
    </div>
  );
}

// Returns the "other" name for a dish to show as a small secondary line
// under the primary one — only when both names exist and differ.
function dishSubName(d: Dish, useCreativeNames: boolean): string | null {
  const primary = useCreativeNames
    ? (d.name_creative || d.name)
    : (d.name_standard || d.name);
  const secondary = useCreativeNames ? d.name_standard : d.name_creative;
  if (!secondary) return null;
  if (secondary === primary) return null;
  return secondary;
}

function MenuSectionBlock({
  title,
  dishes,
  useCreativeNames = false,
  onAdd,
  onRemove,
}: {
  title: string;
  dishes: Dish[];
  useCreativeNames?: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mb-6">
      <div
        className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </div>
      <div className="overflow-hidden rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white">
        {dishes.length === 0 ? (
          <div className="px-4 py-[22px] text-center font-serif text-[15px] italic text-ink-faint">
            Nothing here yet. Add a dish, or let us suggest one based on your
            vision.
          </div>
        ) : (
          dishes.map((d, i) => (
            <div
              key={d.id}
              className={cn(
                "grid items-center gap-3 px-4 py-3",
                i < dishes.length - 1 && "border-b border-[rgba(26,26,26,0.04)]",
                d.aiSuggested && "bg-ivory-warm/50",
              )}
              style={{ gridTemplateColumns: "1fr 80px 140px 60px" }}
            >
              <div className="font-sans text-[14px] text-ink">
                {useCreativeNames
                  ? (d.name_creative || d.name)
                  : (d.name_standard || d.name)}
                {d.aiSuggested && (
                  <span className="ml-2 font-sans text-[11px] text-gold">
                    <Sparkle size={10} /> AI pick
                  </span>
                )}
                {dishSubName(d, useCreativeNames) && (
                  <div className="mt-0.5 font-sans text-[11px] italic text-ink-faint">
                    {dishSubName(d, useCreativeNames)}
                  </div>
                )}
              </div>
              <DietBadge diet={d.diet} />
              <span className="font-sans text-[12px] text-ink-muted">
                {d.service}
              </span>
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent text-[14px] text-ink-faint hover:text-ink"
                  aria-label="Edit"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(d.id)}
                  className="cursor-pointer border-0 bg-transparent text-[14px] text-ink-faint hover:text-ink"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-2.5 flex justify-between">
        <SecondaryButton onClick={onAdd}>
          + Add {title.toLowerCase().slice(0, -1)}
        </SecondaryButton>
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent font-sans text-[12px] text-gold transition-colors hover:text-[#8B6508]"
        >
          <Sparkle /> Suggest dishes
        </button>
      </div>
    </div>
  );
}

// ── Place Cards generator ─────────────────────────────────────────────────
// Pulls the dish names off the current event's menu and renders printable
// preview cards. Design tokens are read from the Stationery & Invitations
// workspace so the card aesthetic matches the wedding's invitation suite
// rather than the caterer's generic stock cards. The vendor credit is
// gated behind a toggle, off by default — when on, the caterer's name
// appears as understated micro-type on the back.
//
// TODO: Stationery design tokens — for now we use the placeholder set
// below. When the Stationery workspace exposes a tokens hook, swap
// `STATIONERY_TOKENS` for `useStationeryTokens(category.id)`.

const STATIONERY_TOKENS = {
  display_font: `"Cormorant Garamond", "EB Garamond", Georgia, serif`,
  body_font: `"Outfit", "Inter", system-ui, sans-serif`,
  paper: "#FBF6EC", // ivory-warm
  ink: "#3D2B1F", // cocoa
  accent: "#8B6508", // gold
  motif: "❋",
};

function PlaceCardsSection({
  eventLabel,
  dishes,
  useCreativeNames,
  caterer,
}: {
  eventLabel: string;
  dishes: Dish[];
  useCreativeNames: boolean;
  caterer: string;
}) {
  const [includeVendorCredit, setIncludeVendorCredit] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const previewDishes = previewExpanded ? dishes : dishes.slice(0, 6);

  return (
    <div className="mt-12">
      <SectionHead
        eyebrow="Place cards"
        title={`Generate dish cards for ${eventLabel}`}
        hint="Pulled from your menu, designed in your Stationery suite — so the cards on the table match the invitation suite, not the caterer's generic stock."
        action={
          <SecondaryButton
            onClick={() =>
              window.alert(
                `Sending ${dishes.length} cards to your stationery order. (Demo only — not yet wired to a print partner.)`,
              )
            }
          >
            Order these cards →
          </SecondaryButton>
        }
      />

      {dishes.length === 0 ? (
        <div className="rounded-[2px] border border-dashed border-[rgba(26,26,26,0.08)] bg-ivory-warm/40 px-5 py-8 text-center">
          <div className="mb-1.5 font-serif text-[18px] italic text-ink">
            Build the menu first.
          </div>
          <div className="font-sans text-[12.5px] text-ink-muted">
            Add dishes above and the cards will draft from them automatically.
          </div>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-ink-muted">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Naming
                </span>
                <span className="ml-2 font-sans">
                  Using {useCreativeNames ? "creative" : "standard"} names
                  (toggle in the AI panel above)
                </span>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink">
              <input
                type="checkbox"
                checked={includeVendorCredit}
                onChange={(e) => setIncludeVendorCredit(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#8B6508]"
              />
              <span>Include caterer credit on back</span>
            </label>
          </div>

          {/* Preview grid */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          >
            {previewDishes.map((d) => (
              <PlaceCardPreview
                key={d.id}
                dish={d}
                useCreativeNames={useCreativeNames}
                caterer={caterer}
                includeVendorCredit={includeVendorCredit}
              />
            ))}
          </div>

          {dishes.length > 6 && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setPreviewExpanded((v) => !v)}
                className="font-sans text-[12px] text-ink-muted transition-colors hover:text-ink"
              >
                {previewExpanded
                  ? "Show first 6"
                  : `Show all ${dishes.length} cards`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PlaceCardPreview({
  dish,
  useCreativeNames,
  caterer,
  includeVendorCredit,
}: {
  dish: Dish;
  useCreativeNames: boolean;
  caterer: string;
  includeVendorCredit: boolean;
}) {
  const tokens = STATIONERY_TOKENS;
  const primary = useCreativeNames
    ? (dish.name_creative || dish.name)
    : (dish.name_standard || dish.name);
  const secondary = useCreativeNames ? dish.name_standard : dish.name_creative;

  return (
    <div className="flex flex-col gap-1.5">
      {/* The card itself — styled in stationery tokens, not Catering chrome. */}
      <div
        className="aspect-[5/3] flex flex-col items-center justify-center rounded-sm border px-4 py-3 text-center shadow-[0_1px_3px_rgba(26,26,26,0.06)]"
        style={{
          background: tokens.paper,
          borderColor: `${tokens.accent}33`,
          color: tokens.ink,
          fontFamily: tokens.body_font,
        }}
      >
        <div
          style={{
            fontFamily: tokens.display_font,
            fontSize: 11,
            color: tokens.accent,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {tokens.motif} <DietBadgeIconText diet={dish.diet} /> {tokens.motif}
        </div>
        <div
          style={{
            fontFamily: tokens.display_font,
            fontSize: 19,
            lineHeight: 1.15,
            fontStyle: "italic",
          }}
        >
          {primary}
        </div>
        {secondary && secondary !== primary && (
          <div
            style={{
              fontFamily: tokens.body_font,
              fontSize: 10,
              color: `${tokens.ink}99`,
              marginTop: 4,
              letterSpacing: "0.04em",
            }}
          >
            {secondary}
          </div>
        )}
        {dish.description && (
          <div
            style={{
              fontFamily: tokens.body_font,
              fontSize: 9.5,
              color: `${tokens.ink}99`,
              marginTop: 6,
              lineHeight: 1.35,
              maxWidth: 200,
            }}
          >
            {dish.description}
          </div>
        )}
        {includeVendorCredit && (
          <div
            style={{
              fontFamily: tokens.body_font,
              fontSize: 7.5,
              color: `${tokens.ink}66`,
              marginTop: 8,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            prepared by {caterer}
          </div>
        )}
      </div>
      <div className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        {dish.diet} · {dish.service}
      </div>
    </div>
  );
}

// Plain-text label for the diet flag, used inside the place card where
// the heavy DietBadge component would clash with the stationery tokens.
function DietBadgeIconText({ diet }: { diet: DietTag }) {
  return <span>{diet.toUpperCase()}</span>;
}

// ── AI Menu Panel ─────────────────────────────────────────────────────────
// Shown above the manual dish list. Has three states:
//   1. Empty:   a CTA to generate the first AI draft for this event.
//   2. Loading: skeleton with shimmer.
//   3. Populated: rationale + presentation notes + dish grid grouped by
//      course, with per-dish "Add" + global "Add all to menu" + creative-
//      name toggle, plus an inspiration board that opens on demand.

function AIMenuPanel({
  activeLabel,
  status,
  loading,
  error,
  draft,
  useCreativeNames,
  onToggleCreative,
  onGenerate,
  onAdoptAll,
  onAdoptOne,
  showInspiration,
  onToggleInspiration,
}: {
  activeLabel: string;
  status: Status;
  loading: boolean;
  error?: string;
  draft?: AIMenuDraft;
  useCreativeNames: boolean;
  onToggleCreative: () => void;
  onGenerate: () => void;
  onAdoptAll: () => void;
  onAdoptOne: (d: AIMenuDraft["dishes"][number]) => void;
  showInspiration: boolean;
  onToggleInspiration: () => void;
}) {
  const isApproved = status === "Approved";

  return (
    <div className="mb-8 rounded-[2px] border border-gold/40 bg-gradient-to-br from-ivory-warm/40 to-white">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gold/20 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6508]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkle size={10} /> AI menu draft
          </div>
          <h4 className="m-0 font-serif text-[20px] leading-tight text-ink">
            {draft
              ? `Your ${activeLabel.toLowerCase()} menu, drafted`
              : `Let us draft a complete ${activeLabel.toLowerCase()} menu`}
          </h4>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {draft
              ? "Read why each dish is here, then keep what works. You can add the whole draft to your menu, or pick one dish at a time."
              : "We'll use your taste & vision answers, must-haves, dietary split, and service style to draft starters → mains → desserts → beverages."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {draft && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Names
              </span>
              <button
                type="button"
                onClick={onToggleCreative}
                className={cn(
                  "rounded-full border px-3 py-[3px] font-sans text-[11px] transition-colors",
                  useCreativeNames
                    ? "border-[#8B6508] bg-ink text-ivory"
                    : "border-[rgba(26,26,26,0.08)] bg-transparent text-ink-muted hover:border-ink/20",
                )}
              >
                Creative
              </button>
              <button
                type="button"
                onClick={onToggleCreative}
                className={cn(
                  "rounded-full border px-3 py-[3px] font-sans text-[11px] transition-colors",
                  !useCreativeNames
                    ? "border-[#8B6508] bg-ink text-ivory"
                    : "border-[rgba(26,26,26,0.08)] bg-transparent text-ink-muted hover:border-ink/20",
                )}
              >
                Standard
              </button>
            </div>
          )}
          {!draft && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2 font-sans text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60",
                isApproved && "bg-cocoa",
              )}
            >
              {loading ? (
                <>… Drafting</>
              ) : (
                <>
                  <Sparkle size={11} /> Generate menu draft
                </>
              )}
            </button>
          )}
          {draft && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onGenerate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(26,26,26,0.08)] bg-white px-3 py-1.5 font-sans text-[12px] text-ink-muted transition-colors hover:text-ink"
              >
                {loading ? "…" : "Regenerate"}
              </button>
              <button
                type="button"
                onClick={onAdoptAll}
                className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-3.5 py-1.5 font-sans text-[12px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Add all to menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {loading && !draft && (
        <div className="space-y-2 px-5 py-6">
          <div className="h-3 w-3/4 animate-pulse rounded bg-[rgba(26,26,26,0.06)]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[rgba(26,26,26,0.06)]" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-[rgba(26,26,26,0.06)]" />
        </div>
      )}

      {error && (
        <div className="border-t border-gold/20 bg-[#FFF0EE] px-5 py-3 font-sans text-[12.5px] text-[#7E2018]">
          {error}
        </div>
      )}

      {draft && (
        <div className="px-5 py-5">
          {/* Rationale callout */}
          <div className="mb-5 rounded-[2px] border border-gold/30 bg-gold-pale/30 p-3.5">
            <div
              className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6508]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Why these dishes work together
            </div>
            <p className="text-[13px] leading-relaxed text-ink">
              {draft.rationale}
            </p>
          </div>

          {/* Presentation notes */}
          <div className="mb-5 rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white p-3.5">
            <div
              className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Presentation notes
            </div>
            <p className="text-[13px] leading-relaxed text-ink-muted">
              {draft.presentation_notes}
            </p>
          </div>

          {/* Dishes grouped by course */}
          {(["starters", "mains", "desserts", "beverages"] as const).map(
            (section) => {
              const items = draft.dishes.filter((d) => d.section === section);
              if (items.length === 0) return null;
              return (
                <div key={section} className="mb-5">
                  <div
                    className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-ink"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {section}
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {items.map((d, idx) => (
                      <div
                        key={`${section}-${idx}`}
                        className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-serif text-[15px] leading-tight text-ink">
                              {useCreativeNames
                                ? d.name_creative
                                : d.name_standard}
                            </div>
                            <div className="mt-0.5 font-sans text-[11px] italic text-ink-faint">
                              {useCreativeNames
                                ? d.name_standard
                                : d.name_creative}
                            </div>
                          </div>
                          <DietBadge diet={d.diet} />
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                          {d.description}
                        </p>
                        <div className="mt-2 border-t border-[rgba(26,26,26,0.04)] pt-2 font-serif text-[12.5px] italic text-ink-muted">
                          &ldquo;{d.why_note}&rdquo;
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                            {d.service}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAdoptOne(d)}
                            className="font-sans text-[11.5px] text-[#8B6508] transition-colors hover:text-gold"
                          >
                            + Add to menu
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}

          {/* Inspiration board */}
          <div className="mt-6 rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-ivory-warm/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div
                  className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6508]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Presentation inspiration
                </div>
                <div className="font-serif text-[16px] leading-tight text-ink">
                  How food this menu could be staged
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleInspiration}
                className="font-sans text-[12px] text-ink-muted transition-colors hover:text-ink"
              >
                {showInspiration ? "Hide" : "Show"} inspiration ↓
              </button>
            </div>
            {showInspiration && (
              <div
                className="mt-4 grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
              >
                {AI_INSPIRATION_IMAGES.map((img, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white"
                  >
                    <div
                      className="bg-ivory-warm"
                      style={{
                        aspectRatio: "4 / 5",
                        backgroundImage: `url(${img.src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="px-2.5 py-2 font-sans text-[11.5px] leading-snug text-ink-soft">
                      {img.caption}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Dietary & Guests ────────────────────────────────────────────────

export function DietaryTab() {
  const [rows] = useState<DietaryRow[]>(INITIAL_DIETARY);
  const [menus] = useState<EventMenu[]>(INITIAL_MENUS);
  const [guests, setGuests] = useState<DietaryGuest[]>(INITIAL_DIETARY_GUESTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>("All");

  const total = rows.reduce((a, r) => a + r.guests, 0);

  const updateGuestNotes = (guestId: string, notes: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, notes } : g)),
    );
  };

  return (
    <div>
      <SectionHead
        eyebrow="Dietary overview"
        title="Who you're feeding, and how"
        hint="Pulled from your guest list. Tap any row to see the actual guests and which menu items work for them at each event."
      />
      <div className="overflow-hidden rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white">
        <div
          className="grid border-b border-[rgba(26,26,26,0.08)] px-1 py-2"
          style={{ gridTemplateColumns: "2fr 1fr 2fr 1fr" }}
        >
          {["Dietary need", "Guest count", "Events attending", "Severity"].map(
            (h) => (
              <div
                key={h}
                className="px-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {h}
              </div>
            ),
          )}
        </div>
        {rows.map((r, i) => {
          const isExpanded = expandedId === r.id;
          const matchedGuests = guests.filter((g) =>
            g.dietary_needs.includes(r.need),
          );
          return (
            <div
              key={r.id}
              className={cn(
                i < rows.length - 1 && "border-b border-[rgba(26,26,26,0.04)]",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setExpandedId(isExpanded ? null : r.id);
                  setEventFilter("All");
                }}
                className={cn(
                  "grid w-full items-center px-1 py-3.5 text-left transition-colors",
                  isExpanded ? "bg-ivory-warm/40" : "hover:bg-ivory-warm/30",
                )}
                style={{ gridTemplateColumns: "2fr 1fr 2fr 1fr" }}
              >
                <div className="flex items-center gap-2 px-1.5">
                  <span
                    className={cn(
                      "inline-block transition-transform",
                      isExpanded && "rotate-90",
                    )}
                  >
                    ›
                  </span>
                  <span className="font-serif text-[17px] text-ink">
                    {r.need}
                  </span>
                </div>
                <div className="px-1.5 font-sans text-[14px] text-ink underline decoration-dotted underline-offset-2">
                  {r.guests}
                </div>
                <div className="px-1.5 font-sans text-[13px] text-ink-muted">
                  {r.events}
                </div>
                <div className="px-1.5">
                  <StatusChip
                    status={r.severity}
                    tone={
                      r.severity === "safety"
                        ? "danger"
                        : r.severity === "firm"
                          ? "caution"
                          : "neutral"
                    }
                  />
                </div>
              </button>
              {isExpanded && (
                <DietaryGuestPanel
                  need={r.need}
                  matchedGuests={matchedGuests}
                  menus={menus}
                  eventFilter={eventFilter}
                  onChangeFilter={setEventFilter}
                  onUpdateNotes={updateGuestNotes}
                />
              )}
            </div>
          );
        })}
        <div className="flex justify-between border-t border-[rgba(26,26,26,0.04)] px-1.5 py-3.5 font-sans text-[12px] tracking-[0.06em] text-ink-faint">
          <span>Total dietary flags</span>
          <span className="font-semibold text-ink">{total} guests</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-center gap-4 rounded-[2px] border border-gold/30 bg-gold-pale/40 p-4 md:grid-cols-[1fr_auto]">
        <div>
          <div
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6508]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ⚠ 6 guests haven't submitted dietary info
          </div>
          <div className="font-serif text-[20px] leading-tight text-ink">
            We'll nudge them — you stay out of the awkward.
          </div>
          <div className="mt-1.5 font-sans text-[12.5px] text-ink-muted">
            Your menu covers all needs except: gluten-free main and
            child-friendly options.
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PrimaryButton>Send reminder</PrimaryButton>
          <SecondaryButton>View gaps →</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

// ── Per-row guest expansion panel ─────────────────────────────────────────
// Shown inline below a clicked dietary row. For each guest in the category
// we list the events they're attending and the dishes (per event) that are
// safe / need confirmation / not safe. Notes are editable per guest.

function DietaryGuestPanel({
  need,
  matchedGuests,
  menus,
  eventFilter,
  onChangeFilter,
  onUpdateNotes,
}: {
  need: string;
  matchedGuests: DietaryGuest[];
  menus: EventMenu[];
  eventFilter: string;
  onChangeFilter: (v: string) => void;
  onUpdateNotes: (guestId: string, notes: string) => void;
}) {
  if (matchedGuests.length === 0) {
    return (
      <div className="border-t border-[rgba(26,26,26,0.04)] bg-ivory-warm/40 px-5 py-5">
        <p className="font-serif text-[14px] italic text-ink-muted">
          No guests with this dietary need have shared their info yet.
        </p>
      </div>
    );
  }

  const eventOptions = ["All", ...ALL_EVENTS];

  return (
    <div className="border-t border-[rgba(26,26,26,0.04)] bg-ivory-warm/40 px-5 py-5">
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span
          className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Show menu fit for
        </span>
        {eventOptions.map((e) => {
          const active = eventFilter === e;
          return (
            <button
              key={e}
              type="button"
              onClick={() => onChangeFilter(e)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-[3px] font-sans text-[11px] uppercase tracking-[0.04em] transition-colors",
                active
                  ? "border-[#8B6508] bg-ink text-ivory"
                  : "border-[rgba(26,26,26,0.08)] bg-transparent text-ink-muted hover:border-ink/20",
              )}
            >
              {e}
            </button>
          );
        })}
      </div>

      {/* Guest cards */}
      <div className="flex flex-col gap-3">
        {matchedGuests.map((g) => {
          const guestEvents =
            eventFilter === "All"
              ? g.events
              : g.events.filter((e) => e === eventFilter);
          return (
            <div
              key={g.id}
              className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white p-4"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-serif text-[17px] text-ink">{g.name}</div>
                <div className="font-sans text-[12px] text-ink-faint">
                  Attending: {g.events.join(", ")}
                </div>
              </div>

              {/* Per-event safe/check/unsafe rundown */}
              {guestEvents.length === 0 ? (
                <p className="text-[12.5px] italic text-ink-faint">
                  Not attending {eventFilter}.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {guestEvents.map((eventLabel) => {
                    const menu = menus.find(
                      (m) => m.label.toLowerCase() === eventLabel.toLowerCase(),
                    );
                    const allDishes = menu
                      ? [
                          ...menu.starters,
                          ...menu.mains,
                          ...menu.desserts,
                          ...menu.beverages,
                        ]
                      : [];
                    if (allDishes.length === 0) {
                      return (
                        <div
                          key={eventLabel}
                          className="rounded-[2px] border border-dashed border-[rgba(26,26,26,0.08)] bg-ivory-warm/30 px-3 py-2 text-[12px] italic text-ink-faint"
                        >
                          {eventLabel}: menu not built yet.
                        </div>
                      );
                    }
                    const safe = allDishes.filter(
                      (d) => dishStatusFor(need, d) === "safe",
                    );
                    const unsafe = allDishes.filter(
                      (d) => dishStatusFor(need, d) === "unsafe",
                    );
                    const check = allDishes.filter(
                      (d) => dishStatusFor(need, d) === "check",
                    );
                    return (
                      <div key={eventLabel}>
                        <div
                          className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {eventLabel}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {safe.map((d) => (
                            <DishPill
                              key={`${eventLabel}-safe-${d.id}`}
                              status="safe"
                              label={d.name}
                            />
                          ))}
                          {check.map((d) => (
                            <DishPill
                              key={`${eventLabel}-check-${d.id}`}
                              status="check"
                              label={d.name}
                            />
                          ))}
                          {unsafe.map((d) => (
                            <DishPill
                              key={`${eventLabel}-unsafe-${d.id}`}
                              status="unsafe"
                              label={d.name}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Per-guest notes — visible everywhere this guest appears */}
              <div className="mt-3 border-t border-[rgba(26,26,26,0.04)] pt-3">
                <div
                  className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Notes about this guest
                </div>
                <textarea
                  value={g.notes}
                  onChange={(e) => onUpdateNotes(g.id, e.target.value)}
                  placeholder="e.g. severity, ingredient-specific reactions, table seating preference…"
                  className="min-h-[44px] w-full resize-y rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-2.5 py-1.5 font-sans text-[12.5px] leading-relaxed text-ink outline-none focus:border-saffron/50"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DishPill({
  status,
  label,
}: {
  status: "safe" | "check" | "unsafe";
  label: string;
}) {
  const icon = status === "safe" ? "✅" : status === "unsafe" ? "❌" : "⚠️";
  const className =
    status === "safe"
      ? "border-sage/40 bg-sage-pale/30 text-ink"
      : status === "unsafe"
        ? "border-[#C94030]/30 bg-[#FFF0EE] text-[#7E2018] line-through decoration-[#C94030]/60"
        : "border-[#D4A853]/40 bg-[#FFF6E0] text-[#7A5618]";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] font-sans text-[11.5px]",
        className,
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

// ── Tab 4: Shortlist & Tasting ─────────────────────────────────────────────

export function ShortlistTab() {
  const [caterers] = useState<Caterer[]>(INITIAL_CATERERS);
  const [sessions, setSessions] = useState<TastingSession[]>(
    INITIAL_TASTING_SESSIONS,
  );
  const [scheduling, setScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    caterer: "",
    date: "",
    time: "",
    location: "",
  });

  const updateRating = (
    sessionId: string,
    dishId: string,
    participantId: string,
    rating: TastingRating,
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id !== sessionId
          ? s
          : {
              ...s,
              dishes: s.dishes.map((d) =>
                d.id !== dishId
                  ? d
                  : {
                      ...d,
                      ratings: {
                        ...d.ratings,
                        [participantId]: {
                          rating,
                          note: d.ratings[participantId]?.note ?? "",
                        },
                      },
                    },
              ),
            },
      ),
    );
  };

  const updateRatingNote = (
    sessionId: string,
    dishId: string,
    participantId: string,
    note: string,
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id !== sessionId
          ? s
          : {
              ...s,
              dishes: s.dishes.map((d) =>
                d.id !== dishId
                  ? d
                  : {
                      ...d,
                      ratings: {
                        ...d.ratings,
                        [participantId]: {
                          rating:
                            d.ratings[participantId]?.rating ?? "neutral",
                          note,
                        },
                      },
                    },
              ),
            },
      ),
    );
  };

  const updateGeneralNote = (sessionId: string, note: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, general_note: note } : s,
      ),
    );
  };

  const scheduleSession = () => {
    if (!scheduleForm.caterer.trim() || !scheduleForm.date.trim()) {
      window.alert("Caterer and date are required.");
      return;
    }
    const newSession: TastingSession = {
      id: `ts-${Date.now()}`,
      caterer: scheduleForm.caterer.trim(),
      date: scheduleForm.date.trim(),
      time: scheduleForm.time.trim() || "TBD",
      location: scheduleForm.location.trim() || "TBD",
      status: "upcoming",
      participants: TASTING_PARTICIPANTS,
      dishes: [],
      general_note: "",
    };
    setSessions((p) => [newSession, ...p]);
    setScheduling(false);
    setScheduleForm({ caterer: "", date: "", time: "", location: "" });
  };

  return (
    <div>
      <SectionHead
        eyebrow="Shortlist"
        title="The caterers you're weighing"
        hint="Track where each one stands, the feel of their food, and the notes you took at the tasting."
        action={<PrimaryButton>+ Add caterer</PrimaryButton>}
      />
      <div
        className="grid gap-[18px]"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {caterers.map((c) => (
          <div
            key={c.id}
            className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white p-5"
          >
            <div className="mb-2.5 flex items-start justify-between gap-3">
              <div className="font-serif text-[22px] leading-[1.1] text-ink">
                {c.name}
              </div>
              <StatusChip status={c.status} tone={statusTone(c.status)} />
            </div>
            <div className="mb-0.5 font-sans text-[12px] text-ink-faint">
              {c.city}
            </div>
            <div className="mb-3 font-sans text-[12.5px] text-ink-muted">
              {c.cuisine} · {c.perPlate} per plate
            </div>
            <div className="border-t border-[rgba(26,26,26,0.04)] pt-2.5 font-serif text-[14px] italic leading-[1.5] text-ink-muted">
              &ldquo;{c.notes}&rdquo;
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <SectionHead
          eyebrow="Tasting log"
          title="What you ate, and what each of you thought"
          hint="Each dish, each person, in real time. Catering decisions are made by eating — together."
          action={
            <PrimaryButton onClick={() => setScheduling((v) => !v)}>
              + Schedule a tasting
            </PrimaryButton>
          }
        />

        {scheduling && (
          <div className="mb-6 rounded-[2px] border border-gold/40 bg-gradient-to-br from-ivory-warm/40 to-white p-5">
            <div
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6508]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              New tasting session
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ScheduleField
                label="Caterer"
                value={scheduleForm.caterer}
                onChange={(v) =>
                  setScheduleForm((p) => ({ ...p, caterer: v }))
                }
                placeholder="e.g. Royal Indian Kitchen"
              />
              <ScheduleField
                label="Date"
                value={scheduleForm.date}
                onChange={(v) => setScheduleForm((p) => ({ ...p, date: v }))}
                placeholder="e.g. May 4, 2026"
              />
              <ScheduleField
                label="Time"
                value={scheduleForm.time}
                onChange={(v) => setScheduleForm((p) => ({ ...p, time: v }))}
                placeholder="e.g. 2:00 PM"
              />
              <ScheduleField
                label="Location"
                value={scheduleForm.location}
                onChange={(v) =>
                  setScheduleForm((p) => ({ ...p, location: v }))
                }
                placeholder="e.g. Their kitchen, Plano"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-sans text-[12px] text-ink-faint">
                Invitees default to: {TASTING_PARTICIPANTS.map((p) => p.name).join(", ")}
              </div>
              <div className="flex gap-2">
                <SecondaryButton onClick={() => setScheduling(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={scheduleSession}>
                  Schedule & invite
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[18px]">
          {sessions.map((s) => (
            <TastingSessionCard
              key={s.id}
              session={s}
              onRate={(dishId, participantId, rating) =>
                updateRating(s.id, dishId, participantId, rating)
              }
              onChangeNote={(dishId, participantId, note) =>
                updateRatingNote(s.id, dishId, participantId, note)
              }
              onChangeGeneralNote={(note) => updateGeneralNote(s.id, note)}
            />
          ))}
        </div>
      </div>
      <CateringContractChecklist />
    </div>
  );
}

// ── Tasting session card ──────────────────────────────────────────────────
// One card per session. Header shows the caterer + date + location +
// status + participant avatars. Body is a column of dish cards. Each
// dish card holds the per-person rating widget and the consensus bar.
// Footer holds an editable general session note.

function ScheduleField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-3 py-2 font-sans text-[13px] text-ink outline-none focus:border-saffron/50"
      />
    </label>
  );
}

function TastingSessionCard({
  session,
  onRate,
  onChangeNote,
  onChangeGeneralNote,
}: {
  session: TastingSession;
  onRate: (
    dishId: string,
    participantId: string,
    rating: TastingRating,
  ) => void;
  onChangeNote: (
    dishId: string,
    participantId: string,
    note: string,
  ) => void;
  onChangeGeneralNote: (note: string) => void;
}) {
  const consensusOf = (dish: TastingDishCard) => {
    const counts = { love: 0, neutral: 0, dislike: 0 };
    let answered = 0;
    for (const p of session.participants) {
      const r = dish.ratings[p.id];
      if (!r) continue;
      counts[r.rating] += 1;
      answered += 1;
    }
    return { counts, answered, total: session.participants.length };
  };

  const overallConsensus = (() => {
    let love = 0;
    let total = 0;
    for (const d of session.dishes) {
      const c = consensusOf(d);
      love += c.counts.love;
      total += c.answered;
    }
    return total === 0 ? 0 : Math.round((love / total) * 100);
  })();

  return (
    <div className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white p-5">
      {/* Session header */}
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(26,26,26,0.04)] pb-4">
        <div className="min-w-0 flex-1">
          <div
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Tasting · {sessionStatusLabel(session.status)}
          </div>
          <div className="font-serif text-[24px] leading-tight text-ink">
            {session.caterer}
          </div>
          <div className="mt-1.5 font-sans text-[12.5px] text-ink-muted">
            {session.date} · {session.time} · {session.location}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Tasting with
            </span>
            {session.participants.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(26,26,26,0.08)] bg-white py-[3px] pl-[3px] pr-2.5 font-sans text-[11.5px] text-ink"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9.5px] tracking-tight text-ink"
                  style={{ background: p.tint }}
                >
                  {p.initials}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          {session.dishes.length > 0 && (
            <div>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Consensus
              </div>
              <div className="font-serif text-[26px] leading-none text-ink">
                {overallConsensus}%
              </div>
              <div className="font-sans text-[11px] text-ink-faint">
                love votes
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty state for upcoming sessions */}
      {session.dishes.length === 0 ? (
        <div className="rounded-[2px] border border-dashed border-[rgba(26,26,26,0.08)] bg-ivory-warm/40 px-5 py-8 text-center">
          <div className="mb-1.5 font-serif text-[18px] italic text-ink">
            No dishes added yet.
          </div>
          <div className="font-sans text-[12.5px] text-ink-muted">
            On the day of the tasting, add each dish as it arrives —
            participants tap their reactions in real time.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {session.dishes.map((dish) => {
            const c = consensusOf(dish);
            return (
              <div
                key={dish.id}
                className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-ivory-warm/20 p-4"
              >
                <div className="flex flex-wrap gap-4">
                  {/* Dish image */}
                  {dish.photo_url ? (
                    <div
                      className="h-24 w-24 shrink-0 rounded-[2px] bg-ivory-warm"
                      style={{
                        backgroundImage: `url(${dish.photo_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2px] border border-dashed border-[rgba(26,26,26,0.08)] bg-ivory-warm/40 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      photo
                    </div>
                  )}

                  {/* Dish meta + consensus bar */}
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-[18px] leading-tight text-ink">
                      {dish.name}
                    </div>
                    <p className="mt-0.5 font-sans text-[12px] text-ink-muted">
                      {dish.description}
                    </p>
                    <div className="mt-2.5">
                      <ConsensusBar
                        love={c.counts.love}
                        neutral={c.counts.neutral}
                        dislike={c.counts.dislike}
                        total={c.total}
                      />
                    </div>
                  </div>
                </div>

                {/* Per-person rating row */}
                <div className="mt-4 flex flex-wrap gap-2.5 border-t border-[rgba(26,26,26,0.04)] pt-3.5">
                  {session.participants.map((p) => {
                    const r = dish.ratings[p.id];
                    return (
                      <PersonRater
                        key={p.id}
                        participant={p}
                        rating={r?.rating}
                        note={r?.note ?? ""}
                        onRate={(rating) => onRate(dish.id, p.id, rating)}
                        onChangeNote={(note) =>
                          onChangeNote(dish.id, p.id, note)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session general note */}
      <div className="mt-4 border-t border-[rgba(26,26,26,0.04)] pt-3.5">
        <div
          className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Session notes (overall)
        </div>
        <textarea
          value={session.general_note}
          onChange={(e) => onChangeGeneralNote(e.target.value)}
          placeholder="What was the overall feel of the visit? Anything to flag the caterer about?"
          className="min-h-[60px] w-full resize-y rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white px-3 py-2 font-sans text-[13px] leading-relaxed text-ink outline-none focus:border-saffron/50"
        />
      </div>
    </div>
  );
}

function sessionStatusLabel(s: TastingStatus) {
  if (s === "upcoming") return "Upcoming";
  if (s === "in_progress") return "In progress";
  return "Completed";
}

// ── Per-person rating widget ──────────────────────────────────────────────
// Three-button pill (👍 / 😐 / 👎) with the participant's avatar on the
// left and an inline note input below. Designed to feel like a luxe wine
// scorecard — soft tints, no form chrome.

function PersonRater({
  participant,
  rating,
  note,
  onRate,
  onChangeNote,
}: {
  participant: TastingParticipant;
  rating?: TastingRating;
  note: string;
  onRate: (rating: TastingRating) => void;
  onChangeNote: (note: string) => void;
}) {
  return (
    <div
      className="flex min-w-[200px] flex-1 flex-col rounded-[2px] border border-[rgba(26,26,26,0.06)] bg-white p-2.5"
      style={{ flexBasis: 200 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] tracking-tight text-ink"
          style={{ background: participant.tint }}
        >
          {participant.initials}
        </span>
        <span className="truncate font-sans text-[12px] text-ink">
          {participant.name}
        </span>
      </div>
      <div className="mb-2 flex gap-1.5">
        <RateButton
          label="👍"
          tone="love"
          active={rating === "love"}
          onClick={() => onRate("love")}
        />
        <RateButton
          label="😐"
          tone="neutral"
          active={rating === "neutral"}
          onClick={() => onRate("neutral")}
        />
        <RateButton
          label="👎"
          tone="dislike"
          active={rating === "dislike"}
          onClick={() => onRate("dislike")}
        />
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => onChangeNote(e.target.value)}
        placeholder="add a note…"
        className="rounded-[2px] border border-transparent bg-ivory-warm/40 px-2 py-1.5 font-sans text-[11.5px] text-ink-soft outline-none placeholder:text-ink-faint focus:border-saffron/40 focus:bg-white"
      />
    </div>
  );
}

function RateButton({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: "love" | "neutral" | "dislike";
  active: boolean;
  onClick: () => void;
}) {
  const activeBg =
    tone === "love"
      ? "bg-sage-pale border-sage"
      : tone === "neutral"
        ? "bg-[#FFF6E0] border-[#D4A853]"
        : "bg-[#FFF0EE] border-[#C94030]/60";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 cursor-pointer rounded-[2px] border px-2 py-1.5 font-sans text-[14px] transition-colors",
        active
          ? activeBg
          : "border-[rgba(26,26,26,0.06)] bg-white text-ink hover:border-ink/20",
      )}
    >
      {label}
    </button>
  );
}

// ── Consensus bar ─────────────────────────────────────────────────────────
// Shows the relative weight of love / neutral / dislike across all
// participants who have voted on this dish. Used in place of the old
// 5-star aggregate rating.

function ConsensusBar({
  love,
  neutral,
  dislike,
  total,
}: {
  love: number;
  neutral: number;
  dislike: number;
  total: number;
}) {
  const answered = love + neutral + dislike;
  const pct = (n: number) => (answered === 0 ? 0 : (n / answered) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>
          {answered}/{total} have rated
        </span>
        <span className="text-ink">
          👍 {love} · 😐 {neutral} · 👎 {dislike}
        </span>
      </div>
      {answered === 0 ? (
        <div className="h-1.5 w-full rounded-full bg-[rgba(26,26,26,0.04)]" />
      ) : (
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[rgba(26,26,26,0.04)]">
          <div
            className="bg-sage transition-all"
            style={{ width: `${pct(love)}%` }}
          />
          <div
            className="bg-[#D4A853] transition-all"
            style={{ width: `${pct(neutral)}%` }}
          />
          <div
            className="bg-[#C94030] transition-all"
            style={{ width: `${pct(dislike)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function CateringContractChecklist() {
  const category = useWorkspaceStore((s) =>
    s.categories.find((c) => c.slug === "catering"),
  );
  if (!category) return null;
  return (
    <div className="mt-6">
      <ContractChecklistBlock category={category} />
    </div>
  );
}

// ── Tab 5: Service Plan ────────────────────────────────────────────────────

export function ServicePlanTab() {
  const [expanded, setExpanded] = useState<string>("Wedding");
  return (
    <div>
      <SectionHead
        eyebrow="Service plan"
        title="The day-of, in motion"
        hint="How service flows across every event — staffing, style, setup, and timing."
      />
      <div className="overflow-hidden rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white">
        <div
          className="grid border-b border-[rgba(26,26,26,0.08)] px-1.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{
            gridTemplateColumns: "1.2fr 1fr 2fr 0.8fr 1fr 0.4fr",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div>Event</div>
          <div>Time</div>
          <div>Style</div>
          <div>Staff</div>
          <div>Setup by</div>
          <div />
        </div>
        {SERVICE_PLAN.map((row, i) => {
          const open = expanded === row.event;
          const isLast = i === SERVICE_PLAN.length - 1;
          return (
            <div key={row.event}>
              <button
                type="button"
                onClick={() => setExpanded(open ? "" : row.event)}
                className={cn(
                  "grid w-full cursor-pointer items-center border-0 px-1.5 py-4 text-left",
                  !isLast && !open && "border-b border-[rgba(26,26,26,0.04)]",
                  open ? "bg-ivory-warm/50" : "bg-transparent",
                )}
                style={{ gridTemplateColumns: "1.2fr 1fr 2fr 0.8fr 1fr 0.4fr" }}
              >
                <div className="font-serif text-[19px] text-ink">
                  {row.event}
                </div>
                <div className="font-sans text-[13px] text-ink">{row.time}</div>
                <div className="font-sans text-[13px] text-ink-muted">
                  {row.style}
                </div>
                <div className="font-sans text-[13px] text-ink">
                  {row.staff}
                </div>
                <div className="font-sans text-[13px] text-ink-muted">
                  {row.setupBy}
                </div>
                <div className="text-right text-ink-faint">
                  {open ? "▾" : "▸"}
                </div>
              </button>
              {open && (
                <div
                  className={cn(
                    "bg-ivory-warm/50 px-[18px] pb-6 pt-[18px]",
                    !isLast && "border-b border-[rgba(26,26,26,0.04)]",
                  )}
                >
                  <div
                    className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {row.event} · Service plan
                  </div>
                  <ul className="m-0 list-none p-0 font-sans text-[13.5px] leading-[1.7] text-ink">
                    {row.event === "Wedding" ? (
                      <>
                        <li>• Buffet opens: 12:00 PM</li>
                        <li>• Buffet closes: 2:30 PM</li>
                        <li>• Live stations manned continuously</li>
                        <li>• Replenish cycle: every 30 minutes</li>
                        <li>
                          • Dietary station (Jain/Vegan): separate table, clearly
                          labeled
                        </li>
                        <li>
                          • Water service: at every table, refilled every 15 min
                        </li>
                        <li>• Chai service: continuous from 1:00 PM</li>
                        <li>• Cleanup begins: 3:00 PM</li>
                      </>
                    ) : (
                      <>
                        <li>• Setup completed by {row.setupBy}</li>
                        <li>• Service begins promptly at {row.time}</li>
                        <li>• Staff: {row.staff} on rotating zones</li>
                        <li>• Replenish &amp; clear in sync with event flow</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 6: Documents ───────────────────────────────────────────────────────

export function DocumentsTab() {
  const groups: Record<DocEntry["type"], DocEntry[]> = {
    Menu: [],
    Proposal: [],
    "Tasting notes": [],
    Dietary: [],
    Contract: [],
    Invoice: [],
    Permit: [],
  };
  INITIAL_DOCS.forEach((d) => groups[d.type].push(d));
  const order: DocEntry["type"][] = [
    "Menu",
    "Proposal",
    "Tasting notes",
    "Dietary",
    "Contract",
    "Invoice",
    "Permit",
  ];

  return (
    <div>
      <SectionHead
        eyebrow="Documents"
        title="Everything in one drawer"
        hint="Menus, proposals, tasting notes, dietary reports, contracts, invoices, and health permits."
        action={<PrimaryButton>↑ Upload</PrimaryButton>}
      />
      <div className="flex flex-col gap-[18px]">
        {order.map((type) => (
          <div
            key={type}
            className="rounded-[2px] border border-[rgba(26,26,26,0.08)] bg-white p-5"
          >
            <div className="mb-3 flex items-baseline justify-between">
              <div className="font-serif text-[22px] text-ink">{type}s</div>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {groups[type].length} item
                {groups[type].length === 1 ? "" : "s"}
              </span>
            </div>
            {groups[type].length === 0 ? (
              <div className="font-serif text-[15px] italic text-ink-faint">
                Nothing here yet. Drop a {type.toLowerCase()} when it's ready —
                we'll keep it safe.
              </div>
            ) : (
              <div className="flex flex-col">
                {groups[type].map((d, i) => (
                  <div
                    key={d.id}
                    className={cn(
                      "grid items-center gap-3 px-2 py-3",
                      i < groups[type].length - 1 &&
                        "border-b border-[rgba(26,26,26,0.04)]",
                    )}
                    style={{ gridTemplateColumns: "20px 1fr auto auto" }}
                  >
                    <span className="text-[14px] text-ink-faint">▸</span>
                    <div>
                      <div className="font-sans text-[14px] text-ink">
                        {d.title}
                      </div>
                      <div className="mt-0.5 font-sans text-[11.5px] text-ink-faint">
                        {d.vendor}
                      </div>
                    </div>
                    <span className="font-sans text-[11.5px] text-ink-faint">
                      Updated {d.updated}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent font-sans text-[12px] text-gold transition-colors hover:text-[#8B6508]"
                    >
                      Open ↗
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "vision", label: "Taste & Vision" },
  { id: "menu", label: "Menu Builder" },
  { id: "dietary", label: "Dietary & Guests" },
  { id: "shortlist", label: "Shortlist & Tasting" },
  { id: "service", label: "Service Plan" },
  { id: "documents", label: "Documents" },
];

export default function CateringCoupleWorkspace() {
  const [active, setActive] = useState<TabId>("vision");

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: C.ivory,
        color: C.cocoa,
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.line}`, background: C.ivory, flexShrink: 0 }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "36px 40px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
          }}
        >
          <div>
            <div style={{ ...labelStyle, color: C.marigold, marginBottom: 6 }}>
              Priya &amp; Raj · 28 June 2026
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 44,
                color: C.cocoa,
                lineHeight: 1,
                fontWeight: 400,
              }}
            >
              Catering
            </div>
            <div style={{ ...leadStyle, marginTop: 10, maxWidth: 540 }}>
              The food your guests will still talk about in ten years. Shape the taste, build the
              menus, and close the gaps before the first bite.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div
              style={{
                ...labelStyle,
                color: C.cocoaSoft,
                letterSpacing: "0.2em",
              }}
            >
              Progress
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: C.cocoa }}>18 / 34</div>
            <div style={{ width: 180, height: 4, background: C.lineSoft, borderRadius: 999 }}>
              <div
                style={{
                  width: `${(18 / 34) * 100}%`,
                  height: "100%",
                  background: C.marigold,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.lineSoft}` }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                style={{
                  padding: "14px 20px",
                  border: "none",
                  background: "transparent",
                  fontFamily: SANS,
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  color: active === t.id ? C.cocoa : C.cocoaFaint,
                  fontWeight: active === t.id ? 600 : 400,
                  cursor: "pointer",
                  borderBottom:
                    active === t.id ? `2px solid ${C.cocoa}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Scrollable main content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "28px 40px 80px",
          }}
        >
          {active === "vision" && <TasteAndVisionTab />}
          {active === "menu" && <MenuBuilderTab />}
          {active === "dietary" && <DietaryTab />}
          {active === "shortlist" && <ShortlistTab />}
          {active === "service" && <ServicePlanTab />}
          {active === "documents" && <DocumentsTab />}
        </div>

        {/* Footer strip */}
        <div
          style={{
            borderTop: `1px solid ${C.line}`,
            background: C.champagneSoft,
            padding: "20px 40px",
            textAlign: "center",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: C.cocoaSoft,
          }}
        >
          Everything here saves as you type. Your caterer sees what you approve, nothing more.
        </div>
      </div>
    </div>
  );
}
