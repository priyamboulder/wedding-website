// ── Event record normalizer ──────────────────────────────────────────────
// Persisted events from earlier store versions may still have `undefined`
// values for the discovery-rebuild fields until the v8 migration runs on
// rehydration. Rather than sprinkle `?? ""` / `?? []` guards through every
// tab, every tab normalizes once at the top — this function fills in
// every rebuild-era default so consumers see a fully-populated record.

import type { EventRecord } from "@/types/events";

export function normalizeEventRecord(e: EventRecord): EventRecord {
  const asText = (v: string | null | undefined): string => v ?? "";
  const asList = <T>(v: T[] | null | undefined): T[] =>
    Array.isArray(v) ? v : [];
  const asRecord = (
    v: Record<string, unknown> | null | undefined,
  ): Record<string, unknown> => (v && typeof v === "object" ? v : {});
  const asBool = (
    v: boolean | null | undefined,
    fallback: boolean,
  ): boolean => (typeof v === "boolean" ? v : fallback);

  return {
    ...e,
    // ── Existing fields kept defensive too, for v7-era persisted data ──
    favoritedImageIds: asList(e.favoritedImageIds),
    favoritedAttireIds: asList(e.favoritedAttireIds),
    vibeKeywords: asList(e.vibeKeywords),
    vibeWants: asList(e.vibeWants),
    vibeAvoids: asList(e.vibeAvoids),
    attireWants: asList(e.attireWants),
    attireAvoids: asList(e.attireAvoids),
    paletteLockedPositions: asList(e.paletteLockedPositions),
    overviewIntro: asText(e.overviewIntro),
    vibeIntro: asText(e.vibeIntro),
    attireIntro: asText(e.attireIntro),
    dressCode: asText(e.dressCode),
    culturalNotes: asText(e.culturalNotes),

    // ── Rebuild (discovery-first) fields ────────────────────────────
    energyLevel: typeof e.energyLevel === "number" ? e.energyLevel : 50,
    guestTier: e.guestTier ?? null,
    paletteInherits: asBool(e.paletteInherits, true),
    vibeQuizAnswers: asRecord(e.vibeQuizAnswers),
    attireQuizAnswers: asRecord(e.attireQuizAnswers),
    movieReference: asText(e.movieReference),
    attireColorGuidance: e.attireColorGuidance ?? null,
    attireCulturalExpectation: e.attireCulturalExpectation ?? null,
    attireCoordinationLevel: e.attireCoordinationLevel ?? null,
    attireKeywords: asList(e.attireKeywords),
    brideLookDirection: asText(e.brideLookDirection),
    groomLookDirection: asText(e.groomLookDirection),
    guestAttireCardText: asText(e.guestAttireCardText),
    arrivalFeel: asText(e.arrivalFeel),
    peakMoment: asText(e.peakMoment),
    departureFeel: asText(e.departureFeel),
    sensorySmell: asText(e.sensorySmell),
    sensorySound: asText(e.sensorySound),
    sensoryLighting: asText(e.sensoryLighting),
    sensoryTemperature: asText(e.sensoryTemperature),
    lovedHospitalityIds: asList(e.lovedHospitalityIds),
    customHospitalityIdeas: asList(e.customHospitalityIdeas),
    guestFeelBrief: asText(e.guestFeelBrief),
    briefText: asText(e.briefText),
    briefAiDraft: asText(e.briefAiDraft),
  };
}
