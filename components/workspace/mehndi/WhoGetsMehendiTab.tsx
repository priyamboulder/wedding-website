"use client";

// ── Who Gets Mehendi tab ──────────────────────────────────────────────────
// Same operational engine as the old Guest Mehendi Plan — capacity math,
// scheduling modes, shareable sign-up — but framed from the couple's point
// of view, not the planner's. Sections flow:
//   1. The guest experience — warm intro.
//   2. Design tiers for your guests — visual cards, editable descriptions.
//   3. Can your artists serve everyone? — answer-first capacity check.
//   4. How will guests get their turn? — scheduling approach as cards.
//   5. VIP list — bride, mothers, bridal party.
//   6. Guest sign-up — shareable link + WhatsApp/Email + response table.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Crown,
  Eye,
  Heart,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeCapacity,
  defaultSetup,
  useMehndiStore,
} from "@/stores/mehndi-store";
import {
  DESIGN_TIER_DESCRIPTION,
  DESIGN_TIER_LABEL,
  DESIGN_TIER_MINUTES,
  type DesignTier,
  type EventSetup,
  type GuestSlot,
  type MehndiDetailedTierGuest,
  type MehndiVipGuest,
  type SchedulingMode,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { GuestSignupPreview } from "./GuestSignupPreview";
import { LogisticsLauncherBanner } from "@/components/guided-journeys/mehendi-logistics/LogisticsLauncherBanner";

// Representative imagery per tier so the couple can see what they're offering
// to guests. Swap for custom artwork later — these are Unsplash placeholders.
const TIER_IMAGERY: Record<DesignTier, string> = {
  quick:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=520&q=75",
  classic:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=520&q=75",
  detailed:
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=520&q=75",
};

export function WhoGetsMehendiTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const stored = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = stored ?? defaultSetup(category.id);

  return (
    <div className="space-y-6">
      <LogisticsLauncherBanner
        categoryId={category.id}
        sessionKey="tiers_and_capacity"
      />

      <SectionHeader
        eyebrow="Who Gets Mehendi"
        title="your guests become part of the art"
        description="Mehendi is the event where the whole room gets henna. Some guests want a full hand, others a small wrist design. Plan who gets what — and make sure no one waits too long."
      />

      <GuestExperienceIntro />
      <DesignTierCards category={category} setup={setup} />
      <DetailedTierGuestList category={category} />
      <CapacityAnswer setup={setup} />
      <SchedulingCards setup={setup} />
      <VipListCard category={category} />
      <GuestSignUpCard category={category} setup={setup} />
      <SignupPreviewPanel category={category} setup={setup} />
    </div>
  );
}

// ── Intro ─────────────────────────────────────────────────────────────────

