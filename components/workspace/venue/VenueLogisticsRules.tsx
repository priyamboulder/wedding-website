"use client";

// ── Logistics & Rules tab ──────────────────────────────────────────────────
// Structured fields, not a free-text dump. Other workspaces read these:
//   Catering      ← catering_policy, kitchen_access, alcohol_policy, corkage
//   Décor         ← vendor_loading_window, wall_attachment_rules
//   Music         ← music_curfew_indoor, music_curfew_outdoor, power_circuits
//   Transport     ← parking_capacity, valet, shuttle_drop_off, baraat_rules
//   Pandit        ← fire_ceremony_policy, fire_permit_owner
//   Travel        ← room_block_details, minimum_night_stay
// Each section is a small PanelCard with inline-editable text fields.

import { useState } from "react";
import {
  Car,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  HousePlus,
  Plus,
  ShieldCheck,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { useVenueStore } from "@/stores/venue-store";
import type { VenueLogistics } from "@/types/venue";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";

export function VenueLogisticsRules() {
  return (
    <div className="space-y-4">
      <p className="text-[12.5px] leading-relaxed text-ink-muted">
        Everything here is pulled into the other workspaces — Catering reads
        the kitchen policy, Music reads the curfew, Pandit reads the havan
        rule. Keep them accurate.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AccessTimingSection />
        <CateringSection />
        <VendorAccessSection />
        <PowerSection />
        <CeremonySection />
        <ParkingTransportSection />
        <AccommodationSection />
        <WeatherSection />
        <InsuranceSection />
      </div>
    </div>
  );
}

// ── Shared field row ──────────────────────────────────────────────────────

function Field({
  label,
  value,
  onSave,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (n: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2 py-1">
      <Eyebrow className="pt-1.5">{label}</Eyebrow>
      <InlineText
        value={value}
        onSave={onSave}
        allowEmpty
        placeholder={placeholder ?? "—"}
        className="!p-0 text-[12.5px] leading-relaxed"
      />
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1.5">
      <Eyebrow>{label}</Eyebrow>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex w-fit items-center gap-2 rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted hover:border-saffron hover:text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span
          className={`h-2 w-2 rounded-full ${value ? "bg-saffron" : "bg-border"}`}
        />
        {value ? "Allowed" : "Not allowed"}
      </button>
    </div>
  );
}

// ── Section helpers (each pulls its slice of VenueLogistics) ──────────────

function useLogisticsField<K extends keyof VenueLogistics>(key: K) {
  const value = useVenueStore((s) => s.logistics[key]);
  const setLogistics = useVenueStore((s) => s.setLogistics);
  const set = (v: VenueLogistics[K]) =>
    setLogistics({ [key]: v } as Partial<VenueLogistics>);
  return [value, set] as const;
}

// ── Sections ──────────────────────────────────────────────────────────────

function AccessTimingSection() {
  const [loadIn, setLoadIn] = useLogisticsField("load_in_window");
  const [vendor, setVendor] = useLogisticsField("vendor_access");
  const [indoor, setIndoor] = useLogisticsField("music_curfew_indoor");
  const [outdoor, setOutdoor] = useLogisticsField("music_curfew_outdoor");
  const [endTime, setEndTime] = useLogisticsField("event_end_time");
  const [overtime, setOvertime] = useLogisticsField("overtime_rate");

  return (
    <PanelCard icon={<Clock size={14} strokeWidth={1.8} />} title="access & timing">
      <Field label="Load-in window" value={loadIn} onSave={setLoadIn} />
      <Field label="Vendor access" value={vendor} onSave={setVendor} />
      <Field label="Music — indoor" value={indoor} onSave={setIndoor} />
      <Field label="Music — outdoor" value={outdoor} onSave={setOutdoor} />
      <Field label="Event end time" value={endTime} onSave={setEndTime} />
      <Field label="Overtime rate" value={overtime} onSave={setOvertime} />
    </PanelCard>
  );
}

function CateringSection() {
  const [policy, setPolicy] = useLogisticsField("catering_policy");
  const [kitchen, setKitchen] = useLogisticsField("kitchen_access");
  const outsideAllowed = useVenueStore((s) => s.logistics.outside_caterer_allowed);
  const setLogistics = useVenueStore((s) => s.setLogistics);
  const [pref, setPref] = useLogisticsField("preferred_caterer_list");
  const [alcohol, setAlcohol] = useLogisticsField("alcohol_policy");
  const [corkage, setCorkage] = useLogisticsField("corkage_fee");

  return (
    <PanelCard
      icon={<UtensilsCrossed size={14} strokeWidth={1.8} />}
      title="catering"
    >
      <Field label="Policy" value={policy} onSave={setPolicy} />
      <Field label="Kitchen access" value={kitchen} onSave={setKitchen} />
      <ToggleField
        label="Outside caterer"
        value={outsideAllowed}
        onChange={(v) => setLogistics({ outside_caterer_allowed: v })}
      />
      <Field label="Preferred list" value={pref} onSave={setPref} />
      <Field label="Alcohol" value={alcohol} onSave={setAlcohol} />
      <Field label="Corkage fee" value={corkage} onSave={setCorkage} />
    </PanelCard>
  );
}

function VendorAccessSection() {
  const [window, setWindow] = useLogisticsField("vendor_loading_window");
  const [walls, setWalls] = useLogisticsField("wall_attachment_rules");
  const restrictions = useVenueStore((s) => s.logistics.restrictions);
  const addRestriction = useVenueStore((s) => s.addRestriction);
  const removeRestriction = useVenueStore((s) => s.removeRestriction);
  const [draft, setDraft] = useState("");

  return (
    <PanelCard
      icon={<ClipboardList size={14} strokeWidth={1.8} />}
      title="vendor access & restrictions"
    >
      <Field label="Loading window" value={window} onSave={setWindow} />
      <Field label="Wall attachments" value={walls} onSave={setWalls} />
      <div className="mt-2">
        <Eyebrow className="mb-1.5">General restrictions</Eyebrow>
        <ul className="space-y-1">
          {restrictions.length === 0 && (
            <li className="text-[12px] italic text-ink-faint">
              None yet — add constraints like "no open flame indoors".
            </li>
          )}
          {restrictions.map((r, i) => (
            <li
              key={`${r}-${i}`}
              className="group flex items-start gap-2 text-[12.5px] text-ink"
            >
              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
              <span className="flex-1">{r}</span>
              <button
                type="button"
                onClick={() => removeRestriction(i)}
                className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove"
              >
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center gap-2">
          <Plus size={12} className="text-ink-faint" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                e.preventDefault();
                addRestriction(draft.trim());
                setDraft("");
              }
            }}
            placeholder="Add a restriction…"
            className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>
    </PanelCard>
  );
}

function PowerSection() {
  const [circuits, setCircuits] = useLogisticsField("power_circuits");
  const [notes, setNotes] = useLogisticsField("power_notes");

  return (
    <PanelCard icon={<Zap size={14} strokeWidth={1.8} />} title="power">
      <Field label="Circuits" value={circuits} onSave={setCircuits} />
      <Field label="Notes" value={notes} onSave={setNotes} />
    </PanelCard>
  );
}

function CeremonySection() {
  const [policy, setPolicy] = useLogisticsField("fire_ceremony_policy");
  const [owner, setOwner] = useLogisticsField("fire_permit_owner");

  return (
    <PanelCard
      icon={<Flame size={14} strokeWidth={1.8} />}
      title="ceremony — havan & permits"
    >
      <Field
        label="Fire policy"
        value={policy}
        onSave={setPolicy}
        placeholder="Where and how havan is permitted"
      />
      <Field
        label="Permit owner"
        value={owner}
        onSave={setOwner}
        placeholder="Who files the fire permit — couple, venue, vendor"
      />
    </PanelCard>
  );
}

function ParkingTransportSection() {
  const [parking, setParking] = useLogisticsField("parking_capacity");
  const [valet, setValet] = useLogisticsField("valet");
  const [shuttle, setShuttle] = useLogisticsField("shuttle_drop_off");
  const [baraat, setBaraat] = useLogisticsField("baraat_rules");

  return (
    <PanelCard
      icon={<Car size={14} strokeWidth={1.8} />}
      title="parking & transport"
    >
      <Field label="Parking" value={parking} onSave={setParking} />
      <Field label="Valet" value={valet} onSave={setValet} />
      <Field label="Shuttle drop-off" value={shuttle} onSave={setShuttle} />
      <Field label="Baraat rules" value={baraat} onSave={setBaraat} />
    </PanelCard>
  );
}

function AccommodationSection() {
  const [block, setBlock] = useLogisticsField("room_block_details");
  const [nights, setNights] = useLogisticsField("minimum_night_stay");

  return (
    <PanelCard
      icon={<HousePlus size={14} strokeWidth={1.8} />}
      title="rooms & accommodation"
    >
      <Field label="Room block" value={block} onSave={setBlock} />
      <Field label="Min. night stay" value={nights} onSave={setNights} />
    </PanelCard>
  );
}

function WeatherSection() {
  const [backup, setBackup] = useLogisticsField("wet_weather_backup");

  return (
    <PanelCard title="wet weather backup">
      <InlineText
        value={backup}
        onSave={setBackup}
        variant="block"
        allowEmpty
        placeholder="Which space is the rain plan for each outdoor event?"
        emptyLabel="Click to write the rain plan…"
        className="!p-0 text-[12.5px] leading-relaxed"
      />
    </PanelCard>
  );
}

function InsuranceSection() {
  const [ins, setIns] = useLogisticsField("event_insurance_required");
  const [liq, setLiq] = useLogisticsField("liquor_liability");

  return (
    <PanelCard
      icon={<ShieldCheck size={14} strokeWidth={1.8} />}
      title="insurance & permits"
    >
      <Field label="Event insurance" value={ins} onSave={setIns} />
      <Field label="Liquor liability" value={liq} onSave={setLiq} />
    </PanelCard>
  );
}
