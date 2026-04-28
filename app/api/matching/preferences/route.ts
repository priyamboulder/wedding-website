import { NextResponse } from "next/server";
import type { CouplePreferences } from "@/types/matching";

// POST /api/matching/preferences
// Stateless echo — the canonical store is client-side (matching-store) per
// the localStorage-only persistence policy. This route validates the shape
// and returns the payload with a generated id + timestamps so the client
// can trust the "server" response.

export async function POST(request: Request) {
  let body: Partial<CouplePreferences>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    priorityModules,
    styleTags,
    traditionTags,
    budgetRange,
    aestheticImageIds,
    userId,
  } = body;

  if (!Array.isArray(priorityModules) || priorityModules.length === 0) {
    return NextResponse.json(
      { error: "At least one priority module is required" },
      { status: 400 },
    );
  }
  if (!budgetRange) {
    return NextResponse.json(
      { error: "Budget range is required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const preferences: CouplePreferences = {
    id: body.id ?? `pref-${crypto.randomUUID()}`,
    userId: userId ?? "demo-couple",
    priorityModules,
    styleTags: styleTags ?? [],
    traditionTags: traditionTags ?? [],
    budgetRange,
    aestheticImageIds: aestheticImageIds ?? [],
    createdAt: body.createdAt ?? now,
    updatedAt: now,
  };

  return NextResponse.json({ preferences });
}
