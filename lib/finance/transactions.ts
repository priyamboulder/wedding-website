// ── Transaction helpers ───────────────────────────────────────────────────
// Heuristic matching + client-side CSV parsing. The same heuristics are
// used when pre-filling Claude's suggestions and when flagging CSV rows
// that couldn't be auto-categorized.

import type {
  FinanceCategory,
  FinanceCategoryId,
  FinanceContributor,
  ParsedTransactionDraft,
} from "@/types/finance";

// ── Keyword → category hints ──────────────────────────────────────────────
// Bottom-up from vendor language an Indian wedding planner typically sees.
// Matches on substring (case-insensitive) so merchant variants still hit.
export const CATEGORY_KEYWORDS: Record<string, FinanceCategoryId> = {
  // Venue
  "four seasons": "venue",
  "ritz": "venue",
  "hotel": "venue",
  "estate": "venue",
  "ballroom": "venue",
  "resort": "venue",
  "venue": "venue",

  // Catering
  "catering": "catering",
  "saffron": "catering",
  "biryani": "catering",
  "bar service": "catering",
  "bartender": "catering",

  // Florals / Decor
  "florals": "decor_florals",
  "florist": "decor_florals",
  "flowers": "decor_florals",
  "mandap": "decor_florals",
  "decor": "decor_florals",
  "rentals": "decor_florals",

  // Photography
  "photo": "photography",
  "studio": "photography",

  // Videography
  "cinema": "videography",
  "films": "videography",
  "videograph": "videography",

  // Entertainment
  "dj": "entertainment",
  "band": "entertainment",
  "dhol": "entertainment",
  "music": "entertainment",

  // HMUA
  "hmua": "hmua",
  "makeup": "hmua",
  "hair": "hmua",
  "glam": "hmua",

  // Wardrobe
  "couture": "wardrobe",
  "lehenga": "wardrobe",
  "sherwani": "wardrobe",
  "jeweler": "wardrobe",
  "jewelry": "wardrobe",

  // Stationery
  "stationery": "stationery",
  "invitation": "stationery",
  "invites": "stationery",
  "print": "stationery",

  // Mehndi
  "henna": "mehndi",
  "mehndi": "mehndi",
  "mehendi": "mehndi",

  // Transport
  "limo": "transportation",
  "shuttle": "transportation",
  "transport": "transportation",
  "horse": "transportation",

  // Pandit
  "pandit": "pandit_ceremony",
  "priest": "pandit_ceremony",
  "samagri": "pandit_ceremony",
};

// Guess a category from a merchant/description string.
export function guessCategory(
  description: string,
  categories: FinanceCategory[],
): FinanceCategoryId | null {
  const lower = description.toLowerCase();

  // First pass: exact category names (covers custom categories automatically).
  for (const c of categories) {
    if (!c.hidden && lower.includes(c.name.toLowerCase())) return c.id;
  }

  // Second pass: the default keyword table.
  for (const [kw, cid] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(kw)) {
      // Only return the slug if it matches an active category.
      const match = categories.find((c) => c.id === cid && !c.hidden);
      if (match) return match.id;
    }
  }

  return null;
}

// Guess a payer from account_last4 against contributor records. Very light —
// mostly a placeholder until contributors get an explicit account linkage.
export function guessPayer(
  _description: string,
  _accountLast4: string | null,
  _contributors: FinanceContributor[],
): string | null {
  return null;
}

// Produce a suggestion draft from a raw row. Used as the client-side
// fallback when the API call isn't warranted (e.g. a clean CSV parse).
export function buildSuggestion(
  row: Omit<
    ParsedTransactionDraft,
    | "suggested_category_id"
    | "suggested_event_id"
    | "suggested_payer_contributor_id"
    | "fund_source"
    | "confidence"
  >,
  categories: FinanceCategory[],
  contributors: FinanceContributor[],
): ParsedTransactionDraft {
  const suggested = guessCategory(row.description, categories);
  return {
    ...row,
    suggested_category_id: suggested,
    suggested_event_id: null,
    suggested_payer_contributor_id: guessPayer(
      row.description,
      row.account_last4,
      contributors,
    ),
    fund_source: "shared",
    confidence: suggested ? "medium" : "low",
  };
}

