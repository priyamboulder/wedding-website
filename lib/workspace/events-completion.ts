// ── Events workspace completion ───────────────────────────────────────────
// Drives the "warmth" dot next to each event in the sidebar: grey when the
// event hasn't been touched, amber when at least one of the four discovery
// tabs has content, rich (saffron) when every tab has at least one signal.
//
// The new tab set is discovery-first: Vibe & Palette, Attire, Guest feel,
// The brief. "Has content" is intentionally generous — we want the warmth
// dot to go amber the moment the couple leaves a fingerprint on an event.

import type { EventRecord } from "@/types/events";

export type EventTabId = "vibe" | "attire" | "guest" | "brief";

export type TabCompletion = {
  tab: EventTabId;
  filled: boolean;
};

export type EventCompletion = {
  state: "empty" | "partial" | "complete";
  tabs: TabCompletion[];
};

export function isVibeFilled(e: EventRecord): boolean {
  return Boolean(
    e.vibeIntro?.trim() ||
      e.favoritedImageIds?.length > 0 ||
      e.paletteId ||
      e.customPalette ||
      e.vibeKeywords?.length > 0 ||
      e.vibeWants?.length > 0 ||
      e.vibeAvoids?.length > 0 ||
      e.pinterestBoardUrl?.trim() ||
      e.movieReference?.trim() ||
      (e.vibeQuizAnswers && Object.keys(e.vibeQuizAnswers).length > 0),
  );
}

export function isAttireFilled(e: EventRecord): boolean {
  return Boolean(
    e.attireIntro?.trim() ||
      e.favoritedAttireIds?.length > 0 ||
      e.attireWants?.length > 0 ||
      e.attireAvoids?.length > 0 ||
      e.attireKeywords?.length > 0 ||
      e.brideLookDirection?.trim() ||
      e.groomLookDirection?.trim() ||
      e.formality ||
      e.attireColorGuidance ||
      e.attireCulturalExpectation ||
      e.attireCoordinationLevel ||
      (e.attireQuizAnswers && Object.keys(e.attireQuizAnswers).length > 0),
  );
}

export function isGuestFilled(e: EventRecord): boolean {
  return Boolean(
    e.dressCode?.trim() ||
      e.culturalNotes?.trim() ||
      e.arrivalFeel?.trim() ||
      e.peakMoment?.trim() ||
      e.departureFeel?.trim() ||
      e.sensorySmell?.trim() ||
      e.sensorySound?.trim() ||
      e.sensoryLighting?.trim() ||
      e.sensoryTemperature?.trim() ||
      e.lovedHospitalityIds?.length > 0 ||
      e.customHospitalityIdeas?.length > 0 ||
      e.guestFeelBrief?.trim(),
  );
}

export function isBriefFilled(e: EventRecord): boolean {
  return Boolean(e.briefText?.trim() || e.briefAiDraft?.trim());
}

export function completionFor(e: EventRecord): EventCompletion {
  const tabs: TabCompletion[] = [
    { tab: "vibe", filled: isVibeFilled(e) },
    { tab: "attire", filled: isAttireFilled(e) },
    { tab: "guest", filled: isGuestFilled(e) },
    { tab: "brief", filled: isBriefFilled(e) },
  ];
  const filled = tabs.filter((t) => t.filled).length;
  const state: EventCompletion["state"] =
    filled === 0 ? "empty" : filled === tabs.length ? "complete" : "partial";
  return { state, tabs };
}

// Continuous "warmth" value in [0, 1] — the spec wants the sidebar dot to
// shift from grey → amber → rich colour as definition improves, not a hard
// three-step ladder. We use this for the dot's opacity / hue blend.
export function warmthFor(e: EventRecord): number {
  const c = completionFor(e);
  const filled = c.tabs.filter((t) => t.filled).length;
  return filled / c.tabs.length;
}

export function eventsProgress(events: EventRecord[]): {
  done: number;
  total: number;
} {
  const total = events.length;
  const done = events.filter((e) => completionFor(e).state !== "empty").length;
  return { done, total };
}
