"use client";

// ── The Confessional tab ────────────────────────────────────────────────────
// Editorial header → CTA card → Story of the Month → filter bar → feed.
// Anonymous; identity is never displayed for any post or reply. The feed
// reads only public selectors from useConfessionalStore so author_id is
// guaranteed to never reach this layer.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, Sparkles } from "lucide-react";
import { useConfessionalStore } from "@/stores/confessional-store";
import {
  CONFESSIONAL_CATEGORIES,
  CONFESSIONAL_SORTS,
  type ConfessionalCategorySlug,
  type ConfessionalSort,
} from "@/types/confessional";
import { ConfessionalStoryCard } from "./ConfessionalStoryCard";
import { ConfessionalSubmissionModal } from "./ConfessionalSubmissionModal";

type CategoryFilter = ConfessionalCategorySlug | "all";

const VALID_CATEGORIES = new Set<string>([
  "all",
  ...CONFESSIONAL_CATEGORIES.map((c) => c.slug),
]);

const PAGE_SIZE = 20;

const MONTH_LABELS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

function monthLabelFromKey(key?: string): string {
  if (!key) {
    const d = new Date();
    return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
  }
  const [year, month] = key.split("-");
  const m = Number.parseInt(month ?? "", 10);
  if (!year || Number.isNaN(m)) return key;
  return `${MONTH_LABELS[m - 1] ?? ""} ${year}`;
}

