import { NextResponse } from "next/server";
import {
  SEED_CREATORS,
  SEED_COLLECTIONS,
  SEED_PICKS,
} from "@/lib/creators/seed";

// GET /api/partnerships/directory
// Creator directory for vendors. Returns each creator with audience stats
// (follower count, collections, avg picks per collection, tier) so the
// vendor can size them up before sending a proposal.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier");
  const minFollowers = Number(searchParams.get("minFollowers") ?? "0");
  const maxFollowers = Number(searchParams.get("maxFollowers") ?? "10000000");
  const expertise = searchParams.get("expertise");
  const search = (searchParams.get("search") ?? "").toLowerCase().trim();
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");

  let filtered = SEED_CREATORS;
  if (tier) filtered = filtered.filter((c) => c.tier === tier);
  filtered = filtered.filter(
    (c) =>
      c.followerCount >= minFollowers && c.followerCount <= maxFollowers,
  );
  if (expertise) {
    filtered = filtered.filter((c) =>
      c.specialties.some((s) =>
        s.toLowerCase().includes(expertise.toLowerCase()),
      ),
    );
  }
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.displayName.toLowerCase().includes(search) ||
        c.handle.toLowerCase().includes(search),
    );
  }

  const paged = filtered.slice(offset, offset + limit);

  const enriched = paged.map((c) => {
    const cols = SEED_COLLECTIONS.filter((col) => col.creatorId === c.id);
    const picks = SEED_PICKS.filter((p) =>
      cols.some((col) => col.id === p.collectionId),
    );
    const avgPicksPerCollection =
      cols.length === 0 ? 0 : Math.round((picks.length / cols.length) * 10) / 10;
    return {
      ...c,
      collectionCount: cols.length,
      pickCount: picks.length,
      avgPicksPerCollection,
      // Mocked engagement: derive a stable, reasonable-looking number from
      // follower count + tier so the UI has something to show.
      engagementRate:
        c.tier === "top_creator" ? 0.082 : c.tier === "rising" ? 0.064 : 0.045,
    };
  });

  return NextResponse.json({
    creators: enriched,
    total: filtered.length,
    limit,
    offset,
  });
}
