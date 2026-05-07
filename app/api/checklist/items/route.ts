import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

const UpsertItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(500).optional(),
  phase_id: z.string().max(100).optional(),
  status: z.enum(["pending", "in-progress", "done", "snoozed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(5000).optional(),
}).passthrough();

const PatchItemSchema = z.object({
  id: z.string().min(1, "id required"),
}).passthrough();

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("couple_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
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

  const upsertParsed = UpsertItemSchema.safeParse(body);
  if (!upsertParsed.success) {
    return NextResponse.json({ error: upsertParsed.error.issues[0]?.message ?? "Invalid input" }, { status: 422 });
  }

  const { id, ...fields } = upsertParsed.data as { id?: string; [k: string]: unknown };

  let result;
  if (id) {
    // Upsert if id provided
    result = await supabase
      .from("checklist_items")
      .upsert({ id, couple_id: user.id, ...fields })
      .select()
      .single();
  } else {
    result = await supabase
      .from("checklist_items")
      .insert({ couple_id: user.id, ...fields })
      .select()
      .single();
  }

  if (result.error) {
    Sentry.captureException(result.error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ item: result.data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, ...fields } = body as { id?: string; [k: string]: unknown };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("checklist_items")
    .update(fields)
    .eq("id", id)
    .eq("couple_id", user.id)
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", id)
    .eq("couple_id", user.id);

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
