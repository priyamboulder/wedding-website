"use client";

// ──────────────────────────────────────────────────────────────────────────
// RelatedJournalPosts — "Further reading" strip on the checklist item detail.
//
// Follows the ShoppingDrawer collapsible-bottom pattern so it wires in
// below any popout template (bespoke or generic) without the template
// needing to know about it.
//
// Reads from the in-memory pilot seed today (lib/journal/reception-outfit-pilot.ts).
// When Supabase is wired up, replace the imports with calls to
// getArticlesForChecklistItem in lib/supabase/journal-links.ts.
// ──────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PILOT_ARTICLES,
  getRelatedArticlesForItem,
} from "@/lib/journal/reception-outfit-pilot";
import {
  RELATIONSHIP_LABELS,
  RELATIONSHIP_ORDER,
  type ArticleRelationshipType,
} from "@/types/journal-links";
import type { Article } from "@/types/journal";

const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

type ResolvedPost = {
  article: Article;
  relationship_type: ArticleRelationshipType;
  display_order: number;
  editorial_note: string | null;
};

export function RelatedJournalPosts({ taskId }: { taskId: string }) {
  const router = useRouter();

  const posts = useMemo<ResolvedPost[]>(() => {
    const links = getRelatedArticlesForItem(taskId);
    return links
      .map((link) => {
        const article = PILOT_ARTICLES.find((a) => a.id === link.article_id);
        if (!article) return null;
        return {
          article,
          relationship_type: link.relationship_type,
          display_order: link.display_order,
          editorial_note: link.editorial_note,
        };
      })
      .filter((p): p is ResolvedPost => p !== null)
      .sort((a, b) => {
        const roleCompare =
          RELATIONSHIP_ORDER.indexOf(a.relationship_type) -
          RELATIONSHIP_ORDER.indexOf(b.relationship_type);
        if (roleCompare !== 0) return roleCompare;
        return a.display_order - b.display_order;
      })
      .slice(0, 5);
  }, [taskId]);

  const [open, setOpen] = useState(() => posts.length > 0);

  if (posts.length === 0) return null;

  const openArticle = (articleId: string) => {
    router.push(`/journal?read=${articleId}`);
  };

  return (
    <div className="shrink-0 border-t border-border bg-white/90 backdrop-blur-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-2 px-6 py-2.5 text-left transition-colors hover:bg-ivory-warm/60"
        aria-expanded={open}
      >
        <BookOpen
          size={12}
          strokeWidth={1.8}
          className="text-ink-faint group-hover:text-ink-muted"
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint group-hover:text-ink-muted">
          Further reading
        </span>
        <span className="font-mono text-[10.5px] text-ink-muted">
          {posts.length} {posts.length === 1 ? "piece" : "pieces"}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className={cn(
            "ml-auto text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: PANEL_EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-6 py-4">
              <ul className="flex flex-col gap-2.5">
                {posts.map((post) => (
                  <li key={post.article.id}>
                    <button
                      type="button"
                      onClick={() => openArticle(post.article.id)}
                      className="group flex w-full items-start gap-3 rounded-md border border-ink/5 bg-white p-3 text-left transition-all duration-200 hover:border-gold/30 hover:shadow-[0_1px_6px_rgba(184,134,11,0.08)]"
                    >
                      {/* Cover thumb */}
                      <div
                        className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-ivory-warm"
                        aria-hidden
                      >
                        <img
                          src={(() => {
                            const pool = [
                              "/images/portfolio/best/best-01.jpg",
                              "/images/portfolio/best/best-02.jpg",
                              "/images/portfolio/best/best-03.jpg",
                              "/images/portfolio/best/best-04.jpg",
                              "/images/portfolio/portrait/portrait-01.jpg",
                              "/images/portfolio/portrait/portrait-02.jpg",
                              "/images/portfolio/wedding/wedding-01.jpg",
                              "/images/portfolio/wedding/wedding-02.jpg",
                            ];
                            const idx = (post.article.heroSeed ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length;
                            return pool[idx];
                          })()}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>

                      {/* Body */}
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-gold">
                          {RELATIONSHIP_LABELS[post.relationship_type]}
                        </p>
                        <h4 className="mt-0.5 font-serif text-[14.5px] font-medium leading-snug text-ink group-hover:text-gold">
                          {post.article.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
                          {post.article.deck}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
                          <Clock size={9} strokeWidth={1.8} />
                          <span>{post.article.readingTime} min</span>
                          <span>·</span>
                          <span>{post.article.byline.replace(/^By\s+/, "")}</span>
                        </div>
                      </div>

                      {/* Affordance */}
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.5}
                        className="mt-1 shrink-0 text-ink-faint/60 transition-colors group-hover:text-gold"
                      />
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-3 px-1 text-[11px] italic leading-relaxed text-ink-faint">
                Hand-picked by our editors for this step of your planning.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
