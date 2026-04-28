import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import type { CreatorApplication } from "@/types/creator-application";

// GET /api/creator-applications/mine
// Returns the authenticated user's own application from the persistent store.
// The caller identity comes from the JWT — query params are used as filters
// but must match the authenticated user to prevent IDOR.

const PLATFORM_KEY = "__platform__";

export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");

  // Enforce ownership: callers may only request their own application
  if (userId && userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: row, error } = await supabase
    .from("creator_applications_state")
    .select("data")
    .eq("couple_id", PLATFORM_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "DB read failed." },
      { status: 500 },
    );
  }

  const applications: CreatorApplication[] = Array.isArray(row?.data)
    ? (row.data as CreatorApplication[])
    : [];

  const match = applications.find(
    (a) =>
      (email && a.email.toLowerCase() === email.toLowerCase()) ||
      (userId && a.userId === userId),
  );

  if (!match) {
    return NextResponse.json({ application: null }, { status: 404 });
  }
  return NextResponse.json({ application: match });
}
