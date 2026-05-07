import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const weddingId = req.nextUrl.searchParams.get("weddingId");
  if (!weddingId) {
    return NextResponse.json({ error: "weddingId required" }, { status: 400 });
  }

  // Verify ownership via weddings table
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("couple_id", user.id)
    .maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("brand_systems")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ brandSystem: data });
}

export async function PUT(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { weddingId, id, ...fields } = body as {
    weddingId?: string;
    id?: string;
    [k: string]: unknown;
  };

  if (!weddingId) {
    return NextResponse.json({ error: "weddingId required" }, { status: 400 });
  }

  // Verify ownership
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("couple_id", user.id)
    .maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = { wedding_id: weddingId, ...fields };

  let result;
  if (id) {
    result = await supabase
      .from("brand_systems")
      .update(payload)
      .eq("id", id)
      .eq("wedding_id", weddingId)
      .select()
      .single();
  } else {
    result = await supabase
      .from("brand_systems")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) {
    Sentry.captureException(result.error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ brandSystem: result.data });
}
