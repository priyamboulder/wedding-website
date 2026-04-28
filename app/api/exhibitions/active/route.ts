import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/exhibitions/active
// Returns a unified feed of currently-active exhibitions from the
// exhibitions_state JSONB blob (migration 0012). The blob's data column
// is expected to hold an object with a "exhibitions" array; each entry
// already carries a "kind", "startsAt", "endsAt", and "status" field.
// Falls back to an empty list if no row exists yet.

export async function GET() {
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: row, error } = await supabase
    .from("exhibitions_state")
    .select("data")
    .eq("couple_id", "__platform__")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "DB read failed." },
      { status: 500 },
    );
  }

  // data may be an array directly or { exhibitions: [...] }
  let allExhibitions: unknown[] = [];
  if (row?.data) {
    if (Array.isArray(row.data)) {
      allExhibitions = row.data as unknown[];
    } else if (
      typeof row.data === "object" &&
      row.data !== null &&
      Array.isArray((row.data as Record<string, unknown>).exhibitions)
    ) {
      allExhibitions = (row.data as Record<string, unknown>).exhibitions as unknown[];
    }
  }

  // Keep only items whose window is currently active
  const active = allExhibitions.filter((e) => {
    const ex = e as Record<string, unknown>;
    const starts = ex.startsAt ? new Date(ex.startsAt as string) : null;
    const ends = ex.endsAt ? new Date(ex.endsAt as string) : null;
    const statusOk =
      !ex.status || ex.status === "live" || ex.status === "active";
    const windowOk =
      (!starts || starts <= now) && (!ends || ends >= now);
    return statusOk && windowOk;
  });

  return NextResponse.json({ activeAt: nowIso, exhibitions: active });
}
