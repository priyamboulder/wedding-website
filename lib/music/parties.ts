// ── Music parties registry ────────────────────────────────────────────────
// Source of truth for who the parties are in the Music & Entertainment
// workspace. Mirrors lib/catering/parties.ts so the two workspaces stay
// shape-compatible, but kept in its own module so the music surface can
// evolve (e.g. introduce a "sound engineer" role later) without
// perturbing catering state.

import type { MusicParty, MusicPartyId } from "@/types/music";

export const PRIYA_ID = "priya" as const;
export const ARJUN_ID = "arjun" as const;
export const URVASHI_ID = "urvashi" as const;

// The three fixed internal parties. Vendor parties are appended at call
// sites that have access to the vendor store.
export const MUSIC_INTERNAL_PARTIES: MusicParty[] = [
  {
    id: PRIYA_ID,
    initials: "P",
    display_name: "Priya",
    role: "couple",
    tone: "rose",
  },
  {
    id: ARJUN_ID,
    initials: "A",
    display_name: "Arjun",
    role: "couple",
    tone: "sage",
  },
  {
    id: URVASHI_ID,
    initials: "U",
    display_name: "Urvashi",
    role: "planner",
    tone: "ink",
  },
];

// Build a party for a vendor given their id + display name. Vendors
// always render with the gold tone so they read as external.
export function musicVendorParty(vendorId: string, name: string): MusicParty {
  return {
    id: vendorId,
    initials: toInitials(name),
    display_name: name,
    role: "vendor",
    tone: "gold",
  };
}

// Combine internal + vendor parties into one id-keyed lookup table.
export function buildMusicPartyMap(
  vendorNames: Record<string, string>,
): Record<MusicPartyId, MusicParty> {
  const map: Record<MusicPartyId, MusicParty> = {};
  for (const p of MUSIC_INTERNAL_PARTIES) map[p.id] = p;
  for (const [id, name] of Object.entries(vendorNames)) {
    map[id] = musicVendorParty(id, name);
  }
  return map;
}

// Resolve a party id to a display party. Unknown ids fall back to a
// neutral ink-toned party so the UI never crashes on legacy rows.
export function resolveMusicParty(
  id: MusicPartyId,
  vendorNames: Record<string, string> = {},
): MusicParty {
  const internal = MUSIC_INTERNAL_PARTIES.find((p) => p.id === id);
  if (internal) return internal;
  const vendorName = vendorNames[id];
  if (vendorName) return musicVendorParty(id, vendorName);
  return {
    id,
    initials: id.slice(0, 2).toUpperCase(),
    display_name: id,
    role: "vendor",
    tone: "gold",
  };
}

function toInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return "??";
}
