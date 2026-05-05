"use client";

// ── Stationery · Vision & Mood tab ─────────────────────────────────────────
// Mirrors the Photography workspace's canonical Vision & Mood layout: a
// compact quiz strip (full entry card only on first visit), a structured
// Paper Brief, a full-width style keywords chip selector, a colour & tone
// slider/preview, a full-width moodboard, and stationery-specific paper +
// palette blocks below.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  Languages,
  Layers,
  MessageSquarePlus,
  Plus,
  Sparkles,
  Trash2,
  Type as TypeIcon,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useVisionStore } from "@/stores/vision-store";
import { useStationeryStore } from "@/stores/stationery-store";
import { useDecorStore } from "@/stores/decor-store";
import { useQuizStore } from "@/stores/quiz-store";
import { track } from "@/lib/telemetry";
import type {
  MoodboardReaction,
  MoodboardTag,
  WorkspaceCategory,
} from "@/types/workspace";
import {
  STATIONERY_MOTIF_TAGS,
  STATIONERY_MOTIF_TAG_LABEL,
  STATIONERY_PAPER_TEXTURE_DESCRIPTION,
  STATIONERY_PAPER_TEXTURE_LABEL,
  STATIONERY_SCRIPT_LANGUAGES,
  STATIONERY_SCRIPT_LANGUAGE_LABEL,
  STATIONERY_TYPOGRAPHY_VIBE_DESCRIPTION,
  STATIONERY_TYPOGRAPHY_VIBE_LABEL,
  type StationeryPaperTexture,
  type StationeryTypographyVibe,
} from "@/types/stationery";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { DragDropZone } from "@/components/workspace/editable/DragDropZone";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { AnimatePresence } from "framer-motion";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { getQuizSchema } from "@/lib/quiz/registry";
import { StyleKeywordsBlock } from "@/components/workspace/shared/StyleKeywordsBlock";
import { BriefTextareaBlock } from "@/components/workspace/shared/BriefTextareaBlock";
import { StationeryPieceGallery } from "@/components/workspace/stationery/StationeryPieceGallery";
import type { QuizSchema } from "@/types/quiz";

const CATEGORY = "stationery" as const;
const VISION_QUIZ = getQuizSchema(CATEGORY, "vision");

const STATIONERY_TONE_SCALE_KEY = "ananya:stationery-tone-scale";
const STATIONERY_TONE_PRESET_KEY = "ananya:stationery-tone-preset";

const SUGGESTED_STATIONERY_KEYWORDS = [
  "letterpress",
  "minimalist",
  "gold-foil",
  "botanical",
  "hand-lettered",
  "vintage",
  "modern-clean",
  "textured",
  "watercolour",
  "monogram",
];

// ── Tab ───────────────────────────────────────────────────────────────────

