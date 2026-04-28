"use client";

// ── Vision & Mood tab ─────────────────────────────────────────────────────
// The creative brief for the photographer. Pre-quiz: a single call to
// take the 5-question quiz. Post-quiz: the generated narrative brief,
// a derived 5-swatch palette, the labeled color/tone position, style
// keywords, a moodboard with Love/Note/Not-this reactions + Eyes/
// Composition/Mood/Detail tags, and reference photographers drawn from
// the vendor database.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ExternalLink,
  Eye,
  Flag,
  Frame,
  Heart,
  Image as ImageIcon,
  MessageSquarePlus,
  Palette as PaletteIcon,
  Plus,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useVisionStore } from "@/stores/vision-store";
import { formatPriceShort } from "@/lib/vendors/price-display";
import type {
  MoodboardReaction,
  MoodboardTag,
  WorkspaceCategory,
} from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { DragDropZone } from "@/components/workspace/editable/DragDropZone";
import { ChipInput } from "@/components/workspace/editable/ChipInput";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";
import {
  PHOTO_BRIEF_KEY,
  PHOTO_SWATCHES_KEY,
  PHOTO_TONE_SCALE_KEY,
  PHOTO_COLOR_TONE_KEY,
} from "@/lib/quiz/schemas/photography-vision-mood";

const CATEGORY = "photography" as const;
const VISION_QUIZ = getQuizSchema(CATEGORY, "vision_mood");

const DEFAULT_SWATCHES = ["#C9882E", "#EADFC9", "#B08A3E", "#FBF7F1", "#3B2A1E"];

// ── Entry ─────────────────────────────────────────────────────────────────

