"use client";

// ── CheckInsHistory ────────────────────────────────────────────────────
// Quiet read-back surface for every daily check-in the couple has saved.
// One entry per day, sorted newest first. Mirrors the Notepad's card
// rhythm so the section feels at home alongside the rest of the
// dashboard's keepsake layer.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useDailyCheckInsStore } from "@/stores/daily-checkins-store";

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

export function CheckInsHistory() {
  const entries = useDailyCheckInsStore((s) => s.entries);
  const deleteCheckIn = useDailyCheckInsStore((s) => s.deleteCheckIn);

  const sorted = useMemo(
    () =>
      entries
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
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
            Past <em>check-ins</em>
          </h1>
          <p className="dash-spread-sub">
            One day, one thought. Read them back any time.
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
            Your check-ins will land here. Answer today&rsquo;s on the
            dashboard to start.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-5">
            {sorted.map((entry) => (
              <li
                key={entry.id}
                className="dash-card group relative px-5 py-4"
              >
                <p
                  className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {longDate(entry.date)}
                </p>
                <p
                  className="mt-1 font-serif text-[15px] italic text-[color:var(--dash-blush-deep)]"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {entry.questionText}
                </p>
                <p
                  className="mt-2 whitespace-pre-wrap font-serif text-[16px] italic leading-relaxed text-[color:var(--dash-text)]"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {entry.response}
                </p>
                <button
                  type="button"
                  onClick={() => deleteCheckIn(entry.id)}
                  aria-label="Delete check-in"
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
