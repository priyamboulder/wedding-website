"use client";

// ── PresenceIndicator ─────────────────────────────────────────────────────
// Compact line at the top-right of each Music page: "Priya 2h · Arjun
// 5h · DJ Pranav replied yesterday." Reinforces that the workspace is
// shared. Freshest party first; capped so the line stays one row.

import { cn } from "@/lib/utils";
import type {
  MusicParty,
  MusicPartyId,
  MusicPresenceSignal,
} from "@/types/music";
import { resolveMusicParty } from "@/lib/music/parties";

const TONE_DOT: Record<MusicParty["tone"], string> = {
  rose: "bg-rose",
  sage: "bg-sage",
  ink: "bg-ink",
  gold: "bg-gold",
};

export interface PresenceIndicatorProps {
  signals: MusicPresenceSignal[];
  partyMap: Record<MusicPartyId, MusicParty>;
  limit?: number;
  className?: string;
}

export function PresenceIndicator({
  signals,
  partyMap,
  limit = 5,
  className,
}: PresenceIndicatorProps) {
  const sorted = [...signals]
    .sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at))
    .slice(0, limit);

  if (sorted.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label="Recent workspace presence"
    >
      {sorted.map((s, idx) => {
        const party = partyMap[s.party_id] ?? resolveMusicParty(s.party_id);
        const isLive = Date.now() - new Date(s.last_seen_at).getTime() < 60_000;
        return (
          <li key={s.party_id} className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex items-center">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  TONE_DOT[party.tone],
                )}
              />
              {isLive && (
                <span className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full bg-sage/50" />
              )}
            </span>
            <span className="text-ink">{party.display_name}</span>
            <span>
              {s.last_action ? `${s.last_action} ` : ""}
              {isLive ? "now" : relPresence(s.last_seen_at)}
            </span>
            {idx < sorted.length - 1 && <span className="text-ink-faint/50">·</span>}
          </li>
        );
      })}
    </ul>
  );
}

function relPresence(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const diffMin = Math.round((Date.now() - then) / 60000);
    if (diffMin < 60) return `${Math.max(1, diffMin)}m`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.round(diffHr / 24);
    if (diffDay === 1) return "yesterday";
    if (diffDay < 7) return `${diffDay}d`;
    const diffWk = Math.round(diffDay / 7);
    return `${diffWk}w`;
  } catch {
    return iso;
  }
}
