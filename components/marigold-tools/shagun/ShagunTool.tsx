"use client";

// ──────────────────────────────────────────────────────────────────────────
// ShagunTool — orchestrator.
//
// Stages: welcome → (guest 5-step flow → guest result) | (couple setup →
// couple result). State lives in a single useReducer; persistence to
// localStorage and URL hash means a refresh or shared link rehydrates
// straight into the result screen.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useReducer, useState } from "react";

import type {
  AttendingAs,
  BudgetComfort,
  CoupleInputs,
  EventCount,
  GuestInputs,
  Location,
  Mode,
  ReciprocityStatus,
  RelationshipTier,
  Tradition,
  WeddingScale,
  WeddingStyle,
} from "@/types/shagun";
import { calculateShagun, decodeShare } from "@/lib/shagun";

import { Welcome } from "./Welcome";
import { Progress } from "./Progress";
import { Results } from "./Results";
import { CoupleResults, CoupleSetup } from "./CoupleEstimator";
import {
  Step1Relationship,
  Step2WeddingContext,
  Step3Cultural,
  Step4Reciprocity,
  Step5Budget,
} from "./GuestSteps";
import styles from "./ShagunTool.module.css";

const STORAGE_KEY = "marigold:shagun:state";
const GUEST_TOTAL_STEPS = 5;

type Stage =
  | "welcome"
  | "guest-steps"
  | "guest-results"
  | "couple-setup"
  | "couple-results";

interface GuestDraft {
  relationship: RelationshipTier | null;
  attendingAs: AttendingAs;
  weddingScale: WeddingScale | null;
  weddingStyle: WeddingStyle | null;
  eventCount: EventCount | null;
  tradition: Tradition | null;
  location: Location | null;
  reciprocityStatus: ReciprocityStatus | null;
  reciprocityAmount: number | null;
  budgetComfort: BudgetComfort;
}

interface State {
  stage: Stage;
  step: number; // 0..4 in guest mode
  guest: GuestDraft;
  couple: CoupleInputs;
}

const INITIAL_GUEST_DRAFT: GuestDraft = {
  relationship: null,
  attendingAs: "solo",
  weddingScale: null,
  weddingStyle: null,
  eventCount: null,
  tradition: null,
  location: null,
  reciprocityStatus: null,
  reciprocityAmount: null,
  budgetComfort: "skip",
};

const INITIAL_COUPLE_INPUTS: CoupleInputs = {
  counts: {
    "immediate-family": 0,
    "close-extended-family": 0,
    "outer-extended-family": 0,
    "close-friend": 0,
    "good-friend": 0,
    "acquaintance-colleague": 0,
    "parents-friend-family-friend": 0,
    "business-relationship": 0,
  },
  weddingScale: "standard",
  weddingStyle: "upscale-hotel",
  tradition: "north-indian",
  location: "both-us",
};

const INITIAL_STATE: State = {
  stage: "welcome",
  step: 0,
  guest: INITIAL_GUEST_DRAFT,
  couple: INITIAL_COUPLE_INPUTS,
};

