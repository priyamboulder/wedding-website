// ── Journal ↔ Checklist linking types ──────────────────────────────────────
//
// Mirrors supabase/migrations/0005_article_checklist_links.sql exactly.
// Also used by the in-repo seed (lib/journal/reception-outfit-pilot.ts) so
// the swap from seed → Supabase is structural only.

export type ArticleRelationshipType =
  | "primer"
  | "decision_framework"
  | "vendor_questions"
  | "cultural_context"
  | "timeline"
  | "case_study";

export const RELATIONSHIP_LABELS: Record<ArticleRelationshipType, string> = {
  primer: "Why it matters",
  decision_framework: "How to choose",
  vendor_questions: "What to ask",
  cultural_context: "Cultural context",
  timeline: "Timeline & logistics",
  case_study: "Real weddings",
};

// Display order across relationship types when we render a mixed list.
// A primer before a decision framework before vendor questions before
// timeline matches how couples actually sequence their thinking.
export const RELATIONSHIP_ORDER: ArticleRelationshipType[] = [
  "primer",
  "decision_framework",
  "cultural_context",
  "vendor_questions",
  "timeline",
  "case_study",
];

export interface ArticleChecklistLink {
  id: string;
  article_id: string;
  checklist_item_id: string; // stable seed slug, e.g. "p3-bwar-07"
  relationship_type: ArticleRelationshipType;
  display_order: number;
  relevance_score: number | null; // 0.00–1.00
  editorial_note: string | null;
  created_at: string;
  updated_at: string;
}

// Lightweight article summary used in panels where we don't want to ship
// the full article body. The reader view loads the full Article by id.
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  deck: string;
  category: string;
  hero_seed: string;
  reading_time_min: number;
  published_at: string;
}

// Shape returned by the checklist-item-detail query: a summary plus the
// relationship metadata that told us to surface this article here.
export interface RelatedArticle extends ArticleSummary {
  relationship_type: ArticleRelationshipType;
  display_order: number;
  editorial_note: string | null;
}

// Shape returned by the article-reader query: checklist items this article
// was linked to support, with the relationship role it's playing.
export interface SupportedChecklistItem {
  checklist_item_id: string;
  relationship_type: ArticleRelationshipType;
  editorial_note: string | null;
  // Denormalized from the seed for display:
  item_title: string;
  phase_id: string;
  phase_title: string;
}
