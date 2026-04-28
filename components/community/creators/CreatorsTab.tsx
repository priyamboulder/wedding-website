"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useCreatorsStore } from "@/stores/creators-store";
import {
  DEMO_COUPLE_USER_ID,
  useMatchingStore,
} from "@/stores/matching-store";
import { MatchingQuiz } from "@/components/matching/MatchingQuiz";
import { MatchResultsList } from "@/components/matching/MatchResultsList";
import { FeaturedCreators } from "@/components/creators/FeaturedCreators";
import {
  CreatorProfileCard,
} from "@/components/creators/CreatorProfileCard";

// ── CreatorsTab ───────────────────────────────────────────────────────────
// Community > Creators. Entry point for couple-to-creator matching. Shows:
//   - Featured creators (Top Creator + Partner tier)
//   - If no prefs saved: the matching quiz
//   - If prefs saved: ranked match results + browse-all section
// The tab uses the "default" wedding id for profile links (the same
// convention used in ShowcaseShoutouts for community-level creator links).

const COMMUNITY_WEDDING_ID = "default";

export function CreatorsTab() {
  const preferences = useMatchingStore((s) => s.preferences);
  const savePreferences = useMatchingStore((s) => s.savePreferences);
  const clearPreferences = useMatchingStore((s) => s.clearPreferences);
  const allCreators = useCreatorsStore((s) => s.creators);

  // Client-only rendering toggle so we can trust persisted prefs are loaded.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Local state: show quiz when user clicks Retake, even if prefs exist
  const [forceQuiz, setForceQuiz] = useState(false);

  if (!hydrated) return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <div className="h-48 animate-pulse rounded-xl bg-ivory-warm/60" />
    </div>
  );

  const showQuiz = !preferences || forceQuiz;

  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <FeaturedCreators
        weddingId={COMMUNITY_WEDDING_ID}
        className="mb-12"
      />

      {showQuiz ? (
        <section className="rounded-xl border border-gold/20 bg-ivory-warm/30 px-8 py-10">
          <div className="mx-auto max-w-3xl">
            <header className="mb-6 text-center">
              <p
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Sparkles size={10} strokeWidth={1.8} />
                Find your creator
              </p>
              <h1 className="mt-3 font-serif text-[34px] leading-[1.05] tracking-[-0.005em] text-ink">
                A four-question match.
              </h1>
              <p className="mt-2 font-serif text-[15px] italic text-ink-muted">
                tell us what you need, and we'll point you to the creators
                who've done it before.
              </p>
            </header>

            <MatchingQuiz
              initial={preferences ?? undefined}
              onCancel={preferences ? () => setForceQuiz(false) : undefined}
              onComplete={(input) => {
                savePreferences({
                  ...input,
                  userId: DEMO_COUPLE_USER_ID,
                });
                setForceQuiz(false);
              }}
            />
          </div>
        </section>
      ) : (
        <MatchResultsList
          weddingId={COMMUNITY_WEDDING_ID}
          onRetake={() => {
            setForceQuiz(true);
          }}
        />
      )}

      {/* Browse all creators — always available below matches */}
      <section className="mt-16">
        <header className="mb-6">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Browse all creators
          </p>
          <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
            Every curator on the platform
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {allCreators.map((c) => (
            <CreatorProfileCard
              key={c.id}
              creator={c}
              weddingId={COMMUNITY_WEDDING_ID}
            />
          ))}
        </div>
      </section>

      {preferences && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => {
              clearPreferences();
              setForceQuiz(false);
            }}
            className="text-[11.5px] text-ink-faint underline-offset-4 hover:text-ink-muted hover:underline"
          >
            Clear my matching preferences
          </button>
        </div>
      )}
    </div>
  );
}
