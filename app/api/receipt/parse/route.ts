// ── POST /api/receipt/parse ───────────────────────────────────────────────
// Parse a receipt image (base64 data URL) into structured fields so the
// couple/organizer doesn't have to retype the whole receipt. Matches the
// dispatch pattern of app/api/hmua/ai/route.ts: dynamic SDK import,
// ANTHROPIC_API_KEY gate, tool_use for structured output, graceful stub
// when the key is missing so the UI still works in dev.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

// ── Request / response types ──────────────────────────────────────────────

export interface ReceiptParseRequest {
  // Base64 data URL (data:image/jpeg;base64,...). PDFs not supported here;
  // the client should rasterise to an image first.
  image: string;
}

export interface ParsedReceipt {
  vendor: string;
  date: string; // ISO yyyy-mm-dd — empty string if unreadable
  total: number; // USD; 0 if unreadable
  currency: string; // ISO code, default USD
  lineItems: ParsedLineItem[];
  confidence: "high" | "medium" | "low";
}

export interface ParsedLineItem {
  label: string;
  amount: number;
  qty?: number;
}

export interface ReceiptParseResponse {
  ok: boolean;
  model: string;
  data?: ParsedReceipt;
  error?: string;
}

// ── SDK ambient typing ────────────────────────────────────────────────────

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

// ── Tool spec ─────────────────────────────────────────────────────────────

const PARSE_RECEIPT_TOOL = {
  name: "emit_parsed_receipt",
  description:
    "Return the receipt parsed into structured fields. Use best-guess defaults when fields are unreadable rather than hallucinating.",
  input_schema: {
    type: "object",
    properties: {
      vendor: {
        type: "string",
        description:
          "Merchant / restaurant name as printed on the receipt. Empty string if unreadable.",
      },
      date: {
        type: "string",
        description:
          "Transaction date as ISO yyyy-mm-dd. Empty string if missing or ambiguous.",
      },
      total: {
        type: "number",
        description:
          "Grand total (post-tax, post-tip) in the receipt's stated currency, as a number (no symbol). 0 if unreadable.",
      },
      currency: {
        type: "string",
        description:
          "Three-letter ISO currency code — USD, EUR, GBP, INR, etc. Default USD if not explicitly shown.",
      },
      line_items: {
        type: "array",
        description:
          "Individual line items with their amount. Skip service/tax/tip lines; only product/food lines.",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            amount: { type: "number" },
            qty: { type: "number" },
          },
          required: ["label", "amount"],
        },
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description:
          "High = clean digital receipt or pristine photo. Medium = readable with minor ambiguity. Low = blurred, cropped, or heavily inferred.",
      },
    },
    required: ["vendor", "date", "total", "currency", "line_items", "confidence"],
  },
} as const;

const SYSTEM_PROMPT = `You extract structured fields from receipt images for an expense tracker. Be accurate over confident — prefer returning 0 or an empty string over a hallucinated number.

Rules:
- Grand total is the post-tax, post-tip total the card was actually charged. If only subtotal is visible, return subtotal and note it in confidence="medium".
- Line items: only the actual products/food lines. Skip subtotal, tax, service charge, tip, and total lines from the line items array.
- Date format: ISO yyyy-mm-dd. US-style mm/dd/yy → yyyy-mm-dd. If the year is ambiguous assume current year.
- Currency: detect from symbol ($ → USD, £ → GBP, € → EUR, ₹ → INR). Default USD.
- Confidence: "high" only if every field was clearly legible. "low" if you had to guess the total or vendor.

Always call the emit_parsed_receipt tool. Never respond in prose.`;

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let body: ReceiptParseRequest;
  try {
    body = (await req.json()) as ReceiptParseRequest;
  } catch {
    return json<ReceiptParseResponse>(
      { ok: false, model: "none", error: "Invalid JSON body." },
      400,
    );
  }

  const dataUrl = body?.image;
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return json<ReceiptParseResponse>(
      {
        ok: false,
        model: "none",
        error: "Expected a base64 image data URL in `image` field.",
      },
      400,
    );
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return json<ReceiptParseResponse>(
      { ok: false, model: "none", error: "Malformed data URL." },
      400,
    );
  }
  const mediaType = match[1];
  const base64 = match[2];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json<ReceiptParseResponse>({
      ok: true,
      model: "offline-stub",
      data: {
        vendor: "",
        date: new Date().toISOString().slice(0, 10),
        total: 0,
        currency: "USD",
        lineItems: [],
        confidence: "low",
      },
    });
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return json<ReceiptParseResponse>({
      ok: false,
      model: "offline",
      error:
        "The @anthropic-ai/sdk package isn't installed. Run `npm install @anthropic-ai/sdk`.",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [PARSE_RECEIPT_TOOL],
      tool_choice: { type: "tool", name: PARSE_RECEIPT_TOOL.name },
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
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "Parse this receipt.",
            },
          ],
        },
      ],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === PARSE_RECEIPT_TOOL.name,
    );
    if (!toolBlock) {
      return json<ReceiptParseResponse>({
        ok: false,
        model: MODEL,
        error: "Model did not return a parsed receipt.",
      });
    }

    const input = toolBlock.input as {
      vendor?: string;
      date?: string;
      total?: number;
      currency?: string;
      line_items?: { label: string; amount: number; qty?: number }[];
      confidence?: "high" | "medium" | "low";
    };

    return json<ReceiptParseResponse>({
      ok: true,
      model: MODEL,
      data: {
        vendor: input.vendor ?? "",
        date: input.date ?? "",
        total: Number(input.total ?? 0) || 0,
        currency: input.currency ?? "USD",
        lineItems: (input.line_items ?? []).map((li) => ({
          label: li.label,
          amount: Number(li.amount ?? 0) || 0,
          qty: typeof li.qty === "number" ? li.qty : undefined,
        })),
        confidence: input.confidence ?? "medium",
      },
    });
  } catch (err) {
    return json<ReceiptParseResponse>({
      ok: false,
      model: MODEL,
      error: err instanceof Error ? err.message : "AI request failed.",
    });
  }
}

function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}
