"use client";

// ── Most helpful this month ────────────────────────────────────────────────
// Top 3 threads of the last 30 days by helpful votes. Hidden when empty
// so a quiet sidebar doesn't draw attention to absence.

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { getGrapevineTopic } from "@/lib/community/grapevine";

export function GrapevineMostHelpful() {
  const threads = useGrapevineStore((s) => s.threads);
  const mostHelpful = useGrapevineStore.getState().getMostHelpful(3);
  void threads;

  const filtered = mostHelpful.filter((t) => t.helpful_count > 0);
  if (filtered.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gold/15 bg-white p-5">
      <p
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Sparkles size={12} strokeWidth={1.8} className="text-gold" />
        most helpful this month
      </p>
      <ul className="mt-3 space-y-3">
        {filtered.map((t) => {
          const topic = getGrapevineTopic(t.topic_category);
          return (
            <li key={t.id}>
              <Link
                href={`/community/grapevine/${t.id}`}
                className="block rounded-md px-1 py-1 transition-colors hover:bg-ivory-warm/40"
              >
                <span className="block line-clamp-2 font-serif text-[14px] leading-snug text-ink">
                  {t.title}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[10.5px] text-ink-faint">
                  {topic && <span aria-hidden>{topic.icon}</span>}
                  <span>{t.helpful_count} helpful</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
