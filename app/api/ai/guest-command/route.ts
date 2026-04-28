// ── POST /api/ai/guest-command ────────────────────────────────────────────
// Natural-language command router for the guest list.
//
// The client sends the user's prompt plus a compact snapshot of the current
// list (totals, households, events, sample guests). The model decides:
//   1. Is the user asking a question? → return an `answer` payload.
//   2. Is the user asking to mutate data? → return a structured `action`
//      that the client executes against its Zustand/useState list.
//   3. Is the intent ambiguous? → return a `clarify` question.
//
// Actions are intentionally high-level and addressable — the client is the
// source of truth for the guest list (localStorage only, no backend), so
// every action describes *which* guests/events are affected without asking
// the server to persist anything.

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

// ── Request schema ─────────────────────────────────────────────────────────

type Side = "bride" | "groom" | "mutual";
type RsvpStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "tentative"
  | "no_response";

interface GuestDigest {
  id: string;
  firstName: string;
  lastName: string;
  householdId: string;
  side: Side;
  branch: string;
  city: string;
  outOfTown: boolean;
  categories: string[];
  invitedEvents: string[];
  rsvp: Record<string, RsvpStatus>;
  dietary: string[];
  vipTier: string;
  relationship: string;
  addressing?: string;
}

interface HouseholdDigest {
  id: string;
  displayName: string;
  addressing: string;
  side: Side;
  branch: string;
  city: string;
  outOfTown: boolean;
  memberIds: string[];
}

interface EventDigest {
  id: string;
  label: string;
  date: string;
  host: string;
}

interface GuestCommandRequest {
  prompt: string;
  snapshot: {
    totals: { guests: number; households: number; confirmed: number; pending: number };
    events: EventDigest[];
    households: HouseholdDigest[];
    guests: GuestDigest[]; // may be a sampled subset for large lists
  };
}

// ── Response schema ────────────────────────────────────────────────────────
// The union of possible server replies. The client branches on `kind`.

export type GuestCommandAction =
  | {
      kind: "answer";
      text: string;
    }
  | {
      kind: "clarify";
      question: string;
    }
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "add_household";
      summary: string;
      household: {
        displayName: string;
        addressing: string;
        side: Side;
        branch: string;
        city: string;
        country: string;
        outOfTown: boolean;
        invitedEvents: string[]; // event ids
        members: Array<{
          firstName: string;
          lastName: string;
          salutation?: string;
          role: "primary" | "spouse" | "child" | "plus_one" | "other";
          relationship: string;
        }>;
      };
    }
  | {
      kind: "update_guests";
      summary: string;
      guestIds: string[];
      patch: {
        side?: Side;
        branch?: string;
        city?: string;
        categories?: string[];
        addCategories?: string[];
        removeCategories?: string[];
        outOfTown?: boolean;
      };
    }
  | {
      kind: "set_rsvp";
      summary: string;
      guestIds: string[];
      eventIds: string[]; // [] means all invited events
      status: RsvpStatus;
    }
  | {
      kind: "toggle_invitation";
      summary: string;
      guestIds: string[];
      eventIds: string[];
      add: boolean; // true=add invitation, false=remove
    };

interface GuestCommandResponse {
  ok: boolean;
  action?: GuestCommandAction;
  error?: string;
}

// ── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the AI assistant for an Indian wedding guest list. You receive the user's natural-language command plus a structured snapshot of the current list (guests, households, events).

Your job is to decide what the user wants and return ONE action via the \`return_action\` tool.

You must call \`return_action\` exactly once. Never return prose.

Action kinds:
- \`answer\`: the user asked a question. Return a concise, factual answer computed from the snapshot. 1–3 sentences. Cite numbers.
- \`clarify\`: you cannot safely act without more information. Ask a single specific question.
- \`add_household\`: add a new household with one or more members. Fill all required fields. For Indian names, generate proper addressing ("Shri & Smt. Rakesh Shah", "Mr. & Mrs. ...", "Dr. & Mrs. ... and Family"). Use the snapshot's events list — only include event ids that exist there.
- \`update_guests\`: mutate fields on existing guests. Select by id using the snapshot. Only include fields the user explicitly asked to change.
- \`set_rsvp\`: change RSVP status for specific guests/events.
- \`toggle_invitation\`: add or remove event invitations.
- \`error\`: you cannot fulfill the request and there is nothing to clarify.

Rules:
1. When the user names a household/family, match it against the snapshot's households by last name + city. If multiple match, return \`clarify\`.
2. Preserve user intent — do not "improve" or scope-creep. "Mark the Iyers confirmed" means set_rsvp for Iyer household members, not for all of bride's side.
3. For bulk operations (>10 guests), still act — the client will confirm before applying.
4. \`summary\`: one plain-English sentence for the confirmation card. Lead with the count and side. e.g. "Add 1 household with 3 members to Groom's Paternal side."
5. When the user asks a factual question ("how many", "who hasn't", "what's the split"), always use \`answer\` with the computed number, not \`clarify\`.
6. Side values are strictly \`bride\`, \`groom\`, or \`mutual\`. Match colloquial phrasing to one of these.`;

