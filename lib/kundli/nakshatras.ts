// ──────────────────────────────────────────────────────────────────────────
// Vedic astrology base tables.
//
// 27 Nakshatras (lunar mansions) with their attribute mappings, plus the
// 12 Rashi (Moon sign) table. These drive every Ashtakoota calculation.
// Sources cross-checked against Brihat Parashara Hora Shastra and the
// standard Drik Panchang attribute tables — choices follow the most common
// modern Panchang convention so results match what a family pandit would
// produce.
// ──────────────────────────────────────────────────────────────────────────

import type {
  NakshatraRow,
  Planet,
  Rashi,
  RashiRow,
} from "@/types/kundli";

export const RASHIS: RashiRow[] = [
  { id: 1, name: "Mesha", englishName: "Aries", ruler: "Mars", vashya: "Chatushpada" },
  { id: 2, name: "Vrishabha", englishName: "Taurus", ruler: "Venus", vashya: "Chatushpada" },
  { id: 3, name: "Mithuna", englishName: "Gemini", ruler: "Mercury", vashya: "Manava" },
  { id: 4, name: "Karka", englishName: "Cancer", ruler: "Moon", vashya: "Jalachara" },
  { id: 5, name: "Simha", englishName: "Leo", ruler: "Sun", vashya: "Vanachara" },
  { id: 6, name: "Kanya", englishName: "Virgo", ruler: "Mercury", vashya: "Manava" },
  { id: 7, name: "Tula", englishName: "Libra", ruler: "Venus", vashya: "Manava" },
  { id: 8, name: "Vrishchika", englishName: "Scorpio", ruler: "Mars", vashya: "Keeta" },
  { id: 9, name: "Dhanu", englishName: "Sagittarius", ruler: "Jupiter", vashya: "Chatushpada" },
  { id: 10, name: "Makara", englishName: "Capricorn", ruler: "Saturn", vashya: "Jalachara" },
  { id: 11, name: "Kumbha", englishName: "Aquarius", ruler: "Saturn", vashya: "Manava" },
  { id: 12, name: "Meena", englishName: "Pisces", ruler: "Jupiter", vashya: "Jalachara" },
];

export const RASHI_BY_ID = new Map<number, RashiRow>(RASHIS.map((r) => [r.id, r]));
export const RASHI_BY_NAME = new Map<Rashi, RashiRow>(RASHIS.map((r) => [r.name, r]));

