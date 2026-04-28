import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// PUT /api/notifications/[id]/read
// Body: { couple_id: string }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const couple_id =
      body?.couple_id ??
      searchParams.get("couple_id") ??
      request.headers.get("x-couple-id");

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

    if (!id) {
      return NextResponse.json(
        { error: "notification id is required" },
        { status: 400 },
      );
    }

    const { data, error: fetchError } = await supabase
      .from("couple_notifications")
      .select("notifications")
      .eq("couple_id", couple_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: "DB read failed" }, { status: 500 });
    }

    const allNotifications: any[] = data?.notifications ?? [];

    let found = false;
    const updated = allNotifications.map((n) => {
      if (n.id === id) {
        found = true;
        return { ...n, read: true };
      }
      return n;
    });

    if (!found) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    const { error: upsertError } = await supabase
      .from("couple_notifications")
      .upsert(
        { couple_id, notifications: updated, updated_at: new Date().toISOString() },
        { onConflict: "couple_id" },
      );

    if (upsertError) {
      return NextResponse.json({ error: "DB write failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
