// ── Monogram template data model ────────────────────────────────────────────
// Couples pick a pre-designed monogram from a curated gallery. The chosen
// template renders with the couple's own profile data injected — initials,
// names, date, location — rather than placeholder letters.
//
// Shape mirrors the `monogram_templates` and `wedding_brand` tables in
// supabase/migrations/0002_monograms.sql.

export type MonogramCategory =
  | "classic"
  | "arched"
  | "ampersand"
  | "editorial"
  | "framed"
  | "circular";

export type MonogramTemplateSlug =
  | "rose"
  | "malin"
  | "acadia"
  | "gianna"
  | "cybil"
  | "chloe";

export interface MonogramProps {
  initials: [string, string];
  names: [string, string];
  date: Date;
  location?: string;
  color?: string;
}

export interface MonogramTemplate {
  id: string;
  slug: MonogramTemplateSlug;
  name: string;
  category: MonogramCategory;
  componentKey: MonogramTemplateSlug;
  previewSvgStatic: string;
}

export interface WeddingBrandState {
  monogramTemplateId: string | null;
  brandAutoApplied: boolean;
}

export const MONOGRAM_INK = "#1a1a1a";
export const MONOGRAM_TILE = "#F5F1EA";
export const MONOGRAM_SELECTED_RING = "#B8860B";
