import type {
  Vendor,
  VendorCategory,
  PriceDisplay,
} from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";

// ── Lightweight CSV parser ──────────────────────────────────────────────────
// The spec calls for .xlsx support via SheetJS; for now we handle CSV
// natively so vendor import works without a new dependency.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
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

// ── Field mapping ───────────────────────────────────────────────────────────

export const VENDOR_FIELDS = [
  "name",
  "category",
  "location",
  "price",
  "style_tags",
  "bio",
  "email",
  "phone",
  "website",
  "instagram",
] as const;

export type VendorField = (typeof VENDOR_FIELDS)[number];

const FIELD_LABELS: Record<VendorField, string> = {
  name: "Vendor name",
  category: "Category",
  location: "Location",
  price: "Price (e.g. ₹6L – ₹14L)",
  style_tags: "Style tags (comma-separated)",
  bio: "Bio / description",
  email: "Email",
  phone: "Phone",
  website: "Website",
  instagram: "Instagram",
};

export function fieldLabel(field: VendorField): string {
  return FIELD_LABELS[field];
}

function normalizeCategory(raw: string): VendorCategory {
  const low = raw.trim().toLowerCase().replace(/\s+|&/g, "_").replace(/_+/g, "_");
  const direct = Object.keys(CATEGORY_LABELS).find(
    (k) => k === low,
  ) as VendorCategory | undefined;
  if (direct) return direct;
  if (/photo|film|video/.test(low)) return "photography";
  if (/makeup|mua|hair|beauty/.test(low)) return "hmua";
  if (/decor|floral|flower/.test(low)) return "decor_florals";
  if (/cater|food/.test(low)) return "catering";
  if (/music|dj|band|entertain/.test(low)) return "entertainment";
  if (/lehenga|outfit|wardrobe|attire/.test(low)) return "wardrobe";
  if (/invit|stationery|card/.test(low)) return "stationery";
  if (/pandit|priest|ceremony/.test(low)) return "pandit_ceremony";
  return "photography";
}

function parsePriceDisplay(raw: string): PriceDisplay {
  const s = raw.trim();
  if (!s) return { type: "contact" };

  const parseAmount = (piece: string): number | null => {
    const m = piece.match(/([\d.,]+)\s*(L|Cr|K)?/i);
    if (!m) return null;
    const n = Number.parseFloat(m[1].replace(/,/g, ""));
    if (!Number.isFinite(n)) return null;
    const unit = (m[2] ?? "").toUpperCase();
    if (unit === "CR") return n * 1_00_00_000;
    if (unit === "L") return n * 1_00_000;
    if (unit === "K") return n * 1_000;
    return n;
  };

  const rangeMatch = s.split(/\s*[–-]\s*/);
  if (rangeMatch.length === 2) {
    const min = parseAmount(rangeMatch[0]);
    const max = parseAmount(rangeMatch[1]);
    if (min != null && max != null) return { type: "range", min, max };
  }
  const fromMatch = s.match(/^(?:from|starting\s*from)\s+(.+)$/i);
  if (fromMatch) {
    const amt = parseAmount(fromMatch[1]);
    if (amt != null) return { type: "starting_from", amount: amt };
  }
  const single = parseAmount(s);
  if (single != null) return { type: "exact", amount: single };
  return { type: "contact" };
}

export interface ImportMapping {
  // header index → vendor field (or null to skip)
  [headerIndex: number]: VendorField | null;
}

export function buildVendorsFromCsv(
  rows: string[][],
  mapping: ImportMapping,
): Vendor[] {
  if (rows.length < 2) return [];
  const [, ...body] = rows;
  const now = new Date().toISOString();

  return body.map((row, idx): Vendor => {
    const fieldValues: Partial<Record<VendorField, string>> = {};
    for (const [indexStr, field] of Object.entries(mapping) as Array<
      [string, VendorField | null]
    >) {
      if (!field) continue;
      const value = row[Number(indexStr)]?.trim() ?? "";
      if (value) fieldValues[field] = value;
    }

    const id = `ven-import-${Date.now()}-${idx}`;
    const name = fieldValues.name ?? `Unnamed vendor ${idx + 1}`;
    return {
      id,
      slug: id,
      name,
      owner_name: "",
      category: fieldValues.category
        ? normalizeCategory(fieldValues.category)
        : "photography",
      tier: "free",
      is_verified: false,
      bio: fieldValues.bio ?? "",
      tagline: "",
      location: fieldValues.location ?? "",
      travel_level: "local",
      years_active: 0,
      team_size: 0,
      style_tags: fieldValues.style_tags
        ? fieldValues.style_tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      contact: {
        email: fieldValues.email ?? "",
        phone: fieldValues.phone ?? "",
        website: fieldValues.website ?? "",
        instagram: fieldValues.instagram ?? "",
      },
      cover_image: "",
      portfolio_images: [],
      price_display: parsePriceDisplay(fieldValues.price ?? ""),
      currency: "INR",
      rating: null,
      review_count: 0,
      wedding_count: 0,
      response_time_hours: null,
      profile_completeness: 0,
      created_at: now,
      updated_at: now,
      planner_connections: [],
      venue_connections: [],
      packages: [],
    };
  });
}

// Heuristic column auto-mapping.
export function autoMap(headers: string[]): ImportMapping {
  const mapping: ImportMapping = {};
  headers.forEach((header, i) => {
    const h = header.trim().toLowerCase();
    mapping[i] = null;
    if (/^(name|vendor|business|company)$/.test(h)) mapping[i] = "name";
    else if (/category|type|service/.test(h)) mapping[i] = "category";
    else if (/city|location|based|region/.test(h)) mapping[i] = "location";
    else if (/price|rate|cost|budget/.test(h)) mapping[i] = "price";
    else if (/style|tags|keywords/.test(h)) mapping[i] = "style_tags";
    else if (/bio|desc|about|notes/.test(h)) mapping[i] = "bio";
    else if (/^email/.test(h)) mapping[i] = "email";
    else if (/phone|mobile|contact\s*number/.test(h)) mapping[i] = "phone";
    else if (/website|url|site/.test(h)) mapping[i] = "website";
    else if (/insta|instagram|handle/.test(h)) mapping[i] = "instagram";
  });
  return mapping;
}