export function StationeryVisionMoodTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      {VISION_QUIZ && (
        <QuizSurface schema={VISION_QUIZ} categoryId={category.id} />
      )}

      <PaperBrief />

      <StyleKeywordsSection />

      <TypographyVibeSection />

      <BilingualSection />

      <MotifPreferencesSection />

      <ColourAndToneSection />

      <MoodboardSection category={category} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PaperTextureSection />
        <PalettePullSection />
      </div>

      <StationeryPieceGallery category={category} />

      {VISION_QUIZ && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={VISION_QUIZ} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── Quiz surface ──────────────────────────────────────────────────────────
// Full entry card when the couple has never seen the quiz; collapses to a
// compact "N questions · ~M min" strip once they've dismissed or completed
// it. Matches Photography's pattern so the discovery moment only steals
// real estate the first time.

function QuizSurface({
  schema,
  categoryId,
}: {
  schema: QuizSchema;
  categoryId: string;
}) {
  const completion = useQuizStore((s) =>
    s.getCompletion(schema.category, schema.subsection),
  );
  const dismissed = useQuizStore((s) =>
    s.isDismissed(schema.category, schema.subsection),
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <QuizEntryCard schema={schema} categoryId={categoryId} />;

  const stale = completion && completion.quiz_id !== schema.id;
  const showStrip = (!!completion && !stale) || (dismissed && !stale);

  if (showStrip) {
    return <QuizStrip schema={schema} categoryId={categoryId} />;
  }

  return <QuizEntryCard schema={schema} categoryId={categoryId} />;
}

function QuizStrip({
  schema,
  categoryId,
}: {
  schema: QuizSchema;
  categoryId: string;
}) {
  const completion = useQuizStore((s) =>
    s.getCompletion(schema.category, schema.subsection),
  );
  const [open, setOpen] = useState(false);
  const label = completion ? "Retake quiz" : "Take quiz";

  return (
    <>
      <section
        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-ivory-warm/40 px-4 py-2.5"
      >
        <div className="flex items-center gap-2.5 text-ink-faint">
          <Sparkles size={12} strokeWidth={1.8} className="text-saffron" />
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.14em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {schema.questions.length} questions · ~{schema.estimated_minutes} min
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            track(completion ? "quiz_retaken" : "quiz_started", {
              quiz_id: schema.id,
            });
          }}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={10} strokeWidth={1.8} />
          {label}
        </button>
      </section>
      <AnimatePresence>
        {open && (
          <QuizRunner
            schema={schema}
            categoryId={categoryId}
            priorCompletion={completion ?? undefined}
            onClose={(_outcome) => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Paper Brief (structured) ──────────────────────────────────────────────
// "The document your designer reads first." Auto-drafts from the quiz
// answers the first time the couple completes it; fully editable afterwards
// via the same BriefTextareaBlock used in Photography.

function PaperBrief() {
  const briefRaw = useStationeryStore((s) => s.visualIdentity.brief);
  const brief = briefRaw ?? "";
  const setBrief = useStationeryStore((s) => s.setIdentityBrief);
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(
    () => keywordsMap[CATEGORY] ?? [],
    [keywordsMap],
  );
  const paperTexture = useStationeryStore((s) => s.paperTexture);
  const notes = useWorkspaceStore((s) => s.notes);
  const categoryNotes = useMemo(
    () => notes.filter((n) => n.body.toLowerCase().includes("paper")),
    [notes],
  );

  function refineWithAI() {
    const feelings = keywords.slice(0, 2).join(" and ");
    const textureLabel = STATIONERY_PAPER_TEXTURE_LABEL[paperTexture];
    const textureDesc = STATIONERY_PAPER_TEXTURE_DESCRIPTION[paperTexture];
    const lines = [
      feelings
        ? `When someone opens the envelope, they should feel ${feelings} — the paper carries the first impression before the words do.`
        : "When someone opens the envelope, they should feel the weight of the paper first — the tone of the whole wedding, before any word is read.",
      `Paper direction: ${textureLabel}. ${textureDesc}`,
      keywords.length > 0
        ? `Style cues to honour: ${keywords.join(", ")}.`
        : null,
      categoryNotes.length > 0
        ? `Couple has explicitly flagged: ${categoryNotes
            .map((n) => n.body)
            .join(" · ")}.`
        : null,
    ].filter(Boolean);
    setBrief(lines.join("\n\n"));
  }

  return (
    <BriefTextareaBlock
      eyebrow="The document your designer reads first"
      title="Your Paper Brief"
      hint="Describe how you want your stationery to feel — not the specs. We'll polish the structure."
      value={brief}
      onChange={setBrief}
      onRefine={refineWithAI}
      placeholder="e.g. When someone opens the envelope, they should feel the weight of the cotton first — thick, almost heirloom. Gold foil catching the light on the couple's monogram. Warm ivory, not cold white. A paisley border subtle enough not to shout."
      minHeight={160}
    />
  );
}

// ── Style keywords ────────────────────────────────────────────────────────
// Full-width shared chip selector (same component Photography uses). Seeded
// with stationery-relevant suggestions; "+ add your own" stays intact.

function StyleKeywordsSection() {
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(
    () => keywordsMap[CATEGORY] ?? [],
    [keywordsMap],
  );
  const setKeywords = useVisionStore((s) => s.setKeywords);

  return (
    <StyleKeywordsBlock
      title="Style keywords"
      hint="The look in words. Tap a suggestion, or add your own."
      suggestions={SUGGESTED_STATIONERY_KEYWORDS}
      selected={keywords}
      onChange={(next) => setKeywords(CATEGORY, next)}
    />
  );
}

// ── Typography vibe ───────────────────────────────────────────────────────
// "Your type voice." Four selectable cards that map 1:1 to the same options
// in Guided Session 1 (typography_vibe). Picking here writes to the same
// store slot, so guided + manual modes never disagree.

const TYPOGRAPHY_VIBES: StationeryTypographyVibe[] = [
  "classic_serif",
  "modern_sans",
  "calligraphic",
  "mix",
];

function TypographyVibeSection() {
  const vibe = useStationeryStore((s) => s.visualIdentity.typographyVibe);
  const setVibe = useStationeryStore((s) => s.setTypographyVibe);

  return (
    <PanelCard
      icon={<TypeIcon size={14} strokeWidth={1.8} />}
      eyebrow="Your type voice"
      title="Typography vibe"
      description="The voice your invitations speak in. Pick the type direction; your designer will choose the exact families."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TYPOGRAPHY_VIBES.map((v) => {
          const active = vibe === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setVibe(v)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-md border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/40"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span
                className={cn(
                  "font-serif text-[14px] leading-tight",
                  active ? "text-saffron" : "text-ink",
                )}
                style={{
                  fontFamily:
                    v === "classic_serif"
                      ? "Fraunces, serif"
                      : v === "calligraphic"
                        ? "'Apple Chancery', 'Snell Roundhand', cursive"
                        : v === "modern_sans"
                          ? "var(--font-sans)"
                          : "Fraunces, serif",
                  fontStyle: v === "calligraphic" ? "italic" : undefined,
                  fontWeight: v === "modern_sans" ? 500 : 600,
                }}
              >
                {STATIONERY_TYPOGRAPHY_VIBE_LABEL[v]}
              </span>
              <span className="text-[11px] leading-snug text-ink-muted">
                {STATIONERY_TYPOGRAPHY_VIBE_DESCRIPTION[v]}
              </span>
            </button>
          );
        })}
      </div>
    </PanelCard>
  );
}

// ── Bilingual stationery ──────────────────────────────────────────────────
// Toggle + script-language multi-select. Mirrors Guided Session 1 fields
// `bilingual` and `script_languages` exactly, so the same input set flows
// into the brief from either mode.

function BilingualSection() {
  const bilingual = useStationeryStore((s) => s.visualIdentity.bilingual);
  const setBilingual = useStationeryStore((s) => s.setBilingual);
  const scriptLanguages = useStationeryStore(
    (s) => s.visualIdentity.scriptLanguages,
  );
  const toggleScriptLanguage = useStationeryStore(
    (s) => s.toggleScriptLanguage,
  );
  const selected = useMemo(() => scriptLanguages ?? [], [scriptLanguages]);

  return (
    <PanelCard
      icon={<Languages size={14} strokeWidth={1.8} />}
      eyebrow="Will your stationery be bilingual?"
      title="Languages & scripts"
      description="Many Indian-wedding suites carry two scripts side by side — name lines, vows, blessings. Pick the languages your designer should typeset."
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setBilingual(!bilingual)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12.5px] transition-colors",
            bilingual
              ? "border-saffron bg-saffron-pale/40 text-saffron"
              : "border-border bg-white text-ink-muted hover:border-saffron/40",
          )}
        >
          <span
            className={cn(
              "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border",
              bilingual
                ? "border-saffron bg-saffron"
                : "border-border bg-white",
            )}
          >
            {bilingual && (
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </span>
          {bilingual ? "Yes — bilingual" : "No — single language"}
        </button>
      </div>

      <div className="mt-3">
        <Eyebrow className="mb-2">Scripts to include</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {STATIONERY_SCRIPT_LANGUAGES.map((lang) => {
            const active = selected.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleScriptLanguage(lang)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                  active
                    ? "border-saffron bg-saffron-pale/50 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40",
                )}
              >
                {STATIONERY_SCRIPT_LANGUAGE_LABEL[lang] ?? lang}
              </button>
            );
          })}
        </div>
      </div>
    </PanelCard>
  );
}

