"use client";

// ── Logistics Session 1 · Tiers & capacity ───────────────────────────────
// Reads & writes through the existing mehndi-store so this session is in
// permanent two-way sync with Tab 2 of the full workspace. Pulls the
// capacity calculator from lib/calculators/mehendi-capacity.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Crown,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultSetup,
  useMehndiStore,
} from "@/stores/mehndi-store";
import { computeMehendiCapacity } from "@/lib/calculators/mehendi-capacity";
import {
  DESIGN_TIER_DESCRIPTION,
  DESIGN_TIER_LABEL,
  DESIGN_TIER_MINUTES,
  type DesignTier,
  type SchedulingMode,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";

const TIER_IDS: DesignTier[] = ["quick", "classic", "detailed"];

const SCHEDULING_OPTIONS: Array<{
  id: SchedulingMode;
  label: string;
  desc: string;
}> = [
  {
    id: "priority_queue",
    label: "Priority queue",
    desc: "Bride first, then family, then guests by arrival.",
  },
  {
    id: "appointments",
    label: "Appointment slots",
    desc: "Every guest gets a fixed time. Quietest, most precise.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    desc: "VIPs scheduled. Everyone else walks up.",
  },
];

export function TiersAndCapacitySession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <TierBlock category={category} />
      <CapacityBlock category={category} />
      <DistributionBlock category={category} />
      <VipBlock category={category} />
      <DetailedTierBlock category={category} />
      <SignupConfigBlock category={category} />
    </div>
  );
}

// ─── Tier block ──────────────────────────────────────────────────────────

