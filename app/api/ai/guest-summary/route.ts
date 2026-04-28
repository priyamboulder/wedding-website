// ── POST /api/ai/guest-summary ────────────────────────────────────────────
// Produces the AI-powered insights rendered inside the Summary panel on the
// All Guests view. Given aggregate guest-list data, returns a structured
// response with 3–6 "needs attention" items ranked by importance.
//
// The client already computes raw totals locally (counts, RSVP %, dietary
// distribution). This endpoint is only for the *judgment* layer — duplicate
// detection, capacity warnings, prioritization of outreach. A heuristic
// fallback keeps the panel useful when ANTHROPIC_API_KEY is absent.

import { NextResponse } from "next/server";

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

interface EventDigest {
  id: string;
  label: string;
  date: string;
  invitedCount: number;
  confirmedCount: number;
  pendingCount: number;
  capacity?: number;
}

interface HouseholdDigest {
  id: string;
  displayName: string;
  side: "bride" | "groom" | "mutual";
  city: string;
  outOfTown: boolean;
  hasHotel: boolean;
  memberCount: number;
  lastName: string;
  allConfirmed: boolean;
  allPending: boolean;
}

export interface GuestSummaryRequest {
  totals: {
    guests: number;
    households: number;
    confirmed: number;
    pending: number;
    declined: number;
    outOfTown: number;
    travelPending: number; // OOT without hotel
  };
  sides: { bride: number; groom: number; mutual: number };
  pendingBySide: { bride: number; groom: number; mutual: number };
  events: EventDigest[];
  households: HouseholdDigest[];
  dietary: Record<string, number>;
  deadlineDaysAway: number;
}

export type InsightSeverity = "blocker" | "warning" | "info";

export interface GuestInsight {
  id: string;
  title: string;     // short, ≤14 words
  detail: string;    // one sentence of detail with numbers
  severity: InsightSeverity;
}

export interface GuestSummaryResponse {
  ok: boolean;
  insights?: GuestInsight[];
  generated_at?: string;
  model?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are the analyst for an Indian wedding guest list. Given aggregate data, you identify the 3–6 most important things the couple should notice right now.

Return via the \`return_insights\` tool. Never prose.

Rules:
1. 3–6 insights, ranked by severity and urgency. Blockers first, then warnings, then info.
2. Each insight cites specific numbers. "12 out-of-town households don't have hotel arrangements yet" beats "some guests need lodging".
3. Look for: capacity vs. invited mismatches, RSVP deadline pressure, households where all members are pending (good targets for outreach), likely duplicates (same last name + city), side imbalance, OOT guests without lodging.
4. Do NOT restate raw metrics — the client already shows those. Your value is *judgment* and *what to do next*.
5. Titles are imperative or declarative — "12 OOT households still need hotel rooms", "Sangeet headcount exceeds venue capacity". ≤14 words.
6. Severity: blocker = action must happen before another decision can; warning = time-sensitive; info = worth noticing.`;

const TOOL_DEFINITION = {
  name: "return_insights",
  description: "Return a ranked list of insights for the couple.",
  input_schema: {
    type: "object" as const,
    properties: {
      insights: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
            severity: {
              type: "string",
              enum: ["blocker", "warning", "info"],
            },
          },
          required: ["title", "detail", "severity"],
        },
      },
    },
    required: ["insights"],
  },
};

function projectContext(body: GuestSummaryRequest): string {
  const lines: string[] = [];
  lines.push("## Totals");
  lines.push(
    `${body.totals.guests} guests across ${body.totals.households} households. ${body.totals.confirmed} confirmed · ${body.totals.pending} pending · ${body.totals.declined} declined. Deadline in ${body.deadlineDaysAway} days.`,
  );
  lines.push(
    `Out of town: ${body.totals.outOfTown} (${body.totals.travelPending} without hotel).`,
  );
  lines.push(
    `Sides — bride ${body.sides.bride}, groom ${body.sides.groom}, mutual ${body.sides.mutual}.`,
  );
  lines.push(
    `Pending by side — bride ${body.pendingBySide.bride}, groom ${body.pendingBySide.groom}, mutual ${body.pendingBySide.mutual}.`,
  );

  lines.push("\n## Events");
  for (const ev of body.events) {
    const cap = ev.capacity != null ? ` (capacity ${ev.capacity})` : "";
    lines.push(
      `- ${ev.label} ${ev.date}: invited ${ev.invitedCount} / confirmed ${ev.confirmedCount} / pending ${ev.pendingCount}${cap}`,
    );
  }

  lines.push("\n## Households (abbreviated)");
  for (const h of body.households) {
    const flags = [
      h.outOfTown ? "OOT" : null,
      h.outOfTown && !h.hasHotel ? "no-hotel" : null,
      h.allConfirmed ? "all-confirmed" : null,
      h.allPending ? "all-pending" : null,
    ]
      .filter(Boolean)
      .join(",");
    lines.push(
      `- [${h.id}] ${h.displayName} (${h.side}, ${h.city}, ${h.memberCount} members)${flags ? " — " + flags : ""}`,
    );
  }

  if (Object.keys(body.dietary).length) {
    lines.push("\n## Dietary counts");
    for (const [k, v] of Object.entries(body.dietary)) {
      lines.push(`- ${k}: ${v}`);
    }
  }

  lines.push("\nReturn 3–6 insights ranked by severity via return_insights.");
  return lines.join("\n");
}

