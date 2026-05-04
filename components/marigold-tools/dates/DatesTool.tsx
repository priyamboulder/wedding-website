"use client";

// ──────────────────────────────────────────────────────────────────────────
// Auspicious Date Finder — orchestrator.
//
// Stages: welcome → tradition → year/location → filters → calendar +
// shortlist. State lives in a single useReducer; persistence to
// localStorage means a refresh mid-flow doesn't dump the user out.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useReducer, useState } from "react";

import {
  applyFilters,
  buildYearDates,
  buildYearSummary,
  SUPPORTED_CITIES,
} from "@/lib/auspicious-date";
import type {
  Season,
  ShortlistedDate,
  Tradition,
  UserFilters,
} from "@/types/auspicious-date";

import { Welcome } from "./Welcome";
import { StepTradition } from "./StepTradition";
import { StepLocation } from "./StepLocation";
import { StepFilters } from "./StepFilters";
import { CalendarView } from "./CalendarView";
import { Progress } from "./Progress";
import styles from "./DatesTool.module.css";

const STORAGE_KEY = "marigold:dates:state";

type Stage = "welcome" | "tradition" | "location" | "filters" | "calendar";

const STEP_ORDER: Stage[] = ["tradition", "location", "filters", "calendar"];

interface State {
  stage: Stage;
  filters: UserFilters;
  shortlist: ShortlistedDate[];
}

const INITIAL_STATE: State = {
  stage: "welcome",
  filters: {
    traditions: [],
    years: [2026],
    city: "dallas",
    dayOfWeekPref: "any",
    seasonPref: [],
    avoidExtremeHeat: false,
    avoidExtremeCold: false,
    showLongWeekends: false,
    avoidPeakPricing: false,
    crossTraditionMatch: false,
  },
  shortlist: [],
};

type Action =
  | { type: "start" }
  | { type: "go"; stage: Stage }
  | { type: "advance" }
  | { type: "back" }
  | { type: "toggle_tradition"; v: Tradition }
  | { type: "set_year"; year: number; both: boolean }
  | { type: "set_city"; city: string }
  | { type: "set_day_pref"; v: UserFilters["dayOfWeekPref"] }
  | { type: "toggle_season"; v: Season }
  | { type: "toggle_filter"; key: keyof UserFilters }
  | { type: "add_shortlist"; isoDate: string }
  | { type: "remove_shortlist"; isoDate: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...state, stage: "tradition" };
    case "go":
      return { ...state, stage: action.stage };
    case "advance": {
      const idx = STEP_ORDER.indexOf(state.stage as Stage);
      if (idx < 0 || idx >= STEP_ORDER.length - 1) return state;
      return { ...state, stage: STEP_ORDER[idx + 1] };
    }
    case "back": {
      const idx = STEP_ORDER.indexOf(state.stage as Stage);
      if (idx <= 0) return state;
      return { ...state, stage: STEP_ORDER[idx - 1] };
    }
    case "toggle_tradition": {
      const cur = state.filters.traditions;
      let next: Tradition[];
      if (action.v === "none") {
        next = cur.includes("none") ? [] : ["none"];
      } else {
        const filtered = cur.filter((t) => t !== "none");
        next = filtered.includes(action.v)
          ? filtered.filter((t) => t !== action.v)
          : [...filtered, action.v];
      }
      return { ...state, filters: { ...state.filters, traditions: next } };
    }
    case "set_year": {
      const years = action.both ? [2026, 2027] : [action.year];
      return { ...state, filters: { ...state.filters, years } };
    }
    case "set_city":
      return { ...state, filters: { ...state.filters, city: action.city } };
    case "set_day_pref":
      return { ...state, filters: { ...state.filters, dayOfWeekPref: action.v } };
    case "toggle_season": {
      const cur = state.filters.seasonPref;
      const next = cur.includes(action.v)
        ? cur.filter((s) => s !== action.v)
        : [...cur, action.v];
      return { ...state, filters: { ...state.filters, seasonPref: next } };
    }
    case "toggle_filter": {
      const key = action.key;
      if (
        key === "avoidExtremeHeat" ||
        key === "avoidExtremeCold" ||
        key === "showLongWeekends" ||
        key === "avoidPeakPricing" ||
        key === "crossTraditionMatch"
      ) {
        return {
          ...state,
          filters: { ...state.filters, [key]: !state.filters[key] },
        };
      }
      return state;
    }
    case "add_shortlist": {
      if (state.shortlist.some((s) => s.isoDate === action.isoDate)) return state;
      return {
        ...state,
        shortlist: [
          ...state.shortlist,
          { isoDate: action.isoDate, addedAt: new Date().toISOString() },
        ],
      };
    }
    case "remove_shortlist":
      return {
        ...state,
        shortlist: state.shortlist.filter((s) => s.isoDate !== action.isoDate),
      };
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

