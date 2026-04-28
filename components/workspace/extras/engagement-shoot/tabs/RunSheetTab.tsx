"use client";

// ── Phase 5 · Shoot Day Run Sheet ──────────────────────────────────────────
// Minute-by-minute timeline — the single source of truth the couple, photog,
// and HMUA reference on the day. Plus: emergency kit, weather contingencies.

import { ArrowDown, ArrowUp, Check, Plus, Printer, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";
import {
  RUN_SHEET_KIND_LABEL,
  type RunSheetEntry,
  type RunSheetEntryKind,
} from "@/types/engagement-shoot";
import {
  InlineEdit,
  Label,
  PhaseStepper,
  Section,
  TextInput,
} from "../ui";

export function RunSheetTab() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <PhaseStepper phase={5} count={6} label="Shoot-day timeline" />
          <h2 className="font-serif text-[24px] leading-tight text-ink">
            Run Sheet
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
            Minute-by-minute — what the couple, photographer, and HMUA all
            reference on the day. Include breaks, buffer, and protect golden hour.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Printer size={13} strokeWidth={1.8} />
          Print run sheet
        </button>
      </header>

      <Timeline />
      <GoldenHourCallout />
      <EmergencyKit />
      <Contingencies />
    </div>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────────

function Timeline() {
  const entries = useEngagementShootStore((s) => s.runSheet);
  const add = useEngagementShootStore((s) => s.addRunEntry);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.orderIndex - b.orderIndex),
    [entries],
  );

  return (
    <Section
      eyebrow="TIMELINE"
      title="The day, hour by hour"
      right={
        <button
          type="button"
          onClick={() => add()}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} />
          Add entry
        </button>
      }
    >
      {sorted.length === 0 ? (
        <p className="text-[12.5px] italic text-ink-faint">
          No entries yet. Start with wake-up → hair + makeup → first location.
        </p>
      ) : (
        <ol className="space-y-2">
          {sorted.map((entry, i) => (
            <TimelineRow
              key={entry.id}
              entry={entry}
              isFirst={i === 0}
              isLast={i === sorted.length - 1}
            />
          ))}
        </ol>
      )}
    </Section>
  );
}

