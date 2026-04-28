"use client";

// ── CompareModal ─────────────────────────────────────────────────────────
// Side-by-side view of 2–3 candidates. Rows align facets across columns:
// samples, rate, events, per-party leanings, pending action, contract
// state (if booked). A modal rather than a new page because the spec is
// explicit that compare is an interaction within the board, not a
// separate surface.

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  ReferenceEmbed,
  StatePill,
} from "@/components/music/primitives";
import type {
  MusicCandidate,
  MusicCandidateLean,
  MusicParty,
  MusicPartyId,
  MusicReactionKind,
} from "@/types/music";
import { MUSIC_EVENTS } from "@/types/music";
import {
  candidateEntityState,
  candidateStatusLabel,
  useMusicStore,
} from "@/stores/music-store";
import { resolveMusicParty } from "@/lib/music/parties";

const INTERNAL_ORDER: MusicPartyId[] = [PRIYA_ID, ARJUN_ID, URVASHI_ID];

const LEAN_GLYPH: Record<MusicReactionKind, string> = {
  love: "❤️",
  yes: "👍",
  unsure: "🤔",
  no: "👎",
  idle: "💤",
};

const LEAN_LABEL: Record<MusicReactionKind, string> = {
  love: "Love",
  yes: "Yes",
  unsure: "Unsure",
  no: "No",
  idle: "—",
};

export interface CompareModalProps {
  candidateIds: string[];
  partyMap: Record<MusicPartyId, MusicParty>;
  onClose: () => void;
}

