"use client";

// ── Guided Space Explorer ────────────────────────────────────────────────────
// Replaces the side-by-side space grid with a calm, one-space-at-a-time
// discovery flow. Lobby → per-space stepper (Arrival → Vibe → Key elements →
// References → Confirm). Writes into the same `space_cards` store fields so
// the decorator consumes an unchanged structured output.

import { useMemo, useState } from "react";
import { useDecorStore } from "@/stores/decor-store";
import {
  DECOR_COLORS,
  FONT_DISPLAY,
  FONT_UI,
  FONT_MONO,
  SectionHead,
  Block,
  Paper,
  SparklePill,
  TextArea,
  TextField,
  GhostButton,
  PrimaryButton,
  EmptyState,
} from "./primitives";
import {
  DECOR_ELEMENTS,
  ELEMENT_CATEGORY_LABELS,
} from "./catalog";
import type {
  DecorSpaceCard,
  DecorSpaceType,
  ElementCard,
  Reaction3,
  SpaceAIRecommendation,
} from "@/types/decor";
import { DECOR_SPACE_TYPE_LABELS } from "@/types/decor";
import type { EventDayId } from "@/types/checklist";
import { generateSpaceAIRecommendation } from "./space-ai";

// ── Labels + ordering ───────────────────────────────────────────────────────

const EVENT_LABELS: Partial<Record<EventDayId, string>> = {
  haldi: "Haldi",
  mehndi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
  welcome: "Welcome",
  ganesh_puja: "Ganesh Puja",
  post_brunch: "Post-wedding brunch",
};

// The 2 highest-impact categories per space type — the 80% of the vibe.
// Other categories are still reachable via "Show more layers".
const HERO_CATEGORIES: Record<DecorSpaceType, string[]> = {
  ceremony: ["mandap", "aisle"],
  reception: ["tables", "stage"],
  outdoor: ["entrance", "florals"],
  pre_event: ["seating", "florals"],
};

// Poetic arrival prompts, keyed by the first event at a space.
const ARRIVAL_PROMPT: Partial<Record<EventDayId, string>> = {
  haldi:
    "Close your eyes. Guests are arriving for Haldi. The sun is up, laughter is loud, turmeric is everywhere. What should they walk into?",
  mehndi:
    "Picture it: bare feet, cushions on the floor, hands held out for henna. How should this space wrap around them?",
  sangeet:
    "Lights dim. Music starts. Family has been waiting for this all week. What's the first thing they see?",
  wedding:
    "Your parents walk the aisle. The pandit is waiting. What does the room feel like in that moment?",
  reception:
    "Dinner, speeches, that first dance. You've changed outfits, you're holding champagne. What surrounds you?",
  welcome:
    "Guests are arriving from the airport, tired and excited. What welcomes them in?",
};

type VibeSliders = {
  intimacy: number; // 0 intimate → 100 grand
  tradition: number; // 0 traditional → 100 modern
  density: number; // 0 lush → 100 minimal
};

const DEFAULT_SLIDERS: VibeSliders = {
  intimacy: 50,
  tradition: 50,
  density: 50,
};

// ── Step model ──────────────────────────────────────────────────────────────

type StepKind =
  | { kind: "arrival" }
  | { kind: "vibe"; event_id?: EventDayId }
  | { kind: "key_elements" }
  | { kind: "references" }
  | { kind: "confirm" };

function flowSteps(space: DecorSpaceCard): StepKind[] {
  const steps: StepKind[] = [{ kind: "arrival" }];
  if (space.event_ids.length > 1) {
    for (const eid of space.event_ids) {
      steps.push({ kind: "vibe", event_id: eid });
    }
  } else {
    steps.push({ kind: "vibe" });
  }
  steps.push({ kind: "key_elements" });
  steps.push({ kind: "references" });
  steps.push({ kind: "confirm" });
  return steps;
}

function spaceIsDone(space: DecorSpaceCard): boolean {
  const flips = space.event_ids.length > 1;
  const vibeSet = flips
    ? space.event_ids.every((e) => (space.vibe_by_event[e] ?? "").trim().length > 0)
    : space.vibe_text.trim().length > 0;
  const reactedToSomething = Object.values(space.element_reactions).some(
    (r) => r != null,
  );
  return vibeSet && reactedToSomething;
}

