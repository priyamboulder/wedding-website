"use client";

// ── Table Inspector panel ────────────────────────────────────────────
// Right sidebar for the AI-first seating chart. Always rendered (not a
// modal): when no table is selected, shows a prompt; when one is, shows
// zone badge, capacity, dietary breakdown, seated-guest list, and the
// three smart-action buttons (Auto-fill, Balance mix, Group family).

import { useMemo, useState } from "react";
import { ChevronRight, Sparkles, Users, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeatingStore } from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import type { SeatingGuest } from "@/types/seating-guest";
import {
  guestFullName,
  guestInitials,
  sideDotClass,
} from "@/types/seating-guest";
import { TABLE_ZONE_META } from "@/types/seating";
import { DIETARY_FLAG_LABEL, type DietaryFlag } from "@/types/catering";
import {
  groupFamilyAtTable,
  proposeDietaryBalance,
  runAutoFillTable,
  type BalanceSuggestion,
} from "@/lib/seating-ai";

interface Props {
  tableId: string | null;
  guests: SeatingGuest[];
  eventId: string;
}

export function TableInspectorPanel({ tableId, guests, eventId }: Props) {
  const table = useSeatingStore((s) =>
    tableId ? s.tables.find((t) => t.id === tableId) : null,
  );
  const updateTable = useSeatingStore((s) => s.updateTable);
  const removeTable = useSeatingStore((s) => s.removeTable);
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[eventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const unassignGuest = useSeatingAssignmentsStore((s) => s.unassignGuest);
  const assignGuest = useSeatingAssignmentsStore((s) => s.assignGuest);

  const [smartBusy, setSmartBusy] = useState<
    null | "auto_fill" | "group_family" | "balance_mix"
  >(null);
  const [smartMessage, setSmartMessage] = useState<string>("");
  const [balanceSuggestions, setBalanceSuggestions] = useState<
    BalanceSuggestion[]
  >([]);
  const [nameDraft, setNameDraft] = useState<string>("");
  const [editingName, setEditingName] = useState(false);

  const seatedGuests: SeatingGuest[] = useMemo(() => {
    if (!table) return [];
    const byId = new Map(guests.map((g) => [g.id, g] as const));
    return assignments
      .filter((a) => a.tableId === table.id)
      .sort((a, b) => a.seatIndex - b.seatIndex)
      .map((a) => byId.get(a.guestId))
      .filter((g): g is SeatingGuest => !!g);
  }, [assignments, table, guests]);

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

  if (!table) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="mb-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            Table Inspector
          </div>
          <div className="text-[13px] text-ink">Select a table</div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] italic text-ink-faint">
          Click a table on the canvas to see its dietary breakdown, seated
          guests, and smart actions.
        </div>
      </div>
    );
  }

  const label = table.label?.trim() || `T${table.number}`;
  const occupied = seatedGuests.length;
  const free = table.seats - occupied;
  const zoneMeta = table.zone ? TABLE_ZONE_META[table.zone] : null;
  const emptySeats = Array.from({ length: free });

  const handleAutoFill = async () => {
    setSmartBusy("auto_fill");
    setSmartMessage("");
    setBalanceSuggestions([]);
    const result = await runAutoFillTable({
      tableId: table.id,
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
    const { moved, skipped } = groupFamilyAtTable(table.id, eventId, guests);
    setSmartBusy(null);
    if (moved.length === 0) {
      setSmartMessage(
        skipped.length > 0
          ? "Household-mates found but no free seats at this table."
          : "No split households detected at this table.",
      );
    } else {
      setSmartMessage(
        `Reunited ${moved.length} household-mate${moved.length === 1 ? "" : "s"}.` +
          (skipped.length ? ` ${skipped.length} couldn't fit.` : ""),
      );
    }
  };

  const handleBalanceMix = () => {
    setSmartBusy("balance_mix");
    setSmartMessage("");
    const suggestions = proposeDietaryBalance(table.id, eventId, guests);
    setSmartBusy(null);
    setBalanceSuggestions(suggestions);
    setSmartMessage(
      suggestions.length === 0
        ? "Dietary mix looks balanced."
        : `${suggestions.length} swap${suggestions.length === 1 ? "" : "s"} would balance this table.`,
    );
  };

  const applyBalanceSuggestion = (s: BalanceSuggestion) => {
    assignGuest(s.guestId, s.toTableId);
    setBalanceSuggestions((prev) => prev.filter((x) => x.guestId !== s.guestId));
  };

  const startEditName = () => {
    setNameDraft(table.label ?? "");
    setEditingName(true);
  };
  const commitName = () => {
    updateTable(table.id, { label: nameDraft.trim() || undefined });
    setEditingName(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ── */}
      <div className="border-b border-border bg-ivory/30 px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            Table Inspector
          </span>
          {zoneMeta && (
            <span
              className="rounded-full border px-1.5 py-0 font-mono text-[8.5px] uppercase tracking-[0.12em]"
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
          <span className="ml-auto font-mono text-[10px] text-ink-faint">
            T{table.number}
          </span>
        </div>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") setEditingName(false);
            }}
            placeholder="Table name…"
            className="w-full border-b border-ink/20 bg-transparent pb-1 font-serif text-[17px] text-ink outline-none focus:border-ink"
          />
        ) : (
          <button
            onClick={startEditName}
            className="text-left font-serif text-[17px] text-ink hover:text-ink-muted"
            title="Click to rename"
          >
            {label}
          </button>
        )}
        <div className="mt-1 flex items-baseline gap-2 font-mono text-[10.5px] text-ink-muted">
          <span className="font-serif text-[13px] text-ink">
            {occupied} / {table.seats}
          </span>
          <span>seats filled</span>
          {free > 0 && (
            <span className="text-sage">
              · {free} open
            </span>
          )}
          {occupied === table.seats && (
            <span className="rounded bg-gold-pale px-1.5 py-0 text-gold">
              full
            </span>
          )}
        </div>

        {/* Table type toggle */}
        <div className="mt-2.5 inline-flex overflow-hidden rounded-md border border-border">
          {(["round", "rect", "banquet"] as const).map((shape) => (
            <button
              key={shape}
              onClick={() => updateTable(table.id, { shape })}
              className={cn(
                "px-2.5 py-0.5 text-[10px] transition",
                table.shape === shape
                  ? "bg-ink text-ivory"
                  : "bg-white text-ink-muted hover:bg-ivory",
              )}
            >
              {shape === "round" ? "Round" : shape === "rect" ? "Rect" : "Banquet"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Breakdowns ── */}
      <div className="grid grid-cols-2 border-b border-border">
        <div className="border-r border-border/60 px-4 py-3">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            Sides
          </div>
          {occupied === 0 ? (
            <div className="text-[11px] italic text-ink-faint">Empty</div>
          ) : (
            <div className="space-y-0.5 text-[11.5px]">
              {sideBalance.bride > 0 && (
                <Row dot="bg-rose-light" label={`${sideBalance.bride} Bride`} />
              )}
              {sideBalance.groom > 0 && (
                <Row dot="bg-sage-light" label={`${sideBalance.groom} Groom`} />
              )}
              {sideBalance.mutual > 0 && (
                <Row dot="bg-gold-light" label={`${sideBalance.mutual} Mutual`} />
              )}
            </div>
          )}
        </div>
        <div className="px-4 py-3">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            Dietary
          </div>
          {dietarySummary.length === 0 ? (
            <div className="text-[11px] italic text-ink-faint">
              None specified
            </div>
          ) : (
            <div className="space-y-0.5 text-[11.5px] text-ink">
              {dietarySummary.slice(0, 4).map(([d, n]) => (
                <div key={d}>
                  {n} {DIETARY_FLAG_LABEL[d as DietaryFlag] ?? d}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Seated guest list ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-ivory/30 px-4 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
          Seated guests
        </div>
        {seatedGuests.length === 0 && emptySeats.length === 0 ? (
          <div className="px-4 py-6 text-[12px] italic text-ink-faint">
            No seats — change table capacity in Floor Plan.
          </div>
        ) : (
          <ul>
            {seatedGuests.map((g, idx) => (
              <li
                key={g.id}
                className="flex items-center gap-2 border-b border-border/40 px-4 py-1.5"
              >
                <span className="w-4 text-right font-mono text-[9.5px] text-ink-faint">
                  {idx + 1}
                </span>
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-ivory/60 font-serif text-[9.5px] text-ink">
                  {guestInitials(g)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                        sideDotClass(g.side),
                      )}
                    />
                    <span className="truncate text-[11.5px] text-ink">
                      {guestFullName(g)}
                    </span>
                  </div>
                  {(g.relationship || g.dietary.length > 0) && (
                    <div className="truncate font-mono text-[9.5px] text-ink-faint">
                      {g.relationship}
                      {g.dietary.length > 0 && (
                        <span className="ml-1 text-sage">
                          {g.dietary
                            .map((d) => DIETARY_FLAG_LABEL[d as DietaryFlag] ?? d)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => unassignGuest(g.id)}
                  title="Remove from table"
                  className="text-[9.5px] text-ink-faint hover:text-rose"
                >
                  remove
                </button>
              </li>
            ))}
            {emptySeats.map((_, i) => (
              <li
                key={`empty-${i}`}
                className="flex items-center gap-2 border-b border-border/40 px-4 py-1.5 text-[11px] italic text-ink-faint"
              >
                <span className="w-4 text-right font-mono text-[9.5px]">
                  {seatedGuests.length + i + 1}
                </span>
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-border">
                  ○
                </span>
                <span>Empty seat</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Balance suggestions (renders above smart actions when present) ── */}
      {balanceSuggestions.length > 0 && (
        <div className="border-t border-gold/30 bg-gold-pale/15 px-4 py-2">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-gold">
            Proposed swaps
          </div>
          <div className="space-y-0.5">
            {balanceSuggestions.map((s) => {
              const g = guests.find((x) => x.id === s.guestId);
              if (!g) return null;
              return (
                <button
                  key={s.guestId}
                  onClick={() => applyBalanceSuggestion(s)}
                  className="flex w-full items-center gap-2 rounded border border-transparent px-2 py-1 text-left text-[10.5px] hover:border-gold/40 hover:bg-white"
                >
                  <ChevronRight
                    size={10}
                    strokeWidth={1.8}
                    className="text-ink-muted"
                  />
                  <span className="text-ink">{guestFullName(g)}</span>
                  <span className="text-ink-faint">→</span>
                  <span className="truncate text-ink-muted">{s.reason}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Smart actions ── */}
      <div className="border-t border-border bg-white px-4 py-3">
        {smartMessage && (
          <div className="mb-2 truncate text-[10.5px] italic text-ink-muted" title={smartMessage}>
            {smartMessage}
          </div>
        )}
        <button
          onClick={handleAutoFill}
          disabled={free <= 0 || !!smartBusy}
          className={cn(
            "mb-2 flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] shadow-sm transition",
            free > 0 && !smartBusy
              ? "bg-gradient-to-br from-gold to-gold/85 text-ivory hover:opacity-90"
              : "cursor-not-allowed bg-gold/30 text-ivory",
          )}
          title="AI picks best-fit unassigned guests for empty seats"
        >
          <Sparkles
            size={12}
            strokeWidth={1.8}
            className={smartBusy === "auto_fill" ? "animate-pulse" : ""}
          />
          {smartBusy === "auto_fill" ? "Filling…" : "Auto-fill"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <SmartButton
            icon={<Utensils size={11} strokeWidth={1.7} />}
            label="Balance mix"
            busy={smartBusy === "balance_mix"}
            disabled={occupied < 3 || !!smartBusy}
            onClick={handleBalanceMix}
          />
          <SmartButton
            icon={<Users size={11} strokeWidth={1.7} />}
            label="Group family"
            busy={smartBusy === "group_family"}
            disabled={occupied === 0 || !!smartBusy}
            onClick={handleGroupFamily}
          />
        </div>
        <button
          onClick={() => {
            const ok = window.confirm(`Delete ${label}? Seated guests are returned to the pool.`);
            if (!ok) return;
            removeTable(table.id);
          }}
          className="mt-3 w-full text-center text-[10px] text-ink-faint hover:text-rose"
        >
          Delete table
        </button>
      </div>
    </div>
  );
}

function Row({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      <span className="text-ink">{label}</span>
    </div>
  );
}

function SmartButton({
  icon,
  label,
  busy,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] transition",
        disabled
          ? "cursor-not-allowed border-border bg-ivory/40 text-ink-faint"
          : "border-border bg-white text-ink hover:border-ink/25",
      )}
    >
      <span className={cn(busy && "animate-pulse")}>{icon}</span>
      {busy ? `${label}…` : label}
    </button>
  );
}