function TimelineRow({
  entry,
  isFirst,
  isLast,
}: {
  entry: RunSheetEntry;
  isFirst: boolean;
  isLast: boolean;
}) {
  const update = useEngagementShootStore((s) => s.updateRunEntry);
  const remove = useEngagementShootStore((s) => s.removeRunEntry);
  const move = useEngagementShootStore((s) => s.moveRunEntry);
  const looks = useEngagementShootStore((s) => s.looks);
  const locations = useEngagementShootStore((s) => s.locations);

  const tone = kindTone(entry.kind);

  return (
    <li
      className={`grid grid-cols-[auto_auto_1fr_auto] items-start gap-3 rounded-lg border bg-white p-3.5 ${
        entry.kind === "golden_hour"
          ? "border-saffron/50 bg-gradient-to-r from-saffron/5 to-gold-pale/20"
          : "border-border"
      }`}
    >
      <div className="min-w-[86px] shrink-0 text-right">
        <InlineEdit
          value={entry.time}
          onChange={(v) => update(entry.id, { time: v })}
          placeholder="Time"
          className="font-serif text-[15px] leading-tight text-ink tabular-nums"
        />
        <div
          className="font-mono text-[10.5px] text-ink-faint tabular-nums"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {entry.durationMinutes} min
        </div>
      </div>

      <select
        value={entry.kind}
        onChange={(e) =>
          update(entry.id, { kind: e.target.value as RunSheetEntryKind })
        }
        className={`shrink-0 self-center rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {Object.entries(RUN_SHEET_KIND_LABEL).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>

      <div className="min-w-0">
        <InlineEdit
          value={entry.title}
          onChange={(v) => update(entry.id, { title: v })}
          placeholder="What's happening"
          className="font-medium text-[13.5px] text-ink"
        />
        <InlineEdit
          multiline
          value={entry.detail}
          onChange={(v) => update(entry.id, { detail: v })}
          placeholder="Detail — who does what, what to bring, things to remember."
          className="mt-0.5 min-h-[40px] text-[12.5px] text-ink-muted"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label>Look</Label>
            <select
              value={entry.lookId ?? ""}
              onChange={(e) =>
                update(entry.id, { lookId: e.target.value || null })
              }
              className="rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">—</option>
              {looks.map((l) => (
                <option key={l.id} value={l.id}>
                  Look {l.index} · {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <Label>Location</Label>
            <select
              value={entry.locationId ?? ""}
              onChange={(e) =>
                update(entry.id, { locationId: e.target.value || null })
              }
              className="rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">—</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <Label>Duration</Label>
            <input
              type="number"
              min={5}
              step={5}
              value={entry.durationMinutes}
              onChange={(e) =>
                update(entry.id, {
                  durationMinutes: Number(e.target.value) || 0,
                })
              }
              className="w-16 rounded-md border border-border bg-white px-2 py-0.5 text-right text-[11px] text-ink tabular-nums focus:border-saffron/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => move(entry.id, "up")}
            disabled={isFirst}
            aria-label="Move up"
            className="rounded-md border border-border bg-white p-1 text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp size={11} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => move(entry.id, "down")}
            disabled={isLast}
            aria-label="Move down"
            className="rounded-md border border-border bg-white p-1 text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDown size={11} strokeWidth={2} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => remove(entry.id)}
          aria-label="Remove"
          className="rounded-md border border-border bg-white p-1 text-ink-faint hover:text-rose"
        >
          <Trash2 size={11} strokeWidth={1.8} />
        </button>
      </div>
    </li>
  );
}

function kindTone(kind: RunSheetEntryKind): string {
  switch (kind) {
    case "shoot":
      return "bg-saffron/15 text-saffron";
    case "golden_hour":
      return "bg-gold/20 text-gold";
    case "hmua":
      return "bg-rose-pale/50 text-rose";
    case "meal":
    case "break":
      return "bg-sage-pale/60 text-sage";
    case "travel":
      return "bg-ink/10 text-ink";
    case "dress":
      return "bg-gold-pale/50 text-gold";
    case "wrap":
      return "bg-ivory-warm text-ink-muted";
    default:
      return "bg-ivory-warm/60 text-ink-muted";
  }
}

// ── Golden hour callout ────────────────────────────────────────────────────

function GoldenHourCallout() {
  return (
    <section className="rounded-lg border border-gold/40 bg-gradient-to-r from-gold-pale/20 to-saffron/10 p-5">
      <div className="flex items-start gap-3">
        <span className="text-[20px]">🌅</span>
        <div className="flex-1">
          <h3 className="font-serif text-[16px] leading-tight text-ink">
            Protect the golden window
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            The 45 minutes before sunset produce the best photos of the entire
            day. Do not schedule outfit changes, travel, or meal breaks during
            this window. Your photographer will be directing fast — trust them.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Emergency kit ──────────────────────────────────────────────────────────

function EmergencyKit() {
  const kit = useEngagementShootStore((s) => s.emergencyKit);
  const toggle = useEngagementShootStore((s) => s.toggleKitItem);
  const remove = useEngagementShootStore((s) => s.removeKitItem);
  const add = useEngagementShootStore((s) => s.addKitItem);

  const packedCount = kit.filter((k) => k.packed).length;

  return (
    <Section
      eyebrow="EMERGENCY KIT"
      title="Pack this, bring this"
      description="The difference between a shoot that goes smooth and one that unravels."
      right={
        <span
          className="font-mono text-[11px] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {packedCount}/{kit.length} packed
        </span>
      }
    >
      <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
        {kit.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-2 rounded-md border border-border/60 bg-white px-3 py-1.5 hover:border-border"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-label={item.packed ? "Mark not packed" : "Mark packed"}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                item.packed
                  ? "border-sage bg-sage text-white"
                  : "border-border bg-white text-transparent hover:border-saffron"
              }`}
            >
              <Check size={11} strokeWidth={2.5} />
            </button>
            <span
              className={`flex-1 text-[13px] ${
                item.packed ? "text-ink-muted line-through" : "text-ink"
              }`}
            >
              {item.label}
            </span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label="Remove"
              className="shrink-0 text-ink-faint opacity-0 hover:text-rose group-hover:opacity-100"
            >
              <Trash2 size={11} strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>

      <AddKitItem onAdd={add} />
    </Section>
  );
}

function AddKitItem({ onAdd }: { onAdd: (label: string) => void }) {
  const handle = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
  };
  return (
    <form
      className="mt-3 flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const input = form.elements.namedItem("kit") as HTMLInputElement;
        handle(input.value);
        input.value = "";
      }}
    >
      <input
        type="text"
        name="kit"
        placeholder="Add to kit — e.g. sewing kit, backup earrings"
        className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={2} />
        Add
      </button>
    </form>
  );
}

// ── Contingencies ──────────────────────────────────────────────────────────

function Contingencies() {
  const contingencies = useEngagementShootStore((s) => s.contingencies);
  const update = useEngagementShootStore((s) => s.updateContingency);
  const remove = useEngagementShootStore((s) => s.removeContingency);
  const add = useEngagementShootStore((s) => s.addContingency);

  return (
    <Section
      eyebrow="CONTINGENCY"
      title="If / then plans"
      description="Weather, crowds, running late — pre-decided backup plans so no one has to think on the day."
      right={
        <button
          type="button"
          onClick={() => add("If …", "Then …")}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={11} strokeWidth={2} />
          Add plan
        </button>
      }
      tone="warning"
    >
      <ul className="space-y-2">
        {contingencies.map((item, i) => (
          <li
            key={i}
            className="group grid grid-cols-[200px_1fr_auto] items-start gap-3 rounded-md border border-rose/20 bg-white p-3"
          >
            <TextInput
              value={item.trigger}
              onChange={(v) => update(i, { trigger: v })}
              placeholder="If …"
            />
            <InlineEdit
              multiline
              value={item.plan}
              onChange={(v) => update(i, { plan: v })}
              placeholder="Then we do …"
              className="min-h-[40px] border border-border bg-white px-2 py-1.5"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove"
              className="shrink-0 text-ink-faint opacity-0 hover:text-rose group-hover:opacity-100"
            >
              <Trash2 size={12} strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
