"use client";

// ── Caterer Decision Board (reworked) ─────────────────────────────────────
// Working surface for deciding, not storing. Every caterer card shows:
//   - Shortlist + fit-score header
//   - **Who's leaning where** — each party (Priya / Arjun / Urvashi)
//     with a pill showing their stated lean. Click to change.
//   - Proposals strip (unchanged, tightened)
//   - What's missing / open questions to the caterer (threaded inline)
//   - AI assessment as a **draft** — the three parties can thumbs/
//     thumbs-down/question the tradeoffs before it counts.
//   - Side-by-side compare toggle at the top is a real toggle; picking
//     caterers stays sticky.

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCateringStore } from "@/stores/catering-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  buildPartyMap,
} from "@/lib/catering/parties";
import type {
  CatererAssessment,
  CatererProposal,
  Lean,
  MenuEvent,
  PartyId,
} from "@/types/catering";
import type { Vendor } from "@/types/vendor";
import { formatPriceShort } from "@/lib/vendors/price-display";
import {
  FlowItem,
  InFlightStrip,
  PartyAvatar,
  PartyAvatars,
  PresenceIndicator,
  ReactionBar,
  SubHeader,
  TabHeader,
  WaitingOnBadge,
} from "./shared/collab";

interface CatererDecisionBoardProps {
  weddingId?: string;
}

const CURRENT_PARTY: PartyId = URVASHI_ID;

