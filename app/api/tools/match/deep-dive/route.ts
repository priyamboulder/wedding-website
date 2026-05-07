// ── POST /api/tools/match/deep-dive ───────────────────────────────────────
// Generates a prose analysis of the bride's top destination matches.
//
// Mirrors the draft-rsvp pattern: returns a heuristic answer when
// ANTHROPIC_API_KEY is missing so the CTA always renders something useful.

import { NextRequest, NextResponse } from "next/server";

import { PRIORITY_LABELS } from "@/lib/match";
import type {
  MatchDeepDiveRequest,
  MatchDeepDiveResponse,
  PrioritySlug,
} from "@/types/match";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 45;

const MODEL = "claude-sonnet-4-6";

type MessageContentBlock =
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

const SYSTEM_PROMPT = `You are an Indian-wedding planning advisor for The Marigold. The bride just used "Match Me" — she input her budget, guest count, priorities, and dealbreakers. You see her top destination matches and the algorithm's reasons.

Write a candid, magazine-voice analysis (3 short paragraphs) that:
1. Names the single destination you'd pick for HER specific situation, and why — call out the priority that tipped it.
2. Compares it directly to one runner-up so she understands the tradeoff (budget? travel? vibe?).
3. Names a real risk to think about (long flights, vendor shortage, monsoon timing, capacity squeeze) — not generic platitudes.

Voice: lowercase eyebrows, em-dashes, "the family," "the baraat," "your numbers." NEVER say "I" or "we" — refer to The Marigold's editorial point of view in the third person, or speak directly to the bride in second person. No bullet lists. No headings. No emojis. 220 words max.`;

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function buildUserContext(req: MatchDeepDiveRequest): string {
  const lines: string[] = [];
  const i = req.inputs;
  lines.push("Her inputs:");
  lines.push(`- Budget: ${formatMoney(i.budget)}`);
  lines.push(`- Largest event: ${i.guests} guests`);
  lines.push(
    `- Priorities (in order picked): ${i.priorities.length === 0 ? "none specified" : i.priorities.map((p) => PRIORITY_LABELS[p as PrioritySlug] ?? p).join(", ")}`,
  );
  lines.push(
    `- Dealbreakers: ${i.dealbreakers.length === 0 ? "none" : i.dealbreakers.join(", ")}`,
  );
  lines.push("");
  lines.push("Top matches (ranked):");
  for (const m of req.matches.slice(0, 5)) {
    const reasonText = m.reasons.map((r) => r.text).join(" / ");
    lines.push(`- ${m.name} — ${m.score}% match. Reasons: ${reasonText || "—"}`);
  }
  lines.push("");
  lines.push(
    "Write the analysis. Pick one. Compare it to one runner-up. Name one real risk. 220 words max.",
  );
  return lines.join("\n");
}

function heuristicAnalysis(req: MatchDeepDiveRequest): string {
  const top = req.matches[0];
  const second = req.matches[1];
  if (!top) {
    return "Your inputs ruled out the field — the dealbreakers narrowed things to nothing the algorithm could rank cleanly. Try removing one filter or stretching the budget by 15%, and the spread opens up considerably.";
  }
  const priorityLine =
    req.inputs.priorities.length > 0
      ? PRIORITY_LABELS[req.inputs.priorities[0] as PrioritySlug] ?? req.inputs.priorities[0]
      : "the budget-fit";
  const para1 = `For your numbers — ${formatMoney(req.inputs.budget)} and ${req.inputs.guests} guests — ${top.name} is the move. The ${priorityLine.toLowerCase()} priority lines up cleanly here, and the score (${top.score}%) reflects that the venue scene can absorb the headcount without forcing you to compromise on production.`;
  const para2 = second
    ? `${second.name} is the runner-up at ${second.score}% — close on vibe, slightly off on the financial fit or the travel logistics. If your family list skews older or you're optimizing for guest flight times, ${second.name} is the safer pick. If you're optimizing for the photo and the experience, stay with ${top.name}.`
    : `Without a strong runner-up, the recommendation is to lock in — the algorithm sees ${top.name} as a clear single choice rather than a balanced field.`;
  const para3 = `One real risk to think about: ${top.name} weddings of this size tend to book the marquee venues 14–18 months out, so the timeline is real. If you're already inside that window, plan to be flexible on dates or the specific property — not on the destination itself.`;
  return `${para1}\n\n${para2}\n\n${para3}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let body: MatchDeepDiveRequest;
  try {
    body = (await request.json()) as MatchDeepDiveRequest;
  } catch {
    return NextResponse.json<MatchDeepDiveResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body.inputs || !Array.isArray(body.matches)) {
    return NextResponse.json<MatchDeepDiveResponse>(
      { ok: false, error: "inputs and matches are required." },
      { status: 400 },
    );
  }
  if (body.matches.length === 0) {
    return NextResponse.json<MatchDeepDiveResponse>({
      ok: true,
      analysis: heuristicAnalysis(body),
      model: "offline",
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<MatchDeepDiveResponse>({
      ok: true,
      analysis: heuristicAnalysis(body),
      model: "offline",
    });
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<MatchDeepDiveResponse>({
      ok: true,
      analysis: heuristicAnalysis(body),
      model: "offline",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserContext(body) }],
    });

    const textBlock = response.content.find(
      (b): b is MessageContentBlock & { text: string } =>
        b.type === "text" && typeof b.text === "string",
    );
    const analysis = textBlock?.text?.trim();

    if (!analysis) {
      return NextResponse.json<MatchDeepDiveResponse>({
        ok: true,
        analysis: heuristicAnalysis(body),
        model: "offline",
      });
    }

    return NextResponse.json<MatchDeepDiveResponse>({
      ok: true,
      analysis,
      model: MODEL,
    });
  } catch (err) {
    return NextResponse.json<MatchDeepDiveResponse>({
      ok: true,
      analysis: heuristicAnalysis(body),
      model: "offline",
      error: err instanceof Error ? err.message : "deep-dive failed",
    });
  }
}

