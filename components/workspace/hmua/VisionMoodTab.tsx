"use client";

// ── Hair & Makeup → Vision & Mood tab ─────────────────────────────────────
// A single scrollable narrative — modeled after the Photography workspace —
// that guides the couple from "I don't know what I want" to a complete
// beauty brief. Every section is always writable; AI assists are optional,
// clearly marked with the ✦ sparkle, and never gate content creation.
//
// Flow (top to bottom) — Beauty Brief is deliberately near the end of the
// narrative. Brides don't know how they want to feel until they've seen mood
// boards and references first; letting them discover the vibe first makes
// the brief they write at the end far richer.
//
//   1. Quiz entry card
//   2. Style keywords — tappable suggestions + custom via ChipInput
//   3. Colour & tone slider with lip/eye/cheek family swatches
//   4. Beauty moodboard (Hair / Makeup / Accessories / Nails)
//   5. Reference gallery by event (Love / Not for us)
//   6. "Products You Already Love" — shelfie of existing daily-wear products
//   7. Skin & Hair Profile (interactive quiz + operational summary)
//   8. "I definitely want" — must-haves
//   9. Beauty moments wishlist + "Suggest moments"
//  10. Golden callout — "Your artist reads these first"
//  11. "Please don't include" — exclusions
//  12. Beauty Brief (written last — after discovery)

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useVisionStore } from "@/stores/vision-store";
import {
  HAIR_LENGTH_OPTIONS,
  HAIR_TYPE_OPTIONS,
  SKIN_TONE_OPTIONS,
  SKIN_TYPE_OPTIONS,
  useHmuaStore,
  type HairLength,
  type HairType,
  type SkinTone,
  type SkinType,
} from "@/stores/hmua-store";
import type { MoodboardTag, WorkspaceCategory } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { ChipInput } from "@/components/workspace/editable/ChipInput";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";
import {
  SkinHairQuizEntry,
  SkinHairQuizRunner,
  SkinHairProfileResultCard,
} from "@/components/workspace/hmua/SkinHairQuiz";
import {
  HMUA_BRIEF_KEY,
  HMUA_COLOUR_DIRECTION_KEY,
  HMUA_SKIN_FINISH_KEY,
} from "@/lib/quiz/schemas/hmua-vision";

const CATEGORY = "hmua" as const;
const VISION_QUIZ = getQuizSchema(CATEGORY, "vision");

// Local storage keys for narrative surfaces owned by this tab.
const HMUA_MUST_HAVES_KEY = "ananya:hmua-must-haves";
const HMUA_EXCLUDE_KEY = "ananya:hmua-exclude";
const HMUA_MOMENTS_KEY = "ananya:hmua-moments";
const HMUA_EVENT_REF_STATE_KEY = "ananya:hmua-event-ref-state";
const HMUA_LOVED_PRODUCTS_KEY = "ananya:hmua-loved-products";

// Events the reference gallery pages through.
const EVENTS = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Baraat",
  "Wedding",
  "Reception",
] as const;
type EventName = (typeof EVENTS)[number];

// Beauty-specific moodboard categories. These are a subset of MoodboardTag
// since MoodboardTag was widened to cover both photography and HMUA axes.
const BEAUTY_TAG_OPTIONS: { value: MoodboardTag; label: string }[] = [
  { value: "hair", label: "Hair" },
  { value: "makeup", label: "Makeup" },
  { value: "accessories", label: "Accessories" },
  { value: "nails", label: "Nails" },
];

// ── Entry ─────────────────────────────────────────────────────────────────