export function DatesTool() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted = JSON.parse(raw) as State;
        if (persisted && persisted.filters) {
          dispatch({ type: "hydrate", state: persisted });
        }
      }
    } catch {
      // ignore
    }
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

  // Build dataset lazily — only when we land on the calendar.
  const yearData = useMemo(() => {
    if (state.stage !== "calendar") return null;
    if (state.filters.traditions.length === 0) return null;
    const years = state.filters.years;
    return years.map((year) => {
      const dates = buildYearDates(state.filters, year);
      const matches = applyFilters(dates, state.filters);
      const summary = buildYearSummary(matches, year, state.filters);
      return { year, dates, matches, summary };
    });
  }, [state.stage, state.filters]);

  const stepIndex = STEP_ORDER.indexOf(state.stage as Stage);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {state.stage !== "welcome" && (
          <header className={styles.header}>
            <span className={styles.scrawl}>✦ when the stars align</span>
            <h1 className={styles.title}>
              Find your <em>date</em>.
            </h1>
            <p className={styles.sub}>
              Every shubh muhurat, blocked period, and auspicious window — layered
              with weather, venues, and the Saturday-or-bust requirements your
              calendar actually has.
            </p>
          </header>
        )}

        <div className={styles.stage}>
          {state.stage === "welcome" && (
            <Welcome onStart={() => dispatch({ type: "start" })} />
          )}

          {state.stage !== "welcome" && state.stage !== "calendar" && (
            <Progress current={stepIndex} total={STEP_ORDER.length - 1} />
          )}

          {state.stage === "tradition" && (
            <StepTradition
              value={state.filters.traditions}
              onToggle={(v) => dispatch({ type: "toggle_tradition", v })}
              onNext={() => dispatch({ type: "advance" })}
            />
          )}

          {state.stage === "location" && (
            <StepLocation
              years={state.filters.years}
              city={state.filters.city}
              cities={SUPPORTED_CITIES}
              onSetYear={(year, both) =>
                dispatch({ type: "set_year", year, both })
              }
              onSetCity={(city) => dispatch({ type: "set_city", city })}
              onNext={() => dispatch({ type: "advance" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}

          {state.stage === "filters" && (
            <StepFilters
              filters={state.filters}
              onSetDayPref={(v) => dispatch({ type: "set_day_pref", v })}
              onToggleSeason={(v) => dispatch({ type: "toggle_season", v })}
              onToggleFilter={(key) =>
                dispatch({ type: "toggle_filter", key })
              }
              onNext={() => dispatch({ type: "advance" })}
              onBack={() => dispatch({ type: "back" })}
            />
          )}

          {state.stage === "calendar" && yearData && (
            <CalendarView
              filters={state.filters}
              years={yearData}
              shortlist={state.shortlist}
              onAddShortlist={(iso) =>
                dispatch({ type: "add_shortlist", isoDate: iso })
              }
              onRemoveShortlist={(iso) =>
                dispatch({ type: "remove_shortlist", isoDate: iso })
              }
              onEditFilters={() => dispatch({ type: "go", stage: "tradition" })}
              onReset={() => dispatch({ type: "reset" })}
            />
          )}
        </div>
      </div>
    </section>
  );
}
