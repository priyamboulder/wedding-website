"use client";

// ── Trip seeder panel ─────────────────────────────────────────────────────
// Shared banner used by the Budget and Itinerary tabs. Renders a
// destination-aware generator that pulls data from the leading
// destination's catalog concept. The host tab passes a render callback
// that actually creates the records — this component handles the shell,
// match resolution, empty states, and already-seeded detection.

import { Sparkles } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import { cn } from "@/lib/utils";
import {
  DESTINATION_CONCEPTS,
  type DestinationConcept,
} from "@/lib/honeymoon/destination-catalog";

export interface SeederRenderArgs {
  concept: DestinationConcept;
  alreadySeeded: boolean;
  onSeed: () => void;
}

interface Props {
  eyebrow: string;
  title: string;
  // Describe what the generator will actually create. Keep short.
  copyWithConcept: (conceptTitle: string) => string;
  copyWithoutConcept: string;
  // Called by the host to determine whether the store already has the
  // seeded records — controls the disabled state and the label.
  isAlreadySeeded: (concept: DestinationConcept) => boolean;
  // What the button does when clicked.
  onSeed: (concept: DestinationConcept) => void;
  // The action label. Will be prefixed with "Seed · " or suffix from host.
  actionLabel: (concept: DestinationConcept) => string;
  // When true, require the concept to have a deepDive block. Otherwise
  // only requires the concept to match.
  requireDeepDive?: boolean;
}

export function TripSeederPanel({
  eyebrow,
  title,
  copyWithConcept,
  copyWithoutConcept,
  isAlreadySeeded,
  onSeed,
  actionLabel,
  requireDeepDive = true,
}: Props) {
  const destinations = useHoneymoonStore((s) => s.destinations);
  const leading = useMemo(
    () => destinations.find((d) => d.status === "leading"),
    [destinations],
  );

  const concept = useMemo(() => {
    if (!leading) return null;
    const n = leading.name.trim().toLowerCase();
    const byTitle = DESTINATION_CONCEPTS.find(
      (c) => c.title.trim().toLowerCase() === n,
    );
    if (byTitle) return byTitle;
    return (
      DESTINATION_CONCEPTS.find((c) =>
        c.stops.some((s) => s.trim().toLowerCase() === n),
      ) ?? null
    );
  }, [leading]);

  if (!concept) {
    return (
      <InfoBanner
        eyebrow={eyebrow}
        title={title}
        body={copyWithoutConcept}
        muted
      />
    );
  }
  if (requireDeepDive && !concept.deepDive) {
    return (
      <InfoBanner
        eyebrow={eyebrow}
        title={title}
        body={`No trip guide yet for ${concept.title}. When one lands, you'll be able to seed from here in one click.`}
        muted
      />
    );
  }

  const already = isAlreadySeeded(concept);

  return (
    <section className="rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="mr-1 inline-block align-[-1px]"
            />
            {eyebrow}
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-muted">
            {copyWithConcept(concept.title)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSeed(concept)}
          disabled={already}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-[12.5px] font-medium transition-opacity",
            already
              ? "border-border bg-ivory-warm text-ink-faint"
              : "border-gold/40 bg-gold text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] hover:opacity-90",
          )}
        >
          <Sparkles size={12} strokeWidth={1.8} />
          {already ? "Already seeded" : actionLabel(concept)}
        </button>
      </div>
    </section>
  );
}

// ── Info banner (no leading / no deep-dive) ────────────────────────────────

function InfoBanner({
  eyebrow,
  title,
  body,
  muted,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-dashed px-5 py-4",
        muted ? "border-border bg-ivory-warm/40" : "border-gold/30",
      )}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <h3 className="mt-0.5 font-serif text-[16px] leading-tight text-ink">
        {title}
      </h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        {body}
      </p>
    </section>
  );
}
