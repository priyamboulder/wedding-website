"use client";

// ── MilestonesTimeline ─────────────────────────────────────────────────
// Full read-back of every milestone the couple has hit. Mirrors the
// rhythm of CheckInsHistory but uses a soft gold accent instead of
// blush — milestones are the "official" stamps, the days the planning
// crossed a meaningful line.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkle } from "lucide-react";
import { useMilestonesStore } from "@/stores/milestones-store";

function longDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MilestonesTimeline() {
  const milestones = useMilestonesStore((s) => s.milestones);

  const sorted = useMemo(
    () =>
      milestones
        .slice()
        .sort(
          (a, b) =>
            new Date(b.triggeredAt).getTime() -
            new Date(a.triggeredAt).getTime(),
        ),
    [milestones],
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
            Moments <em>worth marking</em>
          </h1>
          <p className="dash-spread-sub">
            The days planning crossed a meaningful line.
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
            Your milestones will land here as you hit them.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-5">
            {sorted.map((m) => (
              <li
                key={m.id}
                className="relative rounded-[6px] border border-[color:var(--dash-gold)] bg-[color:var(--dash-canvas)] px-5 py-4"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(201,169,110,0.05) 0%, var(--dash-canvas) 60%)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Sparkle
                    size={14}
                    strokeWidth={1.4}
                    className="mt-1 shrink-0 text-[color:var(--dash-gold)]"
                    aria-hidden
                    fill="currentColor"
                    fillOpacity={0.25}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-gold)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {longDate(m.triggeredAt)}
                    </p>
                    <p
                      className="mt-1 font-serif text-[18px] italic leading-snug text-[color:var(--dash-text)]"
                      style={{
                        fontFamily:
                          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                        fontWeight: 500,
                      }}
                    >
                      {m.message}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
