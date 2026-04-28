import { NextResponse } from "next/server";
import type { CouplePreferences } from "@/types/matching";
import { SEED_CREATORS } from "@/lib/creators/seed";
import { rankCreators } from "@/lib/creators/matching";

// POST /api/matching/results
// Body: CouplePreferences (or a partial — any missing fields default to
// neutral scoring). Returns the top-N creators ranked by weighted score,
// enriched with display data the UI needs.

export async function POST(request: Request) {
  let body: Partial<CouplePreferences> & { limit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.budgetRange || !Array.isArray(body.priorityModules)) {
    return NextResponse.json(
      { error: "budgetRange and priorityModules are required" },
      { status: 400 },
    );
  }

  const prefs: CouplePreferences = {
    id: body.id ?? "pref-temp",
    userId: body.userId ?? "demo-couple",
    priorityModules: body.priorityModules,
    styleTags: body.styleTags ?? [],
    traditionTags: body.traditionTags ?? [],
    budgetRange: body.budgetRange,
    aestheticImageIds: body.aestheticImageIds ?? [],
    createdAt: body.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const limit = Math.min(Math.max(body.limit ?? 5, 1), 20);
  const matches = rankCreators(SEED_CREATORS, prefs, limit);

  // Enrich with creator display fields so the client can render match cards
  // without a follow-up creator fetch.
  const enriched = matches.map((m) => {
    const creator = SEED_CREATORS.find((c) => c.id === m.creatorId);
    return { ...m, creator };
  });

  return NextResponse.json({
    matches: enriched,
    total: matches.length,
    limit,
  });
}
