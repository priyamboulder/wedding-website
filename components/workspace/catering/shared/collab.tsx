"use client";

// ── Catering collaboration primitives ─────────────────────────────────────
// Shared building blocks the six surfaces reuse: avatars, state pills,
// reaction bar, comment thread, in-flight strip, presence indicator,
// section header (a tighter replacement for the previous Fraunces-heavy
// headers). Density-first — line heights tight, Fraunces reserved for
// page H1 only.

import { useState, type ReactNode } from "react";
import {
  Check,
  CircleDashed,
  Clock,
  GitBranch,
  HelpCircle,
  Lock,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Comment,
  EntityState,
  Party,
  PartyId,
  Reaction,
  ReactionEntityKind,
  ReactionKind,
  PresenceSignal,
} from "@/types/catering";
import { resolveParty } from "@/lib/catering/parties";

// ── State pill ────────────────────────────────────────────────────────────
// Consistent colored pill for every EntityState across the six tabs.

const STATE_STYLE: Record<
  EntityState,
  { label: string; className: string; icon: ReactNode }
> = {
  draft: {
    label: "Draft",
    className: "bg-ink-faint/10 text-ink-muted border-ink-faint/20",
    icon: <CircleDashed size={9} strokeWidth={2} />,
  },
  in_debate: {
    label: "In debate",
    className: "bg-rose-pale/40 text-rose border-rose/30",
    icon: <GitBranch size={9} strokeWidth={2} />,
  },
  vendor_proposed: {
    label: "Vendor suggested",
    className: "bg-sage-pale/50 text-ink border-sage/30",
    icon: <Clock size={9} strokeWidth={2} />,
  },
  approved: {
    label: "Approved",
    className: "bg-sage-pale/30 text-ink-muted border-sage/25",
    icon: <Check size={9} strokeWidth={2} />,
  },
  parked: {
    label: "Parked",
    className: "bg-ivory-warm text-ink-faint border-border",
    icon: <Lock size={9} strokeWidth={2} />,
  },
  blocked: {
    label: "Blocked",
    className: "bg-rose-pale/30 text-rose border-rose/30",
    icon: <X size={9} strokeWidth={2} />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-ink-faint/10 text-ink-faint line-through border-ink-faint/20",
    icon: <X size={9} strokeWidth={2} />,
  },
};

