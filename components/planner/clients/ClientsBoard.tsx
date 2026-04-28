"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { PLANNER_PALETTE, PlannerCard } from "@/components/planner/ui";
import {
  CLIENT_CARDS,
  PIPELINE_STAGES,
  CONVERSION_FUNNEL,
  AVG_TIME_IN_STAGE,
  TOP_SOURCES,
  WIN_RATE,
  type CoupleCard,
  type PipelineStage,
  fullName,
} from "@/lib/planner/clients-seed";
import InviteCoupleModal from "./InviteCoupleModal";
import CoupleDetailPanel from "./CoupleDetailPanel";
import FollowUpModal from "./FollowUpModal";

export default function ClientsBoard() {
  const [cards, setCards] = useState<CoupleCard[]>(CLIENT_CARDS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [followUpFor, setFollowUpFor] = useState<CoupleCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStage = useMemo(() => {
    const map: Record<PipelineStage, CoupleCard[]> = {
      inquiry: [],
      consultation: [],
      proposal: [],
      active: [],
      completed: [],
    };
    for (const c of cards) map[c.stage].push(c);
    return map;
  }, [cards]);

  const selected = selectedId ? cards.find((c) => c.id === selectedId) : null;
  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;

    // Dropping onto column container: over.id is the stage key
    const overStage = PIPELINE_STAGES.find((s) => s.id === over.id);
    if (overStage && activeCard.stage !== overStage.id) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeCard.id ? { ...c, stage: overStage.id } : c,
        ),
      );
      return;
    }

    // Dropping onto another card
    const overCard = cards.find((c) => c.id === over.id);
    if (overCard && overCard.stage !== activeCard.stage) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeCard.id ? { ...c, stage: overCard.stage } : c,
        ),
      );
    }
  }

  function moveForward(card: CoupleCard) {
    const order: PipelineStage[] = [
      "inquiry",
      "consultation",
      "proposal",
      "active",
      "completed",
    ];
    const idx = order.indexOf(card.stage);
    if (idx < 0 || idx >= order.length - 1) return;
    const next = order[idx + 1];
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, stage: next } : c)),
    );
  }

  return (
    <>
      {/* Header row */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Client pipeline
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Clients
          </h1>
          <p
            className="mt-1.5 text-[14px] text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
          >
            3 inquiries
            <Divider />2 consultations
            <Divider />1 proposal
            <Divider />8 active
            <Divider />
            22 completed this year
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-[#FAF8F5] shadow-sm transition-transform hover:-translate-y-px"
          style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
        >
          <span className="text-[#C4A265]" aria-hidden>
            ✉
          </span>
          Invite New Couple
        </button>
      </section>

      {/* Analytics strip */}
      <AnalyticsStrip />

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <section className="mt-10 -mx-4 overflow-x-auto px-4 pb-4">
          <div className="flex min-w-max gap-4">
            {PIPELINE_STAGES.map((stage) => (
              <Column
                key={stage.id}
                stageId={stage.id}
                label={stage.label}
                subtitle={stage.subtitle}
                cards={byStage[stage.id]}
                onView={(id) => setSelectedId(id)}
                onMoveForward={moveForward}
                onFollowUp={(c) => setFollowUpFor(c)}
              />
            ))}
          </div>
        </section>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="rotate-1 opacity-95">
              <KanbanCard
                card={activeCard}
                onView={() => {}}
                onMoveForward={() => {}}
                onFollowUp={() => {}}
                dragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showInvite && (
        <InviteCoupleModal onClose={() => setShowInvite(false)} />
      )}

      {selected && (
        <CoupleDetailPanel
          card={selected}
          onClose={() => setSelectedId(null)}
          onInviteToAnanya={() => {
            setSelectedId(null);
            setShowInvite(true);
          }}
        />
      )}

      {followUpFor && (
        <FollowUpModal
          card={followUpFor}
          onClose={() => setFollowUpFor(null)}
        />
      )}
    </>
  );
}

function Divider() {
  return <span className="mx-1.5 text-[#c8b795]">·</span>;
}

// ───────────────────── Analytics strip ─────────────────────

