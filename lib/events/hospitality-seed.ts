// ── Hospitality ideas seed ────────────────────────────────────────────────
// Curated "guest delight" suggestions per event type. Surfaced on the Guest
// feel tab as cards the couple can Love / skip / override with their own.
// Hand-authored so stays human and specific; real AI calls will re-rank at
// display time using the couple's brief context.

import type { EventType } from "@/types/events";

export interface HospitalityIdea {
  id: string;
  eventTypes: EventType[];
  title: string;
  blurb: string;
  // One of arrival / during / departure to group on the Guest feel tab.
  stage: "arrival" | "during" | "departure";
}

export const HOSPITALITY_IDEAS: HospitalityIdea[] = [
  // ── Pithi ──────────────────────────────────────────────────────────────
  { id: "pithi-garland", eventTypes: ["pithi"], title: "Garland at the door", blurb: "Each guest gets a small marigold garland as they arrive.", stage: "arrival" },
  { id: "pithi-chai", eventTypes: ["pithi"], title: "Masala chai station", blurb: "Fresh chai brewing on-site — the scent defines the morning.", stage: "arrival" },
  { id: "pithi-keepsake", eventTypes: ["pithi"], title: "Turmeric-stained handkerchiefs", blurb: "Guests tuck them away as a keepsake from the ritual.", stage: "departure" },

  // ── Haldi ──────────────────────────────────────────────────────────────
  { id: "haldi-coconut", eventTypes: ["haldi"], title: "Fresh coconut water bar", blurb: "Cool, hydrating, perfect for a sunny courtyard ritual.", stage: "during" },
  { id: "haldi-flower-crown", eventTypes: ["haldi"], title: "DIY flower crown station", blurb: "Marigolds, jasmine, and tuberoses — guests assemble their own.", stage: "during" },
  { id: "haldi-dhol", eventTypes: ["haldi"], title: "Live dhol player", blurb: "Pulls guests into the energy the moment the ritual begins.", stage: "arrival" },
  { id: "haldi-photo", eventTypes: ["haldi"], title: "Polaroid wall", blurb: "Instant photos pinned up by guests — a live-growing memory board.", stage: "during" },

  // ── Mehendi ────────────────────────────────────────────────────────────
  { id: "mehendi-chaat", eventTypes: ["mehendi"], title: "Chaat cart at golden hour", blurb: "Pani puri, aloo tikki, sev puri — a classic crowd-pleaser.", stage: "during" },
  { id: "mehendi-tattoo-bar", eventTypes: ["mehendi"], title: "Secondary mehendi bar for guests", blurb: "A second artist doing quick designs for anyone who wants one.", stage: "during" },
  { id: "mehendi-cocktail", eventTypes: ["mehendi"], title: "Rose lassi on arrival", blurb: "A welcome drink that signals the afternoon is about to begin.", stage: "arrival" },

  // ── Sangeet ────────────────────────────────────────────────────────────
  { id: "sangeet-request", eventTypes: ["sangeet"], title: "Song-request cards at tables", blurb: "Guests write requests the DJ weaves into the night.", stage: "during" },
  { id: "sangeet-glow", eventTypes: ["sangeet"], title: "Glow sticks for dance floor", blurb: "Dropped when the lights come down and the BPM climbs.", stage: "during" },
  { id: "sangeet-midnight", eventTypes: ["sangeet"], title: "Chai & chaat at midnight", blurb: "Second food wave — fuels the floor for two more hours.", stage: "during" },
  { id: "sangeet-welcome", eventTypes: ["sangeet"], title: "Live sitar at the entrance", blurb: "Sets the tone before guests even see the room.", stage: "arrival" },

  // ── Garba ──────────────────────────────────────────────────────────────
  { id: "garba-dandiya", eventTypes: ["garba"], title: "Dandiya sticks on arrival", blurb: "Each guest receives a pair — no one is a spectator.", stage: "arrival" },
  { id: "garba-cooldown", eventTypes: ["garba"], title: "Cooling towels + jaljeera", blurb: "Between dance circles — classic folk-night hospitality.", stage: "during" },

  // ── Baraat ─────────────────────────────────────────────────────────────
  { id: "baraat-horse", eventTypes: ["baraat"], title: "Dhol + horse procession", blurb: "Classic Punjabi entrance — guests follow the beat in.", stage: "arrival" },
  { id: "baraat-shower", eventTypes: ["baraat"], title: "Flower petal shower", blurb: "Rose petals drop at the entrance arch as the groom enters.", stage: "arrival" },

  // ── Ceremony ───────────────────────────────────────────────────────────
  { id: "ceremony-program", eventTypes: ["ceremony"], title: "Printed ritual program", blurb: "Explains each step so non-family guests follow along.", stage: "arrival" },
  { id: "ceremony-shawl", eventTypes: ["ceremony"], title: "Pashminas on every chair", blurb: "For outdoor or evening ceremonies — thoughtful comfort.", stage: "arrival" },
  { id: "ceremony-rose", eventTypes: ["ceremony"], title: "Rose petal exit", blurb: "Guests shower the couple as they walk back down the aisle.", stage: "departure" },

  // ── Cocktail ───────────────────────────────────────────────────────────
  { id: "cocktail-signature", eventTypes: ["cocktail"], title: "Custom cocktail named after you", blurb: "Printed on a small menu at the bar.", stage: "during" },
  { id: "cocktail-passed", eventTypes: ["cocktail"], title: "Passed canapés, warm and cold", blurb: "Keep guests grazing without a buffet queue.", stage: "during" },

  // ── Reception ──────────────────────────────────────────────────────────
  { id: "reception-place-card", eventTypes: ["reception"], title: "Handwritten place cards", blurb: "Each guest gets a personal note — not just a seat assignment.", stage: "arrival" },
  { id: "reception-photo-booth", eventTypes: ["reception"], title: "Photo booth with era-specific props", blurb: "Guests take home instant prints as a favour.", stage: "during" },
  { id: "reception-late-snack", eventTypes: ["reception"], title: "Late-night snack station", blurb: "Hot dogs, kathi rolls, or mini donuts at 11 PM.", stage: "departure" },
  { id: "reception-sparkler", eventTypes: ["reception"], title: "Sparkler send-off", blurb: "The cinematic exit everyone remembers.", stage: "departure" },

  // ── After party ────────────────────────────────────────────────────────
  { id: "after-party-burger", eventTypes: ["after_party"], title: "Midnight burger truck", blurb: "Fuel for the inner circle who stayed late.", stage: "during" },
  { id: "after-party-coffee", eventTypes: ["after_party"], title: "Espresso cart at 2 AM", blurb: "Second wind for the diehards.", stage: "during" },

  // ── Welcome dinner ─────────────────────────────────────────────────────
  { id: "welcome-map", eventTypes: ["welcome_dinner"], title: "Local welcome map on every table", blurb: "Restaurants, coffee, things to do for visiting guests.", stage: "arrival" },
  { id: "welcome-bag", eventTypes: ["welcome_dinner"], title: "Personalised welcome bag at seat", blurb: "Snacks, a note, something local and specific.", stage: "arrival" },

  // ── Farewell brunch ────────────────────────────────────────────────────
  { id: "brunch-chaiwala", eventTypes: ["farewell_brunch"], title: "Masala chai + filter coffee station", blurb: "Familiar, slow, something to linger over.", stage: "arrival" },
  { id: "brunch-photos", eventTypes: ["farewell_brunch"], title: "Slideshow of the week on loop", blurb: "First photos in — guests see themselves everywhere.", stage: "during" },
  { id: "brunch-sendoff", eventTypes: ["farewell_brunch"], title: "Handwritten thank-you note per guest", blurb: "The last thing they carry home from the week.", stage: "departure" },
];

export function getHospitalityIdeasFor(
  type: EventType,
): HospitalityIdea[] {
  return HOSPITALITY_IDEAS.filter((i) => i.eventTypes.includes(type));
}
