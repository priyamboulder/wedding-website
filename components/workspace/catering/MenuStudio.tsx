"use client";

// ── Menu Studio ────────────────────────────────────────────────────────────
// The first of the Catering rebuild's six surfaces. Three-column canvas:
//   left = event rail, middle = menu board, right = intelligence panel.
// A conversation bar at the bottom of the middle column is the primary
// interaction — the couple types instructions, the AI returns a set of
// PendingEdit rows which land in the intelligence panel for review.
//
// Data lives in stores/catering-store.ts (Zustand + localStorage).
// AI requests hit /api/catering/menu-design (see route.ts).

import { useMemo, useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCateringStore } from "@/stores/catering-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import {
  computeIntelligence,
  projectOtherEvents,
} from "@/lib/catering/intelligence";
import type { Dish, PartyId, PendingEdit, ReactionKind } from "@/types/catering";
import { URVASHI_ID, buildPartyMap } from "@/lib/catering/parties";
import { InFlightStrip, PresenceIndicator, SubHeader, TabHeader } from "./shared/collab";
import type { FlowItem } from "./shared/collab";
import { EventRail } from "./EventRail";
import { MenuBoard } from "./MenuBoard";
import { IntelligencePanel } from "./IntelligencePanel";

const CURRENT_PARTY: PartyId = URVASHI_ID;

interface MenuStudioProps {
  weddingId?: string;
}