function AnalyticsStrip() {
  return (
    <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
      {/* Funnel */}
      <PlannerCard className="p-5">
        <StripHeader title="Conversion funnel" note="Trailing 12 months" />
        <div className="mt-4 flex items-stretch gap-2">
          {CONVERSION_FUNNEL.map((step, i) => (
            <FunnelBar
              key={step.label}
              label={step.label}
              count={step.count}
              width={100 - i * 18}
              conversion={step.conversionFromPrior}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4 border-t pt-3"
          style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
        >
          <MiniStat label="Avg. inquiry" value={AVG_TIME_IN_STAGE.inquiry} />
          <span className="h-4 w-px" style={{ backgroundColor: PLANNER_PALETTE.hairline }} />
          <MiniStat label="Avg. consult" value={AVG_TIME_IN_STAGE.consultation} />
          <span className="h-4 w-px" style={{ backgroundColor: PLANNER_PALETTE.hairline }} />
          <MiniStat label="Avg. proposal" value={AVG_TIME_IN_STAGE.proposal} />
        </div>
      </PlannerCard>

      {/* Top sources */}
      <PlannerCard className="p-5">
        <StripHeader title="Top inquiry sources" note="Trailing 12 months" />
        <ul className="mt-4 space-y-2.5">
          {TOP_SOURCES.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className="w-[72px] text-[12.5px] text-[#2C2C2C]">
                {s.label}
              </span>
              <div
                className="relative h-[6px] flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${s.pct}%`,
                    backgroundColor: PLANNER_PALETTE.gold,
                  }}
                />
              </div>
              <span className="font-mono text-[11px] text-[#6a6a6a]">
                {s.pct}%
              </span>
            </li>
          ))}
        </ul>
      </PlannerCard>

      {/* Win rate */}
      <PlannerCard className="p-5">
        <StripHeader title="Win rate" note="Proposals → booked" />
        <div className="mt-4 flex items-baseline gap-3">
          <p
            className="text-[44px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            {WIN_RATE.thisQuarter}%
          </p>
          <span
            className="font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{ color: PLANNER_PALETTE.ontrack }}
          >
            {WIN_RATE.delta}
          </span>
        </div>
        <p
          className="mt-3 text-[12.5px] text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
        >
          Up from {WIN_RATE.lastQuarter}% last quarter
        </p>
      </PlannerCard>
    </section>
  );
}

function StripHeader({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {title}
      </p>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#b5a68e]">
        {note}
      </p>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  width,
  conversion,
}: {
  label: string;
  count: number;
  width: number;
  conversion?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-stretch gap-1.5">
      <div
        className="relative grid h-[60px] place-items-center rounded-md transition-transform"
        style={{
          width: `${width}%`,
          marginLeft: `${(100 - width) / 2}%`,
          backgroundColor: "#F5E6D0",
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
        }}
      >
        <span
          className="text-[22px] text-[#2C2C2C]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
          }}
        >
          {count}
        </span>
        {conversion && (
          <span
            className="absolute -top-2 right-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-[#7a5a1a]"
            style={{
              backgroundColor: "#FBF1DF",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.5)",
            }}
          >
            {conversion}
          </span>
        )}
      </div>
      <p className="text-center font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#6a6a6a]">
        {label}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#b5a68e]">
        {label}
      </p>
      <p
        className="mt-0.5 text-[16px] text-[#2C2C2C]"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
      >
        {value}
      </p>
    </div>
  );
}

// ───────────────────── Column + card ─────────────────────

