"use client";

// ──────────────────────────────────────────────────────────────────────────
// GuestTool — orchestrator for the guest count estimator.
//
// Stages: welcome → setup → tiers → tune → results. State lives in a single
// useReducer; localStorage persists across refreshes and the URL hash
// rehydrates a shared link directly into the results stage.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useReducer, useState } from "react";

import type {
  EventAttendanceOverrides,
  EventSlug,
  GuestDistribution,
  GuestEstimateState,
  SideId,
  TierId,
} from "@/types/guests";
import {
  buildInitialState,
  computeEstimate,
  decodeState,
  getCategoryKey,
} from "@/lib/guests";

import { Welcome } from "./Welcome";
import { Setup } from "./Setup";
import { TierBuilder } from "./TierBuilder";
import { EventTuner } from "./EventTuner";
import { Results, type LeverId } from "./Results";

import styles from "./GuestTool.module.css";

const STORAGE_KEY = "marigold:guests:state";
const STAGES: Stage[] = ["welcome", "setup", "tiers", "tune", "results"];
const STAGE_LABELS: Record<Stage, string> = {
  welcome: "welcome",
  setup: "setup",
  tiers: "the list",
  tune: "attendance",
  results: "results",
};

type Stage = "welcome" | "setup" | "tiers" | "tune" | "results";

interface ToolState {
  stage: Stage;
  data: GuestEstimateState;
  activeLevers: LeverId[];
  /** Snapshot of pre-lever state, so toggling a lever off can restore. */
  preLeverData: GuestEstimateState | null;
}

const INITIAL_STATE: ToolState = {
  stage: "welcome",
  data: buildInitialState(),
  activeLevers: [],
  preLeverData: null,
};

type Action =
  | { type: "start" }
  | { type: "go-stage"; stage: Stage }
  | { type: "next" }
  | { type: "back" }
  | { type: "toggle-event"; event: EventSlug }
  | { type: "set-location"; loc: string }
  | { type: "set-distribution"; v: GuestDistribution }
  | { type: "set-cost-per-head"; v: number }
  | {
      type: "set-count";
      side: SideId;
      tierId: string;
      categoryId: string;
      value: number;
    }
  | {
      type: "set-shared-count";
      tierId: string;
      categoryId: string;
      value: number;
    }
  | { type: "rename-side"; side: SideId; label: string }
  | { type: "toggle-side"; side: SideId }
  | {
      type: "set-rate";
      event: EventSlug;
      tier: TierId;
      value: number;
    }
  | { type: "set-out-of-town"; event: EventSlug; value: number }
  | { type: "apply-lever"; lever: LeverId }
  | { type: "hydrate"; state: ToolState }
  | { type: "reset" };

