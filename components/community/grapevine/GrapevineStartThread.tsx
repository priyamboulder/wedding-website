"use client";

// ── Start a thread CTA ──────────────────────────────────────────────────────
// Editorial card at the top of the feed — small-caps eyebrow, serif headline,
// one button. Mirrors the "Share your wedding with the circle" pattern on
// Real Weddings.

import { Pencil } from "lucide-react";

export function GrapevineStartThread({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-ivory-warm/60 via-white to-saffron/5 p-6">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        for brides who want the real story
      </p>
      <h3 className="mt-2 font-serif text-[26px] font-medium leading-tight text-ink">
        start an anonymous conversation.
      </h3>
      <p className="mt-2 max-w-[480px] text-[13.5px] leading-[1.6] text-ink-muted">
        ask about a vendor, share an experience, or warn the next bride. your
        identity is never revealed.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
        >
          <Pencil size={13} strokeWidth={1.8} />
          start a thread
        </button>
      </div>
    </section>
  );
}
