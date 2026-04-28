"use client";

// ── Tab 2 — Guest List ────────────────────────────────────────────────────
// Invite scope radios + a guest table. Supports add/remove/rsvp and a hotel
// column since welcome events often cluster around the hotel block. "Import
// from wedding guest list" is shown as a hint — actual import lives in the
// main guests module and isn't wired here yet.

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useWelcomeEventsStore } from "@/stores/welcome-events-store";
import {
  GUEST_GROUP_OPTIONS,
  INVITE_SCOPE_OPTIONS,
} from "@/lib/welcome-events-seed";
import {
  Field,
  IconButton,
  RadioRow,
  SectionIntro,
  SectionLabel,
  SectionTitle,
  Select,
  TextInput,
} from "../shared";
import type { InviteScope, RsvpStatus } from "@/types/welcome-events";

const RSVP_LABELS: Record<RsvpStatus, string> = {
  yes: "Yes",
  no: "No",
  pending: "Pending",
};

export function GuestListTab() {
  const inviteScope = useWelcomeEventsStore((s) => s.inviteScope);
  const setInviteScope = useWelcomeEventsStore((s) => s.setInviteScope);
  const guests = useWelcomeEventsStore((s) => s.guests);
  const addGuest = useWelcomeEventsStore((s) => s.addGuest);
  const updateGuest = useWelcomeEventsStore((s) => s.updateGuest);
  const removeGuest = useWelcomeEventsStore((s) => s.removeGuest);

  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState(GUEST_GROUP_OPTIONS[0]);

  const totalGuests = useWelcomeEventsStore((s) => s.basics.guestCount);
  const yesCount = guests.filter((g) => g.rsvp === "yes").length;
  const pendingCount = guests.filter((g) => g.rsvp === "pending").length;

  function handleAdd() {
    if (!newName.trim()) return;
    addGuest(newName.trim(), newGroup);
    setNewName("");
  }

  return (
    <div className="flex flex-col gap-12 py-10">
      <section>
        <SectionLabel>Guest list</SectionLabel>
        <SectionTitle>Who's invited</SectionTitle>
        <SectionIntro>
          Welcome events are usually smaller than the wedding. Filter down to
          the people who actually need to be there.
        </SectionIntro>

        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4">
          <RadioRow<InviteScope>
            value={inviteScope}
            options={INVITE_SCOPE_OPTIONS}
            onChange={setInviteScope}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-[13px] text-ink-muted">
          <span>
            <span className="font-mono text-ink" style={{ fontFamily: "var(--font-mono)" }}>
              {guests.length}
            </span>{" "}
            on welcome list
          </span>
          <span>
            <span className="font-mono text-sage" style={{ fontFamily: "var(--font-mono)" }}>
              {yesCount}
            </span>{" "}
            confirmed
          </span>
          <span>
            <span className="font-mono text-gold" style={{ fontFamily: "var(--font-mono)" }}>
              {pendingCount}
            </span>{" "}
            pending
          </span>
          {totalGuests > 0 ? (
            <span className="text-ink-faint">
              of {totalGuests} on the full wedding list
            </span>
          ) : null}
        </div>
      </section>

      <section>
        <div className="overflow-hidden rounded-lg border border-ink/10">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-warm/60 text-left">
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Name
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Group
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  RSVP
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Hotel
                </th>
                <th className="w-8 px-2" />
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-ink/5 last:border-b-0"
                >
                  <td className="px-3 py-2">
                    <input
                      value={g.name}
                      onChange={(e) =>
                        updateGuest(g.id, { name: e.target.value })
                      }
                      className="w-full bg-transparent text-ink focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={g.group}
                      onChange={(e) =>
                        updateGuest(g.id, { group: e.target.value })
                      }
                      className="w-full bg-transparent text-ink-soft focus:outline-none"
                    >
                      {GUEST_GROUP_OPTIONS.map((gr) => (
                        <option key={gr} value={gr}>
                          {gr}
                        </option>
                      ))}
                      {GUEST_GROUP_OPTIONS.includes(g.group) ? null : (
                        <option value={g.group}>{g.group}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={g.rsvp}
                      onChange={(e) =>
                        updateGuest(g.id, {
                          rsvp: e.target.value as RsvpStatus,
                        })
                      }
                      className={rsvpClass(g.rsvp)}
                    >
                      {(Object.keys(RSVP_LABELS) as RsvpStatus[]).map((r) => (
                        <option key={r} value={r}>
                          {RSVP_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={g.hotel}
                      onChange={(e) =>
                        updateGuest(g.id, { hotel: e.target.value })
                      }
                      placeholder="—"
                      className="w-full bg-transparent text-ink-soft placeholder:text-ink-faint focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <IconButton
                      onClick={() => removeGuest(g.id)}
                      ariaLabel={`Remove ${g.name}`}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {guests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-[13px] italic text-ink-muted"
                  >
                    No one on the welcome list yet. Add someone below.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Name" className="min-w-[220px] flex-1">
            <TextInput
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nani + Nana"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
          </Field>
          <Field label="Group" className="min-w-[180px]">
            <Select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
            >
              {GUEST_GROUP_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[13px] text-ivory transition-colors hover:bg-ink-soft"
          >
            <Plus size={14} strokeWidth={1.8} />
            Add guest
          </button>
        </div>

        <p className="mt-6 text-[12.5px] italic text-ink-muted">
          Import from wedding guest list — filter by the "out-of-town" tag in
          the Guests module, then add here.
        </p>
      </section>
    </div>
  );
}

function rsvpClass(rsvp: RsvpStatus): string {
  const base = "w-full bg-transparent focus:outline-none";
  if (rsvp === "yes") return `${base} text-sage`;
  if (rsvp === "no") return `${base} text-rose`;
  return `${base} text-gold`;
}