function reducer(state: ToolState, action: Action): ToolState {
  switch (action.type) {
    case "start":
      return { ...state, stage: "setup" };
    case "go-stage":
      return { ...state, stage: action.stage };
    case "next": {
      const idx = STAGES.indexOf(state.stage);
      const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
      return { ...state, stage: next };
    }
    case "back": {
      const idx = STAGES.indexOf(state.stage);
      const prev = STAGES[Math.max(0, idx - 1)];
      return { ...state, stage: prev };
    }
    case "toggle-event": {
      const events = state.data.events.includes(action.event)
        ? state.data.events.filter((e) => e !== action.event)
        : [...state.data.events, action.event];
      return { ...state, data: { ...state.data, events } };
    }
    case "set-location":
      return {
        ...state,
        data: { ...state.data, weddingLocation: action.loc },
      };
    case "set-distribution":
      return {
        ...state,
        data: { ...state.data, guestDistribution: action.v },
      };
    case "set-cost-per-head":
      return {
        ...state,
        data: { ...state.data, costPerHead: Math.max(0, action.v) },
      };
    case "set-count": {
      const sides = state.data.sides.map((s) =>
        s.id === action.side
          ? {
              ...s,
              counts: {
                ...s.counts,
                [getCategoryKey(action.tierId as TierId, action.categoryId)]:
                  Math.max(0, Math.floor(action.value)),
              },
            }
          : s,
      ) as ToolState["data"]["sides"];
      return { ...state, data: { ...state.data, sides } };
    }
    case "set-shared-count": {
      return {
        ...state,
        data: {
          ...state.data,
          shared: {
            counts: {
              ...state.data.shared.counts,
              [getCategoryKey(action.tierId as TierId, action.categoryId)]:
                Math.max(0, Math.floor(action.value)),
            },
          },
        },
      };
    }
    case "rename-side": {
      const sides = state.data.sides.map((s) =>
        s.id === action.side ? { ...s, label: action.label } : s,
      ) as ToolState["data"]["sides"];
      return { ...state, data: { ...state.data, sides } };
    }
    case "toggle-side": {
      const sides = state.data.sides.map((s) =>
        s.id === action.side ? { ...s, enabled: !s.enabled } : s,
      ) as ToolState["data"]["sides"];
      return { ...state, data: { ...state.data, sides } };
    }
    case "set-rate": {
      const prev: EventAttendanceOverrides =
        state.data.eventOverrides[action.event] ?? { rates: {} };
      return {
        ...state,
        data: {
          ...state.data,
          eventOverrides: {
            ...state.data.eventOverrides,
            [action.event]: {
              ...prev,
              rates: {
                ...(prev.rates ?? {}),
                [action.tier]: clamp01(action.value),
              },
            },
          },
        },
      };
    }
    case "set-out-of-town": {
      const prev: EventAttendanceOverrides =
        state.data.eventOverrides[action.event] ?? { rates: {} };
      return {
        ...state,
        data: {
          ...state.data,
          eventOverrides: {
            ...state.data.eventOverrides,
            [action.event]: {
              ...prev,
              outOfTownModifier: clamp01(action.value),
            },
          },
        },
      };
    }
    case "apply-lever":
      return applyLever(state, action.lever);
    case "hydrate":
      return action.state;
    case "reset":
      return { ...INITIAL_STATE, data: buildInitialState() };
    default:
      return state;
  }
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

// ──────────────────────────────────────────────────────────────────────────
// Lever logic.
//
// A lever rewrites the user's current data — counts, attendance overrides —
// in a way that's reversible. We snapshot the pre-lever data the first time
// any lever is applied; turning every lever off restores from the snapshot.
// ──────────────────────────────────────────────────────────────────────────

function applyLever(state: ToolState, lever: LeverId): ToolState {
  const isActive = state.activeLevers.includes(lever);
  const nextLevers = isActive
    ? state.activeLevers.filter((l) => l !== lever)
    : [...state.activeLevers, lever];

  // Take a snapshot of the user's data the first time we touch it.
  const snapshot = state.preLeverData ?? state.data;

  if (nextLevers.length === 0) {
    // All levers off — restore.
    return {
      ...state,
      data: snapshot,
      preLeverData: null,
      activeLevers: [],
    };
  }

  // Apply all currently active levers on top of the snapshot.
  let next = snapshot;
  for (const l of nextLevers) {
    next = mutateForLever(next, l);
  }

  return {
    ...state,
    data: next,
    preLeverData: snapshot,
    activeLevers: nextLevers,
  };
}

function mutateForLever(
  data: GuestEstimateState,
  lever: LeverId,
): GuestEstimateState {
  switch (lever) {
    case "drop-obligation": {
      // Zero out the parents'-friends "obligation" category for both sides.
      const sides = data.sides.map((s) => ({
        ...s,
        counts: {
          ...s.counts,
          [getCategoryKey("parents-friends", "obligation")]: 0,
        },
      })) as GuestEstimateState["sides"];
      return { ...data, sides };
    }
    case "family-only-mehndi": {
      // Override mehndi attendance for friends, parents'-friends, and
      // professional tiers down to 0.
      const prev: EventAttendanceOverrides =
        data.eventOverrides.mehndi ?? { rates: {} };
      return {
        ...data,
        eventOverrides: {
          ...data.eventOverrides,
          mehndi: {
            ...prev,
            rates: {
              ...(prev.rates ?? {}),
              "parents-friends": 0,
              "couple-friends": 0,
              professional: 0,
              "outer-extended": 0,
            },
          },
        },
      };
    }
    case "no-plus-ones": {
      // Zero the friends' plus-ones shared category.
      return {
        ...data,
        shared: {
          counts: {
            ...data.shared.counts,
            [getCategoryKey("couple-friends", "plus-ones")]: 0,
          },
        },
      };
    }
    case "kids-free": {
      // Zero kids categories on both sides + shrink reception attendance
      // for inner-extended slightly to reflect families that opt out.
      const sides = data.sides.map((s) => ({
        ...s,
        counts: {
          ...s.counts,
          [getCategoryKey("immediate-family", "siblings-kids")]: 0,
          [getCategoryKey("inner-extended", "first-cousin-kids")]: 0,
        },
      })) as GuestEstimateState["sides"];
      return { ...data, sides };
    }
    case "drop-outer-extended": {
      // Wipe every outer-extended category on both sides.
      const sides = data.sides.map((s) => ({
        ...s,
        counts: Object.fromEntries(
          Object.entries(s.counts).filter(
            ([k]) => !k.startsWith("outer-extended:"),
          ),
        ),
      })) as GuestEstimateState["sides"];
      return { ...data, sides };
    }
    default:
      return data;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function GuestTool() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initial: ToolState | null = null;

    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const token = params.get("g");
      if (token) {
        const decoded = decodeState(token);
        if (decoded) {
          initial = {
            stage: "results",
            data: decoded,
            activeLevers: [],
            preLeverData: null,
          };
        }
      }
    }

    if (!initial) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const persisted = JSON.parse(raw) as ToolState;
          if (persisted && persisted.data) initial = persisted;
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

  const output = useMemo(() => {
    if (state.stage !== "results") return null;
    return computeEstimate(state.data);
  }, [state.stage, state.data]);

  const visibleStages: Stage[] = ["setup", "tiers", "tune", "results"];
  const showHeader = state.stage !== "welcome";

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {showHeader && (
          <header className={styles.header}>
            <span className={styles.scrawl}>✿ guest count estimator</span>
            <h1 className={styles.title}>
              Your <em>real</em> number.
            </h1>
            <p className={styles.sub}>
              Built from both sides, tier by tier, event by event. Designed
              to be screenshot and texted to family.
            </p>
            <p className={styles.stageBar}>
              <em>{STAGE_LABELS[state.stage]}</em> ·{" "}
              {visibleStages.indexOf(state.stage) + 1} of {visibleStages.length}
            </p>
            <div className={styles.stepBar} aria-hidden>
              {visibleStages.map((s, i) => {
                const cur = visibleStages.indexOf(state.stage);
                return (
                  <span
                    key={s}
                    className={[
                      styles.stepDot,
                      i < cur ? styles.stepDotDone : "",
                      i === cur ? styles.stepDotActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                );
              })}
            </div>
          </header>
        )}

        <div className={styles.stage}>
          {state.stage === "welcome" && (
            <Welcome onStart={() => dispatch({ type: "start" })} />
          )}

          {state.stage === "setup" && (
            <Setup
              state={state.data}
              onToggleEvent={(e) =>
                dispatch({ type: "toggle-event", event: e })
              }
              onChangeLocation={(loc) =>
                dispatch({ type: "set-location", loc })
              }
              onChangeDistribution={(v) =>
                dispatch({ type: "set-distribution", v })
              }
              onContinue={() => dispatch({ type: "next" })}
              onBack={() => dispatch({ type: "go-stage", stage: "welcome" })}
            />
          )}

          {state.stage === "tiers" && (
            <TierBuilder
              state={state.data}
              onSetCount={(side, tierId, categoryId, value) =>
                dispatch({
                  type: "set-count",
                  side,
                  tierId,
                  categoryId,
                  value,
                })
              }
              onSetSharedCount={(tierId, categoryId, value) =>
                dispatch({
                  type: "set-shared-count",
                  tierId,
                  categoryId,
                  value,
                })
              }
              onRenameSide={(side, label) =>
                dispatch({ type: "rename-side", side, label })
              }
              onToggleSide={(side) =>
                dispatch({ type: "toggle-side", side })
              }
              onContinue={() => dispatch({ type: "next" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}

          {state.stage === "tune" && (
            <EventTuner
              state={state.data}
              onSetRate={(event, tier, value) =>
                dispatch({ type: "set-rate", event, tier, value })
              }
              onSetOutOfTown={(event, value) =>
                dispatch({ type: "set-out-of-town", event, value })
              }
              onContinue={() => dispatch({ type: "next" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}

          {state.stage === "results" && output && (
            <Results
              state={state.data}
              output={output}
              activeLevers={state.activeLevers}
              onCostPerHeadChange={(v) =>
                dispatch({ type: "set-cost-per-head", v })
              }
              onApplyLever={(lever) =>
                dispatch({ type: "apply-lever", lever })
              }
              onRestart={() => dispatch({ type: "reset" })}
              onEdit={() => dispatch({ type: "go-stage", stage: "tiers" })}
            />
          )}
        </div>
      </div>
    </section>
  );
}
