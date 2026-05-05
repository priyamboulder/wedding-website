"use client";

// ── DecisionsHistory ───────────────────────────────────────────────────
// Full read-back of every decision the couple has logged. Mirrors the
// rhythm of CheckInsHistory but uses a soft gold accent — decisions are
// the "we chose this and meant it" stamps.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useDecisionsStore } from "@/stores/decisions-store";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";

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

export function DecisionsHistory() {
  const decisions = useDecisionsStore((s) => s.decisions);
  const deleteDecision = useDecisionsStore((s) => s.deleteDecision);
  const events = useEventsStore((s) => s.events);

  const eventLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of events) {
      const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === e.type);
      const label =
        e.vibeEventName ||
        e.customEventName ||
        e.customName ||
        opt?.name ||
        e.type;
      m.set(e.id, label);
    }
    return m;
  }, [events]);

  const sorted = useMemo(
    () =>
      decisions
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        ),
    [decisions],
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
            We <em>decided</em>
          </h1>
          <p className="dash-spread-sub">
            Every choice that's shaping your wedding, in the order you made it.
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
            No decisions logged yet. The first call you make becomes the
            first thing on this list.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {sorted.map((d) => {
              const eventLabel = d.eventId
                ? eventLabelById.get(d.eventId) ?? null
                : null;
              return (
                <li
                  key={d.id}
                  className="group relative rounded-[6px] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(45,45,45,0.04)]"
                  style={{ borderLeft: "2px solid var(--dash-gold)" }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {longDate(d.createdAt)}
                    {d.source === "auto" && " · auto-captured"}
                  </p>
                  <p
                    className="mt-1 pr-6 text-[15px] leading-relaxed text-[color:var(--dash-text)]"
                    style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
                  >
                    {d.content}
                  </p>
                  {eventLabel && (
                    <span
                      className="mt-2 inline-block rounded-full bg-[color:var(--dash-blush-soft)] px-2 py-[2px] text-[10px] font-medium text-[color:var(--dash-blush-deep)]"
                      style={{
                        fontFamily: "Inter, var(--font-sans), sans-serif",
                      }}
                    >
                      {eventLabel}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteDecision(d.id)}
                    aria-label="Delete decision"
                    className="absolute right-3 top-3 text-[color:var(--dash-text-faint)] opacity-0 transition-opacity hover:text-[color:var(--color-terracotta)] group-hover:opacity-100"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
