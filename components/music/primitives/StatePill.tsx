"use client";

// ── StatePill ─────────────────────────────────────────────────────────────
// Shared status pill. One consistent color per MusicEntityState across
// every Music tab. The "waiting" state names the party we're waiting on
// so the pill stays informative inline without a second badge.

import type { ReactNode } from "react";
import {
  Check,
  CircleDashed,
  Clock,
  GitBranch,
  Lock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MusicEntityState,
  MusicParty,
  MusicPartyId,
} from "@/types/music";
import { resolveMusicParty } from "@/lib/music/parties";

// Style per state. Pale background + slightly deeper border + ink text
// keeps the pills legible on the ivory canvas without screaming.
const STATE_STYLE: Record<
  MusicEntityState,
  { label: string; className: string; icon: ReactNode }
> = {
  draft: {
    label: "Draft",
    className: "bg-ivory-deep/60 text-ink-muted border-ink-faint/30",
    icon: <CircleDashed size={9} strokeWidth={2} />,
  },
  waiting: {
    label: "Waiting",
    className: "bg-saffron-pale/70 text-saffron border-saffron/40",
    icon: <Clock size={9} strokeWidth={2} />,
  },
  in_debate: {
    // No palette purple — rose with a GitBranch glyph is our "contested"
    // cue. (A muted-purple variable would be fine later, but we hold
    // the palette line for now.)
    label: "In debate",
    className: "bg-rose-pale/50 text-rose border-rose/40",
    icon: <GitBranch size={9} strokeWidth={2} />,
  },
  resolved: {
    label: "Resolved",
    className: "bg-sage-pale/70 text-ink border-sage/40",
    icon: <Check size={9} strokeWidth={2} />,
  },
  blocked: {
    label: "Blocked",
    className: "bg-rose-pale/70 text-rose border-rose/60",
    icon: <X size={9} strokeWidth={2} />,
  },
  parked: {
    label: "Parked",
    className: "bg-ivory-warm text-ink-faint border-border",
    icon: <Lock size={9} strokeWidth={2} />,
  },
};

export interface StatePillProps {
  state: MusicEntityState;
  // When state === "waiting", names the party we're waiting on. Ignored
  // for every other state. Accepts either a bare id (looked up through
  // partyMap) or a pre-resolved display string.
  waitingOn?: MusicPartyId;
  partyMap?: Record<MusicPartyId, MusicParty>;
  // Override the default label — e.g. "Booked", "Signed" instead of
  // "Resolved" — while keeping the resolved tone.
  labelOverride?: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

export function StatePill({
  state,
  waitingOn,
  partyMap,
  labelOverride,
  size = "md",
  onClick,
  className,
}: StatePillProps) {
  const style = STATE_STYLE[state];
  const waitingLabel =
    state === "waiting" && waitingOn
      ? (partyMap?.[waitingOn] ?? resolveMusicParty(waitingOn)).display_name
      : null;
  const label = labelOverride ?? style.label;
  const display = waitingLabel ? `Waiting · ${waitingLabel}` : label;

  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border font-mono uppercase tracking-[0.08em] transition-opacity",
        size === "sm" ? "px-1 py-[1px] text-[8.5px]" : "px-1.5 py-0.5 text-[9.5px]",
        onClick ? "cursor-pointer hover:opacity-80" : "cursor-default",
        style.className,
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {style.icon}
      <span>{display}</span>
    </Tag>
  );
}
