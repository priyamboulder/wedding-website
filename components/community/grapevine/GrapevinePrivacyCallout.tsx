"use client";

// ── Privacy callout ─────────────────────────────────────────────────────────
// Persistent reassurance shown inside the create-thread + reply forms.
// Tone is warm, not legalistic — the spec calls this out explicitly.

import { Lock } from "lucide-react";

export function GrapevinePrivacyCallout({
  variant = "thread",
}: {
  variant?: "thread" | "reply";
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-gold/15 bg-ivory-warm/40 px-3.5 py-3 text-[12px] leading-[1.55] text-ink-muted">
      <Lock size={13} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gold" />
      <p>
        <span className="font-medium text-ink">your identity is protected.</span>{" "}
        {variant === "thread"
          ? "this post will appear under a random pseudonym. only the ananya moderation team can see who posted, and only if content is flagged for review."
          : "your reply appears under your pseudonym for this thread. only ananya moderators can see your real identity."}
      </p>
    </div>
  );
}
