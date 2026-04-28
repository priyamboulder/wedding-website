"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronDown,
  Download,
  MapPin,
  Search,
  Timer,
  UserPlus,
} from "lucide-react";
import { RadialProgress } from "./RadialProgress";
import { StatusIndicator } from "./StatusIndicator";
import {
  getEventStats,
  rsvpKey,
  type RsvpEvent,
  type RsvpGuest,
  type RsvpHousehold,
  type RsvpStatus,
  type Side,
  type DietaryTag,
} from "@/stores/rsvp-store";

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fmtLongDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type StatusFilter = "all" | RsvpStatus;
type DietFilter = "all" | DietaryTag | "Unspecified";
type SideFilter = "all" | Side;

interface EventDetailPanelProps {
  event: RsvpEvent;
  guests: RsvpGuest[];
  households: RsvpHousehold[];
  rsvps: Record<string, RsvpStatus>;
  onCycleRsvp: (guestId: string, eventId: string) => void;
  onBulkDecline: (eventId: string) => void;
  onOpenHousehold: (householdId: string) => void;
  onExportCaterer: (eventId: string) => void;
  onSendReminders: (eventId: string) => void;
}

export function EventDetailPanel({
  event,
  guests,
  households,
  rsvps,
  onCycleRsvp,
  onBulkDecline,
  onOpenHousehold,
  onExportCaterer,
  onSendReminders,
}: EventDetailPanelProps) {
  const stats = useMemo(
    () => getEventStats(event.id, guests, rsvps),
    [event.id, guests, rsvps],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dietFilter, setDietFilter] = useState<DietFilter>("all");
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");

  // Guests invited to this event, then filtered
  const visibleGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      const status = rsvps[rsvpKey(g.id, event.id)];
      if (status === undefined) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (sideFilter !== "all" && g.side !== sideFilter) return false;
      if (dietFilter !== "all") {
        if (dietFilter === "Unspecified") {
          if (g.dietary.length > 0) return false;
        } else if (!g.dietary.includes(dietFilter as DietaryTag)) return false;
      }
      if (q) {
        const hay = `${g.firstName} ${g.lastName} ${g.relationship ?? ""}`
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [guests, rsvps, event.id, search, statusFilter, dietFilter, sideFilter]);

  // Group by side → household
  const grouped = useMemo(() => {
    const groups: Record<Side, Record<string, RsvpGuest[]>> = {
      bride: {},
      groom: {},
    };
    for (const g of visibleGuests) {
      (groups[g.side][g.householdId] ||= []).push(g);
    }
    return groups;
  }, [visibleGuests]);

  const hhById = useMemo(() => {
    const m: Record<string, RsvpHousehold> = {};
    for (const h of households) m[h.id] = h;
    return m;
  }, [households]);

  const pct = stats.invited > 0 ? stats.confirmed / stats.invited : 0;
  const pctColor =
    pct >= 0.75
      ? "var(--color-sage)"
      : pct >= 0.5
        ? "var(--color-saffron)"
        : "var(--color-rose)";

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      className="editorial-padding space-y-8"
    >
      {/* Event header */}
      <section>
        <p
          className="m-0 text-[10px] font-medium uppercase tracking-[0.22em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Event {event.sortOrder} of 9
        </p>
        <h1
          className="m-0 mt-2 leading-[1.05] text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 56,
            fontWeight: 400,
            letterSpacing: "-0.015em",
          }}
        >
          {event.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {fmtLongDate(event.date)}
            {event.time && ` · ${event.time}`}
          </span>
          {event.venue && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}
            </span>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-5 rounded-xl border border-border bg-white px-6 py-5">
          <RadialProgress
            value={stats.confirmed}
            total={stats.invited}
            size={84}
            stroke={6}
            color={pctColor}
          >
            <span
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {stats.invited > 0 ? Math.round(pct * 100) : 0}
              <span className="text-xs">%</span>
            </span>
          </RadialProgress>
          <div>
            <p
              className="m-0 text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {stats.confirmed}{" "}
              <span className="text-ink-muted">of {stats.invited}</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-muted"
               style={{ fontFamily: "var(--font-mono)" }}>
              Confirmed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MiniStat
            tone="sage"
            count={stats.confirmed}
            label="Confirmed"
            icon="check"
          />
          <MiniStat
            tone="gold"
            count={stats.pending}
            label="Pending"
            icon="clock"
          />
          <MiniStat
            tone="rose"
            count={stats.declined}
            label="Declined"
            icon="x"
          />
        </div>

        <DietaryBox stats={stats} guests={guests} eventId={event.id} rsvps={rsvps} />
      </section>

      {/* Action bar */}
      <section className="flex flex-wrap items-center gap-2 border-y border-border/60 py-3">
        <ActionButton
          icon={<Bell className="h-3.5 w-3.5" />}
          label={`Send Reminders${
            stats.pending ? ` · ${stats.pending}` : ""
          }`}
          onClick={() => onSendReminders(event.id)}
          disabled={stats.pending === 0}
        />
        <ActionButton
          icon={<Download className="h-3.5 w-3.5" />}
          label="Export for Caterer"
          onClick={() => onExportCaterer(event.id)}
          disabled={stats.confirmed === 0}
        />
        <ActionButton
          icon={<Timer className="h-3.5 w-3.5" />}
          label="Mark Deadline Passed"
          onClick={() => onBulkDecline(event.id)}
          disabled={stats.pending === 0}
          tone="danger"
        />
        <ActionButton
          icon={<UserPlus className="h-3.5 w-3.5" />}
          label="Quick Add Guest"
          onClick={() => alert("Add-guest flow lives in the main Guests module.")}
        />
      </section>

      {/* Filter bar */}
      <section className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests by name or relationship…"
            className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "declined", label: "Declined" },
          ]}
        />
        <FilterSelect
          label="Diet"
          value={dietFilter}
          onChange={(v) => setDietFilter(v as DietFilter)}
          options={[
            { value: "all", label: "All diets" },
            { value: "Veg", label: "Veg" },
            { value: "Jain", label: "Jain" },
            { value: "Non-veg", label: "Non-veg" },
            { value: "Unspecified", label: "Unspecified" },
          ]}
        />
        <FilterSelect
          label="Side"
          value={sideFilter}
          onChange={(v) => setSideFilter(v as SideFilter)}
          options={[
            { value: "all", label: "Both sides" },
            { value: "bride", label: "Bride's side" },
            { value: "groom", label: "Groom's side" },
          ]}
        />
      </section>

      {/* Guest list, grouped */}
      <section className="space-y-8">
        {(["bride", "groom"] as const).map((side) => {
          const householdIds = Object.keys(grouped[side]);
          if (householdIds.length === 0) return null;
          const sideGuestCount = householdIds.reduce(
            (a, id) => a + grouped[side][id].length,
            0,
          );
          return (
            <SideGroup
              key={side}
              side={side}
              count={sideGuestCount}
              householdIds={householdIds}
              householdById={hhById}
              guestsByHousehold={grouped[side]}
              rsvps={rsvps}
              eventId={event.id}
              onCycleRsvp={onCycleRsvp}
              onOpenHousehold={onOpenHousehold}
            />
          );
        })}
        {visibleGuests.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-white/60 p-10 text-center">
            <p className="text-sm text-ink-muted">
              No guests match these filters.
            </p>
          </div>
        )}
      </section>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function MiniStat({
  tone,
  count,
  label,
}: {
  tone: "sage" | "gold" | "rose";
  count: number;
  label: string;
  icon?: string;
}) {
  const bg = {
    sage: "bg-sage-pale/50 border-sage/30",
    gold: "bg-saffron-pale/50 border-saffron/30",
    rose: "bg-rose-pale/50 border-rose/30",
  }[tone];
  const color = {
    sage: "text-sage",
    gold: "text-saffron",
    rose: "text-rose",
  }[tone];
  return (
    <div className={cn("rounded-xl border px-4 py-4", bg)}>
      <p
        className={cn("m-0 leading-none", color)}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 34,
          fontWeight: 500,
        }}
      >
        {count}
      </p>
      <p
        className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
    </div>
  );
}

