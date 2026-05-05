"use client";

// ── DigestsArchive ─────────────────────────────────────────────────────
// Reverse-chronological list of every weekly digest the couple has
// received. Each digest is one Mon-Sun summary as it appeared on the
// dashboard that week.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useWeeklyDigestsStore } from "@/stores/weekly-digests-store";

function weekRangeLabel(weekStart: string): string {
  const d = new Date(weekStart);
  if (Number.isNaN(d.getTime())) return weekStart;
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return `${d.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, { ...opts, year: "numeric" })}`;
}

export function DigestsArchive() {
  const digests = useWeeklyDigestsStore((s) => s.digests);
  const remove = useWeeklyDigestsStore((s) => s.remove);

  const sorted = useMemo(
    () =>
      digests
        .slice()
        .sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
    [digests],
  );

  return (
    <div className="min-h-screen bg-[color:var(--dash-canvas)] py-10">
      <div className="mx-auto max-w-[720px] px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to dashboard
        </Link>

        <header className="mt-6">
          <h1 className="dash-spread-title">
            Past <em>digests</em>
          </h1>
          <p className="dash-spread-sub">
            Every "this week in your wedding" summary, in the order they ran.
          </p>
        </header>

        {sorted.length === 0 ? (
          <p
            className="mt-12 font-serif text-[16px] italic text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Your first weekly digest will land here once your dashboard
            has a week of activity to summarize.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-5">
            {sorted.map((d) => (
              <li
                key={d.id}
                className="group relative rounded-[6px] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(45,45,45,0.04)]"
                style={{ borderLeft: "3px solid var(--dash-blush)" }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {weekRangeLabel(d.weekStart)}
                </p>
                <p
                  className="mt-2 whitespace-pre-wrap pr-6 text-[14px] leading-relaxed text-[color:var(--dash-text)]"
                  style={{
                    fontFamily: "Outfit, var(--font-sans), sans-serif",
                  }}
                >
                  {d.content}
                </p>
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  aria-label="Delete digest"
                  className="absolute right-3 top-3 text-[color:var(--dash-text-faint)] opacity-0 transition-opacity hover:text-[color:var(--color-terracotta)] group-hover:opacity-100"
                >
                  <Trash2 size={13} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