export function VisionMoodTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-6">
      {VISION_QUIZ && (
        <QuizEntryCard schema={VISION_QUIZ} categoryId={category.id} />
      )}

      <PhotographyBrief />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MoodboardSection category={category} />
        <div className="space-y-4">
          <StyleKeywordsSection />
          <ColorToneSection />
        </div>
      </div>

      <ReferencePhotographers />

      {VISION_QUIZ && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={VISION_QUIZ} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── Photography brief (post-quiz narrative + swatches + scale) ────────────

function PhotographyBrief() {
  const [brief, setBrief] = useState<string>("");
  const [swatches, setSwatches] = useState<string[]>(DEFAULT_SWATCHES);
  const [toneScale, setToneScale] = useState<number | null>(null);
  const [toneLabel, setToneLabel] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const b = window.localStorage.getItem(PHOTO_BRIEF_KEY);
      if (b) setBrief(b);
      const sw = window.localStorage.getItem(PHOTO_SWATCHES_KEY);
      if (sw) {
        const parsed = JSON.parse(sw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          setSwatches(parsed);
        }
      }
      const ts = window.localStorage.getItem(PHOTO_TONE_SCALE_KEY);
      if (ts) setToneScale(Number(ts));
      const tl = window.localStorage.getItem(PHOTO_COLOR_TONE_KEY);
      if (tl) setToneLabel(tl);
    } catch {
      // ignore
    }
  }, []);

  function persistBrief(next: string) {
    setBrief(next);
    try {
      window.localStorage.setItem(PHOTO_BRIEF_KEY, next);
    } catch {
      // ignore
    }
  }

  if (!brief && toneScale === null) {
    // Pre-quiz: render nothing — the QuizEntryCard above asks for input.
    return null;
  }

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Your photography brief"
      badge={
        <Link
          href="/studio"
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Edit in Studio <ArrowRight size={10} />
        </Link>
      }
    >
      {brief && (
        <div className="mb-4 rounded-md border border-gold/15 bg-ivory-warm/40 p-4">
          <InlineText
            value={brief}
            onSave={persistBrief}
            variant="block"
            allowEmpty
            className="!p-0 font-serif text-[15.5px] italic leading-relaxed text-ink"
            placeholder="Your brief will appear here after the quiz…"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Eyebrow className="mb-2 flex items-center gap-1.5">
            <PaletteIcon size={10} /> Derived palette
          </Eyebrow>
          <div className="flex gap-2">
            {swatches.map((c, i) => (
              <div
                key={`${c}-${i}`}
                className="flex flex-col items-center gap-1"
                title={c}
              >
                <span
                  className="h-10 w-10 rounded-sm ring-1 ring-border"
                  style={{ backgroundColor: c }}
                />
                <span
                  className="font-mono text-[9px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {c.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {toneScale !== null && (
          <div>
            <Eyebrow className="mb-2">Color & tone scale</Eyebrow>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-[#C9882E] via-[#EADFC9] to-[#3B2A1E]">
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-sm"
                style={{ left: `${toneScale}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9.5px] text-ink-faint">
              <span>Warm & golden</span>
              <span>Cool & moody</span>
            </div>
            {toneLabel && (
              <p className="mt-2 text-[12px] italic text-ink-muted">{toneLabel}</p>
            )}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

// ── Moodboard ─────────────────────────────────────────────────────────────

const REACTION_META: Record<
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

const TAG_OPTIONS: { value: MoodboardTag; label: string }[] = [
  { value: "eyes", label: "Eyes" },
  { value: "composition", label: "Composition" },
  { value: "mood", label: "Mood" },
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
    () => (filterTag === "all" ? items : items.filter((i) => i.tag === filterTag)),
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
      title="Moodboard"
      className="lg:col-span-2"
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
          {TAG_OPTIONS.map((t) => (
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
              ? "Drop inspiration here. Tag each pin with Eyes / Composition / Mood / Detail so your photographer knows what to study."
              : "No pins tagged yet. Pick a different filter, or tag some pins."}
          </EmptyRow>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
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
              REACTION_META[item.reaction].active,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {REACTION_META[item.reaction].icon}
            {REACTION_META[item.reaction].label}
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
        {(Object.keys(REACTION_META) as MoodboardReaction[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onReact(r)}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
              item.reaction === r
                ? REACTION_META[r].active
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
            title={REACTION_META[r].label}
          >
            {REACTION_META[r].icon}
          </button>
        ))}
        <span className="mx-0.5 text-ink-faint">·</span>
        {TAG_OPTIONS.map((t) => (
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

// ── Style keywords ────────────────────────────────────────────────────────

function StyleKeywordsSection() {
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(() => keywordsMap[CATEGORY] ?? [], [keywordsMap]);
  const setKeywords = useVisionStore((s) => s.setKeywords);

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Style keywords"
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        The look in words. Type + Enter to add.
      </p>
      <ChipInput
        values={keywords}
        onChange={(n) => setKeywords(CATEGORY, n)}
        placeholder="editorial, candid, warm…"
        tone="saffron"
      />
    </PanelCard>
  );
}

// ── Color & tone (free-text supplement to the labeled scale) ──────────────

function ColorToneSection() {
  const [tone, setTone] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(PHOTO_COLOR_TONE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  function persist(next: string) {
    setTone(next);
    try {
      localStorage.setItem(PHOTO_COLOR_TONE_KEY, next);
    } catch {
      // ignore
    }
  }

  return (
    <PanelCard title="Color & tone notes">
      <p className="mb-2 text-[12px] text-ink-muted">
        Whatever specifics the scale can't express — "avoid teal-orange
        grading," "skin-tone-first," etc.
      </p>
      <InlineText
        value={tone}
        onSave={persist}
        variant="block"
        placeholder="e.g. warm and golden, low contrast, skin-tone-first. Avoid teal-and-orange grading."
        emptyLabel="Click to describe the tone…"
        allowEmpty
        className="!p-0 text-[12.5px] leading-relaxed text-ink"
      />
    </PanelCard>
  );
}

// ── Reference photographers (carousel from vendor DB + shortlist toggle) ──

function ReferencePhotographers() {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(() => keywordsMap[CATEGORY] ?? [], [keywordsMap]);

  const photographers = useMemo(() => {
    const all = vendors.filter((v) => v.category === "photography");
    return all
      .map((v) => {
        const overlap = v.style_tags.filter((t) =>
          keywords.some(
            (k) =>
              k.toLowerCase() === t.toLowerCase() ||
              t.toLowerCase().includes(k.toLowerCase()) ||
              k.toLowerCase().includes(t.toLowerCase()),
          ),
        ).length;
        const pct =
          keywords.length === 0
            ? null
            : Math.min(100, Math.round((overlap / keywords.length) * 100));
        return { vendor: v, matchPct: pct };
      })
      .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))
      .slice(0, 8);
  }, [vendors, keywords]);

  return (
    <PanelCard
      icon={<Frame size={14} strokeWidth={1.8} />}
      title="Reference photographers"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Matched to your brief
        </span>
      }
    >
      {photographers.length === 0 ? (
        <EmptyRow>
          No photographers in the directory yet. Use Shortlist & Contract to
          add names.
        </EmptyRow>
      ) : (
        <div className="overflow-x-auto">
          <ul className="flex min-w-full gap-3 pb-1">
            {photographers.map(({ vendor, matchPct }) => {
              const listed = shortlist.some((e) => e.vendor_id === vendor.id);
              return (
                <li
                  key={vendor.id}
                  className="w-[240px] shrink-0 rounded-md border border-border bg-white p-3"
                >
                  <div className="mb-2 flex aspect-[4/3] items-center justify-center rounded-sm bg-ivory-warm">
                    <Camera size={28} className="text-ink-faint" strokeWidth={1.2} />
                  </div>
                  <p className="truncate text-[13px] font-medium text-ink">
                    {vendor.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {vendor.location || "—"} · {formatPriceShort(vendor.price_display)}
                  </p>
                  {matchPct !== null && (
                    <p
                      className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-sage"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {matchPct}% style match
                    </p>
                  )}
                  {vendor.style_tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {vendor.style_tags.slice(0, 3).map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <Link
                      href={`/vendors/${vendor.id}`}
                      className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted hover:text-saffron"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <ExternalLink size={10} /> Portfolio
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleShortlist(vendor.id)}
                      className={cn(
                        "flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                        listed
                          ? "border-saffron bg-saffron-pale/40 text-saffron"
                          : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Heart
                        size={10}
                        className={listed ? "fill-saffron" : ""}
                      />
                      {listed ? "Saved" : "Shortlist"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </PanelCard>
  );
}
