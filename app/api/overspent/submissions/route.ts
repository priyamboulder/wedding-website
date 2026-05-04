import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, getAuthUser } from "@/lib/supabase/auth-helpers";
import {
  PAGE_SIZE,
  getUserVotes,
  listSubmissions,
} from "@/lib/overspent/queries";
import {
  EXPLANATION_MAX,
  SPLURGE_ITEM_MAX,
  type OverspentRole,
  type OverspentVerdict,
} from "@/types/overspent";

const VALID_VERDICTS = new Set<OverspentVerdict>(["worth_it", "overspent"]);
const VALID_ROLES = new Set<OverspentRole>([
  "bride",
  "groom",
  "parent",
  "other",
]);

// GET /api/overspent/submissions?verdict=worth_it&offset=0
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const verdictRaw = url.searchParams.get("verdict");
  const offsetRaw = url.searchParams.get("offset");

  const verdict =
    verdictRaw && VALID_VERDICTS.has(verdictRaw as OverspentVerdict)
      ? (verdictRaw as OverspentVerdict)
      : undefined;
  const offset = offsetRaw ? Math.max(0, parseInt(offsetRaw, 10) || 0) : 0;

  const page = await listSubmissions(supabase, {
    verdict,
    offset,
    limit: PAGE_SIZE,
  });

  // Show a viewer's own vote so the UI can pre-press the right pill.
  const user = await getAuthUser(request);
  let userVotes: Record<string, "agree" | "disagree"> = {};
  if (user && page.rows.length > 0) {
    userVotes = await getUserVotes(
      supabase,
      user.id,
      page.rows.map((r) => r.id),
    );
  }

  return NextResponse.json({
    submissions: page.rows,
    hasMore: page.hasMore,
    userVotes,
  });
}

// POST /api/overspent/submissions
// Body: { splurge_item, amount, amount_hidden, verdict, explanation, role,
//         guest_count, city }
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    splurge_item,
    amount,
    amount_hidden,
    verdict,
    explanation,
    role,
    guest_count,
    city,
  } = (body ?? {}) as {
    splurge_item?: string;
    amount?: unknown;
    amount_hidden?: unknown;
    verdict?: string;
    explanation?: string;
    role?: string;
    guest_count?: unknown;
    city?: string;
  };

  if (
    typeof splurge_item !== "string" ||
    splurge_item.trim().length === 0 ||
    splurge_item.length > SPLURGE_ITEM_MAX
  ) {
    return NextResponse.json(
      { error: `splurge_item must be 1-${SPLURGE_ITEM_MAX} chars` },
      { status: 400 },
    );
  }
  if (!verdict || !VALID_VERDICTS.has(verdict as OverspentVerdict)) {
    return NextResponse.json({ error: "Invalid verdict" }, { status: 400 });
  }
  if (
    typeof explanation !== "string" ||
    explanation.trim().length === 0 ||
    explanation.length > EXPLANATION_MAX
  ) {
    return NextResponse.json(
      { error: `explanation must be 1-${EXPLANATION_MAX} chars` },
      { status: 400 },
    );
  }

  const hidden = amount_hidden === true;
  let amt: number | null = null;
  if (!hidden && amount !== undefined && amount !== null && amount !== "") {
    const n = typeof amount === "number" ? amount : parseInt(String(amount), 10);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    amt = Math.floor(n);
  }

  let roleVal: OverspentRole | null = null;
  if (typeof role === "string" && role.length > 0) {
    if (!VALID_ROLES.has(role as OverspentRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    roleVal = role as OverspentRole;
  }

  let guestVal: number | null = null;
  if (
    guest_count !== undefined &&
    guest_count !== null &&
    guest_count !== ""
  ) {
    const n =
      typeof guest_count === "number"
        ? guest_count
        : parseInt(String(guest_count), 10);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json(
        { error: "Invalid guest_count" },
        { status: 400 },
      );
    }
    guestVal = Math.floor(n);
  }

  const cityVal =
    typeof city === "string" && city.trim().length > 0
      ? city.trim().slice(0, 80)
      : null;

  const { data, error } = await supabase
    .from("overspent_submissions")
    .insert({
      user_id: user.id,
      splurge_item: splurge_item.trim(),
      amount: amt,
      amount_hidden: hidden,
      verdict,
      explanation: explanation.trim(),
      role: roleVal,
      guest_count: guestVal,
      city: cityVal,
      status: "pending",
    })
    .select("id, status, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not save submission" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, submission: data });
}
