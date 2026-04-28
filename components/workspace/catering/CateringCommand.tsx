"use client";

// ── Catering Command ──────────────────────────────────────────────────────
// The landing surface, reworked as a working desk. Reads the full
// catering state and produces three digest columns that answer:
//   - What's waiting on the couple?
//   - What's waiting on the vendor?
//   - What's waiting on the planner?
// Plus a compact "in-flight" strip up top and an open-threads section
// for unresolved comments/questions across every tab. Budget lives on
// the right rail but is visually demoted — it's sidebar context, not
// the headline. "Generate Brief" has moved to a secondary action.

import { useMemo, useState } from "react";
import {
  ArrowRight,
  HandHeart,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCateringStore } from "@/stores/catering-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { useFinanceStore } from "@/stores/finance-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  buildPartyMap,
} from "@/lib/catering/parties";
import type {
  CommandBrief,
  NextAction,
  OpenQuestion,
  PartyId,
} from "@/types/catering";
import {
  Attribution,
  FlowItem,
  InFlightStrip,
  PartyAvatar,
  PartyAvatars,
  PresenceIndicator,
  StatePill,
  SubHeader,
  TabHeader,
  WaitingOnBadge,
} from "./shared/collab";

interface CateringCommandProps {
  weddingId?: string;
}

// The demo assumes the planner is viewing. A later increment can wire
// this to an actual auth/role selector.
const CURRENT_PARTY: PartyId = URVASHI_ID;

