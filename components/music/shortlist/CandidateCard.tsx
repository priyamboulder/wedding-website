"use client";

// ── CandidateCard ─────────────────────────────────────────────────────────
// One music candidate on the Shortlist & Contract board. Composes the
// shared primitives so the card reads as the same working-desk surface
// every tab will eventually use.

import { useMemo, useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Square,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AttributionChip,
  CommentThread,
  ReactionCluster,
  ReferenceEmbed,
  StatePill,
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
} from "@/components/music/primitives";
import type {
  MusicCandidate,
  MusicCandidateLean,
  MusicComment,
  MusicEventId,
  MusicParty,
  MusicPartyId,
  MusicReaction,
} from "@/types/music";
import { MUSIC_EVENTS } from "@/types/music";
import {
  candidateEntityState,
  candidateStatusLabel,
  useMusicStore,
} from "@/stores/music-store";
import { resolveMusicParty } from "@/lib/music/parties";
import { ContractInline } from "./ContractInline";

const INTERNAL_ORDER: MusicPartyId[] = [PRIYA_ID, ARJUN_ID, URVASHI_ID];

export interface CandidateCardProps {
  candidate: MusicCandidate;
  partyMap: Record<MusicPartyId, MusicParty>;
  // Optional compare mode — when provided, the card renders a selection
  // checkbox instead of the normal leading decorations.
  compareMode?: {
    selected: boolean;
    onToggle: () => void;
    disabled?: boolean;
  };
  // Dense variant for the In debate / Passed / Booked sections.
  dense?: boolean;
  className?: string;
}