export function MenuStudio({ weddingId = DEMO_WEDDING_ID }: MenuStudioProps) {
  // ── Store selectors ──────────────────────────────────────────────────────
  // Select raw store slices only — derive filtered/sorted views via useMemo.
  const allEvents = useCateringStore((s) => s.events);
  const moments = useCateringStore((s) => s.moments);
  const dishes = useCateringStore((s) => s.dishes);
  const dietary_totals = useCateringStore((s) => s.dietary_totals);
  const pending_edits = useCateringStore((s) => s.pending_edits);
  const reactions = useCateringStore((s) => s.reactions);
  const comments = useCateringStore((s) => s.comments);
  const open_questions = useCateringStore((s) => s.open_questions);
  const proposals = useCateringStore((s) => s.proposals);
  const presence = useCateringStore((s) => s.presence);
  const selectedId = useCateringStore((s) => s.selected_event_id);
  const setSelectedEvent = useCateringStore((s) => s.setSelectedEvent);
  const queuePendingEdits = useCateringStore((s) => s.queuePendingEdits);
  const acceptEdit = useCateringStore((s) => s.acceptEdit);
  const rejectEdit = useCateringStore((s) => s.rejectEdit);
  const toggleReaction = useCateringStore((s) => s.toggleReaction);
  const addComment = useCateringStore((s) => s.addComment);
  const addOpenQuestion = useCateringStore((s) => s.addOpenQuestion);
  const setDishState = useCateringStore((s) => s.setDishState);

  const vendors = useVendorsStore((s) => s.vendors);
  const catererNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const v of vendors) m[v.id] = v.name;
    return m;
  }, [vendors]);
  const partyMap = useMemo(() => buildPartyMap(catererNameMap), [catererNameMap]);

  const events = useMemo(
    () =>
      allEvents
        .filter((e) => e.wedding_id === weddingId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allEvents, weddingId],
  );

  // Default-select the first event if none is selected.
  useEffect(() => {
    if (!selectedId && events.length > 0) {
      setSelectedEvent(events[0]!.id);
    }
  }, [selectedId, events, setSelectedEvent]);

  const activeEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? events[0] ?? null,
    [events, selectedId],
  );

  // ── Derived data for the active event ────────────────────────────────────
  const activeMoments = useMemo(
    () =>
      activeEvent
        ? moments
            .filter((m) => m.event_id === activeEvent.id)
            .sort((a, b) => a.order - b.order)
        : [],
    [activeEvent, moments],
  );

  const activeDishes = useMemo(() => {
    const momentIds = new Set(activeMoments.map((m) => m.id));
    return dishes.filter((d) => momentIds.has(d.moment_id));
  }, [activeMoments, dishes]);

  const activeDietary = useMemo(
    () =>
      activeEvent
        ? dietary_totals.find((t) => t.event_id === activeEvent.id)
        : undefined,
    [activeEvent, dietary_totals],
  );

  const otherEventsProjection = useMemo(
    () =>
      activeEvent
        ? projectOtherEvents(activeEvent.id, events, moments, dishes)
        : [],
    [activeEvent, events, moments, dishes],
  );

  const intelligence = useMemo(() => {
    if (!activeEvent) return null;
    return computeIntelligence(
      activeEvent,
      activeMoments,
      activeDishes,
      activeDietary,
      otherEventsProjection,
    );
  }, [activeEvent, activeMoments, activeDishes, activeDietary, otherEventsProjection]);

  const activePending = useMemo(
    () =>
      activeEvent
        ? pending_edits.filter(
            (p) => p.event_id === activeEvent.id && p.status === "pending",
          )
        : [],
    [activeEvent, pending_edits],
  );

  // Caterer currently serving this event — picked from the most recent
  // received proposal. Drives the "Questions for {caterer}" rail.
  const activeCatererId = useMemo<string | null>(() => {
    if (!activeEvent) return null;
    const received = proposals
      .filter(
        (p) =>
          p.event_id === activeEvent.id &&
          p.status === "received",
      )
      .sort((a, b) =>
        (b.received_at ?? "").localeCompare(a.received_at ?? ""),
      );
    return received[0]?.caterer_id ?? null;
  }, [activeEvent, proposals]);

  const activeOpenQuestions = useMemo(() => {
    if (!activeCatererId) return [];
    return open_questions.filter(
      (q) =>
        q.for_party === activeCatererId ||
        (q.entity_kind === "caterer" && q.entity_id === activeCatererId),
    );
  }, [activeCatererId, open_questions]);

  // In-flight strip: dishes in vendor_proposed or in_debate for this event,
  // plus unanswered questions pointed at the event caterer.
  const inFlight: FlowItem[] = useMemo(() => {
    if (!activeEvent) return [];
    const items: FlowItem[] = [];
    for (const d of activeDishes) {
      if (d.state === "vendor_proposed") {
        items.push({
          id: `fl-v-${d.id}`,
          label: `${d.name} — from vendor`,
          hint: "Awaiting couple reaction",
          state: "vendor_proposed",
          waiting_on: CURRENT_PARTY,
        });
      } else if (d.state === "in_debate") {
        items.push({
          id: `fl-d-${d.id}`,
          label: `${d.name} — in debate`,
          hint: "Parties disagree",
          state: "in_debate",
        });
      }
    }
    for (const q of activeOpenQuestions) {
      if (q.answered_at) continue;
      items.push({
        id: `fl-q-${q.id}`,
        label: q.body.length > 60 ? q.body.slice(0, 60) + "…" : q.body,
        hint: "Open question",
        state: "blocked",
        waiting_on: q.for_party,
      });
    }
    return items.slice(0, 6);
  }, [activeEvent, activeDishes, activeOpenQuestions]);

  // Counts for the event rail
  const pendingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of pending_edits) {
      if (p.status !== "pending") continue;
      counts[p.event_id] = (counts[p.event_id] ?? 0) + 1;
    }
    return counts;
  }, [pending_edits]);

  const dishCounts = useMemo(() => {
    const byMoment = new Map<string, string>();
    for (const m of moments) byMoment.set(m.id, m.event_id);
    const counts: Record<string, number> = {};
    for (const d of dishes) {
      const evId = byMoment.get(d.moment_id);
      if (!evId) continue;
      counts[evId] = (counts[evId] ?? 0) + 1;
    }
    return counts;
  }, [moments, dishes]);

  // ── Conversation state ───────────────────────────────────────────────────
  const [isThinking, setIsThinking] = useState(false);
  const [lastRationale, setLastRationale] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  async function sendInstruction(instruction: string) {
    if (!activeEvent || !instruction.trim() || isThinking) return;
    setIsThinking(true);
    setLastError(null);
    try {
      const res = await fetch("/api/catering/menu-design", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wedding_id: weddingId,
          event: activeEvent,
          moments: activeMoments,
          dishes: activeDishes,
          other_events: otherEventsProjection,
          dietary_totals: activeDietary
            ? {
                total_guests: activeDietary.total_guests,
                counts: activeDietary.counts,
              }
            : undefined,
          instruction,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        rationale: string;
        edits: Array<Omit<PendingEdit, "id" | "created_at" | "status">>;
        error?: string;
      };
      setLastRationale(data.rationale || null);
      if (!data.ok) {
        setLastError(data.error ?? "Menu design failed.");
      }
      if (data.edits?.length) {
        queuePendingEdits(data.edits);
      }
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsThinking(false);
    }
  }

  // ── Empty state: no events ───────────────────────────────────────────────
  if (!activeEvent || !intelligence) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <h3 className="font-serif text-[20px] text-ink">No events yet</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Add wedding events in the main setup and they'll appear here,
            ready to menu-design.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid h-full grid-cols-[260px_minmax(0,1fr)_340px] overflow-hidden bg-white">
      <EventRail
        events={events}
        selectedId={activeEvent.id}
        pendingCounts={pendingCounts}
        dishCounts={dishCounts}
        onSelect={setSelectedEvent}
      />

      <div className="flex h-full min-w-0 flex-col overflow-hidden">
        {/* In-flight strip + presence — fixed height at top */}
        <div className="flex flex-none items-start justify-between gap-4 border-b border-gold/15 bg-ivory-warm/20 px-7 py-3">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              In flight · {activeEvent.label}
            </p>
            <div className="mt-1.5">
              <InFlightStrip
                items={inFlight}
                partyMap={partyMap}
                emptyMessage="Nothing in debate · every dish has full consensus."
              />
            </div>
          </div>
          <div className="pt-1">
            <PresenceIndicator signals={presence} partyMap={partyMap} />
          </div>
        </div>

        {/* MenuBoard scrolls inside its own bounded flex slot */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <MenuBoard
            event={activeEvent}
            moments={activeMoments}
            dishesForMoment={(momentId) =>
              activeDishes
                .filter((d) => d.moment_id === momentId)
                .sort((a, b) => a.sort_order - b.sort_order)
            }
            allEventDishes={activeDishes}
            reactionsFor={(dishId) =>
              reactions.filter(
                (r) => r.entity_kind === "dish" && r.entity_id === dishId,
              )
            }
            commentsFor={(dishId) =>
              comments
                .filter(
                  (c) => c.entity_kind === "dish" && c.entity_id === dishId,
                )
                .sort((a, b) => a.created_at.localeCompare(b.created_at))
            }
            partyMap={partyMap}
            currentPartyId={CURRENT_PARTY}
            onToggleReaction={(dishId, kind) =>
              toggleReaction("dish", dishId, CURRENT_PARTY, kind)
            }
            onAddComment={(dishId, body) =>
              addComment("dish", dishId, CURRENT_PARTY, body)
            }
            onSetDishState={(dishId, state) =>
              state && setDishState(dishId, state)
            }
            onSuggestForMoment={(m) =>
              sendInstruction(
                `Suggest 2–3 dishes for ${m.name} that complement the current selection.`,
              )
            }
          />
        </div>

        <ConversationBar
          placeholder={`Design ${activeEvent.label} with AI — e.g. "add a live chaat station", "make the main service lighter"`}
          onSend={sendInstruction}
          isThinking={isThinking}
          error={lastError}
        />
      </div>

      <IntelligencePanel
        intelligence={intelligence}
        dietary={activeDietary}
        pendingEdits={activePending}
        onAcceptEdit={acceptEdit}
        onRejectEdit={rejectEdit}
        isThinking={isThinking}
        lastRationale={lastRationale}
        eventCatererId={activeCatererId}
        openQuestions={activeOpenQuestions}
        partyMap={partyMap}
        currentPartyId={CURRENT_PARTY}
        onAskQuestion={(body, forParty) =>
          addOpenQuestion({
            wedding_id: weddingId,
            entity_kind: "caterer",
            entity_id: forParty,
            raised_by: CURRENT_PARTY,
            for_party: forParty,
            body,
          })
        }
      />
    </div>
  );
}

