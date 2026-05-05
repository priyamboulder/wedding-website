"use client";

// ── YearInReviewKeepsake ───────────────────────────────────────────────
// Beautifully composed keepsake page assembled from every part of the
// platform the couple has touched. Pulls from: events, brief story,
// daily check-ins, sealed letter, journal photos, dashboard notepad,
// and checklist completions. Designed to print well (PDF via the
// browser's "Save as PDF") so couples can frame it / share with parents.
//
// Sections, in order:
//   1. The Opening — names + date + a line from their Story
//   2. The Journey Timeline
//   3. Check-In Highlights (woven through the document as pull quotes)
//   4. Planning Journal Photos (scrapbook layout with captions + dates)
//   5. By the Numbers
//   6. The Closing — final check-in answer / sealed letter reveal

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useEventsStore } from "@/stores/events-store";
import { useDailyCheckInsStore } from "@/stores/daily-checkins-store";
import { useDashboardJournalStore } from "@/stores/dashboard-journal-store";
import { useDashboardNotepadStore } from "@/stores/dashboard-notepad-store";
import { useSealedLettersStore } from "@/stores/sealed-letters-store";
import { useCoupleIdentity } from "@/lib/couple-identity";
import {
  compileYearInReview,
  type CompiledYearInReview,
} from "@/lib/dashboard/year-in-review";

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function longDateLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shortDateLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function YearInReviewKeepsake() {
  const couple = useCoupleIdentity();
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const checklistItems = useChecklistStore((s) => s.items);
  const events = useEventsStore((s) => s.events);
  const storyText = useEventsStore((s) => s.coupleContext.storyText);
  const checkIns = useDailyCheckInsStore((s) => s.entries);
  const journalPhotos = useDashboardJournalStore((s) => s.photos);
  const notes = useDashboardNotepadStore((s) => s.notes);
  const letter = useSealedLettersStore((s) => s.letter);

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );

  const joinedAtIso = useMemo(() => {
    // Best-available proxy: the earliest createdAt across the records the
    // couple has touched. EventRecord has no creation timestamp, so we
    // lean on notes / check-ins / photos.
    const candidates: string[] = [];
    for (const n of notes) candidates.push(n.createdAt);
    for (const c of checkIns) candidates.push(c.createdAt);
    for (const p of journalPhotos) candidates.push(p.createdAt);
    candidates.sort();
    return candidates[0] ?? null;
  }, [notes, checkIns, journalPhotos]);

  const compiled: CompiledYearInReview = useMemo(
    () =>
      compileYearInReview({
        weddingDate,
        storyText: storyText ?? null,
        events,
        checkIns,
        journalPhotos,
        notes,
        letter,
        checklist: checklistItems,
        joinedAtIso,
      }),
    [
      weddingDate,
      storyText,
      events,
      checkIns,
      journalPhotos,
      notes,
      letter,
      checklistItems,
      joinedAtIso,
    ],
  );

  const hasAnyContent =
    compiled.timeline.length > 0 ||
    compiled.highlights.length > 0 ||
    compiled.numbers.length > 0 ||
    journalPhotos.length > 0;

  // Interleave highlights into the photo scrapbook so quotes float
  // through the document rather than landing in one block.
  const interleaved = useMemo(() => {
    const photos = journalPhotos;
    const quotes = compiled.highlights;
    const result: Array<
      | { kind: "photo"; data: (typeof photos)[number] }
      | { kind: "quote"; data: (typeof quotes)[number] }
    > = [];
    let pi = 0;
    let qi = 0;
    // Roughly one quote per ~3 photos.
    while (pi < photos.length || qi < quotes.length) {
      for (let k = 0; k < 3 && pi < photos.length; k++, pi++) {
        result.push({ kind: "photo", data: photos[pi] });
      }
      if (qi < quotes.length) {
        result.push({ kind: "quote", data: quotes[qi] });
        qi++;
      }
    }
    return result;
  }, [journalPhotos, compiled.highlights]);

  return (
    <div className="min-h-screen bg-[color:var(--dash-canvas)] py-10 print:bg-white print:py-0">
      {/* ── Top bar (hidden in print) ─────────────────────────────── */}
      <div className="mx-auto mb-6 flex max-w-[820px] items-center justify-between px-6 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="dash-btn dash-btn--sm"
        >
          <Printer size={13} strokeWidth={1.8} />
          Save as PDF
        </button>
      </div>

      {/* ── The keepsake itself ───────────────────────────────────── */}
      <article
        className="mx-auto max-w-[820px] bg-[color:var(--dash-canvas)] px-10 py-14 shadow-[0_4px_30px_rgba(45,45,45,0.06)] print:shadow-none"
        style={{ borderTop: "3px solid var(--dash-gold)" }}
      >
        {/* ── 1. The Opening ────────────────────────────────────── */}
        <header className="text-center">
          <p
            className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--dash-gold)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            Your Planning Year in Review
          </p>
          <h1
            className="mt-4 font-serif text-[44px] italic leading-tight text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            {couple.person1}{" "}
            <span className="text-[color:var(--dash-blush-deep)]">&amp;</span>{" "}
            {couple.person2}
          </h1>
          {weddingDate && (
            <p
              className="mt-3 text-[14px] text-[color:var(--dash-text-muted)]"
              style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
            >
              {longDateLabel(weddingDate.toISOString())}
            </p>
          )}
          {compiled.storyLine && (
            <p
              className="mx-auto mt-6 max-w-md font-serif text-[18px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              }}
            >
              &ldquo;{compiled.storyLine}&rdquo;
            </p>
          )}
          <div className="dash-rule-gold mx-auto mt-10 w-32" />
        </header>

        {!hasAnyContent && (
          <p
            className="mx-auto mt-16 max-w-md text-center font-serif text-[16px] italic text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Your keepsake will fill in as you plan. Answer a few daily check-ins,
            add a photo or two, and come back here.
          </p>
        )}

        {/* ── 2. The Timeline ───────────────────────────────────── */}
        {compiled.timeline.length > 0 && (
          <section className="mt-12">
            <SectionTitle>The journey, in order</SectionTitle>
            <ol className="mt-6 flex flex-col gap-5">
              {compiled.timeline.map((entry, idx) => (
                <li key={`${entry.date}-${idx}`} className="relative pl-8">
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[color:var(--dash-blush)]"
                  />
                  {idx < compiled.timeline.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[5px] top-5 h-full w-px bg-[color:var(--dash-blush-soft)]"
                    />
                  )}
                  <p
                    className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {shortDateLabel(entry.date)}
                  </p>
                  <p
                    className="mt-1 font-serif text-[18px] italic text-[color:var(--dash-text)]"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {entry.title}
                  </p>
                  {entry.detail && (
                    <p className="mt-1 text-[13px] italic text-[color:var(--dash-text-muted)]">
                      {entry.detail}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── 3 + 4. Photos with check-in pull quotes interleaved ─ */}
        {interleaved.length > 0 && (
          <section className="mt-14">
            <SectionTitle>Moments along the way</SectionTitle>
            <div className="mt-6 columns-1 gap-4 sm:columns-2 print:columns-2">
              {interleaved.map((item, idx) =>
                item.kind === "photo" ? (
                  <figure
                    key={`p-${item.data.id}`}
                    className="mb-4 inline-block w-full break-inside-avoid"
                  >
                    <img
                      src={item.data.imageUrl}
                      alt={item.data.caption || ""}
                      className="block w-full rounded-[3px] object-cover shadow-[0_4px_18px_rgba(212,165,165,0.18)]"
                    />
                    <figcaption className="mt-1.5 px-1">
                      {item.data.caption && (
                        <span
                          className="block font-serif text-[13px] italic text-[color:var(--dash-text-muted)]"
                          style={{
                            fontFamily:
                              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                          }}
                        >
                          {item.data.caption}
                        </span>
                      )}
                      <span
                        className="mt-0.5 block text-[9px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {shortDateLabel(item.data.takenAt)}
                      </span>
                    </figcaption>
                  </figure>
                ) : (
                  <blockquote
                    key={`q-${item.data.id}-${idx}`}
                    className="mb-4 inline-block w-full break-inside-avoid rounded-[3px] bg-[color:var(--dash-blush-light)] px-5 py-5"
                  >
                    <p
                      className="font-serif text-[19px] italic leading-snug text-[color:var(--dash-text)]"
                      style={{
                        fontFamily:
                          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      &ldquo;{item.data.response}&rdquo;
                    </p>
                    <footer className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-blush-deep)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {shortDateLabel(item.data.date)} ·{" "}
                      <span className="normal-case italic tracking-normal text-[color:var(--dash-text-muted)]">
                        {item.data.questionText.toLowerCase()}
                      </span>
                    </footer>
                  </blockquote>
                ),
              )}
            </div>
          </section>
        )}

        {/* If we have highlights but no photos, render quotes alone. */}
        {interleaved.length === 0 && compiled.highlights.length > 0 && (
          <section className="mt-14">
            <SectionTitle>What you said along the way</SectionTitle>
            <div className="mt-6 flex flex-col gap-4">
              {compiled.highlights.map((h) => (
                <blockquote
                  key={h.id}
                  className="rounded-[3px] bg-[color:var(--dash-blush-light)] px-5 py-5"
                >
                  <p
                    className="font-serif text-[19px] italic leading-snug text-[color:var(--dash-text)]"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    &ldquo;{h.response}&rdquo;
                  </p>
                  <footer
                    className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-blush-deep)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {shortDateLabel(h.date)} ·{" "}
                    <span className="normal-case italic tracking-normal text-[color:var(--dash-text-muted)]">
                      {h.questionText.toLowerCase()}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. By the Numbers ─────────────────────────────────── */}
        {compiled.numbers.length > 0 && (
          <section className="mt-14">
            <SectionTitle>By the numbers</SectionTitle>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {compiled.numbers.map((n) => (
                <li key={n.label} className="text-center">
                  <p
                    className="font-serif text-[34px] italic leading-none text-[color:var(--dash-blush-deep)]"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 500,
                    }}
                  >
                    {n.value}
                  </p>
                  <p
                    className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--dash-text-muted)]"
                    style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
                  >
                    {n.label}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 6. The Closing ───────────────────────────────────── */}
        {(compiled.closing || (compiled.letter && compiled.letter.delivered)) && (
          <section className="mt-16 border-t border-[color:var(--dash-blush-soft)] pt-10">
            <SectionTitle>And finally</SectionTitle>
            {compiled.closing && (
              <div className="mt-5">
                <p
                  className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {shortDateLabel(compiled.closing.date)} · last words before
                  the big day
                </p>
                <p
                  className="mt-3 font-serif text-[22px] italic leading-snug text-[color:var(--dash-text)]"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  &ldquo;{compiled.closing.response}&rdquo;
                </p>
              </div>
            )}
            {compiled.letter && compiled.letter.delivered && (
              <div className="mt-10">
                <p
                  className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Sealed {shortDateLabel(compiled.letter.sealedAt)} · opened
                  on your wedding day
                </p>
                <p
                  className="mt-3 whitespace-pre-wrap font-serif text-[16px] italic leading-relaxed text-[color:var(--dash-text)]"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {compiled.letter.content}
                </p>
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 border-t border-[color:var(--dash-blush-soft)] pt-6 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--dash-gold)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            Compiled with care · Ananya
          </p>
        </footer>
      </article>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-center font-serif text-[24px] italic text-[color:var(--dash-blush-deep)]"
      style={{
        fontFamily:
          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        fontWeight: 500,
      }}
    >
      {children}
    </h2>
  );
}
