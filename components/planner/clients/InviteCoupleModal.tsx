"use client";

import { useEffect, useState } from "react";
import { PLANNER_PALETTE } from "@/components/planner/ui";

const DEFAULT_MESSAGE =
  "So excited to plan your wedding! I've set up your planning workspace on Ananya — you'll be able to browse vendors, manage guests, and track everything in one place. I've already started adding my recommended vendors for you.";

const EVENTS = ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"] as const;

const BUDGET_RANGES = [
  "Under $100K",
  "$100K – $200K",
  "$200K – $300K",
  "$300K – $500K",
  "$500K+",
];

export default function InviteCoupleModal({ onClose }: { onClose: () => void }) {
  // Pre-filled with mock data per spec.
  const [p1First, setP1First] = useState("Simran");
  const [p1Last, setP1Last] = useState("Kapoor");
  const [p1Email, setP1Email] = useState("simran.kapoor@gmail.com");
  const [p2First, setP2First] = useState("Dev");
  const [p2Last, setP2Last] = useState("Malhotra");
  const [p2Email, setP2Email] = useState("dev.malhotra@gmail.com");
  const [weddingDate, setWeddingDate] = useState("2027-03-15");
  const [venue, setVenue] = useState("The Legacy Castle");
  const [guestCount, setGuestCount] = useState("400");
  const [events, setEvents] = useState<string[]>([...EVENTS]);
  const [budget, setBudget] = useState("$300K – $500K");
  const [destination, setDestination] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !sent) onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, sent]);

  function toggleEvent(evt: string) {
    setEvents((prev) =>
      prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt],
    );
  }

  function send() {
    setSent(true);
    setTimeout(() => onClose(), 1700);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
      style={{ backgroundColor: "rgba(44,44,44,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] rounded-2xl bg-white shadow-2xl"
        style={{ border: `1px solid ${PLANNER_PALETTE.hairline}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <SentState onClose={onClose} couple={`${p1First} & ${p2First}`} />
        ) : (
          <>
            {/* Header */}
            <div
              className="flex items-start justify-between border-b px-7 py-6"
              style={{ borderColor: PLANNER_PALETTE.hairline }}
            >
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
                  Growth
                </p>
                <h2
                  className="mt-1.5 text-[28px] leading-tight text-[#2C2C2C]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    letterSpacing: "-0.005em",
                  }}
                >
                  Invite a couple to Ananya
                </h2>
                <p
                  className="mt-1.5 max-w-[460px] text-[13px] text-[#6a6a6a]"
                  style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
                >
                  When your couple joins Ananya, you'll be linked as their planner
                  automatically. They'll get the full planning suite with your
                  vendor recommendations built in.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#5a5a5a] transition-colors hover:bg-[#F5E6D0]"
              >
                <span className="text-[16px]" aria-hidden>
                  ×
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-7 py-6">
              <FieldSection label="Partner 1">
                <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
                  <Input value={p1First} onChange={setP1First} placeholder="First name" />
                  <Input value={p1Last} onChange={setP1Last} placeholder="Last name" />
                  <Input value={p1Email} onChange={setP1Email} placeholder="Email" type="email" />
                </div>
              </FieldSection>

              <FieldSection label="Partner 2">
                <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
                  <Input value={p2First} onChange={setP2First} placeholder="First name" />
                  <Input value={p2Last} onChange={setP2Last} placeholder="Last name" />
                  <Input value={p2Email} onChange={setP2Email} placeholder="Email" type="email" />
                </div>
              </FieldSection>

              <div className="grid grid-cols-2 gap-4">
                <FieldSection label="Wedding date">
                  <Input
                    value={weddingDate}
                    onChange={setWeddingDate}
                    type="date"
                  />
                </FieldSection>
                <FieldSection label="Venue">
                  <Input
                    value={venue}
                    onChange={setVenue}
                    placeholder="Search Ananya venues or type name"
                  />
                </FieldSection>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldSection label="Guest count">
                  <Input value={guestCount} onChange={setGuestCount} type="number" />
                </FieldSection>
                <FieldSection label="Estimated budget">
                  <Select
                    value={budget}
                    onChange={setBudget}
                    options={BUDGET_RANGES}
                  />
                </FieldSection>
              </div>

              <FieldSection label="Events">
                <div className="flex flex-wrap gap-2">
                  {EVENTS.map((evt) => {
                    const active = events.includes(evt);
                    return (
                      <button
                        key={evt}
                        type="button"
                        onClick={() => toggleEvent(evt)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors"
                        style={
                          active
                            ? {
                                backgroundColor: "#FBF1DF",
                                color: "#7a5a1a",
                                boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.55)",
                              }
                            : {
                                backgroundColor: "rgba(44,44,44,0.03)",
                                color: "#5a5a5a",
                                boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.08)",
                              }
                        }
                      >
                        <span aria-hidden>{active ? "☑" : "☐"}</span>
                        {evt}
                      </button>
                    );
                  })}
                </div>
              </FieldSection>

              <FieldSection label="Destination wedding?">
                <div className="flex items-center gap-3">
                  <Radio
                    label="Yes"
                    active={destination}
                    onClick={() => setDestination(true)}
                  />
                  <Radio
                    label="No"
                    active={!destination}
                    onClick={() => setDestination(false)}
                  />
                </div>
              </FieldSection>

              <FieldSection
                label="Personal message"
                hint="Included in invitation email"
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg bg-[#FAF8F5] px-3 py-2.5 text-[13px] leading-relaxed text-[#2C2C2C] outline-none transition-shadow focus:bg-white"
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    border: `1px solid ${PLANNER_PALETTE.hairline}`,
                    fontStyle: "italic",
                  }}
                />
              </FieldSection>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between border-t px-7 py-5"
              style={{ borderColor: PLANNER_PALETTE.hairline }}
            >
              <p
                className="text-[11.5px] italic text-[#8a8a8a]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Their workspace will pre-fill with these details.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-[12.5px] text-[#5a5a5a] hover:bg-[#F5E6D0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={send}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12.5px] font-medium text-[#FAF8F5] transition-transform hover:-translate-y-px"
                  style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
                >
                  <span className="text-[#C4A265]" aria-hidden>
                    ✉
                  </span>
                  Send Invitation
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FieldSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
          {label}
        </p>
        {hint && (
          <p
            className="text-[10.5px] italic text-[#b5a68e]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {hint}
          </p>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="w-full rounded-lg bg-[#FAF8F5] px-3 py-2 text-[13px] text-[#2C2C2C] outline-none transition-shadow focus:bg-white"
      style={{
        border: `1px solid ${PLANNER_PALETTE.hairline}`,
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg bg-[#FAF8F5] px-3 py-2 text-[13px] text-[#2C2C2C] outline-none focus:bg-white"
      style={{ border: `1px solid ${PLANNER_PALETTE.hairline}` }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function Radio({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] transition-colors"
      style={
        active
          ? {
              backgroundColor: "#FBF1DF",
              color: "#7a5a1a",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.55)",
            }
          : {
              backgroundColor: "rgba(44,44,44,0.03)",
              color: "#5a5a5a",
              boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.08)",
            }
      }
    >
      <span aria-hidden>{active ? "●" : "○"}</span>
      {label}
    </button>
  );
}

function SentState({ couple, onClose }: { couple: string; onClose: () => void }) {
  return (
    <div className="px-8 py-14 text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-full"
        style={{
          backgroundColor: "#FBF1DF",
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.55)",
        }}
      >
        <span className="text-[22px] text-[#7a5a1a]" aria-hidden>
          ✉
        </span>
      </div>
      <h3
        className="mt-5 text-[26px] leading-tight text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.005em",
        }}
      >
        Invitation sent to {couple}
      </h3>
      <p
        className="mt-2 text-[13px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Their workspace is waiting. You'll be notified when they accept.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-full px-5 py-2 text-[12.5px] font-medium text-[#FAF8F5]"
        style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
      >
        Close
      </button>
    </div>
  );
}
