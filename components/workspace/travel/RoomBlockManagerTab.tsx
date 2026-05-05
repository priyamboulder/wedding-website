"use client";

// ── Room Block Manager tab ────────────────────────────────────────────────
// Per-hotel cards: rate, rooms blocked/booked, cutoff countdown, attrition
// floor, negotiated amenities. Health dashboard aggregates across blocks
// and flags attrition risk when pickup trends below the floor as cutoff
// approaches.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Check,
  ExternalLink,
  Hotel,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTravelStore } from "@/stores/travel-store";
import type { RoomBlockAmenity, TravelRoomBlock } from "@/types/travel";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  MiniStat,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { TravelBuildDualCTA } from "@/components/guided-journeys/travel-accommodations-build/BuildJourneyDualCTA";

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function cutoffTone(days: number | null): "rose" | "amber" | "stone" | "sage" {
  if (days == null) return "stone";
  if (days < 0) return "rose";
  if (days < 7) return "rose";
  if (days < 21) return "amber";
  return "sage";
}

export function RoomBlockManagerTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const all = useTravelStore((s) => s.blocks);
  const addBlock = useTravelStore((s) => s.addBlock);

  const blocks = useMemo(
    () =>
      all
        .filter((b) => b.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [all, category.id],
  );

  const totals = useMemo(() => {
    const blocked = blocks.reduce((a, b) => a + b.rooms_blocked, 0);
    const booked = blocks.reduce((a, b) => a + b.rooms_booked, 0);
    // Minimum-to-meet is the sum of each block's attrition floor in rooms.
    const floor = blocks.reduce(
      (a, b) => a + Math.ceil((b.rooms_blocked * b.attrition_percent) / 100),
      0,
    );
    const gap = Math.max(0, floor - booked);
    const pct = blocked > 0 ? Math.round((booked / blocked) * 100) : 0;
    return { blocked, booked, floor, gap, pct };
  }, [blocks]);

  const soonest = useMemo(() => {
    return blocks
      .map((b) => ({ name: b.name, days: daysUntil(b.cutoff_date) }))
      .filter((c) => c.days != null)
      .sort((a, b) => (a.days! - b.days!))[0];
  }, [blocks]);

  return (
    <div className="space-y-6">
      <TravelBuildDualCTA
        category={category}
        startAtSession="block_setup"
        guidedHeading="Build with us"
        guidedSubheading="2 sessions · ~11 min"
      />

      <SectionHeader
        eyebrow="Room Block Manager"
        title="Room blocks"
        description="Every hotel block, its pickup math, and what's been negotiated. Keep the floor visible — attrition penalties are the kind of surprise you don't want after the wedding."
      />

      {/* Health dashboard */}
      <PanelCard
        icon={<Building2 size={14} strokeWidth={1.8} />}
        title="Block health"
        badge={
          totals.gap > 0 ? (
            <Tag tone="rose">Action needed</Tag>
          ) : blocks.length > 0 ? (
            <Tag tone="sage">On track</Tag>
          ) : null
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Rooms blocked" value={totals.blocked} />
          <MiniStat
            label="Rooms booked"
            value={totals.booked}
            tone={totals.pct >= 75 ? "sage" : totals.pct >= 50 ? "saffron" : "rose"}
            hint={`${totals.pct}% utilization`}
          />
          <MiniStat
            label="Minimum to meet"
            value={totals.floor}
            hint="sum of attrition floors"
          />
          <MiniStat
            label="Gap to floor"
            value={totals.gap}
            tone={totals.gap === 0 ? "sage" : "rose"}
            hint={
              soonest?.days != null
                ? `by ${soonest.name} — ${soonest.days}d`
                : "no cutoff set"
            }
          />
        </div>
      </PanelCard>

      {/* Blocks list */}
      {blocks.length === 0 ? (
        <PanelCard
          icon={<Hotel size={14} strokeWidth={1.8} />}
          title="Hotel blocks"
        >
          <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-4 py-5 text-center text-[12.5px] italic text-ink-muted">
            No room blocks yet. Add the primary block first — the one most of
            your family will stay at.
          </p>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() =>
                addBlock({
                  category_id: category.id,
                  name: "",
                  role: "primary",
                  group_rate: "",
                  retail_rate: "",
                  rooms_blocked: 0,
                  rooms_booked: 0,
                  cutoff_date: "",
                  attrition_percent: 80,
                  booking_link: "",
                })
              }
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Plus size={12} strokeWidth={2} /> Add a block
            </button>
          </div>
        </PanelCard>
      ) : (
        <div className="space-y-4">
          {blocks.map((b) => (
            <BlockCard key={b.id} block={b} />
          ))}
          <div>
            <button
              type="button"
              onClick={() =>
                addBlock({
                  category_id: category.id,
                  name: "",
                  role: blocks.length === 0 ? "primary" : "overflow",
                  group_rate: "",
                  retail_rate: "",
                  rooms_blocked: 0,
                  rooms_booked: 0,
                  cutoff_date: "",
                  attrition_percent: 0,
                  booking_link: "",
                })
              }
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-1.5 text-[12px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
            >
              <Plus size={12} strokeWidth={2} /> Add another block
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Per-block card ────────────────────────────────────────────────────────

function BlockCard({ block }: { block: TravelRoomBlock }) {
  const update = useTravelStore((s) => s.updateBlock);
  const del = useTravelStore((s) => s.deleteBlock);
  const addAmenity = useTravelStore((s) => s.addBlockAmenity);
  const updateAmenity = useTravelStore((s) => s.updateBlockAmenity);
  const deleteAmenity = useTravelStore((s) => s.deleteBlockAmenity);

  const days = daysUntil(block.cutoff_date);
  const floor = Math.ceil((block.rooms_blocked * block.attrition_percent) / 100);
  const pct = block.rooms_blocked
    ? Math.round((block.rooms_booked / block.rooms_blocked) * 100)
    : 0;
  const attritionRisk =
    block.attrition_percent > 0 &&
    block.rooms_booked < floor &&
    days != null &&
    days < 21;
  const barTone = attritionRisk
    ? "bg-rose"
    : pct < 50
      ? "bg-amber-400"
      : "bg-sage";

  const [newAmenity, setNewAmenity] = useState("");

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
      <header className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <input
          value={block.name}
          onChange={(e) => update(block.id, { name: e.target.value })}
          placeholder="Hotel name (e.g. Marriott Legacy Town Center)"
          className="flex-1 min-w-[200px] rounded border border-transparent bg-transparent px-1 py-0.5 font-serif text-[17px] text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
        <select
          value={block.role}
          onChange={(e) =>
            update(block.id, { role: e.target.value as TravelRoomBlock["role"] })
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
        >
          <option value="primary">Primary block</option>
          <option value="overflow">Overflow block</option>
          <option value="courtesy">Courtesy block</option>
        </select>
        {days != null && (
          <Tag tone={cutoffTone(days)}>
            {days < 0 ? "Cutoff passed" : `${days}d to cutoff`}
          </Tag>
        )}
        {attritionRisk && (
          <Tag tone="rose">
            <AlertTriangle size={9} className="mr-1 inline" /> Attrition risk
          </Tag>
        )}
        <button
          type="button"
          aria-label="Delete block"
          onClick={() => del(block.id)}
          className="rounded p-1 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 py-4 md:grid-cols-6">
        <Field
          label="Group rate"
          value={block.group_rate}
          placeholder="$169/night"
          onChange={(v) => update(block.id, { group_rate: v })}
        />
        <Field
          label="Retail rate"
          value={block.retail_rate}
          placeholder="$229"
          onChange={(v) => update(block.id, { retail_rate: v })}
        />
        <FieldNumber
          label="Rooms blocked"
          value={block.rooms_blocked}
          onChange={(v) => update(block.id, { rooms_blocked: v })}
        />
        <FieldNumber
          label="Rooms booked"
          value={block.rooms_booked}
          onChange={(v) => update(block.id, { rooms_booked: v })}
        />
        <Field
          label="Cutoff date"
          type="date"
          value={block.cutoff_date}
          onChange={(v) => update(block.id, { cutoff_date: v })}
        />
        <FieldNumber
          label="Attrition %"
          value={block.attrition_percent}
          onChange={(v) => update(block.id, { attrition_percent: v })}
          placeholder="80"
        />
      </div>

      {/* Pickup bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
          <span>
            Pickup {block.rooms_booked}/{block.rooms_blocked}
            {block.attrition_percent > 0 && (
              <span className="text-ink-faint">
                {" · floor "}
                {floor} rooms
              </span>
            )}
          </span>
          <span className={attritionRisk ? "text-rose" : "text-ink-faint"}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className={cn("h-full rounded-full transition-all", barTone)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-3 flex items-center justify-between">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Amenities negotiated
        </p>
      </div>
      <ul className="space-y-1.5">
        {block.amenities.length === 0 && (
          <li className="text-[12px] italic text-ink-faint">
            Nothing tracked yet. Add what you've asked for — waived resort
            fee, late checkout, hospitality suite.
          </li>
        )}
        {block.amenities.map((a) => (
          <AmenityRow
            key={a.id}
            amenity={a}
            onUpdate={(patch) => updateAmenity(block.id, a.id, patch)}
            onDelete={() => deleteAmenity(block.id, a.id)}
          />
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={newAmenity}
          onChange={(e) => setNewAmenity(e.target.value)}
          placeholder="Add amenity (e.g. Late checkout 1 PM)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const label = newAmenity.trim();
              if (!label) return;
              addAmenity(block.id, { label, status: "requested" });
              setNewAmenity("");
            }
          }}
          className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            const label = newAmenity.trim();
            if (!label) return;
            addAmenity(block.id, { label, status: "requested" });
            setNewAmenity("");
          }}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add
        </button>
      </div>

      {/* Footer actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <input
          value={block.booking_link}
          onChange={(e) => update(block.id, { booking_link: e.target.value })}
          placeholder="Booking link"
          className="flex-1 min-w-[200px] rounded-md border border-border bg-white px-2.5 py-1.5 font-mono text-[11px] focus:border-saffron/50 focus:outline-none"
        />
        {block.booking_link && (
          <a
            href={block.booking_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <ExternalLink size={11} strokeWidth={2} /> Open
          </a>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Mail size={11} strokeWidth={2} /> Send reminder to unbooked guests
        </button>
      </div>
    </section>
  );
}

function AmenityRow({
  amenity,
  onUpdate,
  onDelete,
}: {
  amenity: RoomBlockAmenity;
  onUpdate: (patch: Partial<RoomBlockAmenity>) => void;
  onDelete: () => void;
}) {
  const toneClass =
    amenity.status === "negotiated"
      ? "bg-sage-pale/60 text-sage"
      : amenity.status === "declined"
        ? "bg-rose-pale/60 text-rose"
        : "bg-ivory-warm text-ink-muted";
  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Toggle negotiated"
        onClick={() =>
          onUpdate({
            status:
              amenity.status === "negotiated" ? "requested" : "negotiated",
          })
        }
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded border border-border",
          amenity.status === "negotiated" ? "bg-sage text-white" : "bg-white",
        )}
      >
        {amenity.status === "negotiated" && (
          <Check size={11} strokeWidth={2.5} />
        )}
      </button>
      <input
        value={amenity.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
      />
      <select
        value={amenity.status}
        onChange={(e) =>
          onUpdate({ status: e.target.value as RoomBlockAmenity["status"] })
        }
        className={cn(
          "rounded-sm px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
          toneClass,
        )}
      >
        <option value="requested">Requested</option>
        <option value="negotiated">Negotiated</option>
        <option value="declined">Declined</option>
      </select>
      <button
        type="button"
        aria-label="Delete"
        onClick={onDelete}
        className="rounded p-0.5 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
      >
        <Trash2 size={11} strokeWidth={1.8} />
      </button>
    </li>
  );
}

// ── Field primitives ──────────────────────────────────────────────────────

function Field({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "date";
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span
        className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-border bg-white px-2 py-1 text-[12px] focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}

function FieldNumber({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number;
  placeholder?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span
        className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-md border border-border bg-white px-2 py-1 text-[12px] tabular-nums focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}
