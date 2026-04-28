// ── RSVP store ─────────────────────────────────────────────────────────────
// Event-first guest management store. Models wedding events, households,
// guests, and a per-(guest × event) RSVP status. Seeded with a deterministic
// 9-event / 55-household / 99-guest / 563-invitation / 319-confirmed dataset
// so the page renders meaningful stats on first load.
//
// Persistence follows the project convention: Zustand + localStorage only.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, dbReplaceAll, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export type Side = "bride" | "groom";
export type RsvpStatus = "confirmed" | "pending" | "declined";
export type DietaryTag = "Veg" | "Jain" | "Non-veg";

export interface RsvpEvent {
  id: string;
  name: string;
  date: string; // ISO date
  time?: string;
  venue?: string;
  sortOrder: number;
}

export interface RsvpHousehold {
  id: string;
  name: string;
  side: Side;
  city?: string;
}

export interface RsvpGuest {
  id: string;
  firstName: string;
  lastName: string;
  honorific?: string;
  relationship?: string;
  side: Side;
  householdId: string;
  dietary: DietaryTag[];
}

export const rsvpKey = (guestId: string, eventId: string) =>
  `${guestId}|${eventId}`;

interface RsvpStoreState {
  events: RsvpEvent[];
  households: RsvpHousehold[];
  guests: RsvpGuest[];
  rsvps: Record<string, RsvpStatus>; // missing key = not invited
  householdNotes: Record<string, string>;

  setRsvp: (
    guestId: string,
    eventId: string,
    status: RsvpStatus | undefined,
  ) => void;
  cycleRsvp: (guestId: string, eventId: string) => void;
  setHouseholdStatusForEvent: (
    householdId: string,
    eventId: string,
    status: RsvpStatus,
  ) => void;
  setHouseholdStatusAllEvents: (
    householdId: string,
    status: RsvpStatus,
  ) => void;
  bulkMarkPendingDeclined: (eventId: string) => void;
  setHouseholdNotes: (householdId: string, notes: string) => void;
}

// ── Seed generation (deterministic) ────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_EVENTS: RsvpEvent[] = [
  {
    id: "evt_welcome_dinner",
    name: "Welcome Dinner",
    date: "2026-06-07",
    time: "7:00 PM",
    venue: "Taj Garden Terrace",
    sortOrder: 1,
  },
  {
    id: "evt_pithi",
    name: "Pithi",
    date: "2026-06-08",
    time: "10:30 AM",
    venue: "Shah Residence",
    sortOrder: 2,
  },
  {
    id: "evt_mehndi",
    name: "Mehndi",
    date: "2026-06-08",
    time: "5:00 PM",
    venue: "Garden Lawn",
    sortOrder: 3,
  },
  {
    id: "evt_haldi",
    name: "Haldi",
    date: "2026-06-09",
    time: "11:00 AM",
    venue: "Poolside Pavilion",
    sortOrder: 4,
  },
  {
    id: "evt_sangeet",
    name: "Sangeet",
    date: "2026-06-09",
    time: "8:00 PM",
    venue: "Grand Ballroom",
    sortOrder: 5,
  },
  {
    id: "evt_baraat",
    name: "Baraat",
    date: "2026-06-10",
    time: "3:30 PM",
    venue: "Hotel Entrance",
    sortOrder: 6,
  },
  {
    id: "evt_ceremony",
    name: "Ceremony",
    date: "2026-06-10",
    time: "5:00 PM",
    venue: "Mandap, Rose Garden",
    sortOrder: 7,
  },
  {
    id: "evt_reception",
    name: "Reception",
    date: "2026-06-10",
    time: "8:30 PM",
    venue: "Grand Ballroom",
    sortOrder: 8,
  },
  {
    id: "evt_farewell_brunch",
    name: "Farewell Brunch",
    date: "2026-06-11",
    time: "11:00 AM",
    venue: "Courtyard Terrace",
    sortOrder: 9,
  },
];

const BRIDE_SURNAMES = [
  "Shah",
  "Mehta",
  "Patel",
  "Desai",
  "Joshi",
  "Bhatt",
  "Trivedi",
  "Parikh",
  "Vyas",
  "Gandhi",
  "Kothari",
  "Shroff",
];
const GROOM_SURNAMES = [
  "Kapoor",
  "Malhotra",
  "Chopra",
  "Khanna",
  "Bhatia",
  "Sethi",
  "Arora",
  "Grover",
  "Oberoi",
  "Singh",
  "Anand",
  "Dhillon",
];