// ── Heuristic fallback ────────────────────────────────────────────────────

function heuristicInsights(body: GuestSummaryRequest): GuestInsight[] {
  const out: GuestInsight[] = [];

  if (body.totals.pending > 0 && body.deadlineDaysAway <= 45) {
    out.push({
      id: "h-1",
      title: `${body.totals.pending} RSVPs still pending with ${body.deadlineDaysAway}d to the deadline`,
      detail: `${body.pendingBySide.bride} from bride's side, ${body.pendingBySide.groom} from groom's side. Time to send follow-ups.`,
      severity: body.deadlineDaysAway <= 21 ? "blocker" : "warning",
    });
  }

  if (body.totals.travelPending > 0) {
    out.push({
      id: "h-2",
      title: `${body.totals.travelPending} out-of-town guests don't have hotel arrangements`,
      detail: `They're marked as travelling in but no room block is assigned yet.`,
      severity: "warning",
    });
  }

  // Capacity warning
  for (const ev of body.events) {
    if (ev.capacity != null && ev.invitedCount > ev.capacity) {
      out.push({
        id: `h-cap-${ev.id}`,
        title: `${ev.label} headcount (${ev.invitedCount}) exceeds venue capacity (${ev.capacity})`,
        detail: `Consider trimming or upgrading the venue. ${ev.confirmedCount} already confirmed.`,
        severity: "blocker",
      });
    }
  }

  // Duplicate detection (same last name + city)
  const byKey = new Map<string, HouseholdDigest[]>();
  for (const h of body.households) {
    const key = `${h.lastName.toLowerCase()}|${h.city.toLowerCase()}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(h);
  }
  const dupes = [...byKey.values()].filter((list) => list.length > 1);
  if (dupes.length > 0) {
    const names = dupes[0]!.map((h) => h.displayName).join(" and ");
    out.push({
      id: "h-dup",
      title: `${dupes.length} possible duplicate household${dupes.length === 1 ? "" : "s"} detected`,
      detail: `${names} share a last name and city — worth checking.`,
      severity: "info",
    });
  }

  // Side imbalance
  const diff = Math.abs(body.sides.bride - body.sides.groom);
  if (diff > Math.max(body.sides.bride, body.sides.groom) * 0.25) {
    out.push({
      id: "h-balance",
      title: `Side counts differ by ${diff} guests`,
      detail: `Bride ${body.sides.bride} vs. groom ${body.sides.groom}. Worth a conversation if balance matters.`,
      severity: "info",
    });
  }

  if (out.length === 0) {
    out.push({
      id: "h-empty",
      title: "Nothing urgent right now",
      detail: "No blockers detected. Set ANTHROPIC_API_KEY for richer AI-generated insights.",
      severity: "info",
    });
  }

  return out.slice(0, 6);
}

export async function POST(req: Request) {
  let body: GuestSummaryRequest;
  try {
    body = (await req.json()) as GuestSummaryRequest;
  } catch {
    return NextResponse.json<GuestSummaryResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<GuestSummaryResponse>({
      ok: true,
      insights: heuristicInsights(body),
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
    return NextResponse.json<GuestSummaryResponse>({
      ok: true,
      insights: heuristicInsights(body),
      generated_at: new Date().toISOString(),
      model: "offline",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_insights" },
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
        b.type === "tool_use" && b.name === "return_insights",
    );
    if (!toolBlock) {
      return NextResponse.json<GuestSummaryResponse>({
        ok: true,
        insights: heuristicInsights(body),
        generated_at: new Date().toISOString(),
        model: "offline",
      });
    }

    const input = toolBlock.input as { insights?: Partial<GuestInsight>[] };
    const insights: GuestInsight[] = (input.insights ?? [])
      .filter((i) => i.title && i.detail && i.severity)
      .map((i, idx) => ({
        id: `ai-${idx}`,
        title: i.title!,
        detail: i.detail!,
        severity: i.severity!,
      }));

    return NextResponse.json<GuestSummaryResponse>({
      ok: true,
      insights,
      generated_at: new Date().toISOString(),
      model: MODEL,
    });
  } catch (err) {
    return NextResponse.json<GuestSummaryResponse>({
      ok: true,
      insights: heuristicInsights(body),
      generated_at: new Date().toISOString(),
      model: "offline",
      error: err instanceof Error ? err.message : "summary failed",
    });
  }
}
