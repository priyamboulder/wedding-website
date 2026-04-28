"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
  StatTile,
} from "@/components/vendor-portal/ui";
import ReviewRequestModal, {
  type ReviewRequestDraft,
} from "@/components/vendor-portal/ReviewRequestModal";
import { useVendorReviewsStore } from "@/stores/vendor-reviews-store";
import { useOneLookStore } from "@/stores/one-look-store";
import { extractPraiseKeywords } from "@/lib/vendor-portal/review-keywords";
import type { Review } from "@/lib/vendor-portal/seed";
import { VendorOneLookSummary } from "@/components/one-look/VendorOneLookSummary";

type FilterKey = "all" | "featured" | "needs-reply" | "5" | "4" | "low";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5 text-[#C4A265]" style={{ fontSize: size }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden className={i < rating ? "" : "text-stone-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

function matchesFilter(rev: Review, filter: FilterKey): boolean {
  switch (filter) {
    case "all":
      return true;
    case "featured":
      return Boolean(rev.featured);
    case "needs-reply":
      return !rev.response;
    case "5":
      return rev.rating === 5;
    case "4":
      return rev.rating === 4;
    case "low":
      return rev.rating <= 3;
  }
}

export default function VendorReviewsPage() {
  const reviews = useVendorReviewsStore((s) => s.reviews);
  const requests = useVendorReviewsStore((s) => s.requests);
  const setResponse = useVendorReviewsStore((s) => s.setResponse);
  const clearResponse = useVendorReviewsStore((s) => s.clearResponse);
  const toggleFeatured = useVendorReviewsStore((s) => s.toggleFeatured);
  const addRequest = useVendorReviewsStore((s) => s.addRequest);
  const resendRequest = useVendorReviewsStore((s) => s.resendRequest);
  const removeRequest = useVendorReviewsStore((s) => s.removeRequest);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState("");
  const [view, setView] = useState<"full" | "one_look">("full");
  const oneLookReviews = useOneLookStore((s) => s.reviews);
  const oneLookCount = useMemo(
    () => oneLookReviews.filter((r) => r.status === "published").length,
    [oneLookReviews],
  );

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(total, 1);
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));
    const needsReply = reviews.filter((r) => !r.response).length;
    const featured = reviews.filter((r) => r.featured).length;
    const keywords = extractPraiseKeywords(reviews);
    return { total, avg, distribution, needsReply, featured, keywords };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    return reviews
      .filter((r) => matchesFilter(r, filter))
      .slice()
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [reviews, filter]);

  const startEdit = (rev: Review) => {
    setEditingId(rev.id);
    setDraftReply(rev.response ?? "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    setResponse(editingId, draftReply);
    setEditingId(null);
    setDraftReply("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftReply("");
  };

  const handleRequestSubmit = (draft: ReviewRequestDraft) => {
    addRequest({
      coupleName: draft.coupleName,
      email: draft.email,
      eventType: draft.eventType,
      weddingDate: draft.weddingDate,
    });
  };

  const filters: { key: FilterKey; label: string; count?: number }[] = [
    { key: "all", label: "All", count: reviews.length },
    { key: "featured", label: "Featured", count: stats.featured },
    { key: "needs-reply", label: "Needs reply", count: stats.needsReply },
    { key: "5", label: "5 stars" },
    { key: "4", label: "4 stars" },
    { key: "low", label: "3 & below" },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Your reputation, curated"
        title="What couples say"
        description="Couples read your replies as closely as their own reviews. Reply warmly, by name, and feature the ones that capture you best — this is how new couples meet you."
        actions={
          <PrimaryButton onClick={() => setModalOpen(true)}>
            Request a review
          </PrimaryButton>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* View tabs — Full Reviews ↔ One Looks */}
        <div className="flex items-center gap-1 border-b border-stone-200">
          {[
            { id: "full", label: "Full Reviews", count: reviews.length },
            { id: "one_look", label: "One Looks", count: oneLookCount },
          ].map((t) => {
            const active = t.id === view;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id as "full" | "one_look")}
                className={`relative -mb-px flex items-center gap-1.5 px-4 pb-2.5 pt-1 text-[13px] font-medium transition-colors ${
                  active
                    ? "text-[#2C2C2C]"
                    : "text-stone-500 hover:text-[#2C2C2C]"
                }`}
              >
                {t.label}
                <span className="font-mono text-[10.5px] text-stone-400">
                  ({t.count})
                </span>
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#2C2C2C]" />
                )}
              </button>
            );
          })}
        </div>

        {view === "one_look" ? (
          <VendorOneLookSummary />
        ) : (
          <>
        {/* Summary grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
              Overall rating
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p
                className="text-[38px] leading-none text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {stats.avg.toFixed(1)}
              </p>
              <span className="text-[13px] text-stone-500">/ 5.0</span>
            </div>
            <div className="mt-2">
              <Stars rating={Math.round(stats.avg)} size={16} />
            </div>
            <p className="mt-2 text-[11.5px] text-stone-500">
              from {stats.total} reviews
            </p>
          </Card>

          <StatTile
            label="Featured on profile"
            value={stats.featured}
            sub={
              stats.featured > 0
                ? "pinned to your public page"
                : "pin your favorites"
            }
          />

          <Card className="p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
              Distribution
            </p>
            <div className="mt-3 space-y-1.5">
              {stats.distribution.map((d) => (
                <div
                  key={d.stars}
                  className="flex items-center gap-2 text-[11.5px]"
                >
                  <span className="w-6 text-stone-500">{d.stars}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5E6D0]/60">
                    <div
                      className="h-full rounded-full bg-[#C4A265]"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (d.count / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-4 text-right font-mono text-stone-500">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
              Couples praise you for
            </p>
            {stats.keywords.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stats.keywords.map((k) => (
                  <span
                    key={k.label}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11.5px] font-medium text-[#9E8245] ring-1"
                    style={{
                      backgroundColor: "#F5E6D0",
                      boxShadow: "inset 0 0 0 1px rgba(184,134,11,0.25)",
                    }}
                  >
                    <span className="italic">"{k.label}"</span>
                    <span className="font-mono text-[10px] text-stone-500">
                      ×{k.count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12px] italic text-stone-500">
                Patterns will emerge as more reviews come in.
              </p>
            )}
          </Card>
        </div>

        {/* Pending requests */}
        {requests.length > 0 && (
          <Card>
            <CardHeader
              title="Pending review requests"
              hint="Couples you've invited to share their experience."
            />
            <ul>
              {requests.map((rq, idx) => (
                <li
                  key={rq.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 ${
                    idx !== 0
                      ? "border-t border-[rgba(44,44,44,0.05)]"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-[#2C2C2C]">
                        {rq.coupleName}
                      </span>
                      <span className="font-mono text-[10.5px] text-stone-500">
                        {rq.email}
                      </span>
                      <Chip
                        tone={rq.status === "reminded" ? "gold" : "sage"}
                      >
                        {rq.status === "reminded" ? "Reminded" : rq.status}
                      </Chip>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-stone-500">
                      {rq.eventType ? `${rq.eventType} · ` : ""}
                      {rq.weddingDate ? `${rq.weddingDate} · ` : ""}
                      sent {rq.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => resendRequest(rq.id)}
                      className="rounded-md border px-2.5 py-1 text-[11.5px] text-stone-600 hover:bg-white"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    >
                      Send reminder
                    </button>
                    <button
                      onClick={() => removeRequest(rq.id)}
                      className="text-[11.5px] text-stone-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Review list */}
        <Card>
          <CardHeader
            title="Recent reviews"
            action={
              <div className="flex flex-wrap gap-1">
                {filters.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`rounded-full px-2.5 py-1 text-[11.5px] transition-colors ${
                        active
                          ? "bg-[#2C2C2C] text-[#FAF8F5]"
                          : "text-stone-600 hover:bg-white"
                      }`}
                      style={
                        active
                          ? undefined
                          : {
                              border: "1px solid rgba(44,44,44,0.12)",
                            }
                      }
                    >
                      {f.label}
                      {typeof f.count === "number" && (
                        <span
                          className={`ml-1 font-mono ${
                            active ? "text-[#FAF8F5]/70" : "text-stone-400"
                          }`}
                        >
                          {f.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            }
          />

          {visibleReviews.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p
                className="text-[16px] italic text-stone-600"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Nothing here under this filter.
              </p>
              <p className="mt-1 text-[12px] text-stone-500">
                Try a different view — your best work is probably somewhere
                else.
              </p>
            </div>
          ) : (
            <ul>
              {visibleReviews.map((rev, idx) => {
                const isEditing = editingId === rev.id;
                return (
                  <li
                    key={rev.id}
                    className={`px-6 py-5 ${
                      idx !== 0
                        ? "border-t border-[rgba(44,44,44,0.05)]"
                        : ""
                    } ${
                      rev.featured
                        ? "bg-gradient-to-r from-[#FBF4E6]/60 to-transparent"
                        : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars rating={rev.rating} />
                      <span className="text-[13px] font-medium text-[#2C2C2C]">
                        {rev.coupleName}
                      </span>
                      <Chip tone="neutral">{rev.eventType}</Chip>
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                        {rev.weddingDate} · posted {rev.postedAt}
                      </span>
                      {rev.featured && <Chip tone="gold">Featured</Chip>}
                      {!rev.response && <Chip tone="rose">Needs reply</Chip>}
                    </div>

                    <p
                      className="mt-2.5 text-[18px] leading-snug text-[#2C2C2C]"
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        fontStyle: "italic",
                      }}
                    >
                      "{rev.title}"
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-stone-700">
                      {rev.body}
                    </p>

                    {/* Reply block */}
                    {isEditing ? (
                      <div className="mt-4 rounded-lg border-l-2 border-[#C4A265] bg-[#FBF4E6] px-4 py-3">
                        <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#9E8245]">
                          Your reply · public
                        </p>
                        <textarea
                          value={draftReply}
                          onChange={(e) => setDraftReply(e.target.value)}
                          rows={3}
                          placeholder={`Write something warm to ${rev.coupleName.split(" ")[0]}…`}
                          className="mt-2 block w-full resize-y rounded-md border bg-white px-3 py-2 text-[14px] italic text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                          style={{
                            borderColor: "rgba(44,44,44,0.14)",
                            fontFamily: "'EB Garamond', serif",
                          }}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[11px] italic text-stone-500">
                            Replies appear on your public profile under this
                            review.
                          </p>
                          <div className="flex items-center gap-2">
                            <GhostButton onClick={cancelEdit}>
                              Cancel
                            </GhostButton>
                            <PrimaryButton onClick={saveEdit}>
                              Save reply
                            </PrimaryButton>
                          </div>
                        </div>
                      </div>
                    ) : rev.response ? (
                      <div className="mt-4 rounded-lg border-l-2 border-[#C4A265] bg-[#FBF4E6] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#9E8245]">
                            Your reply · public
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <button
                              onClick={() => startEdit(rev)}
                              className="hover:underline"
                            >
                              Edit
                            </button>
                            <span aria-hidden>·</span>
                            <button
                              onClick={() => clearResponse(rev.id)}
                              className="hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <p
                          className="mt-1 text-[14px] italic leading-snug text-stone-700"
                          style={{ fontFamily: "'EB Garamond', serif" }}
                        >
                          {rev.response}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => startEdit(rev)}
                          className="rounded-md bg-[#2C2C2C] px-3 py-1.5 text-[12px] text-[#FAF8F5] hover:bg-[#2e2e2e]"
                        >
                          Write reply
                        </button>
                        <button className="text-[12px] text-stone-500 hover:underline">
                          Flag as inappropriate
                        </button>
                      </div>
                    )}

                    {/* Feature toggle row */}
                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(44,44,44,0.05)] pt-3">
                      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-stone-600">
                        <span
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                            rev.featured ? "bg-[#C4A265]" : "bg-stone-300"
                          }`}
                          onClick={() => toggleFeatured(rev.id)}
                          role="switch"
                          aria-checked={Boolean(rev.featured)}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                              rev.featured ? "translate-x-3.5" : "translate-x-0.5"
                            }`}
                          />
                        </span>
                        <span onClick={() => toggleFeatured(rev.id)}>
                          {rev.featured
                            ? "Featured on public profile"
                            : "Feature on public profile"}
                        </span>
                      </label>
                      <span className="font-mono text-[10.5px] text-stone-400">
                        #{rev.id}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
          </>
        )}
      </div>

      {modalOpen && (
        <ReviewRequestModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleRequestSubmit}
        />
      )}
    </div>
  );
}
