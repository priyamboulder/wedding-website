"use client";

// ── Spaces & Layout session ─────────────────────────────────────────────────
// Session 1 of Venue Build. Walk through every space at the venue and pair
// each with the event(s) it hosts. Reads/writes through useVenueStore.

import { useState } from "react";
import { CalendarRange, MapPin, Repeat } from "lucide-react";
import { useVenueStore } from "@/stores/venue-store";
import type { VenueSpace } from "@/types/venue";
import { Eyebrow, PanelCard } from "@/components/workspace/blocks/primitives";
import { FieldRow } from "./_FieldRow";

const EVENT_OPTIONS = [
  { id: "ceremony", label: "Ceremony" },
  { id: "cocktails", label: "Cocktails" },
  { id: "dinner", label: "Reception / Dinner" },
  { id: "sangeet", label: "Sangeet" },
  { id: "mehendi", label: "Mehendi" },
  { id: "haldi", label: "Haldi" },
  { id: "after_party", label: "After-party" },
] as const;

export function SpacesAndLayoutSession() {
  const spaces = useVenueStore((s) => s.spaces);
  const pairings = useVenueStore((s) => s.pairings);
  const transitions = useVenueStore((s) => s.transitions);
  const addSpace = useVenueStore((s) => s.addSpace);
  const updateSpace = useVenueStore((s) => s.updateSpace);
  const removeSpace = useVenueStore((s) => s.removeSpace);
  const addPairing = useVenueStore((s) => s.addPairing);
  const removePairing = useVenueStore((s) => s.removePairing);
  const addTransition = useVenueStore((s) => s.addTransition);
  const updateTransition = useVenueStore((s) => s.updateTransition);
  const removeTransition = useVenueStore((s) => s.removeTransition);

  const [newSpaceName, setNewSpaceName] = useState("");

  return (
    <div className="space-y-5">
      <PanelCard
        icon={<MapPin size={14} strokeWidth={1.6} />}
        title="Spaces"
        description="One row per named space at the venue."
      >
        <div className="space-y-2">
          {spaces.map((space) => (
            <SpaceRow
              key={space.id}
              space={space}
              onUpdate={(patch) => updateSpace(space.id, patch)}
              onRemove={() => removeSpace(space.id)}
            />
          ))}
          {spaces.length === 0 && (
            <p className="text-[12.5px] italic text-ink-muted">
              No spaces yet — add the first one below.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            placeholder="Add a space (e.g. Ballroom, Garden Lawn)"
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const name = newSpaceName.trim();
              if (!name) return;
              addSpace({ name });
              setNewSpaceName("");
            }}
            className="rounded-md bg-ink px-3 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            Add space
          </button>
        </div>
      </PanelCard>

      <PanelCard
        icon={<CalendarRange size={14} strokeWidth={1.6} />}
        title="Event pairings"
        description="Pair each space with the event(s) it hosts. Some spaces flip between events — note transitions below."
      >
        {spaces.length === 0 ? (
          <p className="text-[12.5px] italic text-ink-muted">
            Add a space first to pair events to it.
          </p>
        ) : (
          <div className="space-y-3">
            {spaces.map((space) => {
              const pairedHere = pairings.filter((p) => p.space_id === space.id);
              const pairedIds = new Set(pairedHere.map((p) => p.event_id));
              return (
                <div
                  key={space.id}
                  className="rounded-md border border-border bg-white p-3"
                >
                  <Eyebrow className="mb-2 block">{space.name}</Eyebrow>
                  <div className="flex flex-wrap gap-1.5">
                    {EVENT_OPTIONS.map((evt) => {
                      const isOn = pairedIds.has(evt.id);
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={() => {
                            if (isOn) {
                              const found = pairedHere.find(
                                (p) => p.event_id === evt.id,
                              );
                              if (found) removePairing(found.id);
                            } else {
                              addPairing(evt.id, space.id);
                            }
                          }}
                          className={
                            "rounded-full border px-3 py-1 text-[11.5px] transition-colors " +
                            (isOn
                              ? "border-saffron/60 bg-saffron/15 text-ink"
                              : "border-border bg-white text-ink-muted hover:border-saffron/40")
                          }
                        >
                          {evt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>

      <PanelCard
        icon={<Repeat size={14} strokeWidth={1.6} />}
        title="Transitions / flips"
        description="When a space hosts multiple events, the changeover details go here."
      >
        <div className="space-y-2">
          {transitions.map((t) => {
            const space = spaces.find((s) => s.id === t.space_id);
            return (
              <div
                key={t.id}
                className="rounded-md border border-border bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Eyebrow>{space?.name ?? "—"}</Eyebrow>
                  <button
                    type="button"
                    onClick={() => removeTransition(t.id)}
                    className="text-[11.5px] text-ink-faint hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
                <FieldRow
                  label="Flip time"
                  value={t.flip_time}
                  onSave={(v) => updateTransition(t.id, { flip_time: v })}
                  placeholder="e.g. 5:30 PM"
                />
                <FieldRow
                  label="Changes"
                  value={t.changes}
                  onSave={(v) => updateTransition(t.id, { changes: v })}
                  placeholder="What flips?"
                />
                <FieldRow
                  label="Responsible"
                  value={t.responsible}
                  onSave={(v) => updateTransition(t.id, { responsible: v })}
                  placeholder="Vendor / role"
                />
              </div>
            );
          })}
        </div>
        {spaces.length > 0 && (
          <select
            className="mt-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink-muted"
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              addTransition(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">+ Add a transition for…</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </PanelCard>
    </div>
  );
}

// ── SpaceRow ──────────────────────────────────────────────────────────────

function SpaceRow({
  space,
  onUpdate,
  onRemove,
}: {
  space: VenueSpace;
  onUpdate: (patch: Partial<VenueSpace>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <input
          type="text"
          value={space.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 bg-transparent font-serif text-[15px] text-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={onRemove}
          className="ml-3 text-[11.5px] text-ink-faint hover:text-ink"
        >
          Remove
        </button>
      </div>
      <FieldRow
        label="Use"
        value={space.use}
        onSave={(v) => onUpdate({ use: v })}
        placeholder="Ceremony / reception / etc."
      />
      <FieldRow
        label="Capacity"
        value={space.capacity}
        onSave={(v) => onUpdate({ capacity: v })}
        placeholder="e.g. 250 seated"
      />
      <FieldRow
        label="Notes"
        value={space.notes}
        onSave={(v) => onUpdate({ notes: v })}
        placeholder="Quirks, restrictions, vibe"
      />
    </div>
  );
}
