"use client";

// ── Tab 1: Vision & Mood ────────────────────────────────────────────────────
// Narrative order (quiz → explore → summarise at the end):
//   Quiz · Keywords · Colour arc · Moodboard · Reference gallery · Want/Avoid
//   · Décor Brief (now at the bottom — summarise once context is built)

import { useRef, useState } from "react";
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
  PrimaryButton,
  GhostButton,
  EmptyState,
} from "../primitives";
import { QuizRunner } from "../quiz/QuizRunner";
import type { EventDayId } from "@/types/checklist";
import type {
  MoodboardTag,
  ColorSwatch,
  ReferenceImage,
  CuratedPalette,
} from "@/types/decor";
import { MOODBOARD_TAG_LABELS } from "@/types/decor";
import { CURATED_PALETTES } from "../catalog";
import { nameForHex } from "@/lib/decor/color-names";

const SUGGESTED_KEYWORDS = [
  "lush",
  "minimal",
  "garden-party",
  "regal",
  "candlelit",
  "marigold",
  "modern",
  "bohemian",
  "traditional",
  "romantic",
  "dramatic",
  "earthy",
  "opulent",
  "intimate",
  "whimsical",
];

const MOODBOARD_TAGS: MoodboardTag[] = [
  "all",
  "mandap",
  "entrance",
  "table",
  "lighting",
  "florals",
  "stage",
  "ceiling",
  "aisle",
];

export function VisionMoodTab() {
  const [quizOpen, setQuizOpen] = useState(false);
  const quizDone = useDecorStore((s) => s.quiz.completedAt !== null);

  return (
    <div>
      {/* Quiz banner (or summary if done) */}
      <Block>
        {quizOpen ? (
          <QuizRunner onClose={() => setQuizOpen(false)} />
        ) : quizDone ? (
          <QuizSummary onRetake={() => setQuizOpen(true)} />
        ) : (
          <QuizBanner onStart={() => setQuizOpen(true)} />
        )}
      </Block>

      {/* Style keywords */}
      <KeywordsBlock />

      {/* Formality — overall feel of the wedding (intimate ↔ grand) */}
      <FormalityBlock />

      {/* Colour story across events */}
      <ColorArcBlock />

      {/* Moodboard */}
      <MoodboardBlock />

      {/* Reference gallery by event */}
      <ReferenceGalleryBlock />

      {/* Want / Avoid */}
      <WantAvoidBlock />

      {/* Cultural & ritual requirements */}
      <CulturalRequirementsBlock />

      {/* Décor brief — final summary, after couples have explored */}
      <BriefBlock />
    </div>
  );
}

// ── Formality slider ────────────────────────────────────────────────────────
// Mirrors guided session 1 formality_score. Distinct from floral scale —
// this is about the wedding's overall feel (intimate vs. grand).
function FormalityBlock() {
  const score = useDecorStore((s) => s.formality_score);
  const setScore = useDecorStore((s) => s.setFormalityScore);

  const label =
    score < 25
      ? "Very intimate"
      : score < 45
        ? "Intimate & organic"
        : score < 60
          ? "Balanced"
          : score < 80
            ? "Grand & elevated"
            : "Grand & opulent";

  return (
    <Block>
      <SectionHead
        eyebrow="How formal should it feel?"
        title="Formality"
        body="The overall feel of the wedding. Intimate, organic, garden-party energy at one end. Grand, opulent, ballroom energy at the other."
      />
      <Paper className="p-5">
        <div className="flex items-center justify-between mb-2 text-[11.5px]"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
        >
          <span>Intimate & organic</span>
          <span
            className="text-[10.5px] uppercase"
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: "0.18em",
              color: DECOR_COLORS.cocoa,
            }}
          >
            {label}
          </span>
          <span>Grand & opulent</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full"
          aria-label="Formality"
        />
      </Paper>
    </Block>
  );
}