export function CandidateCard({
  candidate,
  partyMap,
  compareMode,
  dense,
  className,
}: CandidateCardProps) {
  // Select the raw arrays (stable references) and filter via useMemo —
  // returning a fresh `.filter()` directly from the selector breaks
  // Zustand's getSnapshot equality and triggers an infinite render loop.
  const allLeans = useMusicStore((s) => s.leans);
  const allComments = useMusicStore((s) => s.comments);
  const allContracts = useMusicStore((s) => s.contracts);
  const leans = useMemo(
    () => allLeans.filter((l) => l.candidate_id === candidate.id),
    [allLeans, candidate.id],
  );
  const comments = useMemo(
    () => allComments.filter((c) => c.entity_id === candidate.id),
    [allComments, candidate.id],
  );
  const contract = useMemo(
    () => allContracts.find((c) => c.candidate_id === candidate.id),
    [allContracts, candidate.id],
  );
  const currentPartyId = useMusicStore((s) => s.current_party_id);
  const setLean = useMusicStore((s) => s.setLean);
  const addComment = useMusicStore((s) => s.addComment);
  const setCandidateStatus = useMusicStore((s) => s.setCandidateStatus);
  const setPassedReason = useMusicStore((s) => s.setPassedReason);
  const setPendingAction = useMusicStore((s) => s.setPendingAction);
  const deleteCandidate = useMusicStore((s) => s.deleteCandidate);

  const reactions = useMemo(
    () => leansToReactions(leans, candidate.id),
    [leans, candidate.id],
  );

  const [commentsOpen, setCommentsOpen] = useState(false);

  const isResolvedPipeline =
    candidate.status === "booked" ||
    candidate.status === "contract_sent" ||
    candidate.status === "signed";

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border bg-white p-4 transition-colors",
        compareMode?.selected
          ? "border-gold ring-1 ring-gold/40"
          : "border-border hover:border-gold/30",
        dense && "p-3 gap-2",
        className,
      )}
    >
      {compareMode && (
        <button
          type="button"
          onClick={compareMode.onToggle}
          disabled={compareMode.disabled}
          className={cn(
            "absolute left-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-ink-muted transition-colors",
            compareMode.selected && "text-gold",
            compareMode.disabled && "cursor-not-allowed opacity-40",
          )}
          aria-label={compareMode.selected ? "Remove from compare" : "Add to compare"}
        >
          {compareMode.selected ? (
            <CheckSquare size={16} strokeWidth={1.8} />
          ) : (
            <Square size={16} strokeWidth={1.8} />
          )}
        </button>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className={cn("flex flex-wrap items-start gap-2", compareMode && "pl-6")}>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14.5px] font-medium leading-tight text-ink">
            {candidate.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-ink-muted">
            {candidate.descriptor}
          </p>
        </div>
        <StatePill
          state={candidateEntityState(candidate.status)}
          labelOverride={candidateStatusLabel(candidate.status)}
          size={dense ? "sm" : "md"}
        />
      </header>

      {/* ── Rate + events tags ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <RateBadge
          low={candidate.rate_low}
          high={candidate.rate_high}
          currency={candidate.currency}
        />
        <span className="flex flex-wrap gap-1">
          {candidate.events.map((ev) => (
            <EventChip key={ev} event={ev} />
          ))}
        </span>
      </div>

      {/* ── Samples ─────────────────────────────────────────────────── */}
      {!dense && candidate.sample_urls.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {candidate.sample_urls.slice(0, 3).map((url) => (
            <ReferenceEmbed key={url} url={url} variant="card" />
          ))}
        </div>
      )}
      {dense && candidate.sample_urls.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidate.sample_urls.slice(0, 3).map((url) => (
            <ReferenceEmbed key={url} url={url} variant="inline" />
          ))}
        </div>
      )}

      {/* ── Leanings + attribution ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 bg-ivory-warm/30 px-2.5 py-2">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Leaning
          </span>
          <ReactionCluster
            reactions={reactions}
            partyMap={partyMap}
            currentPartyId={currentPartyId}
            partyOrder={INTERNAL_ORDER}
            onCycle={(next) => setLean(candidate.id, currentPartyId, next)}
            onShowDetail={(partyId, r) => {
              const party = partyMap[partyId] ?? resolveMusicParty(partyId);
              if (r?.note) {
                alert(`${party.display_name} — ${r.kind}\n\n${r.note}`);
              }
            }}
            size="sm"
          />
        </div>
        <AttributionChip
          partyIds={[candidate.suggested_by]}
          partyMap={partyMap}
          timestamp={candidate.created_at}
          verb="added by"
          size="sm"
        />
      </div>

      {/* ── Pending action ──────────────────────────────────────────── */}
      {candidate.pending_action && (
        <div
          className="flex items-start gap-2 rounded-md border border-saffron/25 bg-saffron-pale/25 px-2.5 py-2 text-[12px] text-ink"
        >
          <AttributionChip
            partyIds={[candidate.pending_action.owner]}
            partyMap={partyMap}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] leading-snug text-ink">
              {candidate.pending_action.description}
            </p>
            {candidate.pending_action.due_at && (
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Due {candidate.pending_action.due_at}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPendingAction(candidate.id, undefined)}
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
            title="Clear pending action"
          >
            clear
          </button>
        </div>
      )}

      {/* ── Passed / Parked reason ──────────────────────────────────── */}
      {(candidate.status === "passed" || candidate.status === "parked") &&
        candidate.passed_reason && (
          <p className="rounded-md border border-border/60 bg-ivory-warm/40 px-2.5 py-2 text-[11.5px] leading-snug text-ink-muted">
            <span
              className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Reason
            </span>
            {candidate.passed_reason}
          </p>
        )}

      {/* ── Inline contract block ───────────────────────────────────── */}
      {isResolvedPipeline && (
        <ContractInline candidate={candidate} contract={contract} dense={dense} />
      )}

      {/* ── Footer: comments toggle + actions ───────────────────────── */}
      <footer className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setCommentsOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <MessageSquare size={11} strokeWidth={1.8} />
          comments
          {comments.length > 0 && (
            <span className="tabular-nums">{comments.length}</span>
          )}
          {commentsOpen ? (
            <ChevronUp size={10} strokeWidth={1.8} />
          ) : (
            <ChevronDown size={10} strokeWidth={1.8} />
          )}
        </button>

        <div
          className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {candidate.status !== "passed" && candidate.status !== "parked" && (
            <button
              type="button"
              onClick={() => {
                const reason = prompt("Why are we passing on this one?");
                if (reason) {
                  setPassedReason(candidate.id, reason);
                  setCandidateStatus(candidate.id, "passed");
                }
              }}
              className="hover:text-rose"
            >
              pass
            </button>
          )}
          {candidate.status === "passed" && (
            <button
              type="button"
              onClick={() => setCandidateStatus(candidate.id, "draft")}
              className="hover:text-ink"
            >
              reinstate
            </button>
          )}
          {!isResolvedPipeline && (
            <button
              type="button"
              onClick={() => setCandidateStatus(candidate.id, "booked")}
              className="hover:text-sage"
            >
              book
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remove ${candidate.name}?`)) {
                deleteCandidate(candidate.id);
              }
            }}
            className="inline-flex items-center hover:text-rose"
            aria-label="Delete candidate"
          >
            <Trash2 size={11} strokeWidth={1.8} />
          </button>
        </div>
      </footer>

      {commentsOpen && (
        <div className="rounded-md border border-border/60 bg-ivory-warm/30 p-3">
          <CommentThread
            comments={comments as MusicComment[]}
            partyMap={partyMap}
            currentPartyId={currentPartyId}
            onPost={(body, parentId, refUrl) =>
              addComment("candidate", candidate.id, currentPartyId, body, {
                parent_id: parentId,
                reference_url: refUrl,
              })
            }
            placeholder="Add thoughts, ask a question, drop a sample link…"
            emptyMessage="No discussion yet — start the thread."
            mentionablePartyIds={INTERNAL_ORDER}
          />
        </div>
      )}
    </article>
  );
}

// ── Small subcomponents ──────────────────────────────────────────────────

function RateBadge({
  low,
  high,
  currency,
}: {
  low?: number;
  high?: number;
  currency: "INR";
}) {
  if (low == null && high == null) {
    return (
      <span
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Rate: not quoted
      </span>
    );
  }
  const fmt = (n?: number) => {
    if (n == null) return "—";
    if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  };
  const range =
    low != null && high != null && low !== high
      ? `${fmt(low)}–${fmt(high)}`
      : fmt(low ?? high);
  const symbol = currency === "INR" ? "₹" : currency;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-ink"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className="text-ink-faint">Rate</span>
      <span>
        {symbol}
        {range}
      </span>
    </span>
  );
}

function EventChip({ event }: { event: MusicEventId }) {
  const label = MUSIC_EVENTS.find((e) => e.id === event)?.label ?? event;
  return (
    <span
      className="inline-flex items-center rounded-full border border-border bg-white px-2 py-0.5 text-[10.5px] text-ink-muted"
    >
      {label}
    </span>
  );
}

// ── Lean → Reaction shape adapter ────────────────────────────────────────
// ReactionCluster reads MusicReaction[], but leans are stored in the
// candidate-specific leans table. The two shapes share vocabulary so
// this is a zero-cost view, not a real transform.
function leansToReactions(
  leans: MusicCandidateLean[],
  candidate_id: string,
): MusicReaction[] {
  return leans.map((l) => ({
    id: l.id,
    entity_id: candidate_id,
    entity_kind: "candidate",
    party_id: l.party_id,
    kind: l.lean,
    note: l.note,
    updated_at: l.updated_at,
  }));
}
