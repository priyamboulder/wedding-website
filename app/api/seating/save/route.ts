import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyStr = JSON.stringify(body);
  if (bodyStr.length > 2_000_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const { wedding_id, event_id, assignments, table_zones, strategy } = body as {
    wedding_id?: string;
    event_id?: string;
    assignments?: Record<string, string>;
    table_zones?: Record<string, string>;
    strategy?: string;
  };

  if (!wedding_id) return NextResponse.json({ error: "wedding_id required" }, { status: 400 });

  const { data: wedding } = await supabase
    .from("weddings")
    .select("couple_id")
    .eq("id", wedding_id)
    .maybeSingle();
  if (!wedding || wedding.couple_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("seating_assignments")
    .upsert(
      {
        couple_id: user.id,
        wedding_id,
        event_id: event_id ?? null,
        assignments: assignments ?? {},
        table_zones: table_zones ?? {},
        strategy: strategy ?? "family_first",
        saved_at: new Date().toISOString(),
      },
      { onConflict: "couple_id,wedding_id,event_id" },
    )
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, seating: data });
}

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const weddingId = req.nextUrl.searchParams.get("weddingId");
  if (!weddingId) return NextResponse.json({ error: "weddingId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("seating_assignments")
    .select("*")
    .eq("couple_id", user.id)
    .eq("wedding_id", weddingId)
    .order("saved_at", { ascending: false });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ seatings: data ?? [] });
}