// ── Cultural & ritual requirements ──────────────────────────────────────────
// Sibling of Want/Avoid for cultural-specific notes (Ganesh placement,
// mandap orientation, etc.) — surfaced separately so they're easy for the
// decorator to scan.
function CulturalRequirementsBlock() {
  const items = useDecorStore((s) => s.cultural_requirements);
  const add = useDecorStore((s) => s.addCulturalRequirement);
  const remove = useDecorStore((s) => s.removeCulturalRequirement);
  const [draft, setDraft] = useState("");

  return (
    <Block>
      <SectionHead
        eyebrow="Cultural & ritual requirements"
        title="The traditions that shape the design"
        body="Anything specific to your family or rituals — placement, orientation, items that must be present."
      />
      <Paper className="p-5">
        <ul className="flex flex-col gap-1.5 mb-3">
          {items.length === 0 ? (
            <EmptyState>
              Add anything ceremonial that affects the décor — Ganesh
              placement, east-facing mandap, specific aisle for the bride&apos;s
              side.
            </EmptyState>
          ) : (
            items.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between gap-2 text-[13px]"
                style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
              >
                <span>· {n.body}</span>
                <button
                  type="button"
                  onClick={() => remove(n.id)}
                  className="opacity-40 hover:opacity-100"
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex gap-2">
          <TextField
            value={draft}
            onChange={setDraft}
            placeholder="e.g. Ganesh placement at the entrance"
          />
          <GhostButton
            onClick={() => {
              add(draft);
              setDraft("");
            }}
          >
            Add
          </GhostButton>
        </div>
      </Paper>
    </Block>
  );
}

// ── 1.1 Quiz banner ─────────────────────────────────────────────────────────
function QuizBanner({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5 shadow-[0_1px_2px_rgba(184,134,11,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-saffron)",
            }}
          >
            ✦ Not sure where to start?
          </p>
          <h3
            className="mt-1.5 text-[20px] leading-tight"
            style={{
              fontFamily: FONT_DISPLAY,
              color: "var(--color-ink)",
              fontWeight: 500,
            }}
          >
            Define your décor vision in 5 questions
          </h3>
          <p
            className="mt-1.5 max-w-2xl text-[13px] leading-relaxed"
            style={{ fontFamily: FONT_UI, color: "var(--color-ink-muted)" }}
          >
            Five questions about colour, mood, and how traditional vs. modern
            you want each event to feel. We&apos;ll draft your Décor Brief, seed
            your style keywords, and pre-set your colour story.
          </p>
          <p
            className="mt-2 text-[10.5px] uppercase tracking-[0.12em]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink-faint)",
            }}
          >
            5 questions · ~3 min
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <PrimaryButton onClick={onStart}>Start quiz →</PrimaryButton>
          <button
            type="button"
            className="text-[11.5px]"
            style={{
              fontFamily: FONT_UI,
              color: "var(--color-ink-muted)",
            }}
          >
            Skip, I&apos;ll fill it in myself
          </button>
        </div>
      </div>
    </section>
  );
}

function QuizSummary({ onRetake }: { onRetake: () => void }) {
  const quiz = useDecorStore((s) => s.quiz);
  return (
    <div
      className="rounded-[14px] border p-5 md:p-6 flex items-center justify-between gap-4 flex-wrap"
      style={{
        backgroundColor: DECOR_COLORS.ivoryWarm,
        borderColor: DECOR_COLORS.line,
      }}
    >
      <div>
        <div
          className="text-[10.5px] uppercase mb-1.5"
          style={{
            fontFamily: FONT_UI,
            letterSpacing: "0.22em",
            color: DECOR_COLORS.sage,
          }}
        >
          Quiz complete
        </div>
        <p
          className="text-[14px]"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          Feeling: <b>{quiz.feeling ?? "—"}</b> · Florals:{" "}
          <b>{quiz.florals ?? "—"}</b> · Colours: <b>{quiz.colors ?? "—"}</b> ·
          Focal: <b>{quiz.focal ?? "—"}</b>
        </p>
      </div>
      <GhostButton onClick={onRetake}>Retake quiz</GhostButton>
    </div>
  );
}

