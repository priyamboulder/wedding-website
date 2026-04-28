// ── POST /api/catering/signature-cocktails ────────────────────────────────
// Designs 3 signature cocktails for one event, given a brief like
// "gin, rose, and something unexpected for sangeet". Returns name,
// ingredients (with amounts), garnish, and a sensory description per
// cocktail. Claude Sonnet 4.6 with tool use. Graceful fallback.

import { NextResponse } from "next/server";
import type { MenuEvent, SignatureCocktail } from "@/types/catering";

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

interface CocktailsRequest {
  event: Pick<
    MenuEvent,
    "id" | "label" | "guest_count" | "vibe_tags" | "cuisine_direction"
  >;
  existing_cocktails: string[]; // names of cocktails already designed for this event — so we don't repeat
  brief: string;                // free-form from the couple
}

interface CocktailsResponse {
  ok: boolean;
  cocktails: Array<Omit<SignatureCocktail, "id" | "sort_order" | "event_id">>;
  rationale: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a cocktail program designer for Indian weddings. You design signature cocktails that fit a specific event's vibe, guest count, and cuisine direction. You think like a bar program director — stock depth, speed per cocktail, garnish logistics — not a home bartender.

Rules:
1. Call the return_cocktails tool. NEVER prose.
2. Return exactly 3 cocktails unless the couple asks for a different number. Each should hit a different emotional register.
3. ingredients: array of short phrases with amounts where it matters ("London dry gin, 60ml", "Saffron syrup, 20ml"). Keep ingredient lists lean — 4–6 lines each.
4. garnish: one line, specific ("Three strands of saffron · pistachio-salt rim half"). No emojis.
5. description: one sentence, sensory. Names the flavor arc, not the ingredients.
6. Named cocktails beat descriptive names. "Saffron-Gin Sour" beats "Indian Gin Cocktail".
7. Respect scale: a passed cocktail for 400 guests needs a fast pour. A slow stirred drink for a 60-person haldi can be more ornate.
8. Never repeat a name from existing_cocktails.
9. rationale: 1–2 sentences explaining the set — how these three work together for the event.`;

const TOOL_DEFINITION = {
  name: "return_cocktails",
  description: "Return 3 signature cocktails for the event.",
  input_schema: {
    type: "object" as const,
    properties: {
      rationale: { type: "string" },
      cocktails: {
        type: "array",
        minItems: 1,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            ingredients: {
              type: "array",
              minItems: 3,
              maxItems: 8,
              items: { type: "string" },
            },
            garnish: { type: "string" },
            description: { type: "string" },
          },
          required: ["name", "ingredients", "garnish", "description"],
        },
      },
    },
    required: ["rationale", "cocktails"],
  },
};

function projectContext(body: CocktailsRequest): string {
  const { event, existing_cocktails, brief } = body;
  const lines: string[] = [];
  lines.push(`## Event`);
  lines.push(`${event.label} — ${event.guest_count} guests`);
  lines.push(`Cuisine direction: ${event.cuisine_direction}`);
  lines.push(`Vibe: ${event.vibe_tags.join(", ") || "—"}`);
  if (existing_cocktails.length > 0) {
    lines.push(`\n## Already on the bar program (do not repeat)`);
    for (const name of existing_cocktails) lines.push(`- ${name}`);
  }
  lines.push(`\n## Couple's brief`);
  lines.push(brief);
  lines.push(`\nReturn 3 cocktails via the return_cocktails tool.`);
  return lines.join("\n");
}

export async function POST(req: Request) {
  let body: CocktailsRequest;
  try {
    body = (await req.json()) as CocktailsRequest;
  } catch {
    return NextResponse.json<CocktailsResponse>(
      { ok: false, cocktails: [], rationale: "", error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  if (!body?.event?.id || !body.brief?.trim()) {
    return NextResponse.json<CocktailsResponse>(
      { ok: false, cocktails: [], rationale: "", error: "event and brief are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<CocktailsResponse>({
      ok: false,
      cocktails: [],
      rationale:
        "Cocktail design requires the Claude API. Set ANTHROPIC_API_KEY to unlock.",
      error: "ANTHROPIC_API_KEY not configured.",
    });
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<CocktailsResponse>({
      ok: false,
      cocktails: [],
      rationale:
        "The @anthropic-ai/sdk package isn't installed. Run `npm install @anthropic-ai/sdk`.",
      error: "SDK unavailable.",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_cocktails" },
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
        b.type === "tool_use" && b.name === "return_cocktails",
    );
    if (!toolBlock) {
      return NextResponse.json<CocktailsResponse>({
        ok: false,
        cocktails: [],
        rationale: "",
        error: "Model did not call return_cocktails.",
      });
    }
    const input = toolBlock.input as {
      rationale?: string;
      cocktails?: Array<{
        name?: string;
        ingredients?: string[];
        garnish?: string;
        description?: string;
      }>;
    };
    const cocktails = (input.cocktails ?? [])
      .filter((c) => c.name && c.ingredients?.length && c.description)
      .map((c) => ({
        name: c.name!,
        ingredients: c.ingredients!,
        garnish: c.garnish,
        description: c.description!,
        source: "ai" as const,
      }));

    return NextResponse.json<CocktailsResponse>({
      ok: true,
      cocktails,
      rationale: input.rationale ?? "",
    });
  } catch (err) {
    return NextResponse.json<CocktailsResponse>({
      ok: false,
      cocktails: [],
      rationale: "",
      error: err instanceof Error ? err.message : "Cocktail design failed.",
    });
  }
}
