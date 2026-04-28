// ── POST /api/catering/command-brief ──────────────────────────────────────
// Produces the flagship "what needs you next" queue for Catering Command.
// Given the full catering state (events, menus, proposals, assessments,
// tastings, staffing), the model returns 3–5 ranked actions with
// reasons. The ranking is the point — not a raw todo list. Claude
// Sonnet 4.6 with tool use.

import { NextResponse } from "next/server";
import type {
  CatererAssessment,
  CatererProposal,
  CommandBrief,
  Dish,
  MenuEvent,
  MenuMoment,
  NextAction,
  StaffSlot,
  TastingVisit,
} from "@/types/catering";

export const runtime = "nodejs";
export const maxDuration = 60;

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

interface BriefRequest {
  wedding_id: string;
  today: string;                // ISO yyyy-mm-dd
  events: MenuEvent[];
  moments: MenuMoment[];
  dishes: Dish[];
  proposals: CatererProposal[];
  assessments: CatererAssessment[];
  tasting_visits: TastingVisit[];
  staff_slots: StaffSlot[];
  caterer_names: Record<string, string>;
}

interface BriefResponse {
  ok: boolean;
  brief?: Omit<CommandBrief, "id">;
  error?: string;
}

const SYSTEM_PROMPT = `You are the chief-of-staff for a couple planning a luxury Indian wedding. You read their entire catering state — events, menus, caterer proposals, tasting notes, staffing, budget — and tell them the 3–5 highest-leverage things to do next. Not a todo list. A ranked brief.

Your job is judgment:
- What's BLOCKING other decisions? (No caterer picked → menu can't finalize → paper suite can't go to print.)
- What's TIME-SENSITIVE? (Tasting dates elapsing, proposals aging, deposits coming due.)
- What's HIGH-LEVERAGE? (One confirmed reception caterer unblocks menu + rentals + staffing.)
- What's LOW-LEVERAGE BUT DRIFTING? (No proposal yet for haldi after 4 weeks — nudge or swap.)

Rules:
1. Call the return_brief tool. Never prose.
2. actions: 3–5. Ranked by impact. #1 is the thing to do THIS WEEK.
3. title: one imperative — "Confirm reception caterer", "Close haldi proposal", "Schedule Blue Elephant second tasting". Under 8 words.
4. reason: one sentence. Cite concrete state — which event, which caterer, what's overdue or missing. Numbers beat adjectives.
5. severity: "blocker" (other decisions wait on this), "soon" (time-sensitive within 2 weeks), "info" (drift, low urgency).
6. link.surface: pick from {command, menu_studio, dietary_atlas, decision_board, tasting_journal, service_flow}. Optional event_id/caterer_id if the action targets one.
7. Never generic. "Keep planning" is not an action. "Review the proposal" is not an action. "Sign Foodlink's reception contract — quote expires Jun 1" is.`;

const TOOL_DEFINITION = {
  name: "return_brief",
  description:
    "Return a ranked brief of the next 3–5 actions for the couple.",
  input_schema: {
    type: "object" as const,
    properties: {
      actions: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Imperative, ≤8 words." },
            reason: {
              type: "string",
              description: "One sentence citing concrete state.",
            },
            severity: {
              type: "string",
              enum: ["blocker", "soon", "info"],
            },
            link: {
              type: "object",
              properties: {
                surface: {
                  type: "string",
                  enum: [
                    "command",
                    "menu_studio",
                    "dietary_atlas",
                    "decision_board",
                    "tasting_journal",
                    "service_flow",
                  ],
                },
                event_id: { type: "string" },
                caterer_id: { type: "string" },
              },
              required: ["surface"],
            },
          },
          required: ["title", "reason", "severity"],
        },
      },
    },
    required: ["actions"],
  },
};