// ── Motif preferences ─────────────────────────────────────────────────────
// Tappable pills for paisley / lotus / elephant / peacock / geometric /
// floral / mandala / none. Multi-select; writes to visualIdentity.motifTags.

function MotifPreferencesSection() {
  const tags = useStationeryStore((s) => s.visualIdentity.motifTags);
  const toggleMotifTag = useStationeryStore((s) => s.toggleMotifTag);
  const selected = useMemo(() => tags ?? [], [tags]);

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      eyebrow="Motifs & patterns"
      title="The decorative language"
      description="The shapes and ornaments that thread through the suite. Pick a few — your designer will choose how loudly to use them."
    >
      <div className="flex flex-wrap gap-1.5">
        {STATIONERY_MOTIF_TAGS.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleMotifTag(tag)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/50 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40",
              )}
            >
              {STATIONERY_MOTIF_TAG_LABEL[tag] ?? tag}
            </button>
          );
        })}
      </div>
    </PanelCard>
  );
}

// ── Colour & tone ─────────────────────────────────────────────────────────
// Mirrors Photography's slider + numbered presets, but swaps the wedding
// photo preview for a stationery flat-lay that re-grades in real time as
// the couple slides. Three preset buttons jump to canonical tone positions
// so the designer has a shared shorthand.

