"use client";

// ── Ceremony Logistics ────────────────────────────────────────────────────
// Mandap setup, audio, guest experience, and vendor coordination — the
// physical/technical spec that turns the ceremony brief into a real event.

import {
  Armchair,
  Camera,
  Flame,
  Mic2,
  Music2,
  ShieldCheck,
  Umbrella,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanditStore } from "@/stores/pandit-store";
import type {
  CeremonyLogistics as Logistics,
  MandapDirection,
  PanditMicType,
} from "@/types/pandit";
import {
  MANDAP_DIRECTION_LABEL,
  PANDIT_MIC_LABEL,
} from "@/types/pandit";
import {
  Eyebrow,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { BuildJourneyDualCTA } from "@/components/guided-journeys/officiant-build/BuildJourneyDualCTA";

export function CeremonyLogistics() {
  const logistics = usePanditStore((s) => s.logistics);
  const update = usePanditStore((s) => s.updateLogistics);

  return (
    <div className="space-y-6">
      <BuildJourneyDualCTA
        startAtSession="ceremony_logistics"
        guidedHeading="Build the day-of plan with us"
      />
      <SectionHeader
        eyebrow="Ceremony Logistics"
        title="The physical and technical setup"
        description="Mandap, audio, guest flow — and coordination notes that ride across vendors. This page is the handoff sheet for photographer, videographer, DJ, and décor."
      />

      {/* ── Mandap ───────────────────────────────────────────────────── */}
      <PanelCard
        icon={<Armchair size={14} strokeWidth={1.6} />}
        title="Mandap setup"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Couple faces"
            value={logistics.mandap_orientation}
            onChange={(v) =>
              update({ mandap_orientation: v as MandapDirection })
            }
            options={(
              Object.keys(MANDAP_DIRECTION_LABEL) as MandapDirection[]
            ).map((d) => ({ value: d, label: MANDAP_DIRECTION_LABEL[d] }))}
            hint="Traditionally north or east."
          />
          <TextField
            label="Mandap dimensions"
            value={logistics.mandap_dimensions}
            onChange={(v) => update({ mandap_dimensions: v })}
            placeholder="12 x 12 ft"
          />
        </div>
        <div className="mt-4">
          <TextField
            label="Havan kund placement"
            value={logistics.havan_kund_placement}
            onChange={(v) => update({ havan_kund_placement: v })}
            rows={2}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckboxField
            icon={<Flame size={12} strokeWidth={1.8} />}
            label="Fire permit required by venue"
            value={logistics.fire_permit_needed}
            onChange={(v) => update({ fire_permit_needed: v })}
          />
          {logistics.fire_permit_needed && (
            <TextField
              label="Fire permit status"
              value={logistics.fire_permit_status}
              onChange={(v) => update({ fire_permit_status: v })}
              placeholder="Pending venue / Secured / Not applicable"
            />
          )}
        </div>
      </PanelCard>

      {/* ── Audio ────────────────────────────────────────────────────── */}
      <PanelCard icon={<Mic2 size={14} strokeWidth={1.6} />} title="Audio setup">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Officiant mic"
            value={logistics.pandit_mic_type}
            onChange={(v) => update({ pandit_mic_type: v as PanditMicType })}
            options={(
              Object.keys(PANDIT_MIC_LABEL) as PanditMicType[]
            ).map((t) => ({ value: t, label: PANDIT_MIC_LABEL[t] }))}
            hint="100+ guests → mic needed."
          />
          <CheckboxField
            label="Amplify mantras for guests"
            value={logistics.amplify_mantras}
            onChange={(v) => update({ amplify_mantras: v })}
          />
          <CheckboxField
            icon={<Music2 size={12} strokeWidth={1.8} />}
            label="Background instrumental during transitions"
            value={logistics.background_instrumental}
            onChange={(v) => update({ background_instrumental: v })}
          />
          {logistics.background_instrumental && (
            <TextField
              label="Instrumental note"
              value={logistics.background_instrumental_note}
              onChange={(v) => update({ background_instrumental_note: v })}
              placeholder="Soft sitar during transitions only"
            />
          )}
        </div>
        <div className="mt-4">
          <TextField
            label="Sound check time"
            value={logistics.sound_check_time}
            onChange={(v) => update({ sound_check_time: v })}
            placeholder="1:00 PM — 90 minutes before ceremony"
          />
        </div>
      </PanelCard>

      {/* ── Guest experience ─────────────────────────────────────────── */}
      <PanelCard
        icon={<Users2 size={14} strokeWidth={1.6} />}
        title="Guest experience"
      >
        <div className="space-y-4">
          <TextField
            label="Shoe removal plan"
            value={logistics.shoe_removal_plan}
            onChange={(v) => update({ shoe_removal_plan: v })}
            rows={2}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CheckboxField
              label="Water accessible near seating"
              value={logistics.water_available}
              onChange={(v) => update({ water_available: v })}
            />
            <CheckboxField
              icon={<Camera size={12} strokeWidth={1.8} />}
              label="Unplugged ceremony (no phones)"
              value={logistics.unplugged_ceremony}
              onChange={(v) => update({ unplugged_ceremony: v })}
            />
            <CheckboxField
              label="Children's quiet area"
              value={logistics.childrens_area}
              onChange={(v) => update({ childrens_area: v })}
            />
          </div>
          {logistics.childrens_area && (
            <TextField
              label="Children's area note"
              value={logistics.childrens_area_note}
              onChange={(v) => update({ childrens_area_note: v })}
              rows={2}
            />
          )}
          <TextField
            icon={<Umbrella size={12} strokeWidth={1.8} />}
            label="Weather considerations"
            value={logistics.weather_considerations}
            onChange={(v) => update({ weather_considerations: v })}
            rows={2}
          />
        </div>
      </PanelCard>

      {/* ── Vendor coordination ──────────────────────────────────────── */}
      <PanelCard
        icon={<ShieldCheck size={14} strokeWidth={1.6} />}
        title="Vendor coordination notes"
      >
        <p className="mb-3 text-[12px] text-ink-muted">
          These notes ride across workspaces. They show up on the
          photographer's shot list, the DJ's cue sheet, and the décor
          install plan. Keep them concrete — times, positions, cues.
        </p>
        <div className="space-y-3">
          <TextField
            icon={<Camera size={12} strokeWidth={1.8} />}
            label="For the photographer"
            value={logistics.photography_note}
            onChange={(v) => update({ photography_note: v })}
            rows={2}
          />
          <TextField
            icon={<Camera size={12} strokeWidth={1.8} />}
            label="For the videographer"
            value={logistics.videography_note}
            onChange={(v) => update({ videography_note: v })}
            rows={2}
          />
          <TextField
            icon={<Music2 size={12} strokeWidth={1.8} />}
            label="For the DJ / music"
            value={logistics.dj_note}
            onChange={(v) => update({ dj_note: v })}
            rows={2}
          />
          <TextField
            label="For décor"
            value={logistics.decor_note}
            onChange={(v) => update({ decor_note: v })}
            rows={2}
          />
        </div>
      </PanelCard>
    </div>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────

function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 1,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        {icon && <span className="text-ink-muted">{icon}</span>}
        <Eyebrow>{label}</Eyebrow>
      </div>
      {rows === 1 ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  return (
    <div>
      <Eyebrow className="mb-1">{label}</Eyebrow>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <p className="mt-1 text-[10.5px] italic text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

function CheckboxField({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-colors",
        value
          ? "border-saffron/40 bg-saffron-pale/20"
          : "border-border bg-white hover:border-saffron/30",
      )}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border text-saffron focus:ring-saffron"
      />
      {icon && <span className="text-ink-muted">{icon}</span>}
      <span className="text-[12.5px] text-ink">{label}</span>
    </label>
  );
}
