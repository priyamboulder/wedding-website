// ── Blog / resource cross-link ───────────────────────────────────────────
// Optional. Renders only when the detail has a blog_post_url; returns null
// otherwise to avoid an empty-state card.

import { ArrowUpRight } from "lucide-react";
import type { StationerySuiteDetail } from "@/types/stationery";

export function SuiteDetailBlogLink({
  detail,
}: {
  detail: StationerySuiteDetail;
}) {
  if (!detail.blog_post_url || !detail.blog_post_title) return null;

  return (
    <a
      href={detail.blog_post_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-lg border border-border bg-white px-5 py-4 transition-colors hover:border-gold/50 hover:bg-ivory-warm"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          From our journal
        </p>
        <h4 className="font-serif text-[15.5px] font-medium leading-snug text-ink">
          {detail.blog_post_title}
        </h4>
        {detail.blog_post_excerpt && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
            {detail.blog_post_excerpt}
          </p>
        )}
        <span className="inline-flex items-center gap-1 pt-1 text-[12px] font-medium text-gold group-hover:underline">
          Read on our journal
          <ArrowUpRight
            size={12}
            strokeWidth={2}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
}
