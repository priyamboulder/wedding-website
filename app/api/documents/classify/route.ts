// ── POST /api/documents/classify ───────────────────────────────────────────
// Classifies an uploaded document (PDF or image) using Claude Haiku 4.5 with
// prompt caching. Returns a single JSON object matching the Documents vault
// classifier schema.
//
// Mirrors the pattern in /api/finance/parse-statement — direct fetch against
// the Anthropic REST API, ephemeral cache_control on the system prompt, JSON
// extracted from the model's text response.
//
// The classifier system prompt lives here so it can be kept in lockstep with
// the Documents data model. Edit types/documents.ts and this prompt together.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ClassifyRequest {
  // One of mime "application/pdf" | "image/*".
  mime_type: string;
  filename: string;
  // base64 without the "data:*;base64," prefix.
  file_base64: string;
}

// ── Classifier system prompt (cached) ─────────────────────────────────────
// Kept explicit so the LLM stays within our enums. If you add a new
// document_type or vendor_category to types/documents.ts, update this prompt.

const CLASSIFIER_SYSTEM_PROMPT = `You are a document classifier for a luxury Indian wedding planning app called Ananya.

You receive ONE file at a time (PDF or image). Your job is to extract structured metadata so the file can be auto-filed into the right folder.

Respond with valid JSON ONLY (no prose, no markdown fences). Shape:

{
  "suggested_filename": string,            // clean, human-readable, ≤ 80 chars, keep file extension
  "document_type": one of [
    "contract","invoice","receipt","proposal","quote","coi","w9","1099",
    "permit","license","deliverable","shot_list","menu","playlist",
    "seating_chart","moodboard_reference","floor_plan","timeline",
    "correspondence","other"
  ],
  "vendor_category": one of [
    "photography","videography","catering","decor_florals",
    "music_entertainment","hair_makeup","venue","mehendi_artist",
    "stationery","transportation","priest_pandit","wardrobe_styling",
    "legal_admin","other"
  ],
  "vendor_name": string | null,
  "folder": one of [
    "contracts","invoices_receipts","deliverables","planning",
    "legal_admin","unsorted"
  ],
  "financial": boolean,                    // true if document involves money owed/paid
  "amount": number | null,                 // total in the native currency, numeric only
  "currency": string | null,               // ISO code (INR, USD, GBP, AED, etc.)
  "document_date": string | null,          // ISO yyyy-mm-dd, date the document was issued
  "due_date": string | null,               // ISO yyyy-mm-dd, payment/renewal due date
  "event_date": string | null,             // ISO yyyy-mm-dd, wedding-event date referenced
  "expiration_date": string | null,        // ISO yyyy-mm-dd, expiry for COI/permits
  "parties": string[],                     // people/orgs named (couple, vendor, signatories)
  "signed": boolean | null,                // true iff contract shows a signature/e-sig
  "key_terms": string[],                   // ≤ 6 short bullets from the document
  "summary": string,                       // ≤ 240 chars, plain prose
  "tags": string[],                        // short lowercase tags (vendor type, event, status)
  "confidence_overall": number,            // 0..1
  "needs_review": boolean,                 // true if confidence_overall < 0.55 or any critical field null for a financial doc
  "review_reason": string | null           // one short sentence explaining why review is needed
}

Rules:
1. Use ONLY the enum values listed above. Never invent new ones.
2. Folder selection:
   - contracts → signed/unsigned contracts, proposals, quotes awaiting signature
   - invoices_receipts → invoices, paid receipts, statements
   - deliverables → final photos, video cuts, edited files, design deliverables
   - planning → shot lists, menus, playlists, seating charts, floor plans, timelines, moodboards, correspondence
   - legal_admin → COI, W-9, 1099, permits, licenses, indemnities
   - unsorted → anything you can't confidently place; also set needs_review=true
3. Indian wedding vocabulary:
   - florist/flowers/marigold/jasmine → decor_florals
   - catering/tasting → catering
   - photographer/studio → photography
   - cinematographer/films → videography
   - dj/band/baraat band → music_entertainment
   - makeup/hair/glam → hair_makeup
   - hotel/ballroom/estate/bagh → venue
   - mehendi/henna artist → mehendi_artist
   - pandit/priest/purohit → priest_pandit
   - shuttle/limo/transport → transportation
   - stationery/invitation/RSVP → stationery
   - couture/lehenga/sherwani/jeweler/wardrobe → wardrobe_styling
4. vendor_name: extract the ACTUAL business name. Use null if ambiguous.
5. suggested_filename: follow the pattern "<Vendor> — <Doc Type>.<ext>" when possible, e.g. "Moksha Studios — Photography Contract.pdf". Preserve the original extension.
6. If the document is money-related (invoice, receipt, contract with an amount), financial MUST be true and amount should be populated.
7. key_terms: extract short fragments actually present in the document — NOT generic descriptions.
8. confidence_overall: lower it aggressively when the document is scanned/handwritten/ambiguous.

Return ONLY the JSON object. No prose before or after.`;

interface AnthropicResponse {
  content: Array<
    | { type: "text"; text: string }
    | { type: string; [key: string]: unknown }
  >;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ANTHROPIC_API_KEY not configured — classifier is offline. File will be uploaded unclassified.",
      },
      { status: 200 },
    );
  }

  let body: ClassifyRequest;
  try {
    body = (await req.json()) as ClassifyRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { mime_type, filename, file_base64 } = body;
  if (!file_base64 || !mime_type || !filename) {
    return NextResponse.json(
      { ok: false, error: "Missing mime_type / filename / file_base64" },
      { status: 400 },
    );
  }

  const isPdf = mime_type === "application/pdf";
  const isImage = mime_type.startsWith("image/");
  if (!isPdf && !isImage) {
    return NextResponse.json({
      ok: false,
      error: `Classifier does not support mime ${mime_type}. Upload without classification.`,
    });
  }

  try {
    const userContent = [
      isPdf
        ? {
            type: "document" as const,
            source: {
              type: "base64" as const,
              media_type: "application/pdf",
              data: file_base64,
            },
          }
        : {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mime_type,
              data: file_base64,
            },
          },
      {
        type: "text" as const,
        text: `Original filename: ${filename}\n\nClassify this document and return the JSON object described in the system prompt.`,
      },
    ];

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        ...(isPdf ? { "anthropic-beta": "pdfs-2024-09-25" } : {}),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: CLASSIFIER_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `Anthropic API ${apiRes.status}: ${errText.slice(0, 300)}`,
        },
        { status: 200 },
      );
    }

    const data = (await apiRes.json()) as AnthropicResponse;
    const textBlock = data.content.find(
      (b): b is { type: "text"; text: string } => b.type === "text",
    );
    const raw = textBlock?.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({
        ok: false,
        error: "Classifier returned no JSON object.",
        raw,
      });
    }
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(match[0]) as Record<string, unknown>;
    } catch (err) {
      return NextResponse.json({
        ok: false,
        error: "Classifier JSON failed to parse.",
        raw,
      });
    }
    return NextResponse.json({ ok: true, classification: parsed });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Classifier failed.",
      },
      { status: 200 },
    );
  }
}