export function ConfessionalTab() {
  const ensureSeeded = useConfessionalStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  // Category filter is driven by ?sub=… so the secondary nav row in
  // /community page.tsx can change the active category by updating the URL.
  const searchParams = useSearchParams();
  const subParam = searchParams?.get("sub") ?? "all";
  const category: CategoryFilter = (
    VALID_CATEGORIES.has(subParam) ? subParam : "all"
  ) as CategoryFilter;

  const [sort, setSort] = useState<ConfessionalSort>("newest");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [submitOpen, setSubmitOpen] = useState(false);

  // Reset pagination when the filter category changes via the URL.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category]);

  // Re-render selector — keep posts subscription minimal; the listPublishedPosts
  // selector does the filter/sort each render and that's fine for v1.
  const posts = useConfessionalStore((s) => s.posts);
  const listPublishedPosts = useConfessionalStore((s) => s.listPublishedPosts);
  const featured = useConfessionalStore((s) => s.getFeaturedPost)();

  const visiblePosts = useMemo(() => {
    return listPublishedPosts({ category, sort });
    // posts is the underlying array — depend on it so the memo refreshes
    // when stories are added/removed. Filters drive the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, category, sort]);

  const paged = visiblePosts.slice(0, visibleCount);
  const hasMore = visibleCount < visiblePosts.length;

  return (
    <div className="bg-white px-10 py-10">
      <div className="mx-auto max-w-6xl">
        {/* ── Header eyebrow + headline ── */}
        <div>
          <p
            className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            The Confessional
          </p>
          <h2 className="mt-2 font-serif text-[40px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
            what really happened.
          </h2>
          <p className="mt-1.5 max-w-[620px] font-serif text-[16px] italic text-ink-muted">
            the unfiltered stories, vendor nightmares, and family drama — told
            anonymously by the people who lived it.
          </p>
        </div>

        {/* ── Top row: CTA + Story of the Month ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          <ShareCTA onOpen={() => setSubmitOpen(true)} />
          {featured ? (
            <FeaturedStoryCard
              postId={featured.id}
              title={featured.title}
              displayName={featured.display_name}
              category={featured.category}
              body={featured.body}
              monthLabel={monthLabelFromKey(featured.featured_month)}
              saveCount={featured.save_count}
            />
          ) : (
            <FeaturedStoryPlaceholder />
          )}
        </div>

        {/* ── Filter bar ── */}
        <div className="mt-10 flex items-center justify-between gap-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
            {visiblePosts.length} {visiblePosts.length === 1 ? "story" : "stories"}
          </p>
          <SortDropdown value={sort} onChange={(s) => { setSort(s); setVisibleCount(PAGE_SIZE); }} />
        </div>

        {/* ── Feed ── */}
        {paged.length === 0 ? (
          <EmptyState onShare={() => setSubmitOpen(true)} />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {paged.map((post) => (
              <ConfessionalStoryCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-saffron/50 hover:text-saffron"
            >
              Load more stories
              <ArrowRight size={13} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>

      <ConfessionalSubmissionModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
      />
    </div>
  );
}

// ── Share CTA card ──────────────────────────────────────────────────────────

function ShareCTA({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-ivory-warm/40 px-7 py-8">
      <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.07]">
        <KeyRound size={140} strokeWidth={1.2} className="text-ink" />
      </div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Got a story to tell?
      </p>
      <h3 className="mt-3 font-serif text-[28px] font-medium leading-[1.1] tracking-[-0.005em] text-ink">
        Spill it. Anonymously.
      </h3>
      <p className="mt-2 max-w-[360px] font-serif text-[14.5px] italic leading-[1.55] text-ink-muted">
        no names, no judgment. just the truth about what really went down.
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ink-soft"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Share your story
        <ArrowRight size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ── Featured story card ────────────────────────────────────────────────────

function FeaturedStoryCard({
  postId,
  title,
  displayName,
  category,
  body,
  monthLabel,
  saveCount,
}: {
  postId: string;
  title: string;
  displayName: string;
  category: ConfessionalCategorySlug;
  body: string;
  monthLabel: string;
  saveCount: number;
}) {
  const cat = CONFESSIONAL_CATEGORIES.find((c) => c.slug === category);
  const preview = body.length > 240 ? `${body.slice(0, 240).trim()}…` : body;
  return (
    <Link
      href={`/community/confessional/${postId}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-white px-7 py-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-saffron/50 hover:shadow-[0_14px_40px_rgba(28,25,23,0.08)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Story of the Month · {monthLabel}
        </p>
        <Sparkles size={14} strokeWidth={1.6} className="text-saffron" />
      </div>
      <h3 className="mt-3 font-serif text-[24px] font-medium leading-[1.18] tracking-[-0.005em] text-ink group-hover:text-saffron">
        {title}
      </h3>
      <div className="mt-3 flex items-center gap-2">
        {cat && (
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.12em]"
            style={{
              backgroundColor: cat.tone.bg,
              color: cat.tone.fg,
              borderColor: cat.tone.border,
            }}
          >
            {cat.shortLabel}
          </span>
        )}
        <span className="font-serif text-[13px] italic text-ink-muted">
          — {displayName}
        </span>
      </div>
      <p className="mt-4 line-clamp-4 font-serif text-[14px] leading-[1.65] text-ink-muted">
        {preview}
      </p>
      <span
        className="mt-5 inline-flex items-center gap-1.5 self-end font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted group-hover:text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Most-saved this month · {saveCount} saved
        <ArrowRight size={11} strokeWidth={1.8} />
      </span>
    </Link>
  );
}

function FeaturedStoryPlaceholder() {
  return (
    <div className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/20 px-7 py-8">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Story of the Month
      </p>
      <h3 className="mt-3 font-serif text-[20px] italic text-ink-muted">
        no featured story yet — the next one could be yours.
      </h3>
    </div>
  );
}

// ── Sort dropdown ──────────────────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: ConfessionalSort;
  onChange: (v: ConfessionalSort) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[12px] text-ink-muted">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sort
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ConfessionalSort)}
        className="rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink focus:border-saffron focus:outline-none"
      >
        {CONFESSIONAL_SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onShare }: { onShare: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/30 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ivory text-gold">
        <KeyRound size={20} strokeWidth={1.6} />
      </div>
      <p className="mt-5 font-serif text-[20px] italic text-ink">
        no stories under this filter — yet.
      </p>
      <p className="mt-2 max-w-[380px] text-[13.5px] leading-[1.6] text-ink-muted">
        the first one in any category sets the tone. tell yours.
      </p>
      <button
        type="button"
        onClick={onShare}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ink-soft"
      >
        Share your story
        <ArrowRight size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}
