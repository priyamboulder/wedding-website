// ── POST /api/journal/auto-tag ─────────────────────────────────────────────
// Classifies a Journal entry into 0–3 WorkspaceCategoryTag values.
// Called in the background after entry creation and on-demand via the
// sparkle affordance next to the tag row.
//
// Model: Haiku 4.5 — cheap + fast; classification doesn't need Sonnet.
// The system prompt is marked cache_control: ephemeral so repeat calls
// within 5 minutes hit the Anthropic prompt cache.
//
// Uses fetch directly against the Anthropic REST API rather than the
// @anthropic-ai/sdk to avoid adding a dependency. The SDK is listed in
// package.json but not installed locally, and this route only needs one
// call shape.

import { NextRequest, NextResponse } from "next/server";
import { ALL_CATEGORY_SLUGS } from "@/lib/journal/category-vocab";
import type { WorkspaceCategoryTag } from "@/types/checklist";

export const runtime = "nodejs";

interface RequestBody {
  title: string;
  description?: string;
  domain?: string;
  bodyExcerpt?: string;
}

const SYSTEM_PROMPT = `You classify wedding-planning content into vendor categories for an Indian wedding planning app.

Categories:
- photography — still image capture: photographers, portrait styles, candid coverage, editorial galleries
- videography — moving image: cinematographers, highlight films, drone, reels
- catering — food & beverage: menu design, chefs, bar, dietary planning
- decor_florals — florals, mandaps, lighting, tablescapes, installations
- entertainment — music: DJs, bands, dhol, live ensembles, baraat music
- hmua — hair and makeup artists, bridal beauty looks, glam
- venue — physical locations, ballrooms, palaces, resorts, site planning
- mehndi — mehendi/henna artists and designs
- transportation — cars, vintage, horses, logistics for guests
- stationery — invitations, save-the-dates, signage, menus, programs
- pandit_ceremony — priests, pujas, rituals, mantras, ceremony structure
- wardrobe — bridal outfits, groom's attire, lehengas, sherwanis, jewelry styling

Rules:
1. Return only categories clearly supported by the content — zero tags is a valid answer.
2. Maximum 3 tags.
3. Respond with valid JSON only. No prose. Shape: {"suggestions": ["photography", ...]}
4. Use exact slug values from the list above.`;

interface AnthropicMessagesResponse {
  content: Array<
    | { type: "text"; text: string }
    | { type: string; [key: string]: unknown }
  >;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { suggestions: [], error: "ANTHROPIC_API_KEY not configured" },
      { status: 200 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { suggestions: [], error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const title = (body.title ?? "").slice(0, 300);
  const description = (body.description ?? "").slice(0, 500);
  const domain = (body.domain ?? "").slice(0, 100);
  const bodyExcerpt = (body.bodyExcerpt ?? "").slice(0, 500);

  if (!title && !description && !bodyExcerpt) {
    return NextResponse.json({ suggestions: [] });
  }

  const userContent = [
    title ? `Title: ${title}` : null,
    description ? `Description: ${description}` : null,
    domain ? `Domain: ${domain}` : null,
    bodyExcerpt ? `Body excerpt: ${bodyExcerpt}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 200,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!apiRes.ok) {
      return NextResponse.json(
        { suggestions: [], error: `Anthropic API ${apiRes.status}` },
        { status: 200 },
      );
    }

    const data = (await apiRes.json()) as AnthropicMessagesResponse;
    const textBlock = data.content.find(
      (b): b is { type: "text"; text: string } => b.type === "text",
    );
    const raw = textBlock?.text ?? "";
    const suggestions = parseSuggestions(raw);

    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json(
      {
        suggestions: [],
        error: err instanceof Error ? err.message : "Auto-tag failed",
      },
      { status: 200 },
    );
  }
}

function parseSuggestions(raw: string): WorkspaceCategoryTag[] {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { suggestions?: unknown };
    if (!Array.isArray(parsed.suggestions)) return [];
    const valid = parsed.suggestions.filter(
      (s): s is WorkspaceCategoryTag =>
        typeof s === "string" &&
        (ALL_CATEGORY_SLUGS as readonly string[]).includes(s),
    );
    return Array.from(new Set(valid)).slice(0, 3);
  } catch {
    return [];
  }
}
