"use client";

// ── DailyCheckIn ───────────────────────────────────────────────────────
// The ambient "today's check-in" card that lives at the very top of the
// dashboard's main column — above Journey, above everything. One warm
// question a day, low-friction text input, no nagging if skipped.
//
// Three states:
//   • unanswered → show today's question + textarea + Save
//   • saved      → compact confirmation + "Change answer" + entries link
//   • dismissed  → still present but minimized to a tiny "Today's check-
//                  in" pill so the card never disappears entirely
//
// Question selection is deterministic per (couple, date) via
// pickQuestionForDate so that two devices show the same prompt on the
// same day. Past 30-day repeats are filtered out automatically.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Pencil } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDailyCheckInsStore } from "@/stores/daily-checkins-store";
import {
  CLOSING_QUESTION,
  pickQuestionForDate,
  type CheckInQuestion,
} from "@/lib/dashboard/checkin-questions";
import { useCoupleIdentity } from "@/lib/couple-identity";
import { cn } from "@/lib/utils";

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

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

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DailyCheckIn() {
  const today = isoToday();
  const couple = useCoupleIdentity();

  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );
  const daysUntil = useMemo(() => {
    if (!weddingDate) return null;
    return daysBetween(new Date(), weddingDate);
  }, [weddingDate]);

  const entries = useDailyCheckInsStore((s) => s.entries);
  const saveCheckIn = useDailyCheckInsStore((s) => s.saveCheckIn);

  const todayEntry = useMemo(
    () => entries.find((e) => e.date === today) ?? null,
    [entries, today],
  );
  const history = useMemo(
    () => entries.map((e) => ({ questionId: e.questionId, date: e.date })),
    [entries],
  );

  // Hydration-safe deterministic pick. Uses couple identity as the seed so
  // two devices show the same prompt today.
  const question: CheckInQuestion = useMemo(
    () =>
      pickQuestionForDate({
        todayIso: today,
        daysUntilWedding: daysUntil,
        recentHistory: history,
        seed: `${couple.person1}-${couple.person2}`,
      }),
    [today, daysUntil, history, couple.person1, couple.person2],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todayEntry?.response ?? "");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (todayEntry && !isEditing) setDraft(todayEntry.response);
  }, [todayEntry, isEditing]);

  const isClosing = question.id === CLOSING_QUESTION.id;
  const showInput = !todayEntry || isEditing;

  const handleSave = () => {
    const text = draft.trim();
    if (!text) return;
    saveCheckIn({
      date: today,
      questionId: question.id,
      questionText: question.text,
      response: text,
    });
    setIsEditing(false);
  };

  return (
    <section
      aria-label="Today's check-in"
      className="dash-card text-left"
      style={{
        padding: "14px 16px",
        borderLeft: "3px solid var(--dash-blush)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
        >
          {isClosing ? "Final check-in" : "Today's check-in"} · {todayLabel()}
        </span>
        {todayEntry && !isEditing && (
          <Link
            href="/dashboard/check-ins"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
          >
            View past entries
            <ChevronRight size={11} strokeWidth={1.8} />
          </Link>
        )}
      </div>

      {showInput ? (
        <>
          <p
            className="mt-1.5 text-[19px] italic leading-snug text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            {question.text}
          </p>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            rows={1}
            placeholder="Just a thought or two…"
            className="mt-1 block w-full resize-none border-0 border-b border-[color:rgba(45,45,45,0.08)] bg-transparent px-0 py-0.5 font-serif text-[14.5px] italic leading-relaxed text-[color:var(--dash-text)] placeholder:italic placeholder:text-[color:var(--dash-text-faint)] focus:border-[color:var(--dash-blush)] focus:outline-none"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] italic text-[color:var(--dash-text-faint)]">
              Press Enter to save · this stays private to you two.
            </span>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDraft(todayEntry?.response ?? "");
                  }}
                  className="text-[11px] text-[color:var(--dash-text-muted)] hover:text-[color:var(--dash-text)]"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!draft.trim()}
                className={cn(
                  "dash-btn dash-btn--sm",
                  !draft.trim() && "opacity-50 cursor-not-allowed",
                )}
              >
                Save
              </button>
            </div>
          </div>
        </>
      ) : (
        todayEntry && (
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[12px] text-[color:var(--dash-text-muted)]">
                <CheckCircle2
                  size={13}
                  strokeWidth={1.8}
                  className="text-[color:var(--dash-blush-deep)]"
                />
                Saved. You&rsquo;ll love reading this back later.
              </p>
              <p
                className="mt-1 truncate font-serif text-[14px] italic text-[color:var(--dash-text-faint)]"
                style={{
                  fontFamily:
                    "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                }}
                title={todayEntry.response}
              >
                &ldquo;{todayEntry.response}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDraft(todayEntry.response);
                setIsEditing(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
            >
              <Pencil size={10} strokeWidth={1.8} />
              Change answer
            </button>
          </div>
        )
      )}
    </section>
  );
}
