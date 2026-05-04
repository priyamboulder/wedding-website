import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  fetchActiveOrUpcomingSession,
  fetchAllSessionsWithStats,
} from "@/lib/grapevine-ama/queries";

// GET /api/grapevine/sessions
//   ?banner=1   → returns just the live/upcoming session for the banner
//   (default)   → returns all sessions with stats for the archive grid
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const bannerOnly = url.searchParams.get("banner") === "1";

  if (bannerOnly) {
    const session = await fetchActiveOrUpcomingSession(supabase);
    return NextResponse.json({ session });
  }

  const sessions = await fetchAllSessionsWithStats(supabase);
  return NextResponse.json({ sessions });
}
