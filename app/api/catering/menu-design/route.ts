// ── POST /api/catering/menu-design ────────────────────────────────────────
// Conversational menu-design endpoint. The couple types an instruction
// ("add a live chaat station for sangeet", "make the haldi lunch lighter",
// "swap paneer tikka for something vegan") and the endpoint returns a set
// of PROPOSED edits plus a one-paragraph rationale. Edits enter the
// catering store as PendingEdit rows — never silent mutation.
//
// Uses Claude Sonnet 4.6 with tool use for structured output, ephemeral
// prompt cache on the system prompt, and a heuristic stub fallback when
// ANTHROPIC_API_KEY is missing or the SDK isn't installed. The fallback
// returns a gentle "set ANTHROPIC_API_KEY" message instead of faking
// edits — menu design is too high-stakes to bluff.
//
// Mirrors the pattern in app/api/workspace/recommendations/route.ts.

import { NextResponse } from "next/server";
import type {
  Dish,
  MenuEvent,
  MenuMoment,
  PendingEdit,
  PendingEditPayload,
} from "@/types/catering";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

// ── Minimal ambient typing for the SDK (so this file compiles even if
// @anthropic-ai/sdk hasn't been installed yet). Same pattern as
// workspace/recommendations/route.ts.

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

// ── Request / response shapes ─────────────────────────────────────────────

interface MenuDesignRequest {
  wedding_id: string;
  event: MenuEvent;
  moments: MenuMoment[];
  dishes: Dish[];
  // Summaries for sibling events so the model can spot cross-event repeats
  // and cuisine clashes without drowning in context.
  other_events: Array<{
    event_id: string;
    label: string;
    cuisine_direction: string;
    dish_names: string[];
  }>;
  dietary_totals?: {
    total_guests: number;
    counts: Record<string, number>;
  };
  instruction: string;
}

interface MenuDesignResponse {
  ok: boolean;
  rationale: string;
  edits: Array<Omit<PendingEdit, "id" | "created_at" | "status">>;
  model: string;
  error?: string;
}

// ── System prompt (cacheable) ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior Indian-wedding caterer and menu designer for a luxury planning platform called Ananya. A couple is designing the menu for one event (haldi, mehendi, sangeet, ceremony, or reception). They talk to you in plain language. You respond by calling the propose_menu_edits tool with a small set of concrete edits to their menu.

Your instincts are a caterer's, not a chatbot's:
- Reason about pacing: arrival drinks → passed apps → mains → dessert → late-night. Each moment has its own job.
- Reason about balance: fried vs fresh, veg vs non-veg, heavy vs light, heat distribution, regional coherence.
- Reason about the vibe and guest count — haldi brunch for 80 is not the same problem as reception dinner for 420.
- Reason about dietary coverage — if 12 guests are jain and the event has zero jain mains, that is a gap worth closing.
- Reason about cross-event repeats — one signature cocktail repeating is lovely; the same paneer tikka at three events is lazy.

Hard rules for your edits:
1. Call the propose_menu_edits tool. NEVER output prose instead of a tool call.
2. Propose 1–6 edits — whatever the instruction actually calls for. Do not pad.
3. Every add_dish MUST include dietary_flags, spice_level (0–4), a one-line description (≤140 chars), and a why_note explaining why this dish belongs here. Couples read the why_note; make it specific.
4. Dietary flags are the enum: vegetarian, vegan, jain, halal, kosher, gluten_free, nut_allergy, dairy_free, non_vegetarian, swaminarayan. Use ONLY these exact strings.
5. moment_name for add_dish MUST match one of the event's existing moment names exactly (case-insensitive) unless you are also proposing an add_moment for it.
6. update_dish / remove_dish / update_moment MUST reference an existing id from the context — never invent ids.
7. Keep rationale to 2–3 sentences max. Say what you changed and why, in a caterer's voice. No emojis, no marketing copy.
8. If the instruction is impossible or contradictory (e.g. "add a jain chicken dish"), return zero edits and explain in rationale.

