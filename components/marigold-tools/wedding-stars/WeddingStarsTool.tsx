"use client";

// ──────────────────────────────────────────────────────────────────────────
// WeddingStarsTool — orchestrator.
//
// Stages: welcome → form → loading → report. Pure client tool. Birth
// details (when used) never leave the device — same posture as the Kundli
// Match tool. Result generation is synchronous; the loading stage is a
// designed 1.2s pause so the timeline reveal lands with weight.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useReducer, useRef } from "react";

import { buildBirthChart } from "@/lib/kundli";
import type { Rashi } from "@/types/kundli";
import { buildTimeline } from "@/lib/wedding-stars";
import type {
  EntryMethod,
  StarsResult,
  WeddingDateInput,
} from "@/types/wedding-stars";

import { EntryForm, type BirthDraft } from "./EntryForm";
import { Loading } from "./Loading";
import { Report } from "./Report";
import { Welcome } from "./Welcome";

import styles from "./WeddingStarsTool.module.css";

type Stage = "welcome" | "form" | "loading" | "report";

interface State {
  stage: Stage;
  method: EntryMethod;
  rashi: Rashi | null;
  birth: BirthDraft;
  weddingDate: WeddingDateInput;
  result: StarsResult | null;
  error: string | null;
}

const EMPTY_BIRTH: BirthDraft = {
  date: "",
  time: "",
  timeKnown: true,
  place: null,
};

const INITIAL: State = {
  stage: "welcome",
  method: "rashi",
  rashi: null,
  birth: { ...EMPTY_BIRTH },
  weddingDate: { kind: "open" },
  result: null,
  error: null,
};

type Action =
  | { type: "start" }
  | { type: "back_to_welcome" }
  | { type: "set_method"; method: EntryMethod }
  | { type: "set_rashi"; rashi: Rashi }
  | { type: "set_birth"; birth: BirthDraft }
  | { type: "set_wedding_date"; date: WeddingDateInput }
  | { type: "calc_started" }
  | { type: "calc_done"; result: StarsResult }
  | { type: "calc_failed"; error: string }
  | { type: "edit" }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...state, stage: "form" };
    case "back_to_welcome":
      return { ...state, stage: "welcome" };
    case "set_method":
      return { ...state, method: action.method };
    case "set_rashi":
      return { ...state, rashi: action.rashi };
    case "set_birth":
      return { ...state, birth: action.birth };
    case "set_wedding_date":
      return { ...state, weddingDate: action.date };
    case "calc_started":
      return { ...state, stage: "loading", error: null };
    case "calc_done":
      return { ...state, stage: "report", result: action.result };
    case "calc_failed":
      return { ...state, stage: "form", error: action.error };
    case "edit":
      return { ...state, stage: "form" };
    case "reset":
      return INITIAL;
    default:
      return state;
  }
}

export function WeddingStarsTool() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const calcTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    };
  }, []);

  function submit() {
    let resolvedRashi: Rashi | null = state.rashi;
    let resolvedFromBirth = false;

    if (state.method === "birth") {
      if (!state.birth.date || !state.birth.place) return;
      try {
        const chart = buildBirthChart({
          date: state.birth.date,
          time: state.birth.timeKnown ? state.birth.time : "",
          timeKnown: state.birth.timeKnown,
          place: {
            label: state.birth.place.label,
            lat: state.birth.place.lat,
            lng: state.birth.place.lng,
            tzOffsetHours: state.birth.place.tzOffsetHours,
          },
        });
        resolvedRashi = chart.rashi;
        resolvedFromBirth = true;
      } catch (err) {
        console.error("Birth chart calculation failed", err);
        dispatch({
          type: "calc_failed",
          error: "We couldn't read your birth details. Try the manual Moon sign picker instead.",
        });
        return;
      }
    }

    if (!resolvedRashi) return;

    dispatch({ type: "calc_started" });

    const rashi = resolvedRashi;
    const fromBirth = resolvedFromBirth;
    calcTimeoutRef.current = setTimeout(() => {
      try {
        const result = buildTimeline({
          rashi,
          weddingDate: state.weddingDate,
          resolvedFromBirth: fromBirth,
        });
        dispatch({ type: "calc_done", result });
      } catch (err) {
        console.error("Timeline build failed", err);
        dispatch({
          type: "calc_failed",
          error: "Something went wrong building your timeline. Try again?",
        });
      }
    }, 1200);
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {state.stage !== "welcome" && state.stage !== "report" && (
          <header className={styles.header}>
            <span className={styles.scrawl}>✦ wedding stars</span>
            <h1 className={styles.title}>
              Your <em>cosmic</em> calendar.
            </h1>
            <p className={styles.sub}>
              A personalized 12-month planning timeline based on planetary
              transits through your Moon sign.
            </p>
          </header>
        )}

        {state.error && state.stage === "form" && (
          <div className={styles.errorBanner} role="alert">
            {state.error}
          </div>
        )}

        <div className={styles.stage}>
          {state.stage === "welcome" && (
            <Welcome onStart={() => dispatch({ type: "start" })} />
          )}

          {state.stage === "form" && (
            <EntryForm
              method={state.method}
              rashi={state.rashi}
              birth={state.birth}
              weddingDate={state.weddingDate}
              onMethodChange={(m) => dispatch({ type: "set_method", method: m })}
              onRashiChange={(r) => dispatch({ type: "set_rashi", rashi: r })}
              onBirthChange={(b) => dispatch({ type: "set_birth", birth: b })}
              onWeddingDateChange={(d) =>
                dispatch({ type: "set_wedding_date", date: d })
              }
              onSubmit={submit}
              onBack={() => dispatch({ type: "back_to_welcome" })}
            />
          )}

          {state.stage === "loading" && <Loading />}

          {state.stage === "report" && state.result && (
            <Report
              result={state.result}
              onEdit={() => dispatch({ type: "edit" })}
              onReset={() => dispatch({ type: "reset" })}
            />
          )}
        </div>
      </div>
    </section>
  );
}
