import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

// ── Auth helper ───────────────────────────────────────────────────────────────

async function resolveUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return { user: null, error: "Unauthorized" };

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { user: null, error: "Unauthorized" };
  return { user, error: null };
}

// ── GET /api/vendor-onboarding/profile ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error } = await resolveUser(req);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (vendorError) {
    if (vendorError.code === "PGRST116") {
      // No row found — try matching on contact email as a fallback
      const { data: vendorByEmail, error: byEmailError } = await supabase
        .from("vendors")
        .select("*")
        .eq("email", user.email ?? "")
        .single();

      if (byEmailError || !vendorByEmail) {
        return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
      }

      return NextResponse.json({ vendor: vendorByEmail });
    }
    return NextResponse.json({ error: vendorError.message }, { status: 500 });
  }

  return NextResponse.json({ vendor });
}

// ── PATCH /api/vendor-onboarding/profile ─────────────────────────────────────

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  style_tags: z.array(z.string()).optional(),
  phone: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const { user, error } = await resolveUser(req);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Validation failed" },
      { status: 422 },
    );
  }

  const { phone, ...rest } = parsed.data;

  // Build the update payload
  const updates: Record<string, unknown> = { ...rest };

  // If phone is being updated, merge it into the contact jsonb field
  if (phone !== undefined) {
    // Fetch existing contact to preserve email
    const { data: existing } = await supabase
      .from("vendors")
      .select("contact")
      .eq("auth_user_id", user.id)
      .single();

    const existingContact = (existing?.contact as Record<string, unknown>) ?? {};
    updates.contact = { ...existingContact, phone };
  }

  const { data: updated, error: updateError } = await supabase
    .from("vendors")
    .update(updates)
    .eq("auth_user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ vendor: updated });
}