function Column({
  stageId,
  label,
  subtitle,
  cards,
  onView,
  onMoveForward,
  onFollowUp,
}: {
  stageId: PipelineStage;
  label: string;
  subtitle: string;
  cards: CoupleCard[];
  onView: (id: string) => void;
  onMoveForward: (c: CoupleCard) => void;
  onFollowUp: (c: CoupleCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });
  const columnTone: Record<PipelineStage, string> = {
    inquiry: "#E8D5D0",
    consultation: "#F5E6D0",
    proposal: "#FBE4C2",
    active: "#D8E8D4",
    completed: "#E3DDD1",
  };

  return (
    <div className="flex w-[304px] shrink-0 flex-col">
      {/* Column header */}
      <div
        className="mb-3 flex items-center justify-between rounded-xl px-4 py-3"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: columnTone[stageId] }}
          />
          <div>
            <p
              className="text-[16px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {label}
            </p>
            <p
              className="mt-1 text-[10.5px] text-[#8a8a8a]"
              style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <span
          className="grid h-6 min-w-6 place-items-center rounded-full px-2 font-mono text-[10.5px] text-[#7a5a1a]"
          style={{
            backgroundColor: "#FBF1DF",
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
          }}
        >
          {cards.length}
        </span>
      </div>

      {/* Drop area */}
      <div
        ref={setNodeRef}
        className="flex-1 rounded-2xl p-2 transition-colors"
        style={{
          backgroundColor: isOver ? "#FBF1DF" : "rgba(44,44,44,0.02)",
          minHeight: 400,
          boxShadow: isOver
            ? "inset 0 0 0 1px rgba(196,162,101,0.5)"
            : "inset 0 0 0 1px rgba(44,44,44,0.04)",
        }}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2.5">
            {cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onView={() => onView(card.id)}
                onMoveForward={() => onMoveForward(card)}
                onFollowUp={() => onFollowUp(card)}
              />
            ))}
            {cards.length === 0 && (
              <div
                className="grid h-24 place-items-center rounded-xl text-[11px] italic text-[#b5a68e]"
                style={{
                  border: "1px dashed rgba(196,162,101,0.35)",
                  fontFamily: "'EB Garamond', serif",
                }}
              >
                Drop a card here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function SortableCard({
  card,
  onView,
  onMoveForward,
  onFollowUp,
}: {
  card: CoupleCard;
  onView: () => void;
  onMoveForward: () => void;
  onFollowUp: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard
        card={card}
        onView={onView}
        onMoveForward={onMoveForward}
        onFollowUp={onFollowUp}
      />
    </div>
  );
}

function KanbanCard({
  card,
  onView,
  onMoveForward,
  onFollowUp,
  dragging,
}: {
  card: CoupleCard;
  onView: () => void;
  onMoveForward: () => void;
  onFollowUp: () => void;
  dragging?: boolean;
}) {
  return (
    <div
      className="rounded-xl bg-white p-4 transition-shadow"
      style={{
        boxShadow: dragging
          ? "0 20px 40px -18px rgba(44,44,44,0.35)"
          : "0 1px 0 rgba(44,44,44,0.03), 0 10px 24px -22px rgba(44,44,44,0.25)",
        border: `1px solid ${PLANNER_PALETTE.hairline}`,
      }}
    >
      {/* Names */}
      <h3
        className="text-[19px] leading-tight text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.005em",
        }}
      >
        {fullName(card)}
      </h3>

      {/* Key metadata */}
      <div className="mt-1.5 text-[12px] leading-[1.5] text-[#5a5a5a]">
        <p className="text-[#2C2C2C]">{card.weddingDateDisplay}</p>
        <p>
          {card.destination && (
            <span className="mr-1" aria-hidden>
              ✈
            </span>
          )}
          {card.location}
          <span className="mx-1.5 text-[#b5a68e]">·</span>
          {card.guestCount} guests
        </p>
        <p>
          {card.weddingType}
          <span className="mx-1.5 text-[#b5a68e]">·</span>
          {card.eventDays}-day
        </p>
        {card.stage !== "active" && card.stage !== "completed" && (
          <p>
            <span className="text-[#8a8a8a]">Budget:</span> {card.budget}
          </p>
        )}
      </div>

      {/* Stage-specific band */}
      <StageBand card={card} />

      {/* Active card gets progress bar */}
      {card.stage === "active" &&
        typeof card.vendorsBooked === "number" &&
        typeof card.vendorsTotal === "number" && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                {card.vendorsBooked}/{card.vendorsTotal} vendors
              </span>
              <span className="font-mono text-[11px] text-[#2C2C2C]">
                {card.percentComplete}%
              </span>
            </div>
            <div
              className="mt-1.5 h-[5px] overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${card.percentComplete ?? 0}%`,
                  backgroundColor: PLANNER_PALETTE.ontrack,
                }}
              />
            </div>
          </div>
        )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <CardButton onClick={onView} variant="ghost" label="View" />
        {card.stage === "proposal" && (
          <CardButton
            onClick={onFollowUp}
            variant="accent"
            label="Follow up"
          />
        )}
        {card.stage === "active" ? (
          <Link
            href={`/planner/weddings/${card.id}`}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-medium text-[#FAF8F5] transition-colors"
            style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Open Wedding <span aria-hidden>→</span>
          </Link>
        ) : card.stage === "completed" ? (
          <CardButton
            onClick={() => alert(`Review request sent to ${fullName(card)}.`)}
            variant="ghost"
            label="Request Review"
          />
        ) : (
          <CardButton
            onClick={onMoveForward}
            variant="ghost"
            label="Move →"
          />
        )}
      </div>
    </div>
  );
}