type Action =
  | { type: "pick_mode"; mode: Mode }
  | { type: "advance" }
  | { type: "back" }
  | { type: "set_relationship"; v: RelationshipTier }
  | { type: "set_attending_as"; v: AttendingAs }
  | { type: "set_wedding_scale"; v: WeddingScale }
  | { type: "set_wedding_style"; v: WeddingStyle }
  | { type: "set_event_count"; v: EventCount }
  | { type: "set_tradition"; v: Tradition }
  | { type: "set_location"; v: Location }
  | { type: "set_reciprocity_status"; v: ReciprocityStatus }
  | { type: "set_reciprocity_amount"; v: number | null }
  | { type: "set_budget_comfort"; v: BudgetComfort }
  | { type: "show_guest_results" }
  | { type: "edit_guest_answers" }
  | { type: "submit_couple"; v: CoupleInputs }
  | { type: "edit_couple_answers" }
  | { type: "switch_mode_to_couple" }
  | { type: "switch_mode_to_guest" }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "pick_mode":
      if (action.mode === "guest") {
        return { ...state, stage: "guest-steps", step: 0 };
      }
      return { ...state, stage: "couple-setup" };
    case "advance":
      return {
        ...state,
        step: Math.min(state.step + 1, GUEST_TOTAL_STEPS - 1),
      };
    case "back":
      return { ...state, step: Math.max(0, state.step - 1) };
    case "set_relationship":
      return {
        ...state,
        guest: { ...state.guest, relationship: action.v },
      };
    case "set_attending_as":
      return { ...state, guest: { ...state.guest, attendingAs: action.v } };
    case "set_wedding_scale":
      return { ...state, guest: { ...state.guest, weddingScale: action.v } };
    case "set_wedding_style":
      return { ...state, guest: { ...state.guest, weddingStyle: action.v } };
    case "set_event_count":
      return { ...state, guest: { ...state.guest, eventCount: action.v } };
    case "set_tradition":
      return { ...state, guest: { ...state.guest, tradition: action.v } };
    case "set_location":
      return { ...state, guest: { ...state.guest, location: action.v } };
    case "set_reciprocity_status":
      // Switching to a non-known status clears any stale amount.
      return {
        ...state,
        guest: {
          ...state.guest,
          reciprocityStatus: action.v,
          reciprocityAmount:
            action.v === "yes-known" ? state.guest.reciprocityAmount : null,
        },
      };
    case "set_reciprocity_amount":
      return {
        ...state,
        guest: { ...state.guest, reciprocityAmount: action.v },
      };
    case "set_budget_comfort":
      return { ...state, guest: { ...state.guest, budgetComfort: action.v } };
    case "show_guest_results":
      return { ...state, stage: "guest-results" };
    case "edit_guest_answers":
      return { ...state, stage: "guest-steps", step: 0 };
    case "submit_couple":
      return { ...state, stage: "couple-results", couple: action.v };
    case "edit_couple_answers":
      return { ...state, stage: "couple-setup" };
    case "switch_mode_to_couple":
      return { ...state, stage: "couple-setup" };
    case "switch_mode_to_guest":
      return { ...state, stage: "guest-steps", step: 0 };
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

function isGuestComplete(d: GuestDraft): d is GuestDraft & {
  relationship: RelationshipTier;
  weddingScale: WeddingScale;
  weddingStyle: WeddingStyle;
  eventCount: EventCount;
  tradition: Tradition;
  location: Location;
  reciprocityStatus: ReciprocityStatus;
} {
  return (
    d.relationship !== null &&
    d.weddingScale !== null &&
    d.weddingStyle !== null &&
    d.eventCount !== null &&
    d.tradition !== null &&
    d.location !== null &&
    d.reciprocityStatus !== null
  );
}

function draftToInputs(d: GuestDraft): GuestInputs | null {
  if (!isGuestComplete(d)) return null;
  return {
    relationship: d.relationship,
    attendingAs: d.attendingAs,
    weddingScale: d.weddingScale,
    weddingStyle: d.weddingStyle,
    eventCount: d.eventCount,
    tradition: d.tradition,
    location: d.location,
    reciprocityStatus: d.reciprocityStatus,
    reciprocityAmount:
      d.reciprocityStatus === "yes-known" ? d.reciprocityAmount : null,
    budgetComfort: d.budgetComfort,
  };
}

function inputsToDraft(g: GuestInputs): GuestDraft {
  return {
    relationship: g.relationship,
    attendingAs: g.attendingAs,
    weddingScale: g.weddingScale,
    weddingStyle: g.weddingStyle,
    eventCount: g.eventCount,
    tradition: g.tradition,
    location: g.location,
    reciprocityStatus: g.reciprocityStatus,
    reciprocityAmount: g.reciprocityAmount,
    budgetComfort: g.budgetComfort,
  };
}