// Helper: each Nakshatra spans 13°20'. Padas are the four 3°20' quarters.
// padaRashi tracks the Navamsha sign for each pada (well-defined cycle).
export const NAKSHATRAS: NakshatraRow[] = [
  {
    id: 1,
    name: "Ashwini",
    englishName: "Ashwini",
    ruler: "Ketu",
    gana: "Deva",
    yoni: "Ashwa",
    yoniGender: "M",
    nadi: "Aadi",
    varna: "Vaishya",
    vashya: "Chatushpada",
    rashi: "Mesha",
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 2,
    name: "Bharani",
    englishName: "Bharani",
    ruler: "Venus",
    gana: "Manushya",
    yoni: "Gaja",
    yoniGender: "M",
    nadi: "Madhya",
    varna: "Shudra",
    vashya: "Chatushpada",
    rashi: "Mesha",
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 3,
    name: "Krittika",
    englishName: "Krittika",
    ruler: "Sun",
    gana: "Rakshasa",
    yoni: "Mesha",
    yoniGender: "F",
    nadi: "Antya",
    varna: "Brahmin",
    vashya: "Chatushpada",
    rashi: "Mesha", // first pada in Mesha; padas 2-4 in Vrishabha
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 4,
    name: "Rohini",
    englishName: "Rohini",
    ruler: "Moon",
    gana: "Manushya",
    yoni: "Sarpa",
    yoniGender: "M",
    nadi: "Antya",
    varna: "Shudra",
    vashya: "Chatushpada",
    rashi: "Vrishabha",
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 5,
    name: "Mrigashira",
    englishName: "Mrigashira",
    ruler: "Mars",
    gana: "Deva",
    yoni: "Sarpa",
    yoniGender: "F",
    nadi: "Madhya",
    varna: "Shudra",
    vashya: "Chatushpada",
    rashi: "Vrishabha", // padas 1-2 in Vrishabha; 3-4 in Mithuna
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 6,
    name: "Ardra",
    englishName: "Ardra",
    ruler: "Rahu",
    gana: "Manushya",
    yoni: "Shwan",
    yoniGender: "F",
    nadi: "Aadi",
    varna: "Shudra",
    vashya: "Manava",
    rashi: "Mithuna",
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 7,
    name: "Punarvasu",
    englishName: "Punarvasu",
    ruler: "Jupiter",
    gana: "Deva",
    yoni: "Marjar",
    yoniGender: "F",
    nadi: "Aadi",
    varna: "Vaishya",
    vashya: "Manava",
    rashi: "Mithuna", // padas 1-3 in Mithuna; 4 in Karka
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 8,
    name: "Pushya",
    englishName: "Pushya",
    ruler: "Saturn",
    gana: "Deva",
    yoni: "Mesha",
    yoniGender: "M",
    nadi: "Madhya",
    varna: "Kshatriya",
    vashya: "Jalachara",
    rashi: "Karka",
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 9,
    name: "Ashlesha",
    englishName: "Ashlesha",
    ruler: "Mercury",
    gana: "Rakshasa",
    yoni: "Marjar",
    yoniGender: "M",
    nadi: "Antya",
    varna: "Brahmin",
    vashya: "Jalachara",
    rashi: "Karka",
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 10,
    name: "Magha",
    englishName: "Magha",
    ruler: "Ketu",
    gana: "Rakshasa",
    yoni: "Mushaka",
    yoniGender: "M",
    nadi: "Antya",
    varna: "Shudra",
    vashya: "Vanachara",
    rashi: "Simha",
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 11,
    name: "Purva Phalguni",
    englishName: "Purva Phalguni",
    ruler: "Venus",
    gana: "Manushya",
    yoni: "Mushaka",
    yoniGender: "F",
    nadi: "Madhya",
    varna: "Brahmin",
    vashya: "Vanachara",
    rashi: "Simha",
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 12,
    name: "Uttara Phalguni",
    englishName: "Uttara Phalguni",
    ruler: "Sun",
    gana: "Manushya",
    yoni: "Gau",
    yoniGender: "M",
    nadi: "Aadi",
    varna: "Kshatriya",
    vashya: "Vanachara",
    rashi: "Simha", // pada 1 in Simha; 2-4 in Kanya
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 13,
    name: "Hasta",
    englishName: "Hasta",
    ruler: "Moon",
    gana: "Deva",
    yoni: "Mahisha",
    yoniGender: "M",
    nadi: "Aadi",
    varna: "Vaishya",
    vashya: "Manava",
    rashi: "Kanya",
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 14,
    name: "Chitra",
    englishName: "Chitra",
    ruler: "Mars",
    gana: "Rakshasa",
    yoni: "Vyaghra",
    yoniGender: "F",
    nadi: "Madhya",
    varna: "Shudra",
    vashya: "Manava",
    rashi: "Kanya", // padas 1-2 in Kanya; 3-4 in Tula
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 15,
    name: "Swati",
    englishName: "Swati",
    ruler: "Rahu",
    gana: "Deva",
    yoni: "Mahisha",
    yoniGender: "F",
    nadi: "Antya",
    varna: "Shudra",
    vashya: "Manava",
    rashi: "Tula",
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 16,
    name: "Vishakha",
    englishName: "Vishakha",
    ruler: "Jupiter",
    gana: "Rakshasa",
    yoni: "Vyaghra",
    yoniGender: "M",
    nadi: "Antya",
    varna: "Shudra",
    vashya: "Manava",
    rashi: "Tula", // padas 1-3 in Tula; 4 in Vrishchika
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 17,
    name: "Anuradha",
    englishName: "Anuradha",
    ruler: "Saturn",
    gana: "Deva",
    yoni: "Mriga",
    yoniGender: "F",
    nadi: "Madhya",
    varna: "Shudra",
    vashya: "Keeta",
    rashi: "Vrishchika",
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 18,
    name: "Jyeshtha",
    englishName: "Jyeshtha",
    ruler: "Mercury",
    gana: "Rakshasa",
    yoni: "Mriga",
    yoniGender: "M",
    nadi: "Aadi",
    varna: "Vaishya",
    vashya: "Keeta",
    rashi: "Vrishchika",
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 19,
    name: "Mula",
    englishName: "Mula",
    ruler: "Ketu",
    gana: "Rakshasa",
    yoni: "Shwan",
    yoniGender: "M",
    nadi: "Aadi",
    varna: "Shudra",
    vashya: "Chatushpada",
    rashi: "Dhanu",
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 20,
    name: "Purva Ashadha",
    englishName: "Purva Ashadha",
    ruler: "Venus",
    gana: "Manushya",
    yoni: "Vanara",
    yoniGender: "M",
    nadi: "Madhya",
    varna: "Brahmin",
    vashya: "Chatushpada",
    rashi: "Dhanu",
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 21,
    name: "Uttara Ashadha",
    englishName: "Uttara Ashadha",
    ruler: "Sun",
    gana: "Manushya",
    yoni: "Nakula",
    yoniGender: "M",
    nadi: "Antya",
    varna: "Kshatriya",
    vashya: "Chatushpada",
    rashi: "Dhanu", // pada 1 in Dhanu; 2-4 in Makara
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 22,
    name: "Shravana",
    englishName: "Shravana",
    ruler: "Moon",
    gana: "Deva",
    yoni: "Vanara",
    yoniGender: "F",
    nadi: "Antya",
    varna: "Shudra",
    vashya: "Jalachara",
    rashi: "Makara",
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 23,
    name: "Dhanishta",
    englishName: "Dhanishta",
    ruler: "Mars",
    gana: "Rakshasa",
    yoni: "Simha",
    yoniGender: "F",
    nadi: "Madhya",
    varna: "Vaishya",
    vashya: "Jalachara",
    rashi: "Makara", // padas 1-2 in Makara; 3-4 in Kumbha
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 24,
    name: "Shatabhisha",
    englishName: "Shatabhisha",
    ruler: "Rahu",
    gana: "Rakshasa",
    yoni: "Ashwa",
    yoniGender: "F",
    nadi: "Aadi",
    varna: "Shudra",
    vashya: "Manava",
    rashi: "Kumbha",
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
  {
    id: 25,
    name: "Purva Bhadrapada",
    englishName: "Purva Bhadrapada",
    ruler: "Jupiter",
    gana: "Manushya",
    yoni: "Simha",
    yoniGender: "M",
    nadi: "Aadi",
    varna: "Brahmin",
    vashya: "Manava",
    rashi: "Kumbha", // padas 1-3 in Kumbha; 4 in Meena
    padaRashi: ["Mesha", "Vrishabha", "Mithuna", "Karka"],
  },
  {
    id: 26,
    name: "Uttara Bhadrapada",
    englishName: "Uttara Bhadrapada",
    ruler: "Saturn",
    gana: "Manushya",
    yoni: "Gau",
    yoniGender: "F",
    nadi: "Madhya",
    varna: "Kshatriya",
    vashya: "Jalachara",
    rashi: "Meena",
    padaRashi: ["Simha", "Kanya", "Tula", "Vrishchika"],
  },
  {
    id: 27,
    name: "Revati",
    englishName: "Revati",
    ruler: "Mercury",
    gana: "Deva",
    yoni: "Gaja",
    yoniGender: "F",
    nadi: "Antya",
    varna: "Shudra",
    vashya: "Jalachara",
    rashi: "Meena",
    padaRashi: ["Dhanu", "Makara", "Kumbha", "Meena"],
  },
];

export const NAKSHATRA_BY_ID = new Map<number, NakshatraRow>(
  NAKSHATRAS.map((n) => [n.id, n]),
);

// ── Planetary friendship (Naisargika Maitri) ──
// Used for Graha Maitri Koota. Each Moon sign is ruled by one of seven
// classical planets; their natural friendships determine compatibility.
export type Friendship = "friend" | "neutral" | "enemy" | "self";

const FRIENDS: Record<Planet, Planet[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
  Rahu: [], // shadow planets — not used as Rashi rulers
  Ketu: [],
};

const ENEMIES: Record<Planet, Planet[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
  Rahu: [],
  Ketu: [],
};

export function planetaryRelationship(a: Planet, b: Planet): Friendship {
  if (a === b) return "self";
  if (FRIENDS[a]?.includes(b)) return "friend";
  if (ENEMIES[a]?.includes(b)) return "enemy";
  return "neutral";
}

// ── Yoni compatibility ──
// 14-animal compatibility matrix. Same animal = 4. Friendly = 3. Neutral = 2.
// Unfriendly = 1. Enemy pairs = 0.
//
// Traditional enemy pairs (Brihat Parashara Hora Shastra):
//   Ashwa (horse)   ↔ Mahisha (buffalo)
//   Gaja (elephant) ↔ Simha (lion)
//   Mesha (sheep)   ↔ Vanara (monkey)
//   Sarpa (snake)   ↔ Nakula (mongoose)
//   Shwan (dog)     ↔ Mriga (deer)
//   Marjar (cat)    ↔ Mushaka (rat)
//   Gau (cow)       ↔ Vyaghra (tiger)
//
// Yoni gender also matters: same-gender pairings of compatible yonis are
// scored slightly lower than opposite-gender pairings in some traditions.
// For this tool we use the standard score table without gender adjustment
// (gender is shown in the report but does not deduct points).

const YONI_ENEMIES: Record<string, string[]> = {
  Ashwa: ["Mahisha"],
  Mahisha: ["Ashwa"],
  Gaja: ["Simha"],
  Simha: ["Gaja"],
  Mesha: ["Vanara"],
  Vanara: ["Mesha"],
  Sarpa: ["Nakula"],
  Nakula: ["Sarpa"],
  Shwan: ["Mriga"],
  Mriga: ["Shwan"],
  Marjar: ["Mushaka"],
  Mushaka: ["Marjar"],
  Gau: ["Vyaghra"],
  Vyaghra: ["Gau"],
};

// Friendly / unfriendly classifications draw on the traditional groupings
// (small-animal vs. large-animal, predator vs. prey). Implemented as a
// concise lookup that yields stable mid-range scores without overstating
// precision.
const YONI_FRIENDLY_GROUPS: string[][] = [
  ["Ashwa", "Gaja"], // both noble, royal mounts
  ["Mesha", "Gau", "Mahisha"], // ungulates
  ["Sarpa", "Mushaka"], // small reptilian / rodent
  ["Marjar", "Mriga"],
  ["Shwan", "Vanara"],
  ["Vyaghra", "Simha"], // big cats
  ["Nakula", "Mushaka"], // small mammals
];

export function yoniCompatibility(a: string, b: string): number {
  if (a === b) return 4;
  if ((YONI_ENEMIES[a] ?? []).includes(b)) return 0;
  for (const group of YONI_FRIENDLY_GROUPS) {
    if (group.includes(a) && group.includes(b)) return 3;
  }
  // Default neutral: 2. Slight unfriendly bias for unrelated predator/prey
  // crossings handled implicitly — we keep the model simple and explainable.
  return 2;
}

// ── Vashya compatibility ──
// Same Vashya class = 2. Friendly = 1. Otherwise = 0.5.
// Manava is friendly with Manava only. Chatushpada and Vanachara are
// friendly. Jalachara stands somewhat apart. Keeta is least compatible.
const VASHYA_FRIENDS: Record<string, string[]> = {
  Chatushpada: ["Vanachara"],
  Vanachara: ["Chatushpada"],
  Manava: [],
  Jalachara: ["Keeta"],
  Keeta: ["Jalachara"],
};

export function vashyaCompatibility(a: string, b: string): number {
  if (a === b) return 2;
  if ((VASHYA_FRIENDS[a] ?? []).includes(b)) return 1;
  return 0.5;
}

// ── Syllable → Nakshatra Pada (name-based fallback) ──
// Maps the first syllable (Hindi/Sanskrit transliteration) to the
// corresponding Nakshatra and Pada. Standard Naamakshatra table.
export const SYLLABLE_TO_PADA: Record<string, { nakshatraId: number; pada: 1 | 2 | 3 | 4 }> = {
  // Ashwini
  chu: { nakshatraId: 1, pada: 1 },
  che: { nakshatraId: 1, pada: 2 },
  cho: { nakshatraId: 1, pada: 3 },
  la: { nakshatraId: 1, pada: 4 },
  // Bharani
  li: { nakshatraId: 2, pada: 1 },
  lu: { nakshatraId: 2, pada: 2 },
  le: { nakshatraId: 2, pada: 3 },
  lo: { nakshatraId: 2, pada: 4 },
  // Krittika
  a: { nakshatraId: 3, pada: 1 },
  i: { nakshatraId: 3, pada: 2 },
  u: { nakshatraId: 3, pada: 3 },
  e: { nakshatraId: 3, pada: 4 },
  // Rohini
  o: { nakshatraId: 4, pada: 1 },
  va: { nakshatraId: 4, pada: 2 },
  vi: { nakshatraId: 4, pada: 3 },
  vu: { nakshatraId: 4, pada: 4 },
  // Mrigashira
  ve: { nakshatraId: 5, pada: 1 },
  vo: { nakshatraId: 5, pada: 2 },
  ka: { nakshatraId: 5, pada: 3 },
  ki: { nakshatraId: 5, pada: 4 },
  // Ardra
  ku: { nakshatraId: 6, pada: 1 },
  gha: { nakshatraId: 6, pada: 2 },
  ng: { nakshatraId: 6, pada: 3 },
  cha: { nakshatraId: 6, pada: 4 },
  // Punarvasu
  ke: { nakshatraId: 7, pada: 1 },
  ko: { nakshatraId: 7, pada: 2 },
  ha: { nakshatraId: 7, pada: 3 },
  hi: { nakshatraId: 7, pada: 4 },
  // Pushya
  hu: { nakshatraId: 8, pada: 1 },
  he: { nakshatraId: 8, pada: 2 },
  ho: { nakshatraId: 8, pada: 3 },
  da: { nakshatraId: 8, pada: 4 },
  // Ashlesha
  di: { nakshatraId: 9, pada: 1 },
  du: { nakshatraId: 9, pada: 2 },
  de: { nakshatraId: 9, pada: 3 },
  do: { nakshatraId: 9, pada: 4 },
  // Magha
  ma: { nakshatraId: 10, pada: 1 },
  mi: { nakshatraId: 10, pada: 2 },
  mu: { nakshatraId: 10, pada: 3 },
  me: { nakshatraId: 10, pada: 4 },
  // Purva Phalguni
  mo: { nakshatraId: 11, pada: 1 },
  ta: { nakshatraId: 11, pada: 2 },
  ti: { nakshatraId: 11, pada: 3 },
  tu: { nakshatraId: 11, pada: 4 },
  // Uttara Phalguni
  te: { nakshatraId: 12, pada: 1 },
  to: { nakshatraId: 12, pada: 2 },
  pa: { nakshatraId: 12, pada: 3 },
  pi: { nakshatraId: 12, pada: 4 },
  // Hasta
  pu: { nakshatraId: 13, pada: 1 },
  sha: { nakshatraId: 13, pada: 2 },
  na: { nakshatraId: 13, pada: 3 },
  tha: { nakshatraId: 13, pada: 4 },
  // Chitra
  pe: { nakshatraId: 14, pada: 1 },
  po: { nakshatraId: 14, pada: 2 },
  ra: { nakshatraId: 14, pada: 3 },
  ri: { nakshatraId: 14, pada: 4 },
  // Swati
  ru: { nakshatraId: 15, pada: 1 },
  re: { nakshatraId: 15, pada: 2 },
  ro: { nakshatraId: 15, pada: 3 },
  taa: { nakshatraId: 15, pada: 4 },
  // Vishakha
  ti2: { nakshatraId: 16, pada: 1 },
  tu2: { nakshatraId: 16, pada: 2 },
  te2: { nakshatraId: 16, pada: 3 },
  to2: { nakshatraId: 16, pada: 4 },
  // Anuradha
  naa: { nakshatraId: 17, pada: 1 },
  ni: { nakshatraId: 17, pada: 2 },
  nu: { nakshatraId: 17, pada: 3 },
  ne: { nakshatraId: 17, pada: 4 },
  // Jyeshtha
  no: { nakshatraId: 18, pada: 1 },
  ya: { nakshatraId: 18, pada: 2 },
  yi: { nakshatraId: 18, pada: 3 },
  yu: { nakshatraId: 18, pada: 4 },
  // Mula
  ye: { nakshatraId: 19, pada: 1 },
  yo: { nakshatraId: 19, pada: 2 },
  bha: { nakshatraId: 19, pada: 3 },
  bhi: { nakshatraId: 19, pada: 4 },
  // Purva Ashadha
  bhu: { nakshatraId: 20, pada: 1 },
  dha: { nakshatraId: 20, pada: 2 },
  pha: { nakshatraId: 20, pada: 3 },
  dha2: { nakshatraId: 20, pada: 4 },
  // Uttara Ashadha
  bhe: { nakshatraId: 21, pada: 1 },
  bho: { nakshatraId: 21, pada: 2 },
  ja: { nakshatraId: 21, pada: 3 },
  ji: { nakshatraId: 21, pada: 4 },
  // Shravana
  ju: { nakshatraId: 22, pada: 1 },
  je: { nakshatraId: 22, pada: 2 },
  jo: { nakshatraId: 22, pada: 3 },
  gha2: { nakshatraId: 22, pada: 4 },
  // Dhanishta
  ga: { nakshatraId: 23, pada: 1 },
  gi: { nakshatraId: 23, pada: 2 },
  gu: { nakshatraId: 23, pada: 3 },
  ge: { nakshatraId: 23, pada: 4 },
  // Shatabhisha
  go: { nakshatraId: 24, pada: 1 },
  saa: { nakshatraId: 24, pada: 2 },
  si: { nakshatraId: 24, pada: 3 },
  su: { nakshatraId: 24, pada: 4 },
  // Purva Bhadrapada
  se: { nakshatraId: 25, pada: 1 },
  so: { nakshatraId: 25, pada: 2 },
  daa: { nakshatraId: 25, pada: 3 },
  di2: { nakshatraId: 25, pada: 4 },
  // Uttara Bhadrapada
  du2: { nakshatraId: 26, pada: 1 },
  jhna: { nakshatraId: 26, pada: 2 },
  thaa: { nakshatraId: 26, pada: 3 },
  jna: { nakshatraId: 26, pada: 4 },
  // Revati
  de2: { nakshatraId: 27, pada: 1 },
  do2: { nakshatraId: 27, pada: 2 },
  cha2: { nakshatraId: 27, pada: 3 },
  chi: { nakshatraId: 27, pada: 4 },
};

// First-letter → most-common Nakshatra fallback for ASCII names that don't
// match a transliterated syllable cleanly. Less precise but always returns
// something. Keys are lowercase first letters.
export const FIRST_LETTER_FALLBACK: Record<string, number> = {
  a: 3, // Krittika
  b: 19, // Mula → Bha
  c: 1, // Ashwini → Chu
  d: 8, // Pushya → Da
  e: 3, // Krittika → E
  f: 20, // Purva Ashadha → Pha
  g: 23, // Dhanishta → Ga
  h: 7, // Punarvasu → Ha
  i: 3, // Krittika → I
  j: 21, // Uttara Ashadha → Ja
  k: 5, // Mrigashira → Ka
  l: 1, // Ashwini → La
  m: 10, // Magha → Ma
  n: 13, // Hasta → Na
  o: 4, // Rohini → O
  p: 12, // Uttara Phalguni → Pa
  r: 14, // Chitra → Ra
  s: 13, // Hasta → Sha
  t: 11, // Purva Phalguni → Ta
  u: 3, // Krittika → U
  v: 4, // Rohini → Va
  w: 4, // (English W maps to V/Va)
  y: 18, // Jyeshtha → Ya
};
