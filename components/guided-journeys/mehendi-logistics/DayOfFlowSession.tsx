"use client";

// ── Logistics Session 3 · Day-of flow ───────────────────────────────────
// Timeline editor (with default-loader), bride-care assignment, drying-time
// estimate, and the four setup-logistics confirmations + entertainment
// note. Reads & writes through mehndi-store so it's in lock-step with
// Tab 4 of the full workspace.

import { useMemo, useState } from "react";
import {
  Boxes,
  Clock,
  HandHeart,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultBrideCare,
  defaultLogisticsCheck,
  defaultLogisticsJourneyMeta,
  defaultSetup,
  useMehndiStore,
} from "@/stores/mehndi-store";
import type {
  EventSetup,
  ScheduleItem,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";

export function DayOfFlowSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <TimelineBlock category={category} />
      <BrideCareBlock category={category} />
      <SetupLogisticsBlock category={category} />
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────

function TimelineBlock({ category }: { category: WorkspaceCategory }) {
  const allItems = useMehndiStore((s) => s.scheduleItems);
  const seed = useMehndiStore((s) => s.seedDefaultSchedule);
  const add = useMehndiStore((s) => s.addScheduleItem);
  const update = useMehndiStore((s) => s.updateScheduleItem);
  const del = useMehndiStore((s) => s.deleteScheduleItem);
  const updateMeta = useMehndiStore((s) => s.updateLogisticsJourneyMeta);

  const items = useMemo(
    () =>
      allItems
        .filter((i) => i.category_id === category.id)
        .sort((a, b) => {
          if (a.time === b.time) return a.sort_order - b.sort_order;
          return a.time < b.time ? -1 : 1;
        }),
    [allItems, category.id],
  );

  const [time, setTime] = useState("12:00");
  const [title, setTitle] = useState("");
  const [track, setTrack] = useState<ScheduleItem["track"]>("general");

  function handleAdd() {
    const t = title.trim();
    if (!t) return;
    add({
      category_id: category.id,
      time,
      title: t,
      detail: "",
      track,
    });
    setTitle("");
  }

  return (
    <SectionLabel
      eyebrow="Step 1"
      title="The mehendi day timeline"
      description="Load the default 12:00–17:30 flow, then tweak to match your venue. Bride track rows are highlighted."
      icon={<Clock size={14} strokeWidth={1.8} />}
    >
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-4 py-5 text-center">
          <p className="mb-3 text-[12.5px] italic text-ink-muted">
            Empty timeline. Load the default flow to start.
          </p>
          <button
            type="button"
            onClick={() => {
              seed(category.id);
              updateMeta(category.id, { timeline_loaded_default: true });
            }}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Sparkles size={12} strokeWidth={2} /> Load default schedule
          </button>
        </div>
      ) : (
        <ol className="relative space-y-2 border-l border-border/60 pl-4">
          {items.map((item) => {
            const bride = item.track === "bride";
            return (
              <li
                key={item.id}
                className={cn(
                  "relative -ml-4 rounded-md border px-3 py-2 transition-colors",
                  bride
                    ? "border-rose/40 bg-rose-pale/30"
                    : "border-border bg-white",
                )}
              >
                <span
                  className={cn(
                    "absolute -left-[6px] top-3 h-2.5 w-2.5 rounded-full border-2 border-ivory",
                    bride ? "bg-rose" : "bg-ink",
                  )}
                  aria-hidden
                />
                <div className="flex flex-wrap items-start gap-2">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) =>
                      update(item.id, { time: e.target.value })
                    }
                    className="w-[95px] shrink-0 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[11.5px] tabular-nums text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
                  />
                  <input
                    value={item.title}
                    onChange={(e) =>
                      update(item.id, { title: e.target.value })
                    }
                    className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-medium text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
                  />
                  <select
                    value={item.track}
                    onChange={(e) =>
                      update(item.id, {
                        track: e.target.value as ScheduleItem["track"],
                      })
                    }
                    className="rounded border border-border bg-white px-1.5 py-0.5 text-[10.5px] focus:border-saffron/50 focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="bride">Bride track</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => del(item.id)}
                    aria-label="Delete item"
                    className="rounded p-1 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                </div>
                <input
                  value={item.detail}
                  onChange={(e) =>
                    update(item.id, { detail: e.target.value })
                  }
                  placeholder="Detail / note (optional)"
                  className="mt-1 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted placeholder:text-ink-faint hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
                />
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Add an event"
          className="flex-1 min-w-[180px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        />
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value as ScheduleItem["track"])}
          className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
        >
          <option value="general">General</option>
          <option value="bride">Bride track</option>
        </select>
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

// ─── Bride care ──────────────────────────────────────────────────────────

function BrideCareBlock({ category }: { category: WorkspaceCategory }) {
  const stored = useMehndiStore((s) =>
    s.brideCare.find((b) => b.category_id === category.id),
  );
  const update = useMehndiStore((s) => s.updateBrideCare);
  const value = stored ?? defaultBrideCare(category.id);

  const storedMeta = useMehndiStore((s) =>
    s.logisticsJourneyMeta.find((m) => m.category_id === category.id),
  );
  const meta = storedMeta ?? defaultLogisticsJourneyMeta(category.id);
  const updateMeta = useMehndiStore((s) => s.updateLogisticsJourneyMeta);

  // Pull entertainment_during from the Vision journey if it has data —
  // surfaced as the placeholder of the entertainment field so the bride
  // can copy or build on it without overwriting silently.
  const visionEntertainment = usePrefilledEntertainment(category.id);
  const logisticsCheck = useMehndiStore((s) =>
    s.logisticsChecks.find((l) => l.category_id === category.id),
  );
  const updateCheck = useMehndiStore((s) => s.updateLogisticsCheck);

  return (
    <SectionLabel
      eyebrow="Step 2"
      title="Bride care during drying"
      description="Once mehendi is on, the bride can't eat, drink, or pick anything up. Assign someone."
      icon={<HandHeart size={14} strokeWidth={1.8} />}
    >
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <FieldText
          label="Assigned to"
          value={value.assignee_name}
          placeholder="e.g. Kavya Sharma"
          onChange={(v) =>
            update(category.id, { assignee_name: v })
          }
        />
        <FieldText
          label="Role"
          value={value.assignee_role}
          placeholder="e.g. sister / maid of honor"
          onChange={(v) => update(category.id, { assignee_role: v })}
        />
        <FieldText
          label="Contact"
          value={value.assignee_contact}
          placeholder="WhatsApp / phone"
          onChange={(v) =>
            update(category.id, { assignee_contact: v })
          }
        />
      </div>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Task list (one per line)
        </span>
        <textarea
          value={value.tasks}
          onChange={(e) => update(category.id, { tasks: e.target.value })}
          className="min-h-[110px] w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed focus:border-saffron/50 focus:outline-none"
        />
      </label>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Drying time estimate (hours)
          </span>
          <input
            type="number"
            min={1}
            max={12}
            step={0.5}
            value={meta.drying_time_hours}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) {
                updateMeta(category.id, { drying_time_hours: n });
              }
            }}
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
          />
          <span className="mt-0.5 block text-[10.5px] text-ink-faint">
            Plan for 4–6 hours with lemon-sugar reapplied hourly.
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Entertainment during drying
          </span>
          <textarea
            value={
              logisticsCheck?.entertainment_plan ?? ""
            }
            onChange={(e) =>
              updateCheck(category.id, {
                entertainment_plan: e.target.value,
              })
            }
            placeholder={
              visionEntertainment
                ? `From your Vision journey: ${visionEntertainment}`
                : "e.g. live dholki at 3pm, chaat station, bangle stall…"
            }
            className="min-h-[60px] w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          />
        </label>
      </div>
    </SectionLabel>
  );
}