// ── CSV parsing (minimal RFC 4180 subset) ─────────────────────────────────
// Handles quoted fields, escaped quotes, and embedded commas. Good enough
// for bank-exported CSVs without pulling in papaparse.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

// ── Map a parsed CSV into typed drafts ────────────────────────────────────
// Looks for columns by common header names. Falls back to positional
// ordering when the headers are missing/unrecognized.

const DATE_HEADERS = ["date", "posted date", "trans date", "transaction date"];
const AMOUNT_HEADERS = [
  "amount",
  "debit",
  "withdrawals",
  "payment",
  "amount (usd)",
];
const DESC_HEADERS = ["description", "memo", "details", "payee", "merchant"];
const LAST4_HEADERS = ["account", "account number", "card", "last 4"];

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function csvRowsToDrafts(
  rows: string[][],
  categories: FinanceCategory[],
  contributors: FinanceContributor[],
): {
  drafts: ParsedTransactionDraft[];
  skipped: Array<{ reason: string; row: string[] }>;
} {
  if (rows.length === 0) return { drafts: [], skipped: [] };

  const [headerRow, ...body] = rows;
  const headers = headerRow!.map(norm);

  let dateCol = headers.findIndex((h) => DATE_HEADERS.includes(h));
  let amountCol = headers.findIndex((h) => AMOUNT_HEADERS.includes(h));
  let descCol = headers.findIndex((h) => DESC_HEADERS.includes(h));
  let last4Col = headers.findIndex((h) => LAST4_HEADERS.includes(h));

  // Fall back to positional when headers don't match (e.g. headerless CSV).
  let dataRows = body;
  if (dateCol < 0 || amountCol < 0 || descCol < 0) {
    dateCol = 0;
    amountCol = 1;
    descCol = 2;
    last4Col = 3;
    // If the first row looks like data (ISO-ish date in column 0), include it.
    if (/^\d{4}-\d{2}-\d{2}/.test(headerRow![0] ?? "")) {
      dataRows = rows;
    }
  }

  const drafts: ParsedTransactionDraft[] = [];
  const skipped: Array<{ reason: string; row: string[] }> = [];

  for (const r of dataRows) {
    const rawDate = r[dateCol] ?? "";
    const rawAmount = r[amountCol] ?? "";
    const rawDesc = r[descCol] ?? "";
    const rawLast4 = last4Col >= 0 ? r[last4Col] ?? "" : "";

    const iso = toIsoDate(rawDate);
    const cents = toCents(rawAmount);
    if (!iso || cents == null || !rawDesc.trim()) {
      skipped.push({
        reason: !iso ? "unparseable date" : cents == null ? "unparseable amount" : "no description",
        row: r,
      });
      continue;
    }
    drafts.push(
      buildSuggestion(
        {
          date: iso,
          description: rawDesc.trim(),
          amount_cents: cents,
          account_last4: extractLast4(rawLast4) ?? null,
        },
        categories,
        contributors,
      ),
    );
  }

  return { drafts, skipped };
}

function toIsoDate(s: string): string | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  // Already ISO.
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  // MM/DD/YYYY or M/D/YY.
  const m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const [, mm, dd, yy] = m;
    const year = yy!.length === 2 ? `20${yy}` : yy!;
    return `${year}-${mm!.padStart(2, "0")}-${dd!.padStart(2, "0")}`;
  }
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function toCents(s: string): number | null {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  // Bank CSVs often report withdrawals as negatives. Normalize to positive
  // for money-out so the ledger reads intuitively.
  return Math.round(Math.abs(n) * 100);
}

function extractLast4(s: string): string | null {
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-4);
  return null;
}
