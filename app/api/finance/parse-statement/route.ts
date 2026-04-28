// ── POST /api/finance/parse-statement ─────────────────────────────────────
// Parses an uploaded bank statement into transaction drafts. Two modes:
//
//   • pdf  — Send the PDF inline as a base64 document block to Claude Haiku
//            4.5 and request structured JSON.
//   • csv_rows — Client has already parsed the CSV into rows; we forward
//            only the *ambiguous* rows (no local category match) to Claude
//            for categorization + event hints.
//
// The system prompt is cache-controlled: ephemeral so repeat calls within
// 5 minutes reuse the cached prefix. We call fetch against the Anthropic
// REST API directly (same pattern as app/api/journal/auto-tag/route.ts) to
// avoid adding the SDK dependency at runtime.
//
// The route returns an array of ParsedTransactionDraft shaped objects. The
// client is responsible for letting the user review + commit each row and
// for running duplicate detection against the existing ledger.

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import type {
  FinanceCategory,
  FinanceContributor,
  FinanceEvent,
  ParsedTransactionDraft,
} from "@/types/finance";

export const runtime = "nodejs";
// PDFs can push past the default edge body limit; allow up to ~10MB.
export const maxDuration = 60;

// ── Request shapes ────────────────────────────────────────────────────────

interface PdfRequest {
  mode: "pdf";
  // base64 string (no data:…;base64, prefix)
  pdf_base64: string;
  filename?: string;
  categories: Pick<FinanceCategory, "id" | "name">[];
  events: Pick<FinanceEvent, "id" | "name">[];
  contributors: Pick<FinanceContributor, "id" | "name" | "relationship">[];
}

interface CsvRequest {
  mode: "csv_rows";
  rows: Array<{
    date: string;
    description: string;
    amount_cents: number;
    account_last4: string | null;
  }>;
  categories: Pick<FinanceCategory, "id" | "name">[];
  events: Pick<FinanceEvent, "id" | "name">[];
  contributors: Pick<FinanceContributor, "id" | "name" | "relationship">[];
}

type RequestBody = PdfRequest | CsvRequest;

// ── System prompts (cached via cache_control) ─────────────────────────────

const PDF_SYSTEM_PROMPT = `You parse bank and credit-card statements for a luxury Indian wedding planning app.

Extract every money-out transaction (purchases, withdrawals, payments, wires). IGNORE account-balance lines, deposits/credits, interest, and fees you cannot confidently attribute to a wedding vendor.

For each transaction return:
  date              — ISO yyyy-mm-dd
  description       — raw merchant string, trimmed, UPPERCASE preserved
  amount_cents      — integer cents, positive for money out
  account_last4     — last 4 of the account/card if visible, else null
  suggested_category_id — MUST be an id from the provided category list, or null
  suggested_event_id    — MUST be an id from the provided event list, or null
  suggested_payer_contributor_id — MUST be an id from the provided contributor list, or null. Leave null unless you have strong evidence.
  confidence        — "high" | "medium" | "low"

Respond with valid JSON only. Shape:
{"transactions": [ {...}, ... ]}

Rules:
1. Use ONLY ids from the provided lists for suggested_* fields.
2. If nothing in the lists fits, return null — do not invent ids.
3. Match merchants against Indian-wedding vocab: florist/flowers → decor_florals; catering → catering; photographer/studio → photography; cinematographer/films → videography; dj/band → entertainment; makeup/hair/glam → hmua; hotel/ballroom/estate → venue; mehendi/henna → mehndi; pandit/priest → pandit_ceremony; shuttle/limo/transport → transportation; stationery/invitation → stationery; couture/lehenga/sherwani/jeweler → wardrobe.
4. Event hints: mehendi mandap flowers → Mehendi; reception florals → Reception; baraat → Ceremony; brunch → Post-wedding Brunch.
5. No prose outside the JSON. No markdown fences.`;

const CSV_SYSTEM_PROMPT = `You categorize bank-statement rows for a luxury Indian wedding planning app.

You will receive a JSON array of rows with fields: date, description, amount_cents, account_last4.
Your job is to return the SAME rows (same shape) with three extra fields filled in:
  suggested_category_id  — id from the provided category list or null
  suggested_event_id     — id from the provided event list or null
  suggested_payer_contributor_id — id from the provided contributor list or null
  confidence            — "high" | "medium" | "low"

Respond with valid JSON only. Shape:
{"transactions": [ {...}, ... ]}

Rules:
1. Return rows in the same order you received them.
2. Use ONLY ids from the provided lists; null is valid.
3. No prose. No markdown fences.`;

// ── Anthropic response shape ──────────────────────────────────────────────

interface AnthropicMessagesResponse {
  content: Array<
    | { type: "text"; text: string }
    | { type: string; [key: string]: unknown }
  >;
}

// ── Handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { response: authError } = await requireAuth(req);
  if (authError) return authError;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        transactions: [],
        error:
          "ANTHROPIC_API_KEY not configured — parser is offline. Set the env var to enable statement parsing.",
      },
      { status: 200 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { transactions: [], error: "Invalid JSON" },
      { status: 400 },
    );
  }

  try {
    if (body.mode === "pdf") {
      const drafts = await parsePdf(body, apiKey);
      return NextResponse.json({ transactions: drafts });
    }
    if (body.mode === "csv_rows") {
      const drafts = await categorizeRows(body, apiKey);
      return NextResponse.json({ transactions: drafts });
    }
    return NextResponse.json(
      { transactions: [], error: "Unknown mode" },
      { status: 400 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        transactions: [],
        error: err instanceof Error ? err.message : "Parse failed",
      },
      { status: 200 },
    );
  }
}

