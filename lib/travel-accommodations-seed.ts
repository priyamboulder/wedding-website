// ── Travel & Accommodations — shared room block records ───────────────────
// Single source of truth for hotel room blocks. Referenced from two places:
//
//   1. Guest module (`app/guests/page.tsx`) — each guest's `hotelId` is a
//      foreign key into this list (see `HotelBlockId`). The guest module
//      owns the detailed per-guest assignment (room number, roommate,
//      check-in/out, requests).
//
//   2. Travel & Accommodations vendor workspace — surfaces the vendor-side
//      contract/relationship data (rate, contracted rooms, cutoff,
//      attrition) plus a read-only summary of guest utilization.
//
// The vendor workspace must not duplicate per-guest state. It only shows
// utilization counts (rooms assigned / contracted).

export type HotelBlockId = string;

export interface HotelRoomBlock {
  id: HotelBlockId;
  name: string;
  rate: string;
  // Contracted room count in the block. Compared against `assignedCount`
  // (derived from guest assignments) to show utilization on the vendor
  // workspace.
  rooms: number;
  distance: string;
  bookingCutoff: string;
  // Vendor-side-only. Not shown in the guest module.
  contractStatus?: "negotiating" | "signed" | "countersigned";
  attritionClause?: string;
  contactName?: string;
  contactEmail?: string;
}

export const HOTEL_ROOM_BLOCKS: HotelRoomBlock[] = [
  {
    id: "taj",
    name: "The Taj Mahal Palace",
    rate: "₹24,500 / night",
    rooms: 28,
    distance: "Main venue",
    bookingCutoff: "May 20",
    contractStatus: "signed",
    attritionClause: "80% pickup by cutoff; attrition billed at 50% of rate",
    contactName: "Rohit Nair",
    contactEmail: "rohit.nair@tajhotels.com",
  },
  {
    id: "trident",
    name: "Trident Nariman Point",
    rate: "₹18,200 / night",
    rooms: 22,
    distance: "0.8 km",
    bookingCutoff: "May 22",
    contractStatus: "signed",
    attritionClause: "75% pickup by cutoff; attrition billed at 40% of rate",
    contactName: "Priya Menon",
    contactEmail: "priya.menon@trident.com",
  },
  {
    id: "oberoi",
    name: "The Oberoi Mumbai",
    rate: "₹26,800 / night",
    rooms: 12,
    distance: "1.2 km",
    bookingCutoff: "May 20",
    contractStatus: "negotiating",
    attritionClause: "Pending — 75/25 split under discussion",
    contactName: "Kavitha Rao",
    contactEmail: "kavitha.rao@oberoigroup.com",
  },
];

// ── Utilization lookup ─────────────────────────────────────────────────────
// Vendor workspace shows "N rooms assigned / X contracted" per block. The
// Guest module still owns full assignment detail — this projection is
// count-only.
//
// Two helpers:
//   • countAssignedPerBlock — live aggregation from guest records. Use
//     when a guest store or fetched list is available.
//   • SEED_ROOM_BLOCK_UTILIZATION — frozen counts derived from the guest
//     seed data in `app/guests/page.tsx`. Used by the Travel workspace
//     today because the guest module persists to in-page state, not to a
//     shared store yet. Replace with a live call when a guest store
//     lands.

export function countAssignedPerBlock(
  guestsWithHotel: Iterable<{ hotelId?: string | null }>,
): Record<HotelBlockId, number> {
  const out: Record<HotelBlockId, number> = Object.fromEntries(
    HOTEL_ROOM_BLOCKS.map((b) => [b.id, 0]),
  );
  for (const g of guestsWithHotel) {
    if (g.hotelId && out[g.hotelId] != null) out[g.hotelId] += 1;
  }
  return out;
}

export const SEED_ROOM_BLOCK_UTILIZATION: Record<HotelBlockId, number> = {
  taj: 11,
  trident: 16,
  oberoi: 13,
};
