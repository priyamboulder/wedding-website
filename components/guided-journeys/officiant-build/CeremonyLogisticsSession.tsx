"use client";

// ── Build Session 4 · Ceremony logistics ─────────────────────────────────
// Reads & writes through `usePanditStore` so this session is in permanent
// two-way sync with Tab 6 of the full workspace. This is a guided walk
// through the same fields — mandap, audio, guest experience, and vendor
// coordination notes that ride across other workspaces.
//
// Vendor coordination notes here are also surfaced (one-way mirror) on
// Photography / Videography / Music / Décor day-of coordination sections.
// Two-way sync is out of scope for v1.

import { useEffect } from "react";
import {
  Armchair,
  Camera,
  Flame,
  Mic2,
  Music2,
  Sparkles,
  Umbrella,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanditStore } from "@/stores/pandit-store";
import { useVenueStore } from "@/stores/venue-store";
import type { MandapDirection, PanditMicType } from "@/types/pandit";
import {
  MANDAP_DIRECTION_LABEL,
  PANDIT_MIC_LABEL,
} from "@/types/pandit";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

const FIRE_PERMIT_OPTIONS = [
  { value: "tbd", label: "To be decided" },
  { value: "pending", label: "Pending venue" },
  { value: "confirmed", label: "Secured" },
  { value: "not_required", label: "Not applicable" },
] as const;

