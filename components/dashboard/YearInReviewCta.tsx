"use client";

// ── YearInReviewCta ────────────────────────────────────────────────────
// Soft, ceremonial nudge that appears once the wedding is within ~2
// weeks (or anytime the couple opts to generate it). One italic line +
// a quiet button — never crowding out the primary planning content.

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDailyCheckInsStore } from "@/stores/daily-checkins-store";

const WINDOW_DAYS = 14;

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(from: Date, to: Date): number {
  const ms =
    new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export function YearInReviewCta() {
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const checkIns = useDailyCheckInsStore((s) => s.entries);

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );
  const daysUntil = useMemo(() => {
    if (!weddingDate) return null;
    return daysBetween(new Date(), weddingDate);
  }, [weddingDate]);

  // Show in two cases: wedding is within ~2 weeks (the natural window),
  // or the couple has already accumulated enough material that it's worth
  // browsing early.
  const earlyTease = checkIns.length >= 6;
  const inWindow = daysUntil != null && daysUntil >= -30 && daysUntil <= WINDOW_DAYS;
  if (!inWindow && !earlyTease) return null;

  return (
    <section
      aria-label="Generate your Year in Review"
      className="rounded-[6px] border border-[color:var(--dash-gold)] bg-[color:var(--dash-canvas)] px-5 py-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(201,169,110,0.05) 0%, var(--dash-canvas) 60%)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--dash-gold)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            Keepsake
          </p>
          <h3
            className="mt-1 font-serif text-[20px] italic leading-snug text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            {inWindow
              ? "Your planning year, almost a memory."
              : "Look back on what you've already built."}
          </h3>
          <p className="mt-1 text-[13px] italic text-[color:var(--dash-text-muted)]">
            {inWindow
              ? "We'll compile it into something you can frame, share, or read at the rehearsal."
              : "A draft of your Year in Review keepsake — it'll keep growing as you do."}
          </p>
        </div>
        <Link
          href="/dashboard/year-in-review"
          className="dash-btn dash-btn--sm shrink-0"
        >
          <Sparkles size={13} strokeWidth={1.8} />
          {inWindow ? "Generate Year in Review" : "Preview keepsake"}
        </Link>
      </div>
    </section>
  );
}