function CardButton({
  onClick,
  label,
  variant,
}: {
  onClick: () => void;
  label: string;
  variant: "ghost" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={
        variant === "accent"
          ? "inline-flex items-center rounded-full px-3 py-1.5 text-[11.5px] font-medium text-[#7a5a1a] transition-colors"
          : "inline-flex items-center rounded-full px-3 py-1.5 text-[11.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
      }
      style={
        variant === "accent"
          ? {
              backgroundColor: "#FBF1DF",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.5)",
            }
          : { backgroundColor: "rgba(44,44,44,0.03)" }
      }
    >
      {label}
    </button>
  );
}

function StageBand({ card }: { card: CoupleCard }) {
  if (card.stage === "inquiry") {
    return (
      <div
        className="mt-3 border-t pt-2.5 text-[11.5px] text-[#5a5a5a]"
        style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
      >
        <p>
          <span className="text-[#8a8a8a]">Source:</span> {card.source}
          {card.sourceNote && (
            <span className="italic text-[#8a8a8a]"> ({card.sourceNote})</span>
          )}
        </p>
        <p
          className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]"
        >
          Received {card.receivedDaysAgo}d ago
        </p>
      </div>
    );
  }

  if (card.stage === "consultation") {
    const tone = card.consultDone
      ? PLANNER_PALETTE.ontrack
      : card.consultDaysAway !== undefined && card.consultDaysAway <= 3
        ? PLANNER_PALETTE.warning
        : PLANNER_PALETTE.gold;
    return (
      <div
        className="mt-3 border-t pt-2.5 text-[11.5px] text-[#5a5a5a]"
        style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
      >
        <p className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tone }}
          />
          <span className="text-[#8a8a8a]">Consult:</span>
          <span className="text-[#2C2C2C]">{card.consultDate}</span>
          {card.consultDone ? (
            <span className="text-[#27AE60]">✓</span>
          ) : (
            card.consultDaysAway !== undefined && (
              <span className="italic text-[#8a8a8a]">
                (in {card.consultDaysAway} days)
              </span>
            )
          )}
        </p>
      </div>
    );
  }

  if (card.stage === "proposal") {
    return (
      <div
        className="mt-3 border-t pt-2.5 text-[11.5px] text-[#5a5a5a]"
        style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
      >
        <p>
          <span className="text-[#8a8a8a]">Proposal sent:</span>{" "}
          <span className="text-[#2C2C2C]">Oct 1</span>
          <span className="italic text-[#8a8a8a]"> ({card.proposalSentDaysAgo}d ago)</span>
        </p>
        {card.proposalNoResponse && (
          <p
            className="mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium"
            style={{
              backgroundColor: "rgba(230, 126, 34, 0.12)",
              color: "#9E5414",
            }}
          >
            <span aria-hidden>⚠</span> No response yet
          </p>
        )}
      </div>
    );
  }

  if (card.stage === "completed") {
    return (
      <div
        className="mt-3 border-t pt-2.5 text-[11.5px] text-[#5a5a5a]"
        style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
      >
        <p>
          <span className="text-[#8a8a8a]">Venue:</span>{" "}
          <span className="text-[#2C2C2C]">{card.venue}</span>
        </p>
        <p
          className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: PLANNER_PALETTE.ontrack }}
        >
          ✓ Completed · {card.completedDateDisplay}
        </p>
      </div>
    );
  }

  // active
  return (
    <div
      className="mt-3 border-t pt-2.5 text-[11.5px] text-[#5a5a5a]"
      style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
    >
      <p>
        <span className="text-[#8a8a8a]">Venue:</span>{" "}
        <span className="text-[#2C2C2C]">{card.venue}</span>
      </p>
    </div>
  );
}