// ── Brief — summary block at the end of Vision & Mood ──────────────────────
function BriefBlock() {
  const brief = useDecorStore((s) => s.brief);
  const setBrief = useDecorStore((s) => s.setBrief);
  const keywords = useDecorStore((s) => s.style_keywords);
  const [loading, setLoading] = useState(false);

  async function generateBrief() {
    setLoading(true);
    try {
      const context = keywords.length > 0 ? `Style keywords: ${keywords.join(", ")}.` : "";
      const prompt = `Write a 3-4 sentence wedding décor brief for a couple. ${context} ${brief ? `Current draft: "${brief}"` : ""} Be evocative, specific, and concrete — describe textures, lighting, mood, and feeling.`;
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: "You are an expert wedding décor consultant writing a brief for the couple's decorator." }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) setBrief(data.result);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Block>
      <SectionHead
        eyebrow="Now that you've explored — summarise"
        title="Your Décor Brief"
        body="Pull your colours, spaces, lighting, and florals into a few sentences. This is the document your decorator reads first."
      >
        <SparklePill onClick={generateBrief} label={loading ? "Writing…" : undefined} />
      </SectionHead>
      <Paper className="p-5">
        <TextArea
          value={brief}
          onChange={setBrief}
          rows={6}
          placeholder="A few sentences describing the world you want to walk into — pulled from what you've already set above. We'll polish the structure."
        />
      </Paper>
    </Block>
  );
}

