"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { useCoordinationStore } from "@/stores/coordination-store";
import { useEventsStore } from "@/stores/events-store";
import type {
  CoordinationAssignment,
  CoordinationVendor,
} from "@/types/coordination";

export function AssignmentEditorModal({
  open,
  onClose,
  vendor,
  assignment,
}: {
  open: boolean;
  onClose: () => void;
  vendor: CoordinationVendor | null;
  assignment: CoordinationAssignment | null;
}) {
  const addAssignment = useCoordinationStore((s) => s.addAssignment);
  const updateAssignment = useCoordinationStore((s) => s.updateAssignment);
  const removeAssignment = useCoordinationStore((s) => s.removeAssignment);
  const events = useEventsStore((s) => s.events);

  const eventOptions = useMemo(() => {
    return events.map((e) => ({
      name: e.customName || e.type,
      date: e.eventDate ?? null,
    }));
  }, [events]);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [setupStart, setSetupStart] = useState("");
  const [setupEnd, setSetupEnd] = useState("");
  const [serviceStart, setServiceStart] = useState("");
  const [serviceEnd, setServiceEnd] = useState("");
  const [breakdownStart, setBreakdownStart] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [parkingInstructions, setParkingInstructions] = useState("");
  const [loadInInstructions, setLoadInInstructions] = useState("");
  const [description, setDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [guestCount, setGuestCount] = useState("");

  useEffect(() => {
    if (!open) return;
    if (assignment) {
      setEventName(assignment.eventName);
      setEventDate(assignment.eventDate);
      setCallTime(assignment.callTime ?? "");
      setSetupStart(assignment.setupStart ?? "");
      setSetupEnd(assignment.setupEnd ?? "");
      setServiceStart(assignment.serviceStart ?? "");
      setServiceEnd(assignment.serviceEnd ?? "");
      setBreakdownStart(assignment.breakdownStart ?? "");
      setVenueName(assignment.venueName ?? "");
      setVenueAddress(assignment.venueAddress ?? "");
      setSpecificLocation(assignment.specificLocation ?? "");
      setParkingInstructions(assignment.parkingInstructions ?? "");
      setLoadInInstructions(assignment.loadInInstructions ?? "");
      setDescription(assignment.description ?? "");
      setSpecialInstructions(assignment.specialInstructions ?? "");
      setGuestCount(
        assignment.guestCount != null ? String(assignment.guestCount) : "",
      );
    } else {
      const first = eventOptions[0];
      setEventName(first?.name ?? "");
      setEventDate(first?.date ?? new Date().toISOString().slice(0, 10));
      setCallTime("");
      setSetupStart("");
      setSetupEnd("");
      setServiceStart("");
      setServiceEnd("");
      setBreakdownStart("");
      setVenueName("");
      setVenueAddress("");
      setSpecificLocation("");
      setParkingInstructions("");
      setLoadInInstructions("");
      setDescription("");
      setSpecialInstructions("");
      setGuestCount("");
    }
  }, [open, assignment, eventOptions]);

  if (!open || !vendor) return null;

  const canSubmit = eventName.trim().length > 0 && eventDate.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      vendorId: vendor.id,
      eventName: eventName.trim(),
      eventDate,
      callTime: callTime || null,
      setupStart: setupStart || null,
      setupEnd: setupEnd || null,
      serviceStart: serviceStart || null,
      serviceEnd: serviceEnd || null,
      breakdownStart: breakdownStart || null,
      venueName: venueName.trim() || null,
      venueAddress: venueAddress.trim() || null,
      specificLocation: specificLocation.trim() || null,
      parkingInstructions: parkingInstructions.trim() || null,
      loadInInstructions: loadInInstructions.trim() || null,
      description: description.trim() || null,
      specialInstructions: specialInstructions.trim() || null,
      guestCount: guestCount ? Number(guestCount) : null,
    };
    if (assignment) {
      updateAssignment(assignment.id, payload);
    } else {
      addAssignment(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!assignment) return;
    const ok = window.confirm("Remove this assignment?");
    if (!ok) return;
    removeAssignment(assignment.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gold/15 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-white px-6 py-4">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              {vendor.roleLabel ?? vendor.name}
            </p>
            <h2 className="mt-0.5 font-serif text-[22px] text-ink">
              {assignment ? "edit assignment." : "new assignment."}
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

        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <Field label="Event" required>
            {eventOptions.length > 0 ? (
              <select
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                  const match = eventOptions.find(
                    (o) => o.name === e.target.value,
                  );
                  if (match?.date) setEventDate(match.date);
                }}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              >
                {eventOptions.map((o) => (
                  <option key={o.name} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Sangeet & Garba Night"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              />
            )}
          </Field>

          <Field label="Date" required>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Call time">
            <input
              type="time"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Guest count">
            <input
              type="number"
              inputMode="numeric"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="80"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Setup start">
            <input
              type="time"
              value={setupStart}
              onChange={(e) => setSetupStart(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Setup end">
            <input
              type="time"
              value={setupEnd}
              onChange={(e) => setSetupEnd(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Service start">
            <input
              type="time"
              value={serviceStart}
              onChange={(e) => setServiceStart(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Service end">
            <input
              type="time"
              value={serviceEnd}
              onChange={(e) => setServiceEnd(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Breakdown start">
            <input
              type="time"
              value={breakdownStart}
              onChange={(e) => setBreakdownStart(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Venue name" className="md:col-span-2">
            <input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Udaipur Palace — Grand Ballroom"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Venue address" className="md:col-span-2">
            <input
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Palace Rd, Udaipur"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Specific location / entrance" className="md:col-span-2">
            <input
              value={specificLocation}
              onChange={(e) => setSpecificLocation(e.target.value)}
              placeholder="Garden Terrace, enter via Gate B"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Parking instructions" className="md:col-span-2">
            <input
              value={parkingInstructions}
              onChange={(e) => setParkingInstructions(e.target.value)}
              placeholder="Lot C, ask for staff pass"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Load-in instructions" className="md:col-span-2">
            <input
              value={loadInInstructions}
              onChange={(e) => setLoadInInstructions(e.target.value)}
              placeholder="Use service elevator, dock entrance"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Description / assignment" className="md:col-span-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Candid coverage of mehendi, guest portraits, detail shots of the setup."
              className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Special instructions" className="md:col-span-2">
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
              placeholder="Surprise dance at 9pm — don't miss."
              className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-gold/10 bg-white px-6 py-3.5">
          <div>
            {assignment ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-rose hover:bg-rose-pale/60"
              >
                <Trash2 size={13} strokeWidth={1.6} />
                Remove
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
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
              {assignment ? "Save" : "Create assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label} {required ? <span className="text-rose">*</span> : null}
      </span>
      {children}
    </label>
  );
}
