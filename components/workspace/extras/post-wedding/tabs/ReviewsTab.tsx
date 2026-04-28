"use client";

// ── Vendor Reviews tab ────────────────────────────────────────────────────
// Auto-populate vendor list from the Coordination Hub roster. Two flows to
// create a review: manual form with stars + highlights + prose, or a guided
// AI interview that produces a draft the bride can edit. Tracks `aiDrafted`
// internally for quality monitoring but the flag is never surfaced publicly.

import {
  Clipboard,
  Edit3,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  COORDINATION_ROLE_ICON,
  COORDINATION_ROLE_LABEL,
} from "@/types/coordination";
import { useCoordinationStore } from "@/stores/coordination-store";
import { usePostWeddingStore } from "@/stores/post-wedding-store";
import { useOneLookStore } from "@/stores/one-look-store";
import type {
  Review,
  ReviewHighlight,
  ReviewInterviewAnswers,
} from "@/types/post-wedding";
import { REVIEW_HIGHLIGHT_LABEL } from "@/types/post-wedding";
import { OneLookForm } from "@/components/one-look/OneLookForm";
import {
  EmptyState,
  PillButton,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  Section,
  Select,
  TextArea,
  TextInput,
} from "../ui";

const SPEND_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Under $1K", label: "Under $1K" },
  { value: "$1-3K", label: "$1–3K" },
  { value: "$3-5K", label: "$3–5K" },
  { value: "$5-10K", label: "$5–10K" },
  { value: "$10-20K", label: "$10–20K" },
  { value: "$20K+", label: "$20K+" },
];

type EditState =
  | { mode: "idle" }
  | { mode: "manual"; vendorKey: string; review: Review | null }
  | { mode: "interview"; vendorKey: string }
  | { mode: "edit"; id: string }
  | { mode: "one_look"; vendorKey: string };

// A normalized target the review flow writes against — wraps either a
// coordination-hub vendor or a free-form vendor stub.
interface ReviewTarget {
  key: string;
  name: string;
  role: string;
  coordinationVendorId: string | null;
  platformVendorId: string | null;
  events?: string[];
}

