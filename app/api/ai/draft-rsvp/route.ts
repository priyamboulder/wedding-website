// ── POST /api/ai/draft-rsvp ───────────────────────────────────────────────
// Generates personalized RSVP follow-up messages for pending households.
//
// The client sends a batch of pending households (addressing, events they
// are invited to, side, city) plus a tone selector. The endpoint returns
// one message per household, ready to drop into WhatsApp or email. A
// heuristic fallback ensures the panel is usable without ANTHROPIC_API_KEY.

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

export type DraftTone = "formal" | "warm" | "casual";

interface HouseholdDraftRequest {
  id: string;
  addressing: string;
  side: "bride" | "groom" | "mutual";
  city: string;
  events: Array<{ id: string; label: string; date: string }>;
  primaryRelationship?: string;
}

export interface DraftRsvpRequest {
  tone: DraftTone;
  coupleNames: string;    // e.g. "Ananya & Arjun"
  rsvpDeadline: string;   // human-readable, e.g. "May 15"
  households: HouseholdDraftRequest[];
}

export interface DraftRsvpMessage {
  householdId: string;
  message: string;
}

export interface DraftRsvpResponse {
  ok: boolean;
  messages?: DraftRsvpMessage[];
  model?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You draft RSVP follow-up messages for an Indian wedding. You receive a batch of households who haven't RSVPd yet. For each one, write a short, personalized message — not a template.

Rules:
1. Return via the \`return_messages\` tool. Never prose.
2. Honor the addressing exactly. "Shri & Smt. Krishnan Iyer" stays "Shri & Smt. Krishnan Iyer" at the top of the message.
3. List the specific events this household is invited to, with dates. Do not invent events.
4. End with a clear ask to confirm attendance before the RSVP deadline given.
5. Sign off with the couple's names.
6. Tone:
   - formal: respectful, traditional, "We would be honored by your presence…"
   - warm: heartfelt but still proper, uses "we're so excited to celebrate with you"
   - casual: friendly, WhatsApp-length, minimal formality — still polite.
7. Vary wording across households — do not paste the same template. Mention the city/relationship only when it makes the message feel specific, not forced.
8. 4–8 lines. No subject line. No markdown. No emojis.`;

const TOOL_DEFINITION = {
  name: "return_messages",
  description: "Return a per-household RSVP follow-up message.",
  input_schema: {
    type: "object" as const,
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            householdId: { type: "string" },
            message: { type: "string" },
          },
          required: ["householdId", "message"],
        },
      },
    },
    required: ["messages"],
  },
};

function projectContext(body: DraftRsvpRequest): string {
  const lines: string[] = [];
  lines.push(`Tone: ${body.tone}`);
  lines.push(`Couple: ${body.coupleNames}`);
  lines.push(`RSVP deadline: ${body.rsvpDeadline}`);
  lines.push(`\nHouseholds:`);
  for (const h of body.households) {
    const events = h.events.map((e) => `${e.label} (${e.date})`).join(", ");
    lines.push(
      `- [${h.id}] "${h.addressing}" — ${h.side}'s side, ${h.city}${h.primaryRelationship ? ", " + h.primaryRelationship : ""}. Events: ${events}.`,
    );
  }
  lines.push(
    "\nReturn one message per household via return_messages. Do not skip any household.",
  );
  return lines.join("\n");
}

function heuristicMessage(
  h: HouseholdDraftRequest,
  tone: DraftTone,
  couple: string,
  deadline: string,
): string {
  const eventList = h.events.map((e) => `• ${e.label} — ${e.date}`).join("\n");

  if (tone === "formal") {
    return `Respected ${h.addressing},\n\nWe hope this message finds you well. We are writing to warmly follow up on your invitation to ${couple}'s wedding celebrations.\n\nYou are invited to:\n${eventList}\n\nWe would be honored by your presence and kindly request you to confirm by ${deadline}.\n\nWith warm regards,\n${couple}`;
  }
  if (tone === "casual") {
    return `Dear ${h.addressing},\n\nJust a quick note — we'd love to have you with us for:\n${eventList}\n\nIf you could let us know by ${deadline} whether you can make it, that would mean a lot.\n\nLooking forward to celebrating,\n${couple}`;
  }
  return `Dear ${h.addressing},\n\nWe're so excited to celebrate our wedding with the people who matter most, and we're hoping that includes you. You are warmly invited to:\n${eventList}\n\nCould you let us know by ${deadline} whether you'll be able to join us? We'd love to plan for you properly.\n\nWith love,\n${couple}`;
}

export async function POST(req: Request) {
  let body: DraftRsvpRequest;
  try {
    body = (await req.json()) as DraftRsvpRequest;
  } catch {
    return NextResponse.json<DraftRsvpResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body?.households?.length) {
    return NextResponse.json<DraftRsvpResponse>(
      { ok: false, error: "No households to draft for." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<DraftRsvpResponse>({
      ok: true,
      messages: body.households.map((h) => ({
        householdId: h.id,
        message: heuristicMessage(h, body.tone, body.coupleNames, body.rsvpDeadline),
      })),
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
    return NextResponse.json<DraftRsvpResponse>({
      ok: true,
      messages: body.households.map((h) => ({
        householdId: h.id,
        message: heuristicMessage(h, body.tone, body.coupleNames, body.rsvpDeadline),
      })),
      model: "offline",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_messages" },
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
        b.type === "tool_use" && b.name === "return_messages",
    );
    if (!toolBlock) {
      return NextResponse.json<DraftRsvpResponse>({
        ok: true,
        messages: body.households.map((h) => ({
          householdId: h.id,
          message: heuristicMessage(h, body.tone, body.coupleNames, body.rsvpDeadline),
        })),
        model: "offline",
      });
    }

    const input = toolBlock.input as { messages?: Partial<DraftRsvpMessage>[] };
    const received = (input.messages ?? []).filter(
      (m) => m.householdId && m.message,
    ) as DraftRsvpMessage[];

    // Backfill any households the model skipped with heuristic drafts so the
    // UI is never missing a card.
    const covered = new Set(received.map((m) => m.householdId));
    const patched: DraftRsvpMessage[] = [
      ...received,
      ...body.households
        .filter((h) => !covered.has(h.id))
        .map((h) => ({
          householdId: h.id,
          message: heuristicMessage(h, body.tone, body.coupleNames, body.rsvpDeadline),
        })),
    ];

    return NextResponse.json<DraftRsvpResponse>({
      ok: true,
      messages: patched,
      model: MODEL,
    });
  } catch (err) {
    return NextResponse.json<DraftRsvpResponse>({
      ok: true,
      messages: body.households.map((h) => ({
        householdId: h.id,
        message: heuristicMessage(h, body.tone, body.coupleNames, body.rsvpDeadline),
      })),
      model: "offline",
      error: err instanceof Error ? err.message : "draft-rsvp failed",
    });
  }
}
