"use client";

// ── Custody chain visualizer ──────────────────────────────────────────────
// Reusable component for visualizing a chain-of-custody for high-value
// items across an event sequence. Built first for jewelry (the wedding-day
// custody plan for $50K+ of bridal jewelry), but designed to be lifted for
// future use cases: gift registry transport, family heirloom saree
// handoff, ceremonial implements (kalash, kalava).
//
// Inputs are intentionally generic — events, people, pieces, handoffs.
// The component doesn't reach into category-specific stores; the caller
// hydrates and writes through props.

import { useMemo, type ReactNode } from "react";
import { ArrowRight, AlertTriangle, Lock, MapPin, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustodyHandoff {
  /** Display label, e.g. "10:00 AM" or "Just before baraat". */
  time?: string;
  /** Where/who currently has the items. */
  from: string;
  /** Where/who they're moving to. */
  to: string;
  /** Free-text role/method, e.g. "Stylist transports in locked case". */
  carrier_role?: string;
  /** Caller-supplied note, e.g. "Kalgi lives in groom's pocket". */
  notes?: string;
  /** Render with a high-stakes treatment (kalgi, mangalsutra, etc.). */
  high_stakes?: boolean;
}

export interface CustodyChainEventStep {
  id: string;
  /** Display label for the event, e.g. "Wedding". */
  event_label: string;
  /** Optional date/time stamp shown beneath the label. */
  event_when?: string;
  /** Pieces carried into this event. Display labels — caller resolves ids. */
  pieces_at_event: string[];
  /** The morning-of pickup. */
  morning_handoff?: CustodyHandoff;
  /** Storage between sub-events of the same day, if any. */
  between_events_storage?: {
    location: string;
    responsible_person: string;
  };
  /** Post-event return. */
  post_event_handoff?: CustodyHandoff;
}

export interface CustodyChainProps {
  /** Optional eyebrow / heading copy. */
  eyebrow?: string;
  heading?: string;
  /** Pre-event storage summary. */
  overnight_storage?: {
    location: string;
    who_has_access: string[];
    lock_combination_shared_with?: string;
  };
  /** Per-event custody steps in chronological order. */
  steps: CustodyChainEventStep[];
  /** Special handoffs that don't fit the per-event flow. */
  special_handoffs?: Array<{
    id: string;
    label: string;
    handoff: CustodyHandoff;
  }>;
  /** Optional warning banner displayed at the top (uninsured value, etc.). */
  warning?: string;
  /** Children render below the chain (e.g. an "Add handoff" button). */
  children?: ReactNode;
  /** Compact mode reduces vertical breathing room for embedded views. */
  compact?: boolean;
}

export function CustodyChain({
  eyebrow,
  heading,
  overnight_storage,
  steps,
  special_handoffs = [],
  warning,
  children,
  compact = false,
}: CustodyChainProps) {
  const totalHandoffs = useMemo(() => {
    let n = special_handoffs.length;
    for (const step of steps) {
      if (step.morning_handoff) n += 1;
      if (step.post_event_handoff) n += 1;
    }
    return n;
  }, [steps, special_handoffs]);

  return (
    <section
      className={cn(
        "rounded-md border border-ink/10 bg-paper",
        compact ? "p-4" : "p-6",
      )}
    >
      {(eyebrow || heading) && (
        <header className="mb-4">
          {eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h3 className="mt-1 font-serif text-2xl text-ink">{heading}</h3>
          )}
        </header>
      )}

      {warning && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-ink">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber" />
          <p className="leading-snug">{warning}</p>
        </div>
      )}

      {overnight_storage && (
        <div className="mb-5 rounded-md border border-ink/10 bg-ivory-soft p-3">
          <div className="flex items-center gap-2 text-sm text-ink">
            <Lock size={13} className="shrink-0 text-ink-soft" />
            <span className="font-medium">Overnight storage</span>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">
            {overnight_storage.location}
          </p>
          {overnight_storage.who_has_access.length > 0 && (
            <p className="mt-1 text-[12px] text-ink-muted">
              Access: {overnight_storage.who_has_access.join(", ")}
            </p>
          )}
          {overnight_storage.lock_combination_shared_with && (
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Combination shared with:{" "}
              {overnight_storage.lock_combination_shared_with}
            </p>
          )}
        </div>
      )}

      <ol className="space-y-4">
        {steps.map((step, idx) => (
          <li key={step.id} className="relative">
            {idx < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-3 top-8 bottom-0 w-px bg-ink/10"
              />
            )}
            <div className="flex gap-3">
              <span
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink/20 bg-paper text-[10px] font-mono text-ink-muted"
                aria-hidden
              >
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-serif text-base text-ink">
                    {step.event_label}
                  </h4>
                  {step.event_when && (
                    <span className="font-mono text-[11px] text-ink-faint">
                      {step.event_when}
                    </span>
                  )}
                </div>

                {step.pieces_at_event.length > 0 && (
                  <div className="mt-2 flex items-start gap-1.5 text-[12.5px] text-ink-soft">
                    <Package size={12} className="mt-0.5 shrink-0 text-ink-muted" />
                    <span>
                      <span className="text-ink-muted">Pieces: </span>
                      {step.pieces_at_event.join(", ")}
                    </span>
                  </div>
                )}

                {step.morning_handoff && (
                  <HandoffRow
                    label="Morning handoff"
                    handoff={step.morning_handoff}
                  />
                )}

                {step.between_events_storage && (
                  <div className="mt-2 flex items-start gap-1.5 text-[12.5px] text-ink-soft">
                    <MapPin size={12} className="mt-0.5 shrink-0 text-ink-muted" />
                    <span>
                      <span className="text-ink-muted">Between events: </span>
                      {step.between_events_storage.location} ·{" "}
                      {step.between_events_storage.responsible_person}
                    </span>
                  </div>
                )}

                {step.post_event_handoff && (
                  <HandoffRow
                    label="After event"
                    handoff={step.post_event_handoff}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {special_handoffs.length > 0 && (
        <div className="mt-6 border-t border-ink/10 pt-4">
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Special handoffs
          </h4>
          <ul className="mt-3 space-y-2">
            {special_handoffs.map((sh) => (
              <li
                key={sh.id}
                className={cn(
                  "rounded-md border p-3",
                  sh.handoff.high_stakes
                    ? "border-rose/40 bg-rose-pale/30"
                    : "border-ink/10 bg-ivory-soft",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-serif text-[15px] text-ink">{sh.label}</p>
                  {sh.handoff.time && (
                    <span className="font-mono text-[11px] text-ink-faint">
                      {sh.handoff.time}
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                  <User size={11} className="text-ink-muted" />
                  {sh.handoff.from} <ArrowRight size={11} /> {sh.handoff.to}
                </p>
                {sh.handoff.notes && (
                  <p className="mt-1 text-[12px] italic text-ink-muted">
                    {sh.handoff.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children && <div className="mt-5">{children}</div>}

      {totalHandoffs > 0 && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          {totalHandoffs} handoff{totalHandoffs === 1 ? "" : "s"} planned
        </p>
      )}
    </section>
  );
}

function HandoffRow({
  label,
  handoff,
}: {
  label: string;
  handoff: CustodyHandoff;
}) {
  return (
    <div className="mt-2 rounded-md border border-ink/10 bg-paper p-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          {label}
        </span>
        {handoff.time && (
          <span className="font-mono text-[11px] text-ink-faint">
            {handoff.time}
          </span>
        )}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
        <User size={11} className="text-ink-muted" />
        {handoff.from} <ArrowRight size={11} /> {handoff.to}
      </p>
      {handoff.carrier_role && (
        <p className="mt-0.5 text-[12px] text-ink-muted">{handoff.carrier_role}</p>
      )}
      {handoff.notes && (
        <p className="mt-0.5 text-[12px] italic text-ink-muted">
          {handoff.notes}
        </p>
      )}
    </div>
  );
}