export function ReviewsTab() {
  const vendors = useCoordinationStore((s) => s.vendors);
  const reviews = usePostWeddingStore((s) => s.reviews);
  const oneLooks = useOneLookStore((s) => s.reviews);
  const [edit, setEdit] = useState<EditState>({ mode: "idle" });

  // Match reviews to coordination vendors where possible; leftovers (reviews
  // written for vendors not in the hub) still show as "reviewed".
  const reviewByVendorId = new Map(
    reviews
      .filter((r) => r.coordinationVendorId)
      .map((r) => [r.coordinationVendorId as string, r] as const),
  );

  const targetsFromHub: ReviewTarget[] = vendors.map((v) => ({
    key: `hub:${v.id}`,
    name: v.name,
    role: v.role,
    coordinationVendorId: v.id,
    platformVendorId: v.platformVendorId,
  }));

  // Map existing One Looks by coordination vendor id for quick lookup
  const oneLookByVendorId = new Map(
    oneLooks
      .filter((r) => r.coordinationVendorId)
      .map((r) => [r.coordinationVendorId as string, r] as const),
  );

  // A vendor counts as "needs review" only when BOTH review types are absent.
  const needsReview = targetsFromHub.filter(
    (t) =>
      !reviewByVendorId.has(t.coordinationVendorId as string) &&
      !oneLookByVendorId.has(t.coordinationVendorId as string),
  );
  const reviewed = reviews;

  const total = targetsFromHub.length;
  // Count unique vendors touched by either flow
  const touchedVendors = new Set<string>();
  reviews
    .filter((r) => r.coordinationVendorId)
    .forEach((r) => touchedVendors.add(r.coordinationVendorId as string));
  oneLooks
    .filter((r) => r.coordinationVendorId && r.status === "published")
    .forEach((r) => touchedVendors.add(r.coordinationVendorId as string));
  const done = touchedVendors.size;

  return (
    <div className="space-y-5">
      <Section
        eyebrow="VENDOR REVIEWS"
        title="your reviews help future brides find great vendors"
        description="— and give credit to the people who made your day special. write them while the memory is still warm."
        right={
          <PrimaryButton
            icon={<Plus size={13} strokeWidth={1.8} />}
            onClick={() =>
              setEdit({
                mode: "manual",
                vendorKey: "custom:" + Date.now(),
                review: null,
              })
            }
          >
            Add a review
          </PrimaryButton>
        }
      >
        <ProgressBar
          done={done}
          total={Math.max(total, done)}
          label={total > 0 ? "Progress" : "Progress (no vendors on hub yet)"}
        />
      </Section>

      {edit.mode === "interview" && (
        <InterviewFlow
          target={findTargetByKey(edit.vendorKey, targetsFromHub)}
          onClose={() => setEdit({ mode: "idle" })}
        />
      )}

      {edit.mode === "manual" && (
        <ManualReviewEditor
          target={findTargetByKey(edit.vendorKey, targetsFromHub)}
          review={edit.review}
          onClose={() => setEdit({ mode: "idle" })}
        />
      )}

      {edit.mode === "edit" && (
        <ManualReviewEditor
          target={null}
          review={reviews.find((r) => r.id === edit.id) ?? null}
          onClose={() => setEdit({ mode: "idle" })}
        />
      )}

      {edit.mode === "one_look" &&
        (() => {
          const target = findTargetByKey(edit.vendorKey, targetsFromHub);
          if (!target) return null;
          return (
            <OneLookForm
              target={{
                coordinationVendorId: target.coordinationVendorId,
                platformVendorId: target.platformVendorId,
                vendorName: target.name,
                vendorRole: target.role,
              }}
              onClose={() => setEdit({ mode: "idle" })}
            />
          );
        })()}

      {needsReview.length === 0 && reviewed.length === 0 && (
        <EmptyState
          title="No vendors to review yet"
          body="Add vendors to the Coordination Hub or tap 'Add a review' to start — we'll auto-populate this list once your team is set up."
        />
      )}

      {needsReview.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Needs review — {needsReview.length}</SectionLabel>
          <ul className="space-y-3" role="list">
            {needsReview.map((t) => (
              <li key={t.key}>
                <ReviewStub
                  target={t}
                  onManual={() =>
                    setEdit({
                      mode: "manual",
                      vendorKey: t.key,
                      review: null,
                    })
                  }
                  onInterview={() =>
                    setEdit({ mode: "interview", vendorKey: t.key })
                  }
                  onOneLook={() =>
                    setEdit({ mode: "one_look", vendorKey: t.key })
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {oneLooks.filter((r) => r.coordinationVendorId && !reviewByVendorId.has(r.coordinationVendorId)).length > 0 && (
        <div className="space-y-3">
          <SectionLabel>
            One Look only — {oneLooks.filter((r) => r.coordinationVendorId && !reviewByVendorId.has(r.coordinationVendorId)).length}
          </SectionLabel>
          <ul className="space-y-3" role="list">
            {oneLooks
              .filter(
                (r) =>
                  r.coordinationVendorId &&
                  !reviewByVendorId.has(r.coordinationVendorId),
              )
              .map((ol) => {
                const target = targetsFromHub.find(
                  (t) => t.coordinationVendorId === ol.coordinationVendorId,
                );
                if (!target) return null;
                return (
                  <li key={ol.id}>
                    <OneLookSummaryRow
                      review={ol}
                      target={target}
                      onOpenOneLook={() =>
                        setEdit({ mode: "one_look", vendorKey: target.key })
                      }
                      onWriteFull={() =>
                        setEdit({
                          mode: "manual",
                          vendorKey: target.key,
                          review: null,
                        })
                      }
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Reviewed — {reviewed.length}</SectionLabel>
          <ul className="space-y-3" role="list">
            {reviewed.map((r) => {
              const target = r.coordinationVendorId
                ? targetsFromHub.find(
                    (t) => t.coordinationVendorId === r.coordinationVendorId,
                  )
                : null;
              const oneLook =
                r.coordinationVendorId
                  ? oneLookByVendorId.get(r.coordinationVendorId) ?? null
                  : null;
              return (
                <li key={r.id}>
                  <ReviewCard
                    review={r}
                    oneLook={oneLook}
                    onEdit={() => setEdit({ mode: "edit", id: r.id })}
                    onAddOneLook={
                      target
                        ? () =>
                            setEdit({ mode: "one_look", vendorKey: target.key })
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function findTargetByKey(
  key: string,
  targets: ReviewTarget[],
): ReviewTarget | null {
  return targets.find((t) => t.key === key) ?? null;
}

function roleIcon(role: string): string {
  return (COORDINATION_ROLE_ICON as Record<string, string>)[role] ?? "✨";
}

function roleLabel(role: string): string {
  return (
    (COORDINATION_ROLE_LABEL as Record<string, string>)[role] ?? role
  );
}

// ── Review stub (needs-review card) ───────────────────────────────────────

function ReviewStub({
  target,
  onManual,
  onInterview,
  onOneLook,
}: {
  target: ReviewTarget;
  onManual: () => void;
  onInterview: () => void;
  onOneLook: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="font-serif text-[16px] leading-snug text-ink">
        {roleIcon(target.role)} {target.name}
      </p>
      <p
        className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {roleLabel(target.role)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <PrimaryButton
          size="sm"
          icon={<Zap size={12} strokeWidth={1.8} />}
          onClick={onOneLook}
        >
          Give a One Look
        </PrimaryButton>
        <SecondaryButton
          size="sm"
          icon={<Star size={12} strokeWidth={1.8} />}
          onClick={onManual}
        >
          Write a full review
        </SecondaryButton>
        <SecondaryButton
          size="sm"
          icon={<Sparkles size={12} strokeWidth={1.8} />}
          onClick={onInterview}
        >
          Help me write one
        </SecondaryButton>
      </div>
      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        One Look: 20 seconds. Full review: 3 minutes.
      </p>
    </div>
  );
}

// Shown for vendors with a One Look but no full review yet.
function OneLookSummaryRow({
  review,
  target,
  onOpenOneLook,
  onWriteFull,
}: {
  review: import("@/types/one-look").OneLookReview;
  target: ReviewTarget;
  onOpenOneLook: () => void;
  onWriteFull: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] leading-snug text-ink">
            {roleIcon(target.role)} {target.name}
          </p>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {roleLabel(target.role)}
          </p>
          <p className="mt-2 text-[12.5px] text-ink-muted">
            ✅ One Look:{" "}
            <span className="font-serif text-ink tabular-nums">
              {review.score.toFixed(1)}
            </span>{" "}
            · <span className="italic">"{review.oneWord}"</span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SecondaryButton
          size="sm"
          icon={<Edit3 size={12} strokeWidth={1.8} />}
          onClick={onOpenOneLook}
        >
          Edit One Look
        </SecondaryButton>
        <PrimaryButton
          size="sm"
          icon={<Star size={12} strokeWidth={1.8} />}
          onClick={onWriteFull}
        >
          Write a full review →
        </PrimaryButton>
      </div>
    </div>
  );
}

// ── Reviewed card ─────────────────────────────────────────────────────────

function ReviewCard({
  review,
  oneLook,
  onEdit,
  onAddOneLook,
}: {
  review: Review;
  oneLook?: import("@/types/one-look").OneLookReview | null;
  onEdit: () => void;
  onAddOneLook?: () => void;
}) {
  const deleteReview = usePostWeddingStore((s) => s.deleteReview);
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    const text = [review.title, review.body].filter(Boolean).join("\n\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] leading-snug text-ink">
            {roleIcon(review.vendorRole)} {review.vendorName}
          </p>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {roleLabel(review.vendorRole)}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <StarDisplay rating={review.overallRating} />
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
                review.status === "published"
                  ? "bg-sage/20 text-sage"
                  : review.status === "draft"
                    ? "bg-ivory-warm text-ink-muted"
                    : "bg-stone-100 text-ink-muted",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {review.status}
            </span>
          </div>
          {review.title && (
            <p className="mt-2 font-serif text-[14.5px] italic text-ink">
              "{review.title}"
            </p>
          )}
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {review.body}
          </p>
          {review.highlights.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {review.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-sm bg-gold-pale/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {REVIEW_HIGHLIGHT_LABEL[h]}
                </span>
              ))}
            </div>
          )}
          {oneLook && (
            <p
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              also — one look: {oneLook.score.toFixed(1)} · "{oneLook.oneWord}"
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SecondaryButton
          size="sm"
          icon={<Edit3 size={12} strokeWidth={1.8} />}
          onClick={onEdit}
        >
          Edit review
        </SecondaryButton>
        {!oneLook && onAddOneLook && (
          <SecondaryButton
            size="sm"
            icon={<Zap size={12} strokeWidth={1.8} />}
            onClick={onAddOneLook}
          >
            Give a One Look
          </SecondaryButton>
        )}
        <SecondaryButton
          size="sm"
          icon={<Clipboard size={12} strokeWidth={1.8} />}
          onClick={copyToClipboard}
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </SecondaryButton>
        <SecondaryButton
          size="sm"
          tone="danger"
          icon={<Trash2 size={12} strokeWidth={1.8} />}
          onClick={() => {
            if (confirm(`Delete review for ${review.vendorName}?`)) {
              deleteReview(review.id);
            }
          }}
        >
          Delete
        </SecondaryButton>
      </div>
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.5}
          className={cn(
            i <= rating ? "fill-gold text-gold" : "text-ink-faint",
          )}
        />
      ))}
    </span>
  );
}

function StarInput({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            strokeWidth={1.5}
            className={cn(
              i <= value ? "fill-gold text-gold" : "text-ink-faint",
            )}
          />
        </button>
      ))}
    </span>
  );
}

// ── Manual review editor ──────────────────────────────────────────────────

function ManualReviewEditor({
  target,
  review,
  onClose,
  initialBody,
  aiDrafted,
  aiDraftOriginal,
}: {
  target: ReviewTarget | null;
  review: Review | null;
  onClose: () => void;
  initialBody?: string;
  aiDrafted?: boolean;
  aiDraftOriginal?: string;
}) {
  const addReview = usePostWeddingStore((s) => s.addReview);
  const updateReview = usePostWeddingStore((s) => s.updateReview);

  const [vendorName, setVendorName] = useState(
    review?.vendorName ?? target?.name ?? "",
  );
  const [vendorRole, setVendorRole] = useState(
    review?.vendorRole ?? target?.role ?? "vendor",
  );
  const [overall, setOverall] = useState(review?.overallRating ?? 5);
  const [quality, setQuality] = useState(review?.qualityRating ?? 0);
  const [communication, setCommunication] = useState(
    review?.communicationRating ?? 0,
  );
  const [value, setValue] = useState(review?.valueRating ?? 0);
  const [professionalism, setProfessionalism] = useState(
    review?.professionalismRating ?? 0,
  );
  const [title, setTitle] = useState(review?.title ?? "");
  const [body, setBody] = useState(review?.body ?? initialBody ?? "");
  const [highlights, setHighlights] = useState<ReviewHighlight[]>(
    review?.highlights ?? [],
  );
  const [wouldRecommend, setWouldRecommend] = useState(
    review?.wouldRecommend ?? true,
  );
  const [approxSpend, setApproxSpend] = useState(review?.approximateSpend ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    review?.status === "published" ? "published" : "draft",
  );

  function toggleHighlight(h: ReviewHighlight) {
    setHighlights((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );
  }

  function save(publish: boolean) {
    if (!vendorName.trim() || !body.trim()) return;
    const payload = {
      vendorName: vendorName.trim(),
      vendorRole,
      coordinationVendorId: target?.coordinationVendorId ?? null,
      platformVendorId: target?.platformVendorId ?? null,
      overallRating: overall,
      qualityRating: quality || null,
      communicationRating: communication || null,
      valueRating: value || null,
      professionalismRating: professionalism || null,
      title: title.trim(),
      body: body.trim(),
      highlights,
      wouldRecommend,
      approximateSpend: approxSpend || null,
      status: publish ? ("published" as const) : status,
      aiDrafted: aiDrafted ?? review?.aiDrafted ?? false,
      aiDraftOriginal:
        aiDraftOriginal ?? review?.aiDraftOriginal ?? "",
    };
    if (review) {
      updateReview(review.id, payload);
    } else {
      addReview(payload);
    }
    onClose();
  }

  return (
    <div className="rounded-lg border border-saffron/30 bg-ivory-warm/30 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        REVIEW
      </p>
      <h4 className="mt-1 font-serif text-[18px] leading-snug text-ink">
        {vendorName || "Add a vendor"}
      </h4>
      {roleLabel(vendorRole) && (
        <p
          className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {roleLabel(vendorRole)}
        </p>
      )}

      <div className="mt-5 space-y-5">
        {(!target || !review) && (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Vendor name">
              <TextInput
                value={vendorName}
                onChange={setVendorName}
                placeholder="Raj Photography Studio"
              />
            </Field>
            <Field label="Role">
              <TextInput
                value={vendorRole}
                onChange={setVendorRole}
                placeholder="photographer"
              />
            </Field>
          </div>
        )}

        <div>
          <LabelRow>Overall rating</LabelRow>
          <StarInput value={overall} onChange={setOverall} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SubStarRow label="Quality" value={quality} onChange={setQuality} />
          <SubStarRow
            label="Communication"
            value={communication}
            onChange={setCommunication}
          />
          <SubStarRow label="Value for money" value={value} onChange={setValue} />
          <SubStarRow
            label="Professionalism"
            value={professionalism}
            onChange={setProfessionalism}
          />
        </div>

        <div>
          <LabelRow>Highlights — tap all that apply</LabelRow>
          <div className="flex flex-wrap gap-2">
            {Object.keys(REVIEW_HIGHLIGHT_LABEL).map((h) => {
              const key = h as ReviewHighlight;
              return (
                <PillButton
                  key={h}
                  active={highlights.includes(key)}
                  onClick={() => toggleHighlight(key)}
                >
                  {REVIEW_HIGHLIGHT_LABEL[key]}
                </PillButton>
              );
            })}
          </div>
        </div>

        <Field label="Review title (optional)">
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="Sum it up in a sentence"
          />
        </Field>

        <Field label="Your review">
          <TextArea
            value={body}
            onChange={setBody}
            rows={7}
            placeholder="what was your experience like? what stood out? would you book them again?"
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Would you recommend?">
            <div className="flex gap-2">
              <PillButton
                active={wouldRecommend}
                onClick={() => setWouldRecommend(true)}
              >
                Yes
              </PillButton>
              <PillButton
                active={!wouldRecommend}
                onClick={() => setWouldRecommend(false)}
              >
                No
              </PillButton>
            </div>
          </Field>
          <Field label="Approximate spend (optional)">
            <Select
              value={approxSpend}
              onChange={setApproxSpend}
              options={SPEND_OPTIONS}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <SecondaryButton
          onClick={() => save(false)}
          disabled={!vendorName.trim() || !body.trim()}
        >
          Save as draft
        </SecondaryButton>
        <PrimaryButton
          onClick={() => save(true)}
          disabled={!vendorName.trim() || !body.trim()}
        >
          Publish review
        </PrimaryButton>
      </div>
    </div>
  );
}

function SubStarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <StarInput value={value} onChange={onChange} size={14} />
    </div>
  );
}

function LabelRow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span
        className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

// ── Interview flow ───────────────────────────────────────────────────────

const OVERALL_OPTIONS: { value: ReviewInterviewAnswers["overall"]; label: string }[] = [
  { value: "amazing", label: "Amazing" },
  { value: "great", label: "Great" },
  { value: "good", label: "Good" },
  { value: "mixed", label: "Mixed" },
  { value: "poor", label: "Poor" },
];

function overallToRating(overall: ReviewInterviewAnswers["overall"]): number {
  return (
    { amazing: 5, great: 5, good: 4, mixed: 3, poor: 2 }[overall] ?? 4
  );
}

function InterviewFlow({
  target,
  onClose,
}: {
  target: ReviewTarget | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"interview" | "draft">("interview");
  const [overall, setOverall] = useState<ReviewInterviewAnswers["overall"]>(
    "amazing",
  );
  const [highlights, setHighlights] = useState<ReviewHighlight[]>([]);
  const [specificMoment, setSpecificMoment] = useState("");
  const [improvement, setImprovement] = useState("");
  const [oneSentence, setOneSentence] = useState("");
  const [draft, setDraft] = useState("");
  const [originalDraft, setOriginalDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleHighlight(h: ReviewHighlight) {
    setHighlights((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );
  }

  async function generate(
    tone: "default" | "shorter" | "detailed" = "default",
  ) {
    if (!target) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/post-wedding/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          vendor: {
            name: target.name,
            role: target.role,
          },
          answers: {
            overall,
            highlights,
            specificMoment,
            improvement,
            oneSentence,
          } satisfies ReviewInterviewAnswers,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { content: string };
      setDraft(data.content);
      if (tone === "default") setOriginalDraft(data.content);
      setStep("draft");
    } catch {
      setError("Couldn't generate — try again or skip to the manual form.");
    } finally {
      setGenerating(false);
    }
  }

  if (!target) {
    return (
      <div className="rounded-lg border border-border bg-ivory-warm/40 p-5">
        <p className="text-[13px] text-ink-muted">
          Pick a vendor from the list below to start the guided flow.
        </p>
        <div className="mt-3">
          <SecondaryButton onClick={onClose}>Close</SecondaryButton>
        </div>
      </div>
    );
  }

  if (step === "draft") {
    return (
      <DraftReview
        target={target}
        draft={draft}
        setDraft={setDraft}
        originalDraft={originalDraft}
        overall={overall}
        highlights={highlights}
        regenerate={() => generate("default")}
        shorter={() => generate("shorter")}
        longer={() => generate("detailed")}
        generating={generating}
        error={error}
        onCancel={onClose}
      />
    );
  }

  return (
    <div className="rounded-lg border border-saffron/30 bg-ivory-warm/30 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        LET'S DRAFT YOUR REVIEW FOR
      </p>
      <h4 className="mt-1 font-serif text-[18px] leading-snug text-ink">
        {roleIcon(target.role)} {target.name}
      </h4>
      <p className="mt-1 text-[13px] text-ink-muted">
        answer a few quick questions and we'll write a draft you can edit and
        make your own.
      </p>

      <div className="mt-5 space-y-5">
        <div>
          <LabelRow>1. Overall, how was your experience?</LabelRow>
          <div className="flex flex-wrap gap-2">
            {OVERALL_OPTIONS.map((o) => (
              <PillButton
                key={o.value}
                active={overall === o.value}
                onClick={() => setOverall(o.value)}
              >
                {o.label}
              </PillButton>
            ))}
          </div>
        </div>

        <div>
          <LabelRow>2. What stood out the most? (select all that apply)</LabelRow>
          <div className="flex flex-wrap gap-2">
            {Object.keys(REVIEW_HIGHLIGHT_LABEL).map((h) => {
              const key = h as ReviewHighlight;
              return (
                <PillButton
                  key={h}
                  active={highlights.includes(key)}
                  onClick={() => toggleHighlight(key)}
                >
                  {REVIEW_HIGHLIGHT_LABEL[key]}
                </PillButton>
              );
            })}
          </div>
        </div>

        <Field label="3. Any specific moment they nailed?">
          <TextInput
            value={specificMoment}
            onChange={setSpecificMoment}
            placeholder="e.g., caught my dad's reaction during the pheras perfectly"
          />
        </Field>

        <Field label="4. Anything they could improve? (optional)">
          <TextInput
            value={improvement}
            onChange={setImprovement}
            placeholder="honest feedback helps"
          />
        </Field>

        <Field label="5. One sentence you'd say to a friend about them?">
          <TextInput
            value={oneSentence}
            onChange={setOneSentence}
            placeholder="e.g., book them before they're booked"
          />
        </Field>

        {error && (
          <p className="text-[12.5px] text-rose">{error}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={() => generate("default")}
          disabled={generating}
          icon={<Sparkles size={13} strokeWidth={1.8} />}
        >
          {generating ? "Generating…" : "Generate draft"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function DraftReview({
  target,
  draft,
  setDraft,
  originalDraft,
  overall,
  highlights,
  regenerate,
  shorter,
  longer,
  generating,
  error,
  onCancel,
}: {
  target: ReviewTarget;
  draft: string;
  setDraft: (s: string) => void;
  originalDraft: string;
  overall: ReviewInterviewAnswers["overall"];
  highlights: ReviewHighlight[];
  regenerate: () => void;
  shorter: () => void;
  longer: () => void;
  generating: boolean;
  error: string | null;
  onCancel: () => void;
}) {
  const addReview = usePostWeddingStore((s) => s.addReview);
  const [overallRating, setOverallRating] = useState(overallToRating(overall));
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  function save(publish: boolean) {
    if (!draft.trim()) return;
    addReview({
      vendorName: target.name,
      vendorRole: target.role,
      coordinationVendorId: target.coordinationVendorId,
      platformVendorId: target.platformVendorId,
      overallRating,
      title: title.trim(),
      body: draft.trim(),
      highlights,
      wouldRecommend: overall !== "poor",
      aiDrafted: true,
      aiDraftOriginal: originalDraft,
      status: publish ? "published" : status,
    });
    onCancel();
  }

  return (
    <div className="rounded-lg border border-saffron/30 bg-ivory-warm/30 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        HERE'S YOUR DRAFT
      </p>
      <h4 className="mt-1 font-serif text-[18px] leading-snug text-ink">
        {roleIcon(target.role)} {target.name}
      </h4>
      <p className="mt-1 text-[13px] text-ink-muted">
        ✨ generated based on your answers. edit it, add to it, make it yours —
        then publish when you're happy.
      </p>

      <div className="mt-4">
        <TextArea value={draft} onChange={setDraft} rows={10} />
        {error && <p className="mt-1 text-[12.5px] text-rose">{error}</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SecondaryButton
          size="sm"
          icon={<Sparkles size={12} strokeWidth={1.8} />}
          onClick={regenerate}
          disabled={generating}
        >
          {generating ? "Working…" : "Regenerate"}
        </SecondaryButton>
        <SecondaryButton size="sm" onClick={shorter} disabled={generating}>
          Make it shorter
        </SecondaryButton>
        <SecondaryButton size="sm" onClick={longer} disabled={generating}>
          Make it more detailed
        </SecondaryButton>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <LabelRow>Now add your rating</LabelRow>
          <StarInput value={overallRating} onChange={setOverallRating} />
        </div>
        <Field label="Title (optional)">
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="Sum it up in a sentence"
          />
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <SecondaryButton
          onClick={() => {
            setStatus("draft");
            save(false);
          }}
          disabled={!draft.trim()}
        >
          Save as draft
        </SecondaryButton>
        <PrimaryButton
          onClick={() => save(true)}
          disabled={!draft.trim()}
        >
          Publish review
        </PrimaryButton>
      </div>
    </div>
  );
}
