import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

async function getShopId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("seller_shops")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const shopId = await getShopId(user.id);
  if (!shopId) return NextResponse.json({ orders: [] });

  const status = req.nextUrl.searchParams.get("status");
  let query = supabase.from("seller_orders").select("*").eq("shop_id", shopId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const shopId = await getShopId(user.id);
  if (!shopId) return NextResponse.json({ error: "No seller shop found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, ...fields } = body as { id?: string; [k: string]: unknown };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("seller_orders")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ order: data });
}