const TOOL_DEFINITION = {
  name: "return_action",
  description: "Return the single action the user's command resolves to.",
  input_schema: {
    type: "object" as const,
    properties: {
      kind: {
        type: "string",
        enum: [
          "answer",
          "clarify",
          "error",
          "add_household",
          "update_guests",
          "set_rsvp",
          "toggle_invitation",
        ],
      },
      summary: { type: "string", description: "One-sentence plain-English summary (omit for answer/clarify/error)." },
      text: { type: "string", description: "For kind=answer: the answer text." },
      question: { type: "string", description: "For kind=clarify: the question to ask the user." },
      message: { type: "string", description: "For kind=error: a friendly error explanation." },
      household: {
        type: "object",
        properties: {
          displayName: { type: "string" },
          addressing: { type: "string" },
          side: { type: "string", enum: ["bride", "groom", "mutual"] },
          branch: { type: "string" },
          city: { type: "string" },
          country: { type: "string" },
          outOfTown: { type: "boolean" },
          invitedEvents: { type: "array", items: { type: "string" } },
          members: {
            type: "array",
            items: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                salutation: { type: "string" },
                role: {
                  type: "string",
                  enum: ["primary", "spouse", "child", "plus_one", "other"],
                },
                relationship: { type: "string" },
              },
              required: ["firstName", "lastName", "role", "relationship"],
            },
          },
        },
      },
      guestIds: { type: "array", items: { type: "string" } },
      eventIds: { type: "array", items: { type: "string" } },
      patch: {
        type: "object",
        properties: {
          side: { type: "string", enum: ["bride", "groom", "mutual"] },
          branch: { type: "string" },
          city: { type: "string" },
          categories: { type: "array", items: { type: "string" } },
          addCategories: { type: "array", items: { type: "string" } },
          removeCategories: { type: "array", items: { type: "string" } },
          outOfTown: { type: "boolean" },
        },
      },
      status: {
        type: "string",
        enum: ["pending", "confirmed", "declined", "tentative", "no_response"],
      },
      add: { type: "boolean", description: "For toggle_invitation: true=add, false=remove." },
    },
    required: ["kind"],
  },
};

// ── Context projection — keep this under ~80k chars ───────────────────────

function projectSnapshot(snapshot: GuestCommandRequest["snapshot"]): string {
  const { totals, events, households, guests } = snapshot;
  const lines: string[] = [];
  lines.push(`## Totals`);
  lines.push(
    `- ${totals.guests} guests across ${totals.households} households — ${totals.confirmed} confirmed, ${totals.pending} pending.`,
  );

  lines.push(`\n## Events`);
  for (const ev of events) {
    lines.push(`- [${ev.id}] ${ev.label} (${ev.date}, host: ${ev.host})`);
  }

  lines.push(`\n## Households (${households.length})`);
  for (const h of households) {
    lines.push(
      `- [${h.id}] ${h.displayName} — ${h.side}/${h.branch}, ${h.city}${h.outOfTown ? " (OOT)" : ""}, ${h.memberIds.length} members. Addressing: "${h.addressing}".`,
    );
  }

  lines.push(`\n## Guests (${guests.length})`);
  for (const g of guests) {
    const rsvpSummary = Object.entries(g.rsvp)
      .map(([eid, s]) => `${eid}:${s}`)
      .join(" ");
    lines.push(
      `- [${g.id}] ${g.firstName} ${g.lastName} · hh=${g.householdId} · ${g.side}/${g.branch} · ${g.city}${g.outOfTown ? " (OOT)" : ""} · ${g.vipTier} · ${g.relationship}${g.categories.length ? " · cats=" + g.categories.join(",") : ""}${g.dietary.length ? " · diet=" + g.dietary.join(",") : ""} · rsvp={${rsvpSummary}}`,
    );
  }

  return lines.join("\n");
}

// ── Heuristic fallback for offline mode ────────────────────────────────────

