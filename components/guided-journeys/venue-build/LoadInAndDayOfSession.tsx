"use client";

// ── Load-in & Day-of session ────────────────────────────────────────────────
// Session 4 of Venue Build. Logistics, parking, baraat rules, COI
// requirements, day-of contacts. Day-of contacts persist in the journey
// state (not yet first-class on venue-store).

import {
  Bed,
  Car,
  ClipboardList,
  Phone,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { useVenueStore } from "@/stores/venue-store";
import type { VenueLogistics } from "@/types/venue";
import { Eyebrow, PanelCard } from "@/components/workspace/blocks/primitives";
import { FieldRow } from "./_FieldRow";
import { useVenueBuildJourney } from "./VenueBuildShell";

export function LoadInAndDayOfSession() {
  const logistics = useVenueStore((s) => s.logistics);
  const setLogistics = useVenueStore((s) => s.setLogistics);

  const dayOfContacts = useVenueBuildJourney((s) => s.dayOfContacts);
  const addDayOfContact = useVenueBuildJourney((s) => s.addDayOfContact);
  const updateDayOfContact = useVenueBuildJourney((s) => s.updateDayOfContact);
  const removeDayOfContact = useVenueBuildJourney((s) => s.removeDayOfContact);

  const setLogisticsField = <K extends keyof VenueLogistics>(
    key: K,
    value: VenueLogistics[K],
  ) => setLogistics({ [key]: value } as Partial<VenueLogistics>);

  return (
    <div className="space-y-5">
      <PanelCard
        icon={<Truck size={14} strokeWidth={1.6} />}
        title="Load-in & power"
        description="Drives load-in derivation for Décor and Music — both workspaces will read these."
      >
        <FieldRow
          label="Load-in window"
          value={logistics.load_in_window}
          onSave={(v) => setLogisticsField("load_in_window", v)}
          placeholder="e.g. Day before, 8:00 AM"
        />
        <FieldRow
          label="Power circuits"
          value={logistics.power_circuits}
          onSave={(v) => setLogisticsField("power_circuits", v)}
          placeholder="How many dedicated circuits"
        />
        <FieldRow
          label="Power notes"
          value={logistics.power_notes}
          onSave={(v) => setLogisticsField("power_notes", v)}
          placeholder="Generators required? Stage-side circuit?"
          variant="block"
        />
      </PanelCard>

      <PanelCard
        icon={<Car size={14} strokeWidth={1.6} />}
        title="Parking & transport"
      >
        <FieldRow
          label="Parking capacity"
          value={logistics.parking_capacity}
          onSave={(v) => setLogisticsField("parking_capacity", v)}
          placeholder="Number of cars"
        />
        <FieldRow
          label="Valet"
          value={logistics.valet}
          onSave={(v) => setLogisticsField("valet", v)}
          placeholder="Available? Cost?"
        />
        <FieldRow
          label="Shuttle drop-off"
          value={logistics.shuttle_drop_off}
          onSave={(v) => setLogisticsField("shuttle_drop_off", v)}
          placeholder="Designated zone"
        />
        <FieldRow
          label="Baraat rules"
          value={logistics.baraat_rules}
          onSave={(v) => setLogisticsField("baraat_rules", v)}
          placeholder="Route restrictions, dhol decibel limits, processional zones"
          variant="block"
        />
      </PanelCard>

      <PanelCard
        icon={<Bed size={14} strokeWidth={1.6} />}
        title="Accommodation"
        description="Pulled from the contract verbatim."
      >
        <FieldRow
          label="Room block"
          value={logistics.room_block_details}
          onSave={(v) => setLogisticsField("room_block_details", v)}
          placeholder="Number of rooms, rate, cutoff date"
          variant="block"
        />
        <FieldRow
          label="Min. nights"
          value={logistics.minimum_night_stay}
          onSave={(v) => setLogisticsField("minimum_night_stay", v)}
          placeholder="e.g. 2 nights"
        />
      </PanelCard>

      <PanelCard
        icon={<ShieldCheck size={14} strokeWidth={1.6} />}
        title="Insurance & COI"
        description="Surfaces in the COI deadline tracker — every contracted vendor reads this."
      >
        <FieldRow
          label="Event insurance"
          value={logistics.event_insurance_required}
          onSave={(v) => setLogisticsField("event_insurance_required", v)}
          placeholder="$2M general liability, etc."
          variant="block"
        />
        <FieldRow
          label="Liquor liability"
          value={logistics.liquor_liability}
          onSave={(v) => setLogisticsField("liquor_liability", v)}
          placeholder="Required when bar service is in scope"
          variant="block"
        />
      </PanelCard>

      <PanelCard
        icon={<Phone size={14} strokeWidth={1.6} />}
        title="Day-of contacts"
        description="Names + numbers your vendors call when something goes sideways. Captured here, exported to every vendor packet."
      >
        <div className="space-y-2">
          {dayOfContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-md border border-border bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) =>
                    updateDayOfContact(contact.id, { role: e.target.value })
                  }
                  placeholder="Role (planner / venue coordinator / family lead)"
                  className="flex-1 bg-transparent font-serif text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeDayOfContact(contact.id)}
                  className="ml-3 text-[11.5px] text-ink-faint hover:text-ink"
                >
                  Remove
                </button>
              </div>
              <FieldRow
                label="Name"
                value={contact.name}
                onSave={(v) => updateDayOfContact(contact.id, { name: v })}
              />
              <FieldRow
                label="Phone"
                value={contact.phone}
                onSave={(v) => updateDayOfContact(contact.id, { phone: v })}
                placeholder="+1 …"
              />
              <FieldRow
                label="Email"
                value={contact.email ?? ""}
                onSave={(v) => updateDayOfContact(contact.id, { email: v })}
                placeholder="Optional"
              />
              <FieldRow
                label="Notes"
                value={contact.notes ?? ""}
                onSave={(v) => updateDayOfContact(contact.id, { notes: v })}
                placeholder="Anything vendors should know"
              />
            </div>
          ))}
          {dayOfContacts.length === 0 && (
            <p className="text-[12.5px] italic text-ink-muted">
              No day-of contacts yet — every wedding wants 2–4 of these.
            </p>
          )}
        </div>
        <div className="mt-3">
          <Eyebrow className="hidden">Add</Eyebrow>
          <button
            type="button"
            onClick={addDayOfContact}
            className="rounded-md bg-ink px-3 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            + Add a day-of contact
          </button>
        </div>
      </PanelCard>
    </div>
  );
}
