"use client";

// ── Blog tab ────────────────────────────────────────────────────────────────
// Category filter chips + responsive grid of article cards. Pulls articles
// from lib/marketing/data.JOURNAL so the editorial content the old /journal
// page used stays authoritative. Each card links to /community/blog/[slug].

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNAL, type JournalEntry } from "@/lib/marketing/data";
import { BLOG_CATEGORIES } from "@/lib/community/seed";

type CategoryFilter = "all" | string; // category slug

export function BlogTab() {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = useMemo<JournalEntry[]>(() => {
    if (filter === "all") return JOURNAL;
    const category = BLOG_CATEGORIES.find((c) => c.slug === filter);
    if (!category) return JOURNAL;
    const tagSet = new Set(category.tags);
    return JOURNAL.filter((j) => tagSet.has(j.tag));
  }, [filter]);

  return (
    <div className="bg-white px-10 py-10">
      <div className="mx-auto max-w-6xl">
        <CategoryChips active={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
            {filtered.map((entry) => (
              <BlogCard key={entry.slug} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Category filter chips ───────────────────────────────────────────────────

function CategoryChips({
  active,
  onChange,
}: {
  active: CategoryFilter;
  onChange: (c: CategoryFilter) => void;
}) {
  const chips: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    ...BLOG_CATEGORIES.map((c) => ({ id: c.slug, label: c.label })),
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors",
              isActive
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Blog card ───────────────────────────────────────────────────────────────

function BlogCard({ entry }: { entry: JournalEntry }) {
  const categoryLabel = useMemo(() => {
    const cat = BLOG_CATEGORIES.find((c) => c.tags.includes(entry.tag));
    return cat?.label ?? entry.tag;
  }, [entry.tag]);

  return (
    <Link href={`/community/blog/${entry.slug}`} className="group block">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg"
        style={{ backgroundColor: entry.bg }}
      >
        {entry.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span
          className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] uppercase backdrop-blur-sm"
          style={{
            letterSpacing: "0.2em",
            color: entry.image ? "#fff" : entry.fg,
            backgroundColor: "rgba(0,0,0,0.28)",
          }}
        >
          {categoryLabel}
        </span>
      </div>
      <div className="mt-4">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {entry.date} · {entry.readTime}
        </p>
        <h3 className="mt-2 font-serif text-[24px] font-medium leading-[1.15] tracking-[-0.005em] text-ink transition-colors group-hover:text-saffron">
          {entry.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.65] text-ink-muted">
          {entry.dek}
        </p>
        <p
          className="mt-3 text-[12px] text-ink-faint"
          style={{ letterSpacing: "0.03em" }}
        >
          {entry.author}
        </p>
      </div>
    </Link>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ivory-warm/40 text-gold">
        <BookOpen size={22} strokeWidth={1.5} />
      </div>
      <p className="mt-5 font-serif text-[22px] italic text-ink">
        stories, tips, and inspiration — coming soon.
      </p>
      <p className="mt-2 max-w-[380px] text-[14px] leading-[1.65] text-ink-muted">
        nothing under this category yet. try another — or check back in a week.
      </p>
    </div>
  );
}
