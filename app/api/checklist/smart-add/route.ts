// ── POST /api/checklist/smart-add ─────────────────────────────────────────
// Natural-language task parser for the checklist page.
//
// The client sends the user's free-text input plus a compact snapshot of the
// checklist (phases + their subsections, category vocabulary, members,
// wedding date, known event dates, existing task titles for dedup). The
// model decides:
//   1. Extract structured fields (title, deadline, assignee, priority,
//      phase, subsection, category tags) from the input.
//   2. Optionally return 0–3 related task suggestions the user might also
//      want to add (culturally aware — mehendi, sangeet, etc.).
//
// The client is the source of truth for the checklist (localStorage +
// Zustand, no backend). The server only parses.
//
// When ANTHROPIC_API_KEY is absent, falls back to a tiny regex-based
// heuristic so the feature still has a live preview in dev.
//
// Mirrors the tool_use pattern from app/api/ai/guest-command/route.ts.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 45;

const MODEL = "claude-sonnet-4-6";

type MessageContentBlock =
  | { type: "tool_use"; name: string; input: unknown }
  | { type: "text"; text: string }
  | { type: string; [key: string]: unknown };

interface MessagesCreateResponse {
  content: MessageContentBlock[];
}

interface AnthropicClient {
  messages: {
    create: (args: unknown) => Promise<MessagesCreateResponse>;
  };
}

// ── Request schema ─────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high" | "critical";

interface PhaseDigest {
  id: string;
  title: string;
  subsections: Array<{ key: string; label: string }>;
}

interface MemberDigest {
  id: string;
  name: string;
}

interface EventDigest {
  name: string;
  date: string; // ISO
}

interface CategoryDigest {
  slug: string;
  label: string;
}

interface SmartAddRequest {
  input: string;
  context: {
    today: string; // ISO
    weddingDate: string | null; // ISO
    phases: PhaseDigest[];
    categoryTags: CategoryDigest[];
    members: MemberDigest[];
    events: EventDigest[];
    existingTitles: string[]; // for dedup awareness
  };
}

// ── Response schema ────────────────────────────────────────────────────────

export interface ParsedTaskSuggestion {
  title: string;
  deadline: string | null;
  priority: Priority;
  phaseId: string | null;
  subsectionKey: string | null;
  categoryTags: string[];
}

export interface ParsedTask {
  title: string;
  deadline: string | null;
  assignee: { id: string; name: string } | null;
  priority: Priority;
  phaseId: string | null;
  phaseTitle: string | null;
  subsectionKey: string | null;
  subsectionLabel: string | null;
  categoryTags: string[];
  confidence: number;
  duplicateOf: string | null;
  warnings: string[];
  suggestions: ParsedTaskSuggestion[];
}

interface SmartAddResponse {
  ok: boolean;
  parsed?: ParsedTask;
  error?: string;
  raw_input: string;
}

// ── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a task parser for an Indian wedding planning checklist app.

You receive a free-text command from the user plus a structured snapshot of the checklist (phases, each with its own subsection list, the shared category vocabulary, the member list, any known event dates, and the wedding date). You must call the \`return_parse\` tool exactly once with a structured parse.

Rules:
1. \`title\`: clean, imperative form of the core action. Strip scheduling phrases ("by May 15"), assignee markers ("@Ananya"), and priority signals from the title.
2. \`deadline\`: resolve relative dates ("next Friday", "end of month", "2 weeks", "before the sangeet") against \`today\`. Use ISO date (YYYY-MM-DD). Only set when the user explicitly states or strongly implies a deadline — never hallucinate one. If the user mentions an event name that appears in \`events\`, use that event's date (or a day or two before, if the task is a prep task for that event).
3. \`assigneeName\`: if the user writes "@Name" or "for Name" or "Name will handle", match against the member list (fuzzy match on first name or full name is OK). Return the exact member name as it appears in the list, or omit.
4. \`priority\`: infer from language. "urgent", "critical", "!!", "asap" → critical. "high priority", "important", "!" → high. "low priority", "whenever", "eventually" → low. Default → medium.
5. \`phaseId\`: pick the best-match phase id from the snapshot for this task. Use cultural knowledge — "mehendi artist" → whichever phase contains Beauty & Wellness / Vendors; "muhurat consultation" → Foundation & Vision; "sangeet choreographer" → Vendors; etc. If truly ambiguous, omit.
6. \`subsectionKey\`: once you've picked a phase, pick one of its subsection keys (not labels). The key is the short snake-case slug like "mehndi", "cater", "beau". If no good match, omit.
7. \`categoryTags\`: pick 0–2 category slugs (from the snapshot's categoryTags list) that match the task's vendor type. e.g. "mehendi artist" → ["mehndi", "hmua"]. Only pick slugs that exist in the list.
8. \`duplicateOf\`: if a very similar task title exists in \`existingTitles\`, echo that existing title verbatim. Otherwise omit.
9. \`confidence\`: 0–1. Be honest. 0.9+ means every field is explicit. 0.5–0.8 means you inferred heavily. <0.5 means the input is vague.
10. \`warnings\`: short strings like "Deadline May 1 has passed" (if deadline is before today), or "Assignee Ananya not found in members" (if @mention doesn't resolve). Keep under 8 words each. Omit array if none.
11. \`suggestions\`: 0–3 related tasks that commonly accompany the main task in an Indian wedding context. Examples: "book mehendi artist" → suggest "arrange mehendi cones and favors", "plan mehendi setup area". Don't suggest tasks whose titles closely match \`existingTitles\`. Each suggestion must have at minimum a title, priority, and phaseId; deadline/subsection/categoryTags are optional but preferred.

Cultural context: you understand Indian wedding traditions — mehendi, haldi, sangeet, baraat, pheras, vidaai, muhurat, pandit, dhol, kanyadaan, reception, and regional variations (Punjabi, Gujarati, South Indian, Bengali, etc.). Use this when mapping vague inputs to phases and generating suggestions.

Never return prose. Never invent members, phase ids, or subsection keys that don't appear in the snapshot.`;