const FIRST_NAMES_F = [
  "Anita",
  "Meera",
  "Kavita",
  "Priya",
  "Neha",
  "Seema",
  "Divya",
  "Sonal",
  "Tanvi",
  "Isha",
  "Pooja",
  "Asha",
  "Lata",
  "Rekha",
  "Sejal",
  "Rina",
  "Jaya",
  "Simran",
  "Preeti",
  "Jasleen",
  "Kiran",
  "Anu",
  "Ritu",
  "Disha",
  "Maya",
  "Tara",
  "Riya",
  "Reema",
];
const FIRST_NAMES_M = [
  "Rajesh",
  "Vikram",
  "Arun",
  "Prakash",
  "Kunal",
  "Jay",
  "Dhruv",
  "Harsh",
  "Aarav",
  "Neel",
  "Bhavin",
  "Anand",
  "Aryan",
  "Vijay",
  "Sameer",
  "Vinod",
  "Raman",
  "Gurpreet",
  "Jatin",
  "Varun",
  "Nikhil",
  "Karan",
  "Aman",
  "Daman",
  "Sunil",
  "Ashok",
  "Dev",
  "Manish",
];

const CITIES_BRIDE = [
  "Ahmedabad",
  "Mumbai",
  "Surat",
  "Vadodara",
  "San Francisco",
  "New Jersey",
  "London",
  "Houston",
];
const CITIES_GROOM = [
  "Delhi",
  "Chandigarh",
  "Amritsar",
  "Mumbai",
  "Toronto",
  "Dubai",
  "Seattle",
  "Boston",
];

const RELATIONSHIPS_BRIDE = [
  "Father of the Bride",
  "Mother of the Bride",
  "Brother of the Bride",
  "Sister of the Bride",
  "Cousin",
  "Uncle (kaka)",
  "Aunt (mami)",
  "Grandmother (dadi)",
  "Grandfather (dada)",
  "Family friend",
  "Neighbor",
  "Colleague",
];
const RELATIONSHIPS_GROOM = [
  "Father of the Groom",
  "Mother of the Groom",
  "Brother of the Groom",
  "Sister of the Groom",
  "Cousin",
  "Uncle (chacha)",
  "Aunt (bua)",
  "Grandfather (dadaji)",
  "Grandmother (dadiji)",
  "College friend",
  "Childhood friend",
  "Colleague",
];

