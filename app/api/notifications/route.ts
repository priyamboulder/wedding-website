import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { v4 as uuidv4 } from "uuid";

// GET /api/notifications?couple_id=...&recipient=...&limit=20&offset=0
export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const couple_id =
      searchParams.get("couple_id") ?? request.headers.get("x-couple-id");
    const recipient = searchParams.get("recipient");
    const limit = Number(searchParams.get("limit") ?? "20");
    const offset = Number(searchParams.get("offset") ?? "0");

    if (!couple_id) {
      return NextResponse.json(
        { error: "couple_id is required" },
        { status: 400 },
      );
    }

    // Prevent IDOR: authenticated user may only read their own notifications
    if (couple_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("couple_notifications")
      .select("notifications")
      .eq("couple_id", couple_id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      Sentry.captureException(error);
      return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }

    const allNotifications: any[] = data?.notifications ?? [];

    const filtered = recipient
      ? allNotifications.filter((n) => n.recipient === recipient)
      : allNotifications;

    const total = filtered.length;
    const unread = filtered.filter((n) => n.read === false).length;
    const notifications = filtered.slice(offset, offset + limit);

    return NextResponse.json({ notifications, total, unread });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/notifications
// Body: { couple_id: string, notification: Partial<Notification> }
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { couple_id, notification } = body ?? {};

    if (!couple_id || !notification) {
      return NextResponse.json(
        { error: "couple_id and notification are required" },
        { status: 400 },
      );
    }

    // Prevent IDOR: authenticated user may only post to their own notifications
    if (couple_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch existing notifications
    const { data, error: fetchError } = await supabase
      .from("couple_notifications")
      .select("notifications")
      .eq("couple_id", couple_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: "DB read failed" }, { status: 500 });
    }

    const existing: any[] = data?.notifications ?? [];

    const newNotification = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      read: false,
      ...notification,
    };

    const updated = [newNotification, ...existing];

    const { error: upsertError } = await supabase
      .from("couple_notifications")
      .upsert(
        { couple_id, notifications: updated, updated_at: new Date().toISOString() },
        { onConflict: "couple_id" },
      );

    if (upsertError) {
      return NextResponse.json({ error: "DB write failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, notification: newNotification });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
