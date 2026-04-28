"use client";

// ── Confessional submission modal ───────────────────────────────────────────
// Rendered by ConfessionalTab and the detail page's "share another" CTA.
// Requires sign-in — if no user is loaded, the auth modal is opened
// instead. New posts always start with status='pending' and route to the
// admin queue before they appear on the public feed.

import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, RefreshCw, Shuffle, X } from "lucide-react";
import {
  CONFESSIONAL_CATEGORIES,
  CONFESSIONAL_LIMITS,
  type ConfessionalCategorySlug,
} from "@/types/confessional";
import { useAuthStore } from "@/stores/auth-store";
import { useConfessionalStore } from "@/stores/confessional-store";
import { generateAnonymousName } from "@/lib/community/confessional-names";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCategory?: ConfessionalCategorySlug;
}

type Stage = "compose" | "submitted";

export function ConfessionalSubmissionModal({
  open,
  onClose,
  defaultCategory,
}: Props) {
  const formId = useId();
  const user = useAuthStore((s) => s.user);
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const submitPost = useConfessionalStore((s) => s.submitPost);

  const [stage, setStage] = useState<Stage>("compose");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState<ConfessionalCategorySlug | "">(
    defaultCategory ?? "",
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close.
      setStage("compose");
      setDisplayName("");
      setCategory(defaultCategory ?? "");
      setTitle("");
      setBody("");
      setTagsInput("");
      setError(null);
    }
  }, [open, defaultCategory]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const titleRemaining = CONFESSIONAL_LIMITS.TITLE_MAX - title.length;
  const bodyRemaining = CONFESSIONAL_LIMITS.BODY_MAX - body.length;

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, CONFESSIONAL_LIMITS.TAGS_MAX),
    [tagsInput],
  );

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      openSignUp("planning-tool");
      onClose();
      return;
    }
    if (!category) {
      setError("Pick a category for your story.");
      return;
    }
    if (title.trim().length < 6) {
      setError("Give your story a title (at least 6 characters).");
      return;
    }
    if (body.trim().length < 40) {
      setError("Tell us a bit more — at least 40 characters.");
      return;
    }
    submitPost({
      author_id: user.id,
      display_name: displayName.trim() || undefined,
      title,
      body,
      category,
      tags,
    });
    setStage("submitted");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-heading`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-gold/15 px-6 py-5">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              The Confessional
            </p>
            <h2
              id={`${formId}-heading`}
              className="mt-1 font-serif text-[24px] font-semibold leading-tight text-ink"
            >
              {stage === "compose" ? "Share your story" : "It's in."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {stage === "submitted" ? (
          <SubmittedView onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
            <PrivacyNotice />

            {/* ── Display name ── */}
            <Field
              label="Anonymous alias"
              hint="Optional — leave blank and we'll make one up."
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. The Reluctant Plus-One"
                  maxLength={48}
                  className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDisplayName(generateAnonymousName())}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-ink/15 bg-ivory-warm/50 px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-saffron/40 hover:text-saffron"
                  title="Generate an alias for me"
                >
                  <Shuffle size={12} strokeWidth={1.8} />
                  Generate
                </button>
              </div>
            </Field>

            {/* ── Category ── */}
            <Field label="Category" required>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONFESSIONAL_CATEGORIES.map((c) => {
                  const active = c.slug === category;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setCategory(c.slug)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-[12px] font-medium transition-colors",
                        active
                          ? "border-ink bg-ink text-ivory"
                          : "border-ink/10 bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                      )}
                    >
                      {c.shortLabel}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* ── Title ── */}
            <Field
              label="Title"
              required
              hint={`${titleRemaining} characters left`}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, CONFESSIONAL_LIMITS.TITLE_MAX))}
                placeholder="A one-line hook — what's the headline?"
                className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-[14px] font-medium text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
            </Field>

            {/* ── Body ── */}
            <Field
              label="Your story"
              required
              hint={`${bodyRemaining} characters left`}
            >
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, CONFESSIONAL_LIMITS.BODY_MAX))}
                placeholder="Tell it in your words. Paragraph breaks welcome."
                rows={10}
                className="w-full resize-y rounded-md border border-ink/15 bg-white px-3 py-2.5 text-[13.5px] leading-[1.65] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
            </Field>

            {/* ── Tags ── */}
            <Field
              label="Tags"
              hint={`Optional, comma-separated. Up to ${CONFESSIONAL_LIMITS.TAGS_MAX}.`}
            >
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. mother-in-law, dress-fitting"
                className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-gold/30 bg-ivory-warm px-2 py-0.5 text-[11px] text-ink"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            {error && (
              <p className="mt-2 rounded-md border border-rose/30 bg-rose-pale/50 px-3 py-2 text-[12.5px] text-rose">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-[11px] italic text-ink-faint">
                Reviewed before publishing.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-[12px] font-medium text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ink-soft"
                >
                  Submit
                  <ArrowRight size={13} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function PrivacyNotice() {
  return (
    <div className="mb-4 rounded-lg border border-gold/20 bg-ivory-warm/40 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron" style={{ fontFamily: "var(--font-mono)" }}>
        Your identity is never shared
      </p>
      <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-muted">
        Stories are reviewed before publishing. Don't include real names of vendors,
        family members, or yourself — those will be flagged and the post returned.
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink" style={{ fontFamily: "var(--font-mono)" }}>
          {label}
          {required && <span className="ml-1 text-rose">*</span>}
        </label>
        {hint && (
          <span className="text-[10.5px] text-ink-faint">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SubmittedView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ivory-warm/50 text-gold">
        <RefreshCw size={20} strokeWidth={1.6} />
      </div>
      <p className="mt-5 font-serif text-[22px] italic text-ink">
        thank you for trusting us with it.
      </p>
      <p className="mt-2 max-w-[380px] text-[13.5px] leading-[1.6] text-ink-muted">
        Your story is in the queue. We review every submission for identifying
        info before it goes live — usually within a day or two.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ink-soft"
      >
        Back to the feed
      </button>
    </div>
  );
}