function buildSeed() {
  const rng = mulberry32(0x51adef);

  // 55 households: 28 bride-side, 27 groom-side
  const households: RsvpHousehold[] = [];
  const guests: RsvpGuest[] = [];

  // Household-size distribution chosen to sum to 99 guests across 55 hh:
  //   22 × 1 = 22, 24 × 2 = 48, 7 × 3 = 21, 2 × 4 = 8  →  99 guests
  const sizePlan = [
    ...Array(22).fill(1),
    ...Array(24).fill(2),
    ...Array(7).fill(3),
    ...Array(4).fill(4), // 4 extras — we'll trim below
  ];
  // Trim to hit exactly 99 guests across exactly 55 households.
  // 22+24+7+4 = 57; drop two 4-person to land on 55 hh / 99 guests.
  sizePlan.splice(55);
  const totalGuestCheck = sizePlan.reduce((a, b) => a + b, 0);
  // If not 99, adjust the last entry to hit 99.
  if (totalGuestCheck !== 99) {
    sizePlan[sizePlan.length - 1] += 99 - totalGuestCheck;
  }
  // Shuffle sizePlan deterministically
  for (let i = sizePlan.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [sizePlan[i], sizePlan[j]] = [sizePlan[j], sizePlan[i]];
  }

  const sideSplit: Side[] = [
    ...(Array(28).fill("bride") as Side[]),
    ...(Array(27).fill("groom") as Side[]),
  ];
  for (let i = sideSplit.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [sideSplit[i], sideSplit[j]] = [sideSplit[j], sideSplit[i]];
  }

  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

  for (let h = 0; h < 55; h++) {
    const side = sideSplit[h];
    const surname = pick(side === "bride" ? BRIDE_SURNAMES : GROOM_SURNAMES);
    const city = pick(side === "bride" ? CITIES_BRIDE : CITIES_GROOM);
    const hhId = `hh_${h + 1}`;
    const hhName = `The ${surname} Family (${city})`;
    households.push({ id: hhId, name: hhName, side, city });

    const members = sizePlan[h];
    const relPool =
      side === "bride" ? RELATIONSHIPS_BRIDE : RELATIONSHIPS_GROOM;
    const primaryRel = relPool[Math.floor(rng() * relPool.length)];
    const dietaryPool: DietaryTag[][] = [
      ["Veg"],
      ["Veg"],
      ["Veg"],
      ["Veg", "Jain"],
      ["Non-veg"],
      ["Non-veg"],
      [],
    ];
    for (let m = 0; m < members; m++) {
      const female = rng() < 0.5;
      const firstName = pick(female ? FIRST_NAMES_F : FIRST_NAMES_M);
      const honorific = female
        ? rng() < 0.5
          ? "Smt."
          : "Ms."
        : rng() < 0.5
          ? "Shri"
          : "Mr.";
      const relationship = m === 0 ? primaryRel : pick(relPool);
      const dietary = pick(dietaryPool);
      guests.push({
        id: `g_${guests.length + 1}`,
        firstName,
        lastName: surname,
        honorific,
        relationship,
        side,
        householdId: hhId,
        dietary,
      });
    }
  }

  // Target invites per event (sum = 563)
  const inviteTargets: Record<string, number> = {
    evt_welcome_dinner: 70,
    evt_pithi: 25,
    evt_mehndi: 55,
    evt_haldi: 30,
    evt_sangeet: 80,
    evt_baraat: 60,
    evt_ceremony: 95,
    evt_reception: 95,
    evt_farewell_brunch: 53,
  };
  // Target confirmed per event (sum = 319)
  const confirmTargets: Record<string, number> = {
    evt_welcome_dinner: 42,
    evt_pithi: 18,
    evt_mehndi: 32,
    evt_haldi: 20,
    evt_sangeet: 48,
    evt_baraat: 35,
    evt_ceremony: 56,
    evt_reception: 52,
    evt_farewell_brunch: 16,
  };

  const rsvps: Record<string, RsvpStatus> = {};

  for (const ev of SEED_EVENTS) {
    // Score guests for this event to prefer bride-side family for pithi/haldi,
    // groom-side for baraat, and broad invites for ceremony/reception.
    const scored = guests.map((g) => {
      let score = rng();
      if (ev.id === "evt_pithi" && g.side === "bride") score += 1.5;
      if (ev.id === "evt_haldi") {
        score += /Father|Mother|Brother|Sister|Grand|Uncle|Aunt/.test(
          g.relationship ?? "",
        )
          ? 1.2
          : 0;
      }
      if (ev.id === "evt_baraat" && g.side === "groom") score += 1.0;
      if (ev.id === "evt_mehndi") score += 0.2;
      return { g, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const invited = scored.slice(0, inviteTargets[ev.id]).map((x) => x.g);

    // Assign confirmed/pending/declined within this invited set.
    const confirmTarget = confirmTargets[ev.id];
    const rest = invited.length - confirmTarget;
    // Split remainder ~70% pending / 30% declined, rounded.
    const declinedTarget = Math.round(rest * 0.35);
    const pendingTarget = rest - declinedTarget;

    const shuffled = [...invited];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.forEach((g, idx) => {
      let status: RsvpStatus;
      if (idx < confirmTarget) status = "confirmed";
      else if (idx < confirmTarget + pendingTarget) status = "pending";
      else status = "declined";
      rsvps[rsvpKey(g.id, ev.id)] = status;
      // heuristic fix: if this event is farewell_brunch, bias declined higher
      // (already reflected in low confirm target), no op here.
    });
  }

  return { events: SEED_EVENTS, households, guests, rsvps };
}

const SEED = buildSeed();

export const useRsvpStore = create<RsvpStoreState>()(
  persist(
    (set) => ({
      events: SEED.events,
      households: SEED.households,
      guests: SEED.guests,
      rsvps: SEED.rsvps,
      householdNotes: {},

      setRsvp: (guestId, eventId, status) => {
        set((state) => {
          const key = rsvpKey(guestId, eventId);
          const next = { ...state.rsvps };
          if (status === undefined) delete next[key];
          else next[key] = status;
          return { rsvps: next };
        });
        const coupleId = getCurrentCoupleId();
        if (coupleId) {
          if (status === undefined) {
            dbDelete("rsvp_statuses", { couple_id: coupleId, guest_id: guestId, event_id: eventId });
          } else {
            dbUpsert("rsvp_statuses", { couple_id: coupleId, guest_id: guestId, event_id: eventId, status });
          }
        }
      },

      cycleRsvp: (guestId, eventId) => {
        let nextStatus: RsvpStatus | undefined;
        set((state) => {
          const key = rsvpKey(guestId, eventId);
          const current = state.rsvps[key];
          if (current === undefined) return {};
          const order: RsvpStatus[] = ["pending", "confirmed", "declined"];
          const i = order.indexOf(current);
          nextStatus = order[(i + 1) % order.length];
          return { rsvps: { ...state.rsvps, [key]: nextStatus } };
        });
        const coupleId = getCurrentCoupleId();
        if (coupleId && nextStatus !== undefined) {
          dbUpsert("rsvp_statuses", { couple_id: coupleId, guest_id: guestId, event_id: eventId, status: nextStatus });
        }
      },

      setHouseholdStatusForEvent: (householdId, eventId, status) =>
        set((state) => {
          const next = { ...state.rsvps };
          for (const g of state.guests) {
            if (g.householdId !== householdId) continue;
            const key = rsvpKey(g.id, eventId);
            if (next[key] !== undefined) next[key] = status;
          }
          return { rsvps: next };
        }),

      setHouseholdStatusAllEvents: (householdId, status) =>
        set((state) => {
          const next = { ...state.rsvps };
          for (const g of state.guests) {
            if (g.householdId !== householdId) continue;
            for (const ev of state.events) {
              const key = rsvpKey(g.id, ev.id);
              if (next[key] !== undefined) next[key] = status;
            }
          }
          return { rsvps: next };
        }),

      bulkMarkPendingDeclined: (eventId) =>
        set((state) => {
          const next = { ...state.rsvps };
          for (const [key, val] of Object.entries(next)) {
            if (!key.endsWith(`|${eventId}`)) continue;
            if (val === "pending") next[key] = "declined";
          }
          return { rsvps: next };
        }),

      setHouseholdNotes: (householdId, notes) =>
        set((state) => ({
          householdNotes: { ...state.householdNotes, [householdId]: notes },
        })),
    }),
    {
      name: "ananya.rsvp",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

// ── Supabase background sync ─────────────────────────────────────────────
let _rsvpSyncTimer: ReturnType<typeof setTimeout> | null = null;
useRsvpStore.subscribe((state) => {
  if (_rsvpSyncTimer) clearTimeout(_rsvpSyncTimer);
  _rsvpSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { events, households, guests, rsvps } = state;
    // Sync events
    dbReplaceAll("rsvp_events", coupleId, events.map((e) => ({ ...e, couple_id: coupleId })));
    dbReplaceAll("rsvp_households", coupleId, households.map((h) => ({ ...h, couple_id: coupleId })));
    dbReplaceAll("rsvp_guests", coupleId, guests.map((g) => ({ ...g, couple_id: coupleId })));
    // Sync rsvp statuses
    const rsvpRows = Object.entries(rsvps).map(([key, status]) => {
      const [guestId, eventId] = key.split("|");
      return { guest_id: guestId, event_id: eventId, status, couple_id: coupleId };
    });
    dbReplaceAll("rsvp_statuses", coupleId, rsvpRows);
  }, 1500);
});

// ── Selectors ──────────────────────────────────────────────────────────────

export function getEventStats(
  eventId: string,
  guests: RsvpGuest[],
  rsvps: Record<string, RsvpStatus>,
) {
  let confirmed = 0;
  let pending = 0;
  let declined = 0;
  const dietary = { Veg: 0, Jain: 0, "Non-veg": 0, Unspecified: 0 };
  for (const g of guests) {
    const status = rsvps[rsvpKey(g.id, eventId)];
    if (status === undefined) continue;
    if (status === "confirmed") {
      confirmed++;
      if (g.dietary.length === 0) dietary.Unspecified++;
      else {
        // Jain takes precedence over Veg for tallying, since Jain is stricter
        if (g.dietary.includes("Jain")) dietary.Jain++;
        else if (g.dietary.includes("Non-veg")) dietary["Non-veg"]++;
        else if (g.dietary.includes("Veg")) dietary.Veg++;
        else dietary.Unspecified++;
      }
    } else if (status === "pending") pending++;
    else if (status === "declined") declined++;
  }
  const invited = confirmed + pending + declined;
  return { invited, confirmed, pending, declined, dietary };
}
