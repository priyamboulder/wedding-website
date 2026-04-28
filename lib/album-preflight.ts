// Pre-flight checks run before the Order flow opens. Blocking issues keep the
// Order flow disabled until resolved; warnings let the user proceed but
// surface real print-quality risks (low resolution, missing VIPs, empty text).
//
// Each finding carries `spreadId` when it's anchored to a specific spread so
// the UI can offer "jump to spread" shortcuts.

import { LAYOUT_BY_ID } from "@/lib/album-layouts";
import type { AlbumProject } from "@/types/album";

export type PreflightSeverity = "block" | "warn" | "info";

export interface PreflightFinding {
  id: string;
  severity: PreflightSeverity;
  title: string;
  detail: string;
  spreadId?: string;
  spreadPosition?: number;
  action?: "jump" | "delete" | "none";
}

// Photos under ~800px on the short side risk blurry prints at 6×6 and worse at
// larger sizes. We don't have real pixel dimensions in the prototype, so we
// flag photos flagged as low-res upstream OR (best-effort) images whose URL is
// an object-URL from a user upload — we can't measure those without loading.
function isProbablyLowRes(url: string): boolean {
  // object URLs from File uploads — we have no dimensions; don't false-flag.
  if (url.startsWith("blob:")) return false;
  // data-URL thumbs are suspicious
  return url.startsWith("data:") && url.length < 8000;
}

export function runPreflight(album: AlbumProject): PreflightFinding[] {
  const findings: PreflightFinding[] = [];
  const photoById = new Map(album.photo_pool.map((p) => [p.id, p]));

  for (const spread of album.spreads) {
    const layout = LAYOUT_BY_ID[spread.layout_template_id];
    if (!layout) continue;

    const slotCount = layout.frames.length;
    const filledCount = spread.slots.filter((s) => s.photo_id).length;
    const emptyCount = slotCount - filledCount;

    // Blank spread — no photos at all, and not a text-only layout.
    if (!layout.isTextOnly && slotCount > 0 && filledCount === 0) {
      findings.push({
        id: `blank-${spread.id}`,
        severity: "block",
        title: `Spread ${spread.position + 1} is empty`,
        detail: "Add photos or delete the spread before ordering.",
        spreadId: spread.id,
        spreadPosition: spread.position,
        action: "jump",
      });
      continue;
    }

    // Partially-filled spread — some slots still empty.
    if (emptyCount > 0 && filledCount > 0) {
      findings.push({
        id: `empty-slot-${spread.id}`,
        severity: "block",
        title: `Spread ${spread.position + 1} has ${emptyCount} empty slot${emptyCount === 1 ? "" : "s"}`,
        detail: "Fill every slot or switch to a layout with fewer slots.",
        spreadId: spread.id,
        spreadPosition: spread.position,
        action: "jump",
      });
    }

    // Low-res photos on this spread.
    for (const slot of spread.slots) {
      if (!slot.photo_id) continue;
      const photo = photoById.get(slot.photo_id);
      if (!photo) continue;
      if (isProbablyLowRes(photo.url)) {
        findings.push({
          id: `lowres-${slot.id}`,
          severity: "warn",
          title: `Low-resolution photo on spread ${spread.position + 1}`,
          detail: `"${photo.caption ?? "Untitled photo"}" may print blurry at this size.`,
          spreadId: spread.id,
          spreadPosition: spread.position,
          action: "jump",
        });
      }
    }

    // Empty text frames.
    if (layout.textFrames && layout.textFrames.length > 0) {
      const emptyText = spread.text_blocks.filter((tb) => !tb.content.trim()).length;
      if (emptyText > 0) {
        findings.push({
          id: `empty-text-${spread.id}`,
          severity: "warn",
          title: `Spread ${spread.position + 1} has an empty text field`,
          detail: layout.isTextOnly
            ? "Add a title, chapter name, or dedication."
            : "Add a caption or delete the template's text field.",
          spreadId: spread.id,
          spreadPosition: spread.position,
          action: "jump",
        });
      }
    }
  }

  // Missing VIP guests — cross-reference VIP tags on photos vs. placement.
  const vipTags = new Set<string>();
  album.photo_pool.forEach((p) => {
    if (p.guestTags) {
      for (const tag of p.guestTags) {
        if (tag.startsWith("VIP:")) vipTags.add(tag.slice(4));
      }
    }
  });
  if (vipTags.size > 0) {
    const placed = new Set<string>();
    for (const spread of album.spreads) {
      for (const slot of spread.slots) {
        if (!slot.photo_id) continue;
        const p = photoById.get(slot.photo_id);
        p?.guestTags?.forEach((t) => {
          if (t.startsWith("VIP:")) placed.add(t.slice(4));
        });
      }
    }
    const missing = [...vipTags].filter((v) => !placed.has(v));
    for (const name of missing) {
      findings.push({
        id: `missing-vip-${name}`,
        severity: "warn",
        title: `VIP ${name} isn't in any spread`,
        detail: "VIPs flagged in Photography should appear in the album.",
        action: "none",
      });
    }
  }

  return findings;
}

export function preflightBlockers(findings: PreflightFinding[]): PreflightFinding[] {
  return findings.filter((f) => f.severity === "block");
}

export function preflightWarnings(findings: PreflightFinding[]): PreflightFinding[] {
  return findings.filter((f) => f.severity === "warn");
}
