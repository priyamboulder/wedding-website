// ── POST /api/dashboard/weekly-digest ──────────────────────────────────
// Produces the warm, personalized "This week in your wedding" narrative
// that lives at the top of the main dashboard column. The client passes
// in structured activity data — bookings made, guests added, notes
// saved, upcoming deadlines — and gets back one paragraph in the voice
// of a knowledgeable friend.
//
// A heuristic fallback keeps the surface useful when ANTHROPIC_API_KEY
// is absent or the model call fails, so the dashboard never goes blank
// just because of an outage.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

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

export interface WeeklyDigestRequest {
  weekStart: string; // ISO date — Monday of the week being summarized
  daysUntilWedding: number | null;
  /** Activity from the past 7 days. */
  lastWeek: {
    vendorsBooked: { name: string; category: string }[];
    guestsAdded: number;
    notesAdded: number;
    notesSubjectsTopHits: string[]; // e.g. ["table settings", "catering"]
    checklistCompleted: number;
    decisionsMade: number;
    milestonesHit: string[]; // milestone messages
    checkInsAnswered: number;
  };
  /** What's coming in the next 7-21 days. */
  upcoming: {
    nearestDeadlineLabel: string | null;
    nearestDeadlineDays: number | null;
    upcomingDeadlines: { label: string; days: number }[];
    openDecisions: string[];
  };
  /** Couple identity hints — let the model address them by name when natural. */
  couple: {
    person1: string;
    person2: string;
  };
}