export function CatererDecisionBoard({
  weddingId = DEMO_WEDDING_ID,
}: CatererDecisionBoardProps) {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);

  const allEvents = useCateringStore((s) => s.events);
  const proposals = useCateringStore((s) => s.proposals);
  const assessments = useCateringStore((s) => s.assessments);
  const party_leans = useCateringStore((s) => s.party_leans);
  const open_questions = useCateringStore((s) => s.open_questions);
  const reactions = useCateringStore((s) => s.reactions);
  const presence = useCateringStore((s) => s.presence);
  const upsertAssessment = useCateringStore((s) => s.upsertAssessment);
  const setLean = useCateringStore((s) => s.setLean);
  const addOpenQuestion = useCateringStore((s) => s.addOpenQuestion);
  const answerQuestion = useCateringStore((s) => s.answerQuestion);
  const toggleReaction = useCateringStore((s) => s.toggleReaction);

  const events = useMemo(
    () =>
      allEvents
        .filter((e) => e.wedding_id === weddingId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allEvents, weddingId],
  );

  const catererNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const v of vendors) m[v.id] = v.name;
    return m;
  }, [vendors]);
  const partyMap = useMemo(() => buildPartyMap(catererNameMap), [catererNameMap]);

  const cateringVendors: Vendor[] = useMemo(() => {
    const shortlistedIds = new Set(shortlist.map((s) => s.vendor_id));
    const proposalCatererIds = new Set(
      proposals
        .filter((p) => p.wedding_id === weddingId)
        .map((p) => p.caterer_id),
    );
    return vendors
      .filter((v) => v.category === "catering")
      .filter((v) => shortlistedIds.has(v.id) || proposalCatererIds.has(v.id));
  }, [vendors, shortlist, proposals, weddingId]);

  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [lastError, setLastError] = useState<string | null>(null);

  async function generateAssessment(vendor: Vendor) {
    setLastError(null);
    setGenerating((s) => new Set(s).add(vendor.id));
    try {
      const vendorProposals = proposals.filter(
        (p) => p.wedding_id === weddingId && p.caterer_id === vendor.id,
      );
      const competitors = cateringVendors
        .filter((v) => v.id !== vendor.id)
        .map((v) => ({
          id: v.id,
          name: v.name,
          style_tags: v.style_tags,
          price_range: formatPriceShort(v.price_display),
        }));

      const res = await fetch("/api/catering/fit-score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wedding_id: weddingId,
          caterer: {
            id: vendor.id,
            name: vendor.name,
            location: vendor.location,
            price_range: formatPriceShort(vendor.price_display),
            style_tags: vendor.style_tags,
            rating: vendor.rating,
            review_count: vendor.review_count,
            bio: vendor.bio,
          },
          events: events.map((e) => ({
            id: e.id,
            label: e.label,
            date: e.date,
            guest_count: e.guest_count,
            cuisine_direction: e.cuisine_direction,
            service_style: e.service_style,
            vibe_tags: e.vibe_tags,
          })),
          proposals: vendorProposals,
          competitor_summaries: competitors,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        assessment?: Omit<CatererAssessment, "id">;
        error?: string;
      };
      if (!data.ok || !data.assessment) {
        setLastError(data.error ?? "Fit assessment failed.");
        return;
      }
      upsertAssessment(data.assessment);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(vendor.id);
        return next;
      });
    }
  }

  function toggleCompare(vendorId: string) {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else {
        if (next.size >= 4) return prev;
        next.add(vendorId);
      }
      return next;
    });
  }

  // In-flight strip
  const inFlight: FlowItem[] = useMemo(() => {
    const items: FlowItem[] = [];
    // Vendors without an assessment
    for (const v of cateringVendors) {
      if (!assessments.some((a) => a.caterer_id === v.id)) {
        items.push({
          id: `fl-noassess-${v.id}`,
          label: `Assess ${v.name}`,
          hint: "No AI fit read yet",
          state: "draft",
          waiting_on: URVASHI_ID,
        });
      }
    }
    // Unanswered questions pointed at vendors
    for (const q of open_questions) {
      if (q.answered_at) continue;
      const party = partyMap[q.for_party];
      if (party?.role !== "vendor") continue;
      items.push({
        id: `fl-q-${q.id}`,
        label: truncate(q.body, 60),
        hint: `Open · ${party.display_name}`,
        state: "blocked",
        waiting_on: q.for_party,
      });
    }
    // Parties who haven't stated a lean on a shortlisted caterer
    const internal: PartyId[] = [PRIYA_ID, ARJUN_ID, URVASHI_ID];
    for (const v of cateringVendors) {
      for (const pid of internal) {
        const hasLean = party_leans.some(
          (l) => l.caterer_id === v.id && l.party_id === pid && !l.event_id,
        );
        if (!hasLean) {
          items.push({
            id: `fl-lean-${v.id}-${pid}`,
            label: `${partyMap[pid]?.display_name ?? pid} hasn't leaned on ${v.name}`,
            hint: "No stated preference yet",
            state: "draft",
            waiting_on: pid,
          });
        }
      }
    }
    return items.slice(0, 6);
  }, [cateringVendors, assessments, open_questions, party_leans, partyMap]);

  const compareVendors = cateringVendors.filter((v) => compareSet.has(v.id));

  if (cateringVendors.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <h3 className="text-[17px] font-medium text-ink">
            No caterers in the running
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            Shortlist caterers in the Vendors directory — they'll appear here
            with fit scores and tradeoffs the moment you do.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <TabHeader
        eyebrow="Catering · Decision Board"
        title="Where's each party leaning?"
        subtitle={`${cateringVendors.length} caterer${cateringVendors.length === 1 ? "" : "s"} in the running`}
        right={<PresenceIndicator signals={presence} partyMap={partyMap} />}
      />

      <div className="flex items-center justify-between gap-4 border-b border-border bg-ivory-warm/20 px-7 py-2">
        <div className="flex items-center gap-1">
          {(["grid", "compare"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCompareMode(m === "compare")}
              disabled={m === "compare" && compareSet.size < 2}
              className={cn(
                "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                (m === "compare") === compareMode
                  ? "bg-ink text-ivory"
                  : compareSet.size < 2 && m === "compare"
                    ? "border border-border bg-white text-ink-faint"
                    : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {m === "grid" ? "Grid" : `Side-by-side (${compareSet.size})`}
            </button>
          ))}
        </div>
        {lastError && (
          <p className="rounded-sm border border-rose/30 bg-rose-pale/20 px-2 py-1 text-[11px] text-rose">
            {lastError}
          </p>
        )}
      </div>

      {/* In-flight strip */}
      <div className="border-b border-border bg-white px-7 py-3">
        <SubHeader label="In flight" count={inFlight.length} />
        <InFlightStrip
          items={inFlight}
          partyMap={partyMap}
          emptyMessage="All parties have weighed in · every caterer has an assessment."
        />
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-4">
        {compareMode ? (
          <CompareMatrix
            vendors={compareVendors}
            proposals={proposals.filter((p) => p.wedding_id === weddingId)}
            events={events}
            assessments={assessments}
            party_leans={party_leans}
            partyMap={partyMap}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {cateringVendors.map((v) => (
              <CatererCard
                key={v.id}
                vendor={v}
                proposals={proposals.filter(
                  (p) => p.wedding_id === weddingId && p.caterer_id === v.id,
                )}
                events={events}
                assessment={assessments.find((a) => a.caterer_id === v.id)}
                partyLeans={party_leans.filter((l) => l.caterer_id === v.id)}
                openQuestions={open_questions.filter(
                  (q) =>
                    (q.entity_kind === "caterer" && q.entity_id === v.id) ||
                    q.for_party === v.id,
                )}
                assessmentReactions={reactions.filter(
                  (r) =>
                    r.entity_kind === "assessment" &&
                    assessments.find((a) => a.caterer_id === v.id)?.id ===
                      r.entity_id,
                )}
                partyMap={partyMap}
                isGenerating={generating.has(v.id)}
                isInCompare={compareSet.has(v.id)}
                isShortlisted={shortlist.some((s) => s.vendor_id === v.id)}
                onGenerateAssessment={() => generateAssessment(v)}
                onToggleCompare={() => toggleCompare(v.id)}
                onToggleShortlist={() => toggleShortlist(v.id)}
                onSetLean={(pid, lean, note) =>
                  setLean(pid, v.id, lean, note)
                }
                onAskCaterer={(body) =>
                  addOpenQuestion({
                    wedding_id: weddingId,
                    entity_kind: "caterer",
                    entity_id: v.id,
                    raised_by: CURRENT_PARTY,
                    for_party: v.id,
                    body,
                  })
                }
                onToggleAssessmentReaction={(kind) => {
                  const a = assessments.find((x) => x.caterer_id === v.id);
                  if (!a) return;
                  toggleReaction("assessment", a.id, CURRENT_PARTY, kind);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Caterer card ─────────────────────────────────────────────────────────

function CatererCard({
  vendor,
  proposals,
  events,
  assessment,
  partyLeans,
  openQuestions,
  assessmentReactions,
  partyMap,
  isGenerating,
  isInCompare,
  isShortlisted,
  onGenerateAssessment,
  onToggleCompare,
  onToggleShortlist,
  onSetLean,
  onAskCaterer,
  onToggleAssessmentReaction,
}: {
  vendor: Vendor;
  proposals: CatererProposal[];
  events: MenuEvent[];
  assessment: CatererAssessment | undefined;
  partyLeans: import("@/types/catering").PartyLean[];
  openQuestions: import("@/types/catering").OpenQuestion[];
  assessmentReactions: import("@/types/catering").Reaction[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
  isGenerating: boolean;
  isInCompare: boolean;
  isShortlisted: boolean;
  onGenerateAssessment: () => void;
  onToggleCompare: () => void;
  onToggleShortlist: () => void;
  onSetLean: (pid: PartyId, lean: Lean, note?: string) => void;
  onAskCaterer: (body: string) => void;
  onToggleAssessmentReaction: (
    kind: import("@/types/catering").ReactionKind,
  ) => void;
}) {
  const missingEventLabels = events
    .filter((ev) => !proposals.some((p) => p.event_id === ev.id))
    .map((e) => e.label);
  const proposalsReceived = proposals.filter((p) => p.status === "received");
  const proposalsRequested = proposals.filter((p) => p.status === "requested");

  return (
    <article
      className={cn(
        "rounded-md border bg-white p-3 transition-colors",
        isInCompare ? "border-ink" : "border-border",
      )}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-medium leading-tight text-ink">
              {vendor.name}
            </h3>
            {isShortlisted && (
              <BadgeCheck
                size={12}
                strokeWidth={1.8}
                className="text-saffron"
                aria-label="Shortlisted"
              />
            )}
          </div>
          <p
            className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {vendor.location || "—"} · {formatPriceShort(vendor.price_display)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {vendor.rating !== null && (
              <span className="flex items-center gap-0.5 text-[10.5px] text-ink-muted">
                <Star
                  size={10}
                  strokeWidth={1.8}
                  className="text-saffron"
                  fill="currentColor"
                />
                <span
                  className="font-mono tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {vendor.rating.toFixed(1)}
                </span>
                <span className="text-ink-faint">({vendor.review_count})</span>
              </span>
            )}
            {vendor.style_tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-sm bg-ivory-warm px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <FitBadge score={assessment?.fit_score ?? null} />
      </header>

      {/* Who's leaning where */}
      <section className="mt-3 rounded-sm border border-border bg-ivory-warm/30 p-2">
        <p
          className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Who's leaning
        </p>
        <div className="grid grid-cols-3 gap-2">
          {([PRIYA_ID, ARJUN_ID, URVASHI_ID] as PartyId[]).map((pid) => {
            const lean = partyLeans.find(
              (l) => l.party_id === pid && !l.event_id,
            );
            return (
              <PartyLeanTile
                key={pid}
                partyId={pid}
                partyMap={partyMap}
                lean={lean?.lean ?? "undecided"}
                note={lean?.note}
                onChange={(v) => onSetLean(pid, v)}
              />
            );
          })}
        </div>
      </section>

      {/* Proposals strip */}
      <section className="mt-3 rounded-sm border border-border bg-ivory-warm/30 p-2">
        <p
          className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Proposals — {proposalsReceived.length} received
          {proposalsRequested.length > 0
            ? ` · ${proposalsRequested.length} pending`
            : ""}
        </p>
        {proposalsReceived.length === 0 && proposalsRequested.length === 0 && (
          <p className="text-[11px] italic text-ink-faint">
            No proposals from this caterer yet.
          </p>
        )}
        {proposalsReceived.length > 0 && (
          <ul className="space-y-0.5">
            {proposalsReceived.map((p) => {
              const ev = events.find((e) => e.id === p.event_id);
              if (!ev) return null;
              const price =
                p.price_per_plate_low && p.price_per_plate_high
                  ? `${p.currency} ${p.price_per_plate_low.toLocaleString()}–${p.price_per_plate_high.toLocaleString()}`
                  : "—";
              return (
                <li
                  key={p.id}
                  className="flex items-baseline justify-between gap-3 text-[11px]"
                >
                  <span className="text-ink">{ev.label}</span>
                  <span
                    className="font-mono tabular-nums text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {price}/plate
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* What's missing */}
      {missingEventLabels.length > 0 && (
        <section className="mt-3 rounded-sm border border-saffron/30 bg-saffron-pale/20 px-2 py-1.5">
          <p className="text-[11px] leading-snug text-ink">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.1em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Missing ·{" "}
            </span>
            No proposal yet for {missingEventLabels.join(", ")}.
          </p>
        </section>
      )}

      {/* Open questions to this caterer */}
      <CatererQuestions
        catererName={vendor.name}
        questions={openQuestions}
        partyMap={partyMap}
        onAsk={onAskCaterer}
      />

      {/* AI assessment — as a draft, reactable */}
      {assessment ? (
        <section className="mt-3 rounded-sm border border-gold/20 bg-ivory-warm/30 p-2">
          <header className="mb-1 flex items-center justify-between gap-2">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.12em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              AI assessment · draft
              {assessment.model === "offline" && " · heuristic"}
            </p>
            <button
              type="button"
              onClick={onGenerateAssessment}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors",
                isGenerating
                  ? "text-ink-faint"
                  : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <RefreshCw size={9} strokeWidth={2} />
              {isGenerating ? "Thinking…" : "Refresh"}
            </button>
          </header>
          <ul className="space-y-0.5">
            {assessment.tradeoffs.slice(0, 4).map((t, i) => (
              <li key={i} className="text-[11.5px] leading-snug text-ink">
                <span className="mr-1 text-ink-faint">·</span>
                {t}
              </li>
            ))}
          </ul>
          {assessment.what_missing.length > 0 && (
            <p className="mt-1 text-[11px] italic leading-snug text-ink-muted">
              <span
                className="font-mono text-[8.5px] uppercase tracking-[0.1em] not-italic text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Gaps ·{" "}
              </span>
              {assessment.what_missing.join(" · ")}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
            <ReactionBar
              reactions={assessmentReactions}
              partyMap={partyMap}
              currentPartyId={CURRENT_PARTY}
              onToggle={onToggleAssessmentReaction}
              compact
            />
            <p
              className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              React to confirm or push back
            </p>
          </div>
        </section>
      ) : (
        <section className="mt-3 flex items-center justify-between gap-3 rounded-sm border border-dashed border-border bg-ivory-warm/30 px-2 py-2">
          <p className="text-[11.5px] text-ink-muted">
            No AI read yet — weigh this caterer against the wedding.
          </p>
          <button
            type="button"
            onClick={onGenerateAssessment}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
              isGenerating
                ? "bg-ink-faint/20 text-ink-faint"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles size={10} strokeWidth={2} />
            {isGenerating ? "Thinking…" : "Assess"}
          </button>
        </section>
      )}

      {/* Actions */}
      <footer className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleCompare}
          className={cn(
            "flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
            isInCompare
              ? "border-ink bg-ink text-ivory"
              : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {isInCompare ? <Check size={10} strokeWidth={2} /> : null}
          {isInCompare ? "In compare" : "Add to compare"}
        </button>
        {!isShortlisted && (
          <button
            type="button"
            onClick={onToggleShortlist}
            className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Heart shortlist
          </button>
        )}
      </footer>
    </article>
  );
}

// ── Party lean tile ──────────────────────────────────────────────────────

function PartyLeanTile({
  partyId,
  partyMap,
  lean,
  note,
  onChange,
}: {
  partyId: PartyId;
  partyMap: Record<PartyId, import("@/types/catering").Party>;
  lean: Lean;
  note?: string;
  onChange: (lean: Lean) => void;
}) {
  const party = partyMap[partyId];
  if (!party) return null;
  const leanStyle: Record<Lean, string> = {
    lean: "border-sage/50 bg-sage-pale/40 text-ink",
    undecided: "border-border bg-white text-ink-faint",
    against: "border-rose/50 bg-rose-pale/40 text-rose",
  };
  const leanLabel: Record<Lean, string> = {
    lean: "Lean",
    undecided: "Undecided",
    against: "Against",
  };
  const next: Lean = lean === "lean" ? "undecided" : lean === "undecided" ? "against" : "lean";
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-sm border px-1.5 py-1 text-left transition-colors hover:border-saffron/40",
        leanStyle[lean],
      )}
      title={note ?? `${party.display_name} — ${leanLabel[lean]} (click to cycle)`}
    >
      <span className="flex items-center gap-1">
        <PartyAvatar party={party} size="sm" />
        <span className="text-[10.5px] font-medium text-ink">
          {party.display_name}
        </span>
      </span>
      <span
        className="font-mono text-[8.5px] uppercase tracking-[0.1em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {leanLabel[lean]}
      </span>
      {note && (
        <span className="mt-0.5 line-clamp-2 text-[10px] italic leading-snug text-ink-muted">
          "{note}"
        </span>
      )}
    </button>
  );
}

// ── Caterer questions thread ─────────────────────────────────────────────

function CatererQuestions({
  catererName,
  questions,
  partyMap,
  onAsk,
}: {
  catererName: string;
  questions: import("@/types/catering").OpenQuestion[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
  onAsk: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const open = questions.filter((q) => !q.answered_at);
  const answered = questions.filter((q) => q.answered_at);

  return (
    <section className="mt-3 rounded-sm border border-border bg-white p-2">
      <header className="mb-1 flex items-center gap-1.5">
        <HelpCircle size={10} strokeWidth={2} className="text-saffron" />
        <p
          className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Open questions to {catererName} · {open.length} open
          {answered.length > 0 ? ` · ${answered.length} answered` : ""}
        </p>
      </header>

      <ul className="space-y-1">
        {open.map((q) => {
          const raiser = partyMap[q.raised_by];
          return (
            <li key={q.id} className="flex items-start gap-1.5">
              {raiser && <PartyAvatar party={raiser} size="sm" />}
              <p className="flex-1 text-[11px] leading-snug text-ink">
                {q.body}
              </p>
            </li>
          );
        })}
        {answered.slice(0, 2).map((q) => {
          const raiser = partyMap[q.raised_by];
          return (
            <li key={q.id} className="space-y-0.5">
              <div className="flex items-start gap-1.5">
                {raiser && <PartyAvatar party={raiser} size="sm" />}
                <p className="flex-1 text-[11px] leading-snug text-ink-muted line-through">
                  {q.body}
                </p>
              </div>
              {q.answer && (
                <p className="ml-5 border-l-2 border-sage/40 pl-2 text-[10.5px] leading-snug text-ink-muted">
                  <span
                    className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-sage"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    answered ·{" "}
                  </span>
                  {q.answer}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-1.5 flex items-center gap-1">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (draft.trim()) {
                onAsk(draft.trim());
                setDraft("");
              }
            }
          }}
          placeholder={`Ask ${catererName}…`}
          className="flex-1 rounded-sm border border-border bg-white px-1.5 py-1 text-[11px] text-ink outline-none placeholder:text-ink-faint focus:border-saffron/40"
        />
        <button
          type="button"
          onClick={() => {
            if (draft.trim()) {
              onAsk(draft.trim());
              setDraft("");
            }
          }}
          disabled={!draft.trim()}
          className={cn(
            "rounded-sm px-1.5 py-1",
            draft.trim() ? "bg-ink text-ivory" : "bg-ink-faint/20 text-ink-faint",
          )}
          aria-label="Send question"
        >
          <Send size={10} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}

// ── Fit badge ────────────────────────────────────────────────────────────

function FitBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-dashed border-border font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        fit —
      </span>
    );
  }
  const tone =
    score >= 75
      ? "border-sage/50 bg-sage-pale/50 text-ink"
      : score >= 55
        ? "border-saffron/50 bg-saffron-pale/40 text-ink"
        : "border-rose/40 bg-rose-pale/30 text-ink";
  return (
    <span
      className={cn(
        "flex h-9 w-9 flex-none flex-col items-center justify-center rounded-full border",
        tone,
      )}
      aria-label={`Fit score ${score} of 100`}
    >
      <span
        className="font-mono text-[13px] leading-none tabular-nums"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {score}
      </span>
      <span
        className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        fit
      </span>
    </span>
  );
}

// ── Compare matrix ───────────────────────────────────────────────────────

function CompareMatrix({
  vendors,
  proposals,
  events,
  assessments,
  party_leans,
  partyMap,
}: {
  vendors: Vendor[];
  proposals: CatererProposal[];
  events: MenuEvent[];
  assessments: CatererAssessment[];
  party_leans: import("@/types/catering").PartyLean[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
}) {
  if (vendors.length < 2) {
    return (
      <div className="rounded-md border border-dashed border-border bg-ivory-warm/20 px-5 py-8 text-center">
        <p className="text-[12px] text-ink-muted">
          Pick 2–4 caterers in the grid, then switch to side-by-side.
        </p>
      </div>
    );
  }
  const internal: PartyId[] = [PRIYA_ID, ARJUN_ID, URVASHI_ID];
  const dimensions = [
    "cuisine",
    "scale",
    "budget",
    "flexibility",
    "cultural_fit",
    "reviews",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-40 bg-white px-2 py-2 text-left">
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                —
              </span>
            </th>
            {vendors.map((v) => {
              const a = assessments.find((x) => x.caterer_id === v.id);
              return (
                <th
                  key={v.id}
                  className="border-b border-border px-3 pb-2 pt-1 text-left align-top"
                >
                  <span className="block text-[13px] font-medium text-ink">
                    {v.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5">
                    <FitBadge score={a?.fit_score ?? null} />
                    <span
                      className="block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatPriceShort(v.price_display)}
                    </span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Per-party leans row */}
          {internal.map((pid) => (
            <tr key={`lean-${pid}`}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left align-top"
              >
                <span className="flex items-center gap-1.5">
                  <PartyAvatar party={partyMap[pid]!} size="sm" />
                  <span className="text-[11px] text-ink">
                    {partyMap[pid]?.display_name ?? pid}
                  </span>
                </span>
              </th>
              {vendors.map((v) => {
                const lean = party_leans.find(
                  (l) =>
                    l.caterer_id === v.id && l.party_id === pid && !l.event_id,
                );
                return (
                  <td
                    key={v.id}
                    className="border-b border-border/60 px-3 py-1.5 align-top text-[11px]"
                  >
                    <LeanInline lean={lean?.lean ?? "undecided"} />
                    {lean?.note && (
                      <p className="mt-0.5 text-[10.5px] italic leading-snug text-ink-muted">
                        "{lean.note}"
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Per-event pricing rows */}
          {events.map((ev) => (
            <tr key={ev.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left align-top"
              >
                <span className="block text-[11px] text-ink">{ev.label}</span>
                <span
                  className="block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {ev.guest_count} guests
                </span>
              </th>
              {vendors.map((v) => {
                const prop = proposals.find(
                  (p) => p.caterer_id === v.id && p.event_id === ev.id,
                );
                return (
                  <td
                    key={v.id}
                    className="border-b border-border/60 px-3 py-1.5 align-top text-[11px]"
                  >
                    {!prop && <span className="text-ink-faint">—</span>}
                    {prop?.status === "requested" && (
                      <span className="text-saffron">requested</span>
                    )}
                    {prop?.status === "declined" && (
                      <span className="text-rose">declined</span>
                    )}
                    {prop?.status === "received" && (
                      <span
                        className="font-mono tabular-nums text-ink"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {prop.price_per_plate_low && prop.price_per_plate_high
                          ? `${prop.currency} ${prop.price_per_plate_low.toLocaleString()}–${prop.price_per_plate_high.toLocaleString()}`
                          : "—"}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* AI breakdown rows */}
          {dimensions.map((dim) => {
            const hasAny = vendors.some((v) => {
              const a = assessments.find((x) => x.caterer_id === v.id);
              return a?.breakdown.some((b) => b.dimension === dim);
            });
            if (!hasAny) return null;
            return (
              <tr key={dim}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left"
                >
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {dim.replace("_", " ")}
                  </span>
                </th>
                {vendors.map((v) => {
                  const a = assessments.find((x) => x.caterer_id === v.id);
                  const slot = a?.breakdown.find((b) => b.dimension === dim);
                  return (
                    <td
                      key={v.id}
                      className="border-b border-border/60 px-3 py-1.5 align-top text-[11px] leading-snug"
                    >
                      {slot ? (
                        <>
                          <span
                            className="mb-0.5 block font-mono text-[12px] tabular-nums text-ink"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {slot.score}
                          </span>
                          <span className="text-ink-muted">{slot.rationale}</span>
                        </>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeanInline({ lean }: { lean: Lean }) {
  const tone: Record<Lean, string> = {
    lean: "text-sage",
    undecided: "text-ink-faint",
    against: "text-rose",
  };
  const label: Record<Lean, string> = {
    lean: "lean",
    undecided: "undecided",
    against: "against",
  };
  return (
    <span
      className={cn(
        "font-mono text-[10.5px] uppercase tracking-[0.08em]",
        tone[lean],
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label[lean]}
    </span>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}
