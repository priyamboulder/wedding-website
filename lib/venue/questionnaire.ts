// ── Standardized Venue Questionnaire ─────────────────────────────────────
// Structured set of questions the couple asks the venue (or the venue fills
// in via a form). Used by the Venue Detail drawer to:
//  · surface a "questions to ask" checklist,
//  · group structured questionnaire data entry, and
//  · feed the card facts + comparison table on the Shortlist tab.

import type { ShortlistVenue } from "@/types/venue";

export interface QuestionItem {
  id: string;
  label: string;
  // Hint shown under the label — why this question matters for Indian weddings.
  hint?: string;
}

export interface QuestionGroup {
  id: string;
  title: string;
  description?: string;
  items: QuestionItem[];
}

export const VENUE_QUESTIONNAIRE_CHECKLIST: QuestionGroup[] = [
  {
    id: "capacity",
    title: "Capacity & spaces",
    description: "Every event has a different shape — pin down the numbers.",
    items: [
      { id: "seated", label: "Max seated capacity (dinner)?" },
      { id: "cocktail", label: "Max standing / cocktail capacity?" },
      { id: "outdoor_ceremony", label: "Max for an outdoor ceremony?" },
      { id: "spaces", label: "How many distinct event spaces?", hint: "Indian weddings typically need 3–5 distinct spaces." },
    ],
  },
  {
    id: "catering",
    title: "Catering",
    items: [
      { id: "catering_policy", label: "In-house only, outside allowed, or preferred list?", hint: "A non-starter if the venue won't allow your caterer." },
      { id: "kitchen", label: "Is there a full kitchen for an outside caterer?" },
      { id: "preferred_list", label: "If preferred list — can you share it?" },
    ],
  },
  {
    id: "alcohol",
    title: "Alcohol",
    items: [
      { id: "alcohol_policy", label: "Venue bar, outside alcohol, or both?" },
      { id: "corkage", label: "Corkage fee if we bring wine / champagne?" },
    ],
  },
  {
    id: "ceremony",
    title: "Fire ceremony & cultural",
    items: [
      { id: "fire", label: "Is a havan / fire ceremony permitted?", hint: "Indoor venues often require electric havan." },
      { id: "permit", label: "Who pulls the fire permit — venue or couple?" },
      { id: "baraat", label: "Can we do a baraat arrival (horse / car / walk)?" },
    ],
  },
  {
    id: "noise",
    title: "Noise & curfew",
    items: [
      { id: "curfew", label: "Indoor and outdoor music curfews?" },
      { id: "overtime", label: "Overtime rates after curfew?" },
    ],
  },
  {
    id: "rooms",
    title: "Accommodation",
    items: [
      { id: "rooms", label: "Rooms on-site? Total count?" },
      { id: "room_block", label: "Room block availability and minimum stay?" },
    ],
  },
  {
    id: "parking",
    title: "Parking & transport",
    items: [
      { id: "parking", label: "Parking capacity and valet availability?" },
      { id: "shuttle", label: "Shuttle drop-off area?" },
    ],
  },
  {
    id: "loadin",
    title: "Load-in & load-out",
    items: [
      { id: "loadin", label: "Load-in and load-out windows?" },
      { id: "dock", label: "Service entrance / loading dock?" },
    ],
  },
  {
    id: "cost",
    title: "Cost",
    items: [
      { id: "fee", label: "Venue fee + per-plate (if applicable)?" },
      { id: "included", label: "What's included in the venue fee?", hint: "Tables, chairs, linens, standard AV, staging." },
      { id: "restrictions", label: "Restrictions: open flame, confetti, wall attachment?" },
    ],
  },
  {
    id: "availability",
    title: "Availability",
    items: [
      { id: "calendar", label: "Availability for your target dates?" },
      { id: "booking", label: "Preferred booking window?" },
    ],
  },
];

// Shortlist venue status lifecycle (already exists in types/venue.ts). This
// ordered list is what the Detail drawer renders in its timeline dropdown.
export const VENUE_STATUS_ORDER: Array<{
  id: ShortlistVenue["status"];
  label: string;
  description: string;
}> = [
  { id: "researching", label: "Researching", description: "Still reading up." },
  { id: "site_visit_planned", label: "Site visit planned", description: "On the calendar." },
  { id: "visited", label: "Visited", description: "You walked the property." },
  { id: "shortlisted", label: "Shortlisted", description: "It's a real contender." },
  { id: "booked", label: "Booked", description: "Deposit sent, it's happening." },
  { id: "passed", label: "Passed", description: "Not for us." },
];
