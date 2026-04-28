"use client";

// ──────────────────────────────────────────────────────────────────────────
// SupportsChecklistItems — "this piece helps you with" panel on the
// article reader view.
//
// The inverse of RelatedJournalPosts: given an article, surface the
// checklist item(s) it was linked to support, with a CTA back into the
// planning task. Lives in the ArticleReader's right rail.
//
// Reads from the in-memory pilot seed today. When Supabase is wired up,
// swap the lookup for getChecklistItemsForArticle from
// lib/supabase/journal-links.ts.
// ──────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import Link from "next/link";
import { Compass, ArrowUpRight } from "lucide-react";
import { getSupportedItemsForArticle } from "@/lib/journal/reception-outfit-pilot";
import {
  CHECKLIST_ITEMS,
  PHASES,
} from "@/lib/checklist-seed";
import {
  RELATIONSHIP_LABELS,
  type ArticleRelationshipType,
} from "@/types/journal-links";

interface ResolvedItem {
  checklist_item_id: string;
  relationship_type: ArticleRelationshipType;
  editorial_note: string | null;
  item_title: string;
  phase_title: string;
}

export function SupportsChecklistItems({ articleId }: { articleId: string }) {
  const items = useMemo<ResolvedItem[]>(() => {
    const links = getSupportedItemsForArticle(articleId);
    return links
      .map((link) => {
        const item = CHECKLIST_ITEMS.find((i) => i.id === link.checklist_item_id);
        if (!item) return null;
        const phase = PHASES.find((p) => p.id === item.phase_id);
        return {
          checklist_item_id: link.checklist_item_id,
          relationship_type: link.relationship_type,
          editorial_note: link.editorial_note,
          item_title: item.title,
          phase_title: phase?.title ?? item.phase_id,
        };
      })
      .filter((r): r is ResolvedItem => r !== null);
  }, [articleId]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-saffron/20 bg-saffron-pale/30 p-5">
      <header className="flex items-center gap-2">
        <Compass size={13} strokeWidth={1.8} className="text-gold" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
          Supports your planning
        </h3>
      </header>

      <p className="mt-3 font-serif text-[14px] italic leading-snug text-ink">
        This piece was written to help you with
        {items.length === 1 ? " this decision:" : " these decisions:"}
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.checklist_item_id}>
            <Link
              href={`/checklist?open=${item.checklist_item_id}`}
              className="group block rounded-md border border-ink/8 bg-white/70 p-3 transition-all duration-200 hover:border-gold/40 hover:bg-white hover:shadow-[0_1px_6px_rgba(184,134,11,0.08)]"
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint">
                {item.phase_title}
              </p>
              <div className="mt-1 flex items-start justify-between gap-2">
                <h4 className="font-serif text-[15px] font-medium leading-snug text-ink group-hover:text-gold">
                  {item.item_title}
                </h4>
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0 text-ink-faint/60 transition-colors group-hover:text-gold"
                />
              </div>
              <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-gold/80">
                Playing the role of: {RELATIONSHIP_LABELS[item.relationship_type]}
              </p>
              {item.editorial_note && (
                <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                  {item.editorial_note}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] italic leading-relaxed text-ink-muted">
        Open the task to mark your decisions, set a deadline, and save any
        notes from this article.
      </p>
    </section>
  );
}
