// GET /api/finance/data?couple_id=...
// Returns all finance records (invoices, transactions, categories, settings) from Supabase.
// POST /api/finance/data  { couple_id, invoices?, transactions?, categories?, settings? }
// Bulk upserts finance state into dedicated tables.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

export async function GET(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  const coupleId = req.headers.get("x-couple-id") ?? req.nextUrl.searchParams.get("couple_id");
  if (!coupleId) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

  // Prevent IDOR: authenticated user may only read their own finance data
  if (coupleId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [invoicesRes, txnsRes, catsRes, settingsRes] = await Promise.all([
      supabase.from("finance_invoices").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
      supabase.from("finance_transactions").select("*").eq("couple_id", coupleId).order("date", { ascending: false }),
      supabase.from("finance_categories").select("*").eq("couple_id", coupleId),
      supabase.from("finance_settings").select("*").eq("couple_id", coupleId).single(),
    ]);

    return NextResponse.json({
      invoices: invoicesRes.data ?? [],
      transactions: txnsRes.data ?? [],
      categories: catsRes.data ?? [],
      settings: settingsRes.data ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    const { couple_id, invoices = [], transactions = [], categories = [], settings } = await req.json();
    if (!couple_id) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

    // Prevent IDOR: authenticated user may only write their own finance data
    if (couple_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invoices.length > 0) await supabase.from("finance_invoices").upsert(invoices.map((r: any) => ({ ...r, couple_id })), { onConflict: "id" });
    if (transactions.length > 0) await supabase.from("finance_transactions").upsert(transactions.map((r: any) => ({ ...r, couple_id })), { onConflict: "id" });
    if (categories.length > 0) await supabase.from("finance_categories").upsert(categories.map((r: any) => ({ ...r, couple_id })), { onConflict: "id" });
    if (settings) await supabase.from("finance_settings").upsert({ ...settings, couple_id }, { onConflict: "couple_id" });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
