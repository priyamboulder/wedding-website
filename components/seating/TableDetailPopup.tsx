"use client";

// ── Table detail popup ───────────────────────────────────────────────
// Opens when the user clicks a table's number label (or via the context
// menu). Shows the full guest list for that table, dietary/side/category
// breakdowns, and a free-form notes field.

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, Users, Utensils, X } from "lucide-react";
import { useSeatingStore } from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import type { SeatingGuest } from "@/types/seating-guest";
import {
  categoryColor,
  guestFullName,
  guestInitials,
  sideDotClass,
} from "@/types/seating-guest";
import { TABLE_ZONE_META } from "@/types/seating";
import {
  groupFamilyAtTable,
  proposeDietaryBalance,
  runAutoFillTable,
  type BalanceSuggestion,
} from "@/lib/seating-ai";

interface Props {
  tableId: string;
  guests: SeatingGuest[];
  eventId: string;
  onClose: () => void;
}

const SHAPE_LABEL: Record<string, string> = {
  round: "Round",
  rect: "Rectangular",
  banquet: "Long banquet",
  u_shape: "U-shape",
};

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: "Veg",
  vegan: "Vegan",
  jain: "Jain",
  halal: "Halal",
  kosher: "Kosher",
  gluten_free: "GF",
  nut_allergy: "Nut allergy",
  dairy_free: "Dairy-free",
  non_vegetarian: "Non-veg",
  swaminarayan: "Swaminarayan",
};

const SIDE_LABEL: Record<string, string> = {
  bride: "Bride",
  groom: "Groom",
  mutual: "Mutual",
};

