"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/creator";
import { useMatchingStore } from "@/stores/matching-store";

// ── ConsultationReviews ───────────────────────────────────────────────────
// Reviews from completed consultations. Shown on creator profiles under
// the services section.

export function ConsultationReviews({ creator }: { creator: Creator }) {
  const allReviews = useMatchingStore((s) => s.reviews);
  const reviews = useMemo(
    () =>
      allReviews
        .filter((r) => r.creatorId === creator.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        ),
    [allReviews, creator.id],
  );

  if (reviews.length === 0) return null;

  const average =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="rounded-xl border border-gold/20 bg-white p-6">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Consultation reviews
          </p>
          <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
            What couples said after working with {creator.displayName.split(" ")[0]}
          </h2>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Star size={16} strokeWidth={1.8} className="text-gold" />
            <span className="font-serif text-[22px] text-ink">
              {average.toFixed(1)}
            </span>
          </div>
          <p
            className="font-mono text-[10.5px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-border bg-ivory-warm/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-pale/60 font-mono text-[11px] uppercase tracking-wider text-gold">
                  {r.coupleDisplayInitials}
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        strokeWidth={1.5}
                        className={cn(
                          i < r.rating
                            ? "fill-gold text-gold"
                            : "fill-none text-ink-faint",
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className="mt-0.5 font-mono text-[10px] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDate(r.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink">
              {r.reviewText}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