export interface WeeklyDigestResponse {
  ok: boolean;
  content?: string;
  generated_at?: string;
  model?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You write the "This week in your wedding" digest for an Indian-American wedding planning app. You are the voice of a warm, culturally fluent friend who happens to know everything about wedding planning.

Voice rules:
- Warm. Specific. Slightly witty. Never saccharine, never corporate.
- Reference actual numbers and named items from the data — never generic platitudes.
- Two paragraphs (or 3-5 sentences if quiet week). First paragraph: what happened last week. Second paragraph: what's coming this week, including the nearest deadline.
- If the week was quiet, lean into that with grace ("Quiet week — sometimes the best planning is just thinking.") rather than padding.
- Address the couple directly ("you", "your") when natural. You can use their names sparingly.
- No headings. No bullet points. No emoji. Plain prose only.
- 80-160 words total. Shorter is fine if there's not enough material.

Return your text via the \`return_digest\` tool. Never prose outside the tool call.`;

const TOOL_DEFINITION = {
  name: "return_digest",
  description: "Return the weekly digest narrative as plain prose.",
  input_schema: {
    type: "object" as const,
    properties: {
      content: {
        type: "string",
        description: "The weekly digest narrative, 80-160 words, plain prose.",
      },
    },
    required: ["content"],
  },
};

function topNotesPhrase(top: string[]): string {
  if (top.length === 0) return "";
  if (top.length === 1) return top[0];
  if (top.length === 2) return `${top[0]} and ${top[1]}`;
  return `${top.slice(0, -1).join(", ")}, and ${top[top.length - 1]}`;
}

function projectContext(body: WeeklyDigestRequest): string {
  const parts: string[] = [];
  parts.push(`Couple: ${body.couple.person1} & ${body.couple.person2}.`);
  if (body.daysUntilWedding != null) {
    parts.push(`Days until wedding: ${body.daysUntilWedding}.`);
  }
  parts.push(`Week starting: ${body.weekStart}.`);

  parts.push("\n## Last week");
  if (body.lastWeek.vendorsBooked.length > 0) {
    const list = body.lastWeek.vendorsBooked
      .map((v) => `${v.name} (${v.category})`)
      .join(", ");
    parts.push(`- Vendors booked: ${list}`);
  }
  if (body.lastWeek.guestsAdded > 0) {
    parts.push(`- Guests added: ${body.lastWeek.guestsAdded}`);
  }
  if (body.lastWeek.notesAdded > 0) {
    parts.push(
      `- Notes added: ${body.lastWeek.notesAdded}${body.lastWeek.notesSubjectsTopHits.length > 0 ? ` (mostly about ${topNotesPhrase(body.lastWeek.notesSubjectsTopHits)})` : ""}`,
    );
  }
  if (body.lastWeek.checklistCompleted > 0) {
    parts.push(`- Checklist tasks completed: ${body.lastWeek.checklistCompleted}`);
  }
  if (body.lastWeek.decisionsMade > 0) {
    parts.push(`- Decisions logged: ${body.lastWeek.decisionsMade}`);
  }
  if (body.lastWeek.milestonesHit.length > 0) {
    parts.push(`- Milestones reached: ${body.lastWeek.milestonesHit.join(" / ")}`);
  }
  if (body.lastWeek.checkInsAnswered > 0) {
    parts.push(`- Daily check-ins: ${body.lastWeek.checkInsAnswered} answered`);
  }

  parts.push("\n## This week / upcoming");
  if (body.upcoming.nearestDeadlineLabel && body.upcoming.nearestDeadlineDays != null) {
    parts.push(
      `- Nearest deadline: ${body.upcoming.nearestDeadlineLabel} in ${body.upcoming.nearestDeadlineDays} days`,
    );
  }
  for (const d of body.upcoming.upcomingDeadlines.slice(0, 5)) {
    parts.push(`- ${d.label} (${d.days}d)`);
  }
  if (body.upcoming.openDecisions.length > 0) {
    parts.push(
      `- Open decisions still on the table: ${body.upcoming.openDecisions.slice(0, 4).join("; ")}`,
    );
  }

  parts.push(
    "\nWrite the digest. Reference the actual numbers and named items above. Return via return_digest.",
  );
  return parts.join("\n");
}

function isQuietWeek(body: WeeklyDigestRequest): boolean {
  const lw = body.lastWeek;
  return (
    lw.vendorsBooked.length === 0 &&
    lw.guestsAdded === 0 &&
    lw.notesAdded === 0 &&
    lw.checklistCompleted === 0 &&
    lw.decisionsMade === 0 &&
    lw.milestonesHit.length === 0
  );
}

function heuristicDigest(body: WeeklyDigestRequest): string {
  const last: string[] = [];
  const lw = body.lastWeek;
  if (lw.vendorsBooked.length > 0) {
    last.push(
      `you booked ${lw.vendorsBooked.length === 1 ? `your ${lw.vendorsBooked[0].category.toLowerCase()}` : `${lw.vendorsBooked.length} vendors`} (${lw.vendorsBooked.map((v) => v.name).join(", ")})`,
    );
  }
  if (lw.guestsAdded > 0) {
    last.push(`added ${lw.guestsAdded} guest${lw.guestsAdded === 1 ? "" : "s"} to the roster`);
  }
  if (lw.notesAdded > 0) {
    const topic =
      lw.notesSubjectsTopHits.length > 0
        ? ` — mostly about ${topNotesPhrase(lw.notesSubjectsTopHits)}, so that's clearly on your mind`
        : "";
    last.push(`saved ${lw.notesAdded} note${lw.notesAdded === 1 ? "" : "s"}${topic}`);
  }
  if (lw.checklistCompleted > 0) {
    last.push(`crossed off ${lw.checklistCompleted} checklist item${lw.checklistCompleted === 1 ? "" : "s"}`);
  }
  if (lw.decisionsMade > 0) {
    last.push(`made ${lw.decisionsMade} new decision${lw.decisionsMade === 1 ? "" : "s"}`);
  }

  const upcomingBits: string[] = [];
  if (body.daysUntilWedding != null && body.daysUntilWedding > 0) {
    upcomingBits.push(`You're ${body.daysUntilWedding} days out`);
  }
  if (body.upcoming.nearestDeadlineLabel && body.upcoming.nearestDeadlineDays != null) {
    upcomingBits.push(
      `${body.upcoming.nearestDeadlineLabel} is ${body.upcoming.nearestDeadlineDays === 0 ? "today" : `in ${body.upcoming.nearestDeadlineDays} day${body.upcoming.nearestDeadlineDays === 1 ? "" : "s"}`}`,
    );
  }
  if (body.upcoming.openDecisions.length > 0) {
    upcomingBits.push(
      `still on the table: ${body.upcoming.openDecisions.slice(0, 2).join(" and ")}`,
    );
  }

  if (isQuietWeek(body)) {
    const tail =
      upcomingBits.length > 0
        ? ` ${upcomingBits.join(". ")}.`
        : "";
    return `Quiet week — sometimes the best planning is just thinking.${tail}`;
  }

  const lastSentence =
    last.length > 0
      ? `Last week: ${last.join(", ")}.`
      : "";
  const upcomingSentence =
    upcomingBits.length > 0
      ? `This week: ${upcomingBits.join(". ")}.`
      : "";

  return [lastSentence, upcomingSentence].filter(Boolean).join(" ");
}

export async function POST(req: Request) {
  let body: WeeklyDigestRequest;
  try {
    body = (await req.json()) as WeeklyDigestRequest;
  } catch {
    return NextResponse.json<WeeklyDigestResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<WeeklyDigestResponse>({
      ok: true,
      content: heuristicDigest(body),
      generated_at: new Date().toISOString(),
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
    return NextResponse.json<WeeklyDigestResponse>({
      ok: true,
      content: heuristicDigest(body),
      generated_at: new Date().toISOString(),
      model: "offline",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_digest" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: projectContext(body) }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_digest",
    );
    const input = toolBlock?.input as { content?: string } | undefined;
    const content = input?.content?.trim();
    if (!content) {
      return NextResponse.json<WeeklyDigestResponse>({
        ok: true,
        content: heuristicDigest(body),
        generated_at: new Date().toISOString(),
        model: "offline",
      });
    }

    return NextResponse.json<WeeklyDigestResponse>({
      ok: true,
      content,
      generated_at: new Date().toISOString(),
      model: MODEL,
    });
  } catch (err) {
    return NextResponse.json<WeeklyDigestResponse>({
      ok: true,
      content: heuristicDigest(body),
      generated_at: new Date().toISOString(),
      model: "offline",
      error: err instanceof Error ? err.message : "digest failed",
    });
  }
}
