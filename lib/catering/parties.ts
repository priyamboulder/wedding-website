// ── Parties registry ──────────────────────────────────────────────────────
// Single source of truth for who the "parties" in the catering workspace
// are: the couple (Priya + Arjun), the planner (Urvashi), and whichever
// vendors are active. Vendor parties are synthesized on read from the
// vendors store so they stay in sync with shortlist / directory state.

import type { Party, PartyId } from "@/types/catering";

export const PRIYA_ID = "priya" as const;
export const ARJUN_ID = "arjun" as const;
export const URVASHI_ID = "urvashi" as const;

// Couple + planner — the three internal parties. Vendors are appended
// dynamically at call sites that have access to the vendors store.
export const INTERNAL_PARTIES: Party[] = [
  {
    id: PRIYA_ID,
    initials: "PR",
    display_name: "Priya",
    role: "couple",
    tone: "saffron",
  },
  {
    id: ARJUN_ID,
    initials: "AR",
    display_name: "Arjun",
    role: "couple",
    tone: "rose",
  },
  {
    id: URVASHI_ID,
    initials: "UR",
    display_name: "Urvashi",
    role: "planner",
    tone: "ink",
  },
];

// Build a party for a vendor given their id + display name. Vendors
// render with the sage tone so they read as external but not hostile.
export function vendorParty(vendorId: string, name: string): Party {
  return {
    id: vendorId,
    initials: toInitials(name),
    display_name: name,
    role: "vendor",
    tone: "sage",
  };
}

// Combine internal parties + vendor parties into one lookup table the
// components can use to render avatar clusters.
export function buildPartyMap(
  vendorNames: Record<string, string>,
): Record<PartyId, Party> {
  const map: Record<PartyId, Party> = {};
  for (const p of INTERNAL_PARTIES) map[p.id] = p;
  for (const [id, name] of Object.entries(vendorNames)) {
    map[id] = vendorParty(id, name);
  }
  return map;
}

// Resolve a party id to its display party. Unknown ids fall back to a
// generic "guest" so the UI never crashes on legacy data.
export function resolveParty(
  id: PartyId,
  vendorNames: Record<string, string>,
): Party {
  const internal = INTERNAL_PARTIES.find((p) => p.id === id);
  if (internal) return internal;
  const vendorName = vendorNames[id];
  if (vendorName) return vendorParty(id, vendorName);
  return {
    id,
    initials: id.slice(0, 2).toUpperCase(),
    display_name: id,
    role: "vendor",
    tone: "ink",
  };
}

function toInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return "??";
}