// ── PDF path: inline base64 document block ────────────────────────────────

async function parsePdf(
  body: PdfRequest,
  apiKey: string,
): Promise<ParsedTransactionDraft[]> {
  const listing = contextListing(body.categories, body.events, body.contributors);
  const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "pdfs-2024-09-25",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: PDF_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: body.pdf_base64,
              },
            },
            {
              type: "text",
              text: `${listing}\n\nExtract every money-out transaction in the attached statement. Return JSON only.`,
            },
          ],
        },
      ],
    }),
  });

  if (!apiRes.ok) {
    const errText = await apiRes.text().catch(() => "");
    throw new Error(`Anthropic PDF API ${apiRes.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await apiRes.json()) as AnthropicMessagesResponse;
  const textBlock = data.content.find(
    (b): b is { type: "text"; text: string } => b.type === "text",
  );
  return parseDrafts(textBlock?.text ?? "", body);
}

// ── CSV path: send ambiguous rows for categorization ─────────────────────

async function categorizeRows(
  body: CsvRequest,
  apiKey: string,
): Promise<ParsedTransactionDraft[]> {
  if (body.rows.length === 0) return [];
  const listing = contextListing(body.categories, body.events, body.contributors);
  const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: CSV_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `${listing}\n\nRows to categorize (JSON):\n${JSON.stringify(body.rows)}`,
        },
      ],
    }),
  });

  if (!apiRes.ok) {
    const errText = await apiRes.text().catch(() => "");
    throw new Error(`Anthropic API ${apiRes.status}: ${errText.slice(0, 300)}`);
  }
  const data = (await apiRes.json()) as AnthropicMessagesResponse;
  const textBlock = data.content.find(
    (b): b is { type: "text"; text: string } => b.type === "text",
  );
  return parseDrafts(textBlock?.text ?? "", body);
}

// Bundles the lookup tables into a single user-message prefix. Keeping it
// off the cached system prompt means category edits don't bust the cache.
function contextListing(
  categories: Pick<FinanceCategory, "id" | "name">[],
  events: Pick<FinanceEvent, "id" | "name">[],
  contributors: Pick<FinanceContributor, "id" | "name" | "relationship">[],
): string {
  const cats = categories.map((c) => `${c.id}: ${c.name}`).join("\n");
  const evs = events.map((e) => `${e.id}: ${e.name}`).join("\n");
  const peeps = contributors
    .map((p) => `${p.id}: ${p.name} (${p.relationship})`)
    .join("\n");
  return `Categories:\n${cats || "(none)"}\n\nEvents:\n${evs || "(none)"}\n\nContributors:\n${peeps || "(none)"}`;
}

// ── Parse / validate the model's JSON ─────────────────────────────────────

function parseDrafts(
  raw: string,
  ctx: { categories: Pick<FinanceCategory, "id">[]; events: Pick<FinanceEvent, "id">[]; contributors: Pick<FinanceContributor, "id">[] },
): ParsedTransactionDraft[] {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const transactions = (parsed as { transactions?: unknown }).transactions;
  if (!Array.isArray(transactions)) return [];

  const catIds = new Set(ctx.categories.map((c) => c.id));
  const evtIds = new Set(ctx.events.map((e) => e.id));
  const ctbIds = new Set(ctx.contributors.map((p) => p.id));

  const out: ParsedTransactionDraft[] = [];
  for (const r of transactions) {
    if (!r || typeof r !== "object") continue;
    const row = r as Record<string, unknown>;
    const date = typeof row.date === "string" ? row.date : null;
    const description =
      typeof row.description === "string" ? row.description : null;
    const amount =
      typeof row.amount_cents === "number" &&
      Number.isFinite(row.amount_cents)
        ? Math.round(row.amount_cents)
        : null;
    if (!date || !description || amount == null) continue;

    const cat =
      typeof row.suggested_category_id === "string" &&
      catIds.has(row.suggested_category_id)
        ? row.suggested_category_id
        : null;
    const evt =
      typeof row.suggested_event_id === "string" &&
      evtIds.has(row.suggested_event_id)
        ? row.suggested_event_id
        : null;
    const pay =
      typeof row.suggested_payer_contributor_id === "string" &&
      ctbIds.has(row.suggested_payer_contributor_id)
        ? row.suggested_payer_contributor_id
        : null;
    const conf =
      row.confidence === "high" ||
      row.confidence === "medium" ||
      row.confidence === "low"
        ? row.confidence
        : "low";

    out.push({
      date,
      description,
      amount_cents: Math.abs(amount),
      account_last4:
        typeof row.account_last4 === "string" && row.account_last4.length >= 3
          ? row.account_last4.slice(-4)
          : null,
      suggested_category_id: cat,
      suggested_event_id: evt,
      suggested_payer_contributor_id: pay,
      fund_source: "shared",
      confidence: conf,
    });
  }
  return out;
}
