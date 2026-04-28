import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// PUT /api/notifications/read-all
// Body: { couple_id: string, recipient?: string }
export async function PUT(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { couple_id, recipient } = body ?? {};

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

    const { data, error: fetchError } = await supabase
      .from("couple_notifications")
      .select("notifications")
      .eq("couple_id", couple_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: "DB read failed" }, { status: 500 });
    }

    const allNotifications: any[] = data?.notifications ?? [];

    let marked = 0;
    const updated = allNotifications.map((n) => {
      const matches = recipient ? n.recipient === recipient : true;
      if (matches && !n.read) {
        marked++;
        return { ...n, read: true };
      }
      return n;
    });

    const { error: upsertError } = await supabase
      .from("couple_notifications")
      .upsert(
        { couple_id, notifications: updated, updated_at: new Date().toISOString() },
        { onConflict: "couple_id" },
      );

    if (upsertError) {
      return NextResponse.json({ error: "DB write failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, marked });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
