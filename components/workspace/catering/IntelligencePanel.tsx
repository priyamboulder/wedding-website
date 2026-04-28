"use client";

// ── Menu Studio intelligence panel ────────────────────────────────────────
// Right column of the Menu Studio. Three stacked sections:
//   1. Live read — moment count, dish count, veg ratio, spice histogram.
//   2. Dietary coverage per requirement the guest list actually has.
//   3. AI pending-edit queue — accept/reject/edit review of each edit.
//
// All AI mutations flow through here; the menu board is read-only w.r.t.
// AI output.

import { useState } from "react";
import { AlertTriangle, Check, HelpCircle, Info, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DietaryFlag,
  EventDietaryTotals,
  MenuIntelligence,
  OpenQuestion,
  Party,
  PartyId,
  PendingEdit,
} from "@/types/catering";
import { dietaryLabel } from "@/lib/catering/intelligence";
import { PartyAvatar } from "./shared/collab";

interface IntelligencePanelProps {
  intelligence: MenuIntelligence;
  dietary: EventDietaryTotals | undefined;
  pendingEdits: PendingEdit[];
  onAcceptEdit: (id: string) => void;
  onRejectEdit: (id: string) => void;
  isThinking: boolean;
  lastRationale: string | null;
  // Questions for the caterer currently active on this event
  eventCatererId: string | null;
  openQuestions: OpenQuestion[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onAskQuestion: (body: string, forParty: PartyId) => void;
}

export function IntelligencePanel({
  intelligence,
  dietary,
  pendingEdits,
  onAcceptEdit,
  onRejectEdit,
  isThinking,
  lastRationale,
  eventCatererId,
  openQuestions,
  partyMap,
  currentPartyId,
  onAskQuestion,
}: IntelligencePanelProps) {
  return (
    <aside className="flex h-full flex-col overflow-hidden border-l border-gold/15 bg-ivory-warm/20">
      <header className="border-b border-gold/15 px-5 py-4">
        <p
          className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={10} strokeWidth={2} />
          Menu intelligence
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink-muted">
          Live read on this event's menu. Updates as you edit.
        </p>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <LiveRead intelligence={intelligence} />
        <DietaryCoverage intelligence={intelligence} dietary={dietary} />
        <FlagFeed intelligence={intelligence} />
        <QuestionsForCaterer
          catererId={eventCatererId}
          openQuestions={openQuestions}
          partyMap={partyMap}
          currentPartyId={currentPartyId}
          onAsk={onAskQuestion}
        />
        <PendingQueue
          edits={pendingEdits}
          isThinking={isThinking}
          rationale={lastRationale}
          onAccept={onAcceptEdit}
          onReject={onRejectEdit}
        />
      </div>
    </aside>
  );
}

// ── Questions for the caterer ────────────────────────────────────────────

function QuestionsForCaterer({
  catererId,
  openQuestions,
  partyMap,
  currentPartyId,
  onAsk,
}: {
  catererId: string | null;
  openQuestions: OpenQuestion[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onAsk: (body: string, forParty: PartyId) => void;
}) {
  const [draft, setDraft] = useState("");

  if (!catererId) return null;
  const catererName =
    partyMap[catererId]?.display_name ?? "the caterer";

  function post() {
    const body = draft.trim();
    if (!body) return;
    onAsk(body, catererId!);
    setDraft("");
  }

  return (
    <section>
      <SectionTitle>
        <HelpCircle
          size={10}
          strokeWidth={2}
          className="mr-1 inline text-saffron"
        />
        Questions for {catererName}
      </SectionTitle>

      {openQuestions.length === 0 ? (
        <p className="mt-2 text-[11px] italic text-ink-faint">
          No open questions. As dietary gaps or service ambiguities surface,
          ask here — they appear in the caterer's inbox.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {openQuestions.map((q) => {
            const raiser = partyMap[q.raised_by];
            const answered = !!q.answered_at;
            return (
              <li
                key={q.id}
                className={cn(
                  "rounded-sm border px-2 py-1.5",
                  answered
                    ? "border-sage/30 bg-sage-pale/20"
                    : "border-saffron/30 bg-saffron-pale/20",
                )}
              >
                <div className="flex items-start gap-1.5">
                  {raiser && <PartyAvatar party={raiser} size="sm" />}
                  <p className="flex-1 text-[11px] leading-snug text-ink">
                    {q.body}
                  </p>
                </div>
                {answered && q.answer && (
                  <p className="mt-1 border-l-2 border-sage/50 pl-2 text-[10.5px] leading-snug text-ink-muted">
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
      )}

      {/* Ask a new question */}
      <div className="mt-2 flex items-center gap-1.5">
        <PartyAvatar party={partyMap[currentPartyId]!} size="sm" />
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
          placeholder={`Ask ${catererName}…`}
          className="flex-1 rounded-sm border border-border bg-white px-1.5 py-1 text-[11px] text-ink outline-none placeholder:text-ink-faint focus:border-saffron/40"
        />
        <button
          type="button"
          onClick={post}
          disabled={!draft.trim()}
          className={cn(
            "rounded-sm px-1.5 py-1",
            draft.trim()
              ? "bg-ink text-ivory"
              : "bg-ink-faint/20 text-ink-faint",
          )}
          aria-label="Send question"
        >
          <Send size={10} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}

// ── Live read ─────────────────────────────────────────────────────────────

function LiveRead({ intelligence }: { intelligence: MenuIntelligence }) {
  return (
    <section>
      <SectionTitle>Live read</SectionTitle>
      <dl className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="Moments" value={intelligence.moment_count} />
        <Stat label="Dishes" value={intelligence.dish_count} />
        <Stat
          label="Veg ratio"
          value={`${Math.round(intelligence.veg_ratio * 100)}%`}
        />
        <Stat
          label="Heat avg"
          value={formatHeatAvg(intelligence.spice_distribution, intelligence.dish_count)}
        />
      </dl>
      {intelligence.repeated_dishes.length > 0 && (
        <div className="mt-3 rounded-md border border-gold/20 bg-white/60 px-3 py-2">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Cross-event repeats
          </p>
          <ul className="mt-1 space-y-0.5">
            {intelligence.repeated_dishes.map((r) => (
              <li key={r.dish_name} className="text-[11.5px] text-ink-muted">
                <span className="text-ink">{r.dish_name}</span>
                <span className="text-ink-faint"> · also {r.event_labels.join(", ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2">
      <dt
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-0.5 font-mono text-[16px] tabular-nums text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </dd>
    </div>
  );
}

function formatHeatAvg(
  dist: MenuIntelligence["spice_distribution"],
  total: number,
): string {
  if (total === 0) return "—";
  const weighted = Object.entries(dist).reduce(
    (s, [k, n]) => s + Number(k) * n,
    0,
  );
  const avg = weighted / total;
  return avg.toFixed(1);
}

// ── Dietary coverage ──────────────────────────────────────────────────────

function DietaryCoverage({
  intelligence,
  dietary,
}: {
  intelligence: MenuIntelligence;
  dietary: EventDietaryTotals | undefined;
}) {
  if (!dietary) return null;
  // Show only requirements that actually have guests at this event,
  // plus vegetarian always (as the baseline).
  const rows: Array<{ flag: DietaryFlag; count: number; coverage: number }> = [];
  rows.push({
    flag: "vegetarian",
    count: dietary.counts.vegetarian ?? 0,
    coverage: intelligence.dietary_coverage.vegetarian,
  });
  for (const [flag, count] of Object.entries(dietary.counts)) {
    if (flag === "vegetarian") continue;
    if (!count || count <= 0) continue;
    rows.push({
      flag: flag as DietaryFlag,
      count,
      coverage: intelligence.dietary_coverage[flag as DietaryFlag],
    });
  }

  return (
    <section>
      <SectionTitle>Dietary coverage</SectionTitle>
      <ul className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <li key={r.flag} className="flex items-center gap-3">
            <span className="w-20 text-[11.5px] text-ink">{dietaryLabel(r.flag)}</span>
            <span
              className="w-10 font-mono text-[10px] tabular-nums text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {r.count}
            </span>
            <CoverageBar value={r.coverage} />
            <span
              className={cn(
                "w-10 font-mono text-[10px] tabular-nums text-right",
                r.coverage === 0
                  ? "text-rose"
                  : r.coverage < 0.34
                    ? "text-saffron"
                    : "text-sage",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {Math.round(r.coverage * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoverageBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    value === 0 ? "bg-rose/80" : value < 0.34 ? "bg-saffron/80" : "bg-sage/80";
  return (
    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink-faint/15">
      <span
        className={cn("absolute inset-y-0 left-0 rounded-full", tone)}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

// ── Flag feed ─────────────────────────────────────────────────────────────

function FlagFeed({ intelligence }: { intelligence: MenuIntelligence }) {
  if (intelligence.flags.length === 0) return null;
  return (
    <section>
      <SectionTitle>Risks & gaps</SectionTitle>
      <ul className="mt-2 space-y-2">
        {intelligence.flags.map((f, i) => {
          const Icon =
            f.severity === "risk"
              ? AlertTriangle
              : f.severity === "warn"
                ? AlertTriangle
                : Info;
          const tone =
            f.severity === "risk"
              ? "text-rose"
              : f.severity === "warn"
                ? "text-saffron"
                : "text-ink-muted";
          return (
            <li key={i} className="flex items-start gap-2">
              <Icon
                size={11}
                strokeWidth={2}
                className={cn("mt-0.5 flex-none", tone)}
                aria-hidden
              />
              <p className="text-[11.5px] leading-snug text-ink">{f.message}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Pending edits (AI diff review) ────────────────────────────────────────

function PendingQueue({
  edits,
  isThinking,
  rationale,
  onAccept,
  onReject,
}: {
  edits: PendingEdit[];
  isThinking: boolean;
  rationale: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (!isThinking && edits.length === 0 && !rationale) return null;

  return (
    <section>
      <SectionTitle>AI proposal</SectionTitle>

      {isThinking && (
        <div className="mt-2 rounded-md border border-saffron/25 bg-saffron-pale/20 px-3 py-2">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Thinking…
          </p>
        </div>
      )}

      {rationale && !isThinking && (
        <p className="mt-2 rounded-md border border-gold/20 bg-white/70 px-3 py-2 text-[11.5px] leading-relaxed text-ink-muted italic">
          "{rationale}"
        </p>
      )}

      {edits.length > 0 && (
        <ul className="mt-2 space-y-2">
          {edits.map((e) => (
            <li
              key={e.id}
              className="rounded-md border border-saffron/30 bg-white px-3 py-2.5"
            >
              <p
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {kindLabel(e.kind)}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink">
                {summarizePayload(e)}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted italic">
                {e.reason}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(e.id)}
                  className="flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ivory transition-colors hover:bg-ink-soft"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Check size={10} strokeWidth={2.2} />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onReject(e.id)}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <X size={10} strokeWidth={2.2} />
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function kindLabel(k: PendingEdit["kind"]): string {
  return (
    {
      add_dish: "Add dish",
      update_dish: "Update dish",
      remove_dish: "Remove dish",
      add_moment: "Add moment",
      update_moment: "Update moment",
    } satisfies Record<PendingEdit["kind"], string>
  )[k];
}

function summarizePayload(edit: PendingEdit): string {
  const p = edit.payload;
  switch (p.kind) {
    case "add_dish":
      return `${p.dish.name} → ${p.moment_name}`;
    case "update_dish":
      return `Dish ${p.dish_id.slice(0, 8)}… — ${Object.keys(p.patch).join(", ")}`;
    case "remove_dish":
      return `Remove dish ${p.dish_id.slice(0, 8)}…`;
    case "add_moment":
      return `New moment: ${p.moment.name}`;
    case "update_moment":
      return `Moment ${p.moment_id.slice(0, 8)}… — ${Object.keys(p.patch).join(", ")}`;
  }
}

// ── Section title helper ──────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </h3>
  );
}