export function StatePill({
  state,
  tight,
}: {
  state: EntityState;
  tight?: boolean;
}) {
  const s = STATE_STYLE[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border font-mono uppercase tracking-[0.08em]",
        tight ? "px-1 py-px text-[8.5px]" : "px-1.5 py-0.5 text-[9px]",
        s.className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ── Party avatar + cluster ────────────────────────────────────────────────

const PARTY_TONE: Record<Party["tone"], string> = {
  saffron: "bg-saffron-pale text-saffron ring-saffron/30",
  rose: "bg-rose-pale/70 text-rose ring-rose/30",
  sage: "bg-sage-pale/70 text-sage ring-sage/30",
  ink: "bg-ink text-ivory ring-ink/40",
};

export function PartyAvatar({
  party,
  size = "md",
  title,
}: {
  party: Party;
  size?: "sm" | "md" | "lg";
  title?: string;
}) {
  const dims =
    size === "sm"
      ? "h-4 w-4 text-[8px]"
      : size === "lg"
        ? "h-7 w-7 text-[10px]"
        : "h-5 w-5 text-[9px]";
  return (
    <span
      title={title ?? `${party.display_name} (${party.role})`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-mono font-medium uppercase ring-1",
        dims,
        PARTY_TONE[party.tone],
      )}
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label={party.display_name}
    >
      {party.initials}
    </span>
  );
}

export function PartyAvatars({
  partyIds,
  partyMap,
  size = "sm",
  max = 3,
}: {
  partyIds: PartyId[];
  partyMap: Record<PartyId, Party>;
  size?: "sm" | "md";
  max?: number;
}) {
  const unique = Array.from(new Set(partyIds));
  const shown = unique.slice(0, max);
  const overflow = unique.length - shown.length;
  return (
    <span className="inline-flex items-center -space-x-1">
      {shown.map((id) => {
        const party = partyMap[id] ?? resolveParty(id, {});
        return <PartyAvatar key={id} party={party} size={size} />;
      })}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-ivory-warm font-mono text-ink-muted ring-1 ring-border",
            size === "sm" ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[9px]",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

// Inline "who added this" attribution. Used on dish cards, proposal
// cards, staff slots, etc. Reads as a tiny line, not a badge.
export function Attribution({
  partyId,
  partyMap,
  verb = "added by",
}: {
  partyId: PartyId;
  partyMap: Record<PartyId, Party>;
  verb?: string;
}) {
  const party = partyMap[partyId] ?? resolveParty(partyId, {});
  return (
    <span
      className="inline-flex items-center gap-1 text-[10.5px] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <PartyAvatar party={party} size="sm" />
      <span>
        {verb} {party.display_name}
      </span>
    </span>
  );
}

// ── Reaction bar ──────────────────────────────────────────────────────────
// Inline 👍/👎/❓ with counts and whose reactions, clickable to toggle for
// the current party. The current party is passed in — no session state in
// the primitive.

const KIND_ICON: Record<ReactionKind, ReactNode> = {
  up: <ThumbsUp size={10} strokeWidth={1.8} />,
  down: <ThumbsDown size={10} strokeWidth={1.8} />,
  question: <HelpCircle size={10} strokeWidth={1.8} />,
};

const KIND_LABEL: Record<ReactionKind, string> = {
  up: "Thumb up",
  down: "Thumb down",
  question: "Question",
};

export function ReactionBar({
  reactions,
  partyMap,
  currentPartyId,
  onToggle,
  compact,
}: {
  reactions: Reaction[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onToggle: (kind: ReactionKind) => void;
  compact?: boolean;
}) {
  const byKind: Record<ReactionKind, Reaction[]> = {
    up: reactions.filter((r) => r.kind === "up"),
    down: reactions.filter((r) => r.kind === "down"),
    question: reactions.filter((r) => r.kind === "question"),
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(["up", "down", "question"] as ReactionKind[]).map((k) => {
        const list = byKind[k];
        const mine = list.some((r) => r.party_id === currentPartyId);
        return (
          <button
            key={k}
            type="button"
            onClick={() => onToggle(k)}
            aria-pressed={mine}
            aria-label={KIND_LABEL[k]}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 transition-colors",
              mine
                ? k === "up"
                  ? "border-sage/50 bg-sage-pale/40 text-ink"
                  : k === "down"
                    ? "border-rose/50 bg-rose-pale/40 text-rose"
                    : "border-saffron/50 bg-saffron-pale/40 text-saffron"
                : "border-border bg-white text-ink-faint hover:border-saffron/40 hover:text-ink",
              compact ? "text-[9.5px]" : "text-[10px]",
            )}
          >
            <span>{KIND_ICON[k]}</span>
            {list.length > 0 && (
              <span
                className="font-mono tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {list.length}
              </span>
            )}
            {list.length > 0 && (
              <PartyAvatars
                partyIds={list.map((r) => r.party_id)}
                partyMap={partyMap}
                size="sm"
                max={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Optional reaction summary when compact — shows each party's reaction
// inline as dots. Useful on dense list views where the full bar is too
// heavy.
export function ReactionDots({
  reactions,
  partyMap,
}: {
  reactions: Reaction[];
  partyMap: Record<PartyId, Party>;
}) {
  if (reactions.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1">
      {reactions.map((r) => {
        const party = partyMap[r.party_id] ?? resolveParty(r.party_id, {});
        const tone =
          r.kind === "up"
            ? "text-sage"
            : r.kind === "down"
              ? "text-rose"
              : "text-saffron";
        return (
          <span
            key={r.id}
            title={`${party.display_name}: ${r.kind}${r.comment ? ` — ${r.comment}` : ""}`}
            className={cn("inline-flex items-center gap-0.5", tone)}
          >
            {KIND_ICON[r.kind]}
            <PartyAvatar party={party} size="sm" />
          </span>
        );
      })}
    </span>
  );
}

// ── Comment thread ────────────────────────────────────────────────────────

export function CommentThread({
  comments,
  partyMap,
  currentPartyId,
  onPost,
  placeholder = "Add a comment…",
  compact,
}: {
  comments: Comment[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onPost: (body: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function post() {
    const body = draft.trim();
    if (!body) return;
    onPost(body);
    setDraft("");
  }

  return (
    <div className={cn("space-y-1.5", compact ? "" : "")}>
      {comments.length > 0 && (
        <ol className="space-y-1.5">
          {comments.map((c) => {
            const party = partyMap[c.party_id] ?? resolveParty(c.party_id, {});
            return (
              <li key={c.id} className="flex items-start gap-2">
                <PartyAvatar party={party} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] leading-snug text-ink">
                    <span className="font-medium">{party.display_name}</span>{" "}
                    <span className="text-ink-muted">{c.body}</span>
                  </p>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {relTime(c.created_at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className="flex items-center gap-2">
        <PartyAvatar
          party={partyMap[currentPartyId] ?? resolveParty(currentPartyId, {})}
          size="sm"
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              post();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink outline-none placeholder:text-ink-faint focus:border-saffron/40"
        />
      </div>
    </div>
  );
}

// ── In-flight strip ───────────────────────────────────────────────────────
// "What's moving right now" — horizontal scroll of compact cards near the
// top of each tab. Each card is clickable.

export interface FlowItem {
  id: string;
  label: string;
  hint?: string;
  state: EntityState;
  waiting_on?: PartyId;
  onClick?: () => void;
}

export function InFlightStrip({
  items,
  partyMap,
  emptyMessage = "Nothing in flight — everything is either approved or parked.",
}: {
  items: FlowItem[];
  partyMap: Record<PartyId, Party>;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-2 text-[11.5px] text-ink-muted">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          disabled={!item.onClick}
          className={cn(
            "flex min-w-[220px] max-w-[280px] flex-col gap-1 rounded-md border bg-white px-3 py-2 text-left transition-colors",
            item.onClick
              ? "border-border hover:border-saffron/40"
              : "cursor-default border-border",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <StatePill state={item.state} tight />
            {item.waiting_on && (
              <span className="inline-flex items-center gap-1 text-[9.5px] text-ink-faint">
                <span
                  className="font-mono uppercase tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  waiting on
                </span>
                <PartyAvatar
                  party={
                    partyMap[item.waiting_on] ?? resolveParty(item.waiting_on, {})
                  }
                  size="sm"
                />
              </span>
            )}
          </div>
          <p className="text-[12px] leading-snug text-ink">{item.label}</p>
          {item.hint && (
            <p className="text-[10.5px] leading-snug text-ink-muted">{item.hint}</p>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Presence indicator ────────────────────────────────────────────────────
// Top-right strip on each tab: "Priya 2h ago · Arjun 1d · Foodlink 4h".
// Keeps the workspace feeling actively shared.

export function PresenceIndicator({
  signals,
  partyMap,
  limit = 5,
}: {
  signals: PresenceSignal[];
  partyMap: Record<PartyId, Party>;
  limit?: number;
}) {
  const sorted = [...signals]
    .sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at))
    .slice(0, limit);
  if (sorted.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-3">
      {sorted.map((s) => {
        const party = partyMap[s.party_id] ?? resolveParty(s.party_id, {});
        const isNow = Date.now() - new Date(s.last_seen_at).getTime() < 60_000;
        return (
          <li
            key={s.party_id}
            className="inline-flex items-center gap-1.5"
            title={s.last_action ?? ""}
          >
            <span className="relative">
              <PartyAvatar party={party} size="sm" />
              {isNow && (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-sage ring-1 ring-white" />
              )}
            </span>
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {party.display_name} · {isNow ? "now" : relTime(s.last_seen_at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Tab header (shared) ──────────────────────────────────────────────────
// Fraunces H1, sans-medium H2 subsections. Used once per tab.

export function TabHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gold/15 bg-ivory-warm/20 px-7 py-4">
      <div className="min-w-0 flex-1">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
        <h1 className="mt-0.5 font-serif text-[22px] leading-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex-none">{right}</div>}
    </header>
  );
}

// Sans-medium subsection header — denser than the previous Fraunces one.
export function SubHeader({
  icon,
  label,
  count,
  right,
}: {
  icon?: ReactNode;
  label: string;
  count?: number;
  right?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-ink-faint">{icon}</span>}
        <h2 className="text-[13px] font-medium text-ink">{label}</h2>
        {count != null && (
          <span
            className="font-mono text-[10px] tabular-nums text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {count}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffMin = Math.round((now - then) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.round(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return iso;
  }
}

// ── "Waiting on" badge ────────────────────────────────────────────────────
// Reusable pill that says who an item is waiting on. Used in the Command
// waiting-on sections and inline on cards that block on a reply.
export function WaitingOnBadge({
  partyId,
  partyMap,
  verb = "waiting on",
  days,
}: {
  partyId: PartyId;
  partyMap: Record<PartyId, Party>;
  verb?: string;
  days?: number;
}) {
  const party = partyMap[partyId] ?? resolveParty(partyId, {});
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-saffron/30 bg-saffron-pale/30 px-1.5 py-0.5 text-[10px]">
      <span
        className="font-mono uppercase tracking-[0.1em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {verb}
      </span>
      <PartyAvatar party={party} size="sm" />
      <span className="text-ink">{party.display_name}</span>
      {days != null && (
        <span
          className="font-mono text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          · {days}d
        </span>
      )}
    </span>
  );
}
