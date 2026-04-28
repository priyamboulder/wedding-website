"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { useAuthStore } from "@/stores/auth-store";
import { useEventsStore } from "@/stores/events-store";
import { useInquiryStore } from "@/stores/inquiry-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { EventType } from "@/types/events";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";

// Exact spec palette — inline so these don't drift if the global tokens change.
const GOLD = "#C4A265";
const GOLD_HOVER = "#B08F53";
const IVORY = "#FFFFF0";
const IVORY_SOFT = "#FAF8F5";
const CHAMPAGNE = "#F5E6D0";
const INK = "#2C2C2C";
const ROSE = "#E8D5D0";
const DISPLAY = "'Cormorant Garamond', 'Fraunces', Georgia, serif";
const MONO = "var(--font-mono)";

type Size = "sm" | "md" | "lg";

interface InquireButtonProps {
  onClick: () => void;
  size?: Size;
  label?: string;
  className?: string;
}

// ── Gold filled CTA ─────────────────────────────────────────────────────────
// Used on the vendor card (sm) and in the profile panel header (lg).

export function InquireButton({
  onClick,
  size = "sm",
  label = "Inquire",
  className,
}: InquireButtonProps) {
  const sizing =
    size === "lg"
      ? "px-5 py-2.5 text-[14px]"
      : size === "md"
        ? "px-3.5 py-1.5 text-[12.5px]"
        : "px-2.5 py-1 text-[11px]";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium tracking-[0.02em] transition-colors",
        "shadow-[0_1px_0_rgba(44,44,44,0.04)] hover:shadow-[0_2px_6px_rgba(196,162,101,0.35)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        sizing,
        className,
      )}
      style={{
        backgroundColor: GOLD,
        color: IVORY,
        fontFamily: size === "lg" ? DISPLAY : "inherit",
        letterSpacing: size === "lg" ? "0.01em" : undefined,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = GOLD_HOVER;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = GOLD;
      }}
    >
      {label}
    </button>
  );
}

// ── Inquiry dialog ──────────────────────────────────────────────────────────

interface InquiryDialogProps {
  vendor: Vendor | null;
  source?: "marketplace" | "profile_panel";
  onClose: () => void;
}

