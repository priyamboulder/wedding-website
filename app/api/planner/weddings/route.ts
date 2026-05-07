import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

async function getPlannerId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("planner_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const plannerId = await getPlannerId(user.id);
  if (!plannerId) return NextResponse.json({ weddings: [] });

  const { data, error } = await supabase
    .from("planner_weddings")
    .select("*")
    .eq("planner_id", plannerId)
    .order("wedding_date", { ascending: true });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ weddings: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const plannerId = await getPlannerId(user.id);
  if (!plannerId) return NextResponse.json({ error: "No planner profile found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { couple_name, ...fields } = body as { couple_name?: string; [k: string]: unknown };
  if (!couple_name?.trim()) {
    return NextResponse.json({ error: "couple_name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("planner_weddings")
    .insert({ planner_id: plannerId, couple_name: couple_name.trim(), ...fields })
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ wedding: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const plannerId = await getPlannerId(user.id);
  if (!plannerId) return NextResponse.json({ error: "No planner profile found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, ...fields } = body as { id?: string; [k: string]: unknown };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("planner_weddings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("planner_id", plannerId)
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ wedding: data });
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const plannerId = await getPlannerId(user.id);
  if (!plannerId) return NextResponse.json({ error: "No planner profile found" }, { status: 404 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("planner_weddings")
    .delete()
    .eq("id", id)
    .eq("planner_id", plannerId);

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
