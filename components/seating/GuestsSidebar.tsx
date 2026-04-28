"use client";

// ── Guests sidebar ──────────────────────────────────────────────────
// The right-side companion to the floor plan. Shows every confirmed
// guest for the active event, supports search + filter + sort, and
// lets the user drag them onto tables in the canvas.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Filter,
  Search,
  SortAsc,
  Users,
  X,
  MousePointerClick,
} from "lucide-react";
import type { SeatingGuest, SeatingGuestSide } from "@/types/seating-guest";
import {
  categoryColor,
  dietaryIcon,
  guestFullName,
  guestInitials,
  sideDotClass,
} from "@/types/seating-guest";
import { useSeatingStore } from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import { useSeatingDragStore } from "@/stores/seating-drag-store";

type SortKey = "name" | "category" | "side" | "household";
type AssignedFilter = "all" | "unassigned" | "assigned";

interface Props {
  guests: SeatingGuest[];
  eventId: string;
  // When the user clicks "Keep household together" during drag
  onHouseholdDragStart?: (householdId: string) => void;
}

const SIDE_LABEL: Record<SeatingGuestSide | "all", string> = {
  all: "All",
  bride: "Bride",
  groom: "Groom",
  mutual: "Mutual",
};

export function GuestsSidebar({ guests, eventId }: Props) {
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<SeatingGuestSide | "all">("all");
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [householdFilter, setHouseholdFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const tables = useSeatingStore((s) => s.tables);
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[eventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const assignGuest = useSeatingAssignmentsStore((s) => s.assignGuest);
  const unassignGuest = useSeatingAssignmentsStore((s) => s.unassignGuest);
  const selectTable = useSeatingStore((s) => s.selectTable);
  const pickedGuestIds = useSeatingDragStore((s) => s.pickedGuestIds);
  const pickGuest = useSeatingDragStore((s) => s.pickGuest);
  const clearPick = useSeatingDragStore((s) => s.clearPick);
  const startDrag = useSeatingDragStore((s) => s.startDrag);
  const endDrag = useSeatingDragStore((s) => s.endDrag);

  const assignedSet = useMemo(
    () => new Set(assignments.map((a) => a.guestId)),
    [assignments],
  );
  const guestToTable = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assignments) map.set(a.guestId, a.tableId);
    return map;
  }, [assignments]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) for (const c of g.categories) set.add(c);
    return Array.from(set).sort();
  }, [guests]);

  const dietaryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) for (const d of g.dietary) set.add(d);
    return Array.from(set).sort();
  }, [guests]);

  const householdOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) set.add(g.householdId);
    return Array.from(set).sort();
  }, [guests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = guests;

    if (q) {
      list = list.filter((g) => guestFullName(g).toLowerCase().includes(q));
    }
    if (sideFilter !== "all") {
      list = list.filter((g) => g.side === sideFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((g) => g.categories.includes(categoryFilter));
    }
    if (dietaryFilter !== "all") {
      list = list.filter((g) => g.dietary.includes(dietaryFilter));
    }
    if (householdFilter !== "all") {
      list = list.filter((g) => g.householdId === householdFilter);
    }
    if (assignedFilter === "assigned") {
      list = list.filter((g) => assignedSet.has(g.id));
    } else if (assignedFilter === "unassigned") {
      list = list.filter((g) => !assignedSet.has(g.id));
    }

    const sorted = [...list];
    if (sort === "name") {
      sorted.sort((a, b) => guestFullName(a).localeCompare(guestFullName(b)));
    } else if (sort === "side") {
      sorted.sort(
        (a, b) =>
          a.side.localeCompare(b.side) ||
          guestFullName(a).localeCompare(guestFullName(b)),
      );
    } else if (sort === "household") {
      sorted.sort(
        (a, b) =>
          a.householdId.localeCompare(b.householdId) ||
          guestFullName(a).localeCompare(guestFullName(b)),
      );
    } else if (sort === "category") {
      sorted.sort(
        (a, b) =>
          (a.categories[0] ?? "").localeCompare(b.categories[0] ?? "") ||
          guestFullName(a).localeCompare(guestFullName(b)),
      );
    }
    return sorted;
  }, [
    guests,
    query,
    sideFilter,
    categoryFilter,
    dietaryFilter,
    householdFilter,
    assignedFilter,
    assignedSet,
    sort,
  ]);

  const unassignedCount = guests.length - assignedSet.size;

  const tableLabel = (tableId: string) => {
    const t = tables.find((x) => x.id === tableId);
    return t?.label?.trim() || (t ? `T${t.number}` : "—");
  };

  const tableCapacity = (tableId: string) =>
    tables.find((t) => t.id === tableId)?.seats ?? 0;
  const occupiedCount = (tableId: string) =>
    assignments.filter((a) => a.tableId === tableId).length;

  // Click the picked guest → click a table (context: the canvas toolbar
  // shows a "pick mode" indicator; here we expose the bulk-assign helper).
  const hasPick = !!pickedGuestIds?.length;

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    guestId: string,
  ) => {
    const ids =
      pickedGuestIds && pickedGuestIds.length > 1 && pickedGuestIds.includes(guestId)
        ? pickedGuestIds
        : [guestId];
    startDrag(ids);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-ananya-guest-ids",
      JSON.stringify(ids),
    );
    // Also plain text so debugging in dev tools is readable.
    e.dataTransfer.setData("text/plain", ids.join(","));
  };

  const handleDragEnd = () => endDrag();

  const handleHouseholdDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    householdId: string,
  ) => {
    const members = guests
      .filter((g) => g.householdId === householdId && !assignedSet.has(g.id))
      .map((g) => g.id);
    if (!members.length) {
      e.preventDefault();
      return;
    }
    startDrag(members, true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-ananya-guest-ids",
      JSON.stringify(members),
    );
  };

  // "Assign to…" for picked guests — inline select
  const assignPickToTable = (tableId: string) => {
    if (!pickedGuestIds?.length) return;
    const cap = tableCapacity(tableId);
    const currentOcc = occupiedCount(tableId);
    let free = cap - currentOcc;
    const toAssign = [];
    for (const gid of pickedGuestIds) {
      if (free <= 0) break;
      if (assignedSet.has(gid)) continue;
      toAssign.push(gid);
      free -= 1;
    }
    for (const gid of toAssign) assignGuest(gid, tableId);
    clearPick();
    selectTable(tableId);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Summary + search */}
      <div className="border-b border-border bg-ivory/30 px-4 py-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          <span>
            <strong className="text-ink">{unassignedCount}</strong> of {guests.length}{" "}
            unassigned
          </span>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] hover:bg-white",
              filtersOpen ? "bg-white text-ink" : "text-ink-muted",
            )}
          >
            <Filter size={11} strokeWidth={1.6} />
            Filters
            <ChevronDown
              size={10}
              strokeWidth={1.6}
              className={filtersOpen ? "rotate-180" : ""}
            />
          </button>
        </div>
        <div className="relative">
          <Search
            size={12}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            className="w-full rounded border border-border bg-white py-1.5 pl-7 pr-2 text-[12px] text-ink outline-none focus:border-ink/30"
          />
        </div>
      </div>

      {/* Pick-mode banner */}
      {hasPick && (
        <div className="flex items-center justify-between gap-2 border-b border-gold/40 bg-gold-pale/30 px-4 py-2 text-[11px] text-ink">
          <div className="flex items-center gap-1.5">
            <MousePointerClick size={12} strokeWidth={1.7} />
            {pickedGuestIds!.length} picked · click a table to assign
          </div>
          <button
            onClick={clearPick}
            className="rounded p-0.5 text-ink-muted hover:bg-white hover:text-ink"
          >
            <X size={12} strokeWidth={1.7} />
          </button>
        </div>
      )}

      {/* Advanced filters */}
      {filtersOpen && (
        <div className="space-y-2 border-b border-border bg-ivory/20 px-4 py-3 text-[11px]">
          <FilterRow label="Side">
            {(["all", "bride", "groom", "mutual"] as const).map((s) => (
              <Chip
                key={s}
                active={sideFilter === s}
                onClick={() => setSideFilter(s)}
              >
                {SIDE_LABEL[s]}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Status">
            {(["all", "unassigned", "assigned"] as AssignedFilter[]).map((s) => (
              <Chip
                key={s}
                active={assignedFilter === s}
                onClick={() => setAssignedFilter(s)}
              >
                {s === "all" ? "All" : s === "unassigned" ? "Unassigned" : "Assigned"}
              </Chip>
            ))}
          </FilterRow>
          {categoryOptions.length > 0 && (
            <FilterRow label="Category">
              <SelectBox
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: "all", label: "All" }, ...categoryOptions.map((c) => ({ value: c, label: c }))]}
              />
            </FilterRow>
          )}
          {dietaryOptions.length > 0 && (
            <FilterRow label="Dietary">
              <SelectBox
                value={dietaryFilter}
                onChange={setDietaryFilter}
                options={[{ value: "all", label: "All" }, ...dietaryOptions.map((d) => ({ value: d, label: d }))]}
              />
            </FilterRow>
          )}
          {householdOptions.length > 0 && (
            <FilterRow label="Household">
              <SelectBox
                value={householdFilter}
                onChange={setHouseholdFilter}
                options={[{ value: "all", label: "All" }, ...householdOptions.map((h) => ({ value: h, label: h }))]}
              />
            </FilterRow>
          )}
          <FilterRow label="Sort">
            <SelectBox
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={[
                { value: "name", label: "Name" },
                { value: "side", label: "Side" },
                { value: "household", label: "Household" },
                { value: "category", label: "Category" },
              ]}
            />
          </FilterRow>
        </div>
      )}

      {/* Quick "assign picked to…" selector */}
      {hasPick && tables.length > 0 && (
        <div className="border-b border-border bg-white px-4 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Assign picked to…
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {tables
              .slice()
              .sort((a, b) => a.number - b.number)
              .map((t) => {
                const free = t.seats - occupiedCount(t.id);
                return (
                  <button
                    key={t.id}
                    disabled={free <= 0}
                    onClick={() => assignPickToTable(t.id)}
                    className={cn(
                      "rounded border border-border bg-ivory px-2 py-0.5 text-[10.5px] text-ink hover:border-ink/30 hover:bg-white",
                      free <= 0 && "cursor-not-allowed opacity-40",
                    )}
                    title={`${free} free seat${free === 1 ? "" : "s"}`}
                  >
                    {t.label?.trim() || `T${t.number}`} · {free}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Guest list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-[12px] italic text-ink-faint">
            No guests match these filters.
          </div>
        ) : (
          filtered.map((g) => {
            const assigned = assignedSet.has(g.id);
            const picked = pickedGuestIds?.includes(g.id) ?? false;
            const assignedTable = guestToTable.get(g.id);
            return (
              <div
                key={g.id}
                draggable
                onDragStart={(e) => handleDragStart(e, g.id)}
                onDragEnd={handleDragEnd}
                onClick={() => pickGuest(g.id)}
                className={cn(
                  "group flex cursor-grab items-start gap-2 border-b border-border/40 px-4 py-2 text-[12px] hover:bg-ivory/40 active:cursor-grabbing",
                  assigned && "opacity-55",
                  picked && "bg-gold-pale/40",
                )}
                title={
                  assigned
                    ? `Seated at ${tableLabel(assignedTable!)}`
                    : "Click to pick · drag to assign"
                }
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border bg-ivory font-serif text-[10.5px] text-ink">
                  {guestInitials(g)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", sideDotClass(g.side))}
                      title={g.side}
                    />
                    <span className="truncate text-ink">{guestFullName(g)}</span>
                    {g.dietary.length > 0 && (
                      <span
                        className="ml-auto inline-flex h-4 min-w-[14px] items-center justify-center rounded-sm bg-sage-pale px-1 font-mono text-[9px] uppercase text-sage"
                        title={g.dietary.join(", ")}
                      >
                        {dietaryIcon(g.dietary)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-[9.5px] text-ink-faint">
                    {g.categories.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className={cn(
                          "inline-flex h-1.5 w-1.5 rounded-full",
                          categoryColor(c),
                        )}
                        title={c}
                      />
                    ))}
                    {g.categories.length > 3 && (
                      <span>+{g.categories.length - 3}</span>
                    )}
                    {assigned ? (
                      <span className="ml-auto text-[9.5px] text-ink-muted">
                        → {tableLabel(assignedTable!)}
                      </span>
                    ) : null}
                  </div>
                </div>
                {assigned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unassignGuest(g.id);
                    }}
                    className="mt-1 flex h-5 w-5 items-center justify-center rounded text-ink-faint opacity-0 hover:bg-rose-pale/50 hover:text-rose group-hover:opacity-100"
                    title="Unassign"
                  >
                    <X size={11} strokeWidth={1.7} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Household drag strip */}
      {householdOptions.length > 0 && (
        <div className="border-t border-border bg-ivory/40 px-4 py-2">
          <div className="mb-1 flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
            <Users size={10} strokeWidth={1.7} /> Drag household
          </div>
          <div className="flex flex-wrap gap-1">
            {householdOptions.slice(0, 8).map((hid) => {
              const members = guests.filter((g) => g.householdId === hid);
              const unassigned = members.filter((m) => !assignedSet.has(m.id));
              if (unassigned.length === 0) return null;
              const last = members[0]?.lastName ?? hid;
              return (
                <button
                  key={hid}
                  draggable={unassigned.length > 0}
                  onDragStart={(e) => handleHouseholdDragStart(e, hid)}
                  onDragEnd={handleDragEnd}
                  className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-ink hover:border-ink/30"
                  title={`${unassigned.length} of ${members.length} unassigned`}
                >
                  {last} · {unassigned.length}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[68px] font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10.5px] transition",
        active
          ? "border-ink/50 bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function SelectBox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-border bg-white px-1.5 py-0.5 text-[10.5px] text-ink outline-none focus:border-ink/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Icon re-exports for external use by the combined sidebar
export { SortAsc };
