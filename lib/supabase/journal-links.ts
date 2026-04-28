// ──────────────────────────────────────────────────────────────────────────
// Journal ↔ Checklist link query helpers (production target).
//
// The in-repo UI currently reads from an in-memory seed
// (lib/journal/reception-outfit-pilot.ts) keyed by the same slug shape.
// This file sketches the Supabase query surface we'll swap over to once
// the backend is wired up. Schema: supabase/migrations/0005_article_checklist_links.sql
// ──────────────────────────────────────────────────────────────────────────

import type {
  ArticleChecklistLink,
  ArticleRelationshipType,
  RelatedArticle,
  SupportedChecklistItem,
} from "@/types/journal-links";

// Matches the placeholder in lib/supabase/vendors.ts. Replace with the real
// SupabaseClient type once lib/supabase/client.ts exists.
type SupabaseClientLike = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, v: string) => {
        order: (col: string, opts?: { ascending?: boolean }) => Promise<{
          data: unknown;
          error: unknown;
        }>;
      };
    };
    insert: (rows: unknown) => Promise<{ data: unknown; error: unknown }>;
    delete: () => {
      eq: (col: string, v: string) => Promise<{ error: unknown }>;
    };
  };
};

// ── Reads ─────────────────────────────────────────────────────────────────

// Given a checklist item, return the articles linked to it, ordered by
// relationship_type (primer → timeline) then display_order. Joins against
// the articles table for title/deck/category/hero — one round trip.
export async function getArticlesForChecklistItem(
  supabase: SupabaseClientLike,
  checklistItemId: string,
): Promise<RelatedArticle[]> {
  const { data, error } = await supabase
    .from("article_checklist_links")
    .select(`
      relationship_type,
      display_order,
      editorial_note,
      articles (
        id,
        slug,
        title,
        deck,
        category_id,
        hero_image_url,
        reading_time_min,
        published_at
      )
    `)
    .eq("checklist_item_id", checklistItemId)
    .order("relationship_type", { ascending: true });

  if (error) throw error;

  // Shape the join result into the flat RelatedArticle shape the UI wants.
  // Client-side sort within relationship_type by display_order.
  type JoinRow = {
    relationship_type: ArticleRelationshipType;
    display_order: number;
    editorial_note: string | null;
    articles: {
      id: string;
      slug: string;
      title: string;
      deck: string;
      category_id: string;
      hero_image_url: string;
      reading_time_min: number;
      published_at: string;
    };
  };

  const rows = (data as JoinRow[]) ?? [];
  return rows
    .sort((a, b) => a.display_order - b.display_order)
    .map((row) => ({
      id: row.articles.id,
      slug: row.articles.slug,
      title: row.articles.title,
      deck: row.articles.deck,
      category: row.articles.category_id,
      hero_seed: row.articles.hero_image_url,
      reading_time_min: row.articles.reading_time_min,
      published_at: row.articles.published_at,
      relationship_type: row.relationship_type,
      display_order: row.display_order,
      editorial_note: row.editorial_note,
    }));
}

// Given an article, return the checklist items it was linked to support.
// Phase title is denormalized client-side from the seed (phases rarely
// change); once checklist seed is in Supabase, add a phases join here.
export async function getChecklistItemsForArticle(
  supabase: SupabaseClientLike,
  articleId: string,
): Promise<Pick<SupportedChecklistItem, "checklist_item_id" | "relationship_type" | "editorial_note">[]> {
  const { data, error } = await supabase
    .from("article_checklist_links")
    .select("checklist_item_id, relationship_type, editorial_note")
    .eq("article_id", articleId)
    .order("relationship_type", { ascending: true });

  if (error) throw error;
  return (data as Array<
    Pick<SupportedChecklistItem, "checklist_item_id" | "relationship_type" | "editorial_note">
  >) ?? [];
}

// ── Writes (editor/CMS tooling) ───────────────────────────────────────────

export async function createArticleChecklistLink(
  supabase: SupabaseClientLike,
  link: Omit<ArticleChecklistLink, "id" | "created_at" | "updated_at">,
): Promise<void> {
  const { error } = await supabase.from("article_checklist_links").insert(link);
  if (error) throw error;
}

export async function deleteArticleChecklistLink(
  supabase: SupabaseClientLike,
  linkId: string,
): Promise<void> {
  const { error } = await supabase
    .from("article_checklist_links")
    .delete()
    .eq("id", linkId);
  if (error) throw error;
}
