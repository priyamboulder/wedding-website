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
  if (!shopId) return NextResponse.json({ payouts: [], summary: null });

  const { data: payouts, error } = await supabase
    .from("seller_payouts")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  // Compute summary from orders
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: monthOrders } = await supabase
    .from("seller_orders")
    .select("paid_amount, status")
    .eq("shop_id", shopId)
    .gte("paid_at", startOfMonth);

  const revenueThisMonth = (monthOrders ?? []).reduce((sum, o) => sum + (o.paid_amount ?? 0), 0);

  const { data: allOrders } = await supabase
    .from("seller_orders")
    .select("paid_amount")
    .eq("shop_id", shopId);

  const revenueYTD = (allOrders ?? []).reduce((sum, o) => sum + (o.paid_amount ?? 0), 0);

  const pendingPayouts = (payouts ?? []).filter((p) => p.status === "pending");
  const availableNow = pendingPayouts.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return NextResponse.json({
    payouts: payouts ?? [],
    summary: {
      availableNow,
      revenueThisMonth,
      revenueYTD,
    },
  });
}