function spaceIsStarted(space: DecorSpaceCard): boolean {
  const hasVibe =
    space.vibe_text.trim().length > 0 ||
    Object.values(space.vibe_by_event).some((v) => (v ?? "").trim().length > 0);
  const hasReactions = Object.keys(space.element_reactions).length > 0;
  return hasVibe || hasReactions;
}

// ── Top-level component ─────────────────────────────────────────────────────

export function GuidedSpaceExplorer() {
  const spaces = useDecorStore((s) => s.space_cards);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  if (activeSpaceId) {
    const space = spaces.find((s) => s.id === activeSpaceId);
    if (!space) {
      setActiveSpaceId(null);
      return null;
    }
    return (
      <GuidedFlow
        space={space}
        onExit={() => setActiveSpaceId(null)}
      />
    );
  }

  return <Lobby onPick={setActiveSpaceId} />;
}

// ── Lobby ───────────────────────────────────────────────────────────────────

function Lobby({ onPick }: { onPick: (id: string) => void }) {
  const spaces = useDecorStore((s) => s.space_cards);
  const addSpace = useDecorStore((s) => s.addSpaceCard);

  const doneCount = spaces.filter(spaceIsDone).length;

  return (
    <Block>
      <SectionHead
        eyebrow="One space at a time"
        title="Walk through your spaces"
        body="We'll go through each space like a short guided tour — no form, no checklist. Start with the one on your mind."
      />

      <Paper
        className="mb-5 p-4"
        style={{ backgroundColor: DECOR_COLORS.champagne }}
      >
        <div
          className="flex items-center justify-between text-[12px]"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          <span>
            <span style={{ fontFamily: FONT_MONO, color: DECOR_COLORS.cocoa }}>
              {doneCount}
            </span>{" "}
            / {spaces.length} spaces walked through
          </span>
          <span
            className="text-[10.5px] uppercase"
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: "0.2em",
              color: DECOR_COLORS.cocoaMuted,
            }}
          >
            ~2 min each
          </span>
        </div>
      </Paper>

      <div className="space-y-2.5">
        {spaces.map((space) => (
          <LobbySpaceRow key={space.id} space={space} onPick={onPick} />
        ))}
      </div>

      <div className="mt-5">
        <GhostButton onClick={addSpace}>+ Add another space</GhostButton>
      </div>
    </Block>
  );
}

