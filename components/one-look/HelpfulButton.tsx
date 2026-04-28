"use client";

// ── Helpful vote button ──────────────────────────────────────────────────
// Heart icon + count, tappable to toggle. Syncs to the Zustand store.

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOneLookStore } from "@/stores/one-look-store";

const LOCAL_USER_ID = "local-user";

export function HelpfulButton({ reviewId }: { reviewId: string }) {
  const review = useOneLookStore((s) => s.reviews.find((r) => r.id === reviewId));
  const toggleHelpful = useOneLookStore((s) => s.toggleHelpful);
  if (!review) return null;
  const voted = review.helpfulVoters.includes(LOCAL_USER_ID);

  return (
    <button
      type="button"
      onClick={() => toggleHelpful(reviewId)}
      aria-pressed={voted}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
        voted
          ? "border-rose/40 bg-rose/10 text-rose"
          : "border-border bg-white text-ink-muted hover:border-rose/40 hover:text-rose",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Heart
        size={11}
        strokeWidth={1.8}
        className={cn(voted && "fill-rose")}
      />
      {review.helpfulCount} helpful
    </button>
  );
}