export function HmuaVisionMoodTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-8">
      {VISION_QUIZ && (
        <QuizEntryCard schema={VISION_QUIZ} categoryId={category.id} />
      )}

      <StyleKeywordsSection />

      <ColourAndToneSection />

      <BeautyMoodboardSection category={category} />

      <ReferenceGalleryByEvent category={category} />

      <ProductsYouAlreadyLoveSection category={category} />

      <SkinHairProfileCard category={category} />

      <MustHavesSection />

      <BeautyMomentsSection />

      <GoldenCalloutSection />

      <ExclusionsSection />

      <BeautyBriefPanel category={category} />

      {VISION_QUIZ && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={VISION_QUIZ} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── 2. Beauty Brief ──────────────────────────────────────────────────────
// Always editable. localStorage-backed (matches Photography). The "Refine
// with AI" button is a light heuristic restructure — it takes the raw text
// and splits it into ceremony / reception / skin beats. Shown as a
// suggestion the couple can accept, edit, or dismiss.

function BeautyBriefPanel({ category }: { category: WorkspaceCategory }) {
  const [brief, setBrief] = useState<string>("");
  const [proposal, setProposal] = useState<string | null>(null);

  // Legacy read: if the old quiz seeded a `[Beauty Brief] …` workspace note,
  // hydrate the panel from it once so existing data migrates forward.
  const notes = useWorkspaceStore((s) => s.notes);
  const legacyBrief = useMemo(
    () =>
      notes
        .filter((n) => n.category_id === category.id)
        .find((n) => n.body.startsWith("[Beauty Brief]"))
        ?.body.replace("[Beauty Brief]", "")
        .trim() ?? "",
    [notes, category.id],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(HMUA_BRIEF_KEY);
      if (stored) setBrief(stored);
      else if (legacyBrief) {
        setBrief(legacyBrief);
        window.localStorage.setItem(HMUA_BRIEF_KEY, legacyBrief);
      }
    } catch {
      // ignore
    }
  }, [legacyBrief]);

  function persist(next: string) {
    setBrief(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HMUA_BRIEF_KEY, next);
    } catch {
      // ignore
    }
  }

  function refine() {
    const raw = brief.trim();
    if (!raw) return;
    // Heuristic restructure: split into sentences, bucket by event / skin
    // keyword, fall through to "Overall feel" for anything unmatched.
    const sentences = raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const buckets: { ceremony: string[]; reception: string[]; skin: string[]; overall: string[] } = {
      ceremony: [],
      reception: [],
      skin: [],
      overall: [],
    };
    for (const s of sentences) {
      const l = s.toLowerCase();
      if (/\b(ceremony|wedding|phere|mandap|haldi|mehendi|mehndi|vidai)\b/.test(l)) {
        buckets.ceremony.push(s);
      } else if (/\b(reception|sangeet|party|baraat|dance)\b/.test(l)) {
        buckets.reception.push(s);
      } else if (/\b(skin|dewy|matte|finish|glow|coverage|foundation|contour)\b/.test(l)) {
        buckets.skin.push(s);
      } else {
        buckets.overall.push(s);
      }
    }

    const lines: string[] = [];
    if (buckets.overall.length) lines.push(`Overall feel: ${buckets.overall.join(" ")}`);
    if (buckets.ceremony.length) lines.push(`Ceremony: ${buckets.ceremony.join(" ")}`);
    if (buckets.reception.length)
      lines.push(`Reception & party: ${buckets.reception.join(" ")}`);
    if (buckets.skin.length) lines.push(`Skin & finish: ${buckets.skin.join(" ")}`);

    setProposal(lines.join("\n\n"));
  }

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          eyebrow="The document your artist reads first"
          title="Your Beauty Brief"
          description="Describe the feeling you want — not the products. We'll polish the structure."
          right={
            brief.trim().length > 0 ? (
              <button
                type="button"
                onClick={refine}
                className="inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron-pale/30 px-3 py-1.5 text-[11.5px] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/60"
              >
                <Sparkles size={12} strokeWidth={1.8} /> Refine with AI
              </button>
            ) : null
          }
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        <textarea
          value={brief}
          onChange={(e) => persist(e.target.value)}
          rows={5}
          className="w-full resize-none rounded-md border border-border bg-ivory-warm/40 px-4 py-3 font-serif text-[15.5px] italic leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:bg-white focus:outline-none"
          placeholder="Click to write a brief — a few sentences about what bridal beauty means to you. Think about how you want to look in photos 20 years from now. Don't worry about technique; we'll polish it."
        />

        {proposal && (
          <div className="mt-3 rounded-md border border-saffron/30 bg-saffron-pale/20 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-saffron" />
              <Eyebrow>AI suggestion — your brief, restructured</Eyebrow>
            </div>
            <pre className="whitespace-pre-wrap font-serif text-[14px] leading-relaxed text-ink">
              {proposal}
            </pre>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProposal(null)}
                className="rounded-md border border-border px-3 py-1 text-[12px] text-ink-muted hover:text-ink"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  persist(proposal);
                  setProposal(null);
                }}
                className="rounded-md bg-ink px-3 py-1 text-[12px] font-medium text-ivory hover:opacity-90"
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 3. Style keywords ────────────────────────────────────────────────────

const SUGGESTED_KEYWORDS = [
  "dewy",
  "bold-lip",
  "soft-glam",
  "natural",
  "smokey-eye",
  "winged-liner",
  "traditional",
  "editorial",
  "minimalist",
  "south-indian",
  "fresh-faced",
  "dramatic",
  "romantic",
  "glass-skin",
  "matte",
  "statement-brows",
];

function StyleKeywordsSection() {
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(() => keywordsMap[CATEGORY] ?? [], [keywordsMap]);
  const setKeywords = useVisionStore((s) => s.setKeywords);
  const selected = useMemo(() => new Set(keywords), [keywords]);

  function toggle(k: string) {
    if (selected.has(k)) setKeywords(CATEGORY, keywords.filter((x) => x !== k));
    else setKeywords(CATEGORY, [...keywords, k]);
  }

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          title="Style keywords"
          description="Tap the ones that feel right. Add your own."
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_KEYWORDS.map((k) => {
            const active = selected.has(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggle(k)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] transition-colors",
                  active
                    ? "border-marigold bg-marigold-pale/60 text-marigold"
                    : "border-border bg-white text-ink-muted hover:border-marigold/40 hover:text-ink",
                )}
              >
                {!active && <Plus size={10} strokeWidth={1.8} />}
                {k}
              </button>
            );
          })}
        </div>

        <div className="mt-4 border-t border-border/60 pt-3">
          <Eyebrow className="mb-2">Add your own</Eyebrow>
          <ChipInput
            values={keywords.filter((k) => !SUGGESTED_KEYWORDS.includes(k))}
            onChange={(custom) => {
              const suggested = keywords.filter((k) => SUGGESTED_KEYWORDS.includes(k));
              setKeywords(CATEGORY, [...suggested, ...custom]);
            }}
            placeholder="glass-skin, lash-extensions, no-contour…"
            tone="saffron"
          />
        </div>
      </div>
    </section>
  );
}

