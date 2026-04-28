"use client";

// ── Guest Pool panel ─────────────────────────────────────────────────
// Left sidebar for the AI-first seating chart. Lists unassigned guests
// (and optionally all guests) with search, side filter, and dietary tag
// pills. Each row is draggable onto tables on the canvas, or clickable
// to enter tap-to-assign mode.

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeatingGuest, SeatingGuestSide } from "@/types/seating-guest";
import {
  guestFullName,
  guestInitials,
  sideDotClass,
} from "@/types/seating-guest";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import { useSeatingDragStore } from "@/stores/seating-drag-store";
import { DIETARY_FLAG_LABEL, type DietaryFlag } from "@/types/catering";

interface Props {
  guests: SeatingGuest[];
  eventId: string;
}

// Dietary tag pill colors — match the spec's left sidebar palette.
const DIETARY_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  non_vegetarian: { bg: "bg-rose-pale/50", border: "border-rose/40", text: "text-rose" },
  vegetarian: { bg: "bg-sage-pale/60", border: "border-sage/40", text: "text-sage" },
  jain: { bg: "bg-sage-pale/40", border: "border-sage/30", text: "text-sage" },
  vegan: { bg: "bg-sage-pale/70", border: "border-sage/50", text: "text-sage" },
  halal: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  kosher: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  gluten_free: { bg: "bg-gold-pale/50", border: "border-gold/40", text: "text-gold" },
  nut_allergy: { bg: "bg-rose-pale/40", border: "border-rose/30", text: "text-rose" },
  dairy_free: { bg: "bg-gold-pale/40", border: "border-gold/30", text: "text-gold" },
  swaminarayan: { bg: "bg-sage-pale/50", border: "border-sage/40", text: "text-sage" },
};

const SIDE_TABS: Array<{ id: SeatingGuestSide | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "bride", label: "Bride" },
  { id: "groom", label: "Groom" },
];

