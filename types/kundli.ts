// ──────────────────────────────────────────────────────────────────────────
// Kundli matching — types.
//
// Birth charts, Ashtakoota Guna Milan results, dosha analysis, and the
// shape of the rendered report. Everything is computed client-side; nothing
// here goes near the database.
// ──────────────────────────────────────────────────────────────────────────

export type Gana = "Deva" | "Manushya" | "Rakshasa";
export type Nadi = "Aadi" | "Madhya" | "Antya";
export type Varna = "Brahmin" | "Kshatriya" | "Vaishya" | "Shudra";
export type Vashya =
  | "Chatushpada" // four-legged
  | "Manava" // human
  | "Jalachara" // water-dwelling
  | "Vanachara" // wild
  | "Keeta"; // insect

export type YoniAnimal =
  | "Ashwa" // horse
  | "Gaja" // elephant
  | "Mesha" // sheep
  | "Sarpa" // serpent
  | "Shwan" // dog
  | "Marjar" // cat
  | "Mushaka" // rat
  | "Gau" // cow
  | "Mahisha" // buffalo
  | "Vyaghra" // tiger
  | "Mriga" // deer
  | "Vanara" // monkey
  | "Nakula" // mongoose
  | "Simha"; // lion

export type Planet =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu";

export type Rashi =
  | "Mesha" // Aries
  | "Vrishabha" // Taurus
  | "Mithuna" // Gemini
  | "Karka" // Cancer
  | "Simha" // Leo
  | "Kanya" // Virgo
  | "Tula" // Libra
  | "Vrishchika" // Scorpio
  | "Dhanu" // Sagittarius
  | "Makara" // Capricorn
  | "Kumbha" // Aquarius
  | "Meena"; // Pisces

export interface NakshatraRow {
  id: number; // 1..27
  name: string;
  englishName: string;
  ruler: Planet;
  gana: Gana;
  yoni: YoniAnimal;
  yoniGender: "M" | "F";
  nadi: Nadi;
  varna: Varna;
  vashya: Vashya;
  rashi: Rashi;
  // Pada → Navamsha sign for each quarter (used for fine-grained checks).
  padaRashi: [Rashi, Rashi, Rashi, Rashi];
}

export interface RashiRow {
  id: number; // 1..12
  name: Rashi;
  englishName: string;
  ruler: Planet;
  vashya: Vashya;
}

export type PartnerRole = "groom" | "bride" | "partnerA" | "partnerB";

export interface BirthInput {
  name?: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:MM 24h, "" if unknown → sunrise default at place
  timeKnown: boolean;
  place: {
    label: string; // "Mumbai, India"
    lat: number;
    lng: number;
    tzOffsetHours: number; // standard offset, decimal hours
  };
  // Optional: allow first-letter / syllable based name matching when birth
  // details are unavailable. The syllable maps to a Nakshatra Pada.
  nameSyllable?: string;
}

export interface BirthChart {
  // Sidereal Moon longitude in degrees [0, 360).
  moonLongitude: number;
  rashi: Rashi;
  rashiId: number;
  nakshatra: NakshatraRow;
  pada: 1 | 2 | 3 | 4;
  // Whether this chart was estimated from incomplete data (no birth time, or
  // name-only). Surfaces an accuracy caveat on the report.
  estimated: boolean;
  estimationReason?: string;
}

export interface KootaResult {
  key:
    | "varna"
    | "vashya"
    | "tara"
    | "yoni"
    | "grahaMaitri"
    | "gana"
    | "bhakoot"
    | "nadi";
  name: string; // "Varna", "Vashya", ...
  plainName: string; // "Spiritual & Values Alignment"
  obtained: number;
  max: number;
  status: "favorable" | "partial" | "neutral" | "challenging";
  traditionalNote: string;
  plainNote: string;
}

export interface DoshaResult {
  key: "nadi" | "bhakoot" | "manglik";
  name: string;
  present: boolean;
  cancelled: boolean;
  cancellationReasons: string[];
  summary: string;
  remedyNote?: string;
}

export type ScoreTier =
  | "exceptional"
  | "excellent"
  | "good"
  | "manageable"
  | "challenging";

export interface MatchResult {
  partnerA: BirthChart;
  partnerB: BirthChart;
  partnerAName: string;
  partnerBName: string;
  kootas: KootaResult[];
  total: number;
  max: number;
  tier: ScoreTier;
  tierLabel: string;
  tierBlurb: string;
  doshas: DoshaResult[];
  summary: string;
}
