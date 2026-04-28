"use client";

// ── Events / Guest feel tab (rebuild) ────────────────────────────────────
// What guests EXPERIENCE at this event. Structured as a guest journey —
// arrival → peak → departure — followed by sensory design (smell, sound,
// lighting, temperature), hospitality ideas, and a brief that rolls
// everything up for the decorator / planner / venue team.

import { useMemo } from "react";
import {
  DoorOpen, DoorClosed, Ear, Flame, Heart, LucideIcon, Music,
  Sparkles, Thermometer, Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import {
  getHospitalityIdeasFor,
  type HospitalityIdea,
} from "@/lib/events/hospitality-seed";
import type { EventRecord } from "@/types/events";
import { BriefTextareaBlock } from "@/components/workspace/shared/BriefTextareaBlock";
import {
  SectionHead,
  SectionShell,
} from "@/components/workspace/shared/SectionHead";

export function GuestFeelTab({ event }: { event: EventRecord }) {
  const setArrival = useEventsStore((s) => s.setEventArrivalFeel);
  const setPeak = useEventsStore((s) => s.setEventPeakMoment);
  const setDeparture = useEventsStore((s) => s.setEventDepartureFeel);
  const setSensory = useEventsStore((s) => s.setEventSensory);
  const toggleHospitality = useEventsStore((s) => s.toggleHospitalityIdea);
  const setCustomHospitality = useEventsStore(
    (s) => s.setCustomHospitalityIdeas,
  );
  const setGuestFeelBrief = useEventsStore((s) => s.setEventGuestFeelBrief);
  const setCulturalNotes = useEventsStore((s) => s.setEventCulturalNotes);

  const ideas = useMemo(
    () => getHospitalityIdeasFor(event.type),
    [event.type],
  );

  return (
    <div className="space-y-11">
      <SectionShell>
        <SectionHead
          eyebrow="The guest journey"
          title="Arrival · peak · departure"
          hint="Walk through the guest experience chronologically. The more specific, the better the planner's handoff."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <JourneyStep
            icon={DoorOpen}
            label="Arrival"
            value={event.arrivalFeel}
            onChange={(v) => setArrival(event.id, v)}
            placeholder="Flower garlands at the gate, welcome drink, live sitar, the scent of incense…"
          />
          <JourneyStep
            icon={Heart}
            label="Peak moment"
            value={event.peakMoment}
            onChange={(v) => setPeak(event.id, v)}
            placeholder="First dance, a choreographed performance, a surprise guest, fireworks…"
          />
          <JourneyStep
            icon={DoorClosed}
            label="Departure"
            value={event.departureFeel}
            onChange={(v) => setDeparture(event.id, v)}
            placeholder="Sparkler exit, favour bag, late-night snack station, afterparty invite…"
          />
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Sensory design"
          title="Smell · sound · light · comfort"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SensoryField
            icon={Wind}
            label="Smell"
            hint="Fresh flowers · Incense · Candles · Food aromas · Neutral"
            value={event.sensorySmell}
            onChange={(v) => setSensory(event.id, { sensorySmell: v })}
          />
          <SensoryField
            icon={Ear}
            label="Sound between songs"
            hint="Conversation · Water features · Nature · Silence"
            value={event.sensorySound}
            onChange={(v) => setSensory(event.id, { sensorySound: v })}
          />
          <SensoryField
            icon={Flame}
            label="Lighting"
            hint="Warm & golden · Bright · Dramatic · Candlelit · Daylight"
            value={event.sensoryLighting}
            onChange={(v) => setSensory(event.id, { sensoryLighting: v })}
          />
          <SensoryField
            icon={Thermometer}
            label="Temperature & comfort"
            hint="Outdoor heaters · Climate-controlled · Fire pits · Pashminas"
            value={event.sensoryTemperature}
            onChange={(v) => setSensory(event.id, { sensoryTemperature: v })}
          />
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Hospitality moments"
          title="Thoughtful touches that make guests feel held"
          right={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-ivory-warm px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-gold hover:text-saffron"
            >
              <Sparkles size={12} strokeWidth={1.8} />
              Suggest more
            </button>
          }
        />
        {ideas.length === 0 ? (
          <p className="text-[12.5px] text-ink-muted">
            No ready-made suggestions for this event yet — add your own below.
          </p>
        ) : (
          <HospitalityGrid
            ideas={ideas}
            lovedIds={event.lovedHospitalityIds ?? []}
            onToggle={(id) => toggleHospitality(event.id, id)}
          />
        )}
        <OwnIdeas
          items={event.customHospitalityIdeas ?? []}
          onChange={(next) => setCustomHospitality(event.id, next)}
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="For the planner, decorator, venue coordinator"
          title="Guest experience brief"
          hint="The full picture — this is what the operations team reads on the day."
        />
        <BriefTextareaBlock
          variant="flat"
          title="Guest experience brief"
          value={event.guestFeelBrief}
          onChange={(v) => setGuestFeelBrief(event.id, v)}
          placeholder="The mandap courtyard fills with jasmine and tuberose. Guests are greeted with kokum coolers and shepherded to assigned cushions. My grandmother leads the aarti…"
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Cultural & family notes"
          title="Traditions, sensitivities, special roles"
          hint="Traditions that must be honoured, family members with special roles, sensitivities to flag."
        />
        <BriefTextareaBlock
          variant="flat"
          title="Cultural & family notes"
          value={event.culturalNotes}
          onChange={(v) => setCulturalNotes(event.id, v)}
          placeholder="Grandfather leads the aarti. No onions or garlic in the menu. Bride's grandmother prefers to be seated for long periods…"
          minHeight={110}
        />
      </SectionShell>
    </div>
  );
}

function JourneyStep({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="rounded-md border border-border bg-ivory-warm/30 p-4">
      <div className="mb-2 inline-flex items-center gap-1.5 text-ink-muted">
        <Icon size={13} strokeWidth={1.8} />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
      />
    </div>
  );
}

function SensoryField({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-ivory-warm/30 p-4">
      <div className="mb-1 inline-flex items-center gap-1.5 text-ink-muted">
        <Icon size={13} strokeWidth={1.8} />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>
      <p className="mb-2 text-[11.5px] text-ink-faint">{hint}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What should this feel like?"
        className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink outline-none focus:border-gold/60"
      />
    </div>
  );
}

function HospitalityGrid({
  ideas,
  lovedIds,
  onToggle,
}: {
  ideas: HospitalityIdea[];
  lovedIds: string[];
  onToggle: (id: string) => void;
}) {
  // Group ideas by stage — arrival / during / departure — so the grid tells
  // the same arc as the guest journey above it.
  const groups = useMemo(() => {
    const g: Record<HospitalityIdea["stage"], HospitalityIdea[]> = {
      arrival: [],
      during: [],
      departure: [],
    };
    for (const i of ideas) g[i.stage].push(i);
    return g;
  }, [ideas]);

  const STAGES: {
    key: HospitalityIdea["stage"];
    label: string;
  }[] = [
    { key: "arrival", label: "Arrival" },
    { key: "during", label: "During" },
    { key: "departure", label: "Departure" },
  ];

  return (
    <div className="space-y-4">
      {STAGES.map((stage) => {
        const items = groups[stage.key];
        if (items.length === 0) return null;
        return (
          <div key={stage.key}>
            <p
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {stage.label}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((i) => {
                const loved = lovedIds.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => onToggle(i.id)}
                    aria-pressed={loved}
                    className={cn(
                      "group flex flex-col rounded-md border p-3 text-left transition-colors",
                      loved
                        ? "border-saffron bg-saffron-pale/30"
                        : "border-border bg-white hover:border-gold/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-ink">
                        {i.title}
                      </p>
                      <Heart
                        size={12}
                        strokeWidth={1.8}
                        className={cn(
                          "mt-0.5 shrink-0 transition-colors",
                          loved
                            ? "fill-saffron text-saffron"
                            : "text-ink-faint opacity-0 group-hover:opacity-100",
                        )}
                      />
                    </div>
                    <p className="mt-1 text-[12px] leading-snug text-ink-muted">
                      {i.blurb}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OwnIdeas({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <p
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your own ideas
      </p>
      <InlineList items={items} onChange={onChange} placeholder="e.g. mithai trolley at midnight" />
    </div>
  );
}

function InlineList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  // Paste a line, press enter, it's added. Keep simple so we don't re-import
  // the full WantAvoid primitive for a single list.
  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-2 space-y-1.5" role="list">
          {items.map((t, i) => (
            <li
              key={`${t}-${i}`}
              className="flex items-start gap-2 rounded-md border border-border bg-ivory-warm/30 px-2.5 py-1.5 text-[13px] text-ink"
            >
              <Heart size={11} strokeWidth={1.8} className="mt-0.5 shrink-0 text-saffron" />
              <span className="flex-1">{t}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${t}`}
                className="shrink-0 text-ink-faint hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const el = form.elements.namedItem("hosp") as HTMLInputElement;
          const v = el.value.trim();
          if (!v || items.includes(v)) {
            el.value = "";
            return;
          }
          onChange([...items, v]);
          el.value = "";
        }}
      >
        <input
          name="hosp"
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink outline-none focus:border-gold/60"
        />
      </form>
    </div>
  );
}
