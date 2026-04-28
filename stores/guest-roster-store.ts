// ── Guest Roster (cross-workspace) ────────────────────────────────────────
// A lightweight shared roster that any workspace can pull from — used by
// Family Roles (Pandit workspace) to auto-complete name + relationship from
// the couple's actual family list without re-entry.
//
// The Guests page has a much richer structure (households, flights, dietary,
// etc.) stored in component state. This store is intentionally a simpler
// shared projection — just "who's on the list with what relationship and
// contact handle" — so other workspaces can build on it without coupling
// to the guests page internals.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, dbLoadAll, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export type RosterSide = "brides" | "grooms" | "shared" | "other";
export const ROSTER_SIDE_LABEL: Record<RosterSide, string> = {
  brides: "Bride's side",
  grooms: "Groom's side",
  shared: "Shared",
  other: "Other",
};

export interface GuestRosterEntry {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string; // "Bride's father" etc.
  side: RosterSide;
  phone?: string;
  email?: string;
  notes?: string;
}

const rid = () =>
  `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Seed roster — mirrors the names used elsewhere in the Priya-and-Arjun
// demo data so the autocomplete finds them on first launch.
const SEED_ROSTER: GuestRosterEntry[] = [
  {
    id: "guest-rajesh-shah",
    first_name: "Rajesh",
    last_name: "Shah",
    relationship: "Bride's father",
    side: "brides",
    phone: "+1 (415) 555-0112",
    email: "rajesh.shah@example.com",
  },
  {
    id: "guest-anita-shah",
    first_name: "Anita",
    last_name: "Shah",
    relationship: "Bride's mother",
    side: "brides",
    phone: "+1 (415) 555-0113",
    email: "anita.shah@example.com",
  },
  {
    id: "guest-rohan-shah",
    first_name: "Rohan",
    last_name: "Shah",
    relationship: "Bride's brother",
    side: "brides",
    phone: "+1 (415) 555-0114",
  },
  {
    id: "guest-kabir-mehta",
    first_name: "Kabir",
    last_name: "Mehta",
    relationship: "Bride's cousin",
    side: "brides",
  },
  {
    id: "guest-kamla-ben",
    first_name: "Kamla-ben",
    last_name: "Shah",
    relationship: "Bride's grandmother (dadi)",
    side: "brides",
  },
  {
    id: "guest-prakash-kaka",
    first_name: "Prakash",
    last_name: "Shah",
    relationship: "Bride's uncle (kaka)",
    side: "brides",
  },
  {
    id: "guest-meena-mami",
    first_name: "Meena",
    last_name: "Shah",
    relationship: "Bride's aunt (mami)",
    side: "brides",
  },
  {
    id: "guest-meera-shah",
    first_name: "Meera",
    last_name: "Shah",
    relationship: "Bride's cousin",
    side: "brides",
  },
  {
    id: "guest-vijay-kapoor",
    first_name: "Vijay",
    last_name: "Kapoor",
    relationship: "Groom's father",
    side: "grooms",
    phone: "+1 (415) 555-0122",
    email: "vijay.kapoor@example.com",
  },
  {
    id: "guest-sameer-kapoor",
    first_name: "Sameer",
    last_name: "Kapoor",
    relationship: "Groom's uncle",
    side: "grooms",
  },
  {
    id: "guest-priya-kapoor",
    first_name: "Priya",
    last_name: "Kapoor",
    relationship: "Groom's sister",
    side: "grooms",
    phone: "+1 (415) 555-0124",
  },
  {
    id: "guest-dadaji-kapoor",
    first_name: "Dadaji",
    last_name: "Kapoor",
    relationship: "Groom's grandfather (dadaji)",
    side: "grooms",
  },
  {
    id: "guest-dadiji-kapoor",
    first_name: "Dadiji",
    last_name: "Kapoor",
    relationship: "Groom's grandmother (dadiji)",
    side: "grooms",
  },
  {
    id: "guest-vinod-chacha",
    first_name: "Vinod",
    last_name: "Kapoor",
    relationship: "Groom's uncle (chacha)",
    side: "grooms",
  },
  {
    id: "guest-rekha-bua",
    first_name: "Rekha",
    last_name: "Kapoor",
    relationship: "Groom's aunt (bua)",
    side: "grooms",
  },
];

interface GuestRosterState {
  entries: GuestRosterEntry[];
  addEntry: (entry: Omit<GuestRosterEntry, "id">) => GuestRosterEntry;
  updateEntry: (id: string, patch: Partial<GuestRosterEntry>) => void;
  removeEntry: (id: string) => void;
  findById: (id: string) => GuestRosterEntry | undefined;
  search: (query: string, side?: RosterSide) => GuestRosterEntry[];
  loadFromDB: () => Promise<void>;
}

export const useGuestRosterStore = create<GuestRosterState>()(
  persist(
    (set, get) => ({
      entries: SEED_ROSTER,
      addEntry: (entry) => {
        const record: GuestRosterEntry = { id: rid(), ...entry };
        set((s) => ({ entries: [...s.entries, record] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("guest_roster", { ...record, couple_id: coupleId });
        return record;
      },
      updateEntry: (id, patch) => {
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("guest_roster", { id, couple_id: coupleId, ...patch });
      },
      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("guest_roster", { id, couple_id: coupleId });
      },
      findById: (id) => get().entries.find((e) => e.id === id),
      search: (query, side) => {
        const q = query.trim().toLowerCase();
        const list = get().entries;
        const scoped = side ? list.filter((e) => e.side === side) : list;
        if (!q) return scoped.slice(0, 12);
        return scoped
          .filter((e) => {
            const haystack =
              `${e.first_name} ${e.last_name} ${e.relationship}`.toLowerCase();
            return haystack.includes(q);
          })
          .slice(0, 12);
      },

      loadFromDB: async () => {
        const coupleId = getCurrentCoupleId();
        if (!coupleId) return;
        const rows = await dbLoadAll("guest_roster", coupleId);
        if (rows.length === 0) return;
        const dbEntries = rows as unknown as GuestRosterEntry[];
        set((s) => {
          const base = s.entries.map((e) => {
            const row = dbEntries.find((r) => r.id === e.id);
            return row ? { ...e, ...row } : e;
          });
          const fresh = dbEntries.filter((r) => !s.entries.some((e) => e.id === r.id));
          return { entries: [...base, ...fresh] };
        });
      },
    }),
    {
      name: "ananya.guest-roster",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);
