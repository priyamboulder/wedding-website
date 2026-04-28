// ── Documents download ─────────────────────────────────────────────────────
// Client-side download for single files and multi-file zip bundles. Fetches
// each doc's file_url, streams bytes into JSZip, then triggers a browser
// download. Remote URLs (seed data) and local /uploads paths both work.

import JSZip from "jszip";
import type { DocumentRecord } from "@/types/documents";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "document";
}

function dedupeFilenames(docs: DocumentRecord[]): Map<string, string> {
  const counts = new Map<string, number>();
  const out = new Map<string, string>();
  for (const d of docs) {
    const base = sanitizeFilename(d.name);
    const n = (counts.get(base) ?? 0) + 1;
    counts.set(base, n);
    if (n === 1) {
      out.set(d.id, base);
    } else {
      const dot = base.lastIndexOf(".");
      const stem = dot > 0 ? base.slice(0, dot) : base;
      const ext = dot > 0 ? base.slice(dot) : "";
      out.set(d.id, `${stem} (${n})${ext}`);
    }
  }
  return out;
}

export async function downloadSingleDocument(doc: DocumentRecord): Promise<void> {
  const res = await fetch(doc.file_url);
  if (!res.ok) throw new Error(`Failed to fetch ${doc.name}`);
  const blob = await res.blob();
  triggerBlobDownload(blob, sanitizeFilename(doc.name));
}

export async function downloadDocumentsAsZip(
  docs: DocumentRecord[],
  zipName: string,
): Promise<{ ok: number; failed: string[] }> {
  const zip = new JSZip();
  const names = dedupeFilenames(docs);
  const failed: string[] = [];

  const results = await Promise.allSettled(
    docs.map(async (d) => {
      const res = await fetch(d.file_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      return { id: d.id, buf };
    }),
  );

  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    const d = docs[i]!;
    if (r.status === "fulfilled") {
      zip.file(names.get(r.value.id)!, r.value.buf);
    } else {
      failed.push(d.name);
    }
  }

  const ok = docs.length - failed.length;
  if (ok === 0) throw new Error("All file downloads failed");

  const blob = await zip.generateAsync({ type: "blob" });
  const safeZipName = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
  triggerBlobDownload(blob, safeZipName);
  return { ok, failed };
}

/**
 * Picks a descriptive zip filename based on which filters are active.
 * Priority: manual selection > tab-specific > custom filters > all.
 */
export function zipNameFor(opts: {
  isManualSelection: boolean;
  tabSlug: string;       // "" for all, else tab.slug
  tabLabel: string;      // human label for the tab
  hasExtraFilters: boolean; // search or toolbar filters beyond the tab
}): string {
  if (opts.isManualSelection) return "documents-selected.zip";
  if (opts.hasExtraFilters) return "documents-filtered.zip";
  if (!opts.tabSlug) return "all-documents.zip";
  const slug = opts.tabSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || opts.tabLabel.toLowerCase().replace(/\s+/g, "-")}.zip`;
}