// ── 1.3 Keywords ─────────────────────────────────────────────────────────────
function KeywordsBlock() {
  const selected = useDecorStore((s) => s.style_keywords);
  const toggle = useDecorStore((s) => s.toggleKeyword);
  const add = useDecorStore((s) => s.addKeyword);
  const [custom, setCustom] = useState("");

  const allKeywords = Array.from(new Set([...SUGGESTED_KEYWORDS, ...selected]));

  return (
    <Block>
      <SectionHead
        eyebrow="Style language"
        title="Style keywords"
        body="Tap the ones that feel right. Add your own."
      />
      <div className="flex flex-wrap gap-2">
        {allKeywords.map((k) => {
          const active = selected.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              className="rounded-full border px-3 py-1.5 text-[12px] transition-colors"
              style={{
                fontFamily: FONT_UI,
                borderColor: active ? DECOR_COLORS.cocoa : DECOR_COLORS.line,
                backgroundColor: active ? DECOR_COLORS.cocoa : "#FFFFFF",
                color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
              }}
            >
              {active ? "− " : "+ "}
              {k}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <TextField
          value={custom}
          onChange={setCustom}
          placeholder="Add your own keyword..."
          className="max-w-xs"
        />
        <GhostButton
          onClick={() => {
            if (custom.trim()) {
              add(custom.trim());
              setCustom("");
            }
          }}
        >
          Add
        </GhostButton>
      </div>
    </Block>
  );
}

// ── Color arc ────────────────────────────────────────────────────────────────
function ColorArcBlock() {
  const palettes = useDecorStore((s) => s.event_palettes);
  const updateSwatch = useDecorStore((s) => s.updateSwatch);
  const addSwatch = useDecorStore((s) => s.addSwatch);
  const removeSwatch = useDecorStore((s) => s.removeSwatch);
  const applyCurated = useDecorStore((s) => s.applyCuratedPalette);

  const [suggestFor, setSuggestFor] = useState<EventDayId | null>(null);

  return (
    <Block>
      <SectionHead
        eyebrow="Your colour arc — the source palette"
        title="Colour Story Across Events"
        body="This palette is the canonical colour story for your wedding. Change it here and it flows to Stationery, Wardrobe & Styling, and Cake & Sweets."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {palettes.map((p) => (
          <EventPaletteCard
            key={p.event_id}
            event_id={p.event_id}
            label={p.label}
            swatches={p.swatches}
            onUpdate={(sid, patch) => updateSwatch(p.event_id, sid, patch)}
            onAdd={() => addSwatch(p.event_id)}
            onRemove={(sid) => removeSwatch(p.event_id, sid)}
            onSuggest={() => setSuggestFor(p.event_id)}
          />
        ))}
      </div>
      <div
        className="mt-4 text-[12.5px] italic"
        style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaFaint }}
      >
        ✦ Pick a colour and we'll name it. Browse curated palettes with "Explore
        palettes" if you want a starting point.
      </div>

      {suggestFor && (
        <PaletteSuggester
          event_id={suggestFor}
          eventLabel={palettes.find((p) => p.event_id === suggestFor)?.label ?? ""}
          onApply={(swatches) => {
            applyCurated(suggestFor, swatches);
            setSuggestFor(null);
          }}
          onClose={() => setSuggestFor(null)}
        />
      )}
    </Block>
  );
}

function EventPaletteCard({
  label,
  swatches,
  onUpdate,
  onAdd,
  onRemove,
  onSuggest,
}: {
  event_id: EventDayId;
  label: string;
  swatches: ColorSwatch[];
  onUpdate: (swatch_id: string, patch: Partial<ColorSwatch>) => void;
  onAdd: () => void;
  onRemove: (swatch_id: string) => void;
  onSuggest: () => void;
}) {
  return (
    <Paper className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className="text-[11px] uppercase"
          style={{
            fontFamily: FONT_UI,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          {label}
        </div>
        <button
          type="button"
          onClick={onSuggest}
          className="text-[10.5px] underline decoration-dotted underline-offset-2 opacity-70 hover:opacity-100"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          Explore palettes
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {swatches.map((sw) => (
          <li key={sw.id} className="flex items-center gap-2">
            <label
              className="h-7 w-7 rounded-full shrink-0 cursor-pointer border"
              style={{
                backgroundColor: sw.hex,
                borderColor: DECOR_COLORS.line,
              }}
            >
              <input
                type="color"
                value={sw.hex}
                onChange={(e) => {
                  const hex = e.target.value;
                  onUpdate(sw.id, { hex, name: nameForHex(hex) });
                }}
                className="opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            <input
              type="text"
              value={sw.name}
              onChange={(e) => onUpdate(sw.id, { name: e.target.value })}
              className="flex-1 text-[12px] bg-transparent border-b outline-none py-0.5"
              style={{
                fontFamily: FONT_UI,
                color: DECOR_COLORS.cocoa,
                borderColor: DECOR_COLORS.lineSoft,
              }}
            />
            <button
              type="button"
              onClick={() => onRemove(sw.id)}
              className="text-[11px] opacity-50 hover:opacity-100"
              style={{ color: DECOR_COLORS.cocoaMuted }}
              aria-label="Remove swatch"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2.5 text-[11.5px] opacity-70 hover:opacity-100"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
      >
        + Add colour
      </button>
    </Paper>
  );
}

// ── Palette suggester: lightweight modal carousel ──────────────────────────
function PaletteSuggester({
  event_id: _event_id,
  eventLabel,
  onApply,
  onClose,
}: {
  event_id: EventDayId;
  eventLabel: string;
  onApply: (swatches: { hex: string; name: string }[]) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const palette: CuratedPalette = CURATED_PALETTES[index];
  const prev = () =>
    setIndex((i) => (i - 1 + CURATED_PALETTES.length) % CURATED_PALETTES.length);
  const next = () => setIndex((i) => (i + 1) % CURATED_PALETTES.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(61, 43, 31, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[14px] border"
        style={{
          backgroundColor: DECOR_COLORS.ivory,
          borderColor: DECOR_COLORS.line,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={{ borderColor: DECOR_COLORS.line }}
        >
          <div>
            <div
              className="text-[10px] uppercase"
              style={{
                fontFamily: FONT_MONO,
                letterSpacing: "0.22em",
                color: DECOR_COLORS.cocoaMuted,
              }}
            >
              Explore palettes · {eventLabel}
            </div>
            <div
              className="mt-0.5 text-[10.5px]"
              style={{
                fontFamily: FONT_MONO,
                color: DECOR_COLORS.cocoaFaint,
                letterSpacing: "0.12em",
              }}
            >
              {index + 1} / {CURATED_PALETTES.length}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[18px] opacity-60 hover:opacity-100"
            style={{ color: DECOR_COLORS.cocoa }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <div
            className="flex h-24 overflow-hidden rounded-[10px]"
            style={{ border: `1px solid ${DECOR_COLORS.line}` }}
          >
            {palette.swatches.map((sw, i) => (
              <div
                key={`${palette.id}-${i}`}
                className="flex-1"
                style={{ backgroundColor: sw.hex }}
                title={`${sw.name} ${sw.hex}`}
              />
            ))}
          </div>
          <h4
            className="mt-4 text-[18px] leading-tight"
            style={{
              fontFamily: FONT_DISPLAY,
              color: DECOR_COLORS.cocoa,
              fontWeight: 500,
            }}
          >
            {palette.name}
          </h4>
          <p
            className="mt-1 text-[12.5px] italic"
            style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaSoft }}
          >
            {palette.mood}
          </p>
          <ul
            className="mt-3 flex flex-wrap gap-1.5 text-[11px]"
            style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
          >
            {palette.swatches.map((sw, i) => (
              <li
                key={`${palette.id}-label-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
                style={{ border: `1px solid ${DECOR_COLORS.line}` }}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: sw.hex }}
                />
                {sw.name}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-3"
          style={{ borderColor: DECOR_COLORS.line }}
        >
          <div className="flex items-center gap-1">
            <GhostButton onClick={prev}>← Previous</GhostButton>
            <GhostButton onClick={next}>Next →</GhostButton>
          </div>
          <PrimaryButton onClick={() => onApply(palette.swatches)}>
            Apply to {eventLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ── 1.5 Moodboard ────────────────────────────────────────────────────────────
function MoodboardBlock() {
  const pins = useDecorStore((s) => s.moodboard_pins);
  const tag = useDecorStore((s) => s.active_moodboard_tag);
  const setTag = useDecorStore((s) => s.setMoodboardTag);
  const addPin = useDecorStore((s) => s.addMoodboardPin);
  const removePin = useDecorStore((s) => s.removeMoodboardPin);

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered =
    tag === "all" ? pins : pins.filter((p) => p.element_tag === tag);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      const t = tag === "all" ? "florals" : (tag as Exclude<MoodboardTag, "all">);
      addPin({ image_url: objectUrl, caption: file.name, event_id: null, element_tag: t });
    });
    e.target.value = "";
  }

  return (
    <Block>
      <SectionHead
        eyebrow="Reference collage"
        title="Décor Moodboard"
        body="Paste URLs, drop files, tag each pin by element."
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <TextField
          value={url}
          onChange={setUrl}
          placeholder="Paste an image URL..."
        />
        <TextField
          value={caption}
          onChange={setCaption}
          placeholder="Caption (optional)"
          className="max-w-xs"
        />
        <GhostButton
          onClick={() => {
            if (!url.trim()) return;
            const t =
              tag === "all"
                ? "florals"
                : (tag as Exclude<MoodboardTag, "all">);
            addPin({
              image_url: url.trim(),
              caption,
              event_id: null,
              element_tag: t,
            });
            setUrl("");
            setCaption("");
          }}
        >
          Add
        </GhostButton>
        <GhostButton onClick={() => fileInputRef.current?.click()}>↑ Upload</GhostButton>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {MOODBOARD_TAGS.map((t) => {
          const active = tag === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className="rounded-full px-3 py-1 text-[11px] transition-colors"
              style={{
                fontFamily: FONT_UI,
                letterSpacing: "0.04em",
                backgroundColor: active
                  ? DECOR_COLORS.cocoa
                  : "transparent",
                color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaMuted,
                border: `1px solid ${active ? DECOR_COLORS.cocoa : DECOR_COLORS.line}`,
              }}
            >
              {MOODBOARD_TAG_LABELS[t].toUpperCase()}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState>
          Nothing pinned here yet — paste a URL above or pick a different tag.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <Paper key={p.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={p.image_url}
                  alt={p.caption || "Moodboard pin"}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removePin(p.id)}
                  className="absolute top-2 right-2 rounded-full bg-white/90 w-6 h-6 text-[13px]"
                  style={{ color: DECOR_COLORS.cocoa }}
                  aria-label="Remove pin"
                >
                  ×
                </button>
              </div>
              <div
                className="p-2 text-[11.5px] truncate"
                style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
              >
                {p.caption || MOODBOARD_TAG_LABELS[p.element_tag]}
              </div>
            </Paper>
          ))}
        </div>
      )}
    </Block>
  );
}

// ── 1.6 Reference gallery by event ──────────────────────────────────────────
const REFERENCE_EVENTS: { id: EventDayId; label: string }[] = [
  { id: "haldi", label: "Haldi" },
  { id: "mehndi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "wedding", label: "Wedding" },
  { id: "reception", label: "Reception" },
];

const REFERENCE_PROMPTS: Partial<Record<EventDayId, string>> = {
  haldi: "What should your Haldi décor feel like?",
  mehndi: "What should your Mehendi décor feel like?",
  sangeet: "What should your Sangeet décor feel like?",
  wedding: "What should your wedding ceremony décor feel like?",
  reception: "What should your reception décor feel like?",
};

function ReferenceGalleryBlock() {
  const references = useDecorStore((s) => s.references);
  const setReaction = useDecorStore((s) => s.setReferenceReaction);
  const addRef = useDecorStore((s) => s.addReference);
  const removeRef = useDecorStore((s) => s.removeReference);

  const [activeEvent, setActiveEvent] = useState<EventDayId>("haldi");
  const [newUrl, setNewUrl] = useState("");

  const eventRefs = references.filter((r) => r.event_id === activeEvent);

  return (
    <Block>
      <SectionHead
        eyebrow="Suggested reference looks"
        title="Reference gallery by event"
        body="Browse our suggestions, add your own, tell us what you love."
      />

      <div className="flex flex-wrap gap-1.5 mb-4">
        {REFERENCE_EVENTS.map((e) => {
          const active = activeEvent === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setActiveEvent(e.id)}
              className="rounded-full px-3.5 py-1.5 text-[12px] transition-colors"
              style={{
                fontFamily: FONT_UI,
                backgroundColor: active
                  ? DECOR_COLORS.cocoa
                  : "#FFFFFF",
                color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
                border: `1px solid ${active ? DECOR_COLORS.cocoa : DECOR_COLORS.line}`,
              }}
            >
              {e.label}
            </button>
          );
        })}
      </div>

      <p
        className="mb-4 text-[14px] italic"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoaSoft,
        }}
      >
        {REFERENCE_PROMPTS[activeEvent] ?? "What should this event feel like?"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {eventRefs.map((r) => (
          <ReferenceCard
            key={r.id}
            reference={r}
            onReact={(reaction) => setReaction(r.id, reaction)}
            onRemove={() => removeRef(r.id)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <TextField
          value={newUrl}
          onChange={setNewUrl}
          placeholder={`Add your own reference for ${REFERENCE_EVENTS.find((e) => e.id === activeEvent)?.label}...`}
        />
        <GhostButton
          onClick={() => {
            if (!newUrl.trim()) return;
            addRef(activeEvent, newUrl.trim());
            setNewUrl("");
          }}
        >
          Add
        </GhostButton>
      </div>
    </Block>
  );
}

function ReferenceCard({
  reference,
  onReact,
  onRemove,
}: {
  reference: ReferenceImage;
  onReact: (r: "love" | "not_for_us" | null) => void;
  onRemove: () => void;
}) {
  const { reaction } = reference;
  return (
    <Paper className="overflow-hidden">
      <div className="relative">
        <img
          src={reference.image_url}
          alt="Reference"
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
        {reference.source === "user" ? (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 rounded-full bg-white/90 w-6 h-6 text-[13px]"
            style={{ color: DECOR_COLORS.cocoa }}
            aria-label="Remove"
          >
            ×
          </button>
        ) : (
          <div
            className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] uppercase"
            style={{
              fontFamily: FONT_UI,
              letterSpacing: "0.18em",
              color: DECOR_COLORS.marigold,
            }}
          >
            ✦ Suggested
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-2 gap-2">
        <button
          type="button"
          onClick={() => onReact(reaction === "love" ? null : "love")}
          className="flex-1 rounded-full px-2.5 py-1 text-[11px] transition-colors"
          style={{
            fontFamily: FONT_UI,
            backgroundColor:
              reaction === "love"
                ? DECOR_COLORS.rose
                : "transparent",
            color:
              reaction === "love" ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
            border: `1px solid ${reaction === "love" ? DECOR_COLORS.rose : DECOR_COLORS.line}`,
          }}
        >
          ♡ Love
        </button>
        <button
          type="button"
          onClick={() =>
            onReact(reaction === "not_for_us" ? null : "not_for_us")
          }
          className="flex-1 rounded-full px-2.5 py-1 text-[11px] transition-colors"
          style={{
            fontFamily: FONT_UI,
            backgroundColor:
              reaction === "not_for_us"
                ? DECOR_COLORS.cocoaFaint
                : "transparent",
            color:
              reaction === "not_for_us" ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
            border: `1px solid ${reaction === "not_for_us" ? DECOR_COLORS.cocoaFaint : DECOR_COLORS.line}`,
          }}
        >
          ✕ Not for us
        </button>
      </div>
    </Paper>
  );
}

// ── 1.7 Want / Avoid ─────────────────────────────────────────────────────────
function WantAvoidBlock() {
  const notes = useDecorStore((s) => s.vision_notes);
  const addNote = useDecorStore((s) => s.addVisionNote);
  const removeNote = useDecorStore((s) => s.removeVisionNote);

  const [want, setWant] = useState("");
  const [avoid, setAvoid] = useState("");

  const wantNotes = notes.filter((n) => n.kind === "want");
  const avoidNotes = notes.filter((n) => n.kind === "avoid");

  return (
    <Block>
      <SectionHead
        eyebrow="Non-negotiables and deal-breakers"
        title="I definitely want · Please don't include"
        body="Short lines the decorator can scan in seconds."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Paper className="p-5">
          <div
            className="mb-3 text-[11px] uppercase"
            style={{
              fontFamily: FONT_UI,
              letterSpacing: "0.2em",
              color: DECOR_COLORS.sage,
            }}
          >
            I definitely want
          </div>
          <ul className="flex flex-col gap-1.5 mb-3">
            {wantNotes.length === 0 ? (
              <EmptyState>Nothing yet — add the things you can't skip.</EmptyState>
            ) : (
              wantNotes.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-2 text-[13px]"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
                >
                  <span>· {n.body}</span>
                  <button
                    type="button"
                    onClick={() => removeNote(n.id)}
                    className="opacity-40 hover:opacity-100"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="flex gap-2">
            <TextField
              value={want}
              onChange={setWant}
              placeholder="e.g. Real jasmine at the mandap"
            />
            <GhostButton
              onClick={() => {
                addNote("want", want);
                setWant("");
              }}
            >
              Add
            </GhostButton>
          </div>
        </Paper>

        <Paper className="p-5">
          <div
            className="mb-3 text-[11px] uppercase"
            style={{
              fontFamily: FONT_UI,
              letterSpacing: "0.2em",
              color: DECOR_COLORS.sindoor,
            }}
          >
            Please don't include
          </div>
          <ul className="flex flex-col gap-1.5 mb-3">
            {avoidNotes.length === 0 ? (
              <EmptyState>Nothing yet — list any flowers, colours, or motifs to steer clear of.</EmptyState>
            ) : (
              avoidNotes.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-2 text-[13px]"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
                >
                  <span>· {n.body}</span>
                  <button
                    type="button"
                    onClick={() => removeNote(n.id)}
                    className="opacity-40 hover:opacity-100"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="flex gap-2">
            <TextField
              value={avoid}
              onChange={setAvoid}
              placeholder="e.g. No baby's breath, no lilies"
            />
            <GhostButton
              onClick={() => {
                addNote("avoid", avoid);
                setAvoid("");
              }}
            >
              Add
            </GhostButton>
          </div>
        </Paper>
      </div>
    </Block>
  );
}