export function GuestPoolPanel({ guests, eventId }: Props) {
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<SeatingGuestSide | "all">("all");
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [showAssigned, setShowAssigned] = useState(false);

  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[eventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const assignedSet = useMemo(
    () => new Set(assignments.map((a) => a.guestId)),
    [assignments],
  );

  const startDrag = useSeatingDragStore((s) => s.startDrag);
  const endDrag = useSeatingDragStore((s) => s.endDrag);
  const pickedGuestIds = useSeatingDragStore((s) => s.pickedGuestIds);
  const pickGuest = useSeatingDragStore((s) => s.pickGuest);

  // Aggregate dietary tags present in the roster (only show pills for ones
  // that actually exist, so we don't clutter the UI with irrelevant options).
  const dietaryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) for (const d of g.dietary) set.add(d);
    return Array.from(set).sort();
  }, [guests]);

  // Filter pipeline
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (!showAssigned && assignedSet.has(g.id)) return false;
      if (sideFilter !== "all" && g.side !== sideFilter) return false;
      if (dietaryFilter && !g.dietary.includes(dietaryFilter)) return false;
      if (q && !guestFullName(g).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [guests, query, sideFilter, dietaryFilter, showAssigned, assignedSet]);

  // Group by circle (category) for visual structure — fall back to side.
  const grouped = useMemo(() => {
    const groups = new Map<string, SeatingGuest[]>();
    for (const g of filtered) {
      const key = g.categories[0] || (g.side === "bride" ? "Bride's Side" : g.side === "groom" ? "Groom's Side" : "Mutual");
      const list = groups.get(key) ?? [];
      list.push(g);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      // Put Bride's/Groom's families near top; known VIP categories first.
      const score = (k: string) => {
        if (/immediate|vip|elder/i.test(k)) return 0;
        if (/bridesmaid|groomsmen|squad/i.test(k)) return 1;
        if (/extended|family|parent/i.test(k)) return 2;
        if (/college|school|friend/i.test(k)) return 3;
        if (/work|colleag/i.test(k)) return 4;
        if (/kid/i.test(k)) return 5;
        return 6;
      };
      return score(a[0]) - score(b[0]);
    });
  }, [filtered]);

  // Drag handlers — push into both the DataTransfer (for drop target) and
  // the shared drag store (so the canvas highlights valid targets).
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    guestId: string,
  ) => {
    const ids = [guestId];
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-ananya-guest-ids",
      JSON.stringify(ids),
    );
    startDrag(ids);
  };

  const totalInRoster = guests.length;
  const totalUnassigned = guests.filter((g) => !assignedSet.has(g.id)).length;

  return (
    <div className="flex h-full flex-col">
      {/* Header: counts */}
      <div className="border-b border-border px-4 py-3">
        <div className="mb-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
          Guest Pool
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[18px] text-ink">
            {totalUnassigned}
          </span>
          <span className="text-[11px] text-ink-muted">unassigned</span>
          <span className="ml-auto font-mono text-[10px] text-ink-faint">
            {totalInRoster} total
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-ivory/30 px-2 py-1">
          <Search size={11} strokeWidth={1.7} className="text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            className="flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[10px] text-ink-faint hover:text-ink"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Side filter tabs */}
      <div className="flex border-b border-border">
        {SIDE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSideFilter(tab.id)}
            className={cn(
              "flex-1 border-b-2 px-2 py-2 text-[11.5px] transition",
              sideFilter === tab.id
                ? "border-ink text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dietary tag pills */}
      {dietaryOptions.length > 0 && (
        <div className="border-b border-border px-3 py-2">
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            Dietary
          </div>
          <div className="flex flex-wrap gap-1">
            {dietaryOptions.map((d) => {
              const styles = DIETARY_STYLE[d] ?? {
                bg: "bg-ivory/40",
                border: "border-border",
                text: "text-ink-muted",
              };
              const active = dietaryFilter === d;
              return (
                <button
                  key={d}
                  onClick={() => setDietaryFilter(active ? null : d)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : cn(styles.bg, styles.border, styles.text, "hover:brightness-95"),
                  )}
                >
                  {DIETARY_FLAG_LABEL[d as DietaryFlag] ?? d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Show assigned toggle */}
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <label className="flex items-center gap-1.5 text-[10.5px] text-ink-muted">
          <input
            type="checkbox"
            checked={showAssigned}
            onChange={(e) => setShowAssigned(e.target.checked)}
            className="h-3 w-3"
          />
          Include seated guests
        </label>
        <span className="font-mono text-[10px] text-ink-faint">
          {filtered.length} shown
        </span>
      </div>

      {/* Guest list, grouped by circle */}
      <div className="flex-1 overflow-y-auto">
        {grouped.length === 0 ? (
          <div className="px-4 py-12 text-center text-[12px] italic text-ink-faint">
            {totalInRoster === 0
              ? "No guests on the roster yet — add some from the Guests page."
              : "No guests match these filters."}
          </div>
        ) : (
          grouped.map(([groupName, list]) => (
            <div key={groupName}>
              <div className="flex items-center justify-between border-b border-border/50 bg-ivory/30 px-4 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                <span>{groupName}</span>
                <span>{list.length}</span>
              </div>
              <ul>
                {list.map((g) => {
                  const isPicked = !!pickedGuestIds?.includes(g.id);
                  const isAssigned = assignedSet.has(g.id);
                  return (
                    <li key={g.id}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, g.id)}
                        onDragEnd={() => endDrag()}
                        onClick={() => pickGuest(g.id)}
                        className={cn(
                          "flex cursor-grab items-center gap-2 border-b border-border/40 px-4 py-1.5 transition hover:bg-ivory/40",
                          isPicked && "bg-gold-pale/30",
                          isAssigned && "opacity-60",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                            sideDotClass(g.side),
                          )}
                        />
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-ivory/60 font-serif text-[10px] text-ink">
                          {guestInitials(g)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] text-ink">
                            {guestFullName(g)}
                          </div>
                          {g.relationship && (
                            <div className="truncate font-mono text-[9.5px] text-ink-faint">
                              {g.relationship}
                            </div>
                          )}
                        </div>
                        {g.dietary.length > 0 && (
                          <span className="flex flex-shrink-0 gap-0.5">
                            {g.dietary.slice(0, 2).map((d) => {
                              const styles = DIETARY_STYLE[d] ?? {
                                bg: "bg-ivory/40",
                                border: "border-border",
                                text: "text-ink-muted",
                              };
                              return (
                                <span
                                  key={d}
                                  title={DIETARY_FLAG_LABEL[d as DietaryFlag] ?? d}
                                  className={cn(
                                    "rounded border px-1 py-0 font-mono text-[8px] uppercase",
                                    styles.bg,
                                    styles.border,
                                    styles.text,
                                  )}
                                >
                                  {DIETARY_FLAG_LABEL[d as DietaryFlag] ?? d}
                                </span>
                              );
                            })}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border bg-ivory/20 px-4 py-2 font-mono text-[9.5px] text-ink-faint">
        Drag a guest onto a table, or click to select then click a table.
      </div>
    </div>
  );
}
