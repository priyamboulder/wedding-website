// ── Lift loved ideas → inventory pre-seed ─────────────────────────────────
// Generalised helper for the pattern that has now appeared in three Build
// journeys (Wardrobe, Sweets, Gifting): take Vision-stage idea reactions
// keyed by category and produce a list of pre-seeded inventory items in
// `wishlist` state with `reuses_loved_idea: true` so the couple sees a
// draft list instead of an empty form on Build session 1.
//
// Each Build journey calls this once on first hydration of its Session 1
// form_data (or when the idea catalog changes) and merges the result into
// its inventory array. Subsequent edits live on the inventory side; the
// helper does not write back to Vision.

export type IdeaReaction = "love" | "not_for_me" | "no_reaction";

/**
 * A reaction record from a Vision Session 2 idea browser. Shape mirrors
 * what Gifting Vision's `gifting_inspiration.idea_reactions[]` stores;
 * other workspaces can pass an adapter that conforms to the same shape.
 */
export interface LovedIdeaReaction<TCategory extends string = string> {
  id: string;
  category: TCategory;
  item_label: string;
  item_tags?: string[];
  reaction: IdeaReaction;
  estimated_cost?: number;
  custom_note?: string;
}

/**
 * Output shape: a draft inventory entry. The Build session is responsible
 * for mapping this into its own field set (e.g., `bag_items[]`,
 * `favor_items[]`), since each Build session has its own column layout.
 */
export interface LiftedInventoryItem {
  id: string;
  /** The original idea_id from Vision — used to dedupe on re-lift. */
  source_idea_id: string;
  item_label: string;
  item_tags: string[];
  cost_per_unit?: number;
  custom_note?: string;
  sourcing_status: "wishlist";
  reuses_loved_idea: true;
}

/**
 * Filter Vision idea_reactions[] down to the ones the couple loved within
 * a target category, then project them to draft inventory items.
 *
 * @param reactions   Vision Session 2 idea_reactions[].
 * @param category    Category filter — only reactions matching this
 *                    category are lifted.
 * @param existingIds Optional set of source_idea_ids already represented
 *                    in the destination inventory. Lifted items whose
 *                    source_idea_id is already present are skipped, so
 *                    re-running the lift is idempotent.
 */
export function liftLovedIdeas<TCategory extends string>(
  reactions: ReadonlyArray<LovedIdeaReaction<TCategory>>,
  category: TCategory,
  existingIds: ReadonlySet<string> = new Set(),
): LiftedInventoryItem[] {
  const out: LiftedInventoryItem[] = [];
  for (const r of reactions) {
    if (r.category !== category) continue;
    if (r.reaction !== "love") continue;
    if (existingIds.has(r.id)) continue;
    out.push({
      id: `lifted_${r.id}_${Math.random().toString(36).slice(2, 8)}`,
      source_idea_id: r.id,
      item_label: r.item_label,
      item_tags: r.item_tags ?? [],
      cost_per_unit: r.estimated_cost,
      custom_note: r.custom_note,
      sourcing_status: "wishlist",
      reuses_loved_idea: true,
    });
  }
  return out;
}

/**
 * Tally loved-idea counts by category. Useful for the small badges that
 * surface on the Build CTAs ("3 loved welcome-bag ideas waiting").
 */
export function countLovedByCategory<TCategory extends string>(
  reactions: ReadonlyArray<LovedIdeaReaction<TCategory>>,
): Map<TCategory, number> {
  const map = new Map<TCategory, number>();
  for (const r of reactions) {
    if (r.reaction !== "love") continue;
    map.set(r.category, (map.get(r.category) ?? 0) + 1);
  }
  return map;
}
