"use client";

// ── Welcome screen ─────────────────────────────────────────────────────────
// Full-bleed first-run splash. Shown until the couple clicks "Start the
// brief →" for the first time. Clicking the CTA flips hasStartedBrief in
// the events store; FirstRunGate then swaps this for the live quiz flow.
//
// No navigation, no escape hatches — the spec is deliberate about forcing
// the brief before any downstream surface can be reached.

import { ArrowRight, Sparkles } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";

export function WelcomeScreen() {
  const startBrief = useEventsStore((s) => s.startBrief);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ivory-warm px-6 py-12">
      {/* Warm ambient wash — gold radial at the top, ink fade at the bottom.
          Keeps the surface reading as "still Ananya" rather than a modal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 500px at 50% -10%, rgba(201, 163, 78, 0.18), transparent 70%), radial-gradient(900px 500px at 50% 110%, rgba(17, 14, 10, 0.05), transparent 70%)",
        }}
      />
      <div className="relative flex max-w-2xl flex-col items-center text-center">
        <span
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={11} strokeWidth={1.6} className="text-gold" />
          Ananya
        </span>
        <h1
          className="font-serif text-[52px] font-bold leading-[1.05] text-ink md:text-[64px]"
          style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif" }}
        >
          Welcome.
        </h1>
        <p
          className="mt-5 max-w-xl text-balance text-[17px] leading-relaxed text-ink-soft md:text-[18px]"
          style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif" }}
        >
          Five questions about your wedding, then we&rsquo;ll help you build
          it.
        </p>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-muted">
          Your program, traditions, vibe, and priorities become the brief
          every vendor surface reads from. Takes about five minutes, and
          everything&rsquo;s editable later.
        </p>
        <button
          type="button"
          onClick={startBrief}
          className="group mt-10 inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-3.5 font-mono text-[11.5px] uppercase tracking-[0.22em] text-ivory transition-all hover:bg-gold hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Start the brief
          <ArrowRight
            size={13}
            strokeWidth={2}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
}
