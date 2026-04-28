"use client";

// ── Today card ────────────────────────────────────────────────────────────
// Pinned card at the top of the left rail. Replaces the old "The brief N/5"
// pinned slot with a rollup of checklist tasks due this week across every
// category. Click-through routes to the full checklist.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChecklistStore } from "@/stores/checklist-store";

const TODAY_HREF = "/checklist";

export function TodayCard({
  active = false,
  variant = "full",
}: {
  active?: boolean;
  variant?: "full" | "collapsed";
}) {
  const items = useChecklistStore((s) => s.items);
  const weddingDate = useChecklistStore((s) => s.weddingDate);

  const { dueCount, nextTitle } = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const due: { title: string; deadline: Date }[] = [];
    for (const it of items) {
      if (it.status === "done" || it.status === "not_applicable") continue;
      const deadline = it.due_date
        ? new Date(it.due_date)
        : autoDeadline(it, weddingDate);
      if (!deadline) continue;
      if (deadline <= weekFromNow) due.push({ title: it.title, deadline });
    }
    due.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    return {
      dueCount: due.length,
      nextTitle: due[0]?.title ?? null,
    };
  }, [items, weddingDate]);

  const empty = dueCount === 0;

  if (variant === "collapsed") {
    const label = empty
      ? "Today — all clear"
      : `Today — ${dueCount} task${dueCount === 1 ? "" : "s"} due this week`;
    return (
      <Link
        href={TODAY_HREF}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        title={label}
        className={cn(
          "group relative mx-auto flex h-9 w-9 items-center justify-center rounded-md border bg-white transition-colors",
          active
            ? "border-gold text-gold"
            : "border-gold/45 text-gold hover:border-gold/70 hover:bg-gold-pale/40",
        )}
      >
        <Sparkles size={15} strokeWidth={1.6} />
        {!empty && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-saffron px-1 py-0.5 font-mono text-[9px] font-medium leading-none text-white ring-1 ring-white"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {dueCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={TODAY_HREF}
      aria-current={active ? "page" : undefined}
      aria-label={
        empty
          ? "Today — all clear"
          : `Today — ${dueCount} task${dueCount === 1 ? "" : "s"} due this week`
      }
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-md border px-3.5 py-2.5 text-left transition-all duration-200",
        active
          ? "border-gold bg-gold-pale/50"
          : "border-gold/35 bg-ivory-warm hover:border-gold/70 hover:bg-gold-pale/40",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gold"
      />
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border bg-white",
          active ? "border-gold text-gold" : "border-gold/50 text-gold",
        )}
      >
        <Sparkles size={14} strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[16px] font-bold leading-tight text-ink"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Today
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-ink-muted">
          {empty
            ? "All clear for the week — "
            : nextTitle
              ? `${dueCount} due · ${nextTitle}`
              : `${dueCount} task${dueCount === 1 ? "" : "s"} due this week`}
          {empty && <span className="text-ink-faint">enjoy the breather</span>}
        </span>
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums",
          empty
            ? "bg-white/80 text-ink-faint ring-1 ring-border"
            : "bg-white/80 text-ink-muted ring-1 ring-gold/40",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {dueCount}
        <ArrowRight size={10} strokeWidth={2} aria-hidden />
      </span>
    </Link>
  );
}

function autoDeadline(
  item: { daysBeforeWedding?: number; due_date: string | null },
  weddingDate: Date | null,
): Date | null {
  if (!weddingDate) return null;
  if (typeof item.daysBeforeWedding !== "number") return null;
  const d = new Date(weddingDate);
  d.setDate(d.getDate() - item.daysBeforeWedding);
  return d;
}
