"use client";

// ──────────────────────────────────────────────────────────────────────────
// ReadyTool — orchestrator for "Am I Ready?".
//
// Stages: welcome → 8 questions → results. State lives in a single
// useReducer; persistence to localStorage and to the URL hash means a
// refresh or a shared link rehydrates without rerunning the flow.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";

import type {
  AssessmentAnswer,
  AttireStatus,
  BudgetStatus,
  EventScope,
  FamilyAlignmentStatus,
  GuestListStatus,
  TimelineOption,
  VendorCategory,
  VenueStatus,
} from "@/types/readiness";
import { decodeAnswers, evaluateReadiness } from "@/lib/readiness";

import { Welcome } from "./Welcome";
import { Progress } from "./Progress";
import { Results } from "./Results";
import { SingleSelectStep, MultiSelectStep } from "./QuestionStep";
import {
  ATTIRE_OPTIONS,
  BUDGET_OPTIONS,
  FAMILY_OPTIONS,
  GUEST_OPTIONS,
  SCOPE_OPTIONS,
  TIMELINE_OPTIONS,
  VENDOR_OPTIONS,
  VENUE_OPTIONS,
} from "./questions";
import styles from "./ReadyTool.module.css";
import welcomeStyles from "./Welcome.module.css";

const STORAGE_KEY = "marigold:readiness:state";
const TOTAL_QUESTIONS = 8;

type Stage = "welcome" | "questions" | "results" | "exit-already-happened";

interface AnswerDraft {
  timeline: TimelineOption | null;
  venue: VenueStatus | null;
  budget: BudgetStatus | null;
  eventScope: EventScope | null;
  vendorsBooked: VendorCategory[];
  guestList: GuestListStatus | null;
  attire: AttireStatus | null;
  familyAlignment: FamilyAlignmentStatus | null;
}

interface State {
  stage: Stage;
  step: number; // 0..7
  draft: AnswerDraft;
}

const INITIAL_STATE: State = {
  stage: "welcome",
  step: 0,
  draft: {
    timeline: null,
    venue: null,
    budget: null,
    eventScope: null,
    vendorsBooked: [],
    guestList: null,
    attire: null,
    familyAlignment: null,
  },
};

type Action =
  | { type: "start" }
  | { type: "advance" }
  | { type: "back" }
  | { type: "go"; step: number }
  | { type: "set_timeline"; v: TimelineOption }
  | { type: "set_venue"; v: VenueStatus }
  | { type: "set_budget"; v: BudgetStatus }
  | { type: "set_scope"; v: EventScope }
  | { type: "toggle_vendor"; v: VendorCategory }
  | { type: "set_guest"; v: GuestListStatus }
  | { type: "set_attire"; v: AttireStatus }
  | { type: "set_family"; v: FamilyAlignmentStatus }
  | { type: "show_results" }
  | { type: "edit_answers" }
  | { type: "exit_already" }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...state, stage: "questions", step: 0 };
    case "advance":
      return {
        ...state,
        step: Math.min(state.step + 1, TOTAL_QUESTIONS - 1),
      };
    case "back":
      return { ...state, step: Math.max(0, state.step - 1) };
    case "go":
      return { ...state, step: action.step };
    case "set_timeline":
      // Special case: "already-happened" routes to graceful exit.
      if (action.v === "already-happened") {
        return {
          ...state,
          draft: { ...state.draft, timeline: action.v },
          stage: "exit-already-happened",
        };
      }
      return { ...state, draft: { ...state.draft, timeline: action.v } };
    case "set_venue":
      return { ...state, draft: { ...state.draft, venue: action.v } };
    case "set_budget":
      return { ...state, draft: { ...state.draft, budget: action.v } };
    case "set_scope":
      return { ...state, draft: { ...state.draft, eventScope: action.v } };
    case "toggle_vendor": {
      const cur = state.draft.vendorsBooked;
      let next: VendorCategory[];
      if (action.v === "none") {
        next = cur.includes("none") ? [] : ["none"];
      } else {
        const filtered = cur.filter((v) => v !== "none");
        next = filtered.includes(action.v)
          ? filtered.filter((v) => v !== action.v)
          : [...filtered, action.v];
      }
      return { ...state, draft: { ...state.draft, vendorsBooked: next } };
    }
    case "set_guest":
      return { ...state, draft: { ...state.draft, guestList: action.v } };
    case "set_attire":
      return { ...state, draft: { ...state.draft, attire: action.v } };
    case "set_family":
      return { ...state, draft: { ...state.draft, familyAlignment: action.v } };
    case "show_results":
      return { ...state, stage: "results" };
    case "edit_answers":
      return { ...state, stage: "questions", step: 0 };
    case "exit_already":
      return { ...state, stage: "exit-already-happened" };
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

function isComplete(d: AnswerDraft): d is AnswerDraft & AssessmentAnswer {
  return (
    d.timeline !== null &&
    d.venue !== null &&
    d.budget !== null &&
    d.eventScope !== null &&
    d.guestList !== null &&
    d.attire !== null &&
    d.familyAlignment !== null
  );
}

function draftToAnswers(d: AnswerDraft): AssessmentAnswer {
  // Caller must have verified isComplete first.
  return {
    timeline: d.timeline as TimelineOption,
    venue: d.venue as VenueStatus,
    budget: d.budget as BudgetStatus,
    eventScope: d.eventScope as EventScope,
    vendorsBooked: d.vendorsBooked,
    guestList: d.guestList as GuestListStatus,
    attire: d.attire as AttireStatus,
    familyAlignment: d.familyAlignment as FamilyAlignmentStatus,
  };
}