const TOOL_DEFINITION = {
  name: "return_parse",
  description: "Return the structured parse of the user's free-text task input.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Clean imperative form of the core task." },
      deadline: {
        type: "string",
        description: "ISO date (YYYY-MM-DD), or omit if no deadline is stated or implied.",
      },
      assigneeName: {
        type: "string",
        description: "The matched member name exactly as it appears in the member list. Omit if no assignee is stated or no member matches.",
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
      },
      phaseId: { type: "string", description: "Best-match phase id from the snapshot." },
      subsectionKey: {
        type: "string",
        description: "Subsection key within the chosen phase (snake-case slug, not label).",
      },
      categoryTags: {
        type: "array",
        items: { type: "string" },
        description: "0–2 category slugs from the provided categoryTags list.",
      },
      confidence: {
        type: "number",
        description: "0–1 confidence of the parse.",
      },
      duplicateOf: {
        type: "string",
        description: "Echo a very similar existing title if one exists, otherwise omit.",
      },
      warnings: {
        type: "array",
        items: { type: "string" },
        description: "Short human-readable warnings. Omit if none.",
      },
      suggestions: {
        type: "array",
        description: "0–3 related tasks to offer as ghost rows.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            deadline: { type: "string" },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            phaseId: { type: "string" },
            subsectionKey: { type: "string" },
            categoryTags: { type: "array", items: { type: "string" } },
          },
          required: ["title", "priority"],
        },
      },
    },
    required: ["title", "priority", "confidence"],
  },
};

// ── Context projection — keep under ~40k chars ────────────────────────────

function projectContext(ctx: SmartAddRequest["context"]): string {
  const lines: string[] = [];
  lines.push(`## Today`);
  lines.push(`- ${ctx.today}`);
  if (ctx.weddingDate) {
    lines.push(`## Wedding Date`);
    lines.push(`- ${ctx.weddingDate}`);
  }
  if (ctx.events.length > 0) {
    lines.push(`## Events`);
    for (const ev of ctx.events) {
      lines.push(`- ${ev.name}: ${ev.date}`);
    }
  }
  lines.push(`## Members`);
  for (const m of ctx.members) {
    lines.push(`- [${m.id}] ${m.name}`);
  }
  lines.push(`## Category Tags`);
  for (const c of ctx.categoryTags) {
    lines.push(`- ${c.slug} — ${c.label}`);
  }
  lines.push(`## Phases (pick phaseId + subsectionKey from here)`);
  for (const p of ctx.phases) {
    const subs = p.subsections
      .map((s) => `${s.key} (${s.label})`)
      .join(", ");
    lines.push(`- [${p.id}] ${p.title} → subsections: ${subs}`);
  }
  if (ctx.existingTitles.length > 0) {
    // Cap to 200 to keep tokens down; latest-first is the caller's job.
    const sample = ctx.existingTitles.slice(0, 200);
    lines.push(`## Existing Task Titles (for dedup)`);
    for (const t of sample) lines.push(`- ${t}`);
  }
  return lines.join("\n");
}

// ── Heuristic fallback (no API key) ────────────────────────────────────────

