"use client";

// ── Vendor Policies session ─────────────────────────────────────────────────
// Session 3 of Venue Build. Catering rules, alcohol policy, vendor access.
// Drives Catering Build's shortlist filter and every contracted-vendor
// workspace's COI requirements.

import { Beer, DoorOpen, UtensilsCrossed } from "lucide-react";
import { useVenueStore } from "@/stores/venue-store";
import type { VenueLogistics } from "@/types/venue";
import { Eyebrow, PanelCard } from "@/components/workspace/blocks/primitives";
import { FieldRow } from "./_FieldRow";

export function VendorPoliciesSession() {
  const logistics = useVenueStore((s) => s.logistics);
  const setLogistics = useVenueStore((s) => s.setLogistics);

  const setLogisticsField = <K extends keyof VenueLogistics>(
    key: K,
    value: VenueLogistics[K],
  ) => setLogistics({ [key]: value } as Partial<VenueLogistics>);

  return (
    <div className="space-y-5">
      <PanelCard
        icon={<UtensilsCrossed size={14} strokeWidth={1.6} />}
        title="Catering"
        description="The most consequential set of rules — Catering Build filters its shortlist on these."
      >
        <ToggleRow
          label="Outside caterer allowed"
          on={logistics.outside_caterer_allowed}
          onChange={(v) => setLogisticsField("outside_caterer_allowed", v)}
          helperOn="Open: shortlist any caterer"
          helperOff="Closed: in-house caterer only"
        />
        <FieldRow
          label="Catering policy"
          value={logistics.catering_policy}
          onSave={(v) => setLogisticsField("catering_policy", v)}
          placeholder="Free-form: in-house only / preferred list / fully open"
          variant="block"
        />
        <FieldRow
          label="Kitchen access"
          value={logistics.kitchen_access}
          onSave={(v) => setLogisticsField("kitchen_access", v)}
          placeholder="None / prep only / full kitchen"
        />
        <FieldRow
          label="Preferred list"
          value={logistics.preferred_caterer_list}
          onSave={(v) => setLogisticsField("preferred_caterer_list", v)}
          placeholder="Paste names — these will tag in your catering shortlist"
          variant="block"
        />
      </PanelCard>

      <PanelCard
        icon={<Beer size={14} strokeWidth={1.6} />}
        title="Alcohol"
        description="Drives the bar program — open bar vs. dry vs. corkage."
      >
        <FieldRow
          label="Alcohol policy"
          value={logistics.alcohol_policy}
          onSave={(v) => setLogisticsField("alcohol_policy", v)}
          placeholder="In-house bar / BYOB / dry"
        />
        <FieldRow
          label="Corkage fee"
          value={logistics.corkage_fee}
          onSave={(v) => setLogisticsField("corkage_fee", v)}
          placeholder="Per bottle ($) or n/a"
        />
      </PanelCard>

      <PanelCard
        icon={<DoorOpen size={14} strokeWidth={1.6} />}
        title="Vendor access"
        description="Where vendors check in, badging, escort policies, dock hours."
      >
        <FieldRow
          label="Access rules"
          value={logistics.vendor_access}
          onSave={(v) => setLogisticsField("vendor_access", v)}
          placeholder="Check-in location, badging, escort needed?"
          variant="block"
        />
        <FieldRow
          label="Loading window"
          value={logistics.vendor_loading_window}
          onSave={(v) => setLogisticsField("vendor_loading_window", v)}
          placeholder="e.g. 10:00 AM – 2:00 PM"
        />
      </PanelCard>
    </div>
  );
}

// ── ToggleRow ──────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  on,
  onChange,
  helperOn,
  helperOff,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  helperOn: string;
  helperOff: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-2">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] italic text-ink-muted">
          {on ? helperOn : helperOff}
        </span>
        <button
          type="button"
          onClick={() => onChange(!on)}
          className={
            "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors " +
            (on
              ? "bg-ink text-ivory hover:bg-ink-soft"
              : "border border-border bg-white text-ink-muted hover:border-saffron/40")
          }
        >
          {on ? "Yes" : "No"}
        </button>
      </div>
    </div>
  );
}
