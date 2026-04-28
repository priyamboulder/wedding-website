import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// TODO: table not yet migrated — no normalized `creators` table exists.
// Creator profiles are stored as a JSONB blob in `creators_state`
// (couple_id PRIMARY KEY, data jsonb). The `couple_id` here is the
// creator's user id.

// GET /api/creators
// Supports ?tier=&verified=true&limit=&offset=
// When no couple_id is supplied, reads all rows and flattens the blobs.

export async function GET(req: NextRequest) {
  const tier = req.nextUrl.searchParams.get("tier");
  const verified = req.nextUrl.searchParams.get("verified");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");

  try {
    const { data, error } = await supabase
      .from("creators_state")
      .select("couple_id, data");

    if (error) throw error;

    // Flatten blobs into creator objects
    let creators = (data ?? [])
      .map((row) => {
        const blob = row.data as Record<string, unknown> | null;
        if (!blob) return null;
        return { creatorId: row.couple_id, ...blob };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    if (tier) {
      creators = creators.filter((c) => (c as Record<string, unknown>).tier === tier);
    }
    if (verified === "true") {
      creators = creators.filter((c) => (c as Record<string, unknown>).isVerified === true);
    }

    const total = creators.length;
    const paged = creators.slice(offset, offset + limit);

    return NextResponse.json({ creators: paged, total, limit, offset });
  } catch (err) {
    console.error("[creators]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
