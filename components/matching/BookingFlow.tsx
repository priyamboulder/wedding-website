"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Check,
  ArrowLeft,
  ChevronRight,
  Video,
  Clipboard,
  Clock,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/creator";
import type { CreatorService, ConsultationBooking } from "@/types/matching";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { TierBadge } from "@/components/creators/TierBadge";
import {
  DEMO_COUPLE_USER_ID,
  useMatchingStore,
} from "@/stores/matching-store";

// ── BookingFlow ───────────────────────────────────────────────────────────
// Modal-style booking flow:
//   Step 1 — pick a service
//   Step 2 — write a note about what the couple needs
//   Step 3 — confirm + (placeholder) pay
//   Step 4 — confirmation
// Uses the matching store for state; payment is a placeholder surface.

type Step = "service" | "note" | "pay" | "confirm";

const SERVICE_TYPE_LABEL: Record<CreatorService["serviceType"], string> = {
  quick_ask: "Quick Ask",
  styling_session: "Session",
  mood_board: "Mood Board",
  full_package: "Package",
  custom: "Custom",
};

export function BookingFlow({
  creator,
  initialServiceId,
  onClose,
}: {
  creator: Creator;
  initialServiceId?: string;
  onClose: () => void;
}) {
  const allServices = useMatchingStore((s) => s.services);
  const services = useMemo(
    () =>
      allServices.filter(
        (s) => s.creatorId === creator.id && s.isActive,
      ),
    [allServices, creator.id],
  );
  const createBooking = useMatchingStore((s) => s.createBooking);

  const [step, setStep] = useState<Step>(
    initialServiceId ? "note" : "service",
  );
  const [serviceId, setServiceId] = useState<string | null>(
    initialServiceId ?? null,
  );
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState<ConsultationBooking | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const submitBooking = () => {
    if (!service) return;
    const result = createBooking({
      serviceId: service.id,
      coupleUserId: DEMO_COUPLE_USER_ID,
      coupleNote: note.trim(),
    });
    if (result) {
      setBooking(result);
      setStep("confirm");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-flow-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-gold/15 bg-ivory-warm/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <CreatorAvatar creator={creator} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="booking-flow-title"
                  className="font-serif text-[18px] text-ink"
                >
                  Book with {creator.displayName}
                </h2>
                <TierBadge tier={creator.tier} size="xs" hideOnStandard />
              </div>
              <p className="text-[11.5px] text-ink-muted">
                {creator.specialties.slice(0, 2).join(" · ")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === "service" && (
            <ServiceStep
              services={services}
              selectedId={serviceId}
              onSelect={(id) => setServiceId(id)}
            />
          )}
          {step === "note" && service && (
            <NoteStep service={service} note={note} onChange={setNote} />
          )}
          {step === "pay" && service && (
            <PayStep service={service} note={note} />
          )}
          {step === "confirm" && booking && service && (
            <ConfirmStep booking={booking} service={service} creator={creator} />
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-gold/15 bg-ivory-warm/30 px-6 py-4">
          {step !== "confirm" ? (
            <BackButton step={step} setStep={setStep} />
          ) : (
            <span />
          )}
          <NextButton
            step={step}
            serviceId={serviceId}
            note={note}
            onAdvance={(next) => setStep(next)}
            onSubmit={submitBooking}
            onClose={onClose}
          />
        </footer>
      </div>
    </div>
  );
}

// ── Step 1: Service ───────────────────────────────────────────────────────

function ServiceStep({
  services,
  selectedId,
  onSelect,
}: {
  services: CreatorService[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (services.length === 0) {
    return (
      <p className="text-[13px] text-ink-muted">
        This creator isn't offering consultation services right now.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Choose a service
      </p>
      {services.map((s) => {
        const active = selectedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              "w-full rounded-lg border bg-white p-4 text-left transition-colors",
              active
                ? "border-ink bg-ivory-warm"
                : "border-border hover:border-gold/40",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-[15px] text-ink">
                    {s.title}
                  </h3>
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {SERVICE_TYPE_LABEL[s.serviceType]}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                  {s.description}
                </p>
                {s.durationMinutes != null && (
                  <p className="mt-2 flex items-center gap-1 font-mono text-[10.5px] text-ink-faint">
                    <Clock size={10} strokeWidth={1.8} />
                    {s.durationMinutes} min video call
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="font-serif text-[18px] text-ink">
                  ${s.price}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Step 2: Note ──────────────────────────────────────────────────────────

function NoteStep({
  service,
  note,
  onChange,
}: {
  service: CreatorService;
  note: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="rounded-lg border border-border bg-ivory-warm/50 px-4 py-3">
        <p className="font-serif text-[14px] text-ink">{service.title}</p>
        <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
          ${service.price}
          {service.durationMinutes != null &&
            ` · ${service.durationMinutes} min`}
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="note"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          What would you like help with?
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Tell them about your wedding, what you're stuck on, and what a great outcome looks like..."
          className="mt-2 w-full resize-none rounded-lg border border-border bg-white px-3.5 py-3 font-sans text-[13px] text-ink placeholder:text-ink-faint focus:border-gold/50 focus:outline-none"
        />
        <p className="mt-2 text-[11px] text-ink-faint">
          The more specific you are, the better prepared they'll be for your
          session.
        </p>
      </div>
    </div>
  );
}

// ── Step 3: Payment (placeholder) ─────────────────────────────────────────

function PayStep({
  service,
  note,
}: {
  service: CreatorService;
  note: string;
}) {
  const platformFee = Math.round(service.price * 0.2);
  return (
    <div>
      <div className="rounded-lg border border-border bg-ivory-warm/50 p-4">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Booking summary
        </p>
        <div className="mt-3 space-y-2 text-[13px]">
          <Row label={service.title} value={`$${service.price}`} />
          <Row
            label="Platform fee (included)"
            value={`$${platformFee}`}
            muted
          />
          <div className="my-2 border-t border-border" />
          <Row
            label="Total today"
            value={`$${service.price}`}
            emphasized
          />
        </div>
      </div>

      {note && (
        <div className="mt-5">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Your note
          </p>
          <p className="mt-1.5 rounded-lg border border-border bg-white px-3.5 py-3 text-[12.5px] text-ink-muted">
            {note}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-dashed border-gold/40 bg-gold-pale/20 px-4 py-4">
        <div className="flex items-start gap-2">
          <CreditCard size={14} strokeWidth={1.8} className="mt-0.5 text-gold" />
          <div>
            <p className="font-serif text-[13px] text-ink">
              Payment integration pending
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              In production you'd complete payment here. For now, confirm to
              create the booking request. The creator will be notified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  emphasized,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          emphasized ? "font-serif text-[14px] text-ink" : "text-ink-muted",
          muted && "text-ink-faint",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono",
          emphasized
            ? "text-[14px] text-ink"
            : muted
              ? "text-[11.5px] text-ink-faint"
              : "text-[12px] text-ink",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Step 4: Confirmation ──────────────────────────────────────────────────

function ConfirmStep({
  booking,
  service,
  creator,
}: {
  booking: ConsultationBooking;
  service: CreatorService;
  creator: Creator;
}) {
  return (
    <div className="py-2 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-pale/60 text-gold">
        <Check size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 font-serif text-[22px] text-ink">
        Booking request sent
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-muted">
        {creator.displayName} will confirm within 24 hours. You'll see updates
        in your bookings dashboard — we'll also email you when there's news.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-ivory-warm/50 px-4 py-4 text-left">
        <p className="font-serif text-[13.5px] text-ink">{service.title}</p>
        <p className="mt-0.5 font-mono text-[10.5px] text-ink-muted">
          Confirmation #{booking.id.slice(0, 8)}
        </p>
        <div className="mt-3 space-y-2 text-[12px] text-ink-muted">
          {service.durationMinutes != null && (
            <div className="flex items-center gap-2">
              <Video size={12} strokeWidth={1.8} />
              Video call link will be shared once scheduled
            </div>
          )}
          {service.serviceType === "mood_board" && (
            <div className="flex items-center gap-2">
              <Clipboard size={12} strokeWidth={1.8} />
              Deliverable arrives via email in 5–7 business days
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Footer controls ───────────────────────────────────────────────────────

function BackButton({
  step,
  setStep,
}: {
  step: Step;
  setStep: (s: Step) => void;
}) {
  const target = stepBefore(step);
  if (!target) return <span />;
  return (
    <button
      type="button"
      onClick={() => setStep(target)}
      className="flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
    >
      <ArrowLeft size={12} strokeWidth={1.8} /> Back
    </button>
  );
}

function NextButton({
  step,
  serviceId,
  note,
  onAdvance,
  onSubmit,
  onClose,
}: {
  step: Step;
  serviceId: string | null;
  note: string;
  onAdvance: (next: Step) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  if (step === "confirm") {
    return (
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-1.5 rounded-md border border-ink bg-ink px-5 py-2 text-[12px] font-medium uppercase tracking-wider text-ivory hover:bg-ink/90"
      >
        Done
      </button>
    );
  }

  const canAdvance =
    (step === "service" && !!serviceId) ||
    (step === "note" && note.trim().length >= 10) ||
    step === "pay";

  const label = step === "pay" ? "Confirm & pay" : "Continue";

  return (
    <button
      type="button"
      disabled={!canAdvance}
      onClick={() => {
        if (step === "pay") {
          onSubmit();
          return;
        }
        const next = stepAfter(step);
        if (next) onAdvance(next);
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-5 py-2 text-[12px] font-medium uppercase tracking-wider transition-colors",
        canAdvance
          ? "border-gold bg-gold text-ivory hover:bg-gold/90"
          : "cursor-not-allowed border-ink/15 bg-ivory-warm text-ink-faint",
      )}
    >
      {label} <ChevronRight size={13} strokeWidth={1.8} />
    </button>
  );
}

function stepAfter(step: Step): Step | null {
  if (step === "service") return "note";
  if (step === "note") return "pay";
  return null;
}
function stepBefore(step: Step): Step | null {
  if (step === "note") return "service";
  if (step === "pay") return "note";
  return null;
}
