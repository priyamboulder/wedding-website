"use client";

// ── Menu Studio middle canvas (reworked) ──────────────────────────────────
// Event header at top, then lanes:
//   1. Vendor suggested — dishes vendors proposed the couple hasn't
//      reacted to yet. Shown first because they're time-sensitive.
//   2. In debate — dishes where the couple + planner disagree or
//      haven't all weighed in.
//   3. Moment-by-moment — approved / default dishes, grouped by service
//      moment. This is where the settled menu lives.
//
// Every dish card carries attribution (who added it), a state pill,
// reactions from each party, and a collapsible comment thread. A dish
// that says "Priya loves, Arjun unsure, Foodlink confirmed available"
// is visibly distinct from a locked-in dish.

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  GitBranch,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Comment,
  Dish,
  MenuEvent,
  MenuMoment,
  Party,
  PartyId,
  Reaction,
  ReactionKind,
} from "@/types/catering";
import { DIETARY_FLAG_LABEL } from "@/types/catering";
import {
  Attribution,
  CommentThread,
  ReactionBar,
  StatePill,
  SubHeader,
} from "./shared/collab";

interface MenuBoardProps {
  event: MenuEvent;
  moments: MenuMoment[];
  dishesForMoment: (momentId: string) => Dish[];
  allEventDishes: Dish[];
  reactionsFor: (dishId: string) => Reaction[];
  commentsFor: (dishId: string) => Comment[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onToggleReaction: (
    dishId: string,
    kind: ReactionKind,
  ) => void;
  onAddComment: (dishId: string, body: string) => void;
  onSetDishState: (dishId: string, state: Dish["state"]) => void;
  onSuggestForMoment: (moment: MenuMoment) => void;
}

export function MenuBoard({
  event,
  moments,
  dishesForMoment,
  allEventDishes,
  reactionsFor,
  commentsFor,
  partyMap,
  currentPartyId,
  onToggleReaction,
  onAddComment,
  onSetDishState,
  onSuggestForMoment,
}: MenuBoardProps) {
  const vendorSuggested = allEventDishes.filter(
    (d) => d.state === "vendor_proposed",
  );
  const inDebate = allEventDishes.filter((d) => d.state === "in_debate");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <EventHeader event={event} />

      <div className="flex-1 overflow-y-auto px-7 pb-10 pt-4">
        {/* Vendor-suggested lane */}
        {vendorSuggested.length > 0 && (
          <Lane
            title="Vendor suggested"
            icon={<Sparkles size={12} strokeWidth={1.8} />}
            tone="sage"
            hint="The vendor added these. Your reactions set whether they stay."
            count={vendorSuggested.length}
          >
            <DishGrid
              dishes={vendorSuggested}
              moments={moments}
              showMomentLabel
              reactionsFor={reactionsFor}
              commentsFor={commentsFor}
              partyMap={partyMap}
              currentPartyId={currentPartyId}
              onToggleReaction={onToggleReaction}
              onAddComment={onAddComment}
              onSetDishState={onSetDishState}
            />
          </Lane>
        )}

        {/* In-debate lane */}
        {inDebate.length > 0 && (
          <Lane
            title="In debate"
            icon={<GitBranch size={12} strokeWidth={1.8} />}
            tone="rose"
            hint="Three parties disagree or haven't all weighed in."
            count={inDebate.length}
          >
            <DishGrid
              dishes={inDebate}
              moments={moments}
              showMomentLabel
              reactionsFor={reactionsFor}
              commentsFor={commentsFor}
              partyMap={partyMap}
              currentPartyId={currentPartyId}
              onToggleReaction={onToggleReaction}
              onAddComment={onAddComment}
              onSetDishState={onSetDishState}
            />
          </Lane>
        )}

        {/* Moment-by-moment — approved + default */}
        {moments.length === 0 ? (
          <EmptyEventState />
        ) : (
          <section>
            <ol className="flex flex-col gap-5">
              {moments.map((m) => {
                const momentDishes = dishesForMoment(m.id).filter(
                  (d) => d.state !== "vendor_proposed" && d.state !== "in_debate",
                );
                return (
                  <MomentStrip
                    key={m.id}
                    moment={m}
                    dishes={momentDishes}
                    reactionsFor={reactionsFor}
                    commentsFor={commentsFor}
                    partyMap={partyMap}
                    currentPartyId={currentPartyId}
                    onToggleReaction={onToggleReaction}
                    onAddComment={onAddComment}
                    onSetDishState={onSetDishState}
                    onSuggest={() => onSuggestForMoment(m)}
                  />
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Event header ──────────────────────────────────────────────────────────

function EventHeader({ event }: { event: MenuEvent }) {
  return (
    <header className="border-b border-gold/15 bg-white px-7 py-4">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Menu · {event.label}
      </p>
      <h2 className="mt-0.5 font-serif text-[22px] leading-tight text-ink">
        {event.cuisine_direction}
      </h2>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11.5px] text-ink-muted">
        <HeaderStat icon={<Clock size={11} strokeWidth={1.8} />}>
          {formatDate(event.date)}
          {event.start_time && event.end_time
            ? ` · ${event.start_time}–${event.end_time}`
            : ""}
        </HeaderStat>
        <HeaderStat icon={<Users size={11} strokeWidth={1.8} />}>
          {event.guest_count} guests
        </HeaderStat>
        {event.venue && (
          <HeaderStat icon={<MapPin size={11} strokeWidth={1.8} />}>
            {event.venue}
          </HeaderStat>
        )}
        <HeaderStat icon={<Sparkles size={11} strokeWidth={1.8} />}>
          {event.service_style.replace("_", " ")}
        </HeaderStat>
        {event.vibe_tags.length > 0 && (
          <span className="flex items-center gap-1">
            {event.vibe_tags.map((t) => (
              <span
                key={t}
                className="rounded-sm bg-ivory-warm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </div>
    </header>
  );
}

function HeaderStat({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-ink-faint" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );
}

// ── Lane (vendor suggested / in debate) ──────────────────────────────────

function Lane({
  title,
  icon,
  tone,
  hint,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "rose" | "sage" | "saffron";
  hint: string;
  count: number;
  children: React.ReactNode;
}) {
  const toneClass = {
    rose: "border-rose/30 bg-rose-pale/10",
    sage: "border-sage/30 bg-sage-pale/15",
    saffron: "border-saffron/30 bg-saffron-pale/15",
  }[tone];
  const eyebrowTone = {
    rose: "text-rose",
    sage: "text-sage",
    saffron: "text-saffron",
  }[tone];
  return (
    <section className={cn("mb-5 rounded-md border p-3", toneClass)}>
      <header className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className={eyebrowTone}>{icon}</span>
          <h3 className="text-[12.5px] font-medium text-ink">{title}</h3>
          <span
            className="font-mono text-[10px] tabular-nums text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {count}
          </span>
        </div>
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {hint}
        </p>
      </header>
      {children}
    </section>
  );
}

// ── Dish grid ────────────────────────────────────────────────────────────

function DishGrid({
  dishes,
  moments,
  showMomentLabel,
  reactionsFor,
  commentsFor,
  partyMap,
  currentPartyId,
  onToggleReaction,
  onAddComment,
  onSetDishState,
}: {
  dishes: Dish[];
  moments: MenuMoment[];
  showMomentLabel?: boolean;
  reactionsFor: (dishId: string) => Reaction[];
  commentsFor: (dishId: string) => Comment[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onToggleReaction: (dishId: string, kind: ReactionKind) => void;
  onAddComment: (dishId: string, body: string) => void;
  onSetDishState: (dishId: string, state: Dish["state"]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      {dishes.map((d) => {
        const moment = moments.find((m) => m.id === d.moment_id);
        return (
          <DishCard
            key={d.id}
            dish={d}
            momentName={showMomentLabel ? moment?.name : undefined}
            reactions={reactionsFor(d.id)}
            comments={commentsFor(d.id)}
            partyMap={partyMap}
            currentPartyId={currentPartyId}
            onToggleReaction={(kind) => onToggleReaction(d.id, kind)}
            onAddComment={(body) => onAddComment(d.id, body)}
            onSetState={(state) => onSetDishState(d.id, state)}
          />
        );
      })}
    </div>
  );
}

// ── Moment strip (approved dishes) ───────────────────────────────────────

function MomentStrip({
  moment,
  dishes,
  reactionsFor,
  commentsFor,
  partyMap,
  currentPartyId,
  onToggleReaction,
  onAddComment,
  onSetDishState,
  onSuggest,
}: {
  moment: MenuMoment;
  dishes: Dish[];
  reactionsFor: (dishId: string) => Reaction[];
  commentsFor: (dishId: string) => Comment[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onToggleReaction: (dishId: string, kind: ReactionKind) => void;
  onAddComment: (dishId: string, body: string) => void;
  onSetDishState: (dishId: string, state: Dish["state"]) => void;
  onSuggest: () => void;
}) {
  return (
    <li>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[13.5px] font-medium text-ink">{moment.name}</h3>
          {moment.time_window && (
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {moment.time_window}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onSuggest}
          className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Ask AI ↗
        </button>
      </div>

      {dishes.length === 0 ? (
        <EmptyMomentState momentName={moment.name} onSuggest={onSuggest} />
      ) : (
        <DishGrid
          dishes={dishes}
          moments={[moment]}
          reactionsFor={reactionsFor}
          commentsFor={commentsFor}
          partyMap={partyMap}
          currentPartyId={currentPartyId}
          onToggleReaction={onToggleReaction}
          onAddComment={onAddComment}
          onSetDishState={onSetDishState}
        />
      )}
    </li>
  );
}

// ── Dish card (with collaboration) ───────────────────────────────────────

function DishCard({
  dish,
  momentName,
  reactions,
  comments,
  partyMap,
  currentPartyId,
  onToggleReaction,
  onAddComment,
  onSetState,
}: {
  dish: Dish;
  momentName?: string;
  reactions: Reaction[];
  comments: Comment[];
  partyMap: Record<PartyId, Party>;
  currentPartyId: PartyId;
  onToggleReaction: (kind: ReactionKind) => void;
  onAddComment: (body: string) => void;
  onSetState: (state: Dish["state"]) => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const aiSourced = dish.source === "ai";
  const state = dish.state ?? "approved";

  // If the card is in debate or vendor_proposed, auto-expand comments so
  // people actually see them.
  const showThreadByDefault =
    state === "in_debate" || state === "vendor_proposed";

  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-md border bg-white p-3 transition-colors",
        state === "in_debate"
          ? "border-rose/40"
          : state === "vendor_proposed"
            ? "border-sage/40"
            : aiSourced
              ? "border-saffron/30 bg-saffron-pale/5"
              : "border-border hover:border-gold/25",
      )}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-[13.5px] font-medium leading-tight text-ink">
              {dish.name}
            </h4>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <StatePill state={state} tight />
            {momentName && (
              <span
                className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {momentName}
              </span>
            )}
            {dish.cuisine_tags.length > 0 && (
              <span
                className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {dish.cuisine_tags.join(" · ")}
              </span>
            )}
          </div>
        </div>
        <SpiceGauge level={dish.spice_level} />
      </header>

      {/* Description */}
      <p className="text-[12px] leading-snug text-ink-muted">
        {dish.description}
      </p>

      {/* Dietary + attribution row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {dish.dietary_flags.map((f) => (
          <DietaryBadge key={f} flag={f} />
        ))}
        {dish.added_by && (
          <span className="ml-auto">
            <Attribution
              partyId={dish.added_by}
              partyMap={partyMap}
              verb="added by"
            />
          </span>
        )}
      </div>

      {/* Why note */}
      {dish.why_note && (
        <p className="border-t border-border/60 pt-1.5 text-[11px] italic leading-snug text-ink-muted">
          {dish.why_note}
        </p>
      )}

      {/* Reactions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2">
        <ReactionBar
          reactions={reactions}
          partyMap={partyMap}
          currentPartyId={currentPartyId}
          onToggle={onToggleReaction}
          compact
        />
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1 rounded-sm border border-transparent px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
            comments.length > 0
              ? "text-ink hover:border-border"
              : "text-ink-faint hover:text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <MessageSquare size={10} strokeWidth={1.8} />
          {comments.length > 0 && (
            <span className="font-mono tabular-nums">{comments.length}</span>
          )}
          {commentsOpen ? (
            <ChevronUp size={9} strokeWidth={2} />
          ) : (
            <ChevronDown size={9} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Comment thread — expanded by default for active-state cards */}
      {(commentsOpen || (showThreadByDefault && comments.length > 0)) && (
        <div className="border-t border-border/60 pt-2">
          <CommentThread
            comments={comments}
            partyMap={partyMap}
            currentPartyId={currentPartyId}
            onPost={onAddComment}
            placeholder={`Comment as ${partyMap[currentPartyId]?.display_name ?? "you"}…`}
          />
        </div>
      )}

      {/* Quick state transitions for vendor-proposed / in-debate cards */}
      {state === "vendor_proposed" && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Accept →
          </span>
          <button
            type="button"
            onClick={() => onSetState("approved")}
            className="rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted hover:border-sage/50 hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            approve
          </button>
          <button
            type="button"
            onClick={() => onSetState("in_debate")}
            className="rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted hover:border-rose/50 hover:text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            move to debate
          </button>
          <button
            type="button"
            onClick={() => onSetState("rejected")}
            className="rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint hover:border-rose/50 hover:text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            reject
          </button>
        </div>
      )}
      {state === "in_debate" && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Resolve →
          </span>
          <button
            type="button"
            onClick={() => onSetState("approved")}
            className="rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted hover:border-sage/50 hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            approve
          </button>
          <button
            type="button"
            onClick={() => onSetState("parked")}
            className="rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            park it
          </button>
        </div>
      )}
    </article>
  );
}

function DietaryBadge({ flag }: { flag: Dish["dietary_flags"][number] }) {
  const label = DIETARY_FLAG_LABEL[flag];
  const tone =
    flag === "non_vegetarian"
      ? "bg-rose-pale/50 text-rose"
      : flag === "vegan" || flag === "jain" || flag === "swaminarayan"
        ? "bg-sage-pale/60 text-sage"
        : "bg-ivory-warm text-ink-muted";
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em]",
        tone,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

function SpiceGauge({ level }: { level: Dish["spice_level"] }) {
  if (level === 0) return null;
  return (
    <span
      className="flex flex-none items-center gap-0.5 text-rose"
      aria-label={`Spice level ${level} of 4`}
      title={`Spice ${level}/4`}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Flame
          key={i}
          size={8}
          strokeWidth={1.8}
          className={cn(i < level ? "text-rose" : "text-ink-faint/30")}
        />
      ))}
    </span>
  );
}

// ── Empty states ─────────────────────────────────────────────────────────

function EmptyMomentState({
  momentName,
  onSuggest,
}: {
  momentName: string;
  onSuggest: () => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-ivory-warm/20 px-3 py-3 text-center">
      <p className="text-[11.5px] text-ink-muted">
        {momentName} has no dishes yet.
      </p>
      <button
        type="button"
        onClick={onSuggest}
        className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-saffron transition-colors hover:text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Draft with AI ↗
      </button>
    </div>
  );
}

function EmptyEventState() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-md border border-dashed border-border bg-ivory-warm/20 px-5 py-8 text-center">
      <h3 className="text-[15px] font-medium text-ink">No moments yet</h3>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
        Tell the AI how this event should feel — <em>"intimate backyard haldi for 80, brunch energy"</em> — and it will draft the service moments and a starting menu.
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
