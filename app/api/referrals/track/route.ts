import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

export async function POST(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { referee_email, source, campaign } = body;

    // referrer_id always comes from the JWT — never from the request body
    const referrer_id = user.id;

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        referrer_id,
        referee_email: referee_email ?? null,
        source: source ?? "link",
        campaign: campaign ?? "",
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, tracked: true, referral: data });
  } catch (err) {
    console.error("[referrals/track]", err);
    return NextResponse.json({ error: "Failed to track referral" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    const referrerId = req.nextUrl.searchParams.get("referrer_id");
    if (!referrerId) {
      return NextResponse.json({ error: "referrer_id required" }, { status: 400 });
    }

    // Prevent IDOR: users may only view their own referrals
    if (referrerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", referrerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ referrals: data ?? [] });
  } catch (err) {
    console.error("[referrals/track GET]", err);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}