function DietaryBox({
  stats,
  guests,
  eventId,
  rsvps,
}: {
  stats: ReturnType<typeof getEventStats>;
  guests: RsvpGuest[];
  eventId: string;
  rsvps: Record<string, RsvpStatus>;
}) {
  const d = stats.dietary;
  const missing = guests.some((g) => {
    const s = rsvps[rsvpKey(g.id, eventId)];
    return s === "confirmed" && g.dietary.length === 0;
  });
  return (
    <div className="rounded-xl border border-border bg-white px-5 py-4 md:min-w-[240px]">
      <p
        className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Dietary · Confirmed
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <DietRow label="Veg" value={d.Veg} />
        <DietRow label="Jain" value={d.Jain} />
        <DietRow label="Non-veg" value={d["Non-veg"]} />
        <DietRow label="Unspecified" value={d.Unspecified} />
      </div>
      {missing && (
        <div className="mt-3 flex items-start gap-1.5 rounded-md bg-saffron-pale/60 px-2 py-1.5 text-[11px] text-ink-soft">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-saffron" />
          <span>Some confirmed guests have no dietary preference set.</span>
        </div>
      )}
    </div>
  );
}

function DietRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-muted">{label}</span>
      <span
        className="text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors",
        "border-border bg-white text-ink-muted hover:border-gold-light hover:text-ink",
        tone === "danger" && "hover:border-rose hover:text-rose",
        disabled && "cursor-not-allowed opacity-40 hover:border-border hover:text-ink-muted",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-full border border-border bg-white py-2 pl-4 pr-8 text-xs text-ink-muted hover:border-gold-light focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3 w-3 text-ink-faint" />
    </label>
  );
}