function heuristicParse(req: SmartAddRequest): ParsedTask {
  const raw = req.input.trim();
  const ctx = req.context;

  // Priority
  let priority: Priority = "medium";
  if (/(^|\s)(!!|urgent|asap|critical)(\s|$|:)/i.test(raw)) priority = "critical";
  else if (/(^|\s)(!|high priority|important)(\s|$|:)/i.test(raw)) priority = "high";
  else if (/(low priority|whenever|eventually|someday)/i.test(raw)) priority = "low";

  // Assignee (@mention)
  let assignee: ParsedTask["assignee"] = null;
  const warnings: string[] = [];
  const mentionMatch = raw.match(/@([A-Za-z][\w'-]*)/);
  if (mentionMatch) {
    const needle = mentionMatch[1].toLowerCase();
    const hit = ctx.members.find(
      (m) => m.name.toLowerCase().split(/\s+/)[0] === needle || m.name.toLowerCase() === needle,
    );
    if (hit) assignee = { id: hit.id, name: hit.name };
    else warnings.push(`Assignee "${mentionMatch[1]}" not found`);
  }

  // Deadline — crude: "by MONTH DAY" / ISO date / "next week"
  let deadline: string | null = null;
  const today = new Date(ctx.today + "T00:00:00");
  const isoMatch = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) deadline = isoMatch[1];
  else {
    const monthMatch = raw.match(
      /\b(?:by|due|before|on)\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2})\b/i,
    );
    if (monthMatch) {
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const m = months.indexOf(monthMatch[1].toLowerCase().slice(0, 3));
      const d = parseInt(monthMatch[2], 10);
      if (m >= 0 && d >= 1 && d <= 31) {
        const year = today.getMonth() > m ? today.getFullYear() + 1 : today.getFullYear();
        deadline = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
    } else if (/next week/i.test(raw)) {
      const nw = new Date(today);
      nw.setDate(today.getDate() + 7);
      deadline = nw.toISOString().slice(0, 10);
    } else if (/end of month/i.test(raw)) {
      const eom = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      deadline = eom.toISOString().slice(0, 10);
    }
  }
  if (deadline) {
    const dl = new Date(deadline + "T00:00:00");
    if (dl < today) warnings.push(`Deadline ${deadline} has passed`);
  }

  // Title — strip directives we consumed
  let title = raw
    .replace(/@[A-Za-z][\w'-]*/g, "")
    .replace(
      /\b(?:by|due|before|on)\s+(?:\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2})/gi,
      "",
    )
    .replace(/\b(next week|end of month|urgent|asap|critical|!!|!|high priority|low priority|whenever|eventually)\b/gi, "")
    .replace(/—\s*.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!title) title = raw;

  // Duplicate check
  const normalized = title.toLowerCase();
  const duplicateOf =
    ctx.existingTitles.find((t) => t.toLowerCase() === normalized) ?? null;

  return {
    title,
    deadline,
    assignee,
    priority,
    phaseId: null,
    phaseTitle: null,
    subsectionKey: null,
    subsectionLabel: null,
    categoryTags: [],
    confidence: 0.5,
    duplicateOf,
    warnings,
    suggestions: [],
  };
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let body: SmartAddRequest;
  try {
    body = (await req.json()) as SmartAddRequest;
  } catch {
    return NextResponse.json<SmartAddResponse>(
      { ok: false, error: "Invalid JSON body.", raw_input: "" },
      { status: 400 },
    );
  }

  const rawInput = body?.input?.trim() ?? "";
  if (!rawInput) {
    return NextResponse.json<SmartAddResponse>(
      { ok: false, error: "Input is required.", raw_input: "" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<SmartAddResponse>({
      ok: true,
      parsed: heuristicParse(body),
      raw_input: rawInput,
    });
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as unknown as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<SmartAddResponse>({
      ok: true,
      parsed: heuristicParse(body),
      raw_input: rawInput,
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_parse" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Context:\n${projectContext(body.context)}\n\nInput: "${rawInput}"`,
        },
      ],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_parse",
    );
    if (!toolBlock) {
      return NextResponse.json<SmartAddResponse>({
        ok: false,
        error: "Model did not return a parse.",
        raw_input: rawInput,
      });
    }

    const parsed = buildParsed(toolBlock.input as Record<string, unknown>, body.context);
    return NextResponse.json<SmartAddResponse>({
      ok: true,
      parsed,
      raw_input: rawInput,
    });
  } catch (err) {
    return NextResponse.json<SmartAddResponse>({
      ok: false,
      error: err instanceof Error ? err.message : "Smart-add failed.",
      raw_input: rawInput,
    });
  }
}

// ── Validation: fold model output back into snapshot-valid shape ──────────

function buildParsed(
  input: Record<string, unknown>,
  ctx: SmartAddRequest["context"],
): ParsedTask {
  const title = String(input.title ?? "").trim() || "Untitled task";
  const priority = normalizePriority(input.priority);
  const confidence = clampConfidence(input.confidence);

  // Phase + subsection: validate against snapshot.
  const rawPhaseId = typeof input.phaseId === "string" ? input.phaseId : null;
  const phase = rawPhaseId ? ctx.phases.find((p) => p.id === rawPhaseId) : null;
  const rawSubKey = typeof input.subsectionKey === "string" ? input.subsectionKey : null;
  const sub = phase && rawSubKey ? phase.subsections.find((s) => s.key === rawSubKey) : null;

  // Assignee: resolve name to member id.
  let assignee: ParsedTask["assignee"] = null;
  const rawAssignee = typeof input.assigneeName === "string" ? input.assigneeName.trim() : "";
  if (rawAssignee) {
    const needle = rawAssignee.toLowerCase();
    const member =
      ctx.members.find((m) => m.name.toLowerCase() === needle) ??
      ctx.members.find((m) => m.name.toLowerCase().startsWith(needle)) ??
      ctx.members.find((m) => m.name.toLowerCase().split(/\s+/)[0] === needle);
    if (member) assignee = { id: member.id, name: member.name };
  }

  // Category tags: intersect with known vocab.
  const validSlugs = new Set(ctx.categoryTags.map((c) => c.slug));
  const rawTags = Array.isArray(input.categoryTags) ? input.categoryTags : [];
  const categoryTags = rawTags
    .filter((t): t is string => typeof t === "string")
    .filter((t) => validSlugs.has(t))
    .slice(0, 3);

  // Warnings passthrough + deadline-in-past check.
  const warnings = Array.isArray(input.warnings)
    ? input.warnings.filter((w): w is string => typeof w === "string").slice(0, 5)
    : [];
  const deadline = normalizeDate(input.deadline);
  if (deadline) {
    const today = new Date(ctx.today + "T00:00:00");
    const dl = new Date(deadline + "T00:00:00");
    if (dl < today && !warnings.some((w) => /passed|past/i.test(w))) {
      warnings.push(`Deadline ${deadline} has passed`);
    }
  }
  if (rawAssignee && !assignee) {
    warnings.push(`Assignee "${rawAssignee}" not found`);
  }

  // Suggestions: same validation, slim shape.
  const rawSuggestions = Array.isArray(input.suggestions) ? input.suggestions : [];
  const suggestions: ParsedTaskSuggestion[] = rawSuggestions
    .slice(0, 3)
    .map((s) => {
      const o = s as Record<string, unknown>;
      const sPhaseId = typeof o.phaseId === "string" ? o.phaseId : null;
      const sPhase = sPhaseId ? ctx.phases.find((p) => p.id === sPhaseId) : null;
      const sSubKey = typeof o.subsectionKey === "string" ? o.subsectionKey : null;
      const sSub = sPhase && sSubKey ? sPhase.subsections.find((x) => x.key === sSubKey) : null;
      const sTags = Array.isArray(o.categoryTags)
        ? o.categoryTags.filter((t): t is string => typeof t === "string").filter((t) => validSlugs.has(t))
        : [];
      return {
        title: String(o.title ?? "").trim(),
        deadline: normalizeDate(o.deadline),
        priority: normalizePriority(o.priority),
        phaseId: sPhase ? sPhase.id : null,
        subsectionKey: sSub ? sSub.key : null,
        categoryTags: sTags,
      };
    })
    .filter((s) => s.title.length > 0);

  const duplicateOf =
    typeof input.duplicateOf === "string" && input.duplicateOf.trim()
      ? input.duplicateOf.trim()
      : null;

  return {
    title,
    deadline,
    assignee,
    priority,
    phaseId: phase ? phase.id : null,
    phaseTitle: phase ? phase.title : null,
    subsectionKey: sub ? sub.key : null,
    subsectionLabel: sub ? sub.label : null,
    categoryTags,
    confidence,
    duplicateOf,
    warnings,
    suggestions,
  };
}

function normalizePriority(raw: unknown): Priority {
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "critical") {
    return raw;
  }
  return "medium";
}

function clampConfidence(raw: unknown): number {
  const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
  if (Number.isNaN(n)) return 0.6;
  return Math.max(0, Math.min(1, n));
}

function normalizeDate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})$/);
  return m ? m[1] : null;
}
