"use client";

// ── Program Discovery quiz ───────────────────────────────────────────────
// The 8-step discovery flow that lets a couple design their wedding
// program before touching any per-event tabs. Steps:
//
//   1. Let's design your wedding week (opening)
//   2. How many events are you imagining?
//   3. What traditions matter to you? (event picker)
//   4. Is everyone invited to everything? (invitation matrix)
//   5. Where are you imagining these events? (location intent)
//   6. What's the overall energy arc? (draggable dots)
//   7. Give your events personality (rename + theme line)
//   8. Summary — YOUR WEDDING PROGRAM BRIEF
//
// The flow is in-workspace (not the global FirstRunGate); it's reached via
// "Redesign program →" on the Program view, or automatically when the
// Events workspace opens with no completed program discovery yet.

import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, CircleDot, Flame,
  MapPin, Plus, Sparkles, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS, TRADITION_OPTIONS } from "@/lib/events-seed";
import type {
  EventRecord,
  EventType,
  ProgramLocationType,
} from "@/types/events";
import { displayNameFor } from "./event-display";

const STEPS = [
  { id: 0, label: "Open" },
  { id: 1, label: "How many" },
  { id: 2, label: "Traditions" },
  { id: 3, label: "Invitations" },
  { id: 4, label: "Location" },
  { id: 5, label: "Energy arc" },
  { id: 6, label: "Personality" },
  { id: 7, label: "Summary" },
];

interface Props {
  onExit: () => void;
  onFinish: () => void;
}

export function ProgramDiscoveryQuiz({ onExit, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const complete = useEventsStore((s) => s.setProgramDiscoveryComplete);
  const setProgramBrief = useEventsStore((s) => s.setProgramBrief);

  function next() {
    if (step >= STEPS.length - 1) {
      complete(true);
      onFinish();
      return;
    }
    setStep((n) => n + 1);
  }
  function back() {
    setStep((n) => Math.max(0, n - 1));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Progress + exit */}
      <div className="mb-8 flex items-center justify-between">
        <ProgressDots activeIndex={step} total={STEPS.length} />
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
        >
          <X size={11} strokeWidth={1.8} /> Close
        </button>
      </div>

      {/* Step body */}
      <div className="min-h-[400px]">
        {step === 0 && <StepOpen onStart={next} onExit={onExit} />}
        {step === 1 && <StepSize />}
        {step === 2 && <StepTraditions />}
        {step === 3 && <StepInvitationMatrix />}
        {step === 4 && <StepLocation />}
        {step === 5 && <StepEnergyArc />}
        {step === 6 && <StepPersonality />}
        {step === 7 && <StepSummary onProgramBriefChange={setProgramBrief} />}
      </div>

      {/* Step navigation */}
      {step > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
          >
            <ArrowLeft size={13} strokeWidth={1.8} /> Back
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
          >
            {step === STEPS.length - 1 ? "Save & explore" : "Next"}
            <ArrowRight size={13} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressDots({
  activeIndex,
  total,
}: {
  activeIndex: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === activeIndex
              ? "w-6 bg-saffron"
              : i < activeIndex
                ? "w-3 bg-gold"
                : "w-3 bg-border",
          )}
        />
      ))}
    </div>
  );
}

// ── Step 1: open ────────────────────────────────────────────────────────

