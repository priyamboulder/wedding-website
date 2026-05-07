import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  // Authoritative check: admin_users table only.
  // Email-domain shortcuts have been removed — they allowed account takeover
  // via self-signup with an @ananya.local address on any Supabase deployment.
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ isAdmin: !!adminRecord });
}