const DEFAULT_EVENT_CHOICES: Array<{ id: EventType; label: string }> = [
  { id: "mehendi", label: "Mehndi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "haldi", label: "Haldi" },
  { id: "ceremony", label: "Wedding Ceremony" },
  { id: "reception", label: "Reception" },
];

const BUDGET_RANGES: Array<{ id: string; label: string; min: number; max: number | null }> = [
  { id: "b1", label: "Under ₹2 L", min: 0, max: 200000 },
  { id: "b2", label: "₹2 – ₹5 L", min: 200000, max: 500000 },
  { id: "b3", label: "₹5 – ₹10 L", min: 500000, max: 1000000 },
  { id: "b4", label: "₹10 – ₹20 L", min: 1000000, max: 2000000 },
  { id: "b5", label: "₹20 L +", min: 2000000, max: null },
  { id: "b0", label: "Not sure yet", min: 0, max: 0 },
];

export function InquiryDialog({ vendor, source = "marketplace", onClose }: InquiryDialogProps) {
  const user = useAuthStore((s) => s.user);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const eventsInPlan = useEventsStore((s) => s.events);
  const submitInquiry = useInquiryStore((s) => s.submitInquiry);
  const setShortlistStatus = useVendorsStore((s) => s.setShortlistStatus);
  const isShortlisted = useVendorsStore((s) => s.isShortlisted);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);

  // ── Prefill from couple profile ────────────────────────────────────────
  const prefilledName = user?.name ?? "";
  const prefilledDate = user?.wedding?.weddingDate ?? "";
  const prefilledGuests = user?.wedding?.guestCount ?? coupleContext.totalGuestCount ?? 0;

  // If the couple has already built their event program, preselect those.
  const presetEventIds = useMemo(() => {
    const fromPlan = new Set<EventType>(eventsInPlan.map((e) => e.type));
    return new Set<EventType>(
      DEFAULT_EVENT_CHOICES.filter((c) => fromPlan.has(c.id)).map((c) => c.id),
    );
  }, [eventsInPlan]);

  const [coupleName, setCoupleName] = useState(prefilledName);
  const [weddingDate, setWeddingDate] = useState(prefilledDate);
  const [guestCount, setGuestCount] = useState<number>(prefilledGuests);
  const [selectedEvents, setSelectedEvents] = useState<Set<EventType>>(presetEventIds);
  const [budgetId, setBudgetId] = useState<string>("b0");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!vendor) return;
    setCoupleName(prefilledName);
    setWeddingDate(prefilledDate);
    setGuestCount(prefilledGuests);
    setSelectedEvents(new Set(presetEventIds));
    setBudgetId("b0");
    setMessage("");
    setSubmitted(false);
    setBusy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]);

  useEffect(() => {
    if (!vendor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [vendor, onClose]);

  if (!vendor) return null;

  const toggleEvent = (id: EventType) =>
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const canSubmit =
    coupleName.trim().length > 1 && weddingDate.trim().length > 0 && !busy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);

    const budget = BUDGET_RANGES.find((b) => b.id === budgetId);
    const eventLabels = DEFAULT_EVENT_CHOICES.filter((c) =>
      selectedEvents.has(c.id),
    ).map((c) => c.label);

    submitInquiry({
      couple_id: user?.id ?? `guest_${coupleName.trim().toLowerCase()}`,
      couple_name: coupleName.trim(),
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      vendor_category: vendor.category,
      planner_id: null,
      source: source === "profile_panel" ? "profile_panel" : "marketplace",
      message:
        message.trim() ||
        `Hi ${vendor.name} — we'd love to learn more about working with you for our wedding.`,
      package_ids: [],
      wedding_date: weddingDate.trim(),
      guest_count: guestCount || 0,
      venue_name: user?.wedding?.location ?? null,
      events: eventLabels,
      budget_min: budget && budget.id !== "b0" ? budget.min : null,
      budget_max: budget && budget.id !== "b0" ? budget.max : null,
    });

    // Make sure the vendor is on the shortlist, then flip status to Contacted.
    if (!isShortlisted(vendor.id)) toggleShortlist(vendor.id);
    setShortlistStatus(vendor.id, "contacted");

    setSubmitted(true);
    setBusy(false);
  };

  return (
    <AnimatePresence>
      {vendor && (
        <motion.div
          key="inquiry-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 md:items-center md:p-6"
          style={{ backgroundColor: "rgba(44, 44, 44, 0.45)", backdropFilter: "blur(2px)" }}
        >
          <motion.div
            key="inquiry-card"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-dialog-title"
            className="relative flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden"
            style={{
              backgroundColor: IVORY_SOFT,
              border: `1px solid ${CHAMPAGNE}`,
              borderRadius: 6,
              boxShadow: "0 24px 60px -20px rgba(44, 44, 44, 0.28)",
            }}
          >
            {/* Ornamental champagne divider at the top */}
            <span
              aria-hidden
              className="block h-[3px] w-full"
              style={{
                background: `linear-gradient(90deg, ${CHAMPAGNE} 0%, ${GOLD} 50%, ${CHAMPAGNE} 100%)`,
              }}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{
                color: INK,
                backgroundColor: IVORY,
                border: `1px solid ${CHAMPAGNE}`,
              }}
            >
              <X size={14} strokeWidth={1.8} />
            </button>

            {submitted ? (
              <Confirmation vendor={vendor} onClose={onClose} />
            ) : (
              <div className="flex min-h-0 flex-col">
                <header className="px-8 pt-8 pb-4">
                  <p
                    className="text-[10px] uppercase"
                    style={{ fontFamily: MONO, letterSpacing: "0.24em", color: "#9B8A6D" }}
                  >
                    New inquiry · {CATEGORY_LABELS[vendor.category]}
                  </p>
                  <h2
                    id="inquiry-dialog-title"
                    className="mt-3"
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 30,
                      lineHeight: 1.15,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: INK,
                    }}
                  >
                    Reach out to {vendor.name}
                  </h2>
                  <p
                    className="mt-2 text-[13.5px] leading-relaxed"
                    style={{ color: "#5C554B" }}
                  >
                    Share a few details and we'll send your note straight to their
                    inbox. Most vendors reply within 24&nbsp;hours.
                  </p>
                </header>

                <form
                  onSubmit={handleSubmit}
                  className="flex min-h-0 flex-1 flex-col overflow-y-auto"
                >
                  <div className="space-y-5 px-8 pb-6">
                    <FieldRow>
                      <LabeledField label="Your name" required>
                        <input
                          value={coupleName}
                          onChange={(e) => setCoupleName(e.target.value)}
                          required
                          placeholder="e.g. Priya & Arjun"
                          className="w-full bg-transparent px-3 py-2 text-[13.5px] outline-none"
                          style={fieldStyle}
                        />
                      </LabeledField>
                      <LabeledField label="Wedding date" required>
                        <input
                          type="date"
                          value={weddingDate}
                          onChange={(e) => setWeddingDate(e.target.value)}
                          required
                          className="w-full bg-transparent px-3 py-2 text-[13.5px] outline-none"
                          style={fieldStyle}
                        />
                      </LabeledField>
                    </FieldRow>

                    <LabeledField label="Events you'd like this vendor for">
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {DEFAULT_EVENT_CHOICES.map((c) => {
                          const active = selectedEvents.has(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleEvent(c.id)}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors"
                              style={{
                                border: `1px solid ${active ? GOLD : CHAMPAGNE}`,
                                backgroundColor: active ? GOLD : IVORY,
                                color: active ? IVORY : INK,
                                fontFamily: "inherit",
                              }}
                            >
                              {active && <Check size={11} strokeWidth={2.2} />}
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                      {eventsInPlan.length > 0 && presetEventIds.size > 0 && (
                        <p
                          className="mt-2 text-[10.5px] italic"
                          style={{ color: "#9B8A6D" }}
                        >
                          Pre-selected from your wedding plan — adjust as needed.
                        </p>
                      )}
                    </LabeledField>

                    <FieldRow>
                      <LabeledField label="Estimated guest count">
                        <input
                          type="number"
                          min={0}
                          value={guestCount || ""}
                          onChange={(e) =>
                            setGuestCount(parseInt(e.target.value, 10) || 0)
                          }
                          placeholder="e.g. 250"
                          className="w-full bg-transparent px-3 py-2 text-[13.5px] outline-none"
                          style={{ ...fieldStyle, fontFamily: MONO }}
                        />
                      </LabeledField>
                      <LabeledField label="Budget range">
                        <select
                          value={budgetId}
                          onChange={(e) => setBudgetId(e.target.value)}
                          className="w-full appearance-none bg-transparent px-3 py-2 text-[13.5px] outline-none"
                          style={fieldStyle}
                        >
                          {BUDGET_RANGES.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </LabeledField>
                    </FieldRow>

                    <LabeledField label="Message">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder="A few sentences about your wedding — what you love about their work, anything you want them to know."
                        className="w-full resize-none bg-transparent px-3 py-2.5 text-[13.5px] leading-relaxed outline-none"
                        style={fieldStyle}
                      />
                    </LabeledField>
                  </div>

                  <footer
                    className="flex items-center justify-between gap-4 px-8 py-5"
                    style={{
                      backgroundColor: IVORY,
                      borderTop: `1px solid ${CHAMPAGNE}`,
                    }}
                  >
                    <p
                      className="text-[11px] italic leading-snug"
                      style={{ color: "#6B5B48" }}
                    >
                      Your inquiry lives in the couple's side of Ananya and becomes
                      a lead in {vendor.name}'s pipeline.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-2 text-[12px] transition-colors"
                        style={{ color: "#6B5B48" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: canSubmit ? GOLD : "#D9CCB4",
                          color: IVORY,
                          fontFamily: DISPLAY,
                          letterSpacing: "0.01em",
                        }}
                      >
                        <Mail size={13} strokeWidth={1.8} />
                        Send inquiry
                      </button>
                    </div>
                  </footer>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Confirmation state ──────────────────────────────────────────────────────

function Confirmation({
  vendor,
  onClose,
}: {
  vendor: Vendor;
  onClose: () => void;
}) {
  return (
    <div className="px-10 py-14 text-center">
      <span
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: ROSE, color: INK }}
      >
        <Check size={22} strokeWidth={1.8} />
      </span>
      <h2
        className="mt-6"
        style={{
          fontFamily: DISPLAY,
          fontSize: 28,
          lineHeight: 1.2,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: INK,
        }}
      >
        Your inquiry is on its way
      </h2>
      <p
        className="mx-auto mt-4 max-w-[420px] text-[14px] leading-relaxed"
        style={{ color: "#5C554B" }}
      >
        Your inquiry has been sent to{" "}
        <span style={{ color: INK, fontStyle: "italic" }}>{vendor.name}</span>.
        Most vendors respond within 24&nbsp;hours. We've also moved them to{" "}
        <span
          className="font-medium"
          style={{ fontFamily: MONO, fontSize: 12 }}
        >
          CONTACTED
        </span>{" "}
        in your shortlist.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex items-center justify-center rounded-md px-6 py-2.5 text-[13px] font-medium transition-colors"
        style={{
          backgroundColor: GOLD,
          color: IVORY,
          fontFamily: DISPLAY,
          letterSpacing: "0.01em",
        }}
      >
        Close
      </button>
    </div>
  );
}

// ── Field primitives ────────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  backgroundColor: IVORY,
  border: `1px solid ${CHAMPAGNE}`,
  borderRadius: 4,
  color: INK,
};

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function LabeledField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-[10.5px] uppercase"
        style={{ fontFamily: MONO, letterSpacing: "0.16em", color: "#6B5B48" }}
      >
        {label}
        {required && <span style={{ color: GOLD }}> *</span>}
      </span>
      {children}
    </label>
  );
}