export function CeremonyLogisticsSession() {
  const logistics = usePanditStore((s) => s.logistics);
  const update = usePanditStore((s) => s.updateLogistics);

  // Cross-workspace pull: if the booked/active venue is outdoor, prefill
  // the weather considerations field with a sensible nudge — but only when
  // the field is empty so we don't trample real notes.
  const isOutdoor = useIsBookedVenueOutdoor();
  useEffect(() => {
    if (
      isOutdoor &&
      !logistics.weather_considerations.trim()
    ) {
      update({
        weather_considerations:
          "Outdoor mandap — tent or covering required. Check 10-day forecast starting T-14. Have an indoor backup space or staked tent confirmed.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOutdoor]);

  return (
    <div className="space-y-6">
      {/* ── Mandap ───────────────────────────────────────────────────── */}
      <PanelCard
        icon={<Armchair size={14} strokeWidth={1.6} />}
        title="Mandap setup"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Couple faces">
            <select
              value={logistics.mandap_orientation}
              onChange={(e) =>
                update({
                  mandap_orientation: e.target.value as MandapDirection,
                })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            >
              {(
                Object.keys(MANDAP_DIRECTION_LABEL) as MandapDirection[]
              ).map((d) => (
                <option key={d} value={d}>
                  {MANDAP_DIRECTION_LABEL[d]}
                </option>
              ))}
            </select>
            <Hint>Traditionally north or east.</Hint>
          </Field>
          <Field label="Mandap dimensions">
            <input
              value={logistics.mandap_dimensions}
              onChange={(e) =>
                update({ mandap_dimensions: e.target.value })
              }
              placeholder="12 x 12 ft"
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Havan kund placement">
            <textarea
              value={logistics.havan_kund_placement}
              onChange={(e) =>
                update({ havan_kund_placement: e.target.value })
              }
              rows={2}
              placeholder="Center of mandap. Fire-safe mat required."
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckRow
            icon={<Flame size={12} strokeWidth={1.8} />}
            checked={logistics.fire_permit_needed}
            onChange={(v) => update({ fire_permit_needed: v })}
            label="Fire ceremony / havan kund needed"
          />
          <Field label="Fire permit status">
            <select
              value={logistics.fire_permit_status || "tbd"}
              onChange={(e) =>
                update({ fire_permit_status: e.target.value })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            >
              {FIRE_PERMIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </PanelCard>

      {/* ── Audio ────────────────────────────────────────────────────── */}
      <PanelCard
        icon={<Mic2 size={14} strokeWidth={1.6} />}
        title="Audio setup"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Officiant mic type">
            <select
              value={logistics.pandit_mic_type}
              onChange={(e) =>
                update({ pandit_mic_type: e.target.value as PanditMicType })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            >
              {(Object.keys(PANDIT_MIC_LABEL) as PanditMicType[]).map((m) => (
                <option key={m} value={m}>
                  {PANDIT_MIC_LABEL[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sound check time">
            <input
              value={logistics.sound_check_time}
              onChange={(e) =>
                update({ sound_check_time: e.target.value })
              }
              placeholder="1:00 PM — 90 min before ceremony"
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckRow
            checked={logistics.amplify_mantras}
            onChange={(v) => update({ amplify_mantras: v })}
            label="Amplify mantras for 100+ guests"
          />
          <CheckRow
            icon={<Music2 size={12} strokeWidth={1.8} />}
            checked={logistics.background_instrumental}
            onChange={(v) => update({ background_instrumental: v })}
            label="Background instrumental during ceremony"
          />
        </div>
        {logistics.background_instrumental && (
          <div className="mt-4">
            <Field label="Instrumental notes">
              <textarea
                value={logistics.background_instrumental_note}
                onChange={(e) =>
                  update({ background_instrumental_note: e.target.value })
                }
                rows={2}
                placeholder="Soft sitar during transitions only. Silent during mantras."
                className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
              />
            </Field>
          </div>
        )}
      </PanelCard>

      {/* ── Guest experience ─────────────────────────────────────────── */}
      <PanelCard
        icon={<Users2 size={14} strokeWidth={1.6} />}
        title="Guest experience"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Shoe removal plan">
            <textarea
              value={logistics.shoe_removal_plan}
              onChange={(e) =>
                update({ shoe_removal_plan: e.target.value })
              }
              rows={2}
              placeholder="Cubbies at the entrance. Numbered tags for guests."
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="Weather considerations">
            <textarea
              value={logistics.weather_considerations}
              onChange={(e) =>
                update({ weather_considerations: e.target.value })
              }
              rows={2}
              placeholder={
                isOutdoor
                  ? "Outdoor mandap — tent required. Check 10-day forecast starting T-14."
                  : "Heat, AC, ventilation, fire safety…"
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
            {isOutdoor && (
              <Hint className="text-saffron">
                <Umbrella size={10} className="mr-1 inline align-text-bottom" />
                Pulled from your venue — outdoor space.
              </Hint>
            )}
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <CheckRow
            checked={logistics.water_available}
            onChange={(v) => update({ water_available: v })}
            label="Water accessible near guest seating"
          />
          <CheckRow
            checked={logistics.unplugged_ceremony}
            onChange={(v) => update({ unplugged_ceremony: v })}
            label="Unplugged ceremony (no phones / cameras)"
          />
          <CheckRow
            checked={logistics.childrens_area}
            onChange={(v) => update({ childrens_area: v })}
            label="Children's quiet area"
          />
        </div>
        {logistics.childrens_area && (
          <div className="mt-3">
            <Field label="Children's area note">
              <input
                value={logistics.childrens_area_note}
                onChange={(e) =>
                  update({ childrens_area_note: e.target.value })
                }
                placeholder="Activity table at the back, with a sitter…"
                className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
              />
            </Field>
          </div>
        )}
      </PanelCard>

      {/* ── Vendor coordination notes ────────────────────────────────── */}
      <PanelCard
        icon={<Camera size={14} strokeWidth={1.6} />}
        title="Vendor coordination notes"
        badge={
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Mirrors to each vendor's day-of section
          </span>
        }
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Anything written here also surfaces on the matching workspace's
          day-of coordination notes — so your photographer, videographer,
          DJ, and décor lead see the same expectations you wrote.
        </p>
        <div className="space-y-3">
          <Field label="Photographer">
            <textarea
              value={logistics.photography_note}
              onChange={(e) =>
                update({ photography_note: e.target.value })
              }
              rows={2}
              placeholder="Pre-position for Baraat by 5:45 PM. Varmala is the key emotional shot."
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="Videographer">
            <textarea
              value={logistics.videography_note}
              onChange={(e) =>
                update({ videography_note: e.target.value })
              }
              rows={2}
              placeholder="Capture all 7 pheras unbroken. Don't cross the mandap line during havan."
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="DJ / music">
            <textarea
              value={logistics.dj_note}
              onChange={(e) => update({ dj_note: e.target.value })}
              rows={2}
              placeholder="Silence during mantras. Sangeet entrance starts at vidaai cue."
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="Décor">
            <textarea
              value={logistics.decor_note}
              onChange={(e) => update({ decor_note: e.target.value })}
              rows={2}
              placeholder="Mandap drape colour matches our palette. Aisle marigolds — fresh only."
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
            />
          </Field>
        </div>
      </PanelCard>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Eyebrow className="mb-1">{label}</Eyebrow>
      {children}
    </div>
  );
}

function Hint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("mt-1 text-[10.5px] text-ink-faint", className)}
    >
      {children}
    </p>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink hover:border-saffron/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
      />
      {icon && <span className="text-saffron">{icon}</span>}
      <span>{label}</span>
    </label>
  );
}

// ── Cross-workspace bridge ─────────────────────────────────────────────────

function useIsBookedVenueOutdoor(): boolean {
  // Cross-workspace hint: if the booked venue (or any shortlisted candidate)
  // is outdoor, return true. The pandit workspace doesn't need a hard
  // contract here — worst case is a missed prefill, which the couple writes
  // themselves.
  const shortlist = useVenueStore((s) => s.shortlist);
  const booked = shortlist.find((v) => v.status === "booked");
  if (booked && booked.indoor_outdoor === "outdoor") return true;
  return shortlist.some(
    (v) => v.status !== "passed" && v.indoor_outdoor === "outdoor",
  );
}
