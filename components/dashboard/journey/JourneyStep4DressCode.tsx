"use client";

// ── Journey Step 4 · Set the dress code ─────────────────────────────────
//
// One row per event the couple created in Step 2. Each row lets them
// pick a dress-code style, a guest color guidance, and write a freeform
// note (e.g. "Ladies — lehenga or saree preferred"). Saved to the
// journey store and surfaced in save-the-dates / invitations later.

import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import {
  DRESS_CODE_STYLES,
  DRESS_CODE_COLOR_GUIDANCE,
  EMPTY_DRESS_CODE,
  type DressCodeStyle,
  type DressCodeColorGuidance,
} from "@/lib/journey/dress-code-options";
import type { EventRecord } from "@/types/events";
import { cn } from "@/lib/utils";

interface Step4Props {
  done: boolean;
  active: boolean;
}

function eventName(e: EventRecord): string {
  return (
    e.customName?.trim() ||
    e.vibeEventName?.trim() ||
    EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ||
    e.type
  );
}

export function JourneyStep4DressCode({ done, active }: Step4Props) {
  const events = useEventsStore((s) => s.events);
  const dressCodes = useDashboardJourneyStore((s) => s.dressCodes);
  const setDressCode = useDashboardJourneyStore((s) => s.setDressCode);

  // Done collapsed
  if (done && !active) {
    const set = events.filter((e) => dressCodes[e.id]?.style).length;
    return (
      <p className="text-[13.5px] text-[color:var(--dash-text)]">
        {set} of {events.length} event{events.length === 1 ? "" : "s"} have a
        dress code set
      </p>
    );
  }

  // Empty (no events yet)
  if (events.length === 0) {
    return (
      <div className="space-y-2">
        <p
          className="font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Add your celebrations in Step 2 first — then come back to dress them
          up.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p
        className="font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        Help your guests show up right. Set the dress code for each event —
        guests will see this on save-the-dates and invitations.
      </p>

      <ul className="flex flex-col gap-3">
        {events.map((event) => {
          const code = dressCodes[event.id] ?? EMPTY_DRESS_CODE;
          return (
            <li
              key={event.id}
              className="rounded-[6px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] p-3"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h4
                  className="font-serif text-[16px] italic leading-tight text-[color:var(--dash-text)]"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    fontWeight: 500,
                  }}
                >
                  {eventName(event)}
                </h4>
                <span
                  className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--dash-text-faint)]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  {EVENT_TYPE_OPTIONS.find((o) => o.id === event.type)?.name ??
                    event.type}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Style">
                  <select
                    value={code.style ?? ""}
                    onChange={(e) =>
                      setDressCode(event.id, {
                        style: (e.target.value || null) as DressCodeStyle | null,
                      })
                    }
                    className="dash-input text-[13px]"
                  >
                    <option value="">— Pick —</option>
                    {DRESS_CODE_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Color guidance">
                  <select
                    value={code.colorGuidance ?? ""}
                    onChange={(e) =>
                      setDressCode(event.id, {
                        colorGuidance: (e.target.value || null) as
                          | DressCodeColorGuidance
                          | null,
                      })
                    }
                    className="dash-input text-[13px]"
                  >
                    <option value="">— Optional —</option>
                    {DRESS_CODE_COLOR_GUIDANCE.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-2 flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1.5 w-14 shrink-0 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]",
                  )}
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  Notes
                </span>
                <input
                  type="text"
                  defaultValue={code.notes}
                  onBlur={(e) =>
                    setDressCode(event.id, { notes: e.target.value })
                  }
                  placeholder='e.g. "Ladies — lehenga or saree preferred"'
                  className="dash-input flex-1 text-[12.5px] italic"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
        style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