export function CateringCommand({
  weddingId = DEMO_WEDDING_ID,
}: CateringCommandProps) {
  // ── Store ────────────────────────────────────────────────────────────────
  const allEvents = useCateringStore((s) => s.events);
  const moments = useCateringStore((s) => s.moments);
  const dishes = useCateringStore((s) => s.dishes);
  const proposals = useCateringStore((s) => s.proposals);
  const assessments = useCateringStore((s) => s.assessments);
  const tasting_visits = useCateringStore((s) => s.tasting_visits);
  const staff_slots = useCateringStore((s) => s.staff_slots);
  const rental_items = useCateringStore((s) => s.rental_items);
  const reactions = useCateringStore((s) => s.reactions);
  const comments = useCateringStore((s) => s.comments);
  const open_questions = useCateringStore((s) => s.open_questions);
  const presence = useCateringStore((s) => s.presence);
  const command_brief = useCateringStore((s) => s.command_brief);
  const setCommandBrief = useCateringStore((s) => s.setCommandBrief);
  const setSelectedEvent = useCateringStore((s) => s.setSelectedEvent);

  const vendors = useVendorsStore((s) => s.vendors);
  const finance_budgets = useFinanceStore((s) => s.budgets);
  const finance_invoices = useFinanceStore((s) => s.invoices);

  // Events + party map
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

  // Digest queues — computed from state.
  const waitingOnCouple = useMemo(() => {
    const items: FlowItem[] = [];
    // Dishes vendors have proposed that the couple hasn't reacted to
    for (const d of dishes) {
      if (d.state !== "vendor_proposed") continue;
      const rx = reactions.filter(
        (r) =>
          r.entity_kind === "dish" &&
          r.entity_id === d.id &&
          (r.party_id === PRIYA_ID || r.party_id === ARJUN_ID),
      );
      if (rx.length > 0) continue;
      const moment = moments.find((m) => m.id === d.moment_id);
      const event = events.find((e) => e.id === moment?.event_id);
      items.push({
        id: `wc-dish-${d.id}`,
        label: `React to ${d.name}`,
        hint: event ? `${event.label} · proposed by ${partyMap[d.added_by ?? ""]?.display_name ?? "vendor"}` : undefined,
        state: "vendor_proposed",
        waiting_on: PRIYA_ID,
        onClick: () => event && setSelectedEvent(event.id),
      });
    }
    // In-debate dishes where a couple member hasn't weighed in
    for (const d of dishes) {
      if (d.state !== "in_debate") continue;
      const partiesWhoReacted = new Set(
        reactions
          .filter((r) => r.entity_kind === "dish" && r.entity_id === d.id)
          .map((r) => r.party_id),
      );
      const missingFromCouple = [PRIYA_ID, ARJUN_ID].filter(
        (p) => !partiesWhoReacted.has(p),
      );
      if (missingFromCouple.length === 0) continue;
      const moment = moments.find((m) => m.id === d.moment_id);
      const event = events.find((e) => e.id === moment?.event_id);
      items.push({
        id: `wc-debate-${d.id}`,
        label: `Weigh in on ${d.name}`,
        hint: event ? `${event.label} · in debate` : "in debate",
        state: "in_debate",
        waiting_on: missingFromCouple[0],
        onClick: () => event && setSelectedEvent(event.id),
      });
    }
    return items;
  }, [dishes, reactions, moments, events, partyMap, setSelectedEvent]);

  const waitingOnVendor = useMemo(() => {
    const items: FlowItem[] = [];
    // Open questions addressed to a vendor that haven't been answered
    for (const q of open_questions) {
      if (q.answered_at) continue;
      const party = partyMap[q.for_party];
      if (!party || party.role !== "vendor") continue;
      const days = daysSince(q.created_at);
      items.push({
        id: `wv-q-${q.id}`,
        label: truncate(q.body, 70),
        hint: `${party.display_name} · ${days}d since asked`,
        state: "blocked",
        waiting_on: q.for_party,
      });
    }
    // Proposals status=requested
    for (const p of proposals) {
      if (p.status !== "requested") continue;
      const event = events.find((e) => e.id === p.event_id);
      const catererName = catererNameMap[p.caterer_id] ?? "Caterer";
      const days = daysSince(p.requested_at ?? p.received_at ?? p.notes ?? "");
      items.push({
        id: `wv-p-${p.id}`,
        label: `${catererName} — ${event?.label ?? "event"} quote`,
        hint: "Proposal requested, not received",
        state: "blocked",
        waiting_on: p.caterer_id,
      });
    }
    return items;
  }, [open_questions, proposals, events, partyMap, catererNameMap]);

  const waitingOnPlanner = useMemo(() => {
    const items: FlowItem[] = [];
    // Events with no received proposal — planner owns closing this
    for (const ev of events) {
      const received = proposals.filter(
        (p) => p.event_id === ev.id && p.status === "received",
      );
      if (received.length > 0) continue;
      items.push({
        id: `wp-no-proposal-${ev.id}`,
        label: `${ev.label} has no received proposal`,
        hint: `${ev.guest_count} guests · ${ev.cuisine_direction}`,
        state: "blocked",
        waiting_on: URVASHI_ID,
        onClick: () => setSelectedEvent(ev.id),
      });
    }
    // Tastings with no synthesis
    for (const v of tasting_visits) {
      if (v.synthesis) continue;
      const caterer = catererNameMap[v.caterer_id] ?? "caterer";
      items.push({
        id: `wp-synth-${v.id}`,
        label: `Synthesize ${caterer} tasting`,
        hint: v.date,
        state: "draft",
        waiting_on: URVASHI_ID,
      });
    }
    return items;
  }, [events, proposals, tasting_visits, catererNameMap, setSelectedEvent]);

  // Open threads — unresolved comments + questions across the workspace
  const openThreads = useMemo(() => {
    const fromComments = comments
      .filter((c) => !c.resolved_at)
      .map((c) => {
        const partyName =
          partyMap[c.party_id]?.display_name ?? c.party_id;
        const scope = entityLabel(c.entity_kind, c.entity_id, dishes, proposals);
        return {
          id: c.id,
          kind: "comment" as const,
          partyId: c.party_id,
          body: c.body,
          scope,
          when: c.created_at,
        };
      });
    const fromQuestions = open_questions
      .filter((q) => !q.answered_at)
      .map((q) => {
        return {
          id: q.id,
          kind: "question" as const,
          partyId: q.raised_by,
          body: q.body,
          scope: entityLabel(q.entity_kind, q.entity_id, dishes, proposals, catererNameMap),
          when: q.created_at,
          for_party: q.for_party,
        };
      });
    return [...fromComments, ...fromQuestions].sort((a, b) =>
      b.when.localeCompare(a.when),
    );
  }, [comments, open_questions, partyMap, dishes, proposals, catererNameMap]);

  // In-flight strip = top 5 items across all waiting-on queues
  const inFlight: FlowItem[] = useMemo(() => {
    return [
      ...waitingOnCouple,
      ...waitingOnVendor,
      ...waitingOnPlanner,
    ].slice(0, 6);
  }, [waitingOnCouple, waitingOnVendor, waitingOnPlanner]);

  // ── Budget (demoted rail) ───────────────────────────────────────────────
  const cateringBudget = finance_budgets.find(
    (b) => b.category_id === "catering",
  );
  const allocated_cents = cateringBudget?.allocated_cents ?? 0;
  const committed_cents = finance_invoices
    .filter((i) => i.category_id === "catering")
    .filter((i) => ["approved", "paid", "overdue"].includes(i.status))
    .reduce((n, i) => n + i.amount_cents, 0);
  const runway_cents = Math.max(allocated_cents - committed_cents, 0);
  const pct =
    allocated_cents > 0
      ? Math.min(Math.round((committed_cents / allocated_cents) * 100), 999)
      : 0;

  // ── Brief generation (now a secondary action) ───────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  async function refreshBrief() {
    setRefreshing(true);
    setBriefError(null);
    try {
      const res = await fetch("/api/catering/command-brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wedding_id: weddingId,
          today: new Date().toISOString().slice(0, 10),
          events,
          moments,
          dishes,
          proposals: proposals.filter((p) => p.wedding_id === weddingId),
          assessments,
          tasting_visits,
          staff_slots,
          caterer_names: catererNameMap,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        brief?: Omit<CommandBrief, "id">;
        error?: string;
      };
      if (!data.ok || !data.brief) {
        setBriefError(data.error ?? "Brief generation failed.");
        return;
      }
      setCommandBrief({ ...data.brief, id: `cb-${Date.now()}` });
    } catch (err) {
      setBriefError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setRefreshing(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_260px] overflow-hidden bg-white">
      <section className="flex min-w-0 flex-col overflow-hidden">
        <TabHeader
          eyebrow="Catering · Command"
          title="The working desk"
          subtitle={`${waitingOnCouple.length} waiting on you · ${waitingOnVendor.length} on vendors · ${waitingOnPlanner.length} on Urvashi`}
          right={<PresenceIndicator signals={presence} partyMap={partyMap} />}
        />

        <div className="flex-1 space-y-5 overflow-y-auto px-7 py-4">
          {/* In-flight strip */}
          <section>
            <SubHeader
              label="In flight right now"
              count={inFlight.length}
            />
            <InFlightStrip
              items={inFlight}
              partyMap={partyMap}
              emptyMessage="Nothing in flight — everyone has what they need."
            />
          </section>

          {/* Three waiting-on columns */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <WaitingQueue
              eyebrow="Waiting on you"
              who={[PRIYA_ID, ARJUN_ID]}
              items={waitingOnCouple}
              partyMap={partyMap}
              emptyText="Nothing needs a couple reaction right now."
              primaryCta={{
                label: "Open Menu Studio",
                icon: <ArrowRight size={11} strokeWidth={1.8} />,
              }}
            />
            <WaitingQueue
              eyebrow="Waiting on vendors"
              who={resolveVendorIds(waitingOnVendor, partyMap)}
              items={waitingOnVendor}
              partyMap={partyMap}
              emptyText="No open asks to a vendor."
              primaryCta={{
                label: "Send nudge",
                icon: <Send size={11} strokeWidth={1.8} />,
              }}
            />
            <WaitingQueue
              eyebrow="Waiting on Urvashi"
              who={[URVASHI_ID]}
              items={waitingOnPlanner}
              partyMap={partyMap}
              emptyText="Planner desk is clear."
              primaryCta={{
                label: "Open to-do",
                icon: <HandHeart size={11} strokeWidth={1.8} />,
              }}
            />
          </section>

          {/* Open threads */}
          <section>
            <SubHeader
              icon={<MessageSquare size={12} strokeWidth={1.8} />}
              label="Open threads"
              count={openThreads.length}
              right={
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  unresolved across all tabs
                </span>
              }
            />
            {openThreads.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-3 text-[11.5px] text-ink-muted">
                Nothing open. When someone comments or asks a question, it'll
                surface here until someone resolves it.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border bg-white">
                {openThreads.slice(0, 8).map((t) => {
                  const party = partyMap[t.partyId];
                  return (
                    <li
                      key={`${t.kind}-${t.id}`}
                      className="flex items-start gap-3 px-3 py-2"
                    >
                      {party && <PartyAvatar party={party} size="sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] leading-snug text-ink">
                          <span className="font-medium">
                            {party?.display_name ?? t.partyId}
                          </span>{" "}
                          <span className="text-ink-muted">{t.body}</span>
                        </p>
                        <p
                          className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {t.kind === "question" ? "question · " : "comment · "}
                          {t.scope} · {relTime(t.when)}
                          {t.kind === "question" && "for_party" in t && (
                            <>
                              {" · for "}
                              {partyMap[t.for_party!]?.display_name ?? t.for_party}
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Secondary: AI brief (demoted from hero) */}
          <section className="rounded-md border border-border bg-ivory-warm/30 px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Sparkles size={10} strokeWidth={2} />
                  AI ranked brief
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  Secondary pass on what to focus on — ranked by impact across the whole catering state.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshBrief}
                disabled={refreshing}
                className={cn(
                  "flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                  refreshing
                    ? "bg-ink-faint/20 text-ink-faint"
                    : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {refreshing ? (
                  "Thinking…"
                ) : command_brief ? (
                  <>
                    <RefreshCw size={10} strokeWidth={2} />
                    Refresh
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
            {briefError && (
              <p className="mt-2 rounded-sm border border-rose/30 bg-rose-pale/20 px-2 py-1 text-[11px] text-rose">
                {briefError}
              </p>
            )}
            {command_brief && (
              <ol className="mt-2 space-y-1.5">
                {command_brief.actions.map((a, i) => (
                  <BriefAction key={a.id} action={a} index={i + 1} />
                ))}
              </ol>
            )}
          </section>
        </div>
      </section>

      {/* Demoted budget rail */}
      <aside className="flex h-full flex-col overflow-hidden border-l border-border bg-ivory-warm/20">
        <div className="border-b border-border px-4 py-3">
          <p
            className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Wallet size={9} strokeWidth={1.8} />
            Budget
          </p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {allocated_cents === 0 ? (
            <p className="text-[11px] leading-relaxed text-ink-muted">
              No catering budget allocated yet. Set one in Finance.
            </p>
          ) : (
            <>
              <div>
                <p
                  className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Committed
                </p>
                <p
                  className="mt-0.5 font-mono text-[16px] tabular-nums text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCents(committed_cents)}
                </p>
              </div>
              <div>
                <p
                  className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Allocated
                </p>
                <p
                  className="mt-0.5 font-mono text-[16px] tabular-nums text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCents(allocated_cents)}
                </p>
              </div>
              <div>
                <p
                  className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Runway
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-mono text-[16px] tabular-nums",
                    runway_cents < allocated_cents * 0.1 ? "text-rose" : "text-ink",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCents(runway_cents)}
                </p>
              </div>
              <div>
                <div className="h-1 overflow-hidden rounded-full bg-ink-faint/10">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct > 100 ? "bg-rose" : pct > 80 ? "bg-saffron" : "bg-sage",
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p
                  className="mt-1 font-mono text-[9px] tabular-nums text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {pct}% committed
                </p>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Waiting queue ────────────────────────────────────────────────────────

function WaitingQueue({
  eyebrow,
  who,
  items,
  partyMap,
  emptyText,
  primaryCta,
}: {
  eyebrow: string;
  who: PartyId[];
  items: FlowItem[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
  emptyText: string;
  primaryCta?: { label: string; icon: React.ReactNode };
}) {
  return (
    <section className="rounded-md border border-border bg-white p-3">
      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PartyAvatars partyIds={who} partyMap={partyMap} size="sm" />
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
        </div>
        <span
          className="font-mono text-[11px] tabular-nums text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {items.length}
        </span>
      </header>
      {items.length === 0 ? (
        <p className="rounded-sm bg-ivory-warm/30 px-2 py-2 text-[11px] text-ink-muted">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 5).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={item.onClick}
                disabled={!item.onClick}
                className={cn(
                  "group flex w-full items-start gap-2 rounded-sm border border-transparent px-1.5 py-1 text-left transition-colors",
                  item.onClick ? "hover:border-border hover:bg-ivory-warm/40" : "cursor-default",
                )}
              >
                <StatePill state={item.state} tight />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] leading-snug text-ink">
                    {item.label}
                  </p>
                  {item.hint && (
                    <p className="text-[10px] leading-snug text-ink-muted">
                      {item.hint}
                    </p>
                  )}
                </div>
                {item.waiting_on && (
                  <PartyAvatar
                    party={partyMap[item.waiting_on]!}
                    size="sm"
                  />
                )}
              </button>
            </li>
          ))}
          {items.length > 5 && (
            <li
              className="pl-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              + {items.length - 5} more
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

// ── Brief action row (secondary CTA output) ──────────────────────────────

function BriefAction({ action, index }: { action: NextAction; index: number }) {
  const tone =
    action.severity === "blocker"
      ? "border-rose/30"
      : action.severity === "soon"
        ? "border-saffron/30"
        : "border-border";
  return (
    <li className={cn("rounded-sm border bg-white px-2.5 py-1.5", tone)}>
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-ink font-mono text-[9px] tabular-nums text-ivory"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium leading-snug text-ink">
            {action.title}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
            {action.reason}
          </p>
        </div>
        <span
          className={cn(
            "flex-none rounded-sm px-1 py-px font-mono text-[8.5px] uppercase tracking-[0.08em]",
            action.severity === "blocker"
              ? "bg-rose/80 text-white"
              : action.severity === "soon"
                ? "bg-saffron/80 text-white"
                : "bg-ink-faint/20 text-ink-muted",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {action.severity}
        </span>
      </div>
    </li>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}k`;
  return `$${dollars.toFixed(0)}`;
}

function daysSince(iso: string): number {
  try {
    const then = new Date(iso).getTime();
    if (isNaN(then)) return 0;
    return Math.max(0, Math.round((Date.now() - then) / (24 * 3600 * 1000)));
  } catch {
    return 0;
  }
}

function relTime(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "today";
  if (d === 1) return "1d ago";
  return `${d}d ago`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

function entityLabel(
  kind: string,
  id: string,
  dishes: import("@/types/catering").Dish[],
  proposals: import("@/types/catering").CatererProposal[],
  catererNames?: Record<string, string>,
): string {
  if (kind === "dish") {
    const d = dishes.find((x) => x.id === id);
    return d ? `dish · ${d.name}` : `dish · ${id}`;
  }
  if (kind === "proposal") {
    const p = proposals.find((x) => x.id === id);
    return p
      ? `proposal · ${catererNames?.[p.caterer_id] ?? p.caterer_id}`
      : `proposal · ${id}`;
  }
  if (kind === "caterer") {
    return `caterer · ${catererNames?.[id] ?? id}`;
  }
  return `${kind} · ${id.slice(0, 8)}`;
}

function resolveVendorIds(
  items: FlowItem[],
  partyMap: Record<PartyId, import("@/types/catering").Party>,
): PartyId[] {
  const ids = new Set<PartyId>();
  for (const i of items) {
    if (!i.waiting_on) continue;
    const p = partyMap[i.waiting_on];
    if (p?.role === "vendor") ids.add(i.waiting_on);
  }
  return Array.from(ids);
}