// Pulls entertainment_during from the Vision journey state if non-empty.
// Lives in localStorage at marigold:guided-journey:v1:mehendi.
function usePrefilledEntertainment(categoryId: string): string | null {
  if (typeof window === "undefined") return null;
  void categoryId; // Vision journey is per-category, not per workspace.
  try {
    const raw = window.localStorage.getItem(
      "marigold:guided-journey:v1:mehendi",
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      formData?: { guest_mehendi?: { entertainment_during?: string[] } };
    };
    const list = parsed.formData?.guest_mehendi?.entertainment_during;
    if (!Array.isArray(list) || list.length === 0) return null;
    const filtered = list.filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0,
    );
    return filtered.length > 0 ? filtered.join(", ") : null;
  } catch {
    return null;
  }
}

// ─── Setup logistics ─────────────────────────────────────────────────────

function SetupLogisticsBlock({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const storedSetup = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = storedSetup ?? defaultSetup(category.id);
  const storedCheck = useMehndiStore((s) =>
    s.logisticsChecks.find((l) => l.category_id === category.id),
  );
  const check = storedCheck ?? defaultLogisticsCheck(category.id);
  const updateSetup = useMehndiStore((s) => s.updateSetup);
  const updateCheck = useMehndiStore((s) => s.updateLogisticsCheck);

  return (
    <SectionLabel
      eyebrow="Step 3"
      title="Setup & logistics"
      description="Walk through with your planner before the event."
      icon={<Boxes size={14} strokeWidth={1.8} />}
    >
      <ul className="space-y-2">
        <LogisticsRow
          label="Chairs with armrests confirmed"
          checked={check.chairs_confirmed}
          onToggle={() =>
            updateCheck(category.id, {
              chairs_confirmed: !check.chairs_confirmed,
            })
          }
        >
          <select
            value={setup.seating}
            onChange={(e) =>
              updateSetup(category.id, {
                seating: e.target.value as EventSetup["seating"],
              })
            }
            className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
          >
            <option value="chairs_with_armrests">Chairs with armrests</option>
            <option value="cushions_low_seating">
              Cushions / low seating
            </option>
            <option value="mixed">Mixed</option>
          </select>
        </LogisticsRow>

        <LogisticsRow
          label="Lighting — natural daylight or ring lights"
          checked={check.lighting_arranged}
          onToggle={() =>
            updateCheck(category.id, {
              lighting_arranged: !check.lighting_arranged,
            })
          }
        >
          <select
            value={setup.lighting}
            onChange={(e) =>
              updateSetup(category.id, {
                lighting: e.target.value as EventSetup["lighting"],
              })
            }
            className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
          >
            <option value="natural_daylight">Natural daylight</option>
            <option value="task_lighting">Task lighting</option>
            <option value="mixed">Mixed</option>
          </select>
        </LogisticsRow>

        <LogisticsRow
          label="Ventilation / AC ready"
          checked={check.ventilation_ready}
          onToggle={() =>
            updateCheck(category.id, {
              ventilation_ready: !check.ventilation_ready,
            })
          }
        >
          <select
            value={setup.ventilation}
            onChange={(e) =>
              updateSetup(category.id, {
                ventilation: e.target.value as EventSetup["ventilation"],
              })
            }
            className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
          >
            <option value="open_air">Open air</option>
            <option value="well_ventilated_indoor">
              Well-ventilated indoor
            </option>
            <option value="standard_indoor">Standard indoor</option>
          </select>
        </LogisticsRow>

        <LogisticsRow
          label="Drying area set up"
          checked={check.drying_area_set}
          onToggle={() =>
            updateCheck(category.id, {
              drying_area_set: !check.drying_area_set,
            })
          }
        >
          <input
            value={setup.drying_plan}
            onChange={(e) =>
              updateSetup(category.id, { drying_plan: e.target.value })
            }
            placeholder="e.g. courtyard with fans and floor cushions"
            className="flex-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron/50 focus:outline-none"
          />
        </LogisticsRow>
      </ul>
    </SectionLabel>
  );
}

// ─── Shared row ──────────────────────────────────────────────────────────

function LogisticsRow({
  label,
  checked,
  onToggle,
  children,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "rounded-md border p-3 transition-colors",
        checked ? "border-sage/40 bg-sage-pale/30" : "border-border bg-white",
      )}
    >
      <label className="flex items-start gap-2.5 text-[13px] text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 accent-sage"
        />
        <span className="flex-1 font-medium">{label}</span>
      </label>
      {children && (
        <div className="mt-2 flex items-center gap-2 pl-6">{children}</div>
      )}
    </li>
  );
}

function FieldText({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}

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
