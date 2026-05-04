"use client";

// ──────────────────────────────────────────────────────────────────────────
// MatchTool — single-page conversational matcher.
//
// The whole flow is held in one client orchestrator: five question screens
// followed by a results spread. State lives in a single useReducer and is
// mirrored to localStorage so a refresh mid-flow doesn't dump the user back
// to step 1.
//
// Scoring is pure (lib/match/scoring.ts) and runs in the browser the moment
// the user lands on the results step — no server round-trip needed.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useReducer, useState } from "react";

import {
  ensureMatchToken,
  rankMatches,
  type MatchableLocation,
} from "@/lib/match";
import type {
  DealbreakerSlug,
  MatchInputs,
  MatchedDestination,
  PrioritySlug,
} from "@/types/match";

import { StepBudget } from "./StepBudget";
import { StepGuests } from "./StepGuests";
import { StepPriorities } from "./StepPriorities";
import { StepDealbreakers } from "./StepDealbreakers";
import { ResultsView } from "./ResultsView";
import { ProgressDots } from "./ProgressDots";
import styles from "./MatchTool.module.css";

const STORAGE_KEY = "marigold:match:state";
const STEP_COUNT = 4;

type Step = 0 | 1 | 2 | 3 | 4; // 0..3 = questions, 4 = results

interface State {
  step: Step;
  inputs: MatchInputs;
}

const INITIAL_STATE: State = {
  step: 0,
  inputs: {
    budget: 250_000,
    guests: 300,
    priorities: [],
    dealbreakers: [],
  },
};

type Action =
  | { type: "advance" }
  | { type: "back" }
  | { type: "go"; step: Step }
  | { type: "set_budget"; value: number }
  | { type: "set_guests"; value: number }
  | { type: "toggle_priority"; value: PrioritySlug }
  | { type: "toggle_dealbreaker"; value: DealbreakerSlug }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "advance":
      return { ...state, step: Math.min(state.step + 1, STEP_COUNT) as Step };
    case "back":
      return { ...state, step: Math.max(state.step - 1, 0) as Step };
    case "go":
      return { ...state, step: action.step };
    case "set_budget":
      return { ...state, inputs: { ...state.inputs, budget: action.value } };
    case "set_guests":
      return { ...state, inputs: { ...state.inputs, guests: action.value } };
    case "toggle_priority": {
      const current = state.inputs.priorities;
      const next = current.includes(action.value)
        ? current.filter((p) => p !== action.value)
        : current.length >= 3
          ? current
          : [...current, action.value];
      return { ...state, inputs: { ...state.inputs, priorities: next } };
    }
    case "toggle_dealbreaker": {
      const current = state.inputs.dealbreakers;
      const next = current.includes(action.value)
        ? current.filter((d) => d !== action.value)
        : [...current, action.value];
      return { ...state, inputs: { ...state.inputs, dealbreakers: next } };
    }
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

export type MatchToolProps = {
  locations: MatchableLocation[];
};

export function MatchTool({ locations }: MatchToolProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate from localStorage so a mid-flow refresh doesn't blow away
  // their answers.
  useEffect(() => {
    setToken(ensureMatchToken());
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted = JSON.parse(raw) as State;
        if (persisted && typeof persisted.step === "number") {
          dispatch({ type: "hydrate", state: persisted });
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  // Compute matches lazily — only when we land on the results step. Any
  // time before that, the result list is irrelevant and re-running the
  // scorer on every priority toggle is wasted work.
  const matches: MatchedDestination[] = useMemo(() => {
    if (state.step !== 4) return [];
    return rankMatches(locations, state.inputs);
  }, [locations, state.inputs, state.step]);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.scrawl}>✿ the reverse search</span>
          <h1 className={styles.title}>
            Match <em>Me</em>
          </h1>
          <p className={styles.sub}>
            Tell us what you have. We'll tell you where you can go — top to
            bottom, with reasons.
          </p>
        </header>

        {state.step < 4 && (
          <ProgressDots
            current={state.step}
            total={STEP_COUNT}
            onJump={(step) => dispatch({ type: "go", step: step as Step })}
          />
        )}

        <div className={styles.stage}>
          {state.step === 0 && (
            <StepBudget
              value={state.inputs.budget}
              onChange={(v) => dispatch({ type: "set_budget", value: v })}
              onNext={() => dispatch({ type: "advance" })}
            />
          )}
          {state.step === 1 && (
            <StepGuests
              value={state.inputs.guests}
              onChange={(v) => dispatch({ type: "set_guests", value: v })}
              onNext={() => dispatch({ type: "advance" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}
          {state.step === 2 && (
            <StepPriorities
              value={state.inputs.priorities}
              onToggle={(p) => dispatch({ type: "toggle_priority", value: p })}
              onNext={() => dispatch({ type: "advance" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}
          {state.step === 3 && (
            <StepDealbreakers
              value={state.inputs.dealbreakers}
              onToggle={(d) =>
                dispatch({ type: "toggle_dealbreaker", value: d })
              }
              onNext={() => dispatch({ type: "advance" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}
          {state.step === 4 && (
            <ResultsView
              inputs={state.inputs}
              matches={matches}
              anonymousToken={token}
              onRestart={() => {
                dispatch({ type: "reset" });
              }}
              onEditInputs={() => dispatch({ type: "go", step: 0 })}
            />
          )}
        </div>
      </div>
    </section>
  );
}
