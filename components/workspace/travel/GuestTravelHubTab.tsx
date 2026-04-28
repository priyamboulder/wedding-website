"use client";

// ── Guest Travel Hub tab ──────────────────────────────────────────────────
// Who's coming from where, when they arrive, where they're staying.
// Arrival clusters group guests by date so the couple can coordinate
// airport pickup with Transportation.
//
// The full per-guest source-of-truth lives in the Guest module. This tab
// is the planner/couple-side view of travel coordination specifically.

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Plane,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useTravelStore } from "@/stores/travel-store";
import {
  GUEST_HOTEL_STATUS_LABEL,
  type GuestHotelStatus,
  type GuestTravelEntry,
} from "@/types/travel";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  MiniStat,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";

function formatArrivalDay(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function GuestTravelHubTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const all = useTravelStore((s) => s.guests);
  const add = useTravelStore((s) => s.addGuest);
  const update = useTravelStore((s) => s.updateGuest);
  const del = useTravelStore((s) => s.deleteGuest);

  const rows = useMemo(
    () =>
      all
        .filter((g) => g.category_id === category.id)
        .sort((a, b) => {
          if (a.arrives_date === b.arrives_date)
            return a.sort_order - b.sort_order;
          if (!a.arrives_date) return 1;
          if (!b.arrives_date) return -1;
          return a.arrives_date < b.arrives_date ? -1 : 1;
        }),
    [all, category.id],
  );

  const totalGuests = rows.reduce((a, r) => a + (r.party_size || 1), 0);
  const booked = rows.filter((r) => r.status === "booked").length;
  const unbooked = rows.filter((r) => r.status === "not_booked").length;

  // Arrival clusters — date-by-date guest party totals.
  const clusters = useMemo(() => {
    const map = new Map<string, { entries: GuestTravelEntry[]; count: number }>();
    for (const r of rows) {
      if (!r.arrives_date) continue;
      const cur = map.get(r.arrives_date) ?? { entries: [], count: 0 };
      cur.entries.push(r);
      cur.count += r.party_size || 1;
      map.set(r.arrives_date, cur);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [rows]);

  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.guest_name.toLowerCase().includes(q) ||
        r.from_city.toLowerCase().includes(q) ||
        r.hotel_name.toLowerCase().includes(q),
    );
  }, [rows, query]);

  function handleAdd() {
    add({
      category_id: category.id,
      guest_name: "",
      party_size: 1,
      from_city: "",
      arrives_date: "",
      arrives_time: "",
      flight: "",
      hotel_name: "",
      status: "not_booked",
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Guest travel"
        title="Who's coming from where"
        description="A live look at guest travel — arrival dates, hotels, who still hasn't booked. Arrival clusters feed airport pickup into the Transportation workspace."
        right={
          <a
            href="/guests"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <Users size={11} strokeWidth={2} /> Manage guests
            <ExternalLink size={10} strokeWidth={2} />
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Guests tracked" value={totalGuests || "—"} />
        <MiniStat label="Entries" value={rows.length} />
        <MiniStat
          label="Booked"
          value={booked}
          tone="sage"
          hint={rows.length > 0 ? `${Math.round((booked / rows.length) * 100)}%` : ""}
        />
        <MiniStat
          label="Not booked"
          value={unbooked}
          tone={unbooked > 0 ? "rose" : "ink"}
        />
      </div>

      {/* Arrival clusters */}
      <PanelCard
        icon={<Plane size={14} strokeWidth={1.8} />}
        title="Arrival clusters"
        badge={
          clusters.length > 0 ? (
            <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
              {clusters.length} date{clusters.length === 1 ? "" : "s"}
            </span>
          ) : null
        }
      >
        <p className="mb-4 text-[12.5px] text-ink-muted">
          Group guests by arrival date so you can share pickup rosters with
          the Transportation vendor.
        </p>
        {clusters.length === 0 ? (
          <p className="text-[12px] italic text-ink-faint">
            Add arrival dates below and clusters will surface here.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-white">
            {clusters.map(([date, { entries, count }]) => (
              <li
                key={date}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    {formatArrivalDay(date)}
                  </p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-ink-faint">
                    {entries.length} party{entries.length === 1 ? "" : "ies"} ·{" "}
                    {new Set(entries.map((e) => e.flight).filter(Boolean)).size}{" "}
                    flight
                    {new Set(entries.map((e) => e.flight).filter(Boolean))
                      .size === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
                <Tag tone="saffron">{count} guests</Tag>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      {/* Guest travel table */}
      <PanelCard
        icon={<Users size={14} strokeWidth={1.8} />}
        title="Guest travel table"
        badge={
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {rows.length} row{rows.length === 1 ? "" : "s"}
          </span>
        }
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={12}
              strokeWidth={2}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city, hotel…"
              className="w-full rounded-md border border-border bg-white py-1.5 pl-7 pr-2.5 text-[12px] focus:border-saffron/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={2} /> Add guest
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-3 py-4 text-center text-[12px] italic text-ink-muted">
            No guest travel tracked yet. Add the first entry — usually the
            elders flying in.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/60 text-left font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                  <Th>Guest</Th>
                  <Th>From</Th>
                  <Th>Arrives</Th>
                  <Th>Flight</Th>
                  <Th>Hotel</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                  <th aria-label="actions" className="w-6" />
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <GuestRow
                    key={row.id}
                    row={row}
                    onUpdate={(patch) => update(row.id, patch)}
                    onDelete={() => del(row.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-2 font-normal">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-2 py-1.5 align-middle">{children}</td>;
}

function GuestRow({
  row,
  onUpdate,
  onDelete,
}: {
  row: GuestTravelEntry;
  onUpdate: (patch: Partial<GuestTravelEntry>) => void;
  onDelete: () => void;
}) {
  const statusTone: "sage" | "rose" | "stone" =
    row.status === "booked"
      ? "sage"
      : row.status === "not_booked"
        ? "rose"
        : "stone";

  return (
    <tr className="border-b border-border/40 last:border-0">
      <Td>
        <div className="flex items-center gap-1.5">
          <input
            value={row.guest_name}
            onChange={(e) => onUpdate({ guest_name: e.target.value })}
            placeholder="Guest name"
            className="flex-1 min-w-[120px] rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
          />
          <input
            type="number"
            min={1}
            value={row.party_size || 1}
            onChange={(e) =>
              onUpdate({ party_size: Number(e.target.value) || 1 })
            }
            className="w-10 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[11px] tabular-nums hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
            aria-label="Party size"
          />
        </div>
      </Td>
      <Td>
        <input
          value={row.from_city}
          onChange={(e) => onUpdate({ from_city: e.target.value })}
          placeholder="City"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
      </Td>
      <Td>
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={row.arrives_date}
            onChange={(e) => onUpdate({ arrives_date: e.target.value })}
            className="rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[11px] hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
          />
          <input
            type="time"
            value={row.arrives_time}
            onChange={(e) => onUpdate({ arrives_time: e.target.value })}
            className="w-[75px] rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[11px] hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
          />
        </div>
      </Td>
      <Td>
        <input
          value={row.flight}
          onChange={(e) => onUpdate({ flight: e.target.value })}
          placeholder="BA 139"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[11px] hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
      </Td>
      <Td>
        <input
          value={row.hotel_name}
          onChange={(e) => onUpdate({ hotel_name: e.target.value })}
          placeholder="Hotel"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
      </Td>
      <Td>
        <select
          value={row.status}
          onChange={(e) =>
            onUpdate({ status: e.target.value as GuestHotelStatus })
          }
          className="rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        >
          {(Object.keys(GUEST_HOTEL_STATUS_LABEL) as GuestHotelStatus[]).map(
            (s) => (
              <option key={s} value={s}>
                {GUEST_HOTEL_STATUS_LABEL[s]}
              </option>
            ),
          )}
        </select>
        <div className="mt-0.5">
          <Tag tone={statusTone}>{GUEST_HOTEL_STATUS_LABEL[row.status]}</Tag>
        </div>
      </Td>
      <Td>
        <input
          value={row.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="—"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
      </Td>
      <Td>
        <button
          type="button"
          aria-label="Delete"
          onClick={onDelete}
          className="rounded p-0.5 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
        >
          <Trash2 size={11} strokeWidth={1.8} />
        </button>
      </Td>
    </tr>
  );
}
