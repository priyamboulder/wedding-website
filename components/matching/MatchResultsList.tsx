"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Creator } from "@/types/creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { useMatchingStore } from "@/stores/matching-store";
import { rankCreators } from "@/lib/creators/matching";
import { MatchCard } from "./MatchCard";
import { BookingFlow } from "./BookingFlow";

// ── MatchResultsList ──────────────────────────────────────────────────────
// Reads matching prefs from the store, ranks creators, and renders the
// list. Provides a "Retake quiz" CTA that defers to the parent.

export function MatchResultsList({
  weddingId,
  onRetake,
}: {
  weddingId: string;
  onRetake: () => void;
}) {
  const preferences = useMatchingStore((s) => s.preferences);
  const allCreators = useCreatorsStore((s) => s.creators);
  const [bookingCreator, setBookingCreator] = useState<Creator | null>(null);

  const matches = useMemo(() => {
    if (!preferences) return [];
    return rankCreators(allCreators, preferences, 5);
  }, [preferences, allCreators]);

  if (!preferences) return null;

  return (
    <section>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Your matches
          </p>
          <h2 className="mt-1.5 font-serif text-[26px] leading-tight text-ink">
            Creators who fit your wedding
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Ranked by module fit, style alignment, and experience at your
            budget.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
        >
          <RefreshCw size={12} strokeWidth={1.8} />
          Retake quiz
        </button>
      </header>

      {matches.length === 0 ? (
        <p className="rounded-lg border border-border bg-ivory-warm/40 px-5 py-4 text-[13px] text-ink-muted">
          No matches yet — try broadening your budget or selecting more
          modules.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {matches.map((match) => {
            const creator = allCreators.find((c) => c.id === match.creatorId);
            if (!creator) return null;
            return (
              <MatchCard
                key={creator.id}
                creator={creator}
                match={match}
                profileHref={`/${weddingId}/shopping/creators/${creator.id}`}
                onBook={setBookingCreator}
              />
            );
          })}
        </div>
      )}

      {bookingCreator && (
        <BookingFlow
          creator={bookingCreator}
          onClose={() => setBookingCreator(null)}
        />
      )}
    </section>
  );
}