function projectContext(body: BriefRequest): string {
  const { today, events, moments, dishes, proposals, assessments, tasting_visits, staff_slots, caterer_names } = body;
  const lines: string[] = [];
  lines.push(`## Today: ${today}`);

  lines.push("\n## Events");
  for (const ev of events) {
    const momentIds = new Set(moments.filter((m) => m.event_id === ev.id).map((m) => m.id));
    const eventDishes = dishes.filter((d) => momentIds.has(d.moment_id));
    const evStaff = staff_slots.filter((s) => s.event_id === ev.id);
    lines.push(
      `- [${ev.id}] ${ev.label} (${ev.date}, ${ev.guest_count} guests, ${ev.cuisine_direction}) — ${momentIds.size} moments, ${eventDishes.length} dishes, ${evStaff.length} staff slots`,
    );
  }

  lines.push("\n## Caterers & proposals");
  const byCaterer = new Map<string, CatererProposal[]>();
  for (const p of proposals) {
    if (!byCaterer.has(p.caterer_id)) byCaterer.set(p.caterer_id, []);
    byCaterer.get(p.caterer_id)!.push(p);
  }
  byCaterer.forEach((ps, cid) => {
    const name = caterer_names[cid] ?? cid;
    const received = ps.filter((p) => p.status === "received").length;
    const requested = ps.filter((p) => p.status === "requested").length;
    const declined = ps.filter((p) => p.status === "declined").length;
    lines.push(
      `- [${cid}] ${name}: ${received} received, ${requested} requested, ${declined} declined`,
    );
    for (const p of ps) {
      const ev = events.find((e) => e.id === p.event_id);
      if (!ev) continue;
      const ageDays = p.received_at
        ? Math.floor(
            (new Date(today).getTime() - new Date(p.received_at).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;
      lines.push(
        `    · ${ev.label}: status=${p.status}${p.status === "received" && p.price_per_plate_low && p.price_per_plate_high ? ` (${p.currency} ${p.price_per_plate_low}–${p.price_per_plate_high}/plate)` : ""}${ageDays !== null ? ` · ${ageDays}d old` : ""}`,
      );
    }
  });

  if (assessments.length > 0) {
    lines.push("\n## AI fit assessments so far");
    for (const a of assessments) {
      lines.push(
        `- ${caterer_names[a.caterer_id] ?? a.caterer_id}: fit_score ${a.fit_score}`,
      );
    }
  }

  if (tasting_visits.length > 0) {
    lines.push("\n## Tastings");
    for (const v of tasting_visits) {
      lines.push(
        `- ${v.date} · ${caterer_names[v.caterer_id] ?? v.caterer_id}${v.synthesis ? ` — synthesis: "${v.synthesis.recommendation}"` : ""}`,
      );
    }
  }

  lines.push(
    "\n\nReturn the brief via return_brief. Pick 3–5 actions ranked by impact.",
  );
  return lines.join("\n");
}

// ── Heuristic fallback ────────────────────────────────────────────────────

function heuristicBrief(body: BriefRequest): Omit<CommandBrief, "id"> {
  const actions: NextAction[] = [];
  const { events, proposals, caterer_names, tasting_visits } = body;

  // Events without any received proposal
  const eventsWithoutProposal = events.filter((ev) => {
    const received = proposals.filter(
      (p) => p.event_id === ev.id && p.status === "received",
    );
    return received.length === 0;
  });
  if (eventsWithoutProposal.length > 0) {
    const ev = eventsWithoutProposal[0]!;
    actions.push({
      id: "h-1",
      title: `Close a proposal for ${ev.label}`,
      reason: `No received proposals for ${ev.label} yet — ${eventsWithoutProposal.length} events still uncovered.`,
      severity: "blocker",
      link: { surface: "decision_board", event_id: ev.id },
    });
  }

  // Request pending proposals
  const requestedPending = proposals.filter((p) => p.status === "requested");
  if (requestedPending.length > 0) {
    actions.push({
      id: "h-2",
      title: `Follow up on ${requestedPending.length} pending quote${requestedPending.length === 1 ? "" : "s"}`,
      reason: `${requestedPending.length} caterer proposal${requestedPending.length === 1 ? "" : "s"} requested but not yet received.`,
      severity: "soon",
      link: { surface: "decision_board" },
    });
  }

  // No tasting synthesis
  const noSynthesis = tasting_visits.filter((v) => !v.synthesis);
  if (noSynthesis.length > 0) {
    actions.push({
      id: "h-3",
      title: `Synthesize ${noSynthesis.length} tasting${noSynthesis.length === 1 ? "" : "s"}`,
      reason: `${noSynthesis.length} tasting visit${noSynthesis.length === 1 ? "" : "s"} logged without an AI synthesis — decisions are harder without one.`,
      severity: "info",
      link: { surface: "tasting_journal" },
    });
  }

  if (actions.length < 3) {
    actions.push({
      id: "h-fallback",
      title: "Set ANTHROPIC_API_KEY for smarter ranking",
      reason:
        "Without the Claude API, the brief is heuristic. Set the key to unlock judgment-based prioritization.",
      severity: "info",
      link: { surface: "command" },
    });
  }

  return {
    wedding_id: body.wedding_id,
    actions: actions.slice(0, 5),
    generated_at: new Date().toISOString(),
    model: "offline",
  };
}

export async function POST(req: Request) {
  let body: BriefRequest;
  try {
    body = (await req.json()) as BriefRequest;
  } catch {
    return NextResponse.json<BriefResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<BriefResponse>({
      ok: true,
      brief: heuristicBrief(body),
    });
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<BriefResponse>({
      ok: true,
      brief: heuristicBrief(body),
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_brief" },
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
        b.type === "tool_use" && b.name === "return_brief",
    );
    if (!toolBlock) {
      return NextResponse.json<BriefResponse>({
        ok: false,
        error: "Model did not call return_brief.",
      });
    }
    const input = toolBlock.input as {
      actions?: Array<{
        title?: string;
        reason?: string;
        severity?: NextAction["severity"];
        link?: NextAction["link"];
      }>;
    };

    const actions: NextAction[] = (input.actions ?? [])
      .filter((a) => a.title && a.reason && a.severity)
      .map((a, i) => ({
        id: `a-${i}`,
        title: a.title!,
        reason: a.reason!,
        severity: a.severity!,
        link: a.link,
      }));

    return NextResponse.json<BriefResponse>({
      ok: true,
      brief: {
        wedding_id: body.wedding_id,
        actions,
        generated_at: new Date().toISOString(),
        model: MODEL,
      },
    });
  } catch (err) {
    return NextResponse.json<BriefResponse>({
      ok: false,
      error: err instanceof Error ? err.message : "Command brief failed.",
    });
  }
}
