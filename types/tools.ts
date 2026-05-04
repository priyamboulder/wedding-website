// ──────────────────────────────────────────────────────────────────────────
// Marigold Tools hub — row shapes for the public discovery surface.
// Mirrors migration 0022 (tools_catalog, tool_waitlist).
// ──────────────────────────────────────────────────────────────────────────

export type ToolStatus = "live" | "coming_soon" | "beta";

export interface ToolStat {
  label: string;
  // Optional sub-text shown under the badge label, e.g. "real numbers".
  sub?: string;
}

export interface ToolCatalogRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon_or_image: string | null;
  cta_label: string;
  cta_route: string;
  stats: ToolStat[];
  display_order: number;
  active: boolean;
  status: ToolStatus;
  created_at: string;
}

export interface ToolWaitlistRow {
  id: string;
  tool_slug: string;
  email: string;
  source: string;
  created_at: string;
}

export interface JoinWaitlistArgs {
  toolSlug: string;
  email: string;
  // Where on the surface they signed up — defaults to "tools_hub".
  source?: string;
}