export function ReadyTool() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from URL hash first (shared links), then localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let initial: State | null = null;

    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const token = params.get("a");
      if (token) {
        const decoded = decodeAnswers(token);
        if (decoded) {
          initial = {
            stage: "results",
            step: TOTAL_QUESTIONS - 1,
            draft: { ...decoded },
          };
        }
      }
    }

    if (!initial) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const persisted = JSON.parse(raw) as State;
          if (persisted && persisted.draft) {
            initial = persisted;
          }
        }
      } catch {
        // ignore
      }
    }

    if (initial) dispatch({ type: "hydrate", state: initial });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const result = useMemo(() => {
    if (state.stage !== "results" || !isComplete(state.draft)) return null;
    return evaluateReadiness(draftToAnswers(state.draft));
  }, [state.stage, state.draft]);

  const isLastStep = state.step === TOTAL_QUESTIONS - 1;
  const advanceOrFinish = () => {
    if (isLastStep) {
      if (isComplete(state.draft)) dispatch({ type: "show_results" });
    } else {
      dispatch({ type: "advance" });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {state.stage !== "welcome" && state.stage !== "exit-already-happened" && (
          <header className={styles.header}>
            <span className={styles.scrawl}>✿ am i ready?</span>
            <h1 className={styles.title}>
              Where you <em>actually</em> stand.
            </h1>
            <p className={styles.sub}>
              Eight questions. We'll tell you what to lock down this week — and
              what can wait.
            </p>
          </header>
        )}

        <div className={styles.stage}>
          {state.stage === "welcome" && (
            <Welcome onStart={() => dispatch({ type: "start" })} />
          )}

          {state.stage === "exit-already-happened" && <AlreadyHappenedExit />}

          {state.stage === "questions" && (
            <>
              <Progress current={state.step} total={TOTAL_QUESTIONS} />

              {state.step === 0 && (
                <SingleSelectStep
                  step={1}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      when's the <em>wedding?</em>
                    </>
                  }
                  sub="Doesn't have to be a date — a window or 'no idea yet' both work."
                  options={TIMELINE_OPTIONS}
                  value={state.draft.timeline}
                  onChange={(v) => dispatch({ type: "set_timeline", v })}
                  onNext={advanceOrFinish}
                />
              )}

              {state.step === 1 && (
                <SingleSelectStep
                  step={2}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      have you locked down a <em>venue?</em>
                    </>
                  }
                  options={VENUE_OPTIONS}
                  value={state.draft.venue}
                  onChange={(v) => dispatch({ type: "set_venue", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 2 && (
                <SingleSelectStep
                  step={3}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      do you have a <em>budget number?</em>
                    </>
                  }
                  sub="The single most-asked question by every vendor. We're not asking what it is — just whether you have one."
                  options={BUDGET_OPTIONS}
                  value={state.draft.budget}
                  onChange={(v) => dispatch({ type: "set_budget", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 3 && (
                <SingleSelectStep
                  step={4}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      how many <em>events?</em>
                    </>
                  }
                  sub="Mehndi, sangeet, ceremony, reception — every culture's flow is different. Just give us the rough scope."
                  options={SCOPE_OPTIONS}
                  value={state.draft.eventScope}
                  onChange={(v) => dispatch({ type: "set_scope", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 4 && (
                <MultiSelectStep
                  step={5}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      what have you <em>booked?</em>
                    </>
                  }
                  sub="Pick everything you've actually deposited on. 'In conversation' doesn't count."
                  helper="Multi-select"
                  options={VENDOR_OPTIONS}
                  value={state.draft.vendorsBooked}
                  onToggle={(v) => dispatch({ type: "toggle_vendor", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                  twoCol
                />
              )}

              {state.step === 5 && (
                <SingleSelectStep
                  step={6}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      where's your <em>guest list</em> at?
                    </>
                  }
                  options={GUEST_OPTIONS}
                  value={state.draft.guestList}
                  onChange={(v) => dispatch({ type: "set_guest", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 6 && (
                <SingleSelectStep
                  step={7}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      what about <em>outfits?</em>
                    </>
                  }
                  sub="If you're getting anything from India, lead time matters. Be honest."
                  options={ATTIRE_OPTIONS}
                  value={state.draft.attire}
                  onChange={(v) => dispatch({ type: "set_attire", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 7 && (
                <SingleSelectStep
                  step={8}
                  total={TOTAL_QUESTIONS}
                  heading={
                    <>
                      both families on the <em>same page?</em>
                    </>
                  }
                  sub="No judgment. We just need to know whether scope is settled or still up for debate — it's the difference between 'plan' and 'pre-plan.'"
                  options={FAMILY_OPTIONS}
                  value={state.draft.familyAlignment}
                  onChange={(v) => dispatch({ type: "set_family", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                  primaryLabel="See my readiness ✿"
                />
              )}
            </>
          )}

          {state.stage === "results" && result && isComplete(state.draft) && (
            <Results
              result={result}
              answers={draftToAnswers(state.draft)}
              onRestart={() => dispatch({ type: "reset" })}
              onEdit={() => dispatch({ type: "edit_answers" })}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function AlreadyHappenedExit() {
  return (
    <div className={welcomeStyles.exitCard}>
      <h2>Congratulations ✿</h2>
      <p>
        The Marigold tools are built for planning — but if you've already had
        the wedding, the next thing you might love is our vendor directory for
        anniversary celebrations and the rest of married life.
      </p>
      <p>
        <Link href="/vendors">Browse the vendor directory →</Link>
      </p>
    </div>
  );
}
