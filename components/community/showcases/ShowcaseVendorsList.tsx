"use client";

// ── ShowcaseVendorsList ─────────────────────────────────────────────────────
// The Vendors section — each vendor card shows the vendor's name, the role
// they played at the wedding, the couple's star rating, and a short review.

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShowcaseVendorReview } from "@/types/showcase";
import { getStoreVendor } from "@/lib/store-seed";

export function ShowcaseVendorsList({
  reviews,
}: {
  reviews: ShowcaseVendorReview[];
}) {
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-gold/15 bg-ivory-warm/30 py-14">
      <div className="mx-auto max-w-[960px] px-6">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Vendors
        </p>
        <h2 className="mt-2 font-serif text-[32px] font-medium text-ink md:text-[40px]">
          The team we'd book again.
        </h2>
        <div className="mt-8 space-y-4">
          {reviews.map((r) => (
            <VendorReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VendorReviewCard({ review }: { review: ShowcaseVendorReview }) {
  const vendor = getStoreVendor(review.vendorId);
  if (!vendor) return null;

  return (
    <article className="flex gap-4 rounded-xl border border-gold/20 bg-white p-5">
      <div
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ivory-warm font-serif text-[22px] text-ink"
      >
        {vendor.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-[18px] text-ink">{vendor.name}</h3>
            <p
              className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {review.role} · {vendor.origin}
            </p>
          </div>
          <StarRating rating={review.rating} />
        </div>
        <p className="mt-3 font-serif text-[15px] italic leading-[1.6] text-ink-muted">
          “{review.reviewText}”
        </p>
      </div>
    </article>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.5}
          className={cn(i < rating ? "text-gold" : "text-ink-faint/40")}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