// ── Conversation bar ──────────────────────────────────────────────────────
// Anchored to the bottom of the middle column. Couples type plain
// instructions; AI returns a diff the couple reviews in the panel.

function ConversationBar({
  placeholder,
  onSend,
  isThinking,
  error,
}: {
  placeholder: string;
  onSend: (text: string) => void;
  isThinking: boolean;
  error: string | null;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const value = text.trim();
    if (!value || isThinking) return;
    onSend(value);
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-gold/15 bg-ivory-warm/30 px-8 py-4">
      {error && (
        <p className="mb-2 rounded-md border border-rose/30 bg-rose-pale/20 px-3 py-2 text-[11.5px] text-rose">
          {error}
        </p>
      )}
      <div className="flex items-end gap-2 rounded-lg border border-gold/25 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(26,26,26,0.04)] focus-within:border-saffron/50">
        <Sparkles
          size={14}
          strokeWidth={1.8}
          className="mt-1.5 flex-none text-saffron"
          aria-hidden
        />
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          disabled={isThinking}
          className={cn(
            "flex-1 resize-none border-0 bg-transparent text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink-faint",
            "min-h-[24px] max-h-[120px]",
          )}
          aria-label="Menu design instruction"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || isThinking}
          className={cn(
            "flex flex-none items-center gap-1 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
            text.trim() && !isThinking
              ? "bg-ink text-ivory hover:bg-ink-soft"
              : "bg-ink-faint/20 text-ink-faint",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
          aria-label="Send to AI"
        >
          <Send size={10} strokeWidth={2.2} />
          {isThinking ? "…" : "Send"}
        </button>
      </div>
      <p className="mt-1.5 text-[10.5px] text-ink-faint">
        Enter to send · Shift+Enter for new line. AI suggestions queue for your review — nothing changes until you accept.
      </p>
    </div>
  );
}
