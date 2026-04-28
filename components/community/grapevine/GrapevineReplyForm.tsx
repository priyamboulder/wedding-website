"use client";

// ── Reply form ──────────────────────────────────────────────────────────────
// Inline composer at the bottom of a thread. Tells the bride exactly which
// pseudonym she'll appear as in this thread, validates char limits + the
// daily anonymous reply cap, and disables itself for guests.

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useGrapevineStore } from "@/stores/grapevine-store";
import {
  GRAPEVINE_DAILY_REPLY_LIMIT,
  GRAPEVINE_REPLY_MAX,
  GRAPEVINE_REPLY_MIN,
} from "@/lib/community/grapevine";
import { getAnonymousIdentity } from "@/lib/community/anonymous";
import { GrapevinePrivacyCallout } from "./GrapevinePrivacyCallout";
import { AnonymousAvatar } from "@/components/community/AnonymousAvatar";

export function GrapevineReplyForm({ threadId }: { threadId: string }) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const addReply = useGrapevineStore((s) => s.addReply);
  const countRecent = useGrapevineStore((s) => s.countRecentReplies);

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const identity = useMemo(
    () => (myProfileId ? getAnonymousIdentity(myProfileId, threadId) : null),
    [myProfileId, threadId],
  );

  const len = body.trim().length;
  const valid = len >= GRAPEVINE_REPLY_MIN && len <= GRAPEVINE_REPLY_MAX;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!myProfileId) return;
    if (!valid) {
      setError(
        `replies are between ${GRAPEVINE_REPLY_MIN} and ${GRAPEVINE_REPLY_MAX} characters.`,
      );
      return;
    }
    const used = countRecent(myProfileId);
    if (used >= GRAPEVINE_DAILY_REPLY_LIMIT) {
      setError(
        `you've replied ${used} times in the last 24 hours — the limit is ${GRAPEVINE_DAILY_REPLY_LIMIT}. try again tomorrow.`,
      );
      return;
    }
    addReply({ thread_id: threadId, author_id: myProfileId, body });
    setBody("");
  };

  if (!myProfileId) {
    return (
      <p className="rounded-xl border border-dashed border-gold/25 bg-ivory-warm/30 px-5 py-6 text-center text-[13px] text-ink-muted">
        set up your community profile to reply anonymously to this thread.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-gold/15 bg-white p-4"
    >
      <div className="flex items-center gap-2">
        {identity && <AnonymousAvatar color={identity.color} size={26} />}
        <p className="text-[12px] text-ink-muted">
          your reply will be anonymous. you'll appear as{" "}
          <span
            className="font-serif italic text-ink"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {identity?.name}
          </span>{" "}
          in this thread.
        </p>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={GRAPEVINE_REPLY_MAX}
        placeholder="add to the conversation — share your experience, ask a follow-up, or back another bride up."
        className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-[1.6] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
      />
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "font-mono text-[10.5px]",
            valid || len === 0 ? "text-ink-faint" : "text-henna",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {len}/{GRAPEVINE_REPLY_MAX}
          {len > 0 && len < GRAPEVINE_REPLY_MIN
            ? ` · min ${GRAPEVINE_REPLY_MIN}`
            : ""}
        </p>
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          post reply
          <Send size={12} strokeWidth={1.8} />
        </button>
      </div>
      {error && (
        <p className="rounded-md border border-henna/30 bg-henna/5 px-3 py-2 text-[12px] text-ink">
          {error}
        </p>
      )}
      <GrapevinePrivacyCallout variant="reply" />
    </form>
  );
}