interface TonePreset {
  value: number;
  label: string;
  subtitle: string;
}

const TONE_PRESETS: TonePreset[] = [
  { value: 18, label: "Warm ivory", subtitle: "Candlelit, honeyed, heirloom" },
  { value: 50, label: "Neutral cream", subtitle: "Balanced, modern-classic" },
  { value: 82, label: "Cool linen", subtitle: "Crisp, editorial, photographic" },
];

function ColourAndToneSection() {
  const [scale, setScale] = useState<number>(50);
  const [presetIndex, setPresetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STATIONERY_TONE_SCALE_KEY);
      if (raw !== null) setScale(Math.min(100, Math.max(0, Number(raw))));
      const preset = window.localStorage.getItem(STATIONERY_TONE_PRESET_KEY);
      if (preset !== null) {
        const n = Number(preset);
        if (!Number.isNaN(n) && n >= 0 && n < TONE_PRESETS.length) {
          setPresetIndex(n);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function persistScale(next: number) {
    setScale(next);
    try {
      window.localStorage.setItem(STATIONERY_TONE_SCALE_KEY, String(next));
    } catch {
      // ignore
    }
  }

  function handleSlide(next: number) {
    persistScale(next);
    setPresetIndex(null);
    try {
      window.localStorage.removeItem(STATIONERY_TONE_PRESET_KEY);
    } catch {
      // ignore
    }
  }

  function handlePreset(i: number) {
    const p = TONE_PRESETS[i];
    persistScale(p.value);
    setPresetIndex(i);
    try {
      window.localStorage.setItem(STATIONERY_TONE_PRESET_KEY, String(i));
    } catch {
      // ignore
    }
  }

  // Re-grade the preview frame via hue-rotate + sepia-ish tint. 0 = warm
  // golden, 100 = cool blue-grey. Interpolation is cosmetic — the designer
  // reads the slider position, not the CSS filter.
  const tint = useMemo(() => {
    const t = scale / 100;
    const warm = { r: 251, g: 241, b: 217 };
    const cool = { r: 228, g: 232, b: 238 };
    const r = Math.round(warm.r + (cool.r - warm.r) * t);
    const g = Math.round(warm.g + (cool.g - warm.g) * t);
    const b = Math.round(warm.b + (cool.b - warm.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }, [scale]);

  const accent = useMemo(() => {
    const t = scale / 100;
    const warm = { r: 184, g: 134, b: 11 };
    const cool = { r: 92, g: 108, b: 124 };
    const r = Math.round(warm.r + (cool.r - warm.r) * t);
    const g = Math.round(warm.g + (cool.g - warm.g) * t);
    const b = Math.round(warm.b + (cool.b - warm.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }, [scale]);

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      eyebrow="Tone & temperature"
      title="Colour & tone"
      description="How should ink sit against the paper? Slide to tune warm-to-cool in real time, or jump to a numbered preset your designer will recognise."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Slide to re-grade
        </span>
      }
    >

      {/* Flat-lay preview — re-grades live with the slider value. */}
      <div
        className="relative overflow-hidden rounded-md ring-1 ring-border"
        style={{ aspectRatio: "16 / 9", background: tint }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 6px)",
          }}
          aria-hidden
        />
        {/* Small accents to suggest a paper flat-lay. */}
        <span
          className="absolute left-[8%] top-[14%] h-[62%] w-[28%] rounded-sm bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
          style={{ transform: "rotate(-4deg)" }}
        />
        <span
          className="absolute right-[10%] top-[20%] h-[52%] w-[22%] rounded-sm bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          style={{ transform: "rotate(3deg)" }}
        />
        <span
          className="absolute bottom-[10%] left-[42%] h-[16%] w-[18%] rounded-sm bg-white/80"
          style={{ transform: "rotate(-1deg)" }}
        />
        <div
          className="absolute left-[14%] top-[28%] w-[18%] text-center"
          style={{ transform: "rotate(-4deg)" }}
        >
          <p
            className="font-serif text-[13px] italic leading-tight"
            style={{ color: accent, fontFamily: "Fraunces, serif" }}
          >
            together
          </p>
          <p
            className="mt-0.5 font-serif text-[10px] tracking-[0.2em]"
            style={{ color: accent }}
          >
            FOREVER
          </p>
          <div
            className="mx-auto mt-1 h-px w-8"
            style={{ backgroundColor: accent, opacity: 0.6 }}
          />
        </div>
      </div>

      {/* Slider */}
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          value={scale}
          onChange={(e) => handleSlide(Number(e.target.value))}
          className="tone-slider w-full accent-saffron"
          aria-label="Colour and tone"
        />
        <div
          className="mt-1 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>Warm ivory</span>
          <span>Cool linen</span>
        </div>
      </div>

      {/* Numbered preset selectors */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {TONE_PRESETS.map((p, i) => {
          const active = presetIndex === i;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(i)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/40"
                  : "border-border bg-white hover:border-saffron/50",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
                  active
                    ? "bg-saffron text-white"
                    : "bg-ivory-warm text-ink-muted",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-ink">
                  {p.label}
                </span>
                <span className="block truncate text-[10.5px] text-ink-muted">
                  {p.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </PanelCard>
  );
}

// ── Moodboard ─────────────────────────────────────────────────────────────

const STATIONERY_REACTION_META: Record<
  MoodboardReaction,
  { label: string; icon: React.ReactNode; active: string }
> = {
  love: {
    label: "Love",
    icon: <Heart size={10} strokeWidth={1.8} />,
    active: "border-rose bg-rose text-ivory",
  },
  note: {
    label: "Note",
    icon: <MessageSquarePlus size={10} strokeWidth={1.8} />,
    active: "border-marigold bg-marigold-pale/60 text-marigold",
  },
  not_this: {
    label: "Not this",
    icon: <X size={10} strokeWidth={1.8} />,
    active: "border-ink bg-ink text-ivory",
  },
};

const STATIONERY_TAG_OPTIONS: { value: MoodboardTag; label: string }[] = [
  { value: "typography", label: "Typography" },
  { value: "texture", label: "Texture" },
  { value: "layout", label: "Layout" },
  { value: "colour", label: "Colour" },
  { value: "detail", label: "Detail" },
];

function MoodboardSection({ category }: { category: WorkspaceCategory }) {
  const moodboard = useWorkspaceStore((s) => s.moodboard);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const deleteMoodboardItem = useWorkspaceStore((s) => s.deleteMoodboardItem);
  const updateMoodboardItem = useWorkspaceStore((s) => s.updateMoodboardItem);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [filterTag, setFilterTag] = useState<MoodboardTag | "all">("all");

  const items = useMemo(
    () =>
      moodboard
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [moodboard, category.id],
  );

  const filtered = useMemo(
    () =>
      filterTag === "all"
        ? items
        : items.filter((i) => i.tag === filterTag),
    [items, filterTag],
  );

  function handleFileDrop(files: File[]) {
    for (const file of files) {
      const url = URL.createObjectURL(file);
      addMoodboardItem(category.id, url, file.name.replace(/\.[^.]+$/, ""));
    }
  }
  function handleUrlDrop(urls: string[]) {
    for (const u of urls) addMoodboardItem(category.id, u, "");
  }
  function handleDeleteItem(id: string, image_url: string, caption: string) {
    deleteMoodboardItem(id);
    pushUndo({
      message: "Image removed",
      undo: () => addMoodboardItem(category.id, image_url, caption),
    });
  }

  return (
    <PanelCard
      icon={<ImageIcon size={14} strokeWidth={1.8} />}
      eyebrow="Inspiration board"
      title="Moodboard"
      description="Drop in pins, stationery clippings, and printed invite photos. Each tag teaches your designer what's pulling you in."
      badge={
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterTag("all")}
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
              filterTag === "all"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            All
          </button>
          {STATIONERY_TAG_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilterTag(t.value)}
              className={cn(
                "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
                filterTag === t.value
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      <DragDropZone
        onDropFiles={handleFileDrop}
        onDropUrls={handleUrlDrop}
        overlayLabel="Drop to pin"
      >
        {filtered.length === 0 ? (
          <EmptyRow>
            {filterTag === "all"
              ? "Drop inspiration here. Tag each pin so your designer knows what caught your eye — the font, the paper, the layout, or a tiny detail."
              : "No pins tagged yet. Pick a different filter, or tag some pins."}
          </EmptyRow>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {filtered.map((m) => (
              <MoodTile
                key={m.id}
                item={m}
                onDelete={() => handleDeleteItem(m.id, m.image_url, m.caption)}
                onReact={(r) =>
                  updateMoodboardItem(m.id, {
                    reaction: m.reaction === r ? undefined : r,
                  })
                }
                onTag={(t) =>
                  updateMoodboardItem(m.id, {
                    tag: m.tag === t ? undefined : t,
                  })
                }
              />
            ))}
            <li>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-white text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
              >
                <Plus size={16} strokeWidth={1.5} />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                  Add image
                </span>
              </button>
            </li>
          </ul>
        )}
      </DragDropZone>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && urlDraft.trim()) {
              addMoodboardItem(category.id, urlDraft.trim(), "");
              setUrlDraft("");
            }
          }}
          placeholder="Paste an image URL… or drag files anywhere above"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            if (list.length) handleFileDrop(list);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <ImageIcon size={11} /> Upload
        </button>
      </div>
    </PanelCard>
  );
}

function MoodTile({
  item,
  onDelete,
  onReact,
  onTag,
}: {
  item: {
    id: string;
    image_url: string;
    caption: string;
    reaction?: MoodboardReaction;
    tag?: MoodboardTag;
  };
  onDelete: () => void;
  onReact: (r: MoodboardReaction) => void;
  onTag: (t: MoodboardTag) => void;
}) {
  return (
    <li className="group relative overflow-hidden rounded-md ring-1 ring-border">
      <div className="relative aspect-[4/3] bg-ivory-warm">
        <img
          src={item.image_url}
          alt={item.caption}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {item.reaction && (
          <span
            className={cn(
              "absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em]",
              STATIONERY_REACTION_META[item.reaction].active,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {STATIONERY_REACTION_META[item.reaction].icon}
            {STATIONERY_REACTION_META[item.reaction].label}
          </span>
        )}
        {item.tag && (
          <span
            className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-full border border-ivory/30 bg-ink/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ivory"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.tag}
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
          aria-label="Remove image"
        >
          <Trash2 size={10} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-border bg-white px-1.5 py-1.5">
        {(Object.keys(STATIONERY_REACTION_META) as MoodboardReaction[]).map(
          (r) => (
            <button
              key={r}
              type="button"
              onClick={() => onReact(r)}
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
                item.reaction === r
                  ? STATIONERY_REACTION_META[r].active
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
              title={STATIONERY_REACTION_META[r].label}
            >
              {STATIONERY_REACTION_META[r].icon}
            </button>
          ),
        )}
        <span className="mx-0.5 text-ink-faint">·</span>
        {STATIONERY_TAG_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onTag(t.value)}
            className={cn(
              "rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
              item.tag === t.value
                ? "border-saffron bg-saffron-pale/40 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron/50",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </li>
  );
}

// ── Paper & texture palette ───────────────────────────────────────────────
// Four swatch cards rendering the same invitation mockup on different
// stocks. The couple picks the paper feel before they pick a vendor —
// lets them hand the designer a direction that's hard to recant once the
// first sample arrives.

const PAPER_TEXTURES: {
  value: StationeryPaperTexture;
  swatchGradient: string;
  swatchTexture?: string;
}[] = [
  {
    value: "cotton",
    swatchGradient:
      "linear-gradient(135deg, #FBF6EA 0%, #F3E9D2 50%, #EADFC5 100%)",
    swatchTexture:
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 4px)",
  },
  {
    value: "linen",
    swatchGradient:
      "linear-gradient(135deg, #F2EEE4 0%, #E8E0CF 100%)",
    swatchTexture:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)",
  },
  {
    value: "vellum",
    swatchGradient:
      "linear-gradient(135deg, rgba(251,249,244,0.7) 0%, rgba(235,228,210,0.6) 100%)",
  },
  {
    value: "shimmer",
    swatchGradient:
      "linear-gradient(135deg, #F7EED6 0%, #F0E4C8 35%, #E8D6A3 65%, #F5E9C5 100%)",
  },
];

function PaperTextureSection() {
  const paperTexture = useStationeryStore((s) => s.paperTexture);
  const setPaperTexture = useStationeryStore((s) => s.setPaperTexture);

  const active = PAPER_TEXTURES.find((p) => p.value === paperTexture);

  return (
    <PanelCard
      icon={<Layers size={14} strokeWidth={1.8} />}
      eyebrow="Stock & substrate"
      title="Paper & texture"
      description="How should the paper feel in-hand? Tap a swatch to preview the stock your designer will price against."
    >

      <div className="grid grid-cols-2 gap-2">
        {PAPER_TEXTURES.map((p) => {
          const isActive = p.value === paperTexture;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setPaperTexture(p.value)}
              className={cn(
                "group relative overflow-hidden rounded-md border text-left transition-all",
                isActive
                  ? "border-saffron ring-2 ring-saffron/30"
                  : "border-border hover:border-saffron/40",
              )}
            >
              <div
                className="relative aspect-[3/2]"
                style={{ background: p.swatchGradient }}
              >
                {p.swatchTexture && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: p.swatchTexture }}
                    aria-hidden
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-sm border border-ink/15 bg-white/80 px-3 py-1.5 backdrop-blur-sm">
                    <p
                      className="font-serif text-[10px] italic tracking-wide text-ink"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      together forever
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/60 bg-white px-2 py-1.5">
                <p
                  className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {STATIONERY_PAPER_TEXTURE_LABEL[p.value]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <p className="mt-3 font-serif text-[12.5px] italic leading-snug text-ink-muted">
          {STATIONERY_PAPER_TEXTURE_DESCRIPTION[active.value]}
        </p>
      )}
    </PanelCard>
  );
}

// ── Colour palette (pull from Décor) ──────────────────────────────────────

function PalettePullSection() {
  const paletteSource = useStationeryStore((s) => s.paletteSource);
  const setPaletteSource = useStationeryStore((s) => s.setPaletteSource);
  const identityPalette = useStationeryStore((s) => s.visualIdentity.palette);
  const setIdentityPalette = useStationeryStore((s) => s.setIdentityPalette);

  const decorPalettes = useDecorStore((s) => s.event_palettes);
  const weddingPalette = useMemo(
    () => decorPalettes.find((p) => p.event_id === "wedding"),
    [decorPalettes],
  );

  const effectivePalette = useMemo(() => {
    if (paletteSource === "wedding" && weddingPalette) {
      return weddingPalette.swatches.map((s) => ({
        hex: s.hex,
        name: s.name,
      }));
    }
    return identityPalette;
  }, [paletteSource, weddingPalette, identityPalette]);

  const hasWeddingPalette = !!weddingPalette && weddingPalette.swatches.length > 0;

  function diverge() {
    if (effectivePalette.length > 0) {
      setIdentityPalette(effectivePalette);
    }
    setPaletteSource("independent");
  }

  function resetToWedding() {
    setPaletteSource("wedding");
  }

  return (
    <PanelCard
      icon={<span className="text-[11px]">🎨</span>}
      eyebrow="Ink & accents"
      title="Colour palette"
      description="The colour story your designer will specify inks and foils against."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {paletteSource === "wedding" ? "From Décor" : "Independent"}
        </span>
      }
    >
      {!hasWeddingPalette && paletteSource === "wedding" ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <p className="text-[12px] text-ink-muted">
            Set your colours in Décor & Florals, or diverge and add them here.
          </p>
          <button
            type="button"
            onClick={diverge}
            className="mt-2 rounded-sm border border-saffron/40 bg-saffron-pale/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-saffron hover:bg-saffron-pale/70"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Set paper palette here
          </button>
        </div>
      ) : effectivePalette.length === 0 ? (
        <EmptyRow>No palette yet. Pick a few swatches in Décor.</EmptyRow>
      ) : (
        <div className="flex flex-wrap gap-2">
          {effectivePalette.map((s, i) => (
            <div
              key={`${s.hex}-${i}`}
              className="flex flex-col items-center gap-1"
              title={s.name}
            >
              <span
                className="h-10 w-10 rounded-sm ring-1 ring-border"
                style={{ backgroundColor: s.hex }}
              />
              <span
                className="font-mono text-[9px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {s.hex.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasWeddingPalette && (
        <div className="mt-3 flex gap-1.5">
          {paletteSource === "wedding" ? (
            <button
              type="button"
              onClick={diverge}
              className="rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:border-saffron hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Diverge
            </button>
          ) : (
            <button
              type="button"
              onClick={resetToWedding}
              className="rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:border-saffron hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Reset to Décor
            </button>
          )}
        </div>
      )}

      <Eyebrow className="mt-3">Wedding palette flows through every piece</Eyebrow>
    </PanelCard>
  );
}