function SideGroup({
  side,
  count,
  householdIds,
  householdById,
  guestsByHousehold,
  rsvps,
  eventId,
  onCycleRsvp,
  onOpenHousehold,
}: {
  side: Side;
  count: number;
  householdIds: string[];
  householdById: Record<string, RsvpHousehold>;
  guestsByHousehold: Record<string, RsvpGuest[]>;
  rsvps: Record<string, RsvpStatus>;
  eventId: string;
  onCycleRsvp: (guestId: string, eventId: string) => void;
  onOpenHousehold: (householdId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const title = side === "bride" ? "Bride's Side" : "Groom's Side";
  const sideColor =
    side === "bride"
      ? "text-rose"
      : "text-sage";
  const accent =
    side === "bride" ? "bg-rose-pale" : "bg-sage-pale";

  // Sort households by name for stable order
  const sortedHouseholdIds = [...householdIds].sort((a, b) =>
    (householdById[a]?.name ?? "").localeCompare(householdById[b]?.name ?? ""),
  );

  return (
    <div>
      <button
        onClick={() => setOpen((s) => !s)}
        className="group flex w-full items-center justify-between border-b border-border/60 pb-2"
      >
        <div className="flex items-baseline gap-3">
          <h3
            className={cn("m-0 leading-none", sideColor)}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 500,
            }}
          >
            {title}
          </h3>
          <span className="text-xs text-ink-muted">
            {count} {count === 1 ? "guest" : "guests"} · {sortedHouseholdIds.length}{" "}
            {sortedHouseholdIds.length === 1 ? "household" : "households"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink-muted transition-transform",
            !open && "-rotate-90",
          )}
        />
      </button>

      {open && (
        <div className="mt-5 space-y-6">
          {sortedHouseholdIds.map((hhId) => {
            const hh = householdById[hhId];
            if (!hh) return null;
            return (
              <div key={hhId}>
                <button
                  onClick={() => onOpenHousehold(hhId)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", accent)}
                  />
                  <span
                    className="text-[13px] uppercase tracking-[0.14em] text-ink-muted group-hover:text-gold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {hh.name}
                  </span>
                </button>
                <ul className="mt-2 divide-y divide-border/50">
                  {guestsByHousehold[hhId].map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      status={rsvps[rsvpKey(g.id, eventId)]}
                      onCycle={() => onCycleRsvp(g.id, eventId)}
                      onOpenHousehold={() => onOpenHousehold(g.householdId)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GuestRow({
  guest,
  status,
  onCycle,
  onOpenHousehold,
}: {
  guest: RsvpGuest;
  status: RsvpStatus | undefined;
  onCycle: () => void;
  onOpenHousehold: () => void;
}) {
  const initials = (guest.firstName[0] ?? "") + (guest.lastName[0] ?? "");
  const sideBg =
    guest.side === "bride" ? "bg-rose-pale text-rose" : "bg-sage-pale text-sage";

  return (
    <li className="flex items-center gap-3 py-2.5">
      <button
        onClick={onOpenHousehold}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
          sideBg,
        )}
        aria-label={`Open household ${guest.householdId}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {initials.toUpperCase()}
      </button>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm text-ink">
          {guest.honorific ? `${guest.honorific} ` : ""}
          {guest.firstName} {guest.lastName}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-muted">
          {guest.relationship && <span>{guest.relationship}</span>}
          {guest.dietary.length > 0 &&
            guest.dietary.map((d) => (
              <span
                key={d}
                className="inline-flex items-center rounded-full bg-ivory-deep px-1.5 py-0.5 text-[10px] text-ink-soft"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {d}
              </span>
            ))}
        </p>
      </div>
      <StatusIndicator
        status={status}
        onClick={onCycle}
        ariaLabel={`Toggle RSVP status for ${guest.firstName} ${guest.lastName}`}
      />
    </li>
  );
}