function LobbySpaceRow({
  space,
  onPick,
}: {
  space: DecorSpaceCard;
  onPick: (id: string) => void;
}) {
  const done = spaceIsDone(space);
  const started = !done && spaceIsStarted(space);

  const hero = space.reference_images[0]?.image_url;
  const cta = done ? "Review" : started ? "Continue" : "Begin";

  return (
    <Paper className="overflow-hidden">
      <button
        type="button"
        onClick={() => onPick(space.id)}
        className="flex w-full items-stretch text-left transition-colors hover:bg-[rgba(61,43,31,0.02)]"
      >
        <div
          className="h-[84px] w-[84px] shrink-0 bg-cover bg-center sm:h-[96px] sm:w-[112px]"
          style={{
            backgroundColor: DECOR_COLORS.ivoryWarm,
            backgroundImage: hero ? `url(${hero})` : undefined,
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3 sm:p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <StatusDot
                tone={done ? "done" : started ? "progress" : "idle"}
              />
              <div
                className="truncate text-[16px] sm:text-[17px]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: DECOR_COLORS.cocoa,
                  fontWeight: 500,
                }}
              >
                {space.name}
              </div>
            </div>
            <div
              className="mt-1 flex flex-wrap items-center gap-1"
              style={{ fontFamily: FONT_MONO }}
            >
              {space.event_ids.length > 0 ? (
                space.event_ids.map((eid) => (
                  <span
                    key={eid}
                    className="rounded-full px-1.5 py-0.5 text-[9.5px] uppercase"
                    style={{
                      letterSpacing: "0.14em",
                      backgroundColor: DECOR_COLORS.ivoryWarm,
                      color: DECOR_COLORS.cocoaMuted,
                      border: `1px solid ${DECOR_COLORS.line}`,
                    }}
                  >
                    {EVENT_LABELS[eid] ?? eid}
                  </span>
                ))
              ) : (
                <span
                  className="text-[10px] uppercase"
                  style={{
                    letterSpacing: "0.16em",
                    color: DECOR_COLORS.cocoaFaint,
                  }}
                >
                  {DECOR_SPACE_TYPE_LABELS[space.space_type]}
                </span>
              )}
              {space.event_ids.length > 1 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] uppercase"
                  style={{
                    letterSpacing: "0.18em",
                    backgroundColor: DECOR_COLORS.marigold,
                    color: "#FFFFFF",
                  }}
                >
                  ✦ Flips
                </span>
              )}
            </div>
          </div>

          <div
            className="flex items-center justify-between text-[11.5px]"
            style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
          >
            <span className="italic">
              {done
                ? "Your decorator has what they need."
                : started
                  ? "You started this one — pick it up?"
                  : "Tap to begin"}
            </span>
            <span
              className="ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-[11px]"
              style={{
                fontFamily: FONT_UI,
                backgroundColor: done
                  ? "rgba(139, 158, 126, 0.18)"
                  : DECOR_COLORS.cocoa,
                color: done ? "#4F613F" : DECOR_COLORS.ivory,
              }}
            >
              {cta} →
            </span>
          </div>
        </div>
      </button>
    </Paper>
  );
}

