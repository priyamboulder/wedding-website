// Guest coverage analysis — for every tagged guest in the album's photo pool,
// determine whether they appear in a placed spread, how often, and whether
// they're a VIP. Drives the coverage drawer and the "+ Add to album" fix.
//
// Guest names come from `AlbumPhoto.guestTags[]`. VIP prefixes are
// "VIP:<name>" — matching the convention set by the Photography module's
// group-shots / VIP flags (which this prototype reads via tags only).

import type { AlbumPhoto, AlbumProject, AlbumSpread } from "@/types/album";

export type GuestCoverageStatus = "included" | "missing_with_photos" | "missing_no_photos";

export interface GuestCoverageEntry {
  guest: string;
  isVip: boolean;
  status: GuestCoverageStatus;
  // Placed-photo count for this guest across the album.
  photoCount: number;
  // Spread positions (0-indexed) they appear on.
  spreadPositions: number[];
  // Total photos featuring this guest that exist in the pool (whether placed
  // or not). Used to say "3 photos in pool (not placed)".
  poolPhotoCount: number;
}

export interface GuestCoverageReport {
  total: number;
  included: number;
  missing: number;
  missingVip: GuestCoverageEntry[];
  entries: GuestCoverageEntry[];
}

function normalizeGuest(raw: string): { name: string; isVip: boolean } {
  if (raw.startsWith("VIP:")) return { name: raw.slice(4).trim(), isVip: true };
  return { name: raw.trim(), isVip: false };
}

export function analyzeCoverage(album: AlbumProject): GuestCoverageReport {
  const { photo_pool, spreads } = album;

  // Collect every guest mentioned, keyed by normalised name. VIPness sticks.
  const guestMap = new Map<string, { isVip: boolean }>();
  photo_pool.forEach((p) => {
    p.guestTags?.forEach((tag) => {
      const { name, isVip } = normalizeGuest(tag);
      if (!name) return;
      const existing = guestMap.get(name);
      guestMap.set(name, { isVip: Boolean(existing?.isVip || isVip) });
    });
  });

  // For each guest, count pool vs. placed occurrences.
  const placedBySpread = new Map<string, Set<string>>(); // guest → set(spread position)
  const placedCount = new Map<string, number>();
  const poolCount = new Map<string, number>();

  const placedPhotoIds = new Set<string>();
  spreads.forEach((sp, i) => {
    sp.slots.forEach((sl) => {
      if (!sl.photo_id) return;
      placedPhotoIds.add(sl.photo_id);
      const photo = photo_pool.find((p) => p.id === sl.photo_id);
      photo?.guestTags?.forEach((tag) => {
        const { name } = normalizeGuest(tag);
        if (!name) return;
        placedCount.set(name, (placedCount.get(name) ?? 0) + 1);
        const set = placedBySpread.get(name) ?? new Set();
        set.add(String(sp.position ?? i));
        placedBySpread.set(name, set);
      });
    });
  });

  photo_pool.forEach((p) => {
    p.guestTags?.forEach((tag) => {
      const { name } = normalizeGuest(tag);
      if (!name) return;
      poolCount.set(name, (poolCount.get(name) ?? 0) + 1);
    });
  });

  const entries: GuestCoverageEntry[] = [...guestMap.entries()]
    .map(([name, meta]) => {
      const photoCount = placedCount.get(name) ?? 0;
      const pc = poolCount.get(name) ?? 0;
      const spreadPositions = [...(placedBySpread.get(name) ?? [])]
        .map((s) => Number(s))
        .sort((a, b) => a - b);
      let status: GuestCoverageStatus = "included";
      if (photoCount === 0) {
        status = pc === 0 ? "missing_no_photos" : "missing_with_photos";
      }
      return { guest: name, isVip: meta.isVip, status, photoCount, spreadPositions, poolPhotoCount: pc };
    })
    .sort((a, b) => {
      // VIPs first, then missing-with-photos, then included (by count desc).
      if (a.isVip !== b.isVip) return a.isVip ? -1 : 1;
      if (a.status !== b.status) {
        const order: GuestCoverageStatus[] = ["missing_with_photos", "missing_no_photos", "included"];
        return order.indexOf(a.status) - order.indexOf(b.status);
      }
      return b.photoCount - a.photoCount;
    });

  const included = entries.filter((e) => e.status === "included").length;
  const missing = entries.length - included;
  const missingVip = entries.filter((e) => e.isVip && e.status !== "included");

  return { total: entries.length, included, missing, missingVip, entries };
}

// Choose the best spread + slot to add a missing guest to. Preference order:
//   1. An empty slot in an existing spread (filling blanks is cheap).
//   2. Swap a photo on a spread with the most duplicative guest coverage.
// Returns the target and the source photo to place there, or null if no pool
// photo of the guest exists.
export function planAddMissingGuest(
  album: AlbumProject,
  guestName: string,
): { spread: AlbumSpread; slotId: string; photoId: string } | null {
  const pool = album.photo_pool.filter((p) =>
    p.guestTags?.some((tag) => normalizeGuest(tag).name === guestName),
  );
  if (pool.length === 0) return null;

  const placedPhotoIds = new Set<string>();
  album.spreads.forEach((sp) => sp.slots.forEach((sl) => sl.photo_id && placedPhotoIds.add(sl.photo_id)));
  const candidates = pool.filter((p) => !placedPhotoIds.has(p.id));
  const bestPhoto = (candidates[0] ?? pool[0]) as AlbumPhoto | undefined;
  if (!bestPhoto) return null;

  // Pass 1: find an empty slot.
  for (const sp of album.spreads) {
    const empty = sp.slots.find((sl) => !sl.photo_id);
    if (empty) return { spread: sp, slotId: empty.id, photoId: bestPhoto.id };
  }

  // Pass 2: find a slot whose current photo has maximum duplicative guest
  // coverage (i.e., every guest on it is also on another spread).
  let best: { spread: AlbumSpread; slotId: string; score: number } | null = null;
  for (const sp of album.spreads) {
    for (const sl of sp.slots) {
      if (!sl.photo_id) continue;
      const photo = album.photo_pool.find((p) => p.id === sl.photo_id);
      if (!photo) continue;
      const guests = photo.guestTags?.map((t) => normalizeGuest(t).name) ?? [];
      const duplicative = guests.filter((g) => {
        // Is this guest on any OTHER placed photo?
        return album.spreads.some((sp2) =>
          sp2.slots.some((sl2) => {
            if (sl2.id === sl.id) return false;
            if (!sl2.photo_id) return false;
            const p2 = album.photo_pool.find((x) => x.id === sl2.photo_id);
            return p2?.guestTags?.some((t) => normalizeGuest(t).name === g);
          }),
        );
      }).length;
      const score = duplicative - (sp.is_section_divider ? 10 : 0);
      if (!best || score > best.score) {
        best = { spread: sp, slotId: sl.id, score };
      }
    }
  }

  if (best) return { spread: best.spread, slotId: best.slotId, photoId: bestPhoto.id };
  return null;
}
