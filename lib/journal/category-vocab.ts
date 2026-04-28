// ── Workspace category vocabulary for Journal tag chips ────────────────────
// Mirrors WorkspaceCategoryTag (types/checklist.ts) + display metadata.
// Used by CategoryTagChips and the auto-tag system prompt.

import type { WorkspaceCategoryTag } from "@/types/checklist";

export interface CategoryTagMeta {
  slug: WorkspaceCategoryTag;
  label: string;
  shortLabel: string;
}

export const CATEGORY_TAG_META: CategoryTagMeta[] = [
  { slug: "photography", label: "Photography", shortLabel: "Photo" },
  { slug: "videography", label: "Videography", shortLabel: "Video" },
  { slug: "catering", label: "Catering", shortLabel: "Catering" },
  { slug: "decor_florals", label: "Décor & Florals", shortLabel: "Décor" },
  { slug: "entertainment", label: "Music & Entertainment", shortLabel: "Music" },
  { slug: "hmua", label: "Hair & Makeup", shortLabel: "HMUA" },
  { slug: "venue", label: "Venue", shortLabel: "Venue" },
  { slug: "mehndi", label: "Mehendi Artist", shortLabel: "Mehendi" },
  { slug: "transportation", label: "Transportation", shortLabel: "Transport" },
  { slug: "stationery", label: "Stationery", shortLabel: "Stationery" },
  { slug: "pandit_ceremony", label: "Officiant", shortLabel: "Officiant" },
  { slug: "wardrobe", label: "Wardrobe", shortLabel: "Wardrobe" },
];

export const ALL_CATEGORY_SLUGS: WorkspaceCategoryTag[] =
  CATEGORY_TAG_META.map((c) => c.slug);

export const CATEGORY_LABEL: Record<WorkspaceCategoryTag, string> =
  Object.fromEntries(
    CATEGORY_TAG_META.map((c) => [c.slug, c.label]),
  ) as Record<WorkspaceCategoryTag, string>;
