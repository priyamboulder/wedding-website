import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

async function verifyWeddingOwner(weddingId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("couple_id", userId)
    .maybeSingle();
  return !!data;
}

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const weddingId = req.nextUrl.searchParams.get("weddingId");
  const kind = req.nextUrl.searchParams.get("kind");

  if (!weddingId) {
    return NextResponse.json({ error: "weddingId required" }, { status: 400 });
  }

  if (!(await verifyWeddingOwner(weddingId, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let query = supabase
    .from("studio_designs")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("updated_at", { ascending: false });

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ designs: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { weddingId, ...fields } = body as { weddingId?: string; [k: string]: unknown };
  if (!weddingId) {
    return NextResponse.json({ error: "weddingId required" }, { status: 400 });
  }

  if (!(await verifyWeddingOwner(weddingId, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("studio_designs")
    .insert({ wedding_id: weddingId, ...fields })
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ design: data }, { status: 201 });
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

  const { id, weddingId, ...fields } = body as {
    id?: string;
    weddingId?: string;
    [k: string]: unknown;
  };

  if (!id || !weddingId) {
    return NextResponse.json({ error: "id and weddingId required" }, { status: 400 });
  }

  if (!(await verifyWeddingOwner(weddingId, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("studio_designs")
    .update(fields)
    .eq("id", id)
    .eq("wedding_id", weddingId)
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ design: data });
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const id = req.nextUrl.searchParams.get("id");
  const weddingId = req.nextUrl.searchParams.get("weddingId");

  if (!id || !weddingId) {
    return NextResponse.json({ error: "id and weddingId required" }, { status: 400 });
  }

  if (!(await verifyWeddingOwner(weddingId, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("studio_designs")
    .delete()
    .eq("id", id)
    .eq("wedding_id", weddingId);

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
