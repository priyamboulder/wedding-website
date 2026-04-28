"use client";

import { useMemo, useState } from "react";
import {
  RATING_DISTRIBUTION,
  REVIEWS,
  REVIEW_STATS,
  type Review,
} from "@/lib/seller/reviews-seed";
import { SELLER } from "@/lib/seller/seed";

type FilterKind = "all" | "5" | "4" | "3" | "needs-response" | "with-photos";
type SortKind = "recent" | "highest" | "lowest";

const ACCENT = "#C4A265";
const INK = "#2C2C2C";
const MUTED_BORDER = "rgba(44,44,44,0.08)";
const CHAMPAGNE = "#FBF3E4";
const IVORY = "#FFFFFA";

const FILTERS: { id: FilterKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "5", label: "5-star" },
  { id: "4", label: "4-star" },
  { id: "3", label: "3-star" },
  { id: "needs-response", label: "Needs response" },
  { id: "with-photos", label: "With photos" },
];

const SORTS: { id: SortKind; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "highest", label: "Highest rating" },
  { id: "lowest", label: "Lowest rating" },
];

export default function SellerReviewsPage() {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [sort, setSort] = useState<SortKind>("recent");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = REVIEWS.slice();
    if (filter === "5") list = list.filter((r) => r.rating === 5);
    else if (filter === "4") list = list.filter((r) => r.rating === 4);
    else if (filter === "3") list = list.filter((r) => r.rating === 3);
    else if (filter === "needs-response") list = list.filter((r) => r.needsResponse);
    else if (filter === "with-photos") list = list.filter((r) => r.photos && r.photos.length > 0);

    if (sort === "recent") list.sort((a, b) => b.sortKey - a.sortKey);
    else if (sort === "highest") list.sort((a, b) => b.rating - a.rating || b.sortKey - a.sortKey);
    else list.sort((a, b) => a.rating - b.rating || b.sortKey - a.sortKey);

    return list;
  }, [filter, sort]);

  return (
    <div className="pb-16">
      {/* ── Hero: overall rating + distribution ── */}
      <section className="border-b px-8 py-8" style={{ borderColor: MUTED_BORDER }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-[32px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.015em",
              }}
            >
              Reviews
            </h1>
            <p className="mt-1 text-[13px] text-stone-500">
              Responding to all reviews improves shop credibility and search ranking.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
            {SELLER.shopName}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[auto,1fr,auto]">
          {/* Overall rating */}
          <div
            className="flex flex-col items-start gap-2 rounded-xl border px-6 py-5"
            style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: CHAMPAGNE }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
              Overall rating
            </p>
            <div className="flex items-baseline gap-3">
              <p
                className="text-[52px] leading-none text-[#2C2C2C]"
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                {REVIEW_STATS.averageRating.toFixed(1)}
              </p>
              <Stars rating={REVIEW_STATS.averageRating} size={18} />
            </div>
            <p className="text-[12.5px] text-stone-600">
              from {REVIEW_STATS.totalReviews} reviews
            </p>
          </div>

          {/* Distribution bars */}
          <div
            className="flex flex-col gap-1.5 rounded-xl border px-6 py-5"
            style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: IVORY }}
          >
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
              Rating distribution
            </p>
            {RATING_DISTRIBUTION.map((row) => {
              const pct = REVIEW_STATS.totalReviews === 0
                ? 0
                : Math.round((row.count / REVIEW_STATS.totalReviews) * 100);
              return (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-12 font-mono text-[11px] text-stone-600">
                    {row.stars}-star
                  </span>
                  <div
                    className="relative h-2 flex-1 overflow-hidden rounded-full"
                    style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: ACCENT }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] text-stone-600">
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Response stats */}
          <div
            className="flex flex-col gap-2 rounded-xl border px-6 py-5"
            style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: IVORY, minWidth: 180 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
              Needs response
            </p>
            <p
              className="text-[34px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontWeight: 500,
              }}
            >
              {REVIEW_STATS.needsResponseCount}
            </p>
            <p className="text-[11.5px] text-stone-500">
              {REVIEW_STATS.withPhotosCount} reviews with buyer photos
            </p>
            {REVIEW_STATS.needsResponseCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("needs-response")}
                className="mt-1 self-start text-[12px] text-[#7a5a16] hover:underline"
              >
                Show them →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filter + sort bar ── */}
      <div
        className="sticky top-[100px] z-20 flex flex-wrap items-center justify-between gap-3 border-b px-8 py-4"
        style={{ borderColor: MUTED_BORDER, backgroundColor: "rgba(250,248,245,0.94)", backdropFilter: "blur(10px)" }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count = countFor(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12px] transition-colors"
                style={{
                  borderColor: active ? "rgba(196,162,101,0.5)" : "rgba(44,44,44,0.12)",
                  backgroundColor: active ? CHAMPAGNE : "white",
                  color: active ? "#7a5a16" : INK,
                  fontWeight: active ? 500 : 400,
                }}
              >
                {f.label}
                {count !== undefined && (
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: active ? "#7a5a16" : "rgba(44,44,44,0.5)" }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-[12px] text-stone-500">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKind)}
            className="h-8 rounded-md border bg-white px-2.5 text-[12px] text-[#2C2C2C] focus:outline-none"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ── Review list ── */}
      <div className="px-8 py-8">
        {visible.length === 0 ? (
          <div
            className="mx-auto max-w-xl rounded-xl border px-6 py-10 text-center"
            style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: IVORY }}
          >
            <p className="text-[14px] text-stone-600">No reviews match this filter.</p>
          </div>
        ) : (
          <ul className="mx-auto flex max-w-4xl flex-col gap-4">
            {visible.map((r) => (
              <li key={r.id}>
                <ReviewCard
                  review={r}
                  isResponding={respondingId === r.id}
                  isEditing={editingId === r.id}
                  onRespond={() => {
                    setRespondingId(r.id);
                    setEditingId(null);
                  }}
                  onEdit={() => {
                    setEditingId(r.id);
                    setRespondingId(null);
                  }}
                  onCancel={() => {
                    setRespondingId(null);
                    setEditingId(null);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function countFor(id: FilterKind): number | undefined {
  if (id === "all") return REVIEWS.length;
  if (id === "5") return REVIEWS.filter((r) => r.rating === 5).length;
  if (id === "4") return REVIEWS.filter((r) => r.rating === 4).length;
  if (id === "3") return REVIEWS.filter((r) => r.rating === 3).length;
  if (id === "needs-response") return REVIEWS.filter((r) => r.needsResponse).length;
  if (id === "with-photos") return REVIEWS.filter((r) => r.photos && r.photos.length > 0).length;
  return undefined;
}

// ── Review card ────────────────────────────────────────────────

function ReviewCard({
  review,
  isResponding,
  isEditing,
  onRespond,
  onEdit,
  onCancel,
}: {
  review: Review;
  isResponding: boolean;
  isEditing: boolean;
  onRespond: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(review.sellerResponse?.body ?? "");

  return (
    <article
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: review.needsResponse
          ? "rgba(178,58,42,0.28)"
          : "rgba(196,162,101,0.25)",
        backgroundColor: IVORY,
      }}
    >
      <div className="px-6 py-5">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Stars rating={review.rating} size={16} />
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
            {review.date}
          </p>
        </div>

        {/* Body */}
        <p
          className="mt-3 text-[15px] leading-relaxed text-stone-700"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17 }}
        >
          &ldquo;{review.body}&rdquo;
        </p>

        {/* Buyer + product */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[13.5px] text-[#2C2C2C]">— {review.buyerName}</p>
          <span className="text-stone-300" aria-hidden>·</span>
          <p className="text-[12.5px] text-stone-600">
            Product: <span className="text-[#2C2C2C]">{review.productName}</span>
            {review.productQuantity ? (
              <span className="text-stone-500"> (×{review.productQuantity})</span>
            ) : null}
          </p>
        </div>

        {/* Buyer photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {review.photos.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-md border"
                style={{ borderColor: "rgba(44,44,44,0.1)" }}
              >
                <div
                  className="flex h-24 w-32 items-center justify-center font-mono text-[9px] uppercase tracking-[0.22em]"
                  style={{ backgroundColor: p.tint, color: "rgba(44,44,44,0.45)" }}
                  aria-hidden
                >
                  Buyer photo
                </div>
                <p className="bg-white px-2 py-1 text-[10.5px] text-stone-600">
                  {p.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seller response block */}
      <div
        className="border-t px-6 py-4"
        style={{
          borderColor: MUTED_BORDER,
          backgroundColor: review.needsResponse && !isResponding ? "rgba(232,213,208,0.28)" : CHAMPAGNE,
        }}
      >
        {review.sellerResponse && !isEditing && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
              Your response · {review.sellerResponse.date}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-stone-700">
              &ldquo;{review.sellerResponse.body}&rdquo;
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
                style={{ borderColor: "rgba(44,44,44,0.12)" }}
              >
                Edit response
              </button>
            </div>
          </>
        )}

        {!review.sellerResponse && !isResponding && (
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[12.5px]" style={{ color: review.needsResponse ? "#B23A2A" : "#7a5a16" }}>
              <span aria-hidden>⚠</span>
              {review.needsResponse ? "No response yet" : "Respond to this review"}
            </p>
            <button
              type="button"
              onClick={onRespond}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Respond <span aria-hidden>→</span>
            </button>
          </div>
        )}

        {(isResponding || isEditing) && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
              {isEditing ? "Edit your response" : "Public response to this review"}
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={`Thank ${review.buyerName.split("&")[0].trim()} for their review…`}
              className="mt-2 w-full resize-none rounded-md border bg-white px-3 py-2 text-[13px] focus:outline-none"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-stone-500">
                Visible to anyone viewing this review on your shop page.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex h-8 items-center rounded-md border bg-white px-3 text-[12px] text-[#2C2C2C] hover:bg-white/60"
                  style={{ borderColor: "rgba(44,44,44,0.12)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={draft.trim().length === 0}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: ACCENT,
                    opacity: draft.trim().length === 0 ? 0.45 : 1,
                    cursor: draft.trim().length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {isEditing ? "Save changes" : "Post response"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// ── Stars ───────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  return (
    <div className="flex items-center gap-0.5" style={{ fontSize: size }} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        let color = "#E8D5D0";
        if (i < full) color = ACCENT;
        else if (i === full && half) color = ACCENT;
        return (
          <span key={i} style={{ color }} aria-hidden>
            ★
          </span>
        );
      })}
    </div>
  );
}