function TierBlock({ category }: { category: WorkspaceCategory }) {
  const stored = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = stored ?? defaultSetup(category.id);
  const update = useMehndiStore((s) => s.updateSetup);

  return (
    <SectionLabel
      eyebrow="Step 1"
      title="Define the tiers your guests can pick"
      description="Three tiers cover most weddings — give each one a spot count so the sign-up page caps demand. Tap a tier to make it the default the capacity calculator uses."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {TIER_IDS.map((tier) => {
          const active = setup.avg_tier === tier;
          const cap = setup.tier_capacity?.[tier] ?? 0;
          return (
            <div
              key={tier}
              className={cn(
                "rounded-md border p-3 transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/30"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <button
                type="button"
                onClick={() => update(category.id, { avg_tier: tier })}
                className="block w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-[16px] text-ink">
                    {DESIGN_TIER_LABEL[tier]}
                  </span>
                  <span className="font-mono text-[10.5px] tabular-nums text-saffron">
                    {DESIGN_TIER_MINUTES[tier]} min
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">
                  {DESIGN_TIER_DESCRIPTION[tier]}
                </p>
                {active && (
                  <span className="mt-2 inline-flex rounded-full bg-saffron/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory">
                    Default
                  </span>
                )}
              </button>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                <label className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                  Spots
                </label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={cap}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isNaN(n)) return;
                    update(category.id, {
                      tier_capacity: {
                        ...setup.tier_capacity,
                        [tier]: Math.max(0, n),
                      },
                    });
                  }}
                  className="w-16 rounded border border-border bg-white px-1.5 py-0.5 text-right text-[12px] tabular-nums focus:border-saffron/50 focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionLabel>
  );
}

// ─── Capacity block ──────────────────────────────────────────────────────

function CapacityBlock({ category }: { category: WorkspaceCategory }) {
  const stored = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = stored ?? defaultSetup(category.id);
  const update = useMehndiStore((s) => s.updateSetup);

  const calc = useMemo(
    () =>
      computeMehendiCapacity({
        artistCount: setup.stations,
        hoursOnSite: setup.event_duration_hours,
        expectedGuests: setup.expected_guest_count,
        defaultTier: setup.avg_tier,
      }),
    [setup],
  );
  const shortfall = calc.unservableGuests > 0;

  return (
    <SectionLabel
      eyebrow="Step 2"
      title="Can your artists serve everyone?"
      description="Tweak any of the three numbers below and the math updates live. The calculator uses your default tier."
    >
      <div
        className={cn(
          "mb-4 flex items-start gap-3 rounded-md border px-3 py-2.5 text-[13px] leading-relaxed",
          shortfall
            ? "border-rose/30 bg-rose-pale/30 text-ink"
            : "border-sage/30 bg-sage-pale/30 text-ink",
        )}
      >
        <span
          className={cn(
            "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            shortfall ? "bg-rose/15 text-rose" : "bg-sage/20 text-sage",
          )}
        >
          <AlertTriangle size={11} strokeWidth={1.8} />
        </span>
        <span>
          {shortfall
            ? `With ${setup.stations} artist${setup.stations === 1 ? "" : "s"} over ${setup.event_duration_hours} hour${setup.event_duration_hours === 1 ? "" : "s"} at ${DESIGN_TIER_LABEL[setup.avg_tier]}, you can serve ${calc.servableGuests} of your ${setup.expected_guest_count} guests. You're ${calc.unservableGuests} short.`
            : `With ${setup.stations} artist${setup.stations === 1 ? "" : "s"} over ${setup.event_duration_hours} hour${setup.event_duration_hours === 1 ? "" : "s"} at ${DESIGN_TIER_LABEL[setup.avg_tier]}, you can comfortably serve all ${setup.expected_guest_count} guests.`}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <NumberField
          label="Artists"
          helper="Each artist = one station"
          value={setup.stations}
          min={1}
          max={20}
          onChange={(v) => update(category.id, { stations: v })}
        />
        <NumberField
          label="Hours on-site"
          helper="Total artist window"
          value={setup.event_duration_hours}
          min={1}
          max={12}
          step={0.5}
          onChange={(v) =>
            update(category.id, { event_duration_hours: v })
          }
        />
        <NumberField
          label="Expected guests"
          helper="Everyone who'll want mehendi"
          value={setup.expected_guest_count}
          min={0}
          max={500}
          onChange={(v) =>
            update(category.id, { expected_guest_count: v })
          }
        />
      </div>

      {calc.suggestions.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
            Ways to close the gap
          </div>
          <ul className="grid gap-2 md:grid-cols-3">
            {calc.suggestions.map((s, i) => (
              <li
                key={i}
                className="rounded-md border border-saffron/30 bg-saffron-pale/25 p-3 text-[12px] leading-relaxed text-ink"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionLabel>
  );
}

// ─── Distribution method ─────────────────────────────────────────────────

function DistributionBlock({ category }: { category: WorkspaceCategory }) {
  const stored = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = stored ?? defaultSetup(category.id);
  const update = useMehndiStore((s) => s.updateSetup);

  return (
    <SectionLabel
      eyebrow="Step 3"
      title="How will guests get their turn?"
      icon={<CalendarClock size={14} strokeWidth={1.8} />}
    >
      <div className="grid gap-2.5 md:grid-cols-3">
        {SCHEDULING_OPTIONS.map((mode) => {
          const active = setup.scheduling_mode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() =>
                update(category.id, { scheduling_mode: mode.id })
              }
              className={cn(
                "flex h-full flex-col gap-2 rounded-md border p-3 text-left transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/30"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    active
                      ? "border-saffron bg-saffron text-ivory"
                      : "border-border bg-white",
                  )}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-ivory" />
                  )}
                </span>
                <span className="font-serif text-[15px] text-ink">
                  {mode.label}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-ink-muted">
                {mode.desc}
              </p>
            </button>
          );
        })}
      </div>
    </SectionLabel>
  );
}

// ─── VIP list ────────────────────────────────────────────────────────────

function VipBlock({ category }: { category: WorkspaceCategory }) {
  const allVips = useMehndiStore((s) => s.vipGuests);
  const addVip = useMehndiStore((s) => s.addVipGuest);
  const updateVip = useMehndiStore((s) => s.updateVipGuest);
  const deleteVip = useMehndiStore((s) => s.deleteVipGuest);
  const seedRoster = useMehndiStore((s) => s.seedDefaultVipRoster);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const vips = useMemo(
    () =>
      allVips
        .filter((v) => v.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allVips, category.id],
  );

  function handleAdd() {
    const n = name.trim();
    const r = role.trim();
    if (!n) return;
    addVip({ category_id: category.id, name: n, role: r });
    setName("");
    setRole("");
  }

  return (
    <SectionLabel
      eyebrow="Step 4"
      title="Your VIP list"
      description="Bride, mothers, sisters, bridal party — they go first regardless of how everyone else is scheduled."
      icon={<Crown size={14} strokeWidth={1.8} />}
    >
      {vips.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-4 py-4 text-center">
          <p className="mb-3 text-[12.5px] italic text-ink-muted">
            No VIPs yet. Load the usual roster, then edit names.
          </p>
          <button
            type="button"
            onClick={() => seedRoster(category.id)}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={2} /> Load default roster
          </button>
        </div>
      ) : (
        <ul className="mb-3 divide-y divide-border/60">
          {vips.map((v) => (
            <li
              key={v.id}
              className="group flex items-center gap-3 py-2 text-[12.5px]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron-pale/60 text-saffron">
                <Crown size={11} strokeWidth={1.8} />
              </span>
              <input
                value={v.name}
                onChange={(e) => updateVip(v.id, { name: e.target.value })}
                placeholder="Name"
                className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
              />
              <input
                value={v.role}
                onChange={(e) => updateVip(v.id, { role: e.target.value })}
                placeholder="Role"
                className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => deleteVip(v.id)}
                aria-label="Remove VIP"
                className="rounded p-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ivory-warm/70 hover:text-rose"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Name"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Relationship"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add
        </button>
      </div>
    </SectionLabel>
  );
}

// ─── Detailed-tier names ─────────────────────────────────────────────────

function DetailedTierBlock({ category }: { category: WorkspaceCategory }) {
  const allGuests = useMehndiStore((s) => s.detailedTierGuests);
  const addGuest = useMehndiStore((s) => s.addDetailedTierGuest);
  const updateGuest = useMehndiStore((s) => s.updateDetailedTierGuest);
  const deleteGuest = useMehndiStore((s) => s.deleteDetailedTierGuest);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  const guests = useMemo(
    () =>
      allGuests
        .filter((g) => g.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allGuests, category.id],
  );

  function handleAdd() {
    const n = name.trim();
    if (!n) return;
    addGuest({
      category_id: category.id,
      name: n,
      relationship: relationship.trim(),
    });
    setName("");
    setRelationship("");
  }

  return (
    <SectionLabel
      eyebrow="Step 5"
      title="Who gets the Detailed tier?"
      description="Beyond the VIP list — sisters, close cousins, bridesmaids who specifically need elaborate work."
      icon={<Sparkles size={14} strokeWidth={1.8} />}
    >
      {guests.length > 0 && (
        <ul className="mb-3 divide-y divide-border/60">
          {guests.map((g) => (
            <li
              key={g.id}
              className="group flex items-center gap-3 py-2 text-[12.5px]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Sparkles size={11} strokeWidth={1.8} />
              </span>
              <input
                value={g.name}
                onChange={(e) =>
                  updateGuest(g.id, { name: e.target.value })
                }
                placeholder="Name"
                className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
              />
              <input
                value={g.relationship}
                onChange={(e) =>
                  updateGuest(g.id, { relationship: e.target.value })
                }
                placeholder="Relationship"
                className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => deleteGuest(g.id)}
                aria-label="Remove"
                className="rounded p-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ivory-warm/70 hover:text-rose"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Name"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Relationship"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add
        </button>
      </div>
    </SectionLabel>
  );
}

// ─── Sign-up config ──────────────────────────────────────────────────────

function SignupConfigBlock({ category }: { category: WorkspaceCategory }) {
  const stored = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = stored ?? defaultSetup(category.id);
  const update = useMehndiStore((s) => s.updateSetup);

  return (
    <SectionLabel
      eyebrow="Step 6 · Optional"
      title="Guest sign-up"
      description="Configure the shareable link now or come back later from Tab 2."
      icon={<UserPlus size={14} strokeWidth={1.8} />}
    >
      <div className="rounded-md border border-border bg-ivory-warm/30 p-3">
        <label className="mb-3 flex items-center gap-2 text-[12.5px] text-ink">
          <input
            type="checkbox"
            checked={setup.signup_open}
            onChange={(e) =>
              update(category.id, { signup_open: e.target.checked })
            }
            className="h-3.5 w-3.5 accent-saffron"
          />
          <span>Open guest sign-up now</span>
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Event date
            </span>
            <input
              type="date"
              value={setup.event_date}
              onChange={(e) =>
                update(category.id, { event_date: e.target.value })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Start time
            </span>
            <input
              type="time"
              value={setup.event_start_time}
              onChange={(e) =>
                update(category.id, { event_start_time: e.target.value })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
        </div>
      </div>
    </SectionLabel>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────

function SectionLabel({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        {icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
            {icon}
          </span>
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron">
          {eyebrow}
        </span>
      </div>
      <h3 className="mb-1 font-serif text-[19px] font-semibold leading-tight text-ink">
        {title}
      </h3>
      {description && (
        <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </section>
  );
}

function NumberField({
  label,
  helper,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  helper?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
      />
      {helper && (
        <span className="mt-0.5 block text-[10.5px] text-ink-faint">
          {helper}
        </span>
      )}
    </label>
  );
}
