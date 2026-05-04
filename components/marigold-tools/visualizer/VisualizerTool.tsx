"use client";

// ──────────────────────────────────────────────────────────────────────────
// VisualizerTool — orchestrator for the Wedding Weekend Visualizer.
//
// Two stages: input form → generated timeline. The user can flip back to
// edit inputs without losing the schedule. State persists to localStorage
// and to the URL hash so refreshes and shared links both rehydrate.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useReducer, useState } from "react";

import type {
  ScheduledEvent,
  TimelineDay,
  VisualizerInputs,
  VisualizerOutput,
} from "@/types/visualizer";
import {
  buildTimeline,
  decodeConfig,
  DEFAULT_EVENTS,
} from "@/lib/tools/visualizer";

import { InputForm } from "./InputForm";
import { Timeline } from "./Timeline";
import { CTAFooter } from "./CTAFooter";
import styles from "./VisualizerTool.module.css";

const STORAGE_KEY = "marigold:visualizer:state";

type Stage = "input" | "result";

interface State {
  stage: Stage;
  inputs: VisualizerInputs;
  // We keep the generated output in state so drag-reordering edits don't
  // re-run the whole scheduler — only the affected day's blocks shift.
  output: VisualizerOutput | null;
}

const INITIAL_INPUTS: VisualizerInputs = {
  format: "classic",
  style: "hindu_north",
  events: DEFAULT_EVENTS,
  days: 3,
  ceremonyTimePref: "morning_muhurat",
};

const INITIAL_STATE: State = {
  stage: "input",
  inputs: INITIAL_INPUTS,
  output: null,
};

type Action =
  | { type: "set_inputs"; inputs: VisualizerInputs }
  | { type: "generate" }
  | { type: "edit_inputs" }
  | { type: "update_day"; dayNumber: number; events: ScheduledEvent[] }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_inputs":
      return { ...state, inputs: action.inputs };
    case "generate":
      return {
        stage: "result",
        inputs: state.inputs,
        output: buildTimeline(state.inputs),
      };
    case "edit_inputs":
      return { ...state, stage: "input" };
    case "update_day": {
      if (!state.output) return state;
      const days: TimelineDay[] = state.output.days.map((d) =>
        d.dayNumber === action.dayNumber
          ? { ...d, events: action.events }
          : d,
      );
      return { ...state, output: { ...state.output, days } };
    }
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

export function VisualizerTool() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate: URL hash takes precedence (shared links), then localStorage.
  useEffect(() => {
    let initial: State | null = null;

    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const token = params.get("plan");
      if (token) {
        const decoded = decodeConfig(token);
        if (decoded) {
          initial = {
            stage: "result",
            inputs: decoded,
            output: buildTimeline(decoded),
          };
        }
      }
    }

    if (!initial) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const persisted = JSON.parse(raw) as State;
          if (persisted && persisted.inputs) {
            // Re-build output from inputs to keep it fresh; persisted blocks
            // would race with any drag-edits the user made before refresh.
            initial =
              persisted.stage === "result"
                ? {
                    stage: "result",
                    inputs: persisted.inputs,
                    output: buildTimeline(persisted.inputs),
                  }
                : { ...INITIAL_STATE, inputs: persisted.inputs };
          }
        }
      } catch {
        // ignore
      }
    }

    if (initial) dispatch({ type: "hydrate", state: initial });
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const eventCount = state.inputs.events.length;
  const subtitle = useMemo(() => {
    if (state.stage === "input") {
      return "Pick your events, pick your style. We'll show you how your weekend actually flows — hour by hour, outfit change by outfit change.";
    }
    return `${state.inputs.days}-day flow • ${eventCount} events • generated in your browser, no signup`;
  }, [state.stage, state.inputs.days, eventCount]);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.scrawl}>✿ the weekend visualizer</span>
          <h1 className={styles.title}>
            Your <em>whole weekend,</em>
            <br />
            before you plan a thing.
          </h1>
          <p className={styles.sub}>{subtitle}</p>
          {state.stage === "input" && (
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>No signup needed</span>
              <span className={styles.metaPill}>Culturally aware</span>
              <span className={styles.metaPill}>Multi-event</span>
            </div>
          )}
        </header>

        {state.stage === "input" && (
          <InputForm
            inputs={state.inputs}
            onChange={(inputs) => dispatch({ type: "set_inputs", inputs })}
            onGenerate={() => dispatch({ type: "generate" })}
          />
        )}

        {state.stage === "result" && state.output && (
          <>
            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => dispatch({ type: "edit_inputs" })}
              >
                ← edit your plan
              </button>
              <span className={styles.toolbarHint}>
                drag events to reorder · tap for details
              </span>
            </div>

            <Timeline
              output={state.output}
              onUpdateDay={(dayNumber, events) =>
                dispatch({ type: "update_day", dayNumber, events })
              }
            />

            <CTAFooter inputs={state.inputs} output={state.output} />
          </>
        )}
      </div>
    </section>
  );
}
