"use client";

// ── AttributionChip ───────────────────────────────────────────────────────
// Inline "who added / owns / last-edited this" chip used across every
// Music tab. Shows 1–3 initials for internal parties (P / A / U) with
// their party tone. Vendors render as a gold chip carrying the full
// display name ("DJ Pranav") rather than initials, so the chip always
// reads as external without requiring the caller to label it.

import { cn } from "@/lib/utils";
import type { MusicParty, MusicPartyId } from "@/types/music";
import { resolveMusicParty } from "@/lib/music/parties";

const TONE_CHIP: Record<MusicParty["tone"], string> = {
  rose: "bg-rose-pale/70 text-rose ring-rose/30",
  sage: "bg-sage-pale/70 text-ink ring-sage/40",
  ink: "bg-ink text-ivory ring-ink/40",
  gold: "bg-gold-pale/80 text-ink ring-gold/40",
};

type Verb = "added by" | "owned by" | "last edited" | null;

export interface AttributionChipProps {
  // 1–3 ids. Extra ids collapse into a "+N" overflow marker.
  partyIds: MusicPartyId[];
  // Party lookup — caller builds this via buildMusicPartyMap().
  partyMap: Record<MusicPartyId, MusicParty>;
  // Hover tooltip shows full name + this timestamp if provided.
  timestamp?: string | null;
  // Optional leading verb rendered in small-caps mono before the chips.
  verb?: Verb;
  size?: "sm" | "md";
  className?: string;
  max?: number;
}

export function AttributionChip({
  partyIds,
  partyMap,
  timestamp = null,
  verb = null,
  size = "sm",
  className,
  max = 3,
}: AttributionChipProps) {
  const unique = Array.from(new Set(partyIds));
  const shown = unique.slice(0, max);
  const overflow = unique.length - shown.length;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {verb && (
        <span
          className={cn(
            "font-mono uppercase tracking-[0.12em] text-ink-faint",
            size === "sm" ? "text-[9px]" : "text-[10px]",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {verb}
        </span>
      )}
      <span className="inline-flex items-center -space-x-1">
        {shown.map((id) => {
          const party = partyMap[id] ?? resolveMusicParty(id);
          return <PartyPip key={id} party={party} size={size} timestamp={timestamp} />;
        })}
        {overflow > 0 && (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-ivory-warm font-mono text-ink-muted ring-1 ring-border",
              size === "sm" ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[9px]",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
            aria-label={`${overflow} more`}
          >
            +{overflow}
          </span>
        )}
      </span>
    </span>
  );
}

// ── Internal ─────────────────────────────────────────────────────────────
// Vendors render as a named chip; internal parties render as an initial
// circle. Both use the same TONE_CHIP classes.

function PartyPip({
  party,
  size,
  timestamp,
}: {
  party: MusicParty;
  size: "sm" | "md";
  timestamp: string | null;
}) {
  const tooltip =
    timestamp != null
      ? `${party.display_name} · ${formatTimestamp(timestamp)}`
      : party.display_name;

  if (party.role === "vendor") {
    return (
      <span
        title={tooltip}
        aria-label={party.display_name}
        className={cn(
          "inline-flex items-center rounded-full font-mono font-medium ring-1",
          size === "sm"
            ? "px-1.5 py-[1px] text-[9px]"
            : "px-2 py-[2px] text-[10px]",
          TONE_CHIP[party.tone],
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {party.display_name}
      </span>
    );
  }

  return (
    <span
      title={tooltip}
      aria-label={party.display_name}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-mono font-medium uppercase ring-1",
        size === "sm" ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]",
        TONE_CHIP[party.tone],
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {party.initials}
    </span>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