export function TableDetailPopup({ tableId, guests, eventId, onClose }: Props) {
  const table = useSeatingStore((s) => s.tables.find((t) => t.id === tableId));
  const tableMeta = useSeatingAssignmentsStore((s) => s.tableMeta[tableId]);
  const setTableNotes = useSeatingAssignmentsStore((s) => s.setTableNotes);
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[eventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const unassignGuest = useSeatingAssignmentsStore((s) => s.unassignGuest);

  const [notesDraft, setNotesDraft] = useState("");
  useEffect(() => {
    setNotesDraft(tableMeta?.notes ?? "");
  }, [tableId, tableMeta?.notes]);

  // Smart-action state (inline status banner + dietary balance suggestions)
  const [smartBusy, setSmartBusy] = useState<null | "auto_fill" | "group_family" | "balance_mix">(null);
  const [smartMessage, setSmartMessage] = useState<string>("");
  const [balanceSuggestions, setBalanceSuggestions] = useState<BalanceSuggestion[]>([]);

  const assignGuest = useSeatingAssignmentsStore((s) => s.assignGuest);

  const seatedGuests: SeatingGuest[] = useMemo(() => {
    const ids = assignments
      .filter((a) => a.tableId === tableId)
      .sort((a, b) => a.seatIndex - b.seatIndex)
      .map((a) => a.guestId);
    const byId = new Map(guests.map((g) => [g.id, g] as const));
    return ids.map((id) => byId.get(id)).filter(Boolean) as SeatingGuest[];
  }, [assignments, tableId, guests]);

  const dietarySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of seatedGuests) {
      for (const d of g.dietary) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [seatedGuests]);

  const sideBalance = useMemo(() => {
    const c = { bride: 0, groom: 0, mutual: 0 };
    for (const g of seatedGuests) c[g.side] += 1;
    return c;
  }, [seatedGuests]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of seatedGuests) {
      for (const c of g.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [seatedGuests]);

  if (!table) return null;

  const label = table.label?.trim() || `T${table.number}`;
  const occupied = seatedGuests.length;
  const zoneMeta = table.zone ? TABLE_ZONE_META[table.zone] : null;

  const handleAutoFill = async () => {
    setSmartBusy("auto_fill");
    setSmartMessage("");
    setBalanceSuggestions([]);
    const result = await runAutoFillTable({
      tableId,
      eventId,
      eventLabel: eventId,
      guests,
    });
    setSmartBusy(null);
    setSmartMessage(
      result.ok ? result.summary : result.error ?? "Could not auto-fill.",
    );
  };

  const handleGroupFamily = () => {
    setSmartBusy("group_family");
    setSmartMessage("");
    setBalanceSuggestions([]);
    const { moved, skipped } = groupFamilyAtTable(tableId, eventId, guests);
    setSmartBusy(null);
    if (moved.length === 0) {
      setSmartMessage(
        skipped.length > 0
          ? `Household-mates found but no free seats at this table.`
          : `No split households detected at this table.`,
      );
    } else {
      setSmartMessage(
        `Reunited ${moved.length} household-mate${moved.length === 1 ? "" : "s"} at this table.` +
          (skipped.length ? ` ${skipped.length} could not fit.` : ""),
      );
    }
  };

  const handleBalanceMix = () => {
    setSmartBusy("balance_mix");
    setSmartMessage("");
    const suggestions = proposeDietaryBalance(tableId, eventId, guests);
    setSmartBusy(null);
    setBalanceSuggestions(suggestions);
    if (suggestions.length === 0) {
      setSmartMessage(`Dietary mix at this table looks balanced.`);
    } else {
      setSmartMessage(
        `${suggestions.length} swap${suggestions.length === 1 ? "" : "s"} could balance this table — review below.`,
      );
    }
  };

  const applyBalanceSuggestion = (s: BalanceSuggestion) => {
    assignGuest(s.guestId, s.toTableId);
    setBalanceSuggestions((prev) => prev.filter((x) => x.guestId !== s.guestId));
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[82vh] w-[520px] overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border bg-ivory/40 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-serif text-[20px] text-ink">{label}</div>
              {zoneMeta && (
                <span
                  className="rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]"
                  style={{
                    borderColor: zoneMeta.stroke,
                    color: zoneMeta.stroke,
                    backgroundColor: zoneMeta.fill,
                  }}
                  title={zoneMeta.description}
                >
                  {zoneMeta.label}
                </span>
              )}
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              {SHAPE_LABEL[table.shape] ?? table.shape} · {occupied} / {table.seats} seated
              {occupied === table.seats && " · full"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
            title="Close"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Breakdowns */}
          <div className="grid grid-cols-3 gap-0 border-b border-border bg-white text-[11px]">
            <SummaryBlock label="Sides">
              <div className="space-y-0.5 text-ink">
                {sideBalance.bride > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-light" />
                    {sideBalance.bride} Bride
                  </div>
                )}
                {sideBalance.groom > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage-light" />
                    {sideBalance.groom} Groom
                  </div>
                )}
                {sideBalance.mutual > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-light" />
                    {sideBalance.mutual} Mutual
                  </div>
                )}
                {occupied === 0 && (
                  <div className="italic text-ink-faint">Empty</div>
                )}
              </div>
            </SummaryBlock>
            <SummaryBlock label="Dietary">
              {dietarySummary.length === 0 ? (
                <div className="italic text-ink-faint">None specified</div>
              ) : (
                <div className="space-y-0.5">
                  {dietarySummary.map(([d, n]) => (
                    <div key={d} className="text-ink">
                      {n} {DIETARY_LABEL[d] ?? d}
                    </div>
                  ))}
                </div>
              )}
            </SummaryBlock>
            <SummaryBlock label="Categories">
              {categoryBreakdown.length === 0 ? (
                <div className="italic text-ink-faint">No tags</div>
              ) : (
                <div className="space-y-0.5">
                  {categoryBreakdown.slice(0, 4).map(([c, n]) => (
                    <div key={c} className="flex items-center gap-1 text-ink">
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", categoryColor(c))}
                      />
                      {n} {c}
                    </div>
                  ))}
                </div>
              )}
            </SummaryBlock>
          </div>

          {/* Guest list */}
          <div className="border-b border-border">
            <div className="px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Guest list
            </div>
            {seatedGuests.length === 0 ? (
              <div className="px-5 pb-5 text-[12px] italic text-ink-faint">
                No guests yet — drag from the Guests tab to fill this table.
              </div>
            ) : (
              <ul>
                {seatedGuests.map((g, idx) => (
                  <li
                    key={g.id}
                    className="flex items-center gap-3 border-t border-border/40 px-5 py-2 text-[12px]"
                  >
                    <span className="font-mono text-[10px] text-ink-faint w-4 text-right">
                      {idx + 1}
                    </span>
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border bg-ivory font-serif text-[10.5px] text-ink">
                      {guestInitials(g)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", sideDotClass(g.side))}
                        />
                        <span className="truncate text-ink">{guestFullName(g)}</span>
                      </div>
                      <div className="mt-0.5 font-mono text-[9.5px] text-ink-faint">
                        {g.relationship ?? g.vipTier}
                        {g.dietary.length > 0 && (
                          <span className="ml-2 text-sage">
                            {g.dietary.map((d) => DIETARY_LABEL[d] ?? d).join(" · ")}
                          </span>
                        )}
                        {g.needsAssistance && (
                          <span className="ml-2 text-rose">assistance</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => unassignGuest(g.id)}
                      className="text-[10.5px] text-ink-faint hover:text-rose"
                      title="Unassign"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notes */}
          <div className="border-b border-border px-5 py-4">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Notes
            </label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => {
                if ((tableMeta?.notes ?? "") !== notesDraft) {
                  setTableNotes(tableId, notesDraft);
                }
              }}
              placeholder="e.g., Near accessible exit for Mrs. Bajwa."
              rows={2}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] text-ink outline-none focus:border-ink/30"
            />
          </div>
        </div>

        {/* Smart actions + inline status banner */}
        <div className="border-t border-border bg-white px-5 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Smart actions
            </div>
            {smartMessage && (
              <div className="truncate text-[10.5px] italic text-ink-muted" title={smartMessage}>
                {smartMessage}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <SmartActionButton
              icon={<Sparkles size={11} strokeWidth={1.7} />}
              label="Auto-fill"
              hint="AI picks best-fit guests for empty seats"
              disabled={occupied >= table.seats || !!smartBusy}
              busy={smartBusy === "auto_fill"}
              onClick={handleAutoFill}
            />
            <SmartActionButton
              icon={<Utensils size={11} strokeWidth={1.7} />}
              label="Balance mix"
              hint="Suggest swaps to even out dietary/social mix"
              disabled={occupied < 3 || !!smartBusy}
              busy={smartBusy === "balance_mix"}
              onClick={handleBalanceMix}
            />
            <SmartActionButton
              icon={<Users size={11} strokeWidth={1.7} />}
              label="Group family"
              hint="Pull household-mates currently seated elsewhere"
              disabled={occupied === 0 || !!smartBusy}
              busy={smartBusy === "group_family"}
              onClick={handleGroupFamily}
            />
          </div>

          {balanceSuggestions.length > 0 && (
            <div className="mt-3 space-y-1 rounded-md border border-gold/30 bg-gold-pale/15 p-2">
              <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold">
                Proposed swaps
              </div>
              {balanceSuggestions.map((s) => {
                const g = guests.find((x) => x.id === s.guestId);
                if (!g) return null;
                return (
                  <button
                    key={s.guestId}
                    onClick={() => applyBalanceSuggestion(s)}
                    className="flex w-full items-center gap-2 rounded border border-transparent px-2 py-1 text-left text-[11px] hover:border-gold/40 hover:bg-white"
                  >
                    <ChevronRight size={10} strokeWidth={1.8} className="text-ink-muted" />
                    <span className="text-ink">{guestFullName(g)}</span>
                    <span className="text-ink-faint">→</span>
                    <span className="text-ink-muted">{s.reason}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-ivory/30 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function SummaryBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-r border-border/70 px-4 py-3 last:border-r-0">
      <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </div>
      {children}
    </div>
  );
}

function SmartActionButton({
  icon,
  label,
  hint,
  disabled,
  busy,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      title={hint}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] transition",
        disabled || busy
          ? "cursor-not-allowed border-border bg-ivory/40 text-ink-faint"
          : "border-border bg-white text-ink hover:border-ink/25",
      )}
    >
      <span className={cn(busy && "animate-pulse")}>{icon}</span>
      <span>{busy ? `${label}…` : label}</span>
    </button>
  );
}
