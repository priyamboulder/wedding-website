// GET /api/finance/data?couple_id=...
// Returns all finance records (invoices, transactions, categories, settings) from Supabase.
// POST /api/finance/data  { couple_id, invoices?, transactions?, categories?, settings? }
// Bulk upserts finance state into dedicated tables.

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
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

    const firstError = invoicesRes.error ?? txnsRes.error ?? catsRes.error;
    if (firstError) {
      Sentry.captureException(firstError);
      return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }

    return NextResponse.json({
      invoices: invoicesRes.data ?? [],
      transactions: txnsRes.data ?? [],
      categories: catsRes.data ?? [],
      settings: settingsRes.data ?? null,
    });
  } catch (err: any) {
    Sentry.captureException(err);
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

    const writePromises = [
      invoices.length > 0
        ? supabase.from("finance_invoices").upsert(invoices.map((r: any) => ({ ...r, couple_id })), { onConflict: "id" })
        : Promise.resolve(null),
      transactions.length > 0
        ? supabase.from("finance_transactions").upsert(transactions.map((r: any) => ({ ...r, couple_id })), { onConflict: "id" })
        : Promise.resolve(null),
      categories.length > 0
        ? supabase.from("finance_categories").upsert(categories.map((r: any) => ({ ...r, couple_id })), { onConflict: "id" })
        : Promise.resolve(null),
      settings
        ? supabase.from("finance_settings").upsert({ ...settings, couple_id }, { onConflict: "couple_id" })
        : Promise.resolve(null),
    ] as const;

    const settled = await Promise.allSettled(writePromises);
    const rejected = settled.find((s) => s.status === "rejected");
    if (rejected) {
      const reason = (rejected as PromiseRejectedResult).reason;
      Sentry.captureException(reason);
      return NextResponse.json({ error: "Failed to save finance data" }, { status: 500 });
    }
    const writeError = settled
      .filter((s) => s.status === "fulfilled")
      .map((s) => (s as PromiseFulfilledResult<{ error: unknown } | null>).value)
      .find((v) => v !== null && typeof v === "object" && "error" in v && v.error);
    if (writeError) {
      Sentry.captureException((writeError as { error: unknown }).error);
      return NextResponse.json({ error: "Failed to save finance data" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