export function CompareModal({
  candidateIds,
  partyMap,
  onClose,
}: CompareModalProps) {
  const allCandidates = useMusicStore((s) => s.candidates);
  const leans = useMusicStore((s) => s.leans);
  const contracts = useMusicStore((s) => s.contracts);

  // Preserve the selection order so "first picked = leftmost column."
  const candidates = useMemo(
    () =>
      candidateIds
        .map((id) => allCandidates.find((c) => c.id === id))
        .filter((c): c is MusicCandidate => Boolean(c)),
    [allCandidates, candidateIds],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (candidates.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative mt-10 max-h-[85vh] w-full max-w-[1180px] overflow-hidden rounded-xl border border-border bg-ivory shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-gold/15 bg-ivory-warm/40 px-5 py-3">
          <div>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Side-by-side compare
            </p>
            <h2 className="mt-0.5 font-serif text-[18px] leading-tight text-ink">
              {candidates.length} candidates
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close compare"
            className="rounded-sm p-1 text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="max-h-[calc(85vh-60px)] overflow-auto panel-scroll">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-ivory">
              <tr>
                <RowHeader sticky />
                {candidates.map((c) => (
                  <th
                    key={c.id}
                    className="min-w-[280px] border-b border-gold/15 bg-ivory px-4 py-3 align-top"
                  >
                    <div className="text-[14px] font-medium leading-tight text-ink">
                      {c.name}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-ink-muted">
                      {c.descriptor}
                    </div>
                    <div className="mt-2">
                      <StatePill
                        state={candidateEntityState(c.status)}
                        labelOverride={candidateStatusLabel(c.status)}
                        size="sm"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rate */}
              <Row>
                <RowHeader label="Rate" />
                {candidates.map((c) => (
                  <Cell key={c.id}>
                    <span
                      className="font-mono tabular-nums text-[12px] text-ink"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {rateRange(c.rate_low, c.rate_high)}
                    </span>
                  </Cell>
                ))}
              </Row>

              {/* Events */}
              <Row>
                <RowHeader label="Events" />
                {candidates.map((c) => (
                  <Cell key={c.id}>
                    <div className="flex flex-wrap gap-1">
                      {c.events.map((ev) => (
                        <span
                          key={ev}
                          className="inline-flex items-center rounded-full border border-border bg-white px-1.5 py-0.5 text-[10px] text-ink-muted"
                        >
                          {MUSIC_EVENTS.find((m) => m.id === ev)?.label ?? ev}
                        </span>
                      ))}
                    </div>
                  </Cell>
                ))}
              </Row>

              {/* Per-party leanings (3 rows, aligned) */}
              {INTERNAL_ORDER.map((pid) => {
                const party = partyMap[pid] ?? resolveMusicParty(pid);
                return (
                  <Row key={pid}>
                    <RowHeader label={party.display_name} />
                    {candidates.map((c) => (
                      <Cell key={c.id}>
                        <LeanCell
                          lean={findLean(leans, c.id, pid)}
                        />
                      </Cell>
                    ))}
                  </Row>
                );
              })}

              {/* Pending action */}
              <Row>
                <RowHeader label="Pending action" />
                {candidates.map((c) => {
                  const owner = c.pending_action?.owner;
                  const ownerParty = owner
                    ? partyMap[owner] ?? resolveMusicParty(owner)
                    : null;
                  return (
                    <Cell key={c.id}>
                      {c.pending_action ? (
                        <div className="text-[11.5px] leading-snug text-ink">
                          <span
                            className="mr-1.5 rounded-sm bg-ivory-deep px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-muted"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {ownerParty?.display_name}
                          </span>
                          {c.pending_action.description}
                        </div>
                      ) : (
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          —
                        </span>
                      )}
                    </Cell>
                  );
                })}
              </Row>

              {/* Contract */}
              <Row>
                <RowHeader label="Contract" />
                {candidates.map((c) => {
                  const contract = contracts.find(
                    (x) => x.candidate_id === c.id,
                  );
                  return (
                    <Cell key={c.id}>
                      {contract ? (
                        <div className="space-y-0.5">
                          <div
                            className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {contract.status.replace(/_/g, " ")}
                          </div>
                          <div
                            className="font-mono text-[11.5px] tabular-nums text-ink"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {contract.total_amount != null
                              ? fmtINR(contract.total_amount)
                              : "pricing pending"}
                          </div>
                        </div>
                      ) : (
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          no contract
                        </span>
                      )}
                    </Cell>
                  );
                })}
              </Row>

              {/* Samples */}
              <Row>
                <RowHeader label="Samples" />
                {candidates.map((c) => (
                  <Cell key={c.id}>
                    <div className="space-y-2">
                      {c.sample_urls.slice(0, 2).map((url) => (
                        <ReferenceEmbed key={url} url={url} variant="card" />
                      ))}
                      {c.sample_urls.length > 2 && (
                        <ReferenceEmbed
                          url={c.sample_urls[2]!}
                          variant="inline"
                        />
                      )}
                    </div>
                  </Cell>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Row + cell primitives ────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

function RowHeader({
  label,
  sticky = false,
}: {
  label?: string;
  sticky?: boolean;
}) {
  return (
    <th
      scope="row"
      className={cn(
        "w-[148px] border-b border-border/40 bg-ivory-warm/60 px-3 py-2.5 align-top text-left",
        sticky && "bg-ivory",
      )}
    >
      {label && (
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      )}
    </th>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="min-w-[280px] border-b border-border/40 px-4 py-2.5 align-top">
      {children}
    </td>
  );
}

function LeanCell({ lean }: { lean: MusicCandidateLean | undefined }) {
  const kind: MusicReactionKind = lean?.lean ?? "idle";
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-[12px] text-ink">
        <span aria-hidden>{LEAN_GLYPH[kind]}</span>
        <span>{LEAN_LABEL[kind]}</span>
      </span>
      {lean?.note && (
        <p className="text-[11px] leading-snug text-ink-muted">{lean.note}</p>
      )}
    </div>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────

function findLean(
  leans: MusicCandidateLean[],
  candidate_id: string,
  party_id: MusicPartyId,
): MusicCandidateLean | undefined {
  return leans.find(
    (l) => l.candidate_id === candidate_id && l.party_id === party_id,
  );
}

function rateRange(low?: number, high?: number): string {
  if (low == null && high == null) return "—";
  const fmt = (n: number) => {
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (low != null && high != null && low !== high)
    return `${fmt(low)}–${fmt(high)}`;
  return fmt((low ?? high)!);
}

function fmtINR(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2).replace(/\.00$/, "")}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${n}`;
}
