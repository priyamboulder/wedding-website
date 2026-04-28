import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// GET /api/notifications/unread-count?couple_id=...&recipient=...
export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const couple_id =
      searchParams.get("couple_id") ?? request.headers.get("x-couple-id");
    const recipient = searchParams.get("recipient");

    if (!couple_id) {
      return NextResponse.json(
        { error: "couple_id is required" },
        { status: 400 },
      );
    }

    // Prevent IDOR
    if (couple_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("couple_notifications")
      .select("notifications")
      .eq("couple_id", couple_id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "DB read failed" }, { status: 500 });
    }

    const allNotifications: any[] = data?.notifications ?? [];

    const filtered = recipient
      ? allNotifications.filter((n) => n.recipient === recipient)
      : allNotifications;

    const unreadCount = filtered.filter((n) => n.read === false).length;

    return NextResponse.json({ unreadCount, recipient });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
