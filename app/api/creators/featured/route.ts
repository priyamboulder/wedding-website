import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// TODO: table not yet migrated — no normalized `creators` table exists.
// Creator profiles are stored as a JSONB blob in `creators_state`
// (couple_id PRIMARY KEY, data jsonb).

// GET /api/creators/featured
// Returns creators whose tier is "top_creator" or "partner", sorted by
// follower count descending.

const FEATURED_TIERS = new Set(["top_creator", "partner"]);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("creators_state")
      .select("couple_id, data");

    if (error) throw error;

    const featured = (data ?? [])
      .map((row) => {
        const blob = row.data as Record<string, unknown> | null;
        if (!blob) return null;
        return { creatorId: row.couple_id, ...blob };
      })
      .filter(
        (c): c is NonNullable<typeof c> =>
          c !== null && FEATURED_TIERS.has((c as Record<string, unknown>).tier as string),
      )
      .sort(
        (a, b) =>
          Number((b as Record<string, unknown>).followerCount ?? 0) -
          Number((a as Record<string, unknown>).followerCount ?? 0),
      );

    return NextResponse.json({ creators: featured, total: featured.length });
  } catch (err) {
    console.error("[creators/featured]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
