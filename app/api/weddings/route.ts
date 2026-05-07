import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

const CreateWeddingSchema = z.object({
  partner_one: z.string().min(1).max(100),
  partner_two: z.string().min(1).max(100),
  wedding_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  venue: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  guest_count: z.number().int().min(0).max(10000).optional(),
  hashtag: z.string().max(100).optional(),
});

const PatchWeddingSchema = z.object({
  id: z.string().uuid(),
  partner_one: z.string().min(1).max(100).optional(),
  partner_two: z.string().min(1).max(100).optional(),
  wedding_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  venue: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  guest_count: z.number().int().min(0).max(10000).optional(),
  hashtag: z.string().max(100).optional(),
  website_published: z.boolean().optional(),
  status: z.enum(["planning", "active", "completed", "cancelled"]).optional(),
});

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("couple_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ weddings: data ?? [] });
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

  const parsed = CreateWeddingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 422 });
  }

  const { partner_one, partner_two, wedding_date, venue, city, guest_count, hashtag } = parsed.data;

  const slug = `${partner_one.toLowerCase().replace(/\s+/g, "-")}-and-${partner_two.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

  const { data, error } = await supabase
    .from("weddings")
    .insert({
      couple_id: user.id,
      slug,
      partner_one,
      partner_two,
      wedding_date: wedding_date ?? null,
      venue: venue ?? null,
      city: city ?? null,
      guest_count: guest_count ?? 0,
      hashtag: hashtag ?? null,
    })
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patchParsed = PatchWeddingSchema.safeParse(body);
  if (!patchParsed.success) {
    return NextResponse.json({ error: patchParsed.error.issues[0]?.message ?? "Invalid input" }, { status: 422 });
  }

  const { id, ...fields } = patchParsed.data;

  const { data, error } = await supabase
    .from("weddings")
    .update(fields)
    .eq("id", id)
    .eq("couple_id", user.id)
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

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("weddings")
    .delete()
    .eq("id", id)
    .eq("couple_id", user.id);

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