// ── 4. Colour & tone ─────────────────────────────────────────────────────
// A single slider that calibrates how saturated / dramatic the palette is.
// The swatch strip and the three "family" swatches update live.

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ra = (pa >> 16) & 255,
    ga = (pa >> 8) & 255,
    ba = pa & 255;
  const rb = (pb >> 16) & 255,
    gb = (pb >> 8) & 255,
    bb = pb & 255;
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0").toUpperCase()}`;
}

// Two anchor palettes. The slider (0-100) interpolates each position.
const PALETTE_SOFT = ["#F5E3D9", "#E8C9B7", "#D4A192", "#B87A6B", "#8B5A4E"];
const PALETTE_RICH = ["#C4766E", "#9B3F3A", "#6E2823", "#3D1A17", "#1F0D0B"];

const LIP_FAMILIES = {
  soft: { hex: "#D4A192", name: "Soft peach" },
  rich: { hex: "#8B3F2E", name: "Deep berry" },
};
const EYE_FAMILIES = {
  soft: { hex: "#B59580", name: "Warm bronze" },
  rich: { hex: "#3D2314", name: "Chocolate smoke" },
};
const CHEEK_FAMILIES = {
  soft: { hex: "#E8C9B7", name: "Rosy nude" },
  rich: { hex: "#B8504A", name: "Sindoor blush" },
};

