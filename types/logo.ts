// ── Wedding Logo template data model ────────────────────────────────────────
// Logo is the wordmark-style companion to Monogram. Where Monogram is an
// initials-centric mark (P&A, interlocked letters), Logo is a full-names
// lockup ("Priya and Arjun") used in website headers, footers, email
// signatures, save-the-dates, and signage where a compact initial mark
// isn't enough.
//
// A couple may apply BOTH a monogram AND a logo — they are independent
// selections and both live on wedding_brand.
//
// Shape mirrors the `logo_templates` and `wedding_brand` tables in
// supabase/migrations/0003_logos.sql.

export type LogoCategory =
  | "script"
  | "display"
  | "condensed"
  | "tracked"
  | "editorial"
  | "deco";

export type LogoTemplateSlug =
  | "lisbeth"
  | "elaine"
  | "gizelle"
  | "murphey"
  | "chloe"
  | "rowan"
  | "rosa"
  | "janie"
  | "royal";

export type LogoConnector = "and" | "&" | "|" | "*" | "•";

export interface LogoProps {
  names: [string, string];
  connector?: LogoConnector;
  color?: string;
}

export interface LogoTemplate {
  id: string;
  slug: LogoTemplateSlug;
  name: string;
  category: LogoCategory;
  componentKey: LogoTemplateSlug;
  defaultConnector: LogoConnector;
  compatibleConnectors: LogoConnector[];
  previewSvgStatic: string;
}

export const LOGO_INK = "#1a1a1a";
export const LOGO_TILE = "#F5F1EA";
export const LOGO_SELECTED_RING = "#B8860B";