function GuestExperienceIntro() {
  return (
    <section className="rounded-lg border border-gold/20 bg-ivory-warm/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-saffron-pale/70 text-saffron">
          <Heart size={14} strokeWidth={1.8} />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">
            the guest experience
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">
            Mehendi is the event where your guests become part of the art. Some
            will want full hands, others just a small design on their wrist.
            Plan who gets what — and make sure no one&apos;s left waiting too
            long.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Design tier cards ─────────────────────────────────────────────────────

function DesignTierCards({
  category,
  setup,
}: {
  category: WorkspaceCategory;
  setup: EventSetup;
}) {
  const update = useMehndiStore((s) => s.updateSetup);
  const allSlots = useMehndiStore((s) => s.guestSlots);
  const tiers: DesignTier[] = ["quick", "classic", "detailed"];

  const claimedByTier = useMemo(() => {
    const counts: Record<DesignTier, number> = {
      quick: 0,
      classic: 0,
      detailed: 0,
    };
    for (const slot of allSlots) {
      if (slot.category_id !== category.id) continue;
      const tier = slot.requested_tier ?? slot.tier;
      counts[tier] = (counts[tier] ?? 0) + 1;
    }
    return counts;
  }, [allSlots, category.id]);

  return (
    <PanelCard
      icon={<Palette size={14} strokeWidth={1.8} />}
      title="design tiers for your guests"
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Offer a tiered menu so expectations match the station time each artist
        has. Set a cap per tier — the guest sign-up page greys out a tier once
        it fills. Tap a tier to make it the default your capacity calculator
        uses.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tiers.map((tier) => {
          const active = setup.avg_tier === tier;
          const cap = setup.tier_capacity?.[tier] ?? 0;
          const claimed = claimedByTier[tier] ?? 0;
          const full = cap > 0 && claimed >= cap;
          return (
            <div
              key={tier}
              className={cn(
                "group overflow-hidden rounded-md border transition-colors",
                active
                  ? "border-saffron ring-2 ring-saffron/30"
                  : "border-border hover:border-saffron/40",
              )}
            >
              <button
                type="button"
                onClick={() => update(setup.category_id, { avg_tier: tier })}
                className="block w-full text-left"
              >
                <div className="relative aspect-[5/3] overflow-hidden bg-ivory-warm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={TIER_IMAGERY[tier]}
                    alt={DESIGN_TIER_LABEL[tier]}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {active && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-saffron/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory">
                      <Check size={10} strokeWidth={2.5} /> Default
                    </span>
                  )}
                  {full && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory">
                      Full
                    </span>
                  )}
                </div>
                <div className="space-y-1 px-3 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[16px] text-ink">
                      {DESIGN_TIER_LABEL[tier]}
                    </span>
                    <span className="font-mono text-[10.5px] tabular-nums text-saffron">
                      {DESIGN_TIER_MINUTES[tier]} min
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-snug text-ink-muted">
                    {DESIGN_TIER_DESCRIPTION[tier]}
                  </p>
                </div>
              </button>

              <div className="space-y-1.5 border-t border-border/60 bg-ivory-warm/40 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Spots for this tier
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={cap}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isNaN(n)) return;
                      update(setup.category_id, {
                        tier_capacity: {
                          ...setup.tier_capacity,
                          [tier]: Math.max(0, n),
                        },
                      });
                    }}
                    className="w-16 rounded border border-border bg-white px-1.5 py-0.5 text-right text-[12px] tabular-nums focus:border-saffron/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-ink-muted">Claimed</span>
                  <span
                    className={cn(
                      "font-mono text-[11px] tabular-nums",
                      full
                        ? "text-rose"
                        : claimed > 0
                          ? "text-sage"
                          : "text-ink-muted",
                    )}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {claimed} / {cap}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-ivory-warm">
                  <div
                    className={cn(
                      "h-full transition-all",
                      full ? "bg-rose" : "bg-saffron",
                    )}
                    style={{
                      width:
                        cap > 0
                          ? `${Math.min(100, (claimed / cap) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}

// ── Detailed tier guest list ─────────────────────────────────────────────
// Separate from the VIP list — names the couple wants to get specifically
// the Detailed tier (sisters, close cousins, bridal party). Rendered in a
// collapsible panel so it doesn't overwhelm the default view.

function DetailedTierGuestList({
  category,
}: {
  category: WorkspaceCategory;
}) {
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
    const r = relationship.trim();
    if (!n) return;
    addGuest({ category_id: category.id, name: n, relationship: r });
    setName("");
    setRelationship("");
  }

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="who gets detailed mehendi?"
      badge={
        guests.length > 0 ? (
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {guests.length} named
          </span>
        ) : null
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Beyond the VIP list — people who need the most elaborate mehendi:
        bride&apos;s sisters, close cousins, bridesmaids. These names get
        first claim on the Detailed tier spots.
      </p>

      {guests.length > 0 && (
        <ul className="mb-3 divide-y divide-border/60">
          {guests.map((g) => (
            <DetailedTierRow
              key={g.id}
              guest={g}
              onUpdate={(patch) => updateGuest(g.id, patch)}
              onDelete={() => deleteGuest(g.id)}
            />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Priya Sharma)"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Relationship (e.g. bride's sister)"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} />
          Add
        </button>
      </div>
    </PanelCard>
  );
}

function DetailedTierRow({
  guest,
  onUpdate,
  onDelete,
}: {
  guest: MehndiDetailedTierGuest;
  onUpdate: (patch: Partial<MehndiDetailedTierGuest>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 py-2 text-[12.5px]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
        <Sparkles size={11} strokeWidth={1.8} />
      </span>
      <input
        value={guest.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Name"
        className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
      />
      <input
        value={guest.relationship}
        onChange={(e) => onUpdate({ relationship: e.target.value })}
        placeholder="Relationship"
        className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
      />
      <button
        type="button"
        aria-label="Remove detailed-tier guest"
        onClick={onDelete}
        className="rounded p-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ivory-warm/70 hover:text-rose"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}

// ── Capacity — answer first ───────────────────────────────────────────────

function CapacityAnswer({ setup }: { setup: EventSetup }) {
  const update = useMehndiStore((s) => s.updateSetup);
  const calc = useMemo(() => computeCapacity(setup), [setup]);
  const shortfall = calc.unservableGuests > 0;

  const answer = shortfall
    ? `With ${setup.stations} artist${setup.stations === 1 ? "" : "s"} over ${setup.event_duration_hours} hour${setup.event_duration_hours === 1 ? "" : "s"} at ${DESIGN_TIER_LABEL[setup.avg_tier]}, you can serve ${calc.servableGuests} of your ${setup.expected_guest_count} guests. You're ${calc.unservableGuests} short.`
    : `With ${setup.stations} artist${setup.stations === 1 ? "" : "s"} over ${setup.event_duration_hours} hour${setup.event_duration_hours === 1 ? "" : "s"} at ${DESIGN_TIER_LABEL[setup.avg_tier]}, you can comfortably serve all ${setup.expected_guest_count} guests.`;

  return (
    <PanelCard
      icon={<AlertTriangle size={14} strokeWidth={1.8} />}
      title="can your artists serve everyone?"
      badge={
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            shortfall ? "bg-rose/15 text-rose" : "bg-sage/20 text-sage",
          )}
        >
          {shortfall ? `${calc.unservableGuests} short` : "Capacity OK"}
        </span>
      }
    >
      <p
        className={cn(
          "mb-4 rounded-md border px-3 py-2.5 text-[13px] leading-relaxed",
          shortfall
            ? "border-rose/30 bg-rose-pale/30 text-ink"
            : "border-sage/30 bg-sage-pale/30 text-ink",
        )}
      >
        {answer}
      </p>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <NumberField
          label="Artists"
          helper="Each artist = one station"
          value={setup.stations}
          min={1}
          max={20}
          onChange={(v) => update(setup.category_id, { stations: v })}
        />
        <NumberField
          label="Hours on-site"
          helper="Total artist window"
          value={setup.event_duration_hours}
          min={1}
          max={12}
          step={0.5}
          onChange={(v) =>
            update(setup.category_id, { event_duration_hours: v })
          }
        />
        <NumberField
          label="Expected guests"
          helper="Everyone who'll want mehendi"
          value={setup.expected_guest_count}
          min={0}
          max={500}
          onChange={(v) =>
            update(setup.category_id, { expected_guest_count: v })
          }
        />
      </div>

      {/* Resolutions */}
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
    </PanelCard>
  );
}

// ── Scheduling cards ──────────────────────────────────────────────────────

function SchedulingCards({ setup }: { setup: EventSetup }) {
  const update = useMehndiStore((s) => s.updateSetup);
  const modes: Array<{
    id: SchedulingMode;
    label: string;
    desc: string;
  }> = [
    {
      id: "priority_queue",
      label: "Priority queue",
      desc: "Bride first, then family, then guests by arrival. No fixed appointments — feels like a party.",
    },
    {
      id: "appointments",
      label: "Appointment slots",
      desc: "Every guest gets a time slot in advance. Precise, quiet, but less casual.",
    },
    {
      id: "hybrid",
      label: "Hybrid",
      desc: "VIPs pre-scheduled. Everyone else walks up. The most common Indian-wedding answer.",
    },
  ];

  return (
    <PanelCard
      icon={<CalendarClock size={14} strokeWidth={1.8} />}
      title="how will guests get their turn?"
    >
      <div className="grid gap-2.5 md:grid-cols-3">
        {modes.map((mode) => {
          const active = setup.scheduling_mode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() =>
                update(setup.category_id, { scheduling_mode: mode.id })
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
    </PanelCard>
  );
}

// ── VIP list ──────────────────────────────────────────────────────────────

function VipListCard({ category }: { category: WorkspaceCategory }) {
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
    addVip({
      category_id: category.id,
      name: n,
      role: r,
    });
    setName("");
    setRole("");
  }

  return (
    <PanelCard
      icon={<Crown size={14} strokeWidth={1.8} />}
      title="VIP list"
      badge={
        vips.length > 0 ? (
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {vips.length} VIP{vips.length === 1 ? "" : "s"}
          </span>
        ) : null
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Bride, mothers, sisters, bridal party — they always go first regardless
        of how you schedule everyone else. Match these to names in your guest
        list when you&apos;re ready.
      </p>

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
            <Plus size={12} strokeWidth={2} />
            Load default roster
          </button>
        </div>
      ) : (
        <ul className="mb-3 divide-y divide-border/60">
          {vips.map((v) => (
            <VipRow
              key={v.id}
              vip={v}
              onUpdate={(patch) => updateVip(v.id, patch)}
              onDelete={() => deleteVip(v.id)}
            />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Meera Sharma)"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role (e.g. bride's mother)"
          className="flex-1 min-w-[160px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} />
          Add VIP
        </button>
      </div>
    </PanelCard>
  );
}

function VipRow({
  vip,
  onUpdate,
  onDelete,
}: {
  vip: MehndiVipGuest;
  onUpdate: (patch: Partial<MehndiVipGuest>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 py-2 text-[12.5px]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron-pale/60 text-saffron">
        <Crown size={11} strokeWidth={1.8} />
      </span>
      <input
        value={vip.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Name"
        className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
      />
      <input
        value={vip.role}
        onChange={(e) => onUpdate({ role: e.target.value })}
        placeholder="Role"
        className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
      />
      <button
        type="button"
        aria-label="Remove VIP"
        onClick={onDelete}
        className="rounded p-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ivory-warm/70 hover:text-rose"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}

// ── Guest sign-up ─────────────────────────────────────────────────────────

function GuestSignUpCard({
  category,
  setup,
}: {
  category: WorkspaceCategory;
  setup: EventSetup;
}) {
  const updateSetup = useMehndiStore((s) => s.updateSetup);
  const allGuestSlots = useMehndiStore((s) => s.guestSlots);
  const slots = useMemo(
    () =>
      allGuestSlots
        .filter((g) => g.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allGuestSlots, category.id],
  );
  const add = useMehndiStore((s) => s.addGuestSlot);
  const update = useMehndiStore((s) => s.updateGuestSlot);
  const del = useMehndiStore((s) => s.deleteGuestSlot);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  function handleAdd() {
    const n = name.trim();
    if (!n) return;
    add({
      category_id: category.id,
      guest_name: n,
      guest_id: null,
      station: null,
      start_time: null,
      tier: setup.avg_tier,
      status: "pending",
      requested_tier: null,
      notes: "",
    });
    setName("");
  }

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup/mehendi/${category.id.slice(0, 12)}`
      : `/signup/mehendi/${category.id.slice(0, 12)}`;

  const shareMessage =
    "You're invited to the Mehendi event! Sign up for your slot here: " +
    shareLink;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }

  const whatsappHref =
    "https://wa.me/?text=" + encodeURIComponent(shareMessage);
  const emailHref =
    "mailto:?subject=" +
    encodeURIComponent("Mehendi sign-up") +
    "&body=" +
    encodeURIComponent(shareMessage);

  const doneCount = slots.filter((s) => s.status === "done").length;
  const pendingCount = slots.filter((s) => s.status === "pending").length;

  return (
    <PanelCard
      icon={<UserPlus size={14} strokeWidth={1.8} />}
      title="guest sign-up"
      badge={
        slots.length > 0 ? (
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {slots.length} responses · {doneCount} served · {pendingCount}{" "}
            waiting
          </span>
        ) : null
      }
    >
      <div className="mb-4 rounded-md border border-border bg-ivory-warm/30 px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
              Shareable link
            </div>
            <div className="mt-0.5 break-all text-[12px] text-ink">
              {shareLink}
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-[11.5px] text-ink-muted">
            <input
              type="checkbox"
              checked={setup.signup_open}
              onChange={(e) =>
                updateSetup(setup.category_id, {
                  signup_open: e.target.checked,
                })
              }
              className="h-3.5 w-3.5 accent-saffron"
            />
            {setup.signup_open ? "Open" : "Closed"}
          </label>
        </div>
        <div className="mb-2.5 flex flex-wrap items-center gap-3 border-t border-border/60 pt-2.5">
          <label className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="font-mono uppercase tracking-[0.14em] text-ink-faint">
              Event date
            </span>
            <input
              type="date"
              value={setup.event_date}
              onChange={(e) =>
                updateSetup(setup.category_id, {
                  event_date: e.target.value,
                })
              }
              className="rounded border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="font-mono uppercase tracking-[0.14em] text-ink-faint">
              Start time
            </span>
            <input
              type="time"
              value={setup.event_start_time}
              onChange={(e) =>
                updateSetup(setup.category_id, {
                  event_start_time: e.target.value,
                })
              }
              className="rounded border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              copied
                ? "border-sage bg-sage text-ivory"
                : "border-border bg-white text-ink hover:border-saffron/40 hover:text-saffron",
            )}
          >
            {copied ? (
              <>
                <Check size={11} strokeWidth={2} />
                Copied
              </>
            ) : (
              <>
                <LinkIcon size={11} strokeWidth={2} />
                Copy link
              </>
            )}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink hover:border-saffron/40 hover:text-saffron"
          >
            <MessageSquare size={11} strokeWidth={2} />
            WhatsApp
          </a>
          <a
            href={emailHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink hover:border-saffron/40 hover:text-saffron"
          >
            <Mail size={11} strokeWidth={2} />
            Email
          </a>
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-3 py-3 text-[12px] italic text-ink-muted">
          No responses yet. Share the link above — responses appear here as
          they come in.
        </p>
      ) : (
        <SlotTable
          slots={slots}
          setup={setup}
          onUpdate={update}
          onDelete={del}
        />
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a guest manually (e.g. Meera Sharma — aunt)"
          className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} />
          Add
        </button>
      </div>
    </PanelCard>
  );
}

function SlotTable({
  slots,
  setup,
  onUpdate,
  onDelete,
}: {
  slots: GuestSlot[];
  setup: EventSetup;
  onUpdate: (id: string, patch: Partial<GuestSlot>) => void;
  onDelete: (id: string) => void;
}) {
  const showStation = setup.scheduling_mode !== "priority_queue";
  const showTime = setup.scheduling_mode !== "priority_queue";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead className="text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          <tr>
            <th className="py-1.5 pr-2 text-left font-mono">Guest</th>
            <th className="py-1.5 pr-2 text-left font-mono">Tier</th>
            {showTime && (
              <th className="py-1.5 pr-2 text-left font-mono">Time</th>
            )}
            {showStation && (
              <th className="py-1.5 pr-2 text-left font-mono">Station</th>
            )}
            <th className="py-1.5 pr-2 text-left font-mono">Status</th>
            <th className="py-1.5 pr-2 text-left font-mono">Notes</th>
            <th className="py-1.5 pr-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {slots.map((slot) => (
            <tr key={slot.id} className="align-top">
              <td className="py-1.5 pr-2">
                <input
                  value={slot.guest_name}
                  onChange={(e) =>
                    onUpdate(slot.id, { guest_name: e.target.value })
                  }
                  className="w-full min-w-[140px] rounded border border-transparent bg-transparent px-1.5 py-1 text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
                />
              </td>
              <td className="py-1.5 pr-2">
                <select
                  value={slot.tier}
                  onChange={(e) =>
                    onUpdate(slot.id, {
                      tier: e.target.value as DesignTier,
                    })
                  }
                  className="rounded border border-border bg-white px-1.5 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
                >
                  <option value="quick">Quick · 15m</option>
                  <option value="classic">Classic · 30m</option>
                  <option value="detailed">Detailed · 45m</option>
                </select>
                {slot.requested_tier && slot.requested_tier !== slot.tier && (
                  <div className="mt-0.5 text-[10px] text-rose">
                    requested {DESIGN_TIER_LABEL[slot.requested_tier]}
                  </div>
                )}
              </td>
              {showTime && (
                <td className="py-1.5 pr-2">
                  <input
                    type="time"
                    value={slot.start_time ?? ""}
                    onChange={(e) =>
                      onUpdate(slot.id, {
                        start_time: e.target.value || null,
                      })
                    }
                    className="rounded border border-border bg-white px-1.5 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
                  />
                </td>
              )}
              {showStation && (
                <td className="py-1.5 pr-2">
                  <select
                    value={slot.station ?? ""}
                    onChange={(e) =>
                      onUpdate(slot.id, {
                        station: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="rounded border border-border bg-white px-1.5 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
                  >
                    <option value="">—</option>
                    {Array.from({ length: setup.stations }, (_, i) => (
                      <option key={i} value={i + 1}>
                        Station {i + 1}
                      </option>
                    ))}
                  </select>
                </td>
              )}
              <td className="py-1.5 pr-2">
                <select
                  value={slot.status}
                  onChange={(e) =>
                    onUpdate(slot.id, {
                      status: e.target.value as GuestSlot["status"],
                    })
                  }
                  className={cn(
                    "rounded border border-border bg-white px-1.5 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none",
                    slot.status === "done" && "text-sage",
                  )}
                >
                  <option value="pending">Waiting</option>
                  <option value="notified">Notified</option>
                  <option value="done">Done</option>
                </select>
              </td>
              <td className="py-1.5 pr-2">
                <input
                  value={slot.notes}
                  onChange={(e) =>
                    onUpdate(slot.id, { notes: e.target.value })
                  }
                  placeholder="Notes…"
                  className="w-full min-w-[120px] rounded border border-transparent bg-transparent px-1.5 py-1 text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
                />
              </td>
              <td className="py-1.5 pr-2">
                <button
                  type="button"
                  aria-label="Delete guest slot"
                  onClick={() => onDelete(slot.id)}
                  className="rounded p-1 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
                >
                  <Trash2 size={12} strokeWidth={1.8} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sign-up preview panel ─────────────────────────────────────────────────
// Shows the couple what guests see when they hit the shareable link — same
// component the public /signup/mehendi/[slug] route renders, rendered live
// off the same store.

function SignupPreviewPanel({
  category,
  setup,
}: {
  category: WorkspaceCategory;
  setup: EventSetup;
}) {
  return (
    <PanelCard
      icon={<Eye size={14} strokeWidth={1.8} />}
      title="preview what your guests will see"
      badge={
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            setup.signup_open
              ? "bg-sage/20 text-sage"
              : "bg-rose/15 text-rose",
          )}
        >
          {setup.signup_open ? "Live" : "Closed"}
        </span>
      }
    >
      <p className="mb-4 text-[12.5px] text-ink-muted">
        This is exactly what guests see after tapping the shareable link
        above. Tweak tier descriptions, spot counts, and the event time — the
        preview updates live.
      </p>
      <div className="rounded-md border border-border bg-ivory-warm/20 px-4 py-5">
        <GuestSignupPreview categoryId={category.id} previewMode />
      </div>
    </PanelCard>
  );
}

// ── Fields ────────────────────────────────────────────────────────────────

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