export function ShagunTool() {
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
        const decoded = decodeShare(token);
        if (decoded) {
          if (decoded.mode === "guest" && decoded.guest) {
            initial = {
              ...INITIAL_STATE,
              stage: "guest-results",
              step: GUEST_TOTAL_STEPS - 1,
              guest: inputsToDraft(decoded.guest),
            };
          } else if (decoded.mode === "couple" && decoded.couple) {
            initial = {
              ...INITIAL_STATE,
              stage: "couple-results",
              couple: decoded.couple,
            };
          }
        }
      }
    }

    if (!initial) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const persisted = JSON.parse(raw) as State;
          if (persisted && persisted.guest && persisted.couple) {
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

  const guestInputs = useMemo(
    () => (state.stage === "guest-results" ? draftToInputs(state.guest) : null),
    [state.stage, state.guest],
  );

  const guestResult = useMemo(
    () => (guestInputs ? calculateShagun(guestInputs) : null),
    [guestInputs],
  );

  const isLastGuestStep = state.step === GUEST_TOTAL_STEPS - 1;
  const advanceOrFinish = () => {
    if (isLastGuestStep) {
      if (isGuestComplete(state.guest)) {
        dispatch({ type: "show_guest_results" });
      }
    } else {
      dispatch({ type: "advance" });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {state.stage !== "welcome" && (
          <header className={styles.header}>
            <span className={styles.scrawl}>✿ shagun calculator</span>
            <h1 className={styles.title}>
              How much do you <em>actually</em> give?
            </h1>
            <p className={styles.sub}>
              No more parking-lot Googling. The real answer, calibrated to your
              relationship and their wedding.
            </p>
          </header>
        )}

        <div className={styles.stage}>
          {state.stage === "welcome" && (
            <Welcome
              onPick={(mode) => dispatch({ type: "pick_mode", mode })}
            />
          )}

          {state.stage === "guest-steps" && (
            <>
              <Progress current={state.step} total={GUEST_TOTAL_STEPS} />

              {state.step === 0 && (
                <Step1Relationship
                  relationship={state.guest.relationship}
                  attendingAs={state.guest.attendingAs}
                  onRelationship={(v) =>
                    dispatch({ type: "set_relationship", v })
                  }
                  onAttendingAs={(v) =>
                    dispatch({ type: "set_attending_as", v })
                  }
                  onNext={advanceOrFinish}
                />
              )}

              {state.step === 1 && (
                <Step2WeddingContext
                  weddingScale={state.guest.weddingScale}
                  weddingStyle={state.guest.weddingStyle}
                  eventCount={state.guest.eventCount}
                  onWeddingScale={(v) =>
                    dispatch({ type: "set_wedding_scale", v })
                  }
                  onWeddingStyle={(v) =>
                    dispatch({ type: "set_wedding_style", v })
                  }
                  onEventCount={(v) => dispatch({ type: "set_event_count", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 2 && (
                <Step3Cultural
                  tradition={state.guest.tradition}
                  location={state.guest.location}
                  onTradition={(v) => dispatch({ type: "set_tradition", v })}
                  onLocation={(v) => dispatch({ type: "set_location", v })}
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 3 && (
                <Step4Reciprocity
                  reciprocityStatus={state.guest.reciprocityStatus}
                  reciprocityAmount={state.guest.reciprocityAmount}
                  onReciprocityStatus={(v) =>
                    dispatch({ type: "set_reciprocity_status", v })
                  }
                  onReciprocityAmount={(v) =>
                    dispatch({ type: "set_reciprocity_amount", v })
                  }
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}

              {state.step === 4 && (
                <Step5Budget
                  budgetComfort={state.guest.budgetComfort}
                  onBudgetComfort={(v) =>
                    dispatch({ type: "set_budget_comfort", v })
                  }
                  onNext={advanceOrFinish}
                  onBack={() => dispatch({ type: "back" })}
                />
              )}
            </>
          )}

          {state.stage === "guest-results" && guestResult && guestInputs && (
            <Results
              result={guestResult}
              inputs={guestInputs}
              onRestart={() => dispatch({ type: "reset" })}
              onEdit={() => dispatch({ type: "edit_guest_answers" })}
              onSwitchMode={() =>
                dispatch({ type: "switch_mode_to_couple" })
              }
            />
          )}

          {state.stage === "couple-setup" && (
            <CoupleSetup
              initial={state.couple}
              onSubmit={(v) => dispatch({ type: "submit_couple", v })}
              onBack={() => dispatch({ type: "reset" })}
            />
          )}

          {state.stage === "couple-results" && (
            <CoupleResults
              inputs={state.couple}
              onEdit={() => dispatch({ type: "edit_couple_answers" })}
              onSwitchMode={() => dispatch({ type: "switch_mode_to_guest" })}
            />
          )}
        </div>
      </div>
    </section>
  );
}
