"use client";

// ── Thread creation modal ───────────────────────────────────────────────────
// Topic pills (single-select) → title → body (placeholder switches per
// topic) → optional vendor tag → privacy callout → submit. Validates
// against the spec's character limits and enforces the daily rate limit
// + 7-day-old account rule before posting.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useGrapevineStore } from "@/stores/grapevine-store";
import {
  GRAPEVINE_BODY_MAX,
  GRAPEVINE_BODY_MIN,
  GRAPEVINE_DAILY_THREAD_LIMIT,
  GRAPEVINE_TITLE_MAX,
  GRAPEVINE_TITLE_MIN,
  GRAPEVINE_TOPICS,
  getGrapevineTopic,
} from "@/lib/community/grapevine";
import type { GrapevineTopicSlug } from "@/types/grapevine";
import { GrapevineTopicPills } from "./GrapevineTopicPills";
import { GrapevineVendorTag } from "./GrapevineVendorTag";
import { GrapevinePrivacyCallout } from "./GrapevinePrivacyCallout";

const ACCOUNT_AGE_DAYS = 7;

export function GrapevineThreadForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useCommunityProfilesStore((s) =>
    s.myProfileId ? s.profiles.find((p) => p.id === s.myProfileId) : undefined,
  );
  const createThread = useGrapevineStore((s) => s.createThread);
  const countRecent = useGrapevineStore((s) => s.countRecentThreads);

  const [topic, setTopic] = useState<GrapevineTopicSlug>("vendor_experiences");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [vendor, setVendor] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const topicMeta = useMemo(() => getGrapevineTopic(topic), [topic]);

  // Eligibility checks per spec.
  const eligibility = useMemo(() => {
    if (!myProfileId)
      return {
        ok: false,
        reason: "set up your community profile first so we can post on your behalf.",
      };
    if (!myProfile)
      return { ok: false, reason: "your profile isn't loaded yet — try refreshing." };
    const created = new Date(myProfile.created_at).getTime();
    const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
    if (ageDays < ACCOUNT_AGE_DAYS) {
      const days = Math.max(1, Math.ceil(ACCOUNT_AGE_DAYS - ageDays));
      return {
        ok: false,
        reason: `the grapevine is open to accounts at least ${ACCOUNT_AGE_DAYS} days old. you're a few more days away (~${days}).`,
      };
    }
    return { ok: true as const };
  }, [myProfileId, myProfile]);

  const titleLen = title.trim().length;
  const bodyLen = body.trim().length;
  const titleValid = titleLen >= GRAPEVINE_TITLE_MIN && titleLen <= GRAPEVINE_TITLE_MAX;
  const bodyValid = bodyLen >= GRAPEVINE_BODY_MIN && bodyLen <= GRAPEVINE_BODY_MAX;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!myProfileId) return;
    if (!eligibility.ok) {
      setError(eligibility.reason);
      return;
    }
    if (!titleValid) {
      setError(
        `give your thread a title between ${GRAPEVINE_TITLE_MIN} and ${GRAPEVINE_TITLE_MAX} characters.`,
      );
      return;
    }
    if (!bodyValid) {
      setError(
        `share a bit more — between ${GRAPEVINE_BODY_MIN} and ${GRAPEVINE_BODY_MAX} characters.`,
      );
      return;
    }
    const used = countRecent(myProfileId);
    if (used >= GRAPEVINE_DAILY_THREAD_LIMIT) {
      setError(
        `you've started ${used} threads in the last 24 hours — the limit is ${GRAPEVINE_DAILY_THREAD_LIMIT}. try again tomorrow.`,
      );
      return;
    }

    const thread = createThread({
      author_id: myProfileId,
      title,
      body,
      topic_category: topic,
      tagged_vendor_id: vendor?.id,
      tagged_vendor_name: vendor?.name,
    });
    onClose();
    router.push(`/community/grapevine/${thread.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/35 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-gold/20 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — the grapevine —
            </p>
            <h3 className="mt-2 font-serif text-[24px] font-medium text-ink">
              start an anonymous thread.
            </h3>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              your name won't be attached. you'll appear as a random pseudonym
              just for this thread.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
            aria-label="close"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {!eligibility.ok && (
          <p className="mt-4 rounded-md border border-saffron/40 bg-saffron/8 px-3 py-2 text-[12.5px] text-ink">
            {eligibility.reason}
          </p>
        )}

        <div className="mt-5 space-y-5">
          <div>
            <label
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Topic
            </label>
            <div className="mt-2">
              <GrapevineTopicPills
                active={topic}
                onChange={(slug) => {
                  if (slug !== "all") setTopic(slug);
                }}
                showAll={false}
              />
            </div>
            {topicMeta && (
              <p className="mt-2 text-[11.5px] italic text-ink-muted">
                {topicMeta.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="grape-title"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Title
            </label>
            <input
              id="grape-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="what's on your mind?"
              maxLength={GRAPEVINE_TITLE_MAX}
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
            />
            <p
              className={cn(
                "mt-1 text-right font-mono text-[10.5px]",
                titleValid ? "text-ink-faint" : "text-henna",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {titleLen}/{GRAPEVINE_TITLE_MAX}
              {titleLen > 0 && titleLen < GRAPEVINE_TITLE_MIN
                ? ` · min ${GRAPEVINE_TITLE_MIN}`
                : ""}
            </p>
          </div>

          <div>
            <label
              htmlFor="grape-body"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Tell the story
            </label>
            <textarea
              id="grape-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={topicMeta?.body_placeholder ?? ""}
              maxLength={GRAPEVINE_BODY_MAX}
              rows={8}
              className="mt-2 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-[1.6] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
            />
            <p
              className={cn(
                "mt-1 text-right font-mono text-[10.5px]",
                bodyValid ? "text-ink-faint" : "text-henna",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {bodyLen}/{GRAPEVINE_BODY_MAX}
              {bodyLen > 0 && bodyLen < GRAPEVINE_BODY_MIN
                ? ` · min ${GRAPEVINE_BODY_MIN}`
                : ""}
            </p>
          </div>

          <div>
            <label
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Tag a vendor <span className="normal-case">(optional)</span>
            </label>
            <div className="mt-2">
              <GrapevineVendorTag
                selectedId={vendor?.id}
                selectedName={vendor?.name}
                onSelect={(id, name) => setVendor({ id, name })}
                onClear={() => setVendor(null)}
              />
            </div>
          </div>

          <GrapevinePrivacyCallout variant="thread" />

          {error && (
            <p className="rounded-md border border-henna/30 bg-henna/5 px-3 py-2 text-[12.5px] text-ink">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-white px-4 py-2 text-[12.5px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink"
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={!eligibility.ok || !titleValid || !bodyValid}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            post anonymously
            <Send size={12} strokeWidth={1.8} />
          </button>
        </div>
      </form>
    </div>
  );
}
