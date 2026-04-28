"use client";

// ── Vendor Roulette entry banner ────────────────────────────────────────────
// Lightweight nudge card that sits above the AI recommendations on /vendors.
// Replaces the old "Roulette" tab, which was invisible to most users. Hides
// once the couple has run at least one roulette session or explicitly
// dismissed it.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Dices, Sparkles, X } from "lucide-react";

const DISMISS_KEY = "roulette-banner-dismissed";

export function RouletteBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      // ignore — SSR or disabled storage
    }
    setReady(true);
  }, []);

  if (!ready || dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  const handleTry = () => {
    router.push("/vendors?tab=roulette");
  };

  return (
    <section className="mb-6 overflow-hidden rounded-[12px] border border-gold/30 bg-gradient-to-r from-gold-pale/60 via-ivory-warm/50 to-white">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-white/70 text-gold">
          <Dices size={18} strokeWidth={1.7} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} strokeWidth={1.7} className="text-gold" />
            <h3 className="font-serif text-[15.5px] text-ink">
              Can't decide? Spin the Vendor Roulette
            </h3>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">
            We'll surface a random vendor from your open categories — you might
            just find your perfect fit.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTry}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-gold px-3.5 py-2 text-[12px] font-medium text-ivory shadow-sm transition-opacity hover:opacity-90"
        >
          Try Roulette
          <ArrowRight size={12} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss roulette banner"
          className="flex shrink-0 items-center justify-center rounded-md p-1 text-ink-faint transition-colors hover:bg-white/60 hover:text-ink-muted"
        >
          <X size={13} strokeWidth={1.8} />
        </button>
      </div>
    </section>
  );
}