function StatusDot({ tone }: { tone: "idle" | "progress" | "done" }) {
  const color =
    tone === "done"
      ? "#8B9E7E"
      : tone === "progress"
        ? DECOR_COLORS.marigold
        : DECOR_COLORS.cocoaFaint;
  return (
    <span
      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

// ── Guided flow (stepper) ───────────────────────────────────────────────────

function GuidedFlow({
  space,
  onExit,
}: {
  space: DecorSpaceCard;
  onExit: () => void;
}) {
  const steps = useMemo(() => flowSteps(space), [space.id, space.event_ids.join(",")]);
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  const goNext = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => {
    if (stepIdx === 0) onExit();
    else setStepIdx((i) => i - 1);
  };

  return (
    <Block>
      <StepperHeader
        space={space}
        stepIdx={stepIdx}
        stepCount={steps.length}
        onExit={onExit}
      />

      <div className="mx-auto max-w-[560px]">
        <Paper className="p-5 sm:p-6">
          {step.kind === "arrival" && (
            <ArrivalStep space={space} onContinue={goNext} />
          )}
          {step.kind === "vibe" && (
            <VibeStep
              space={space}
              event_id={step.event_id}
              onContinue={goNext}
            />
          )}
          {step.kind === "key_elements" && (
            <KeyElementsStep space={space} onContinue={goNext} />
          )}
          {step.kind === "references" && (
            <ReferencesStep space={space} onContinue={goNext} />
          )}
          {step.kind === "confirm" && (
            <ConfirmStep space={space} onFinish={onExit} />
          )}
        </Paper>

        {!isLast && (
          <div className="mt-4 flex items-center justify-between">
            <GhostButton onClick={goBack}>
              ← {stepIdx === 0 ? "Back to spaces" : "Back"}
            </GhostButton>
            <span
              className="text-[10.5px] uppercase"
              style={{
                fontFamily: FONT_MONO,
                letterSpacing: "0.22em",
                color: DECOR_COLORS.cocoaFaint,
              }}
            >
              Step {stepIdx + 1} of {steps.length}
            </span>
          </div>
        )}
      </div>
    </Block>
  );
}

function StepperHeader({
  space,
  stepIdx,
  stepCount,
  onExit,
}: {
  space: DecorSpaceCard;
  stepIdx: number;
  stepCount: number;
  onExit: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onExit}
        className="text-[12px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
      >
        ← All spaces
      </button>
      <div
        className="min-w-0 flex-1 truncate text-center text-[14px]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        {space.name}
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: stepCount }).map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full transition-all"
            style={{
              width: i === stepIdx ? 18 : 6,
              backgroundColor:
                i <= stepIdx ? DECOR_COLORS.cocoa : DECOR_COLORS.line,
            }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Arrival ─────────────────────────────────────────────────────────

function ArrivalStep({
  space,
  onContinue,
}: {
  space: DecorSpaceCard;
  onContinue: () => void;
}) {
  const firstEvent = space.event_ids[0];
  const prompt =
    (firstEvent && ARRIVAL_PROMPT[firstEvent]) ??
    `Imagine walking into ${space.name}. What does it feel like?`;

  const heroRefs = space.reference_images.slice(0, 3);

  return (
    <div>
      {heroRefs.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-1.5">
          {heroRefs.map((r, i) => (
            <div
              key={r.id}
              className="aspect-[3/4] overflow-hidden rounded-lg"
              style={{
                backgroundColor: DECOR_COLORS.ivoryWarm,
                transform: i === 1 ? "translateY(6px)" : undefined,
              }}
            >
              <img
                src={r.image_url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      <div
        className="mb-1.5 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        {firstEvent ? EVENT_LABELS[firstEvent] : DECOR_SPACE_TYPE_LABELS[space.space_type]}
      </div>
      <h3
        className="text-[22px] leading-[1.25]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        {space.name}
      </h3>
      <p
        className="mt-3 text-[15px] leading-[1.55]"
        style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaSoft }}
      >
        {prompt}
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={onContinue}>Begin →</PrimaryButton>
      </div>
    </div>
  );
}

// ── Step 2: Vibe (sliders + one-sentence) ───────────────────────────────────

function VibeStep({
  space,
  event_id,
  onContinue,
}: {
  space: DecorSpaceCard;
  event_id?: EventDayId;
  onContinue: () => void;
}) {
  const setVibe = useDecorStore((s) => s.setSpaceVibe);
  const setVibeByEvent = useDecorStore((s) => s.setSpaceVibeByEvent);

  const current = event_id
    ? (space.vibe_by_event[event_id] ?? "")
    : space.vibe_text;

  const [sliders, setSliders] = useState<VibeSliders>(DEFAULT_SLIDERS);
  const [text, setText] = useState(current);

  const vibePhrase = useMemo(() => phraseFromSliders(sliders), [sliders]);

  const commit = () => {
    const final = text.trim() || vibePhrase;
    if (event_id) setVibeByEvent(space.id, event_id, final);
    else setVibe(space.id, final);
    onContinue();
  };

  const label = event_id
    ? `How should ${space.name} feel during ${EVENT_LABELS[event_id] ?? event_id}?`
    : `How should ${space.name} feel?`;

  return (
    <div>
      <div
        className="mb-1.5 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        {event_id ? (EVENT_LABELS[event_id] ?? event_id) : "The vibe"}
      </div>
      <h3
        className="text-[19px] leading-[1.3]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        {label}
      </h3>
      <p
        className="mt-1 text-[13px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
      >
        No wrong answers. This is just for feeling.
      </p>

      <div className="mt-5 space-y-4">
        <SliderRow
          left="Intimate"
          right="Grand"
          value={sliders.intimacy}
          onChange={(v) => setSliders((s) => ({ ...s, intimacy: v }))}
        />
        <SliderRow
          left="Traditional"
          right="Modern"
          value={sliders.tradition}
          onChange={(v) => setSliders((s) => ({ ...s, tradition: v }))}
        />
        <SliderRow
          left="Lush"
          right="Minimal"
          value={sliders.density}
          onChange={(v) => setSliders((s) => ({ ...s, density: v }))}
        />
      </div>

      <div className="mt-5">
        <div
          className="mb-1.5 flex items-center justify-between"
          style={{ color: DECOR_COLORS.cocoaSoft }}
        >
          <label
            className="text-[11px] uppercase"
            style={{ fontFamily: FONT_MONO, letterSpacing: "0.18em" }}
          >
            In one sentence
          </label>
          <SparklePill
            label="Use my sliders"
            onClick={() => setText(vibePhrase)}
          />
        </div>
        <TextArea
          value={text}
          onChange={setText}
          rows={2}
          placeholder={`e.g. "${vibePhrase}"`}
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <PrimaryButton onClick={commit}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function SliderRow({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div
        className="mb-1 flex items-center justify-between text-[12px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
      >
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function phraseFromSliders(s: VibeSliders): string {
  const intimacy = s.intimacy < 34 ? "Intimate" : s.intimacy > 66 ? "Grand" : "Balanced";
  const tradition = s.tradition < 34 ? "traditional" : s.tradition > 66 ? "modern" : "classic-with-a-twist";
  const density = s.density < 34 ? "lush" : s.density > 66 ? "minimal" : "layered-but-restrained";
  return `${intimacy}, ${tradition}, and ${density}.`;
}

// ── Step 3: Key elements (with progressive disclosure) ──────────────────────

function KeyElementsStep({
  space,
  onContinue,
}: {
  space: DecorSpaceCard;
  onContinue: () => void;
}) {
  const [deeper, setDeeper] = useState(false);

  const allElements = useMemo(
    () => DECOR_ELEMENTS.filter((el) => el.space_types.includes(space.space_type)),
    [space.space_type],
  );

  const heroCats = HERO_CATEGORIES[space.space_type];
  const heroElements = allElements.filter((el) => heroCats.includes(el.category));
  const otherElements = allElements.filter((el) => !heroCats.includes(el.category));

  const groupedHero = groupByCategory(heroElements);
  const groupedOther = groupByCategory(otherElements);

  return (
    <div>
      <div
        className="mb-1.5 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        A few moments define this space
      </div>
      <h3
        className="text-[19px] leading-[1.3]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        React to what you see. ♡ sparks, ✕ doesn't.
      </h3>
      <p
        className="mt-1 text-[13px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
      >
        Your decorator uses the ♡'s to start, and the ✕'s to know what to skip.
      </p>

      <div className="mt-5 space-y-5">
        {groupedHero.map(([cat, els]) => (
          <CategoryGroup key={cat} space_id={space.id} category={cat} elements={els} />
        ))}
      </div>

      {groupedOther.length > 0 && (
        <div className="mt-6">
          {!deeper ? (
            <button
              type="button"
              onClick={() => setDeeper(true)}
              className="w-full rounded-xl border border-dashed px-4 py-3 text-left"
              style={{
                borderColor: DECOR_COLORS.line,
                backgroundColor: DECOR_COLORS.ivoryWarm,
              }}
            >
              <div
                className="text-[13px]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: DECOR_COLORS.cocoa,
                  fontWeight: 500,
                }}
              >
                Your decorator has enough to start. Want to go deeper?
              </div>
              <div
                className="mt-0.5 text-[11.5px]"
                style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
              >
                {groupedOther.length} more layers —{" "}
                {groupedOther.map(([c]) => ELEMENT_CATEGORY_LABELS[c] ?? c).join(", ")}
              </div>
            </button>
          ) : (
            <div className="space-y-5">
              {groupedOther.map(([cat, els]) => (
                <CategoryGroup
                  key={cat}
                  space_id={space.id}
                  category={cat}
                  elements={els}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function groupByCategory(elements: ElementCard[]): [string, ElementCard[]][] {
  const byCat: Record<string, ElementCard[]> = {};
  for (const el of elements) {
    if (!byCat[el.category]) byCat[el.category] = [];
    byCat[el.category].push(el);
  }
  return Object.entries(byCat);
}

function CategoryGroup({
  space_id,
  category,
  elements,
}: {
  space_id: string;
  category: string;
  elements: ElementCard[];
}) {
  return (
    <div>
      <div
        className="mb-2 text-[10.5px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.18em",
          color: DECOR_COLORS.cocoaFaint,
        }}
      >
        {ELEMENT_CATEGORY_LABELS[category] ?? category}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {elements.map((el) => (
          <ElementTile key={el.id} card_id={space_id} element={el} />
        ))}
      </div>
    </div>
  );
}

function ElementTile({
  card_id,
  element,
}: {
  card_id: string;
  element: ElementCard;
}) {
  const reactions = useDecorStore(
    (s) => s.space_cards.find((c) => c.id === card_id)?.element_reactions ?? {},
  );
  const reaction = reactions[element.id] ?? null;
  const setReaction = useDecorStore((s) => s.setSpaceElementReaction);

  return (
    <div
      className="rounded-lg border p-3 transition-colors"
      style={{
        borderColor:
          reaction === "love"
            ? DECOR_COLORS.rose
            : reaction === "not_for_us"
              ? DECOR_COLORS.cocoaFaint
              : DECOR_COLORS.line,
        backgroundColor:
          reaction === "love"
            ? "rgba(196, 118, 110, 0.08)"
            : reaction === "not_for_us"
              ? "rgba(176, 154, 134, 0.06)"
              : "#FFFFFF",
      }}
    >
      <div
        className="text-[13px] leading-snug"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoa, fontWeight: 500 }}
      >
        {element.name}
      </div>
      <div
        className="mt-0.5 text-[11.5px] leading-snug"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
      >
        {element.description}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <ReactionButton
          active={reaction === "love"}
          onClick={() =>
            setReaction(card_id, element.id, reaction === "love" ? null : "love")
          }
          tone="rose"
        >
          ♡ Love
        </ReactionButton>
        <ReactionButton
          active={reaction === "maybe"}
          onClick={() =>
            setReaction(card_id, element.id, reaction === "maybe" ? null : "maybe")
          }
          tone="gold"
        >
          ✧ Maybe
        </ReactionButton>
        <ReactionButton
          active={reaction === "not_for_us"}
          onClick={() =>
            setReaction(
              card_id,
              element.id,
              reaction === "not_for_us" ? null : "not_for_us",
            )
          }
          tone="neutral"
        >
          ✕
        </ReactionButton>
      </div>
    </div>
  );
}

function ReactionButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: "rose" | "gold" | "neutral";
  children: React.ReactNode;
}) {
  const toneColor =
    tone === "rose"
      ? DECOR_COLORS.rose
      : tone === "gold"
        ? DECOR_COLORS.marigold
        : DECOR_COLORS.cocoaFaint;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2.5 py-0.5 text-[10.5px] transition-colors"
      style={{
        fontFamily: FONT_UI,
        border: `1px solid ${active ? toneColor : DECOR_COLORS.line}`,
        backgroundColor: active ? toneColor : "transparent",
        color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
      }}
    >
      {children}
    </button>
  );
}

// ── Step 4: References ──────────────────────────────────────────────────────

function ReferencesStep({
  space,
  onContinue,
}: {
  space: DecorSpaceCard;
  onContinue: () => void;
}) {
  const addRef = useDecorStore((s) => s.addSpaceRefImage);
  const setRefReaction = useDecorStore((s) => s.setSpaceRefReaction);
  const removeRef = useDecorStore((s) => s.removeSpaceRefImage);
  const rec = useDecorStore((s) => s.space_ai_recommendations[space.id]);
  const setRec = useDecorStore((s) => s.setSpaceAIRecommendation);
  const [url, setUrl] = useState("");

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files).slice(0, 10)) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (typeof dataUrl === "string") addRef(space.id, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div
        className="mb-1.5 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        Photos of this space · inspiration
      </div>
      <h3
        className="text-[19px] leading-[1.3]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        Upload photos of the actual space, or pin inspiration.
      </h3>
      <p
        className="mt-1 text-[13px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
      >
        Venue photos help us tailor suggestions. Inspiration shots show what you
        love. Heart the ones that feel right.
      </p>

      {space.reference_images.length === 0 ? (
        <div className="mt-4">
          <EmptyState>No photos yet — upload or paste a link below.</EmptyState>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {space.reference_images.map((r) => (
            <div
              key={r.id}
              className="overflow-hidden rounded-md border"
              style={{ borderColor: DECOR_COLORS.line }}
            >
              <div className="relative">
                <img
                  src={r.image_url}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                {r.source === "user" && (
                  <button
                    type="button"
                    onClick={() => removeRef(space.id, r.id)}
                    className="absolute right-1 top-1 h-5 w-5 rounded-full bg-white/90 text-[11px]"
                    style={{ color: DECOR_COLORS.cocoa }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex gap-1 p-1.5">
                <ReactionButton
                  active={r.reaction === "love"}
                  onClick={() =>
                    setRefReaction(
                      space.id,
                      r.id,
                      r.reaction === "love" ? null : "love",
                    )
                  }
                  tone="rose"
                >
                  ♡
                </ReactionButton>
                <ReactionButton
                  active={r.reaction === "not_for_us"}
                  onClick={() =>
                    setRefReaction(
                      space.id,
                      r.id,
                      r.reaction === "not_for_us" ? null : "not_for_us",
                    )
                  }
                  tone="neutral"
                >
                  ✕
                </ReactionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TextField
          value={url}
          onChange={setUrl}
          placeholder="Paste an image URL…"
        />
        <GhostButton
          onClick={() => {
            const u = url.trim();
            if (!u) return;
            addRef(space.id, u);
            setUrl("");
          }}
        >
          Add link
        </GhostButton>
        <label
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] transition-colors hover:bg-white"
          style={{
            fontFamily: FONT_UI,
            borderColor: DECOR_COLORS.line,
            color: DECOR_COLORS.cocoaSoft,
          }}
        >
          ↑ Upload photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>

      {/* AI recommendations panel */}
      <div className="mt-6">
        {rec ? (
          <AIRecommendationsPanel
            recommendation={rec}
            onRegenerate={() =>
              setRec(generateSpaceAIRecommendation(space))
            }
          />
        ) : (
          <AIRecommendationsPrompt
            hasPhotos={space.reference_images.length > 0}
            onGenerate={() => setRec(generateSpaceAIRecommendation(space))}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-end">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function AIRecommendationsPrompt({
  hasPhotos,
  onGenerate,
}: {
  hasPhotos: boolean;
  onGenerate: () => void;
}) {
  return (
    <div
      className="rounded-xl border border-dashed p-4"
      style={{
        borderColor: DECOR_COLORS.line,
        backgroundColor: DECOR_COLORS.ivoryWarm,
      }}
    >
      <div
        className="mb-0.5 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
          color: DECOR_COLORS.marigold,
        }}
      >
        ✦ AI suggestions
      </div>
      <div
        className="text-[13.5px]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        Want ideas tailored to this space?
      </div>
      <p
        className="mt-0.5 text-[11.5px] leading-snug"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
      >
        {hasPhotos
          ? "We'll read your photos and suggest colours, themes, and décor elements that suit this space."
          : "Add a photo or two above for a closer read — or generate now based on what you've already told us."}
      </p>
      <div className="mt-3">
        <GhostButton onClick={onGenerate}>Generate suggestions →</GhostButton>
      </div>
    </div>
  );
}

function AIRecommendationsPanel({
  recommendation,
  onRegenerate,
}: {
  recommendation: SpaceAIRecommendation;
  onRegenerate: () => void;
}) {
  const [openSection, setOpenSection] = useState<
    "colors" | "themes" | "elements" | null
  >("colors");

  const Header = ({
    id,
    label,
    count,
  }: {
    id: "colors" | "themes" | "elements";
    label: string;
    count: number;
  }) => {
    const active = openSection === id;
    return (
      <button
        type="button"
        onClick={() => setOpenSection(active ? null : id)}
        className="flex w-full items-center justify-between border-b px-4 py-2 text-left transition-colors"
        style={{
          borderColor: DECOR_COLORS.line,
          backgroundColor: active ? "rgba(61, 43, 31, 0.03)" : "transparent",
        }}
      >
        <span
          className="text-[11.5px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaSoft,
          }}
        >
          {label}{" "}
          <span style={{ color: DECOR_COLORS.cocoaFaint }}>· {count}</span>
        </span>
        <span
          className="text-[11px]"
          style={{ color: DECOR_COLORS.cocoaMuted }}
        >
          {active ? "−" : "+"}
        </span>
      </button>
    );
  };

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: DECOR_COLORS.line,
        backgroundColor: DECOR_COLORS.ivoryWarm,
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: DECOR_COLORS.line }}
      >
        <div
          className="text-[10px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.22em",
            color: DECOR_COLORS.marigold,
          }}
        >
          ✦ AI suggestions for this space
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="text-[10.5px] underline decoration-dotted underline-offset-2 opacity-70 hover:opacity-100"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          Regenerate
        </button>
      </div>

      <Header id="colors" label="Colours" count={recommendation.colors.length} />
      {openSection === "colors" && (
        <div className="flex flex-wrap gap-2 p-4">
          {recommendation.colors.map((c) => (
            <div
              key={c.hex}
              className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11.5px]"
              style={{
                fontFamily: FONT_UI,
                border: `1px solid ${DECOR_COLORS.line}`,
                color: DECOR_COLORS.cocoaSoft,
              }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </div>
          ))}
        </div>
      )}

      <Header id="themes" label="Themes" count={recommendation.themes.length} />
      {openSection === "themes" && (
        <ul
          className="space-y-1.5 p-4 text-[12.5px] leading-snug"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          {recommendation.themes.map((t) => (
            <li key={t}>· {t}</li>
          ))}
        </ul>
      )}

      <Header
        id="elements"
        label="Décor elements"
        count={recommendation.elements.length}
      />
      {openSection === "elements" && (
        <ul
          className="space-y-1.5 p-4 text-[12.5px] leading-snug"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          {recommendation.elements.map((e) => (
            <li key={e}>· {e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Step 5: Confirm / recap ─────────────────────────────────────────────────

function ConfirmStep({
  space,
  onFinish,
}: {
  space: DecorSpaceCard;
  onFinish: () => void;
}) {
  const flips = space.event_ids.length > 1;

  const lovedElementNames = useMemo(() => {
    const lovedIds = Object.entries(space.element_reactions)
      .filter(([, r]) => r === "love")
      .map(([id]) => id);
    return DECOR_ELEMENTS.filter((el) => lovedIds.includes(el.id)).map(
      (el) => el.name,
    );
  }, [space.element_reactions]);

  const lovedRefCount = space.reference_images.filter(
    (r) => r.reaction === "love",
  ).length;

  return (
    <div>
      <div
        className="mb-1.5 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        One last look
      </div>
      <h3
        className="text-[19px] leading-[1.3]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        Here's {space.name} in your words.
      </h3>

      <div className="mt-5 space-y-4">
        {flips ? (
          space.event_ids.map((eid) => (
            <RecapLine
              key={eid}
              label={`${EVENT_LABELS[eid] ?? eid} vibe`}
              value={space.vibe_by_event[eid] ?? ""}
            />
          ))
        ) : (
          <RecapLine label="Vibe" value={space.vibe_text} />
        )}
        <RecapLine
          label={`Loved (${lovedElementNames.length})`}
          value={
            lovedElementNames.length === 0
              ? "—"
              : lovedElementNames.join(" · ")
          }
        />
        <RecapLine
          label="Loved references"
          value={
            lovedRefCount === 0
              ? "—"
              : `${lovedRefCount} image${lovedRefCount === 1 ? "" : "s"} hearted`
          }
        />
      </div>

      <div
        className="mt-6 rounded-xl border p-4"
        style={{
          borderColor: DECOR_COLORS.line,
          backgroundColor: DECOR_COLORS.ivoryWarm,
        }}
      >
        <div
          className="text-[12.5px] italic"
          style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaSoft }}
        >
          Your decorator will build a proposal from exactly this. You can come back and refine anytime.
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <PrimaryButton onClick={onFinish}>Save & back to spaces</PrimaryButton>
      </div>
    </div>
  );
}

function RecapLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="mb-1 text-[10px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.18em",
          color: DECOR_COLORS.cocoaFaint,
        }}
      >
        {label}
      </div>
      <div
        className="text-[14px] leading-relaxed"
        style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoa }}
      >
        {value || (
          <span style={{ color: DECOR_COLORS.cocoaFaint }}>
            (you skipped this — that's okay)
          </span>
        )}
      </div>
    </div>
  );
}
