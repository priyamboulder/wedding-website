// POST /api/ai-checklist/generate
// Takes a WeddingProfile, calls Claude Sonnet 4.6, returns validated tasks.
// Mirrors the fetch pattern used by app/api/documents/classify/route.ts with
// prompt caching on the heavy system prompt.

import { NextResponse, type NextRequest } from "next/server";
import {
  buildSystemPrompt,
  buildUserPrompt,
  VALID_CATEGORY_TAGS,
  VALID_PHASE_IDS,
  type ValidPhaseId,
} from "@/lib/ai-checklist/prompt";
import type { WeddingProfile } from "@/lib/ai-checklist/profile";

const MODEL = "claude-sonnet-4-6";
const VALID_CATEGORY_SET = new Set<string>(VALID_CATEGORY_TAGS);
const VALID_PHASE_SET = new Set<string>(VALID_PHASE_IDS);
const VALID_PRIORITY_SET = new Set(["critical", "high", "medium", "low"]);

export interface GeneratedTask {
  phase_id: ValidPhaseId;
  subsection: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  daysBeforeWedding: number;
  category_tags: string[];
  notes: string;
}

interface AnthropicResponse {
  content: Array<
    | { type: "text"; text: string }
    | { type: string; [key: string]: unknown }
  >;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ANTHROPIC_API_KEY not configured — set it in .env.local to enable AI checklist generation.",
      },
      { status: 501 },
    );
  }

  let body: { profile?: WeddingProfile };
  try {
    body = (await req.json()) as { profile?: WeddingProfile };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const profile = body.profile;
  if (!profile || !profile.weddingDate) {
    return NextResponse.json(
      { ok: false, error: "Missing wedding profile or wedding date" },
      { status: 400 },
    );
  }

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        system: [
          {
            type: "text",
            text: buildSystemPrompt(),
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: buildUserPrompt(profile) }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `Anthropic API ${apiRes.status}: ${errText.slice(0, 400)}`,
        },
        { status: 502 },
      );
    }

    const data = (await apiRes.json()) as AnthropicResponse;
    const textBlock = data.content.find(
      (b): b is { type: "text"; text: string } => b.type === "text",
    );
    const raw = textBlock?.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "AI returned no JSON object.", raw },
        { status: 502 },
      );
    }

    let parsed: { tasks?: unknown };
    try {
      parsed = JSON.parse(match[0]) as { tasks?: unknown };
    } catch {
      return NextResponse.json(
        { ok: false, error: "AI JSON failed to parse.", raw },
        { status: 502 },
      );
    }

    const tasks = validateTasks(parsed.tasks);
    if (tasks.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "AI returned zero valid tasks after validation.",
          raw,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, tasks });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "AI generation failed.",
      },
      { status: 500 },
    );
  }
}

function validateTasks(input: unknown): GeneratedTask[] {
  if (!Array.isArray(input)) return [];
  const out: GeneratedTask[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const phase_id = typeof r.phase_id === "string" ? r.phase_id : "";
    if (!VALID_PHASE_SET.has(phase_id)) continue;
    const title = typeof r.title === "string" ? r.title.trim() : "";
    if (!title) continue;
    const priority =
      typeof r.priority === "string" && VALID_PRIORITY_SET.has(r.priority)
        ? (r.priority as GeneratedTask["priority"])
        : "medium";
    const daysBeforeWedding =
      typeof r.daysBeforeWedding === "number" && Number.isFinite(r.daysBeforeWedding)
        ? Math.round(r.daysBeforeWedding)
        : 180;
    const subsection =
      typeof r.subsection === "string" && r.subsection.trim()
        ? r.subsection.trim()
        : "ai";
    const description =
      typeof r.description === "string" ? r.description.trim() : "";
    const notes = typeof r.notes === "string" ? r.notes.trim() : "";
    const category_tags = Array.isArray(r.category_tags)
      ? (r.category_tags as unknown[]).filter(
          (t): t is string => typeof t === "string" && VALID_CATEGORY_SET.has(t),
        )
      : [];

    out.push({
      phase_id: phase_id as ValidPhaseId,
      subsection,
      title,
      description,
      priority,
      daysBeforeWedding,
      category_tags,
      notes,
    });
  }
  return out;
}
