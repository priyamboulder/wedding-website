"use client";

// ── Equipment & Technical tab ─────────────────────────────────────────────
// Per-event sound, lighting, stage, power planning. One TechSpec per
// canonical event; the editor reveals all four sub-plans when an event
// is expanded. Volume levels are phase-tagged so the renderer can show
// the night's volume arc at a glance.

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Plus,
  Power,
  Radio,
  Speaker,
  Trash2,
  Volume2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Eyebrow,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import {
  ENERGY_EVENTS,
} from "@/stores/music-soundscape-store";
import {
  VOLUME_LEVEL_LABEL,
  VOLUME_PHASES,
  useMusicTechStore,
} from "@/stores/music-tech-store";
import type {
  EnergyEventId,
  SoundMic,
  SoundSpeaker,
  TechSpec,
  VolumeLevel,
  VolumePhase,
} from "@/types/music";

export function TechEquipmentTab() {
  const [expanded, setExpanded] = useState<EnergyEventId>("sangeet");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Equipment & Technical"
        title="The infrastructure that makes everything work"
        description="Sound, lighting, stage, power per event. Spec these with the venue AV lead and your DJ — one source of truth."
      />

      <div className="space-y-3">
        {ENERGY_EVENTS.map((evt) => (
          <TechSection
            key={evt.id}
            event={evt.id}
            label={evt.label}
            isExpanded={expanded === evt.id}
            onToggle={() =>
              setExpanded((prev) => (prev === evt.id ? ("haldi" as EnergyEventId) : evt.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Per-event section ────────────────────────────────────────────────────

function TechSection({
  event,
  label,
  isExpanded,
  onToggle,
}: {
  event: EnergyEventId;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const spec = useMusicTechStore((s) => s.specFor(event));

  return (
    <div className="rounded-lg border border-border bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron"
          >
            <Radio size={15} strokeWidth={1.6} />
          </span>
          <div>
            <p className="font-serif text-[16px] text-ink">{label}</p>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {spec.speakers.length} speakers · {totalMicCount(spec.mics)} mics
              {spec.sound_check_at && ` · check ${shortDate(spec.sound_check_at)}`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={15} className="text-ink-muted" />
        ) : (
          <ChevronDown size={15} className="text-ink-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 px-5 pb-5 pt-5 lg:grid-cols-2">
          <SoundSystemPanel event={event} spec={spec} />
          <LightingPanel event={event} spec={spec} />
          <StagePanel event={event} spec={spec} />
          <PowerPanel event={event} spec={spec} />
        </div>
      )}
    </div>
  );
}

// ── Sound system panel ───────────────────────────────────────────────────

function SoundSystemPanel({
  event,
  spec,
}: {
  event: EnergyEventId;
  spec: TechSpec;
}) {
  return (
    <PanelCard
      icon={<Speaker size={13} strokeWidth={1.7} />}
      title="Sound system"
    >
      <div className="space-y-4">
        <SpeakerList event={event} speakers={spec.speakers} />
        <MicList event={event} mics={spec.mics} />
        <SoundCheckRow event={event} spec={spec} />
        <VolumeArc event={event} levels={spec.volume_levels} />
        <BackupPlanRow event={event} spec={spec} />
      </div>
    </PanelCard>
  );
}

function SpeakerList({
  event,
  speakers,
}: {
  event: EnergyEventId;
  speakers: SoundSpeaker[];
}) {
  const add = useMusicTechStore((s) => s.addSpeaker);
  const remove = useMusicTechStore((s) => s.removeSpeaker);
  const [placement, setPlacement] = useState("");
  const [kind, setKind] = useState<SoundSpeaker["kind"]>("main_pa");
  return (
    <div>
      <Eyebrow>Speakers ({speakers.length})</Eyebrow>
      <ul className="mt-1 space-y-1">
        {speakers.length === 0 && (
          <li className="text-[11.5px] italic text-ink-faint">
            No speakers spec'd yet.
          </li>
        )}
        {speakers.map((sp) => (
          <li
            key={sp.id}
            className="flex items-center justify-between gap-2 rounded-md bg-ivory-warm/40 px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <Tag tone="ink">{labelSpeakerKind(sp.kind)}</Tag>
              <span className="text-[11.5px] text-ink">{sp.placement}</span>
            </div>
            <button
              type="button"
              onClick={() => remove(event, sp.id)}
              aria-label="Remove speaker"
              className="text-ink-faint hover:text-rose"
            >
              <Trash2 size={11} strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!placement.trim()) return;
          add(event, { placement: placement.trim(), kind });
          setPlacement("");
        }}
      >
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as SoundSpeaker["kind"])}
          className="rounded border border-border bg-white px-1.5 py-1 text-[11px] text-ink focus:border-saffron/50 focus:outline-none"
        >
          {(["main_pa", "monitor", "delay", "subwoofer", "fill"] as SoundSpeaker["kind"][]).map(
            (k) => (
              <option key={k} value={k}>
                {labelSpeakerKind(k)}
              </option>
            ),
          )}
        </select>
        <input
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          placeholder="Placement (Stage left main PA…)"
          className="flex-1 rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-ink/90 px-2 py-1 text-[11px] text-ivory hover:bg-ink"
        >
          Add
        </button>
      </form>
    </div>
  );
}

function MicList({ event, mics }: { event: EnergyEventId; mics: SoundMic[] }) {
  const add = useMusicTechStore((s) => s.addMic);
  const remove = useMusicTechStore((s) => s.removeMic);
  const [count, setCount] = useState(1);
  const [kind, setKind] = useState<SoundMic["kind"]>("wireless_handheld");
  const [notes, setNotes] = useState("");
  return (
    <div>
      <Eyebrow>Microphones</Eyebrow>
      <ul className="mt-1 space-y-1">
        {mics.length === 0 && (
          <li className="text-[11.5px] italic text-ink-faint">
            No mics spec'd yet.
          </li>
        )}
        {mics.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-md bg-ivory-warm/40 px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <Tag tone="ink">×{m.count}</Tag>
              <span className="text-[11.5px] text-ink">
                {labelMicKind(m.kind)}
              </span>
              {m.notes && (
                <span className="text-[10.5px] italic text-ink-muted">
                  ({m.notes})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(event, m.id)}
              aria-label="Remove mic"
              className="text-ink-faint hover:text-rose"
            >
              <Trash2 size={11} strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 grid grid-cols-2 gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          add(event, {
            count,
            kind,
            notes: notes.trim() || undefined,
          });
          setCount(1);
          setNotes("");
        }}
      >
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as SoundMic["kind"])}
          className="rounded border border-border bg-white px-1.5 py-1 text-[11px] text-ink focus:border-saffron/50 focus:outline-none"
        >
          {(["wireless_handheld", "lapel", "instrument", "headset"] as SoundMic["kind"][]).map(
            (k) => (
              <option key={k} value={k}>
                {labelMicKind(k)}
              </option>
            ),
          )}
        </select>
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
          className="rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-saffron/50 focus:outline-none"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (for emcee + speeches)…"
          className="col-span-2 rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="submit"
          className="col-span-2 rounded bg-ink/90 px-2 py-1 text-[11px] text-ivory hover:bg-ink"
        >
          Add mic kit
        </button>
      </form>
    </div>
  );
}

function SoundCheckRow({
  event,
  spec,
}: {
  event: EnergyEventId;
  spec: TechSpec;
}) {
  const setCheck = useMusicTechStore((s) => s.setSoundCheck);
  return (
    <div>
      <Eyebrow>Sound check</Eyebrow>
      <input
        type="datetime-local"
        value={spec.sound_check_at ? toLocalInput(spec.sound_check_at) : ""}
        onChange={(e) =>
          setCheck(
            event,
            e.target.value ? new Date(e.target.value).toISOString() : undefined,
            spec.sound_check_attendees,
          )
        }
        className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-saffron/50 focus:outline-none"
      />
      <input
        value={(spec.sound_check_attendees ?? []).join(", ")}
        onChange={(e) =>
          setCheck(
            event,
            spec.sound_check_at,
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        placeholder="Attendees (comma separated)"
        className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
    </div>
  );
}

function VolumeArc({
  event,
  levels,
}: {
  event: EnergyEventId;
  levels: VolumeLevel[];
}) {
  const setLevel = useMusicTechStore((s) => s.setVolumeLevel);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Eyebrow>
          <span className="inline-flex items-center gap-1">
            <Volume2 size={10} strokeWidth={1.7} /> Volume arc
          </span>
        </Eyebrow>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {VOLUME_PHASES.map((p) => {
          const current = levels.find((v) => v.phase === p.id)?.level ?? 0;
          return (
            <div key={p.id} className="space-y-1 text-center">
              <p
                className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {p.label}
              </p>
              <select
                value={current}
                onChange={(e) =>
                  setLevel(event, {
                    phase: p.id as VolumePhase,
                    level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                  })
                }
                className="w-full rounded border border-border bg-white px-1 py-0.5 text-[10.5px] text-ink focus:border-saffron/50 focus:outline-none"
              >
                <option value={0}>—</option>
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <option key={n} value={n}>
                    {n} · {VOLUME_LEVEL_LABEL[n]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BackupPlanRow({
  event,
  spec,
}: {
  event: EnergyEventId;
  spec: TechSpec;
}) {
  const setPlan = useMusicTechStore((s) => s.setBackupPlan);
  return (
    <div>
      <Eyebrow>Backup equipment plan</Eyebrow>
      <textarea
        value={spec.backup_plan ?? ""}
        onChange={(e) => setPlan(event, e.target.value || undefined)}
        rows={2}
        placeholder="Spare wireless mic kit, spare DJ controller, weather pivot…"
        className="mt-1 w-full resize-none rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
    </div>
  );
}

// ── Lighting panel ───────────────────────────────────────────────────────

function LightingPanel({
  event,
  spec,
}: {
  event: EnergyEventId;
  spec: TechSpec;
}) {
  const set = useMusicTechStore((s) => s.setLighting);
  const l = spec.lighting;
  return (
    <PanelCard
      icon={<Lightbulb size={13} strokeWidth={1.7} />}
      title="Lighting plan"
    >
      <div className="space-y-2 text-[11.5px]">
        <FieldRow
          label="Uplighting color"
          value={l.uplighting_color ?? ""}
          placeholder="(Tied to Décor palette)"
          onChange={(v) => set(event, { uplighting_color: v || undefined })}
        />
        <FieldRow
          label="Dance floor"
          value={l.dance_floor ?? ""}
          placeholder="Disco ball + LED matrix…"
          onChange={(v) => set(event, { dance_floor: v || undefined })}
        />
        <FieldRow
          label="Ceremony lighting"
          value={l.ceremony_lighting ?? ""}
          placeholder="Cinematic spot on couple…"
          onChange={(v) => set(event, { ceremony_lighting: v || undefined })}
        />
        <div className="grid grid-cols-3 gap-1 pt-1">
          <CheckboxRow
            label="Performance spotlight"
            checked={l.performance_spotlight ?? false}
            onChange={(c) => set(event, { performance_spotlight: c })}
          />
          <CheckboxRow
            label="Pin spots on tables"
            checked={l.pin_spots_on_centerpieces ?? false}
            onChange={(c) => set(event, { pin_spots_on_centerpieces: c })}
          />
          <CheckboxRow
            label="Cake spotlight"
            checked={l.cake_spotlight ?? false}
            onChange={(c) => set(event, { cake_spotlight: c })}
          />
        </div>
      </div>
    </PanelCard>
  );
}

// ── Stage panel ──────────────────────────────────────────────────────────

function StagePanel({
  event,
  spec,
}: {
  event: EnergyEventId;
  spec: TechSpec;
}) {
  const set = useMusicTechStore((s) => s.setStage);
  const st = spec.stage;
  return (
    <PanelCard
      icon={<Wand2 size={13} strokeWidth={1.7} />}
      title="Stage & dance floor"
    >
      <div className="space-y-2 text-[11.5px]">
        <FieldRow
          label="Stage size"
          value={st.stage_size ?? ""}
          placeholder='e.g. 20x16 ft riser, 18" tall'
          onChange={(v) => set(event, { stage_size: v || undefined })}
        />
        <FieldRow
          label="Dance floor"
          value={st.dance_floor_size ?? ""}
          placeholder="30x30 ft parquet"
          onChange={(v) => set(event, { dance_floor_size: v || undefined })}
        />
        <FieldRow
          label="DJ booth placement"
          value={st.dj_booth_placement ?? ""}
          placeholder="Stage right corner"
          onChange={(v) => set(event, { dj_booth_placement: v || undefined })}
        />
        <CheckboxRow
          label="Stage risers for performers"
          checked={st.stage_risers_for_performers ?? false}
          onChange={(c) => set(event, { stage_risers_for_performers: c })}
        />
      </div>
    </PanelCard>
  );
}

// ── Power panel ──────────────────────────────────────────────────────────

function PowerPanel({
  event,
  spec,
}: {
  event: EnergyEventId;
  spec: TechSpec;
}) {
  const set = useMusicTechStore((s) => s.setPower);
  const p = spec.power;
  const [drop, setDrop] = useState("");
  return (
    <PanelCard
      icon={<Power size={13} strokeWidth={1.7} />}
      title="Power requirements"
    >
      <div className="space-y-2 text-[11.5px]">
        <FieldRow
          label="Total draw estimate"
          value={p.total_draw_estimate ?? ""}
          placeholder="e.g. 100A 3-phase"
          onChange={(v) => set(event, { total_draw_estimate: v || undefined })}
        />
        <CheckboxRow
          label="Generator required (outdoor / off-grid)"
          checked={p.generator_required ?? false}
          onChange={(c) => set(event, { generator_required: c })}
        />
        <div>
          <Eyebrow>Power drops</Eyebrow>
          <ul className="mt-1 space-y-1">
            {(p.power_drop_locations ?? []).map((d) => (
              <li
                key={d}
                className="flex items-center justify-between gap-2 rounded-md bg-ivory-warm/40 px-2 py-1"
              >
                <span className="text-[11.5px] text-ink">{d}</span>
                <button
                  type="button"
                  onClick={() =>
                    set(event, {
                      power_drop_locations: (p.power_drop_locations ?? []).filter(
                        (x) => x !== d,
                      ),
                    })
                  }
                  aria-label="Remove drop"
                  className="text-ink-faint hover:text-rose"
                >
                  <X size={11} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (!drop.trim()) return;
              set(event, {
                power_drop_locations: [
                  ...(p.power_drop_locations ?? []),
                  drop.trim(),
                ],
              });
              setDrop("");
            }}
          >
            <input
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              placeholder="Power drop location…"
              className="flex-1 rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-0.5 rounded bg-ink/90 px-2 py-1 text-[11px] text-ivory hover:bg-ink"
            >
              <Plus size={11} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </PanelCard>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function FieldRow({
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
      <Eyebrow>{label}</Eyebrow>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 text-[11.5px]",
        checked ? "text-ink" : "text-ink-muted",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function labelSpeakerKind(k: SoundSpeaker["kind"]): string {
  switch (k) {
    case "main_pa":
      return "Main PA";
    case "monitor":
      return "Monitor";
    case "delay":
      return "Delay";
    case "subwoofer":
      return "Sub";
    case "fill":
      return "Fill";
  }
}

function labelMicKind(k: SoundMic["kind"]): string {
  switch (k) {
    case "wireless_handheld":
      return "Wireless handheld";
    case "lapel":
      return "Lapel";
    case "instrument":
      return "Instrument";
    case "headset":
      return "Headset";
  }
}

function totalMicCount(mics: SoundMic[]): number {
  return mics.reduce((sum, m) => sum + (m.count || 0), 0);
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
