"use client";

// ── Trending this week ──────────────────────────────────────────────────────
// Top 3 threads from the last 7 days, ranked by replies + helpful votes
// (replies weighted 2x). Empty state stays warm — the panel is hidden
// rather than yelling about emptiness.

import Link from "next/link";
import { Flame } from "lucide-react";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { getGrapevineTopic, relativeTime } from "@/lib/community/grapevine";

export function GrapevineTrending() {
  const threads = useGrapevineStore((s) => s.threads);
  const trending = useGrapevineStore.getState().getTrending(3);
  // re-evaluate when threads change
  void threads;

  if (trending.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gold/15 bg-white p-5">
      <p
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Flame size={12} strokeWidth={1.8} className="text-saffron" />
        trending this week
      </p>
      <ol className="mt-3 space-y-3">
        {trending.map((t, idx) => {
          const topic = getGrapevineTopic(t.topic_category);
          return (
            <li key={t.id}>
              <Link
                href={`/community/grapevine/${t.id}`}
                className="flex gap-3 rounded-md px-1 py-1 transition-colors hover:bg-ivory-warm/40"
              >
                <span
                  className="font-mono text-[11px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  0{idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block line-clamp-2 font-serif text-[14px] leading-snug text-ink">
                    {t.title}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[10.5px] text-ink-faint">
                    {topic && <span aria-hidden>{topic.icon}</span>}
                    <span>{t.reply_count} replies</span>
                    <span>·</span>
                    <span>{relativeTime(t.created_at)}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
