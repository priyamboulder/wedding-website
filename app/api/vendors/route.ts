import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`vendors:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let query = supabase
      .from("vendors")
      .select("*", { count: "exact" })
      .order("rating", { ascending: false })
      .order("review_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }
    if (location) {
      query = query.ilike("location", `%${location}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      vendors: data ?? [],
      total: count ?? 0,
      hasMore: (count ?? 0) > offset + limit,
    });
  } catch (err) {
    console.error("[vendors]", err);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}
