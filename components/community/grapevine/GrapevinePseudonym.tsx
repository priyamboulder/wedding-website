"use client";

// ── Grapevine pseudonym ─────────────────────────────────────────────────────
// Avatar circle + italic pseudonym name + optional OP / "this is you" badges.
// Reuses the existing community anonymous identity helper so the same word
// lists / hashing logic powers Discussions and the Grapevine.

import { cn } from "@/lib/utils";
import { AnonymousAvatar } from "@/components/community/AnonymousAvatar";
import { getAnonymousIdentity } from "@/lib/community/anonymous";

export function useGrapevineIdentity(authorId: string, threadId: string) {
  return getAnonymousIdentity(authorId, threadId);
}

export function GrapevinePseudonym({
  authorId,
  threadId,
  currentUserId,
  isOP,
  size = 26,
  showYouLabel = true,
  className,
}: {
  authorId: string;
  threadId: string;
  currentUserId?: string;
  isOP?: boolean;
  size?: number;
  showYouLabel?: boolean;
  className?: string;
}) {
  const identity = getAnonymousIdentity(authorId, threadId);
  const isYou = !!currentUserId && currentUserId === authorId;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <AnonymousAvatar color={identity.color} size={size} />
      <span className="inline-flex items-center gap-1.5">
        <span
          className="font-serif text-[13px] italic text-ink"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {identity.name}
        </span>
        {isOP && (
          <span
            className="inline-flex items-center rounded-full border border-saffron/40 bg-saffron/10 px-1.5 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
            aria-label="Original poster"
          >
            OP
          </span>
        )}
        {isYou && showYouLabel && (
          <span className="text-[10.5px] italic text-ink-faint">
            (this is you)
          </span>
        )}
      </span>
    </span>
  );
}
