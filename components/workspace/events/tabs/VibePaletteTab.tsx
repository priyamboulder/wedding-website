"use client";

// ── Events / Vibe & Palette tab (rebuild) ────────────────────────────────
// Discovery-first. Opens with a contextual 4–5 question quiz. Then style
// keywords, palette selection, moodboard, reference gallery, and the
// classic "I definitely want / Don't want" lists. Every section is a
// creative surface — no logistical form fields. The couple REACTS and
// builds taste; the Brief tab assembles their answers later.

import { useMemo } from "react";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import { MOOD_TILE_OPTIONS, PALETTE_LIBRARY } from "@/lib/events-seed";
import { getInspirationImagesFor } from "@/lib/events/inspiration-seed";
import { getVibeQuiz } from "@/lib/events/event-quizzes";
import type { EventRecord } from "@/types/events";
import { BriefTextareaBlock } from "@/components/workspace/shared/BriefTextareaBlock";
import { StyleKeywordsBlock } from "@/components/workspace/shared/StyleKeywordsBlock";
import {
  ReferenceGalleryBlock,
  type ReferenceTile,
} from "@/components/workspace/shared/ReferenceGalleryBlock";
import { WantAvoidLists } from "@/components/workspace/shared/WantAvoidLists";
import {
  SectionHead,
  SectionShell,
} from "@/components/workspace/shared/SectionHead";
import { EventQuizCard } from "../EventQuizCard";

// Suggested style keywords — event-type-aware so a Sangeet feels different
// from a Haldi. Fallback set for anything not explicitly listed.
const KEYWORDS_BY_TYPE: Record<string, string[]> = {
  sangeet: [
    "glamorous", "high-energy", "theatrical", "bollywood", "intimate",
    "rooftop", "garden-party", "black-tie", "colourful", "moody",
    "maximalist", "dance-floor", "lounge-vibes", "live-music",
  ],
  reception: [
    "editorial", "black-tie", "candlelit", "grand", "warm", "dinner-party",
    "floral", "intimate", "golden-hour", "minimal-ornate", "elevated",
  ],
  haldi: [
    "marigold", "turmeric", "daylight", "courtyard", "intimate", "boho",
    "minimalist", "family-first", "saturated", "acoustic",
  ],
  pithi: [
    "warm", "traditional", "turmeric", "family", "daylight", "intimate",
    "ritual-first", "golden", "handmade",
  ],
  mehendi: [
    "henna", "afternoon", "garden", "boho", "jasmine", "marigold",
    "playful", "colourful", "acoustic", "golden-hour",
  ],
  ceremony: [
    "ceremonial", "sacred", "mandap", "florals", "warm", "traditional",
    "timeless", "ritual-rich", "quiet-awe",
  ],
};
const DEFAULT_KEYWORDS = [
  "warm", "editorial", "intimate", "traditional", "playful",
  "moody", "candid", "ceremonial", "ornate", "minimal",
];

