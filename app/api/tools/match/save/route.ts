// ── POST /api/tools/match/save ────────────────────────────────────────────
// Persist a match-tool run to tool_match_results.
//
// Anonymous-friendly: callers send their localStorage anonymous_token (the
// shared marigold:budget:anon_token) plus an email. The route routes both
// authed and anonymous saves through the SECURITY DEFINER RPC defined in
// migration 0023 — the email is required when the token is missing so the
// CHECK constraint on tool_match_results stays satisfied.

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { createAnonClient } from "@/lib/supabase/server-client";
import type { MatchInputs, MatchReason } from "@/types/match";

export const runtime = "nodejs";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface SaveBody {
  email?: string;
  anonymous_token?: string | null;
  inputs?: MatchInputs;
  matches?: Array<{ slug: string; score: number; reasons: MatchReason[] }>;
  source?: string;
}

export async function POST(request: Request) {
  let body: SaveBody;
  try {
    body = (await request.json()) as SaveBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const token = body.anonymous_token ?? null;

  if (!body.inputs || !body.matches?.length) {
    return NextResponse.json(
      { ok: false, error: "inputs and matches are required." },
      { status: 400 },
    );
  }
  if (!email && !token) {
    return NextResponse.json(
      { ok: false, error: "email or anonymous_token is required." },
      { status: 400 },
    );
  }
  if (email && !EMAIL_RX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Email looks malformed." },
      { status: 400 },
    );
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("save_anonymous_match_result", {
    p_token: token,
    p_email: email || null,
    p_inputs: body.inputs,
    p_results: body.matches,
    p_source: body.source ?? "tool",
  });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { ok: false, error: "Operation failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
