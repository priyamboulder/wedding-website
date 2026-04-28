"use client";

// ── Guest List & RSVP tab ──────────────────────────────────────────────────
// Table of the crew with inline role / RSVP / room edits. Roster strip above
// surfaces the Going/Pending/Can't-make-it breakdown and an RSVP send action.
// Below the table: room assignments with live capacity counts.

import { Link2, Plus, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { RSVP_OPTIONS } from "@/lib/bachelor-seed";
import { useBachelorStore } from "@/stores/bachelor-store";
import type { Guest, RsvpStatus } from "@/types/bachelor";
import { cn } from "@/lib/utils";
import {
  Label,
  Section,
  StatusPill,
  TextInput,
} from "../ui";

export function GuestListTab() {
  return (
    <div className="space-y-5">
      <RosterStrip />
      <GuestTable />
      <RoomAssignments />
    </div>
  );
}

function rsvpToTone(rsvp: RsvpStatus): "sage" | "gold" | "rose" {
  return rsvp === "going" ? "sage" : rsvp === "pending" ? "gold" : "rose";
}

function rsvpLabel(rsvp: RsvpStatus): string {
  return RSVP_OPTIONS.find((r) => r.value === rsvp)?.label ?? rsvp;
}

function RosterStrip() {
  const guests = useBachelorStore((s) => s.guests);
  const counts = useMemo(() => {
    const going = guests.filter((g) => g.rsvp === "going").length;
    const pending = guests.filter((g) => g.rsvp === "pending").length;
    const no = guests.filter((g) => g.rsvp === "cant_make_it").length;
    return { going, pending, no };
  }, [guests]);

  return (
    <Section
      eyebrow="THE CREW"
      title={`${counts.going} going · ${counts.pending} pending · ${counts.no} can't make it`}
      description="Track RSVPs, roles, and room share. Drop the RSVP link in the group chat — this table updates automatically."
      right={
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Link2 size={13} strokeWidth={1.8} /> Copy RSVP link
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Send size={13} strokeWidth={1.8} /> Send RSVP link
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <CountCard label="Going" value={counts.going} tone="sage" />
        <CountCard label="Pending" value={counts.pending} tone="gold" />
        <CountCard label="Can't make it" value={counts.no} tone="rose" />
      </div>
    </Section>
  );
}

function CountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sage" | "gold" | "rose";
}) {
  const color =
    tone === "sage"
      ? "text-sage"
      : tone === "gold"
        ? "text-gold"
        : "text-rose";
  return (
    <div className="rounded-md border border-border bg-white px-4 py-3">
      <Label>{label}</Label>
      <p className={cn("mt-1 font-serif text-[22px] leading-none", color)}>
        {value}
      </p>
    </div>
  );
}

