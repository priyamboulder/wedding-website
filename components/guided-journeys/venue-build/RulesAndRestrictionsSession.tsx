"use client";

// ── Rules & Restrictions session ────────────────────────────────────────────
// Session 2 of Venue Build. The single highest-broadcast set of fields in
// the platform — every restriction here cascades to ≥1 downstream
// workspace via venue-policy-broadcast.ts.

import {
  AlertTriangle,
  Clock,
  CloudRain,
  Flame,
  Layers,
  Music2,
} from "lucide-react";
import { useVenueStore } from "@/stores/venue-store";
import type { VenueLogistics } from "@/types/venue";
import {
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { FieldRow } from "./_FieldRow";

const RESTRICTION_CHIPS: Array<{
  tag: string;
  label: string;
  helper: string;
}> = [
  { tag: "open_flame", label: "Open flame", helper: "Candles, havan, sparklers" },
  { tag: "drone", label: "Drone", helper: "Aerial photography / videography" },
  { tag: "sparklers", label: "Sparklers", helper: "Send-off use" },
  { tag: "confetti", label: "Confetti", helper: "Petal toss alternatives" },
  { tag: "rice", label: "Rice", helper: "Old-school send-off" },
  { tag: "candles", label: "Candles", helper: "Tabletop & ceremony" },
  { tag: "helium", label: "Helium", helper: "Balloons / décor" },
];

export function RulesAndRestrictionsSession() {
  const logistics = useVenueStore((s) => s.logistics);
  const setLogistics = useVenueStore((s) => s.setLogistics);
  const restrictions = logistics.restrictions;
  const restrictionSet = new Set(restrictions);

  const setLogisticsField = <K extends keyof VenueLogistics>(
    key: K,
    value: VenueLogistics[K],
  ) => setLogistics({ [key]: value } as Partial<VenueLogistics>);

  const toggleRestriction = (tag: string) => {
    if (restrictionSet.has(tag)) {
      setLogisticsField(
        "restrictions",
        restrictions.filter((r) => r !== tag),
      );
    } else {
      setLogisticsField("restrictions", [...restrictions, tag]);
    }
  };

  return (
    <div className="space-y-5">
      <PanelCard
        icon={<AlertTriangle size={14} strokeWidth={1.6} />}
        title="Restrictions"
        description="Tap any rule the venue won't allow. These broadcast immediately to Décor, Music, Photo, and Video."
      >
        <div className="flex flex-wrap gap-2">
          {RESTRICTION_CHIPS.map((chip) => {
            const isOn = restrictionSet.has(chip.tag);
            return (
              <button
                key={chip.tag}
                type="button"
                onClick={() => toggleRestriction(chip.tag)}
                title={chip.helper}
                className={
                  "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors " +
                  (isOn
                    ? "border-saffron/60 bg-saffron/15 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40")
                }
              >
                {isOn ? "✓ " : ""}
                {chip.label}
              </button>
            );
          })}
        </div>
      </PanelCard>

      <PanelCard
        icon={<Music2 size={14} strokeWidth={1.6} />}
        title="Music curfews"
        description="Times your performers must wind down by. Music workspace flags any slot past these."
      >
        <FieldRow
          label="Indoor curfew"
          value={logistics.music_curfew_indoor}
          onSave={(v) => setLogisticsField("music_curfew_indoor", v)}
          placeholder="e.g. 11:00 PM"
        />
        <FieldRow
          label="Outdoor curfew"
          value={logistics.music_curfew_outdoor}
          onSave={(v) => setLogisticsField("music_curfew_outdoor", v)}
          placeholder="e.g. 10:00 PM"
        />
      </PanelCard>

      <PanelCard
        icon={<Clock size={14} strokeWidth={1.6} />}
        title="Event end time"
        description="Hard stop. Every workspace reads this — late-night service, shuttle return, last DJ track."
      >
        <FieldRow
          label="End time"
          value={logistics.event_end_time}
          onSave={(v) => setLogisticsField("event_end_time", v)}
          placeholder="e.g. 12:00 AM"
        />
      </PanelCard>

      <PanelCard
        icon={<Flame size={14} strokeWidth={1.6} />}
        title="Fire ceremony"
        description="If the ceremony involves agni / havan, capture the venue's policy and who pulls the permit."
      >
        <FieldRow
          label="Fire policy"
          value={logistics.fire_ceremony_policy}
          onSave={(v) => setLogisticsField("fire_ceremony_policy", v)}
          placeholder="Allowed indoors? Outdoors only? Permit conditions?"
          variant="block"
        />
        <FieldRow
          label="Permit owner"
          value={logistics.fire_permit_owner}
          onSave={(v) => setLogisticsField("fire_permit_owner", v)}
          placeholder="Couple / pandit / venue / planner"
        />
      </PanelCard>

      <PanelCard
        icon={<Layers size={14} strokeWidth={1.6} />}
        title="Wall attachments"
        description="What can be hung where. Décor reads this when planning installations."
      >
        <FieldRow
          label="Rules"
          value={logistics.wall_attachment_rules}
          onSave={(v) => setLogisticsField("wall_attachment_rules", v)}
          placeholder="No nails / removable hooks only / pre-approved hardware"
          variant="block"
        />
      </PanelCard>

      <PanelCard
        icon={<CloudRain size={14} strokeWidth={1.6} />}
        title="Weather backup"
        description="If anything is outdoors, capture the wet-weather plan."
      >
        <FieldRow
          label="Backup plan"
          value={logistics.wet_weather_backup}
          onSave={(v) => setLogisticsField("wet_weather_backup", v)}
          placeholder="Tent rental / indoor pivot / decision deadline"
          variant="block"
        />
      </PanelCard>
    </div>
  );
}