function StepOpen({ onStart, onExit }: { onStart: () => void; onExit: () => void }) {
  return (
    <section className="rounded-xl border border-ink/10 bg-gradient-to-br from-ivory-warm via-white to-saffron-pale/30 p-10 text-center shadow-[0_1px_2px_rgba(26,26,26,0.03)]">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your wedding program
      </p>
      <h1
        className="mt-3 font-serif text-[38px] font-bold leading-tight text-ink"
        style={{
          fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        Let's design your wedding week
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-ink-muted">
        Every wedding tells a story across multiple days and events. Let's
        figure out yours — what you want to celebrate, who you want there,
        and what each moment should feel like.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
        >
          Start designing <ArrowRight size={13} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-md border border-border bg-white px-5 py-2.5 text-[13px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
        >
          I'll add events manually
        </button>
      </div>
    </section>
  );
}

// ── Step 2: program size ────────────────────────────────────────────────

const SIZE_OPTIONS = [
  { id: "essentials", label: "Just the essentials", hint: "2–3 events — ceremony + reception" },
  { id: "full", label: "A full celebration", hint: "4–5 events — mehendi, sangeet, ceremony, reception" },
  { id: "epic", label: "An epic wedding week", hint: "6+ events, multi-day" },
  { id: "exploring", label: "I'm not sure yet — help me explore", hint: "We'll guide you through it" },
];

function StepSize() {
  const programSize = useEventsStore((s) => s.coupleContext.programSize);
  const setProgramSize = useEventsStore((s) => s.setProgramSize);
  return (
    <StepShell
      eyebrow="Step 2"
      title="How many events are you imagining?"
      hint="Don't worry — you can always add or remove later."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SIZE_OPTIONS.map((opt) => {
          const active = programSize === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setProgramSize(active ? null : opt.id)}
              aria-pressed={active}
              className={cn(
                "rounded-lg border p-5 text-left transition-all",
                active
                  ? "border-saffron bg-saffron-pale/30 shadow-[0_0_0_2px_rgba(212,162,76,0.2)]"
                  : "border-border bg-white hover:border-gold/60",
              )}
            >
              <p className="font-serif text-[19px] leading-tight text-ink">
                {opt.label}
              </p>
              <p className="mt-1.5 text-[12.5px] text-ink-muted">{opt.hint}</p>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

// ── Step 3: traditions + event picker ──────────────────────────────────

function StepTraditions() {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const setTraditions = useEventsStore((s) => s.setTraditions);
  const events = useEventsStore((s) => s.events);
  const addEvent = useEventsStore((s) => s.addEvent);
  const removeEvent = useEventsStore((s) => s.removeEvent);

  function toggleTradition(id: string) {
    const active = coupleContext.traditions.includes(id as never);
    setTraditions(
      active
        ? (coupleContext.traditions.filter((t) => t !== id) as never)
        : ([...coupleContext.traditions, id] as never),
    );
  }

  function toggleEvent(type: EventType) {
    const existing = events.find((e) => e.type === type);
    if (existing) {
      removeEvent(existing.id);
    } else {
      addEvent(type);
    }
  }

  return (
    <StepShell
      eyebrow="Step 3"
      title="What traditions matter to you?"
      hint="Pick the traditions and event types you want to include. We'll weave them in."
    >
      <p
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Traditions
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {TRADITION_OPTIONS.map((t) => {
          const active = coupleContext.traditions.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTradition(t.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/30 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-gold/60 hover:text-ink",
              )}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      <p
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Event types
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EVENT_TYPE_OPTIONS.filter((o) => o.id !== "custom").map((opt) => {
          const active = events.some((e) => e.type === opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleEvent(opt.id)}
              aria-pressed={active}
              className={cn(
                "group flex items-start gap-3 rounded-md border p-3 text-left transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/30"
                  : "border-border bg-white hover:border-gold/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  active
                    ? "border-saffron bg-saffron text-ivory"
                    : "border-border bg-white",
                )}
              >
                {active && <Check size={10} strokeWidth={2} />}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink">{opt.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {opt.blurb} · ~{Math.round(opt.defaultGuestShare * 100)}% of guests
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

// ── Step 4: invitation matrix ──────────────────────────────────────────

function StepInvitationMatrix() {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const events = useEventsStore((s) => s.events);
  const setGuestTier = useEventsStore((s) => s.setEventGuestTier);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  if (sorted.length === 0) {
    return (
      <StepShell
        eyebrow="Step 4"
        title="Is everyone invited to everything?"
        hint="Add some events in the last step first — then come back here."
      >
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-6 text-center text-[13px] text-ink-muted">
          No events yet.
        </p>
      </StepShell>
    );
  }

  return (
    <StepShell
      eyebrow="Step 4"
      title="Is everyone invited to everything?"
      hint="Most couples have a mix — intimate on some nights, everyone on others. There's no wrong answer."
    >
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-ivory-warm/40 text-left">
              <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Event
              </th>
              {coupleContext.guestTiers.map((tier) => (
                <th
                  key={tier.id}
                  className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                >
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">
                  <p className="font-medium">{displayNameFor(e)}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">
                    {e.guestCount} guests
                  </p>
                </td>
                {coupleContext.guestTiers.map((tier) => {
                  const active = e.guestTier === tier.id;
                  return (
                    <td key={tier.id} className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setGuestTier(e.id, active ? null : tier.id)
                        }
                        aria-pressed={active}
                        aria-label={`Assign ${e.type} to ${tier.name}`}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                          active
                            ? "border-saffron bg-saffron text-ivory"
                            : "border-border bg-white text-ink-faint hover:border-saffron",
                        )}
                      >
                        {active ? (
                          <Check size={11} strokeWidth={2.2} />
                        ) : (
                          <CircleDot size={10} strokeWidth={1.4} />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MatrixSummary events={sorted} />
    </StepShell>
  );
}

function MatrixSummary({ events }: { events: EventRecord[] }) {
  const smallest = [...events].sort((a, b) => a.guestCount - b.guestCount)[0];
  const largest = [...events].sort((a, b) => b.guestCount - a.guestCount)[0];
  if (!smallest || !largest) return null;
  if (smallest.id === largest.id) return null;
  return (
    <p className="mt-4 rounded-md border border-gold/20 bg-saffron-pale/20 px-4 py-3 text-[12.5px] text-ink-muted">
      <Sparkles size={11} strokeWidth={1.8} className="mr-1 inline text-saffron" />
      Your most intimate event is {displayNameFor(smallest)} ({smallest.guestCount} guests).
      Your biggest is {displayNameFor(largest)} ({largest.guestCount}).
    </p>
  );
}

// ── Step 5: location ────────────────────────────────────────────────────

const LOCATION_OPTIONS: { id: ProgramLocationType; label: string; hint: string }[] = [
  { id: "one_venue", label: "All at one venue", hint: "Destination or all-in-one property" },
  { id: "split_venues", label: "Split across a few venues", hint: "Ceremony at a temple, reception at a hotel, etc." },
  { id: "destination", label: "Destination wedding", hint: "A different city or country than where you live" },
  { id: "home_plus_venue", label: "Home events + venue events", hint: "Some at family homes, some at venues" },
  { id: "undecided", label: "Still figuring it out", hint: "We'll help you decide" },
];

function StepLocation() {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const setLocationType = useEventsStore((s) => s.setLocationType);
  const setDestinationLocation = useEventsStore((s) => s.setDestinationLocation);

  return (
    <StepShell
      eyebrow="Step 5"
      title="Where are you imagining these events?"
      hint="Not a venue search — that's the Venue workspace. This is about the frame."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {LOCATION_OPTIONS.map((opt) => {
          const active = coupleContext.locationType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLocationType(active ? null : opt.id)}
              aria-pressed={active}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/30 shadow-[0_0_0_2px_rgba(212,162,76,0.2)]"
                  : "border-border bg-white hover:border-gold/60",
              )}
            >
              <MapPin size={13} strokeWidth={1.8} className="text-ink-muted" />
              <p className="mt-2 text-[14px] font-medium text-ink">{opt.label}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">{opt.hint}</p>
            </button>
          );
        })}
      </div>

      {coupleContext.locationType === "destination" && (
        <div className="mt-5 rounded-md border border-border bg-ivory-warm/30 p-4">
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Where in the world?
          </label>
          <input
            value={coupleContext.destinationLocation}
            onChange={(e) => setDestinationLocation(e.target.value)}
            placeholder="Udaipur, Tuscany, Bali…"
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] text-ink outline-none focus:border-gold/60"
          />
        </div>
      )}
    </StepShell>
  );
}

// ── Step 6: energy arc ──────────────────────────────────────────────────

function StepEnergyArc() {
  const events = useEventsStore((s) => s.events);
  const setEnergyLevel = useEventsStore((s) => s.setEventEnergyLevel);
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  return (
    <StepShell
      eyebrow="Step 6"
      title="What's the overall energy arc?"
      hint="Drag each event up (full celebration) or down (intimate & quiet). Music, décor, and catering read this."
    >
      {sorted.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-6 text-center text-[13px] text-ink-muted">
          Pick some events first, then come back to set the arc.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink text-[13.5px]">
                  {displayNameFor(e)}
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {e.guestCount} guests
                </p>
              </div>
              <Flame
                size={13}
                strokeWidth={1.8}
                className={e.energyLevel >= 70 ? "text-saffron" : "text-ink-faint"}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={e.energyLevel}
                onChange={(ev) =>
                  setEnergyLevel(e.id, Number(ev.target.value))
                }
                aria-label="Energy level"
                className="h-2 w-48 cursor-pointer accent-saffron"
              />
              <span
                className="w-10 text-right font-mono text-[11px] tabular-nums text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {e.energyLevel}
              </span>
            </div>
          ))}
        </div>
      )}
    </StepShell>
  );
}

// ── Step 7: personality ────────────────────────────────────────────────

function StepPersonality() {
  const events = useEventsStore((s) => s.events);
  const setCustomNameTheme = useEventsStore((s) => s.setEventCustomNameTheme);
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  return (
    <StepShell
      eyebrow="Step 7"
      title="Give your events some personality"
      hint="Keep the defaults, or give each event a name that tells its own story."
    >
      {sorted.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-6 text-center text-[13px] text-ink-muted">
          Pick events first.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => {
            const theme = e.customTheme ?? e.vibeTheme ?? "";
            const name = displayNameFor(e);
            return (
              <div
                key={e.id}
                className="rounded-md border border-border bg-white p-4"
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ??
                    "Event"}
                </p>
                <input
                  value={name}
                  onChange={(ev) =>
                    setCustomNameTheme(e.id, ev.target.value, theme)
                  }
                  className="mt-1 w-full border-0 bg-transparent font-serif text-[22px] leading-tight text-ink outline-none"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  }}
                />
                <input
                  value={theme}
                  onChange={(ev) =>
                    setCustomNameTheme(e.id, name, ev.target.value)
                  }
                  placeholder="A one-line theme…"
                  className="mt-1 w-full border-0 bg-transparent text-[13px] italic text-ink-muted outline-none placeholder:text-ink-faint"
                />
              </div>
            );
          })}
        </div>
      )}
    </StepShell>
  );
}

// ── Step 8: summary + program brief ────────────────────────────────────

function StepSummary({
  onProgramBriefChange,
}: {
  onProgramBriefChange: (v: string) => void;
}) {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  const draft = useMemo(() => {
    const parts: string[] = [];
    if (sorted.length) {
      parts.push(
        `A ${sorted.length}-event wedding program — ${sorted
          .map((e) => displayNameFor(e))
          .join(", ")}.`,
      );
    }
    if (coupleContext.locationType === "destination" && coupleContext.destinationLocation) {
      parts.push(
        `Destination: ${coupleContext.destinationLocation}.`,
      );
    }
    const peak = sorted.reduce<EventRecord | null>(
      (a, b) => (!a || b.energyLevel > a.energyLevel ? b : a),
      null,
    );
    if (peak) {
      parts.push(
        `The energy peaks at ${displayNameFor(peak)} — this is where the celebration opens up.`,
      );
    }
    return parts.join(" ");
  }, [sorted, coupleContext]);

  // Persist the draft to programBrief as a starting point on mount-ish.
  // Callers may edit freely; Refine with AI on the Program view regenerates.
  useMemo(() => {
    if (draft && !coupleContext.programBrief.trim()) {
      onProgramBriefChange(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <StepShell
      eyebrow="Step 8"
      title="Your wedding program"
      hint="Here's what we heard. This flows into every workspace — save and start exploring each event."
    >
      <div className="space-y-4">
        <div className="rounded-md border border-ink/10 bg-ivory-warm/30 p-4">
          <p
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Your program
          </p>
          {sorted.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              No events added yet — skip forward to save.
            </p>
          ) : (
            <ol className="space-y-2">
              {sorted.map((e, i) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-ivory"
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] text-ink">
                    <span className="font-medium">{displayNameFor(e)}</span>
                    <span className="ml-2 text-[12px] text-ink-muted">
                      · {e.guestCount} guests · energy {e.energyLevel}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Your wedding story
          </label>
          <textarea
            value={coupleContext.programBrief}
            onChange={(e) => onProgramBriefChange(e.target.value)}
            rows={6}
            className="mt-1.5 w-full resize-y rounded-md border border-border bg-white p-3.5 font-serif text-[15px] leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          />
          <p className="mt-2 text-[11.5px] text-ink-faint">
            Photographers, decorators, caterers, and DJs will all read this as
            the anchor.
          </p>
        </div>
      </div>
    </StepShell>
  );
}

// ── Step shell ──────────────────────────────────────────────────────────

function StepShell({
  eyebrow,
  title,
  hint,
  children,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-6">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
        <h2
          className="mt-1.5 font-serif text-[28px] font-bold leading-tight text-ink"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          {title}
        </h2>
        {hint && (
          <p className="mt-1.5 max-w-2xl text-[13.5px] text-ink-muted">
            {hint}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
