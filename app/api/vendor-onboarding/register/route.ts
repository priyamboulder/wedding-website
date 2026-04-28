import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { sendEmail } from "@/lib/email/resend";
import { vendorOnboardingEmail } from "@/lib/email/templates";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  bio: z.string().min(1, "Bio is required"),
  phone: z.string().min(1, "Phone is required"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Validation failed" },
      { status: 422 },
    );
  }

  const { name, email, password, category, location, bio, phone } = parsed.data;

  // Create the auth user via service-role admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: "vendor" },
    email_confirm: true,
  });

  if (authError || !authData?.user) {
    const msg = authError?.message ?? "Failed to create account";
    // Surface recognisable errors clearly
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    if (msg.toLowerCase().includes("password")) {
      return NextResponse.json({ error: msg }, { status: 422 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const userId = authData.user.id;

  // Insert vendor profile row
  const { data: vendorData, error: vendorError } = await supabase
    .from("vendors")
    .insert({
      name,
      category,
      location,
      bio,
      contact: { phone, email },
      auth_user_id: userId,
      email,
      style_tags: [],
      images: [],
      rating: 0,
      review_count: 0,
    })
    .select("id")
    .single();

  if (vendorError || !vendorData) {
    // Roll back the auth user to avoid orphaned accounts
    await supabase.auth.admin.deleteUser(userId);
    const msg = vendorError?.message ?? "Failed to create vendor profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const vendorId = vendorData.id;

  // Fire-and-forget welcome email
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const emailPayload = vendorOnboardingEmail({
    vendorName: name,
    loginLink: `${APP_URL}/vendor/login`,
  });
  sendEmail({ to: email, ...emailPayload }).catch(() => {
    // Silently swallow — email is non-critical
  });

  return NextResponse.json({ ok: true, vendorId, userId }, { status: 201 });
}
