"use client";

// ── ReactionCluster ───────────────────────────────────────────────────────
// Per-item reaction row for the three internal parties (Priya, Arjun,
// Urvashi). Each party always renders a chip carrying their initial and
// their current reaction icon — "idle" (💤) is the default, so a party
// who hasn't weighed in is still visible at a glance.
//
// Interaction model (per the spec):
//   • Click your OWN chip → cycles your reaction: love → yes → unsure →
//     no → idle → love.
//   • Click someone ELSE'S chip → fires onShowDetail so the tab can open
//     a small popover with their reaction + note.

import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  MusicParty,
  MusicPartyId,
  MusicReaction,
  MusicReactionKind,
} from "@/types/music";
import { MUSIC_REACTION_ORDER } from "@/types/music";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  resolveMusicParty,
} from "@/lib/music/parties";

// ── Reaction glyph + tone ────────────────────────────────────────────────
// Using emoji keeps the cluster emotionally legible without extra icon
// weight. Tone colors the ring/background so you can scan a stack of
// items for "lots of red / no love" vibes at once.

const REACTION_ICON: Record<MusicReactionKind, string> = {
  love: "❤️",
  yes: "👍",
  unsure: "🤔",
  no: "👎",
  idle: "💤",
};

const REACTION_LABEL: Record<MusicReactionKind, string> = {
  love: "love",
  yes: "yes",
  unsure: "unsure",
  no: "no",
  idle: "haven't looked",
};

const REACTION_TONE: Record<MusicReactionKind, string> = {
  love: "ring-rose/60 bg-rose-pale/60",
  yes: "ring-sage/60 bg-sage-pale/60",
  unsure: "ring-saffron/60 bg-saffron-pale/60",
  no: "ring-rose/60 bg-rose-pale/30",
  idle: "ring-border bg-ivory-warm/70",
};

const PARTY_INK: Record<MusicParty["tone"], string> = {
  rose: "text-rose",
  sage: "text-ink",
  ink: "text-ink",
  gold: "text-ink",
};

// ── Default internal-party order (Priya · Arjun · Urvashi) ──────────────
export const DEFAULT_CLUSTER_ORDER: MusicPartyId[] = [
  PRIYA_ID,
  ARJUN_ID,
  URVASHI_ID,
];

export interface ReactionClusterProps {
  // Current reactions on this item. At most one per party; the cluster
  // uses the latest by updated_at if duplicates exist.
  reactions: MusicReaction[];
  partyMap: Record<MusicPartyId, MusicParty>;
  currentPartyId: MusicPartyId;
  // Which parties to show chips for. Defaults to Priya/Arjun/Urvashi.
  partyOrder?: MusicPartyId[];
  // Fires with the NEXT kind for the clicked party. The cycling party
  // is always `currentPartyId` — clicks on other parties go through
  // onShowDetail instead.
  onCycle: (nextKind: MusicReactionKind) => void;
  // Click on a party that isn't the current user. Caller opens a small
  // popover with the reaction + any note they left.
  onShowDetail?: (partyId: MusicPartyId, reaction: MusicReaction | null) => void;
  size?: "sm" | "md";
  className?: string;
}

export function ReactionCluster({
  reactions,
  partyMap,
  currentPartyId,
  partyOrder = DEFAULT_CLUSTER_ORDER,
  onCycle,
  onShowDetail,
  size = "sm",
  className,
}: ReactionClusterProps) {
  // Map party_id → latest reaction. If a party has no reaction, they
  // render as idle (💤).
  const byParty: Record<MusicPartyId, MusicReaction | null> = {};
  for (const id of partyOrder) byParty[id] = null;
  for (const r of reactions) {
    const prev = byParty[r.party_id];
    if (!prev || prev.updated_at.localeCompare(r.updated_at) < 0) {
      byParty[r.party_id] = r;
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {partyOrder.map((id) => {
        const party = partyMap[id] ?? resolveMusicParty(id);
        const reaction = byParty[id];
        const kind: MusicReactionKind = reaction?.kind ?? "idle";
        const isMine = id === currentPartyId;
        return (
          <ReactionChip
            key={id}
            party={party}
            kind={kind}
            note={reaction?.note}
            size={size}
            isMine={isMine}
            onClick={() => {
              if (isMine) {
                onCycle(nextReaction(kind));
                return;
              }
              onShowDetail?.(id, reaction);
            }}
          />
        );
      })}
    </span>
  );
}

// ── Single chip ──────────────────────────────────────────────────────────

function ReactionChip({
  party,
  kind,
  note,
  size,
  isMine,
  onClick,
}: {
  party: MusicParty;
  kind: MusicReactionKind;
  note?: string;
  size: "sm" | "md";
  isMine: boolean;
  onClick: () => void;
}) {
  const tooltip =
    note && kind !== "idle"
      ? `${party.display_name} — ${REACTION_LABEL[kind]} · ${note}`
      : `${party.display_name} — ${REACTION_LABEL[kind]}${
          isMine ? " (click to cycle)" : ""
        }`;

  const dims = size === "sm" ? "h-5 w-5 text-[11px]" : "h-6 w-6 text-[12px]";

  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full ring-1 transition-opacity",
        dims,
        REACTION_TONE[kind],
        isMine ? "hover:opacity-80" : "hover:opacity-90",
      )}
    >
      <span aria-hidden>{REACTION_ICON[kind]}</span>
      <span
        className={cn(
          "absolute -bottom-[1px] -right-[1px] inline-flex h-[10px] w-[10px] items-center justify-center rounded-full bg-white font-mono text-[7px] font-bold uppercase leading-none ring-1 ring-border",
          PARTY_INK[party.tone],
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {party.initials}
      </span>
    </button>
  );
}

// ── Cycling helper (exported for tests / callers) ────────────────────────

export function nextReaction(kind: MusicReactionKind): MusicReactionKind {
  const idx = MUSIC_REACTION_ORDER.indexOf(kind);
  const nextIdx = (idx + 1) % MUSIC_REACTION_ORDER.length;
  return MUSIC_REACTION_ORDER[nextIdx]!;
}

// ── Detail popover (optional; caller can render inline) ─────────────────
// Convenience popover — small, controlled by the caller via state. Not
// coupled to ReactionCluster itself; ship separately so tabs can put it
// wherever fits.

export function ReactionDetail({
  party,
  reaction,
  onClose,
}: {
  party: MusicParty;
  reaction: MusicReaction | null;
  onClose?: () => void;
}) {
  const [hovering, setHovering] = useState(false);
  const kind: MusicReactionKind = reaction?.kind ?? "idle";
  return (
    <div
      className="popover-enter rounded-md border border-border bg-white p-3 text-[12px] shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ minWidth: 200 }}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5">
          <span aria-hidden>{REACTION_ICON[kind]}</span>
          <span className="font-medium text-ink">{party.display_name}</span>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {REACTION_LABEL[kind]}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "text-[11px] text-ink-faint transition-opacity",
              hovering ? "opacity-100" : "opacity-70",
            )}
          >
            close
          </button>
        )}
      </div>
      {reaction?.note && (
        <p className="mt-2 text-[11.5px] leading-snug text-ink-muted">
          {reaction.note}
        </p>
      )}
      {!reaction && (
        <p className="mt-2 text-[11px] italic text-ink-faint">
          hasn't looked yet
        </p>
      )}
    </div>
  );
}

