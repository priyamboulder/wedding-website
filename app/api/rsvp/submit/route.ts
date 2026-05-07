import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

// Public endpoint — no auth required.
// External guests use this to submit their RSVP for a published wedding website.

const RsvpSchema = z.object({
  wedding_id: z.string().uuid(),
  guest_name: z.string().min(1).max(255),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional(),
  attending: z.boolean().optional(),
  events: z.array(z.string().max(100)).max(20).optional(),
  dietary: z.string().max(500).optional(),
  message: z.string().max(5000).optional(),
  plus_ones: z.number().int().min(0).max(50).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`rsvp:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { wedding_id, guest_name, email, phone, attending, events, dietary, message, plus_ones } = parsed.data;

  // Verify the wedding exists and is published (or allow always for now)
  const { data: wedding, error: wErr } = await supabase
    .from("weddings")
    .select("id, partner_one, partner_two, website_published")
    .eq("id", wedding_id)
    .maybeSingle();

  if (wErr || !wedding) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  const upsertData: Record<string, unknown> = {
    wedding_id,
    guest_name: guest_name.trim(),
    attending: attending ?? null,
    events: Array.isArray(events) ? events : [],
    plus_ones: typeof plus_ones === "number" ? plus_ones : 0,
    submitted_at: new Date().toISOString(),
  };

  if (email) upsertData.email = email.toLowerCase().trim();
  if (phone) upsertData.phone = phone.trim();
  if (dietary) upsertData.dietary = dietary.trim();
  if (message) upsertData.message = message.trim();

  // If we have an email, upsert (idempotent re-submission)
  let result;
  if (email) {
    result = await supabase
      .from("guest_rsvps")
      .upsert(upsertData, { onConflict: "wedding_id,email" })
      .select()
      .single();
  } else {
    result = await supabase.from("guest_rsvps").insert(upsertData).select().single();
  }

  if (result.error) {
    Sentry.captureException(result.error);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      rsvp: result.data,
      couple: `${wedding.partner_one} & ${wedding.partner_two}`,
    },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  const weddingId = req.nextUrl.searchParams.get("weddingId");
  if (!weddingId) return NextResponse.json({ error: "weddingId required" }, { status: 400 });

  // Verify the authenticated user owns this wedding before returning guest PII
  const { data: wedding, error: wErr } = await supabase
    .from("weddings")
    .select("couple_id")
    .eq("id", weddingId)
    .maybeSingle();

  if (wErr || !wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  if (wedding.couple_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("guest_rsvps")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("submitted_at", { ascending: false });

  if (error) { Sentry.captureException(error); return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 }); }
  return NextResponse.json({ rsvps: data ?? [], total: data?.length ?? 0 });
}
