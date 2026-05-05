"use client";

// ── CoupleIdentity ─────────────────────────────────────────────────────
// Compact left-column block: monogram + names + date + countdown + a
// one-line phase nudge. Sized to ~120-150px so the rest of the canvas
// stays visible without scrolling.

import { useMemo, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useCoupleIdentity } from "@/lib/couple-identity";
import { InlineEdit } from "./InlineEdit";
import { SealedEnvelopeBadge } from "./LetterToFutureSelves";
import { MoodRing } from "./MoodRing";

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

function nudgeFor(daysUntil: number): string {
  if (daysUntil >= 365)
    return "Twelve-plus months out — focus on venue, photographer, caterer.";
  if (daysUntil >= 270)
    return "Lock your venue and photographer — peak dates fill 12+ months out.";
  if (daysUntil >= 180)
    return "Outfit shopping window — custom orders need 4–6 months.";
  if (daysUntil >= 90)
    return "Invitations soon. Finalize your guest list this month.";
  if (daysUntil >= 30)
    return "Final fittings, vendor confirmations, seating — home stretch.";
  if (daysUntil >= 0)
    return "Week-of mode. Delegate everything you can — and breathe.";
  return "Welcome back — time to look at the photos and write the thank-yous.";
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function CoupleIdentity() {
  const couple = useCoupleIdentity();
  const user = useAuthStore((s) => s.user);
  const updateUserName = useAuthStore((s) => s.updateUserName);
  const updateWedding = useAuthStore((s) => s.updateWedding);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const setWeddingDateInChecklist = useChecklistStore(
    (s) => s.setWeddingDate,
  );

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );

  const daysUntil = useMemo(() => {
    if (!weddingDate) return null;
    return daysBetween(new Date(), weddingDate);
  }, [weddingDate]);

  const dateLabel = weddingDate
    ? weddingDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const dateInputValue = weddingDate ? toIsoDate(weddingDate) : "";
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (next: string) => {
    if (!next) return;
    updateWedding({ weddingDate: next });
    const parsed = parseDate(next);
    if (parsed) setWeddingDateInChecklist(parsed);
  };

  const monogram = `${couple.person1.charAt(0).toUpperCase()}${couple.person2.charAt(0).toUpperCase()}`;

  return (
    <section className="text-left">
      <div className="flex items-center gap-3">
        <span aria-hidden className="dash-monogram-sm">
          {monogram}
        </span>
        <h1 className="dash-couple-name min-w-0">
          <InlineEdit
            value={couple.person1}
            onSave={(v) => updateUserName(v)}
            ariaLabel="Edit your name"
            placeholder="Your name"
          />
          <span className="dash-couple-amp">&amp;</span>
          <InlineEdit
            value={
              user?.wedding?.partnerName ??
              (couple.person2 === "Partner" ? "" : couple.person2)
            }
            onSave={(v) => updateWedding({ partnerName: v })}
            ariaLabel="Edit partner name"
            placeholder="Partner"
          />
        </h1>
        <MoodRing daysUntilWedding={daysUntil} size={42} />
        <SealedEnvelopeBadge />
      </div>

      {weddingDate ? (
        <div className="relative mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]">
          <span
            className="text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "Outfit, var(--font-body), var(--font-sans), sans-serif",
            }}
          >
            {dateLabel}
          </span>
          <span
            className="font-medium tabular-nums text-[color:var(--dash-blush-deep)]"
            style={{
              fontFamily: "Inter, var(--font-sans), sans-serif",
            }}
          >
            ·{" "}
            {daysUntil != null && daysUntil < 0
              ? `${Math.abs(daysUntil)} days since`
              : `${daysUntil} days`}
          </span>
          <button
            type="button"
            onClick={() => {
              const el = dateInputRef.current;
              if (!el) return;
              if (typeof el.showPicker === "function") el.showPicker();
              else el.focus();
            }}
            aria-label="Edit wedding date"
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--dash-text-faint)] transition-colors hover:bg-[color:var(--dash-blush-light)] hover:text-[color:var(--dash-blush-deep)]"
          >
            <CalendarDays size={13} strokeWidth={1.8} />
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={dateInputValue}
            onChange={(e) => handleDateChange(e.target.value)}
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            today.setMonth(today.getMonth() + 12);
            handleDateChange(toIsoDate(today));
          }}
          className="dash-btn dash-btn--sm dash-btn--ghost mt-2"
        >
          Set wedding date
        </button>
      )}

      {weddingDate && daysUntil != null && (
        <p
          className="mt-3 font-serif text-[14px] italic leading-snug text-[color:var(--dash-text-muted)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          {nudgeFor(daysUntil)}
        </p>
      )}
    </section>
  );
}
