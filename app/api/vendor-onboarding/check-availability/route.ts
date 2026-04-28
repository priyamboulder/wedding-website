import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/vendor-onboarding/check-availability?email=...
// Returns { available: true } if the email is not yet registered as a vendor.

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email query parameter is required" },
      { status: 400 },
    );
  }

  // Check the dedicated email column first (fastest, indexed)
  const { data: byEmailCol, error: colError } = await supabase
    .from("vendors")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (colError) {
    return NextResponse.json({ error: colError.message }, { status: 500 });
  }

  if (byEmailCol) {
    return NextResponse.json({ available: false });
  }

  // Also check the contact jsonb field for legacy rows that predate the email column
  const { data: byContact, error: contactError } = await supabase
    .from("vendors")
    .select("id")
    .eq("contact->>email", email)
    .maybeSingle();

  if (contactError) {
    return NextResponse.json({ error: contactError.message }, { status: 500 });
  }

  return NextResponse.json({ available: byContact === null });
}
