// ──────────────────────────────────────────────────────────────────────────
// POST /api/tools/inquiries
//
// Lead capture from public Tool surfaces. Anonymous submissions are
// allowed — the schema requires an email when there's no auth.uid().
//
// The browser passes only the vendor id, source tool, and the
// user-supplied fields (name/date/guests/notes). The auth user id, if any,
// is read server-side from the cookie — never trust an id from the body.
// ──────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

import { createAnonClient } from "@/lib/supabase/server-client";
import { createInquiry } from "@/lib/vendors/tools-queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const vendorId = payload.vendor_id;
  const sourceTool = payload.source_tool;
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const context =
    typeof payload.context === "object" && payload.context !== null
      ? (payload.context as Record<string, unknown>)
      : {};

  if (typeof vendorId !== "string" || vendorId.length === 0) {
    return NextResponse.json(
      { error: "vendor_id is required." },
      { status: 400 },
    );
  }
  if (typeof sourceTool !== "string" || sourceTool.length === 0) {
    return NextResponse.json(
      { error: "source_tool is required." },
      { status: 400 },
    );
  }
  if (!email) {
    return NextResponse.json(
      { error: "Drop your email so we can connect you." },
      { status: 400 },
    );
  }

  // Basic email shape check — the DB does the real uniqueness work.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email looks off — double-check?" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAnonClient();
    const inquiry = await createInquiry(supabase, {
      vendorId,
      sourceTool,
      email,
      context,
    });
    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save the inquiry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
