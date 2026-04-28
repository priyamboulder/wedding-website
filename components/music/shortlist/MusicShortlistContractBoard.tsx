"use client";

// ── Music Shortlist & Contract board ──────────────────────────────────────
// The working surface for every music vendor decision — DJs, bands, dhol,
// classical singers, sangeet choreographers, MCs, etc. Unlike Catering
// which evaluates one caterer entity, this board is two-axis: vendor
// *type* drives vertical sections, event tags drive horizontal filtering.
//
// Sections:
//   1. WIP strip        — waiting on reactions, pending vendor replies,
//                         contracts awaiting signature
//   2. In consideration — active candidates grouped by vendor type
//   3. In debate        — auto-populated: candidates where parties
//                         disagree (cross of positive + negative leans)
//   4. Booked           — contracts live here with inline state
//   5. Passed on        — collapsed by default, reasons preserved
//
// Side-by-side compare is a modal opened from the board's compare tray
// that appears once ≥2 candidates are selected.

import { useMemo, useState } from "react";
import { GitBranch, Scale, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  EventFilterBar,
  PresenceIndicator,
  WorkInProgressStrip,
  buildMusicPartyMap,
  matchesEventFilter,
} from "@/components/music/primitives";
import type {
  MusicCandidate,
  MusicEventId,
  MusicPartyId,
  MusicVendorType,
  MusicWipItem,
} from "@/types/music";
import { MUSIC_VENDOR_TYPES } from "@/types/music";
import {
  candidateEntityState,
  candidateStatusLabel,
  useMusicStore,
} from "@/stores/music-store";
import { DEMO_MUSIC_WEDDING_ID } from "@/lib/music-seed";
import { CandidateCard } from "./CandidateCard";
import { CompareModal } from "./CompareModal";
import { AddCandidate } from "./AddCandidate";

const MAX_COMPARE = 3;

