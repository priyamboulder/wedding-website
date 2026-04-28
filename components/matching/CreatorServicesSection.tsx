"use client";

import { useMemo, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import type { Creator } from "@/types/creator";
import type { CreatorService } from "@/types/matching";
import { useMatchingStore } from "@/stores/matching-store";
import { BookingFlow } from "./BookingFlow";

// ── CreatorServicesSection ────────────────────────────────────────────────
// "Work with {Creator}" block that lives on a creator's profile page.
// Lists active services; a Book CTA on each opens BookingFlow.

const SERVICE_TYPE_LABEL: Record<CreatorService["serviceType"], string> = {
  quick_ask: "Quick Ask",
  styling_session: "Session",
  mood_board: "Mood Board",
  full_package: "Package",
  custom: "Custom",
};

export function CreatorServicesSection({ creator }: { creator: Creator }) {
  const allServices = useMatchingStore((s) => s.services);
  const services = useMemo(
    () =>
      allServices.filter(
        (s) => s.creatorId === creator.id && s.isActive,
      ),
    [allServices, creator.id],
  );
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(
    null,
  );

  if (services.length === 0) return null;

  return (
    <section className="rounded-xl border border-gold/20 bg-white p-6">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Work with {creator.displayName.split(" ")[0]}
          </p>
          <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
            Paid services & consultations
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-lg border border-border bg-ivory-warm/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-[15px] leading-tight text-ink">
                    {s.title}
                  </h3>
                  <span
                    className="rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {SERVICE_TYPE_LABEL[s.serviceType]}
                  </span>
                </div>
              </div>
              <span className="font-serif text-[17px] text-ink">
                ${s.price}
              </span>
            </div>

            <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">
              {s.description}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-ink-faint">
                {s.durationMinutes != null ? (
                  <>
                    <Clock size={10} strokeWidth={1.8} />
                    {s.durationMinutes} min video
                  </>
                ) : (
                  <>
                    <Sparkles size={10} strokeWidth={1.8} />
                    Async deliverable
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => setBookingServiceId(s.id)}
                className="rounded-md border border-gold bg-gold px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-gold/90"
              >
                Book
              </button>
            </div>
          </article>
        ))}
      </div>

      {bookingServiceId && (
        <BookingFlow
          creator={creator}
          initialServiceId={bookingServiceId}
          onClose={() => setBookingServiceId(null)}
        />
      )}
    </section>
  );
}
