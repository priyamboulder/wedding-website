// Wedding profile captured by the AI questionnaire + localStorage helpers.
// The profile is posted to /api/ai-checklist/generate to produce tasks that
// are then inserted into useChecklistStore as custom items.

export type Faith =
  | "hindu"
  | "christian"
  | "muslim"
  | "jewish"
  | "sikh"
  | "buddhist"
  | "secular"
  | "other";

export type HinduRegion =
  | "gujarati"
  | "punjabi"
  | "bengali"
  | "tamil"
  | "telugu"
  | "marathi"
  | "rajasthani"
  | "kashmiri"
  | "malayali"
  | "north_indian_generic"
  | "other";

export type InterfaithBlending =
  | "separate_ceremonies"
  | "combined_ceremony"
  | "multi_day_hybrid";

export type BudgetTier = "modest" | "mid" | "premium" | "luxury";

export type EventsScale = "3" | "4_5" | "6_7" | "8_plus";
export type GuestScale = "lt100" | "100_200" | "200_400" | "gt400";

export interface WeddingProfile {
  weddingDate: string; // ISO yyyy-mm-dd
  faiths: Faith[];
  hinduRegions: HinduRegion[];
  interfaithBlending: InterfaithBlending | null;
  interfaithNotes: string;
  eventsScale: EventsScale | null;
  guestScale: GuestScale | null;
  budgetTier: BudgetTier | null;
  locationCity: string;
  locationRegion: string;
  locationCountry: string;
  isDestination: boolean;
}

export const EMPTY_PROFILE: WeddingProfile = {
  weddingDate: "",
  faiths: [],
  hinduRegions: [],
  interfaithBlending: null,
  interfaithNotes: "",
  eventsScale: null,
  guestScale: null,
  budgetTier: null,
  locationCity: "",
  locationRegion: "",
  locationCountry: "",
  isDestination: false,
};

export function isProfileReady(p: WeddingProfile): boolean {
  if (!p.weddingDate) return false;
  if (p.faiths.length === 0) return false;
  if (p.faiths.includes("hindu") && p.hinduRegions.length === 0) return false;
  if (p.faiths.length >= 2 && !p.interfaithBlending) return false;
  if (!p.eventsScale || !p.guestScale || !p.budgetTier) return false;
  return true;
}

// ── localStorage ────────────────────────────────────────────────────────────

const PROFILE_KEY = "ai-wedding-profile:v1";
const GENERATED_KEY = "ai-wedding-generated:v1";

export function loadProfile(): WeddingProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return EMPTY_PROFILE;
    return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<WeddingProfile>) };
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(p: WeddingProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}

export function loadAiGeneratedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GENERATED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
}

export function saveAiGeneratedIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GENERATED_KEY, JSON.stringify(ids));
}

// ── Display helpers for wizard ──────────────────────────────────────────────

export const FAITH_LABELS: Record<Faith, string> = {
  hindu: "Hindu",
  christian: "Christian",
  muslim: "Muslim",
  jewish: "Jewish",
  sikh: "Sikh",
  buddhist: "Buddhist",
  secular: "Secular / Non-religious",
  other: "Other",
};

export const HINDU_REGION_LABELS: Record<HinduRegion, string> = {
  gujarati: "Gujarati",
  punjabi: "Punjabi",
  bengali: "Bengali",
  tamil: "Tamil",
  telugu: "Telugu",
  marathi: "Marathi",
  rajasthani: "Rajasthani",
  kashmiri: "Kashmiri",
  malayali: "Malayali",
  north_indian_generic: "North Indian (generic)",
  other: "Other / Mixed",
};

export const BLENDING_LABELS: Record<InterfaithBlending, string> = {
  separate_ceremonies: "Separate ceremonies, one per tradition",
  combined_ceremony: "One combined ceremony blending traditions",
  multi_day_hybrid: "Multi-day celebration with distinct tradition days",
};

export const EVENTS_LABELS: Record<EventsScale, string> = {
  "3": "3 events",
  "4_5": "4–5 events",
  "6_7": "6–7 events",
  "8_plus": "8+ events",
};

export const GUESTS_LABELS: Record<GuestScale, string> = {
  lt100: "Under 100",
  "100_200": "100–200",
  "200_400": "200–400",
  gt400: "400+",
};

export const BUDGET_LABELS: Record<BudgetTier, string> = {
  modest: "Modest",
  mid: "Mid",
  premium: "Premium",
  luxury: "Luxury",
};

// Tradition tags used on generated ChecklistItem.tradition_profile_tags — makes
// filtering by tradition work the same as seeded items.
export function traditionTagsFor(p: WeddingProfile): string[] {
  const tags: string[] = [];
  for (const f of p.faiths) tags.push(f);
  for (const r of p.hinduRegions) tags.push(r);
  return tags.length > 0 ? tags : ["all"];
}
