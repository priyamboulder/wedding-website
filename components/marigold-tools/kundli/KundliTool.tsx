"use client";

// ──────────────────────────────────────────────────────────────────────────
// KundliTool — orchestrator.
//
// Stages: welcome → form → loading → report. State lives in a useReducer.
// Calculation is instant; the loading stage is a designed 1.5s pause that
// gives the reveal weight. Nothing is persisted — birth details are
// privacy-sensitive, so the tool stays purely in-memory.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useReducer, useRef } from "react";

import { buildBirthChart, calculateMatch, resolveByNameSyllable } from "@/lib/kundli";
import type { BirthInput, MatchResult } from "@/types/kundli";

import { EntryForm, type MatchMethod } from "./EntryForm";
import { Loading } from "./Loading";
import type { PartnerDraft } from "./PartnerForm";
import { Report } from "./Report";
import { Welcome } from "./Welcome";

import styles from "./KundliTool.module.css";

type Stage = "welcome" | "form" | "loading" | "report";

interface State {
  stage: Stage;
  method: MatchMethod;
  partnerA: PartnerDraft;
  partnerB: PartnerDraft;
  result: MatchResult | null;
}

const EMPTY_PARTNER: PartnerDraft = {
  name: "",
  date: "",
  time: "",
  timeKnown: true,
  place: null,
};

const INITIAL: State = {
  stage: "welcome",
  method: "birth",
  partnerA: { ...EMPTY_PARTNER },
  partnerB: { ...EMPTY_PARTNER },
  result: null,
};

type Action =
  | { type: "start" }
  | { type: "back_to_welcome" }
  | { type: "set_method"; method: MatchMethod }
  | { type: "set_a"; v: PartnerDraft }
  | { type: "set_b"; v: PartnerDraft }
  | { type: "calc_started" }
  | { type: "calc_done"; result: MatchResult }
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
    case "set_a":
      return { ...state, partnerA: action.v };
    case "set_b":
      return { ...state, partnerB: action.v };
    case "calc_started":
      return { ...state, stage: "loading" };
    case "calc_done":
      return { ...state, stage: "report", result: action.result };
    case "edit":
      return { ...state, stage: "form" };
    case "reset":
      return INITIAL;
    default:
      return state;
  }
}

function draftToBirthInput(d: PartnerDraft, method: MatchMethod): BirthInput | null {
  if (method === "name") {
    if (!d.name.trim()) return null;
    return {
      name: d.name,
      date: "",
      time: "",
      timeKnown: false,
      // place is required by the type; we use a neutral default since
      // name-only matching ignores location.
      place: { label: "", lat: 0, lng: 0, tzOffsetHours: 0 },
      nameSyllable: d.name.trim(),
    };
  }
  if (!d.date || !d.place) return null;
  return {
    name: d.name,
    date: d.date,
    time: d.timeKnown ? d.time : "",
    timeKnown: d.timeKnown,
    place: {
      label: d.place.label,
      lat: d.place.lat,
      lng: d.place.lng,
      tzOffsetHours: d.place.tzOffsetHours,
    },
  };
}

export function KundliTool() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const calcTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    };
  }, []);

  function submit() {
    const aInput = draftToBirthInput(state.partnerA, state.method);
    const bInput = draftToBirthInput(state.partnerB, state.method);
    if (!aInput || !bInput) return;

    dispatch({ type: "calc_started" });

    calcTimeoutRef.current = setTimeout(() => {
      try {
        const aChart =
          state.method === "name"
            ? resolveByNameSyllable(aInput.nameSyllable!)!
            : buildBirthChart(aInput);
        const bChart =
          state.method === "name"
            ? resolveByNameSyllable(bInput.nameSyllable!)!
            : buildBirthChart(bInput);
        const result = calculateMatch(
          aChart,
          bChart,
          state.partnerA.name,
          state.partnerB.name,
        );
        dispatch({ type: "calc_done", result });
      } catch (err) {
        // If something breaks, return to the form. We don't store any
        // state-diagnostic detail because birth details are sensitive.
        console.error("Kundli calculation failed", err);
        dispatch({ type: "edit" });
      }
    }, 1500);
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {state.stage !== "welcome" && state.stage !== "report" && (
          <header className={styles.header}>
            <span className={styles.scrawl}>✦ kundli match</span>
            <h1 className={styles.title}>
              Do your <em>stars</em> align?
            </h1>
            <p className={styles.sub}>
              The Ashtakoota report your family wants — translated for both
              audiences. Your birth details never leave this device.
            </p>
          </header>
        )}

        <div className={styles.stage}>
          {state.stage === "welcome" && (
            <Welcome onStart={() => dispatch({ type: "start" })} />
          )}

          {state.stage === "form" && (
            <EntryForm
              partnerA={state.partnerA}
              partnerB={state.partnerB}
              method={state.method}
              onChangeA={(v) => dispatch({ type: "set_a", v })}
              onChangeB={(v) => dispatch({ type: "set_b", v })}
              onChangeMethod={(m) => dispatch({ type: "set_method", method: m })}
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
