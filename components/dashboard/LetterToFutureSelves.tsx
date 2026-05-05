"use client";

// ── LetterToFutureSelves ───────────────────────────────────────────────
// One-time ceremonial prompt that surfaces after Journey Step 2 (events
// shaped) and disappears once sealed. Re-emerges as the read-back card
// on the morning of the wedding (delivered = true).
//
// Three states:
//   • not yet eligible     → renders nothing
//   • eligible, unsealed   → write-and-seal card (gold border, generous textarea)
//   • sealed, undelivered  → renders nothing on the dashboard; only the
//                            tiny envelope indicator in CoupleIdentity
//                            shows it exists. (See SealedEnvelopeBadge.)
//   • sealed, delivered    → reveal card showing the letter on wedding morning.

import { useEffect, useMemo, useState } from "react";
import { Mail, MailOpen, Lock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useEventsStore } from "@/stores/events-store";
import { useSealedLettersStore } from "@/stores/sealed-letters-store";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import { cn } from "@/lib/utils";

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function longDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function LetterToFutureSelves() {
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const events = useEventsStore((s) => s.events);
  const dressCodes = useDashboardJourneyStore((s) => s.dressCodes);

  const letter = useSealedLettersStore((s) => s.letter);
  const sealLetter = useSealedLettersStore((s) => s.sealLetter);
  const runDeliveryCheck = useSealedLettersStore((s) => s.runDeliveryCheck);

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );
  const weddingIso = weddingDate ? isoDate(weddingDate) : null;

  // Daily delivery check — runs once on mount. In production this would
  // be a server-side cron, but client-side is fine for the local demo.
  useEffect(() => {
    runDeliveryCheck();
  }, [runDeliveryCheck]);

  // Step 2 = events defined. Mirrors Journey.tsx's derivation.
  const step2Done = events.length > 0;
  // Bonus: gate on Step 2 fully (events + a hint of progress) so the
  // letter card doesn't pop the second a couple adds one event.
  const someEventNamed = events.some((e) =>
    Boolean(e.customName?.trim() || dressCodes[e.id]?.style),
  );
  const eligible = step2Done && (events.length >= 2 || someEventNamed);

  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!eligible && !letter) return null;
  if (letter && !letter.delivered) return null; // sealed: hidden from dashboard

  // ── Sealed AND delivered → the morning-of reveal ────────────────────
  if (letter && letter.delivered) {
    return (
      <section
        aria-label="Your sealed letter"
        className="rounded-[6px] border border-[color:var(--dash-gold)] bg-[color:var(--dash-canvas)] p-6 shadow-[0_2px_12px_rgba(201,169,110,0.12)]"
      >
        <div className="mb-3 flex items-center gap-2">
          <MailOpen
            size={16}
            strokeWidth={1.8}
            className="text-[color:var(--dash-gold)]"
          />
          <span
            className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--dash-gold)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            Delivered today
          </span>
        </div>
        <h2
          className="font-serif text-[24px] italic text-[color:var(--dash-text)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
          }}
        >
          A letter you wrote yourselves.
        </h2>
        <p className="mt-1 text-[12px] text-[color:var(--dash-text-muted)]">
          Sealed on {longDateLabel(letter.sealedAt.slice(0, 10))} · opened on
          your wedding day.
        </p>
        <div
          className="mt-5 whitespace-pre-wrap font-serif text-[16px] italic leading-relaxed text-[color:var(--dash-text)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          {letter.content}
        </div>
      </section>
    );
  }

  // ── Eligible, unsealed → the write-and-seal card ────────────────────
  const handleSeal = () => {
    const text = draft.trim();
    if (!text || !weddingIso) return;
    sealLetter({ content: text, deliverAt: weddingIso });
    setDraft("");
    setConfirming(false);
  };

  return (
    <section
      aria-label="Letter to your future selves"
      className="relative overflow-hidden rounded-[6px] border border-[color:var(--dash-gold)] bg-[color:var(--dash-canvas)] p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(201,169,110,0.04) 0%, var(--dash-canvas) 30%)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Mail
          size={16}
          strokeWidth={1.8}
          className="text-[color:var(--dash-gold)]"
        />
        <span
          className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--dash-gold)]"
          style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
        >
          One-time invitation
        </span>
      </div>

      <h2
        className="font-serif text-[26px] italic leading-tight text-[color:var(--dash-text)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
        }}
      >
        Write a letter to your wedding-day selves.
      </h2>
      <p
        className="mt-2 max-w-xl font-serif text-[15px] italic text-[color:var(--dash-text-muted)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        Seal a note now.{" "}
        {weddingIso
          ? `We'll deliver it back to you on the morning of ${longDateLabel(weddingIso)}.`
          : "Set your wedding date and we'll deliver it back to you on the morning of."}
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={8}
        placeholder="Tell your future selves what's true right now. The fears, the hopes, the song stuck in your head, the version of each other you want to remember…"
        disabled={!weddingIso}
        className={cn(
          "mt-5 block w-full resize-y rounded-[4px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] px-4 py-3 font-serif text-[15.5px] italic leading-relaxed text-[color:var(--dash-text)] placeholder:italic placeholder:text-[color:var(--dash-text-faint)] focus:border-[color:var(--dash-gold)] focus:outline-none",
          !weddingIso && "opacity-60",
        )}
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          minHeight: "180px",
        }}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11px] italic text-[color:var(--dash-text-faint)]">
          <Lock size={11} strokeWidth={1.8} />
          Once sealed, it disappears from your dashboard until your wedding day.
        </p>
        {confirming ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-[12px] text-[color:var(--dash-text-muted)] hover:text-[color:var(--dash-text)]"
            >
              Wait, not yet
            </button>
            <button
              type="button"
              onClick={handleSeal}
              className="dash-btn dash-btn--sm"
            >
              Yes — seal it
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!draft.trim() || !weddingIso}
            className={cn(
              "dash-btn dash-btn--sm",
              (!draft.trim() || !weddingIso) && "opacity-50 cursor-not-allowed",
            )}
          >
            Seal it
          </button>
        )}
      </div>
    </section>
  );
}

// ── SealedEnvelopeBadge ────────────────────────────────────────────────
// Tiny indicator that the letter exists. Drop into the couple header
// strip; renders nothing if no letter or if already delivered.
export function SealedEnvelopeBadge() {
  const letter = useSealedLettersStore((s) => s.letter);
  if (!letter || letter.delivered) return null;
  const opensLabel = longDateLabel(letter.deliverAt);
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--dash-gold)] text-[color:var(--dash-gold)] hover:bg-[color:var(--dash-blush-light)]"
      title={`Sealed. Opens ${opensLabel}.`}
      aria-label={`A sealed letter — opens ${opensLabel}`}
    >
      <Mail size={12} strokeWidth={1.8} />
    </span>
  );
}
