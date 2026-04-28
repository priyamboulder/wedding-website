"use client";

// ── Day-of Flow tab ───────────────────────────────────────────────────────
// Replaces Day-of Schedule. Keeps the existing timeline + bride care content
// (they were the best part of the old tab) and adds a setup-logistics
// checklist that pulls in fields previously buried inside the Guest Mehendi
// Plan setup card.

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
  defaultSetup,
  useMehndiStore,
} from "@/stores/mehndi-store";
import type {
  EventSetup,
  MehndiLogisticsCheck,
  ScheduleItem,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

export function DayOfFlowTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Day-of Flow"
        title="minute by minute — bride, guests, artists"
        description="A shared timeline keeps the artist team, the bride's family, and the planner aligned. The bride-care plan keeps her hands safe while they dry. The setup checklist keeps the room working."
      />

      <TimelineCard category={category} />
      <BrideCareCard category={category} />
      <LogisticsChecklistCard category={category} />
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────

function TimelineCard({ category }: { category: WorkspaceCategory }) {
  const allItems = useMehndiStore((s) => s.scheduleItems);
  const seed = useMehndiStore((s) => s.seedDefaultSchedule);
  const add = useMehndiStore((s) => s.addScheduleItem);
  const update = useMehndiStore((s) => s.updateScheduleItem);
  const del = useMehndiStore((s) => s.deleteScheduleItem);

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
    <PanelCard
      icon={<Clock size={14} strokeWidth={1.8} />}
      title="mehendi day timeline"
      badge={
        items.length > 0 ? (
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {items.length} items
          </span>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-4 py-5 text-center">
          <p className="mb-3 text-[12.5px] italic text-ink-muted">
            Empty timeline. Load the default 12:00–17:30 flow, then edit to
            match your venue.
          </p>
          <button
            type="button"
            onClick={() => seed(category.id)}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Sparkles size={12} strokeWidth={2} />
            Load default schedule
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
                    aria-label="Delete item"
                    onClick={() => del(item.id)}
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
          placeholder="Add an event (e.g. Final touch-ups)"
          className="flex-1 min-w-[180px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
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
          <Plus size={12} strokeWidth={2} />
          Add
        </button>
      </div>
    </PanelCard>
  );
}

// ── Bride care ────────────────────────────────────────────────────────────

function BrideCareCard({ category }: { category: WorkspaceCategory }) {
  const stored = useMehndiStore((s) =>
    s.brideCare.find((b) => b.category_id === category.id),
  );
  const update = useMehndiStore((s) => s.updateBrideCare);
  const value = stored ?? defaultBrideCare(category.id);

  return (
    <PanelCard
      icon={<HandHeart size={14} strokeWidth={1.8} />}
      title="bride care during drying"
      badge={
        value.assignee_name ? (
          <span className="rounded-full bg-rose-pale/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-rose">
            Assigned · {value.assignee_name}
          </span>
        ) : (
          <span className="rounded-full bg-ivory-warm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            Unassigned
          </span>
        )
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Once the bride&apos;s mehendi is on, she can&apos;t eat, drink, or pick
        things up without help. Assign someone — usually a sister or a close
        bridesmaid — and list what they should do.
      </p>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Assigned to
          </span>
          <input
            value={value.assignee_name}
            onChange={(e) =>
              update(category.id, { assignee_name: e.target.value })
            }
            placeholder="e.g. Kavya Sharma"
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Role
          </span>
          <input
            value={value.assignee_role}
            onChange={(e) =>
              update(category.id, { assignee_role: e.target.value })
            }
            placeholder="e.g. sister / maid of honor"
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Contact
          </span>
          <input
            value={value.assignee_contact}
            onChange={(e) =>
              update(category.id, { assignee_contact: e.target.value })
            }
            placeholder="WhatsApp / phone"
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
          />
        </label>
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

      <DryingEstimate category={category} />
    </PanelCard>
  );
}

function DryingEstimate({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const loved = prefs?.loved_directions ?? [];
  const denseLike =
    loved.includes("heritage_maximalist") ||
    loved.includes("storytelling_bridal");
  const lightLike =
    loved.includes("modern_minimal") || loved.includes("lace_flow");

  let estimate = "Plan for 4–6 hours with lemon-sugar sealant reapplied hourly.";
  if (denseLike) {
    estimate =
      "Dense bridal work needs 6–8 hours of drying. Don't schedule anything that requires hands until tomorrow morning.";
  } else if (lightLike) {
    estimate =
      "Lighter designs dry in 3–5 hours — but still plan the bride can't pick up anything for the rest of the evening.";
  }

  return (
    <p className="mt-3 rounded-md border border-saffron/30 bg-saffron-pale/20 px-3 py-2 text-[12px] text-ink">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
        Drying time estimate ·{" "}
      </span>
      {estimate}
    </p>
  );
}

// ── Logistics checklist ───────────────────────────────────────────────────

function LogisticsChecklistCard({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const stored = useMehndiStore((s) =>
    s.logisticsChecks.find((l) => l.category_id === category.id),
  );
  const storedSetup = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const updateCheck = useMehndiStore((s) => s.updateLogisticsCheck);
  const updateSetup = useMehndiStore((s) => s.updateSetup);
  const value = stored ?? defaultLogisticsCheck(category.id);
  const setup = storedSetup ?? defaultSetup(category.id);

  return (
    <PanelCard
      icon={<Boxes size={14} strokeWidth={1.8} />}
      title="setup & logistics"
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Walk through with your planner before the event — tick each once it
        matches reality at the venue.
      </p>

      <ul className="space-y-2">
        <LogisticsRow
          label="Chairs with armrests confirmed"
          hint={`Seating: ${labelFor("seating", setup.seating)}`}
          checked={value.chairs_confirmed}
          onToggle={() =>
            updateCheck(category.id, {
              chairs_confirmed: !value.chairs_confirmed,
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
            <option value="cushions_low_seating">Cushions / low seating</option>
            <option value="mixed">Mixed</option>
          </select>
        </LogisticsRow>

        <LogisticsRow
          label="Good natural light or ring lights arranged"
          hint={`Lighting: ${labelFor("lighting", setup.lighting)}`}
          checked={value.lighting_arranged}
          onToggle={() =>
            updateCheck(category.id, {
              lighting_arranged: !value.lighting_arranged,
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
          label="Ventilation / AC confirmed for indoor venue"
          hint={`Ventilation: ${labelFor("ventilation", setup.ventilation)}`}
          checked={value.ventilation_ready}
          onToggle={() =>
            updateCheck(category.id, {
              ventilation_ready: !value.ventilation_ready,
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
          label="Drying area with cushions set up"
          hint="Where the bride (and guests) sit while henna sets."
          checked={value.drying_area_set}
          onToggle={() =>
            updateCheck(category.id, {
              drying_area_set: !value.drying_area_set,
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

        <li className="rounded-md border border-border bg-white p-3">
          <div className="mb-1 text-[13px] font-medium text-ink">
            Entertainment while waiting
          </div>
          <p className="mb-2 text-[11.5px] text-ink-muted">
            Guests with drying hands still want to be part of the party —
            dholki, chaat, a bangle stall, music. What&apos;s yours?
          </p>
          <textarea
            value={value.entertainment_plan}
            onChange={(e) =>
              updateCheck(category.id, {
                entertainment_plan: e.target.value,
              })
            }
            placeholder="e.g. live dholki at 3pm, chaat station by the courtyard, bangle stall near the entrance…"
            className="min-h-[60px] w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          />
        </li>
      </ul>
    </PanelCard>
  );
}

function LogisticsRow({
  label,
  hint,
  checked,
  onToggle,
  children,
}: {
  label: string;
  hint: string;
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
        <span className="flex-1">
          <span className="font-medium">{label}</span>
          <span className="mt-0.5 block text-[11.5px] text-ink-muted">
            {hint}
          </span>
        </span>
      </label>
      {children && (
        <div className="mt-2 flex items-center gap-2 pl-6">{children}</div>
      )}
    </li>
  );
}

function labelFor(
  field: "seating" | "lighting" | "ventilation",
  value: string,
): string {
  const map: Record<string, Record<string, string>> = {
    seating: {
      chairs_with_armrests: "Chairs with armrests",
      cushions_low_seating: "Cushions / low seating",
      mixed: "Mixed",
    },
    lighting: {
      natural_daylight: "Natural daylight",
      task_lighting: "Task lighting",
      mixed: "Mixed",
    },
    ventilation: {
      open_air: "Open air",
      well_ventilated_indoor: "Well-ventilated indoor",
      standard_indoor: "Standard indoor",
    },
  };
  return map[field]?.[value] ?? value;
}
