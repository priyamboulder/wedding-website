"use client";

// ── Tab 1 — Plan & Details ────────────────────────────────────────────────
// Two blocks: Event Basics (name, date, time, location, host, purpose) and
// Vibe Setting (formality slider, dress code, activities). Every field is
// plain localStorage-backed state, no AI calls.

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useWelcomeEventsStore } from "@/stores/welcome-events-store";
import {
  ACTIVITY_OPTIONS,
  DRESS_CODE_OPTIONS,
  HOST_OPTIONS,
  PURPOSE_OPTIONS,
} from "@/lib/welcome-events-seed";
import {
  ChipToggle,
  Field,
  IconButton,
  RadioRow,
  SectionIntro,
  SectionLabel,
  SectionTitle,
  Select,
  TextInput,
  Textarea,
} from "../shared";
import type { DressCodeLevel } from "@/types/welcome-events";

const FORMALITY_ANCHORS = [
  { at: 0, label: "Very casual" },
  { at: 100, label: "Formal dinner" },
];

export function PlanDetailsTab() {
  const basics = useWelcomeEventsStore((s) => s.basics);
  const vibe = useWelcomeEventsStore((s) => s.vibe);
  const updateBasics = useWelcomeEventsStore((s) => s.updateBasics);
  const togglePurpose = useWelcomeEventsStore((s) => s.togglePurpose);
  const updateVibe = useWelcomeEventsStore((s) => s.updateVibe);
  const toggleActivity = useWelcomeEventsStore((s) => s.toggleActivity);
  const addCustomActivity = useWelcomeEventsStore((s) => s.addCustomActivity);
  const removeCustomActivity = useWelcomeEventsStore(
    (s) => s.removeCustomActivity,
  );

  const [newActivity, setNewActivity] = useState("");

  return (
    <div className="flex flex-col gap-14 py-10">
      <section>
        <SectionLabel>Your welcome event</SectionLabel>
        <SectionTitle>The details</SectionTitle>
        <SectionIntro>
          A casual gathering to welcome guests and let both families meet
          before the wedding week begins.
        </SectionIntro>

        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
          <Field label="Event name">
            <TextInput
              value={basics.name}
              onChange={(e) => updateBasics({ name: e.target.value })}
              placeholder="Welcome Dinner / Meet & Greet / Garba Night"
            />
          </Field>
          <Field label="Date">
            <TextInput
              value={basics.date}
              onChange={(e) => updateBasics({ date: e.target.value })}
              placeholder="Thursday, April 9, 2026"
            />
          </Field>
          <Field label="Start time">
            <TextInput
              value={basics.timeStart}
              onChange={(e) => updateBasics({ timeStart: e.target.value })}
              placeholder="6:00 PM"
            />
          </Field>
          <Field label="End time">
            <TextInput
              value={basics.timeEnd}
              onChange={(e) => updateBasics({ timeEnd: e.target.value })}
              placeholder="9:00 PM"
            />
          </Field>
          <Field label="Location" className="md:col-span-2">
            <TextInput
              value={basics.location}
              onChange={(e) => updateBasics({ location: e.target.value })}
              placeholder="Marriott rooftop terrace"
            />
          </Field>
          <Field label="Guest count">
            <TextInput
              type="number"
              min={0}
              value={basics.guestCount}
              onChange={(e) =>
                updateBasics({ guestCount: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Host">
            <Select
              value={basics.host}
              onChange={(e) =>
                updateBasics({ host: e.target.value as typeof basics.host })
              }
            >
              {HOST_OPTIONS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-10">
          <SectionLabel>Purpose</SectionLabel>
          <p className="mt-1 text-[13px] text-ink-muted">
            Pick everything that fits — the event often serves a few roles at
            once.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PURPOSE_OPTIONS.map((p) => (
              <ChipToggle
                key={p.value}
                active={basics.purposes.includes(p.value)}
                onClick={() => togglePurpose(p.value)}
              >
                {p.label}
              </ChipToggle>
            ))}
          </div>
          <div className="mt-4 max-w-md">
            <Field label="Custom purpose">
              <TextInput
                value={basics.customPurpose}
                onChange={(e) =>
                  updateBasics({ customPurpose: e.target.value })
                }
                placeholder="Anything else this event is for"
              />
            </Field>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Vibe setting</SectionLabel>
        <SectionTitle>What's the tone?</SectionTitle>
        <SectionIntro>
          The dial matters more than the venue — casual mixers and formal
          dinners take very different planning.
        </SectionIntro>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
          <div>
            <SectionLabel>Formality</SectionLabel>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-[12px] text-ink-muted">
                {FORMALITY_ANCHORS[0].label}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={vibe.formality}
                onChange={(e) =>
                  updateVibe({ formality: Number(e.target.value) })
                }
                className="flex-1 accent-[color:var(--color-gold)]"
              />
              <span className="text-[12px] text-ink-muted">
                {FORMALITY_ANCHORS[1].label}
              </span>
            </div>
            <Textarea
              className="mt-4"
              rows={2}
              value={vibe.formalityNote}
              onChange={(e) => updateVibe({ formalityNote: e.target.value })}
              placeholder="No assigned seats, finger food, mingling"
            />
          </div>

          <Field label="Dress code">
            <RadioRow<DressCodeLevel>
              value={vibe.dressCode}
              options={DRESS_CODE_OPTIONS}
              onChange={(dressCode) => updateVibe({ dressCode })}
            />
          </Field>
        </div>

        <div className="mt-10">
          <SectionLabel>Activities</SectionLabel>
          <p className="mt-1 text-[13px] text-ink-muted">
            Most welcome events stay simple. Pick only what earns its keep.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {ACTIVITY_OPTIONS.map((a) => (
              <ChipToggle
                key={a}
                active={vibe.activities.includes(a)}
                onClick={() => toggleActivity(a)}
              >
                {a}
              </ChipToggle>
            ))}
            {vibe.customActivities.map((a, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-1.5 text-[13px] text-ink"
              >
                <span>{a}</span>
                <IconButton
                  onClick={() => removeCustomActivity(idx)}
                  ariaLabel={`Remove ${a}`}
                >
                  <X size={14} />
                </IconButton>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <TextInput
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Custom activity"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newActivity.trim()) {
                  addCustomActivity(newActivity.trim());
                  setNewActivity("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!newActivity.trim()) return;
                addCustomActivity(newActivity.trim());
                setNewActivity("");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-2 text-[13px] text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
            >
              <Plus size={14} strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