function GuestTable() {
  const guests = useBachelorStore((s) => s.guests);
  const rooms = useBachelorStore((s) => s.rooms);
  const addGuest = useBachelorStore((s) => s.addGuest);
  const updateGuest = useBachelorStore((s) => s.updateGuest);
  const removeGuest = useBachelorStore((s) => s.removeGuest);
  const setGuestRsvp = useBachelorStore((s) => s.setGuestRsvp);
  const assignGuestToRoom = useBachelorStore((s) => s.assignGuestToRoom);

  return (
    <Section title="Who's in">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left">
          <thead className="bg-ivory-warm/60 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>RSVP</Th>
              <Th>Room</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white text-[13px] text-ink">
            {guests.map((g) => (
              <GuestRow
                key={g.id}
                guest={g}
                rooms={rooms}
                onUpdate={(patch) => updateGuest(g.id, patch)}
                onRsvp={(v) => setGuestRsvp(g.id, v)}
                onAssignRoom={(id) => assignGuestToRoom(g.id, id)}
                onRemove={() => removeGuest(g.id)}
              />
            ))}
            {guests.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[12.5px] italic text-ink-faint"
                >
                  No guys yet — add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddGuestRow onAdd={addGuest} />
    </Section>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn("px-4 py-2 font-mono text-[10px] font-medium", className)}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function GuestRow({
  guest,
  rooms,
  onUpdate,
  onRsvp,
  onAssignRoom,
  onRemove,
}: {
  guest: Guest;
  rooms: { id: string; label: string }[];
  onUpdate: (patch: Partial<Guest>) => void;
  onRsvp: (v: RsvpStatus) => void;
  onAssignRoom: (id: string | null) => void;
  onRemove: () => void;
}) {
  return (
    <tr>
      <td className="px-4 py-2">
        <TextInput
          value={guest.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="Name"
        />
      </td>
      <td className="px-4 py-2">
        <TextInput
          value={guest.role}
          onChange={(v) => onUpdate({ role: v })}
          placeholder="Groomsman, Friend…"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <select
            value={guest.rsvp}
            onChange={(e) => onRsvp(e.target.value as RsvpStatus)}
            className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
          >
            {RSVP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <StatusPill tone={rsvpToTone(guest.rsvp)} label={rsvpLabel(guest.rsvp)} />
        </div>
      </td>
      <td className="px-4 py-2">
        <select
          value={guest.roomId ?? ""}
          onChange={(e) =>
            onAssignRoom(e.target.value === "" ? null : e.target.value)
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          <option value="">—</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <button
          type="button"
          aria-label={`Remove ${guest.name}`}
          onClick={onRemove}
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </td>
    </tr>
  );
}

function AddGuestRow({
  onAdd,
}: {
  onAdd: (name: string, role: string) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  function commit() {
    if (!name.trim()) return;
    onAdd(name.trim(), role.trim() || "Friend");
    setName("");
    setRole("");
  }
  return (
    <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
      <TextInput value={name} onChange={setName} placeholder="Name" />
      <TextInput
        value={role}
        onChange={setRole}
        placeholder="Role (e.g. Groomsman)"
      />
      <button
        type="button"
        onClick={commit}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={2} /> Add
      </button>
    </div>
  );
}

function RoomAssignments() {
  const rooms = useBachelorStore((s) => s.rooms);
  const guests = useBachelorStore((s) => s.guests);
  const addRoom = useBachelorStore((s) => s.addRoom);
  const updateRoom = useBachelorStore((s) => s.updateRoom);
  const removeRoom = useBachelorStore((s) => s.removeRoom);

  const byRoom = useMemo(() => {
    const m: Record<string, Guest[]> = {};
    for (const r of rooms) m[r.id] = [];
    for (const g of guests) {
      if (g.roomId && m[g.roomId]) m[g.roomId].push(g);
    }
    return m;
  }, [rooms, guests]);

  return (
    <Section
      eyebrow="ROOM ASSIGNMENTS"
      title="Who's sharing where"
      right={
        <button
          type="button"
          onClick={() => addRoom()}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={2} /> Add room
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {rooms.map((r) => {
          const occupants = byRoom[r.id] ?? [];
          const open = Math.max(0, r.capacity - occupants.length);
          return (
            <div
              key={r.id}
              className="rounded-md border border-border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <TextInput
                  value={r.label}
                  onChange={(v) => updateRoom(r.id, { label: v })}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={r.capacity}
                    onChange={(e) =>
                      updateRoom(r.id, {
                        capacity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-14 rounded-md border border-border bg-white px-2 py-1 text-center text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
                    aria-label={`${r.label} capacity`}
                  />
                  <button
                    type="button"
                    aria-label="Remove room"
                    onClick={() => removeRoom(r.id)}
                    className="text-ink-faint hover:text-rose"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-[13px] text-ink">
                {occupants.map((g) => (
                  <li key={g.id}>· {g.name}</li>
                ))}
                {Array.from({ length: open }).map((_, i) => (
                  <li
                    key={`open-${i}`}
                    className="text-[12.5px] italic text-ink-faint"
                  >
                    · open spot
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
