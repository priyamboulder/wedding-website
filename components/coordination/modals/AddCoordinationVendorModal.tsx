"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  COORDINATION_ROLE_LABEL,
  type CoordinationRole,
  type CoordinationVendor,
} from "@/types/coordination";
import { useCoordinationStore } from "@/stores/coordination-store";
import { useEventsStore } from "@/stores/events-store";
import { cn } from "@/lib/utils";

const ROLE_ORDER: CoordinationRole[] = [
  "photographer",
  "videographer",
  "planner",
  "caterer",
  "decorator",
  "florist",
  "makeup",
  "hair",
  "mehendi",
  "dj",
  "band",
  "cake",
  "officiant",
  "pandit",
  "transport",
  "rentals",
  "lighting",
  "photo_booth",
  "choreographer",
  "dhol",
  "custom",
];

export function AddCoordinationVendorModal({
  open,
  onClose,
  editVendor,
}: {
  open: boolean;
  onClose: () => void;
  editVendor?: CoordinationVendor | null;
}) {
  const addVendor = useCoordinationStore((s) => s.addVendor);
  const updateVendor = useCoordinationStore((s) => s.updateVendor);
  const events = useEventsStore((s) => s.events);
  const eventOptions = events.map((e) => e.customName || e.type);

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [role, setRole] = useState<CoordinationRole>("photographer");
  const [roleLabel, setRoleLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editVendor) {
      setName(editVendor.name);
      setContactName(editVendor.contactName ?? "");
      setRole(editVendor.role);
      setRoleLabel(editVendor.roleLabel ?? "");
      setPhone(editVendor.phone ?? "");
      setEmail(editVendor.email ?? "");
      setWhatsapp(editVendor.whatsapp ?? "");
      setSelectedEvents(editVendor.events);
      setInternalNotes(editVendor.internalNotes ?? "");
    } else {
      setName("");
      setContactName("");
      setRole("photographer");
      setRoleLabel("");
      setPhone("");
      setEmail("");
      setWhatsapp("");
      setSelectedEvents([]);
      setInternalNotes("");
    }
  }, [open, editVendor]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (editVendor) {
      updateVendor(editVendor.id, {
        name: name.trim(),
        contactName: contactName.trim() || null,
        role,
        roleLabel: roleLabel.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        whatsapp: whatsapp.trim() || null,
        events: selectedEvents,
        internalNotes: internalNotes.trim() || null,
      });
    } else {
      addVendor({
        name,
        contactName,
        role,
        roleLabel,
        phone,
        email,
        whatsapp,
        events: selectedEvents,
        internalNotes,
      });
    }
    onClose();
  };

  const toggleEvent = (name: string) => {
    setSelectedEvents((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gold/15 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-white px-6 py-4">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              Vendor Coordination
            </p>
            <h2 className="mt-0.5 font-serif text-[22px] text-ink">
              {editVendor ? "edit vendor." : "add a vendor."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <Field label="Business name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Raj Photography Studio"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Contact person">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Raj Mehta"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CoordinationRole)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              >
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {COORDINATION_ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Role label (optional)">
              <input
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                placeholder="Lead Photographer"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-98765-43210"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              />
            </Field>
            <Field label="WhatsApp (if different)">
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="same as phone"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="raj@rajphoto.com"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Which events?">
            {eventOptions.length === 0 ? (
              <p className="text-[11.5px] italic text-ink-faint">
                No events defined yet — add events first in the Events
                workspace.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {eventOptions.map((ev) => {
                  const picked = selectedEvents.includes(ev);
                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => toggleEvent(ev)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                        picked
                          ? "border-gold bg-gold-pale/40 text-gold"
                          : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
                      )}
                    >
                      {ev}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <Field label="Internal notes (only you can see)">
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Best reached on WhatsApp before noon"
              className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gold/10 bg-white px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {editVendor ? "Save changes" : "Add vendor & generate portal →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label} {required ? <span className="text-rose">*</span> : null}
      </span>
      {children}
    </label>
  );
}