export function MusicShortlistContractBoard({
  weddingId = DEMO_MUSIC_WEDDING_ID,
}: {
  weddingId?: string;
}) {
  const candidates = useMusicStore((s) => s.candidates);
  const leans = useMusicStore((s) => s.leans);
  const contracts = useMusicStore((s) => s.contracts);
  const presence = useMusicStore((s) => s.presence);
  const vendorNames = useMusicStore((s) => s.vendor_names);

  const [selectedEvents, setSelectedEvents] = useState<MusicEventId[]>([]);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [passedOpen, setPassedOpen] = useState(false);

  const partyMap = useMemo(
    () => buildMusicPartyMap(vendorNames),
    [vendorNames],
  );

  const scoped = useMemo(
    () => candidates.filter((c) => c.wedding_id === weddingId),
    [candidates, weddingId],
  );

  const filtered = useMemo(
    () =>
      scoped.filter((c) => matchesEventFilter(c.events, selectedEvents)),
    [scoped, selectedEvents],
  );

  const wip = useMemo<MusicWipItem[]>(() => {
    // Anything that's waiting on someone or in debate or has an unsigned
    // contract — that's "in flight".
    const items: MusicWipItem[] = [];
    for (const c of filtered) {
      if (
        c.status === "waiting_vendor" ||
        c.status === "contract_sent" ||
        c.status === "in_debate" ||
        c.status === "proposal_received" ||
        c.pending_action
      ) {
        const waitingOn =
          c.pending_action?.owner ??
          (c.status === "waiting_vendor" ? c.vendor_id : undefined);
        items.push({
          id: c.id,
          title: c.name,
          hint: c.pending_action?.description ?? candidateStatusLabel(c.status),
          state: candidateEntityState(c.status),
          waiting_on: waitingOn,
          attribution: [c.suggested_by],
        });
      }
    }
    // Contracts that are sent but not countersigned → WIP too.
    for (const contract of contracts) {
      if (
        contract.status === "sent" ||
        contract.status === "signed_by_vendor"
      ) {
        const cand = filtered.find((c) => c.id === contract.candidate_id);
        if (!cand) continue;
        if (items.some((i) => i.id === cand.id)) continue;
        items.push({
          id: contract.id,
          title: `${cand.name} — contract`,
          hint:
            contract.status === "sent"
              ? "Awaiting vendor signature"
              : "Awaiting our countersignature",
          state: "waiting",
          waiting_on:
            contract.status === "sent" ? cand.vendor_id : URVASHI_ID,
          attribution: [cand.suggested_by],
        });
      }
    }
    return items.slice(0, 8);
  }, [filtered, contracts]);

  // ── Section partitioning ─────────────────────────────────────────────
  const inDebate = useMemo(() => {
    return filtered.filter((c) => {
      const activeStatuses = new Set([
        "draft",
        "waiting_vendor",
        "proposal_received",
        "in_debate",
      ]);
      if (!activeStatuses.has(c.status)) return false;
      const rows = leans.filter((l) => l.candidate_id === c.id);
      const hasPositive = rows.some(
        (l) => l.lean === "love" || l.lean === "yes",
      );
      const hasNegative = rows.some(
        (l) => l.lean === "no" || l.lean === "unsure",
      );
      return hasPositive && hasNegative;
    });
  }, [filtered, leans]);
  const inDebateIds = useMemo(() => new Set(inDebate.map((c) => c.id)), [inDebate]);

  const inConsideration = useMemo(
    () =>
      filtered.filter(
        (c) =>
          (c.status === "draft" ||
            c.status === "waiting_vendor" ||
            c.status === "proposal_received" ||
            c.status === "in_debate") &&
          !inDebateIds.has(c.id),
      ),
    [filtered, inDebateIds],
  );

  const booked = useMemo(
    () =>
      filtered.filter(
        (c) =>
          c.status === "booked" ||
          c.status === "contract_sent" ||
          c.status === "signed",
      ),
    [filtered],
  );

  const passed = useMemo(
    () =>
      filtered.filter((c) => c.status === "passed" || c.status === "parked"),
    [filtered],
  );

  // ── Event counts for the filter bar ──────────────────────────────────
  const eventCounts = useMemo(() => {
    const counts: Partial<Record<MusicEventId, number>> = {};
    for (const c of scoped) {
      for (const ev of c.events) counts[ev] = (counts[ev] ?? 0) + 1;
    }
    return counts;
  }, [scoped]);

  // ── Compare controls ─────────────────────────────────────────────────
  function toggleCompare(id: string) {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COMPARE) next.add(id);
      return next;
    });
  }
  const canOpenCompare = compareSet.size >= 2;
  const compareMode = compareSet.size > 0;

  const compareCandidates = useMemo(
    () =>
      Array.from(compareSet)
        .map((id) => filtered.find((c) => c.id === id))
        .filter((c): c is MusicCandidate => Boolean(c)),
    [compareSet, filtered],
  );

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Page header + presence */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gold/15 bg-ivory-warm/20 px-7 py-4">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Shortlist & Contract
          </p>
          <h1 className="mt-0.5 font-serif text-[22px] leading-tight text-ink">
            Music pipeline
          </h1>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            Every DJ, band, dhol team, choreographer, and MC from "interesting"
            to "contract signed."
          </p>
        </div>
        <PresenceIndicator signals={presence} partyMap={partyMap} />
      </header>

      <EventFilterBar
        selected={selectedEvents}
        onChange={setSelectedEvents}
        counts={eventCounts}
        sticky={false}
      />

      <div className="px-7 pb-10 space-y-7">
        {/* WIP strip */}
        <WorkInProgressStrip
          items={wip}
          partyMap={partyMap}
          title="In flight"
        />

        {/* In debate (auto-populated) */}
        {inDebate.length > 0 && (
          <Section
            icon={<GitBranch size={14} strokeWidth={1.8} className="text-rose" />}
            title="In debate"
            hint="Parties disagree — a path forward is needed here."
            count={inDebate.length}
          >
            <CardGrid>
              {inDebate.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  partyMap={partyMap}
                  compareMode={{
                    selected: compareSet.has(c.id),
                    onToggle: () => toggleCompare(c.id),
                    disabled: !compareSet.has(c.id) && compareSet.size >= MAX_COMPARE,
                  }}
                />
              ))}
            </CardGrid>
          </Section>
        )}

        {/* In consideration — grouped by vendor type */}
        <Section
          icon={<Sparkles size={14} strokeWidth={1.8} className="text-saffron" />}
          title="In consideration"
          hint="Active candidates, grouped by vendor type."
          count={inConsideration.length}
          action={<AddCandidate weddingId={weddingId} />}
        >
          {MUSIC_VENDOR_TYPES.map((type) => {
            const forType = inConsideration.filter(
              (c) => c.vendor_type === type.id,
            );
            if (forType.length === 0) return null;
            return (
              <div key={type.id} className="space-y-2">
                <TypeHeader label={type.label} count={forType.length} />
                <CardGrid>
                  {forType.map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      partyMap={partyMap}
                      compareMode={{
                        selected: compareSet.has(c.id),
                        onToggle: () => toggleCompare(c.id),
                        disabled:
                          !compareSet.has(c.id) &&
                          compareSet.size >= MAX_COMPARE,
                      }}
                    />
                  ))}
                </CardGrid>
              </div>
            );
          })}
          {inConsideration.length === 0 && (
            <p className="text-[11.5px] italic text-ink-faint">
              Nothing in active consideration for this filter.
            </p>
          )}
        </Section>

        {/* Booked */}
        {booked.length > 0 && (
          <Section
            icon={<Scale size={14} strokeWidth={1.8} className="text-sage" />}
            title="Booked"
            hint="Contracts live here — deposit, milestones, PDF link."
            count={booked.length}
          >
            <CardGrid>
              {booked.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  partyMap={partyMap}
                />
              ))}
            </CardGrid>
          </Section>
        )}

        {/* Passed — collapsed by default */}
        {passed.length > 0 && (
          <section className="space-y-2">
            <button
              type="button"
              onClick={() => setPassedOpen((o) => !o)}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint hover:text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <XCircle size={12} strokeWidth={1.8} />
              <span>
                Passed on / parked
                <span className="ml-1.5 tabular-nums">({passed.length})</span>
              </span>
              <span>{passedOpen ? "hide" : "show"}</span>
            </button>
            {passedOpen && (
              <CardGrid>
                {passed.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    partyMap={partyMap}
                    dense
                  />
                ))}
              </CardGrid>
            )}
          </section>
        )}
      </div>

      {/* Compare tray — sticky floater once ≥1 candidate picked */}
      {compareMode && (
        <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gold/40 bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {compareSet.size} selected
          </span>
          <button
            type="button"
            onClick={() => setCompareSet(new Set())}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            clear
          </button>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            disabled={!canOpenCompare}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
              canOpenCompare
                ? "bg-ink text-ivory hover:bg-ink-soft"
                : "cursor-not-allowed bg-ivory-deep text-ink-faint",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            compare
          </button>
        </div>
      )}

      {compareOpen && (
        <CompareModal
          candidateIds={compareCandidates.map((c) => c.id)}
          partyMap={partyMap}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}

// ── Section shell ────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  hint,
  count,
  action,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5">
            {icon}
            <h2 className="text-[14px] font-medium text-ink">{title}</h2>
            {count != null && (
              <span
                className="font-mono text-[10px] tabular-nums text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {count}
              </span>
            )}
          </div>
          {hint && (
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
              {hint}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TypeHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      className="flex items-center gap-2 border-b border-border/60 pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span>{label}</span>
      <span className="tabular-nums text-ink-faint">{count}</span>
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}