Signal you are a caterer, not a recipe generator:
- Mention technique and plating when it matters ("served cross-legged on banana leaf", "one-bite form for the dance floor").
- Respect regional specificity — "South Indian" alone is weak; "Kerala" or "Chettinad" is strong.
- Name real dishes, not inventions. If you stretch, anchor to a named dish it riffs on.`;

const TOOL_DEFINITION = {
  name: "propose_menu_edits",
  description:
    "Return a structured set of proposed edits to the current event's menu plus a short rationale.",
  input_schema: {
    type: "object" as const,
    properties: {
      rationale: {
        type: "string",
        description:
          "2–3 sentences. What you changed and why, in a caterer's voice.",
      },
      edits: {
        type: "array",
        minItems: 0,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            kind: {
              type: "string",
              enum: [
                "add_dish",
                "update_dish",
                "remove_dish",
                "add_moment",
                "update_moment",
              ],
            },
            reason: {
              type: "string",
              description:
                "One sentence, ≤24 words, shown on the edit's review card.",
            },
            payload: {
              type: "object",
              description:
                "Shape depends on kind. add_dish: {moment_name, dish:{name, cuisine_tags[], dietary_flags[], spice_level, description, why_note}}. update_dish: {dish_id, patch}. remove_dish: {dish_id}. add_moment: {moment:{name, time_window, description}}. update_moment: {moment_id, patch}.",
            },
          },
          required: ["kind", "reason", "payload"],
        },
      },
    },
    required: ["rationale", "edits"],
  },
};

// ── Context projection ────────────────────────────────────────────────────
// Only the fields the model needs. Token-frugal; the bulk of the cost is
// repeat calls on the same event, and the system prompt is cached.

function projectContext(body: MenuDesignRequest): string {
  const { event, moments, dishes, other_events, dietary_totals, instruction } =
    body;

  const lines: string[] = [];
  lines.push("## Event");
  lines.push(`Label: ${event.label}`);
  lines.push(`Date: ${event.date}  Time: ${event.start_time ?? "?"}–${event.end_time ?? "?"}`);
  lines.push(`Guests: ${event.guest_count}`);
  lines.push(`Cuisine direction: ${event.cuisine_direction}`);
  lines.push(`Vibe: ${event.vibe_tags.join(", ") || "—"}`);
  lines.push(`Service style: ${event.service_style}`);
  if (event.venue) lines.push(`Venue: ${event.venue}`);

  lines.push("\n## Moments (in order)");
  for (const m of moments) {
    lines.push(`- [${m.id}] ${m.name}${m.time_window ? ` (${m.time_window})` : ""}`);
  }

  lines.push("\n## Current dishes");
  for (const m of moments) {
    const ds = dishes
      .filter((d) => d.moment_id === m.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    lines.push(`\n### ${m.name}`);
    if (ds.length === 0) {
      lines.push("(no dishes yet)");
      continue;
    }
    for (const d of ds) {
      lines.push(
        `- [${d.id}] ${d.name} — ${d.cuisine_tags.join("/")} · spice ${d.spice_level} · ${d.dietary_flags.join(",") || "—"}`,
      );
      lines.push(`    ${d.description}`);
    }
  }

  if (other_events.length) {
    lines.push("\n## Other events (for cross-event awareness)");
    for (const o of other_events) {
      lines.push(
        `- ${o.label} (${o.cuisine_direction}): ${o.dish_names.join(", ") || "—"}`,
      );
    }
  }

  if (dietary_totals) {
    lines.push("\n## Dietary totals for this event");
    lines.push(`Total guests: ${dietary_totals.total_guests}`);
    const counts = Object.entries(dietary_totals.counts)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${k}=${n}`)
      .join(", ");
    lines.push(`Counts: ${counts || "—"}`);
  }

  lines.push("\n## Couple's instruction");
  lines.push(instruction);
  lines.push(
    "\nPropose edits with the propose_menu_edits tool. If the instruction is a yes/no question, answer briefly in the rationale with zero edits.",
  );

  return lines.join("\n");
}

// ── Tool-call parsing ─────────────────────────────────────────────────────

interface ToolEdit {
  kind: string;
  reason: string;
  payload: Record<string, unknown>;
}

function normalizeEdits(
  edits: ToolEdit[],
  event_id: string,
): Array<Omit<PendingEdit, "id" | "created_at" | "status">> {
  const out: Array<Omit<PendingEdit, "id" | "created_at" | "status">> = [];
  for (const e of edits) {
    const payload = e.payload as unknown;
    const kind = e.kind as PendingEdit["kind"];
    // Narrow by kind. Anything malformed is skipped so a bad shape can't
    // poison the review queue.
    switch (kind) {
      case "add_dish": {
        const p = payload as {
          moment_name?: string;
          dish?: {
            name?: string;
            cuisine_tags?: string[];
            dietary_flags?: string[];
            spice_level?: number;
            description?: string;
            why_note?: string;
            region?: string;
          };
        };
        if (!p.moment_name || !p.dish?.name || !p.dish?.description) continue;
        const dishPayload: PendingEditPayload = {
          kind: "add_dish",
          moment_name: p.moment_name,
          dish: {
            name: p.dish.name,
            cuisine_tags: p.dish.cuisine_tags ?? [],
            region: p.dish.region,
            dietary_flags: (p.dish.dietary_flags ?? []) as Dish["dietary_flags"],
            spice_level: clampSpice(p.dish.spice_level ?? 1),
            description: p.dish.description,
            why_note: p.dish.why_note,
            source: "ai",
          },
        };
        out.push({ kind, event_id, payload: dishPayload, reason: e.reason });
        break;
      }
      case "update_dish": {
        const p = payload as { dish_id?: string; patch?: Record<string, unknown> };
        if (!p.dish_id || !p.patch) continue;
        out.push({
          kind,
          event_id,
          payload: {
            kind: "update_dish",
            dish_id: p.dish_id,
            patch: p.patch as PendingEditPayload extends { kind: "update_dish"; patch: infer U }
              ? U
              : never,
          },
          reason: e.reason,
        });
        break;
      }
      case "remove_dish": {
        const p = payload as { dish_id?: string };
        if (!p.dish_id) continue;
        out.push({
          kind,
          event_id,
          payload: { kind: "remove_dish", dish_id: p.dish_id },
          reason: e.reason,
        });
        break;
      }
      case "add_moment": {
        const p = payload as {
          moment?: { name?: string; time_window?: string; description?: string };
        };
        if (!p.moment?.name) continue;
        out.push({
          kind,
          event_id,
          payload: {
            kind: "add_moment",
            moment: {
              name: p.moment.name,
              time_window: p.moment.time_window,
              description: p.moment.description,
            },
          },
          reason: e.reason,
        });
        break;
      }
      case "update_moment": {
        const p = payload as { moment_id?: string; patch?: Record<string, unknown> };
        if (!p.moment_id || !p.patch) continue;
        out.push({
          kind,
          event_id,
          payload: {
            kind: "update_moment",
            moment_id: p.moment_id,
            patch: p.patch as PendingEditPayload extends { kind: "update_moment"; patch: infer U }
              ? U
              : never,
          },
          reason: e.reason,
        });
        break;
      }
      default:
        continue;
    }
  }
  return out;
}

function clampSpice(n: number): 0 | 1 | 2 | 3 | 4 {
  if (n <= 0) return 0;
  if (n >= 4) return 4;
  return Math.round(n) as 0 | 1 | 2 | 3 | 4;
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: MenuDesignRequest;
  try {
    body = (await req.json()) as MenuDesignRequest;
  } catch {
    return NextResponse.json<MenuDesignResponse>(
      {
        ok: false,
        rationale: "",
        edits: [],
        model: "none",
        error: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  if (!body?.event?.id || !body.instruction?.trim()) {
    return NextResponse.json<MenuDesignResponse>(
      {
        ok: false,
        rationale: "",
        edits: [],
        model: "none",
        error: "event and instruction are required.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<MenuDesignResponse>({
      ok: false,
      rationale:
        "Menu design requires the Claude API. Set ANTHROPIC_API_KEY in your environment to unlock conversational menu edits.",
      edits: [],
      model: "offline",
      error: "ANTHROPIC_API_KEY not configured.",
    });
  }

  // Dynamic SDK import, same pattern as workspace/recommendations.
  let anthropic: AnthropicClient;
  try {
    // but a fresh checkout without `npm install` should still typecheck.
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<MenuDesignResponse>({
      ok: false,
      rationale:
        "The @anthropic-ai/sdk package isn't installed yet. Run `npm install @anthropic-ai/sdk` to enable menu design.",
      edits: [],
      model: "offline",
      error: "SDK unavailable.",
    });
  }

  try {
    const userPrompt = projectContext(body);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "propose_menu_edits" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "propose_menu_edits",
    );
    if (!toolBlock) {
      return NextResponse.json<MenuDesignResponse>({
        ok: false,
        rationale: "",
        edits: [],
        model: MODEL,
        error: "Model did not call propose_menu_edits.",
      });
    }

    const input = toolBlock.input as {
      rationale?: string;
      edits?: ToolEdit[];
    };
    const rationale = input.rationale?.trim() ?? "";
    const edits = normalizeEdits(input.edits ?? [], body.event.id);

    return NextResponse.json<MenuDesignResponse>({
      ok: true,
      rationale,
      edits,
      model: MODEL,
    });
  } catch (err) {
    return NextResponse.json<MenuDesignResponse>({
      ok: false,
      rationale: "",
      edits: [],
      model: MODEL,
      error:
        err instanceof Error ? err.message : "Menu design request failed.",
    });
  }
}