export function VibePaletteTab({ event }: { event: EventRecord }) {
  const setEventMood = useEventsStore((s) => s.setEventMood);
  const setEventPalette = useEventsStore((s) => s.setEventPalette);
  const setEventPaletteInherits = useEventsStore((s) => s.setEventPaletteInherits);
  const setEventVibeIntro = useEventsStore((s) => s.setEventVibeIntro);
  const setEventVibeKeywords = useEventsStore((s) => s.setEventVibeKeywords);
  const setEventVibeWants = useEventsStore((s) => s.setEventVibeWants);
  const setEventVibeAvoids = useEventsStore((s) => s.setEventVibeAvoids);
  const setEventPinterestUrl = useEventsStore((s) => s.setEventPinterestUrl);
  const toggleFavoriteImage = useEventsStore((s) => s.toggleFavoriteImage);
  const setVibeQuizAnswer = useEventsStore((s) => s.setEventVibeQuizAnswer);
  const setMovieReference = useEventsStore((s) => s.setEventMovieReference);

  const questions = useMemo(() => getVibeQuiz(event.type), [event.type]);

  const inspirationTiles = useMemo<ReferenceTile[]>(() => {
    const imgs = getInspirationImagesFor(event.type, 12);
    return imgs.map((img) => ({
      id: img.id,
      paletteHex: img.paletteHex,
      url: img.url,
    }));
  }, [event.type]);

  const suggestedKeywords = KEYWORDS_BY_TYPE[event.type] ?? DEFAULT_KEYWORDS;

  function handleQuizAnswer(key: string, value: unknown) {
    setVibeQuizAnswer(event.id, key, value);
    // "movie_reference" / "moment" keys carry emotional anchors — mirror
    // them into dedicated fields so the Brief tab can find them easily.
    if (key === "movie_reference" && typeof value === "string") {
      setMovieReference(event.id, value);
    }
  }

  return (
    <div className="space-y-11">
      <EventQuizCard
        eyebrow={`${displayEventLabel(event.type)} in ${questions.length} questions`}
        title="Find the vibe"
        blurb="A few quick questions shape the feeling of this event. Skip if you already know what you want."
        questions={questions}
        answers={event.vibeQuizAnswers ?? {}}
        onAnswer={handleQuizAnswer}
      />

      <SectionShell>
        <SectionHead
          eyebrow="AI directions"
          title="A direction to start from"
          hint="Pick one that feels close — you can steer further with notes and keywords below."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {MOOD_TILE_OPTIONS.map((m) => {
            const active = event.moodTile === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setEventMood(event.id, active ? null : m.id)}
                aria-pressed={active}
                className={cn(
                  "group flex h-[132px] flex-col overflow-hidden rounded-md border text-left transition-all",
                  active
                    ? "border-saffron shadow-[0_0_0_2px_rgba(212,162,76,0.25)]"
                    : "border-border hover:border-gold/60",
                )}
              >
                <div
                  className="h-12"
                  style={{
                    background: `linear-gradient(135deg, ${m.baseHex} 0%, ${m.accentHex} 100%)`,
                  }}
                />
                <div className="flex-1 bg-white px-3 py-2">
                  <p className="font-serif text-[14px] leading-tight text-ink">
                    {m.name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                    {m.blurb}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Refine with a note"
          title="Tell us what's missing"
          hint="Anything the direction above doesn't capture — we'll feed it to vendors and AI."
        />
        <BriefTextareaBlock
          variant="flat"
          title="Refine with a note"
          value={event.vibeIntro}
          onChange={(v) => setEventVibeIntro(event.id, v)}
          placeholder="We love garden romance, but ours leans a little moodier — dusk, candlelight, long tables…"
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Style keywords"
          title="Words for the feeling"
          hint="Tap the ones that feel right. Add your own."
        />
        <StyleKeywordsBlock
          variant="flat"
          suggestions={suggestedKeywords}
          selected={event.vibeKeywords ?? []}
          onChange={(v) => setEventVibeKeywords(event.id, v)}
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Palette"
          title="A colour story for this event"
          hint="Does this event share the wedding palette, or have its own story?"
          right={
            <div className="flex gap-2">
              <PaletteToggleButton
                active={event.paletteInherits}
                onClick={() => setEventPaletteInherits(event.id, true)}
              >
                Follow wedding palette
              </PaletteToggleButton>
              <PaletteToggleButton
                active={!event.paletteInherits}
                onClick={() => setEventPaletteInherits(event.id, false)}
              >
                Own palette
              </PaletteToggleButton>
            </div>
          }
        />

        {!event.paletteInherits && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE_LIBRARY.slice(0, 9).map((p) => {
              const active = event.paletteId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setEventPalette(event.id, active ? null : p.id)
                  }
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-md border text-left transition-colors",
                    active
                      ? "border-saffron shadow-[0_0_0_2px_rgba(212,162,76,0.25)]"
                      : "border-border hover:border-gold/60",
                  )}
                >
                  <div className="flex h-10">
                    {p.colors.map((c) => (
                      <span
                        key={c.hex}
                        style={{ backgroundColor: c.hex }}
                        className="flex-1"
                      />
                    ))}
                  </div>
                  <div className="bg-white px-3 py-2">
                    <p className="font-serif text-[14px] text-ink">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                      {p.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Inspiration"
          title="Images that pull you in"
          hint="Love the ones that feel right. Mark what isn't for you."
        />
        <ReferenceGalleryBlock
          variant="flat"
          tiles={inspirationTiles}
          favoritedIds={event.favoritedImageIds ?? []}
          onToggleLove={(id) => toggleFavoriteImage(event.id, id)}
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Pinterest board"
          title="Paste a board URL"
          hint="We'll sync boards into the gallery above in a future step."
        />
        <div className="flex items-center gap-2">
          <Pin size={13} strokeWidth={1.8} className="shrink-0 text-ink-faint" />
          <input
            value={event.pinterestBoardUrl ?? ""}
            onChange={(e) =>
              setEventPinterestUrl(event.id, e.target.value || null)
            }
            placeholder="https://pinterest.com/you/your-board"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold/60"
          />
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Wants & not-fors"
          title="What this event absolutely is — and isn't"
        />
        <WantAvoidLists
          variant="flat"
          wants={event.vibeWants ?? []}
          avoids={event.vibeAvoids ?? []}
          onChangeWants={(v) => setEventVibeWants(event.id, v)}
          onChangeAvoids={(v) => setEventVibeAvoids(event.id, v)}
          wantPlaceholder="e.g. a moment where the lights dim and everyone has sparklers…"
          avoidPlaceholder="e.g. no cheesy games, no cringe MC moments…"
        />
      </SectionShell>
    </div>
  );
}

function PaletteToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-3.5 py-1.5 text-[12.5px] transition-colors",
        active
          ? "border-saffron bg-saffron-pale/30 text-ink"
          : "border-border bg-white text-ink-muted hover:border-gold/60 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function displayEventLabel(type: string): string {
  const map: Record<string, string> = {
    pithi: "Pithi",
    haldi: "Haldi",
    mehendi: "Mehendi",
    sangeet: "Sangeet",
    garba: "Garba",
    baraat: "Baraat",
    ceremony: "Ceremony",
    cocktail: "Cocktail hour",
    reception: "Reception",
    after_party: "After-party",
    welcome_dinner: "Welcome dinner",
    farewell_brunch: "Farewell brunch",
    custom: "This event",
  };
  return map[type] ?? "This event";
}
