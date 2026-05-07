import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const { data, error } = await supabase
    .from("seller_shops")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ shop: data });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { shop_name, ...fields } = body as { shop_name?: string; [k: string]: unknown };
  if (!shop_name?.trim()) {
    return NextResponse.json({ error: "shop_name required" }, { status: 400 });
  }

  const slug = `${shop_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;

  const { data, error } = await supabase
    .from("seller_shops")
    .insert({ owner_id: user.id, shop_name: shop_name.trim(), slug, ...fields })
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ shop: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("seller_shops")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ shop: data });
}
