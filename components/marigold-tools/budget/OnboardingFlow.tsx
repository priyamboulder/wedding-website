"use client";

import { useMemo, useState, type Dispatch } from "react";
import Link from "next/link";

import type {
  BudgetCultureWithEvents,
  BudgetLocationRow,
  BudgetTier,
} from "@/types/budget";
import type { BuilderAction, BuilderState } from "@/lib/budget";

import styles from "./OnboardingFlow.module.css";

type Props = {
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
  locations: BudgetLocationRow[];
  cultures: BudgetCultureWithEvents[];
  onComplete: () => void;
};

// ── Tier presets ──────────────────────────────────────────────────────────
const TIERS: { value: BudgetTier; name: string; tagline: string; range: string }[] = [
  { value: "essential", name: "Essential", tagline: "beautiful & tasteful", range: "$50–150K" },
  { value: "elevated", name: "Elevated", tagline: "premium experience", range: "$150–400K" },
  { value: "luxury", name: "Luxury", tagline: "no compromises", range: "$400K–1M" },
  { value: "ultra", name: "Ultra-Luxury", tagline: "if you have to ask…", range: "$1M+" },
];

const STEP_LABELS = ["Where", "Who", "How much", "Vibe"];

export function OnboardingFlow({
  state,
  dispatch,
  locations,
  cultures,
  onComplete,
}: Props) {
  // Stage progression: location → culture → budget → tier → done.
  const stage = state.step === "build" ? "build" : state.step;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.scrawl}>✿ the math, the moves</span>
          <h1 className={styles.title}>
            Build your <em>Shaadi Budget</em>
          </h1>
          <p className={styles.sub}>
            Mehndi to vidaai. Real numbers from real Indian weddings — no signup required, no
            generic spreadsheet templates. We'll save what you build automatically.
          </p>
        </header>

        <ol className={styles.stepBar}>
          {STEP_LABELS.map((label, idx) => {
            const stepKeys = ["location", "culture", "budget", "tier"] as const;
            const isDone =
              (idx === 0 && state.locationSlug) ||
              (idx === 1 && state.cultureSlug) ||
              (idx === 2 && state.totalBudget) ||
              (idx === 3 && stage === "build");
            const isActive = stage === stepKeys[idx];
            return (
              <li
                key={label}
                className={[
                  styles.stepItem,
                  isDone ? styles.stepDone : "",
                  isActive ? styles.stepActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={styles.stepIndex}>{idx + 1}</span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>

        <div className={styles.steps}>
          <Step1Location
            locations={locations}
            selectedSlug={state.locationSlug}
            onSelect={(slug) => {
              dispatch({ type: "set_location", slug });
              dispatch({ type: "set_step", step: "culture" });
            }}
            onEdit={() => dispatch({ type: "set_step", step: "location" })}
            collapsed={stage !== "location"}
            stage={stage}
          />

          {stage !== "location" && (
            <Step2Culture
              cultures={cultures}
              selectedSlug={state.cultureSlug}
              onSelect={(culture) => {
                const defaults: Record<string, number> = {};
                for (const e of culture.events) defaults[e.slug] = e.default_guests;
                dispatch({ type: "set_culture", slug: culture.slug, defaultGuestCounts: defaults });
                dispatch({ type: "set_step", step: "budget" });
              }}
              onEditEventGuests={(slug, count) =>
                dispatch({ type: "set_event_guests", eventSlug: slug, count })
              }
              guestCounts={state.guestCounts}
              onEdit={() => dispatch({ type: "set_step", step: "culture" })}
              collapsed={stage !== "culture"}
              stage={stage}
            />
          )}

          {(stage === "budget" || stage === "tier" || stage === "build") && (
            <Step3Budget
              location={locations.find((l) => l.slug === state.locationSlug) ?? null}
              totalBudget={state.totalBudget}
              onChange={(value) => dispatch({ type: "set_total_budget", total: value })}
              onAdvance={() => dispatch({ type: "set_step", step: "tier" })}
              onEdit={() => dispatch({ type: "set_step", step: "budget" })}
              collapsed={stage !== "budget"}
              alternateLocations={locations}
              onChangeLocation={(slug) => dispatch({ type: "set_location", slug })}
            />
          )}

          {(stage === "tier" || stage === "build") && (
            <Step4Tier
              tier={state.globalTier}
              onSelect={(tier) => dispatch({ type: "set_global_tier", tier })}
              onAdvance={onComplete}
              onEdit={() => dispatch({ type: "set_step", step: "tier" })}
              collapsed={stage === "build"}
            />
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Step 1: Location ────────────────────────────────────────────────────

function Step1Location({
  locations,
  selectedSlug,
  onSelect,
  onEdit,
  collapsed,
}: {
  locations: BudgetLocationRow[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onEdit: () => void;
  collapsed: boolean;
  stage: string;
}) {
  const [path, setPath] = useState<"us" | "intl" | null>(null);
  const [continent, setContinent] = useState<string | null>(null);

  const usMetros = useMemo(() => locations.filter((l) => l.type === "us_metro"), [locations]);
  const intl = useMemo(() => locations.filter((l) => l.type === "destination"), [locations]);

  const continents = useMemo(() => {
    const set = new Set<string>();
    for (const l of intl) if (l.continent) set.add(l.continent);
    return Array.from(set).sort();
  }, [intl]);

  if (collapsed && selectedSlug) {
    const sel = locations.find((l) => l.slug === selectedSlug);
    if (!sel) return null;
    return (
      <div className={styles.summaryCard}>
        <div className={styles.summaryCardLeft}>
          <span className={styles.eyebrow}>Where</span>
          <h3 className={styles.summaryName}>{sel.name}</h3>
          <p className={styles.summaryTag}>{sel.tagline}</p>
        </div>
        <div className={styles.summaryCardRight}>
          <span className={styles.metaPill}>×{sel.multiplier} cost</span>
          <span className={styles.metaPill}>min ${(sel.min_budget_usd / 1000).toFixed(0)}K</span>
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepCard}>
      <span className={styles.eyebrow}>Step 1</span>
      <h2 className={styles.stepHeading}>
        Where's the <em>party?</em>
      </h2>

      {!path && (
        <div className={styles.pathRow}>
          <button
            type="button"
            className={styles.pathBtn}
            onClick={() => setPath("us")}
          >
            <span className={styles.pathIcon}>🇺🇸</span>
            <span className={styles.pathTitle}>US Metro</span>
            <span className={styles.pathSub}>Dallas to NYC</span>
          </button>
          <button
            type="button"
            className={styles.pathBtn}
            onClick={() => setPath("intl")}
          >
            <span className={styles.pathIcon}>✈</span>
            <span className={styles.pathTitle}>International</span>
            <span className={styles.pathSub}>Goa to Lake Como</span>
          </button>
        </div>
      )}

      {path === "us" && (
        <>
          <button type="button" className={styles.backLink} onClick={() => setPath(null)}>
            ← back
          </button>
          <div className={styles.locationGrid}>
            {usMetros.map((loc) => (
              <LocationCard key={loc.id} location={loc} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}

      {path === "intl" && !continent && (
        <>
          <button type="button" className={styles.backLink} onClick={() => setPath(null)}>
            ← back
          </button>
          <div className={styles.continentGrid}>
            {continents.map((c) => (
              <button
                key={c}
                type="button"
                className={styles.continentBtn}
                onClick={() => setContinent(c)}
              >
                <span className={styles.continentName}>{c}</span>
                <span className={styles.continentCount}>
                  {intl.filter((l) => l.continent === c).length} destinations →
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {path === "intl" && continent && (
        <>
          <button type="button" className={styles.backLink} onClick={() => setContinent(null)}>
            ← back to continents
          </button>
          <div className={styles.locationGrid}>
            {intl
              .filter((l) => l.continent === continent)
              .map((loc) => (
                <LocationCard key={loc.id} location={loc} onSelect={onSelect} />
              ))}
          </div>
        </>
      )}

      <p className={styles.crossTool}>
        <em>P.S.</em> you can explore destinations in deeper detail at{" "}
        <Link href="/tools/destinations" className={styles.crossToolLink}>
          /tools/destinations
        </Link>
      </p>
    </div>
  );
}

function LocationCard({
  location,
  onSelect,
}: {
  location: BudgetLocationRow;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      className={styles.locationCard}
      onClick={() => onSelect(location.slug)}
    >
      <div className={styles.locationCardHead}>
        <h4 className={styles.locationCardName}>{location.name}</h4>
        {location.country && location.type === "destination" && (
          <span className={styles.locationCardCountry}>{location.country}</span>
        )}
      </div>
      <p className={styles.locationCardTag}>{location.tagline}</p>
      <div className={styles.locationCardMeta}>
        <span className={styles.metaPill}>×{location.multiplier}</span>
        <span className={styles.metaPill}>
          from ${(location.min_budget_usd / 1000).toFixed(0)}K
        </span>
      </div>
    </button>
  );
}

// ─── Step 2: Culture ────────────────────────────────────────────────────

function Step2Culture({
  cultures,
  selectedSlug,
  onSelect,
  onEditEventGuests,
  guestCounts,
  onEdit,
  collapsed,
}: {
  cultures: BudgetCultureWithEvents[];
  selectedSlug: string | null;
  onSelect: (culture: BudgetCultureWithEvents) => void;
  onEditEventGuests: (slug: string, count: number) => void;
  guestCounts: Record<string, number>;
  onEdit: () => void;
  collapsed: boolean;
  stage: string;
}) {
  const sel = cultures.find((c) => c.slug === selectedSlug);

  if (collapsed && sel) {
    return (
      <div className={styles.summaryCard}>
        <div className={styles.summaryCardLeft}>
          <span className={styles.eyebrow}>Who</span>
          <h3 className={styles.summaryName}>{sel.name}</h3>
          <p className={styles.summaryTag}>
            {sel.events.map((e) => `${e.name} (${guestCounts[e.slug] ?? e.default_guests})`).join(" · ")}
          </p>
        </div>
        <div className={styles.summaryCardRight}>
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepCard}>
      <span className={styles.eyebrow}>Step 2</span>
      <h2 className={styles.stepHeading}>
        Tell us about your <em>people</em>
      </h2>

      <div className={styles.cultureGrid}>
        {cultures.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            className={[
              styles.cultureCard,
              selectedSlug === c.slug ? styles.cultureCardSelected : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <h4 className={styles.cultureCardName}>{c.name}</h4>
            <p className={styles.cultureCardEvents}>
              {c.events.map((e) => e.name).join(" · ")}
            </p>
          </button>
        ))}
      </div>

      {sel && (
        <div className={styles.eventPreview}>
          <span className={styles.previewLabel}>your event flow</span>
          <div className={styles.eventChips}>
            {sel.events.map((e) => (
              <label key={e.slug} className={styles.eventChip}>
                <span className={styles.eventChipIcon} aria-hidden>
                  {e.icon}
                </span>
                <span className={styles.eventChipName}>{e.name}</span>
                <span className={styles.eventChipParen}>(</span>
                <input
                  type="number"
                  className={styles.eventChipInput}
                  min={20}
                  max={1500}
                  value={guestCounts[e.slug] ?? e.default_guests}
                  onChange={(ev) => {
                    const n = Number.parseInt(ev.target.value, 10);
                    onEditEventGuests(e.slug, Number.isFinite(n) ? n : e.default_guests);
                  }}
                />
                <span className={styles.eventChipParen}>)</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Budget slider ──────────────────────────────────────────────

function Step3Budget({
  location,
  totalBudget,
  onChange,
  onAdvance,
  onEdit,
  collapsed,
  alternateLocations,
  onChangeLocation,
}: {
  location: BudgetLocationRow | null;
  totalBudget: number | null;
  onChange: (value: number | null) => void;
  onAdvance: () => void;
  onEdit: () => void;
  collapsed: boolean;
  alternateLocations: BudgetLocationRow[];
  onChangeLocation: (slug: string) => void;
}) {
  // Logarithmic slider 0..1000 maps to $50K..$5M.
  const MIN = 50_000;
  const MAX = 5_000_000;
  const sliderToBudget = (s: number) => {
    const t = s / 1000;
    return Math.round(MIN * Math.pow(MAX / MIN, t));
  };
  const budgetToSlider = (b: number) => {
    const ratio = Math.log(b / MIN) / Math.log(MAX / MIN);
    return Math.max(0, Math.min(1000, Math.round(ratio * 1000)));
  };

  if (collapsed && totalBudget) {
    return (
      <div className={styles.summaryCard}>
        <div className={styles.summaryCardLeft}>
          <span className={styles.eyebrow}>How much</span>
          <h3 className={styles.summaryName}>${totalBudget.toLocaleString("en-US")}</h3>
          <p className={styles.summaryTag}>your target — we'll show you what fits</p>
        </div>
        <div className={styles.summaryCardRight}>
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            edit
          </button>
        </div>
      </div>
    );
  }

  const value = totalBudget ?? location?.min_budget_usd ?? 200_000;
  const sliderValue = budgetToSlider(value);

  // Contextual feedback:
  let feedback: { kind: "warn" | "good"; text: string; alts: BudgetLocationRow[] } | null = null;
  if (location) {
    if (value < location.min_budget_usd) {
      const cheaper = alternateLocations
        .filter((l) => l.min_budget_usd <= value && l.slug !== location.slug)
        .sort((a, b) => b.min_budget_usd - a.min_budget_usd)
        .slice(0, 3);
      feedback = {
        kind: "warn",
        text: `This is below where most ${location.name} Indian weddings land. Want to peek at some destinations that fit?`,
        alts: cheaper,
      };
    } else if (value > location.min_budget_usd * 2) {
      feedback = {
        kind: "good",
        text: `You've got room to play — we'll show you upgrade paths in the builder.`,
        alts: [],
      };
    }
  }

  return (
    <div className={styles.stepCard}>
      <span className={styles.eyebrow}>Step 3</span>
      <h2 className={styles.stepHeading}>
        the number everyone's afraid to <em>say out loud</em>
      </h2>

      <div className={styles.budgetDisplay}>
        <span className={styles.budgetDollar}>$</span>
        <input
          type="text"
          inputMode="numeric"
          className={styles.budgetInput}
          value={value.toLocaleString("en-US")}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const n = Number.parseInt(raw, 10);
            onChange(Number.isFinite(n) ? n : null);
          }}
          aria-label="Total wedding budget"
        />
      </div>

      <input
        type="range"
        min={0}
        max={1000}
        value={sliderValue}
        onChange={(e) => onChange(sliderToBudget(Number(e.target.value)))}
        className={styles.budgetSlider}
        aria-label="Total wedding budget slider"
      />
      <div className={styles.sliderTicks}>
        <span>$50K</span>
        <span>$250K</span>
        <span>$1M</span>
        <span>$5M</span>
      </div>

      {feedback && (
        <div
          className={[styles.budgetFeedback, styles[`feedback-${feedback.kind}`]]
            .filter(Boolean)
            .join(" ")}
        >
          <p>{feedback.text}</p>
          {feedback.alts.length > 0 && (
            <div className={styles.altRow}>
              {feedback.alts.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  className={styles.altBtn}
                  onClick={() => onChangeLocation(alt.slug)}
                >
                  {alt.name} → from ${(alt.min_budget_usd / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button type="button" className={styles.advanceBtn} onClick={onAdvance}>
        Looks right →
      </button>
    </div>
  );
}

// ─── Step 4: Default tier ────────────────────────────────────────────────

function Step4Tier({
  tier,
  onSelect,
  onAdvance,
  onEdit,
  collapsed,
}: {
  tier: BudgetTier;
  onSelect: (tier: BudgetTier) => void;
  onAdvance: () => void;
  onEdit: () => void;
  collapsed: boolean;
}) {
  if (collapsed) {
    const t = TIERS.find((x) => x.value === tier);
    return (
      <div className={styles.summaryCard}>
        <div className={styles.summaryCardLeft}>
          <span className={styles.eyebrow}>Vibe</span>
          <h3 className={styles.summaryName}>{t?.name}</h3>
          <p className={styles.summaryTag}>{t?.tagline}</p>
        </div>
        <div className={styles.summaryCardRight}>
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepCard}>
      <span className={styles.eyebrow}>Step 4</span>
      <h2 className={styles.stepHeading}>
        pick your default <em>vibe</em>
      </h2>
      <p className={styles.stepSub}>
        Sets the starting tier for every vendor category. You can override any row in the builder.
      </p>

      <div className={styles.tierGrid}>
        {TIERS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onSelect(t.value)}
            className={[
              styles.tierCard,
              tier === t.value ? styles.tierCardSelected : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <h4 className={styles.tierName}>{t.name}</h4>
            <p className={styles.tierTag}>{t.tagline}</p>
            <span className={styles.tierRange}>{t.range}</span>
          </button>
        ))}
      </div>

      <button type="button" className={styles.advanceBtnLarge} onClick={onAdvance}>
        Build my budget ↓
      </button>
    </div>
  );
}