function heuristicAction(req: GuestCommandRequest): GuestCommandAction {
  const q = req.prompt.trim().toLowerCase();
  const snap = req.snapshot;

  // Simple Q&A patterns
  if (/how many.*out of town|out-of-town|out of town/.test(q)) {
    const n = snap.guests.filter((g) => g.outOfTown).length;
    return {
      kind: "answer",
      text: `${n} guests are marked as out of town.`,
    };
  }
  if (/how many.*confirmed/.test(q)) {
    return {
      kind: "answer",
      text: `${snap.totals.confirmed} guests have at least one confirmed event RSVP out of ${snap.totals.guests} total.`,
    };
  }
  if (/how many.*pending|how many.*haven.?t.*rsvp|who hasn.?t.*rsvp/.test(q)) {
    const pending = snap.guests.filter((g) =>
      Object.values(g.rsvp).some((s) => s === "pending" || s === "no_response"),
    );
    const bride = pending.filter((g) => g.side === "bride").length;
    const groom = pending.filter((g) => g.side === "groom").length;
    return {
      kind: "answer",
      text: `${pending.length} guests haven't RSVP'd yet — ${bride} from bride's side, ${groom} from groom's side.`,
    };
  }
  if (/split.*bride.*groom|bride.*groom.*split/.test(q)) {
    const b = snap.guests.filter((g) => g.side === "bride").length;
    const g = snap.guests.filter((x) => x.side === "groom").length;
    const m = snap.guests.filter((x) => x.side === "mutual").length;
    return {
      kind: "answer",
      text: `Bride's side: ${b} guests. Groom's side: ${g}. Mutual: ${m}.`,
    };
  }
  if (/vegetarian|dietary|veg count/.test(q)) {
    const veg = snap.guests.filter((g) =>
      g.dietary.some((d) => d === "vegetarian" || d === "vegan" || d === "jain"),
    ).length;
    return {
      kind: "answer",
      text: `${veg} guests have a vegetarian, vegan, or Jain dietary preference.`,
    };
  }

  return {
    kind: "error",
    message:
      "I'm running in offline mode — without ANTHROPIC_API_KEY I can only answer a few built-in questions. Try \"How many confirmed?\" or \"Who hasn't RSVP'd?\" or set the API key for full commands.",
  };
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: GuestCommandRequest;
  try {
    body = (await req.json()) as GuestCommandRequest;
  } catch {
    return NextResponse.json<GuestCommandResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body?.prompt?.trim()) {
    return NextResponse.json<GuestCommandResponse>(
      { ok: false, error: "Prompt is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<GuestCommandResponse>({
      ok: true,
      action: heuristicAction(body),
    });
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<GuestCommandResponse>({
      ok: true,
      action: heuristicAction(body),
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_action" },
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
          content: `Snapshot:\n${projectSnapshot(body.snapshot)}\n\nCommand: "${body.prompt}"`,
        },
      ],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_action",
    );
    if (!toolBlock) {
      return NextResponse.json<GuestCommandResponse>({
        ok: false,
        error: "Model did not return an action.",
      });
    }

    const input = toolBlock.input as Record<string, unknown>;
    const kind = input.kind as GuestCommandAction["kind"];

    const action = buildAction(kind, input);
    if (!action) {
      return NextResponse.json<GuestCommandResponse>({
        ok: false,
        error: "Model returned an invalid action shape.",
      });
    }

    return NextResponse.json<GuestCommandResponse>({ ok: true, action });
  } catch (err) {
    return NextResponse.json<GuestCommandResponse>({
      ok: false,
      error: err instanceof Error ? err.message : "Guest command failed.",
    });
  }
}

type AddHouseholdAction = Extract<GuestCommandAction, { kind: "add_household" }>;
type UpdateGuestsAction = Extract<GuestCommandAction, { kind: "update_guests" }>;

function buildAction(
  kind: GuestCommandAction["kind"],
  input: Record<string, unknown>,
): GuestCommandAction | null {
  switch (kind) {
    case "answer":
      return { kind, text: String(input.text ?? "") };
    case "clarify":
      return { kind, question: String(input.question ?? "Can you give me more detail?") };
    case "error":
      return { kind, message: String(input.message ?? "Sorry, I couldn't process that.") };
    case "add_household":
      if (!input.household) return null;
      return {
        kind,
        summary: String(input.summary ?? "Add household"),
        household: input.household as AddHouseholdAction["household"],
      };
    case "update_guests":
      return {
        kind,
        summary: String(input.summary ?? "Update guests"),
        guestIds: (input.guestIds as string[]) ?? [],
        patch: (input.patch as UpdateGuestsAction["patch"]) ?? {},
      };
    case "set_rsvp":
      return {
        kind,
        summary: String(input.summary ?? "Update RSVP"),
        guestIds: (input.guestIds as string[]) ?? [],
        eventIds: (input.eventIds as string[]) ?? [],
        status: (input.status as RsvpStatus) ?? "confirmed",
      };
    case "toggle_invitation":
      return {
        kind,
        summary: String(input.summary ?? "Update invitations"),
        guestIds: (input.guestIds as string[]) ?? [],
        eventIds: (input.eventIds as string[]) ?? [],
        add: Boolean(input.add),
      };
    default:
      return null;
  }
}
