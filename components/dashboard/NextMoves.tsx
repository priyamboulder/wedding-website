"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { computeNextMoves } from "@/lib/dashboard/next-moves";
import { SectionHeader } from "@/components/shell/SectionHeader";

export function NextMoves() {
  const completedAt = useEventsStore((s) => s.quiz.completedAt);
  const events = useEventsStore((s) => s.events);
  const categories = useWorkspaceStore((s) => s.categories);

  const moves = computeNextMoves({
    briefDone: Boolean(completedAt),
    categories,
    eventsCount: events.length,
    eventsMissingMood: events.filter((e) => !e.moodTile).length,
  });

  if (moves.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader
        size="sm"
        title="Next moves"
        subtitle="What's worth your attention this week."
      />
      <ol className="divide-y divide-[color:var(--color-warm-border)] border-y border-[color:var(--color-warm-border)]">
        {moves.map((move, i) => (
          <li key={move.id}>
            <Link
              href={move.href}
              className="group flex items-center gap-5 py-4 transition-colors hover:bg-[color:var(--color-warm-hover)]"
            >
              <span
                className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[18px] leading-snug text-ink">
                  {move.title}
                </p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">
                  {move.blurb}
                </p>
              </div>
              <ArrowUpRight
                size={16}
                strokeWidth={1.6}
                className="shrink-0 text-ink-faint transition-colors group-hover:text-ink"
              />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
