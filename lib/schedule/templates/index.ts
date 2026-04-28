// Template registry — import each JSON config and expose as a typed array.
// Adding a new tradition's template means adding a JSON file next to these
// and registering it below. No component code changes required.

import type { ScheduleTemplate } from "@/types/schedule";

import sharedGettingReady from "./shared-getting-ready.json";
import sharedCocktail from "./shared-cocktail.json";
import sharedReception from "./shared-reception.json";
import sahBaraat from "./south-asian-hindu-baraat.json";
import sahCeremony from "./south-asian-hindu-ceremony.json";
import saMehndi from "./south-asian-mehndi.json";
import saHaldi from "./south-asian-haldi.json";
import saSangeet from "./south-asian-sangeet.json";
import saGarba from "./south-asian-garba.json";
import westernCeremony from "./western-ceremony.json";

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  sharedGettingReady as ScheduleTemplate,
  sharedCocktail as ScheduleTemplate,
  sharedReception as ScheduleTemplate,
  sahBaraat as ScheduleTemplate,
  sahCeremony as ScheduleTemplate,
  saMehndi as ScheduleTemplate,
  saHaldi as ScheduleTemplate,
  saSangeet as ScheduleTemplate,
  saGarba as ScheduleTemplate,
  westernCeremony as ScheduleTemplate,
];

export function findTemplate(id: string): ScheduleTemplate | null {
  return SCHEDULE_TEMPLATES.find((t) => t.id === id) ?? null;
}

// Resolve the most appropriate template for an (eventType, traditions) pair.
// Preference order: tradition-specific > south_asian (any) > western > shared.
export function templateFor(
  eventType: string,
  traditions: string[],
): ScheduleTemplate | null {
  const isSouthAsian = traditions.some((t) =>
    [
      "gujarati",
      "punjabi",
      "tamil",
      "telugu",
      "bengali",
      "marwari",
      "marathi",
      "sindhi",
      "malayali",
      "kashmiri",
    ].includes(t),
  );
  const isWestern = traditions.some((t) =>
    ["south_indian_christian", "non_religious"].includes(t),
  );

  const bucket = isSouthAsian
    ? ["south_asian", "shared", "western"]
    : isWestern
      ? ["western", "shared", "south_asian"]
      : ["shared", "south_asian", "western"];

  for (const tradition of bucket) {
    const match = SCHEDULE_TEMPLATES.find(
      (t) => t.tradition === tradition && t.eventType === eventType,
    );
    if (match) return match;
  }
  return null;
}
