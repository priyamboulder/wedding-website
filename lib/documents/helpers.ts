// ── Documents helpers ─────────────────────────────────────────────────────
// Tiny utilities used across the Documents canvas. Kept client-safe — no
// file system or server-only imports.

import type { DocumentRecord } from "@/types/documents";

export function formatAmount(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const cur = currency ?? "INR";
  const symbol =
    cur === "INR" ? "₹" : cur === "USD" ? "$" : cur === "GBP" ? "£" : cur === "EUR" ? "€" : "";
  const fmt = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return symbol ? `${symbol}${fmt}` : `${fmt} ${cur}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function totalStorageGB(docs: DocumentRecord[]): string {
  const bytes = docs.reduce((s, d) => s + d.size_bytes, 0);
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

// Tiny base64 encoder for File → base64 string (no data URL prefix).
export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Browser env. Use chunked conversion to avoid stack overflow on large files.
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)),
    );
  }
  return btoa(binary);
}

// Sort comparators keyed by the sort dropdown.
export type DocumentSortKey =
  | "recent"
  | "date_newest"
  | "date_oldest"
  | "amount_high"
  | "name_asc";

export function compareDocs(a: DocumentRecord, b: DocumentRecord, key: DocumentSortKey): number {
  switch (key) {
    case "recent":
      return b.uploaded_at.localeCompare(a.uploaded_at);
    case "date_newest": {
      const ad = a.document_date ?? "";
      const bd = b.document_date ?? "";
      return bd.localeCompare(ad);
    }
    case "date_oldest": {
      const ad = a.document_date ?? "9999";
      const bd = b.document_date ?? "9999";
      return ad.localeCompare(bd);
    }
    case "amount_high":
      return (b.amount ?? -Infinity) - (a.amount ?? -Infinity);
    case "name_asc":
      return a.name.localeCompare(b.name);
  }
}