function ColourAndToneSection() {
  const [value, setValue] = useState<number>(55);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HMUA_COLOUR_DIRECTION_KEY);
      if (raw) {
        const n = Number(raw);
        if (!Number.isNaN(n)) setValue(Math.max(0, Math.min(100, n)));
      }
    } catch {
      // ignore
    }
  }, []);

  function persist(v: number) {
    setValue(v);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HMUA_COLOUR_DIRECTION_KEY, String(v));
    } catch {
      // ignore
    }
  }

  const t = value / 100;
  const strip = PALETTE_SOFT.map((s, i) => lerpColor(s, PALETTE_RICH[i]!, t));
  const lip = lerpColor(LIP_FAMILIES.soft.hex, LIP_FAMILIES.rich.hex, t);
  const eye = lerpColor(EYE_FAMILIES.soft.hex, EYE_FAMILIES.rich.hex, t);
  const cheek = lerpColor(CHEEK_FAMILIES.soft.hex, CHEEK_FAMILIES.rich.hex, t);
  const lipName = t < 0.5 ? LIP_FAMILIES.soft.name : LIP_FAMILIES.rich.name;
  const eyeName = t < 0.5 ? EYE_FAMILIES.soft.name : EYE_FAMILIES.rich.name;
  const cheekName = t < 0.5 ? CHEEK_FAMILIES.soft.name : CHEEK_FAMILIES.rich.name;

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          title="Colour direction"
          description="Slide to calibrate — your artist sees the palette instantly."
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span>Soft & nude</span>
          <span className="text-ink">{value} / 100</span>
          <span>Rich & saturated</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => persist(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#F5E3D9] via-[#D4A192] to-[#6E2823] accent-saffron"
        />

        <div className="mt-5 flex gap-2">
          {strip.map((c, i) => (
            <div
              key={`${c}-${i}`}
              className="flex flex-1 flex-col items-center gap-1"
              title={c}
            >
              <span
                className="h-10 w-full rounded-sm ring-1 ring-border"
                style={{ backgroundColor: c }}
              />
              <span
                className="font-mono text-[9px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {c}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <FamilyTile label="Lip family" hex={lip} name={lipName} />
          <FamilyTile label="Eye family" hex={eye} name={eyeName} />
          <FamilyTile label="Cheek family" hex={cheek} name={cheekName} />
        </div>
      </div>
    </section>
  );
}

function FamilyTile({ label, hex, name }: { label: string; hex: string; name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-ivory-warm/40 p-3">
      <span
        className="h-10 w-10 shrink-0 rounded-sm ring-1 ring-border"
        style={{ backgroundColor: hex }}
      />
      <div className="min-w-0">
        <Eyebrow>{label}</Eyebrow>
        <p className="mt-0.5 truncate text-[13px] text-ink">{name}</p>
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {hex}
        </p>
      </div>
    </div>
  );
}

// ── 5. Beauty moodboard ──────────────────────────────────────────────────

function BeautyMoodboardSection({ category }: { category: WorkspaceCategory }) {
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

  function handleFiles(files: File[]) {
    for (const f of files) {
      const url = URL.createObjectURL(f);
      addMoodboardItem(category.id, url, f.name.replace(/\.[^.]+$/, ""));
    }
  }

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          title="Beauty moodboard"
          description="Paste URLs, drop files, tag each pin so your artist knows what to study."
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        <div className="mb-4 flex items-center gap-2">
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
            placeholder="Paste an image URL…"
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (urlDraft.trim()) {
                addMoodboardItem(category.id, urlDraft.trim(), "");
                setUrlDraft("");
              }
            }}
            className="rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            Add
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              if (list.length) handleFiles(list);
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

        <div className="mb-3 flex flex-wrap items-center gap-1">
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
          {BEAUTY_TAG_OPTIONS.map((t) => (
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

        {filtered.length === 0 ? (
          <EmptyRow>
            {filterTag === "all"
              ? "Pin close-up beauty refs — eye looks, lip swatches, hair styles. Tag each with Hair / Makeup / Accessories / Nails."
              : "No pins tagged yet. Pick a different filter, or tag some pins."}
          </EmptyRow>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {filtered.map((m) => (
              <li
                key={m.id}
                className="group relative overflow-hidden rounded-md ring-1 ring-border"
              >
                <div className="relative aspect-[4/3] bg-ivory-warm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image_url}
                    alt={m.caption}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {m.tag && (
                    <span
                      className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-full border border-ivory/30 bg-ink/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ivory"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {m.tag}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteMoodboardItem(m.id)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <Trash2 size={10} strokeWidth={1.8} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1 border-t border-border bg-white px-1.5 py-1.5">
                  {BEAUTY_TAG_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        updateMoodboardItem(m.id, {
                          tag: m.tag === t.value ? undefined : t.value,
                        })
                      }
                      className={cn(
                        "rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
                        m.tag === t.value
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
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ── 6. Reference gallery by event ────────────────────────────────────────
// Per-event tabs, 4 AI-suggested images each. "Love" pins to the moodboard,
// "Not for us" dismisses. Couple can add their own references per event.

const SUGGESTED_PER_EVENT: Record<EventName, { id: string; url: string; caption: string; tag: MoodboardTag }[]> = {
  Haldi: [
    {
      id: "haldi-1",
      url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=640&q=70",
      caption: "Fresh-faced dewy with flowers in hair",
      tag: "hair",
    },
    {
      id: "haldi-2",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=640&q=70",
      caption: "Natural makeup, braid with marigolds",
      tag: "hair",
    },
    {
      id: "haldi-3",
      url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=640&q=70",
      caption: "Glowing skin, minimal lip",
      tag: "makeup",
    },
    {
      id: "haldi-4",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70",
      caption: "Yellow floral crown",
      tag: "accessories",
    },
  ],
  Mehendi: [
    {
      id: "mehendi-1",
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=640&q=70",
      caption: "Boho waves with gajra",
      tag: "hair",
    },
    {
      id: "mehendi-2",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=640&q=70",
      caption: "Kajal-rimmed eyes, nude lip",
      tag: "makeup",
    },
    {
      id: "mehendi-3",
      url: "https://images.unsplash.com/photo-1501349800519-48093d60bde0?w=640&q=70",
      caption: "Soft romantic updo",
      tag: "hair",
    },
    {
      id: "mehendi-4",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=640&q=70",
      caption: "Henna-hands manicure",
      tag: "nails",
    },
  ],
  Sangeet: [
    {
      id: "sangeet-1",
      url: "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=640&q=70",
      caption: "Bold smokey eye, nude lip",
      tag: "makeup",
    },
    {
      id: "sangeet-2",
      url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=640&q=70",
      caption: "Sleek high ponytail",
      tag: "hair",
    },
    {
      id: "sangeet-3",
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=640&q=70",
      caption: "Statement lip, minimal eye",
      tag: "makeup",
    },
    {
      id: "sangeet-4",
      url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=640&q=70",
      caption: "Jewelled hair pins",
      tag: "accessories",
    },
  ],
  Baraat: [
    {
      id: "baraat-1",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70",
      caption: "Classic red lip, kajal eyes",
      tag: "makeup",
    },
    {
      id: "baraat-2",
      url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=640&q=70",
      caption: "Braid with fresh flowers",
      tag: "hair",
    },
    {
      id: "baraat-3",
      url: "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=640&q=70",
      caption: "Dramatic maang tikka",
      tag: "accessories",
    },
    {
      id: "baraat-4",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=640&q=70",
      caption: "Polished red mani",
      tag: "nails",
    },
  ],
  Wedding: [
    {
      id: "wedding-1",
      url: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=640&q=70",
      caption: "Regal bridal look — heavy eye, deep lip",
      tag: "makeup",
    },
    {
      id: "wedding-2",
      url: "https://images.unsplash.com/photo-1501349800519-48093d60bde0?w=640&q=70",
      caption: "Elaborate updo with matha patti",
      tag: "hair",
    },
    {
      id: "wedding-3",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=640&q=70",
      caption: "Statement bindi, nath profile",
      tag: "accessories",
    },
    {
      id: "wedding-4",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=640&q=70",
      caption: "Deep red manicure",
      tag: "nails",
    },
  ],
  Reception: [
    {
      id: "reception-1",
      url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=640&q=70",
      caption: "Editorial glass skin, winged liner",
      tag: "makeup",
    },
    {
      id: "reception-2",
      url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=640&q=70",
      caption: "Hollywood waves",
      tag: "hair",
    },
    {
      id: "reception-3",
      url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=640&q=70",
      caption: "Berry lip, bronzed eye",
      tag: "makeup",
    },
    {
      id: "reception-4",
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=640&q=70",
      caption: "Minimal jewelled drop earring",
      tag: "accessories",
    },
  ],
};

type EventRefState = Record<EventName, { loved: string[]; dismissed: string[] }>;

const EMPTY_REF_STATE: EventRefState = EVENTS.reduce(
  (acc, e) => ({ ...acc, [e]: { loved: [], dismissed: [] } }),
  {} as EventRefState,
);

function loadRefState(): EventRefState {
  if (typeof window === "undefined") return EMPTY_REF_STATE;
  try {
    const raw = window.localStorage.getItem(HMUA_EVENT_REF_STATE_KEY);
    if (!raw) return EMPTY_REF_STATE;
    const parsed = JSON.parse(raw) as Partial<EventRefState>;
    const merged = { ...EMPTY_REF_STATE };
    for (const e of EVENTS) {
      const slot = parsed[e];
      if (slot && Array.isArray(slot.loved) && Array.isArray(slot.dismissed)) {
        merged[e] = { loved: slot.loved, dismissed: slot.dismissed };
      }
    }
    return merged;
  } catch {
    return EMPTY_REF_STATE;
  }
}

function ReferenceGalleryByEvent({ category }: { category: WorkspaceCategory }) {
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const [activeEvent, setActiveEvent] = useState<EventName>("Wedding");
  const [state, setState] = useState<EventRefState>(EMPTY_REF_STATE);
  const [urlDraft, setUrlDraft] = useState("");

  useEffect(() => {
    setState(loadRefState());
  }, []);

  function persist(next: EventRefState) {
    setState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HMUA_EVENT_REF_STATE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function love(ref: { id: string; url: string; caption: string; tag: MoodboardTag }) {
    const slot = state[activeEvent];
    if (slot.loved.includes(ref.id)) return;
    const next: EventRefState = {
      ...state,
      [activeEvent]: {
        loved: [...slot.loved, ref.id],
        dismissed: slot.dismissed.filter((x) => x !== ref.id),
      },
    };
    persist(next);

    // Mirror into the moodboard with the beauty category tag. addMoodboardItem
    // doesn't return the created item, so we find it by scanning for the most
    // recent match on (category_id, image_url, caption).
    const pinCaption = `${activeEvent} — ${ref.caption}`;
    addMoodboardItem(category.id, ref.url, pinCaption);
    const store = useWorkspaceStore.getState();
    const justAdded = [...store.moodboard]
      .reverse()
      .find(
        (m) =>
          m.category_id === category.id &&
          m.image_url === ref.url &&
          m.caption === pinCaption,
      );
    if (justAdded) {
      store.updateMoodboardItem(justAdded.id, { tag: ref.tag });
    }
  }

  function dismiss(ref: { id: string }) {
    const slot = state[activeEvent];
    if (slot.dismissed.includes(ref.id)) return;
    const next: EventRefState = {
      ...state,
      [activeEvent]: {
        loved: slot.loved.filter((x) => x !== ref.id),
        dismissed: [...slot.dismissed, ref.id],
      },
    };
    persist(next);
  }

  function addOwn() {
    const url = urlDraft.trim();
    if (!url) return;
    addMoodboardItem(category.id, url, `${activeEvent} — your pick`);
    setUrlDraft("");
  }

  const suggestions = SUGGESTED_PER_EVENT[activeEvent];
  const activeSlot = state[activeEvent];

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          title="Reference looks by event"
          description="Browse our suggestions, add your own, tell us what you love."
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {EVENTS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setActiveEvent(e)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition-colors",
                activeEvent === e
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
            >
              {e}
            </button>
          ))}
        </div>

        <p className="mb-4 font-serif text-[15px] italic text-ink">
          What should your {activeEvent} hair &amp; makeup feel like?
        </p>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((ref) => {
            const loved = activeSlot.loved.includes(ref.id);
            const dismissed = activeSlot.dismissed.includes(ref.id);
            return (
              <li
                key={ref.id}
                className={cn(
                  "overflow-hidden rounded-md border bg-white transition-opacity",
                  dismissed ? "border-border opacity-40" : "border-border",
                )}
              >
                <div className="relative aspect-[4/5] bg-ivory-warm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ref.url}
                    alt={ref.caption}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span
                    className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border border-ivory/40 bg-ink/75 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ivory"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Sparkles size={9} strokeWidth={2} /> Suggested
                  </span>
                </div>
                <div className="p-2">
                  <p className="mb-2 truncate text-[11.5px] text-ink-muted">
                    {ref.caption}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => love(ref)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1 rounded-sm border py-1 text-[11px] transition-colors",
                        loved
                          ? "border-rose bg-rose text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-rose hover:text-rose",
                      )}
                    >
                      <Heart size={11} className={loved ? "fill-ivory" : ""} />
                      {loved ? "Loved" : "Love"}
                    </button>
                    <button
                      type="button"
                      onClick={() => dismiss(ref)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1 rounded-sm border py-1 text-[11px] transition-colors",
                        dismissed
                          ? "border-ink bg-ink text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-ink",
                      )}
                    >
                      <X size={11} /> No
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addOwn();
            }}
            placeholder={`Add your own reference for ${activeEvent}…`}
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={addOwn}
            className="rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}

// ── 7. Must-haves ────────────────────────────────────────────────────────

const MUST_HAVE_PLACEHOLDERS = [
  "Red lip for the reception",
  "Jasmine gajra in my braid for the ceremony",
  "Waterproof everything — I will cry",
  "A dupatta-friendly updo that won't flatten",
];

function MustHavesSection() {
  return (
    <StringListSection
      eyebrow="Your non-negotiables"
      title="I definitely want"
      description="The moments or details you won't compromise on. Your artist leads the brief with these."
      placeholderPool={MUST_HAVE_PLACEHOLDERS}
      storageKey={HMUA_MUST_HAVES_KEY}
      accent="marigold"
    />
  );
}

// ── 8. Beauty moments wishlist ───────────────────────────────────────────

const SUGGESTED_MOMENTS = [
  "Mom's reaction seeing you in full bridal look for the first time",
  "The mirror moment — first time you see yourself as a bride",
  "Getting sindoor / maang tikka placed",
  "Hair flowers being woven in",
  "Touch-up moment between ceremony and reception",
  "Sisters helping with jewelry and dupatta",
];

function BeautyMomentsSection() {
  const [values, setValues] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setValues(loadStringList(HMUA_MOMENTS_KEY));
  }, []);

  function persist(next: string[]) {
    setValues(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HMUA_MOMENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function add(raw: string) {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    persist([...values, v]);
  }

  function remove(i: number) {
    persist(values.filter((_, idx) => idx !== i));
  }

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          eyebrow="Emotional moments"
          title="Beauty moments wishlist"
          description="Not a product list — your emotional input. The looks and transitions you want captured."
          right={
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron-pale/30 px-3 py-1.5 text-[11.5px] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/60"
            >
              <Sparkles size={12} strokeWidth={1.8} /> Suggest moments
            </button>
          }
        />
      </div>

      <div className="pt-1">
        {/* editorial: no card border around purely informational input lists */}
        {showSuggestions && (
          <div className="mb-4 rounded-md border border-saffron/30 bg-saffron-pale/20 p-3">
            <Eyebrow className="mb-2">Tap to add to your wishlist</Eyebrow>
            <ul className="space-y-1.5">
              {SUGGESTED_MOMENTS.filter((m) => !values.includes(m)).map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => add(m)}
                    className="flex w-full items-center gap-2 rounded-sm border border-dashed border-saffron/40 bg-white px-2.5 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors hover:border-saffron hover:text-ink"
                  >
                    <Plus size={11} className="shrink-0 text-saffron" />
                    {m}
                  </button>
                </li>
              ))}
              {SUGGESTED_MOMENTS.every((m) => values.includes(m)) && (
                <li>
                  <p className="text-[12px] italic text-ink-faint">
                    You've added all the suggestions. Keep adding your own
                    below.
                  </p>
                </li>
              )}
            </ul>
          </div>
        )}

        {values.length === 0 ? (
          <EmptyRow>Add the moments that would break your heart to miss.</EmptyRow>
        ) : (
          <ul className="mb-3 space-y-1.5">
            {values.map((v, i) => (
              <li
                key={`${v}-${i}`}
                className="group flex items-start gap-2 rounded-md border border-border bg-ivory-warm/40 px-3 py-2"
              >
                <span className="mt-0.5 text-rose">
                  <Heart size={12} strokeWidth={1.8} />
                </span>
                <p className="flex-1 text-[13px] text-ink">{v}</p>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove moment"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                add(draft);
                setDraft("");
              }
            }}
            placeholder="e.g. That moment when my mom sees me in full bridal makeup for the first time…"
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (draft.trim()) {
                add(draft);
                setDraft("");
              }
            }}
            className="rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}

// ── 9. Golden callout ────────────────────────────────────────────────────

function GoldenCalloutSection() {
  return (
    <section>
      <div className="flex flex-col items-center justify-center rounded-lg border border-marigold/40 bg-gradient-to-b from-marigold-pale/40 via-ivory-warm/70 to-ivory-warm/30 px-6 py-8 text-center shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-marigold/20 text-marigold">
          <Sparkles size={18} strokeWidth={1.6} />
        </span>
        <h3 className="font-serif font-bold text-[22px] leading-tight text-ink">
          Your artist reads these first.
        </h3>
        <p className="mt-2 max-w-xl font-serif text-[15px] italic leading-relaxed text-ink-muted">
          List the looks that, if missed, would break your heart.
        </p>
      </div>
    </section>
  );
}

// ── 10. Exclusions ───────────────────────────────────────────────────────

const EXCLUDE_PLACEHOLDERS = [
  "No heavy contouring",
  "No glitter",
  "No hair extensions",
  "No false lashes",
];

function ExclusionsSection() {
  return (
    <StringListSection
      eyebrow="Clear exclusions"
      title="Please don't include"
      description="Every couple has preferences — note anything you'd rather leave out."
      placeholderPool={EXCLUDE_PLACEHOLDERS}
      storageKey={HMUA_EXCLUDE_KEY}
      accent="ink"
    />
  );
}

// ── Shared: string list section (must-haves + exclusions) ────────────────

function StringListSection({
  eyebrow,
  title,
  description,
  placeholderPool,
  storageKey,
  accent,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  placeholderPool: string[];
  storageKey: string;
  accent: "marigold" | "ink";
}) {
  const [values, setValues] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    setValues(loadStringList(storageKey));
    const interval = setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % placeholderPool.length),
      4000,
    );
    return () => clearInterval(interval);
  }, [storageKey, placeholderPool.length]);

  function persist(next: string[]) {
    setValues(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function add(raw: string) {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    persist([...values, v]);
  }
  function remove(i: number) {
    persist(values.filter((_, idx) => idx !== i));
  }

  const dotClass = accent === "marigold" ? "text-marigold" : "text-ink-muted";

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>

      <div className="pt-1">
        {values.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {values.map((v, i) => (
              <li
                key={`${v}-${i}`}
                className="group flex items-start gap-2 rounded-md border border-border bg-ivory-warm/40 px-3 py-2"
              >
                <span className={cn("mt-1 text-[18px] leading-none", dotClass)}>
                  •
                </span>
                <p className="flex-1 text-[13px] text-ink">{v}</p>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                add(draft);
                setDraft("");
              }
            }}
            placeholder={`e.g. ${placeholderPool[placeholderIdx]}`}
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (draft.trim()) {
                add(draft);
                setDraft("");
              }
            }}
            className="rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}

function loadStringList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

// ── Products You Already Love ────────────────────────────────────────────
// The shelfie. Knowing what the bride reaches for on a normal Tuesday tells
// the MUA more than ten mood boards — shade undertones, brands she
// tolerates, formulas that don't break her out. Image-first card grid.

type LovedProductCategory =
  | "lipstick"
  | "foundation"
  | "eyeshadow"
  | "blush"
  | "mascara"
  | "skincare"
  | "hair"
  | "fragrance"
  | "other";

interface LovedProduct {
  id: string;
  category: LovedProductCategory;
  brand: string;
  shade: string;
  note: string;
  image_url: string;
}

const LOVED_PRODUCT_CATEGORIES: { value: LovedProductCategory; label: string; emoji: string }[] = [
  { value: "lipstick", label: "Lipstick", emoji: "💋" },
  { value: "foundation", label: "Foundation", emoji: "🤎" },
  { value: "eyeshadow", label: "Eye", emoji: "👁" },
  { value: "blush", label: "Blush", emoji: "🌸" },
  { value: "mascara", label: "Mascara", emoji: "🖤" },
  { value: "skincare", label: "Skincare", emoji: "✨" },
  { value: "hair", label: "Hair", emoji: "💇" },
  { value: "fragrance", label: "Fragrance", emoji: "🌿" },
  { value: "other", label: "Other", emoji: "•" },
];

function loadLovedProducts(): LovedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HMUA_LOVED_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is LovedProduct =>
        p && typeof p.id === "string" && typeof p.brand === "string",
    );
  } catch {
    return [];
  }
}

function ProductsYouAlreadyLoveSection({ category }: { category: WorkspaceCategory }) {
  const [products, setProducts] = useState<LovedProduct[]>([]);
  const [draftCategory, setDraftCategory] = useState<LovedProductCategory>("lipstick");
  const [draftBrand, setDraftBrand] = useState("");
  const [draftShade, setDraftShade] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  useEffect(() => {
    setProducts(loadLovedProducts());
  }, []);

  function persist(next: LovedProduct[]) {
    setProducts(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HMUA_LOVED_PRODUCTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function addProduct(image_url: string) {
    const brand = draftBrand.trim();
    if (!brand) return;
    const id = `lp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    persist([
      ...products,
      {
        id,
        category: draftCategory,
        brand,
        shade: draftShade.trim(),
        note: "",
        image_url,
      },
    ]);
    setDraftBrand("");
    setDraftShade("");
  }

  function updateProduct(id: string, patch: Partial<LovedProduct>) {
    persist(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function removeProduct(id: string) {
    persist(products.filter((p) => p.id !== id));
  }

  function handleFile(f: File) {
    const url = URL.createObjectURL(f);
    addProduct(url);
  }

  const grouped = useMemo(() => {
    const byCategory: Record<string, LovedProduct[]> = {};
    for (const p of products) {
      byCategory[p.category] = byCategory[p.category] ?? [];
      byCategory[p.category].push(p);
    }
    return byCategory;
  }, [products]);

  void category; // categoryId reserved for future per-wedding scoping

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          eyebrow="The shelfie"
          title="Products you already love"
          description="What you reach for on a normal Tuesday tells your artist more than any mood board. Add the ones you don't want to live without."
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
        {canEdit && (
          <div className="mb-4 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
            <Eyebrow className="mb-2">Add a product</Eyebrow>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <select
                value={draftCategory}
                onChange={(e) =>
                  setDraftCategory(e.target.value as LovedProductCategory)
                }
                className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-saffron focus:outline-none"
              >
                {LOVED_PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
              <input
                value={draftBrand}
                onChange={(e) => setDraftBrand(e.target.value)}
                placeholder="Brand — e.g. Charlotte Tilbury"
                className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
              <input
                value={draftShade}
                onChange={(e) => setDraftShade(e.target.value)}
                placeholder="Shade / name — Pillow Talk"
                className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
              <div className="flex items-center gap-1">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && draftBrand.trim()) handleFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!draftBrand.trim()) return;
                    fileInput.current?.click();
                  }}
                  className="flex-1 rounded-sm border border-border bg-white px-2 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
                  title="Upload with photo"
                >
                  <ImageIcon size={11} className="mr-1 inline" />
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => addProduct("")}
                  disabled={!draftBrand.trim()}
                  className={cn(
                    "flex-1 rounded-sm px-2 py-1.5 text-[11.5px] font-medium",
                    draftBrand.trim()
                      ? "bg-ink text-ivory hover:opacity-90"
                      : "bg-ivory-warm text-ink-faint",
                  )}
                >
                  <Plus size={11} className="mr-1 inline" />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <EmptyRow>
            Your everyday favourites — the lipstick you keep rebuying, the
            foundation that never breaks you out, the moisturiser your skin
            trusts.
          </EmptyRow>
        ) : (
          <div className="space-y-4">
            {LOVED_PRODUCT_CATEGORIES.filter((c) => (grouped[c.value] ?? []).length > 0).map(
              (cat) => (
                <section key={cat.value}>
                  <Eyebrow className="mb-2">
                    {cat.emoji} {cat.label}
                  </Eyebrow>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {(grouped[cat.value] ?? []).map((p) => (
                      <li
                        key={p.id}
                        className="group relative overflow-hidden rounded-md border border-border bg-white"
                      >
                        <div className="relative aspect-square bg-ivory-warm">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image_url}
                              alt={`${p.brand} ${p.shade}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl opacity-60">
                              {cat.emoji}
                            </div>
                          )}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => removeProduct(p.id)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                              aria-label="Remove product"
                            >
                              <Trash2 size={10} strokeWidth={1.8} />
                            </button>
                          )}
                        </div>
                        <div className="p-2">
                          <input
                            value={p.brand}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateProduct(p.id, { brand: e.target.value })
                            }
                            className="w-full bg-transparent font-serif text-[13px] leading-tight text-ink focus:outline-none disabled:opacity-60"
                          />
                          <input
                            value={p.shade}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateProduct(p.id, { shade: e.target.value })
                            }
                            placeholder="Shade / name"
                            className="mt-0.5 w-full bg-transparent text-[11.5px] italic text-ink-muted placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Skin & Hair Profile (quiz-first, operational edit beneath) ───────────

function SkinHairProfileCard({ category }: { category: WorkspaceCategory }) {
  const profile = useHmuaStore((s) => s.getProfile(category.id));
  const set = useHmuaStore((s) => s.setProfile);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const safe = profile;

  const [quizOpen, setQuizOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const quizDone = Boolean(profile.quiz_completed_at);

  const filledCount = [
    safe.skin_type,
    safe.skin_tone || safe.skin_tone_custom,
    safe.hair_type,
    safe.hair_length,
  ].filter((v) => v && String(v).length > 0).length;

  return (
    <section className="space-y-4">
      <div className="mb-3">
        <SectionHeader
          eyebrow="A smart dossier beats a 12-field form"
          title="Skin & hair profile"
          description="Two minutes, eleven questions. Your artist gets a card they screenshot — not a spreadsheet to decode."
        />
      </div>

      {canEdit && (
        <SkinHairQuizEntry
          onStart={() => setQuizOpen(true)}
          completed={quizDone}
          onRetake={() => setQuizOpen(true)}
        />
      )}

      {quizOpen && (
        <SkinHairQuizRunner
          categoryId={category.id}
          onClose={() => setQuizOpen(false)}
        />
      )}

      {quizDone && <SkinHairProfileResultCard profile={safe} />}

    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title={quizDone ? "Fine-tune the profile" : "Prefer the form?"}
      badge={
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {filledCount}/4 set
          </span>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-ink-muted hover:text-ink"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronDown size={14} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.8} />
            )}
          </button>
        </div>
      }
    >
      {!open ? (
        <p className="text-[12px] italic text-ink-muted">
          {quizDone
            ? "Everything below mirrors your quiz answers. Expand to adjust anything by hand."
            : "Rather skip the quiz? Expand to fill the form directly."}
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-[12px] text-ink-muted">
            Goes to every artist you talk to. Saves you re-explaining your skin
            at every trial.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChipField
              label="Skin type"
              options={SKIN_TYPE_OPTIONS}
              value={safe.skin_type}
              canEdit={canEdit}
              onChange={(v) => set(category.id, { skin_type: v as SkinType })}
            />
            <ChipField
              label="Skin tone"
              options={SKIN_TONE_OPTIONS}
              value={safe.skin_tone}
              canEdit={canEdit}
              onChange={(v) => set(category.id, { skin_tone: v as SkinTone })}
            />
            <ChipField
              label="Hair type"
              options={HAIR_TYPE_OPTIONS}
              value={safe.hair_type}
              canEdit={canEdit}
              onChange={(v) => set(category.id, { hair_type: v as HairType })}
            />
            <ChipField
              label="Hair length"
              options={HAIR_LENGTH_OPTIONS}
              value={safe.hair_length}
              canEdit={canEdit}
              onChange={(v) => set(category.id, { hair_length: v as HairLength })}
            />
          </div>

          <TextField
            label="Custom shade match"
            placeholder="MAC NC42, Fenty 350, foundation undertone…"
            value={safe.skin_tone_custom}
            canEdit={canEdit}
            onChange={(v) => set(category.id, { skin_tone_custom: v })}
          />

          <TextField
            label="Allergies"
            placeholder="Latex, lash adhesive, fragrance — anything to keep out of your kit"
            value={safe.allergies}
            canEdit={canEdit}
            onChange={(v) => set(category.id, { allergies: v })}
            block
          />

          <TextField
            label="Skin conditions to work around"
            placeholder="Rosacea, breakouts on chin, dry patches under eyes…"
            value={safe.skin_conditions}
            canEdit={canEdit}
            onChange={(v) => set(category.id, { skin_conditions: v })}
            block
          />

          <TextField
            label="Preferred brands"
            placeholder="MAC, Charlotte Tilbury, Bobbi Brown — or 'open to airbrush'"
            value={safe.preferred_brands}
            canEdit={canEdit}
            onChange={(v) => set(category.id, { preferred_brands: v })}
          />

          <label className="flex items-center gap-2 text-[12.5px] text-ink">
            <input
              type="checkbox"
              checked={safe.contact_lenses}
              disabled={!canEdit}
              onChange={(e) =>
                set(category.id, { contact_lenses: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
            />
            <span>I wear contact lenses (affects eye makeup approach)</span>
          </label>
        </div>
      )}
    </PanelCard>
    </section>
  );
}

function ChipField<T extends string>({
  label,
  options,
  value,
  canEdit,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  canEdit: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={!canEdit}
              onClick={() => onChange(active ? ("" as T) : o.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/60 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
                !canEdit && "cursor-not-allowed opacity-60",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  canEdit,
  block,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  canEdit: boolean;
  block?: boolean;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      {block ? (
        <textarea
          value={value}
          disabled={!canEdit}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="mt-1.5 w-full resize-none rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      ) : (
        <input
          value={value}
          disabled={!canEdit}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      )}
    </div>
  );
}
