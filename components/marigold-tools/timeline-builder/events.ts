// Static catalog for the Timeline Builder. Each event has a typical
// duration in hours and a fixed day-of skeleton. Skeletons are illustrative
// — couples will tune them inside their workspace.

export type EventId =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "ceremony"
  | "pheras"
  | "civil"
  | "cocktail"
  | "reception"
  | "brunch";

export type EventDef = {
  id: EventId;
  name: string;
  durationHours: number;
  blurb: string;
  skeleton: { time: string; line: string }[];
};

export const EVENT_CATALOG: EventDef[] = [
  {
    id: "haldi",
    name: "Haldi",
    durationHours: 2.5,
    blurb: "2–3 hrs · morning",
    skeleton: [
      { time: "9:00 AM", line: "Setup begins, decor goes up in courtyard or backyard" },
      { time: "9:30 AM", line: "Bride/groom seated, family arrives" },
      { time: "10:00 AM", line: "Haldi paste applied — elders first, then everyone" },
      { time: "11:00 AM", line: "Light brunch + chai service" },
      { time: "11:30 AM", line: "Photos, dancing, gentle wind-down" },
    ],
  },
  {
    id: "mehendi",
    name: "Mehendi Night",
    durationHours: 5,
    blurb: "4–6 hrs · evening",
    skeleton: [
      { time: "5:00 PM", line: "Venue opens, artist setup" },
      { time: "5:30 PM", line: "Guests arrive, welcome drinks and snacks" },
      { time: "6:00 PM", line: "Bride's mehendi begins" },
      { time: "6:30 PM", line: "Guest mehendi stations open" },
      { time: "8:30 PM", line: "Dinner served" },
      { time: "9:30 PM", line: "Music and entertainment" },
      { time: "11:00 PM", line: "Close" },
    ],
  },
  {
    id: "sangeet",
    name: "Sangeet",
    durationHours: 5,
    blurb: "4–6 hrs · evening",
    skeleton: [
      { time: "6:00 PM", line: "Doors open, cocktail hour begins" },
      { time: "7:00 PM", line: "Guests seated, MC opens the show" },
      { time: "7:15 PM", line: "Family performances begin (siblings, cousins, parents)" },
      { time: "8:30 PM", line: "Couple's choreographed performance" },
      { time: "9:00 PM", line: "Dinner served" },
      { time: "10:00 PM", line: "Open dance floor — DJ takes over" },
      { time: "11:30 PM", line: "Close" },
    ],
  },
  {
    id: "baraat",
    name: "Baraat",
    durationHours: 1.5,
    blurb: "1–2 hrs · before ceremony",
    skeleton: [
      { time: "T-90 min", line: "Groom's side gathers at hotel or staging point" },
      { time: "T-75 min", line: "Dhol player arrives, horse/car ready" },
      { time: "T-60 min", line: "Procession begins — slow walk, dancing" },
      { time: "T-15 min", line: "Arrival at venue, milni greeting with bride's family" },
      { time: "T-5 min", line: "Garlands, jaimala, then ceremony seating" },
    ],
  },
  {
    id: "ceremony",
    name: "Hindu Ceremony",
    durationHours: 3,
    blurb: "2–4 hrs · daytime",
    skeleton: [
      { time: "10:00 AM", line: "Mandap setup complete, pandit arrives" },
      { time: "10:30 AM", line: "Guests seated, family processionals" },
      { time: "11:00 AM", line: "Ganesh puja, kanyadaan" },
      { time: "11:45 AM", line: "Pheras (4 or 7 rounds around the fire)" },
      { time: "12:30 PM", line: "Sindoor, mangalsutra, blessings" },
      { time: "1:00 PM", line: "Lunch reception begins" },
    ],
  },
  {
    id: "pheras",
    name: "Pheras",
    durationHours: 1.5,
    blurb: "1–2 hrs · stand-alone",
    skeleton: [
      { time: "Start", line: "Ganesh puja — invoking auspicious beginnings" },
      { time: "+15 min", line: "Kanyadaan — bride's parents give her hand" },
      { time: "+30 min", line: "Mangal phera 1: dharma — duty" },
      { time: "+45 min", line: "Mangal phera 2: artha — prosperity" },
      { time: "+60 min", line: "Mangal phera 3: kama — desire" },
      { time: "+75 min", line: "Mangal phera 4: moksha — liberation" },
      { time: "+90 min", line: "Sindoor + mangalsutra, family blessings" },
    ],
  },
  {
    id: "civil",
    name: "Civil Ceremony",
    durationHours: 0.75,
    blurb: "30–60 min",
    skeleton: [
      { time: "Start", line: "Officiant welcomes guests, brief opening" },
      { time: "+5 min", line: "Couple's vows or readings" },
      { time: "+15 min", line: "Ring exchange" },
      { time: "+25 min", line: "Pronouncement, signing of license" },
      { time: "+40 min", line: "Recessional, transition to next event" },
    ],
  },
  {
    id: "cocktail",
    name: "Cocktail Hour",
    durationHours: 1.25,
    blurb: "1–1.5 hrs",
    skeleton: [
      { time: "Start", line: "Bar opens, passed appetizers begin" },
      { time: "+15 min", line: "Couple takes formal photos with photographer" },
      { time: "+30 min", line: "Live music or DJ background set" },
      { time: "+60 min", line: "Guests directed toward reception space" },
    ],
  },
  {
    id: "reception",
    name: "Reception / Dinner",
    durationHours: 5,
    blurb: "4–6 hrs · evening",
    skeleton: [
      { time: "7:00 PM", line: "Guests seated, couple's grand entrance" },
      { time: "7:15 PM", line: "Welcome speeches, parents' toasts" },
      { time: "7:45 PM", line: "Dinner service begins" },
      { time: "8:45 PM", line: "First dance, parent dances" },
      { time: "9:15 PM", line: "Cake cutting" },
      { time: "9:30 PM", line: "Open dance floor" },
      { time: "11:30 PM", line: "Last call, send-off" },
      { time: "12:00 AM", line: "Close" },
    ],
  },
  {
    id: "brunch",
    name: "Next-Day Brunch",
    durationHours: 2.5,
    blurb: "2–3 hrs · morning",
    skeleton: [
      { time: "10:30 AM", line: "Casual arrival, coffee + chai" },
      { time: "11:00 AM", line: "Buffet brunch opens" },
      { time: "11:30 AM", line: "Light remarks, thank-yous from couple" },
      { time: "12:30 PM", line: "Goodbyes, gift exchange with out-of-town family" },
      { time: "1:00 PM", line: "Close" },
    ],
  },
];

export const EVENT_BY_ID: Record<EventId, EventDef> = Object.fromEntries(
  EVENT_CATALOG.map((e) => [e.id, e]),
) as Record<EventId, EventDef>;

// "Suggest a logical order" mapping. Day index is 0-2.
export const SUGGESTED_LAYOUT: Record<EventId, number> = {
  haldi: 0,
  mehendi: 0,
  sangeet: 0,
  baraat: 1,
  ceremony: 1,
  pheras: 1,
  civil: 1,
  cocktail: 1,
  reception: 1,
  brunch: 2,
};
