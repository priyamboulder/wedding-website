"use client";

// ── Cake & Sweets · Vision & Mood tab ─────────────────────────────────────
// The emotional brief for the pastry team. Mirrors the Photography Vision &
// Mood tab in structure and interaction philosophy: quiz → keywords → tone
// slider → moodboard → per-event reference gallery → moment wishlist →
// dessert brief → notes. Every prompt asks how sweet should FEEL, not which
// flavors to pick.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cake,
  CakeSlice,
  Candy,
  Heart,
  IceCream,
  Image as ImageIcon,
  Plus,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useVisionStore } from "@/stores/vision-store";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import type {
  MoodboardReaction,
  MoodboardTag,
  WorkspaceCategory,
  WeddingEvent,
} from "@/types/workspace";
import {
  ALLERGEN_OPTIONS,
  FLAVOR_PROFILES,
  TRADITION_DIRECTIONS,
} from "@/lib/cake-sweets-seed";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { DragDropZone } from "@/components/workspace/editable/DragDropZone";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

const CATEGORY = "cake_sweets" as const;
const VISION_QUIZ = getQuizSchema(CATEGORY, "vision");

// ── localStorage keys (couple-editable, survive across sessions) ──────────
const CAKE_BRIEF_KEY = "ananya:cake-sweets-brief";
const CAKE_MOMENTS_KEY = "ananya:cake-sweets-moments";
const CAKE_REF_GALLERY_KEY = "ananya:cake-sweets-ref-gallery";

// ── Default style keywords the couple can tap (plus ability to add own) ───
const DEFAULT_KEYWORDS = [
  "classic",
  "whimsical",
  "minimalist",
  "maximalist",
  "rustic",
  "garden-party",
  "Art Deco",
  "South Asian fusion",
  "opulent",
  "earthy",
  "playful",
  "romantic",
  "modern-clean",
  "vintage",
];

// ── Moodboard tag filters (cake-specific) ─────────────────────────────────
const TAG_OPTIONS: { value: MoodboardTag; label: string }[] = [
  { value: "cake", label: "Cake" },
  { value: "mithai", label: "Mithai" },
  { value: "table_styling", label: "Table styling" },
  { value: "plating", label: "Plating" },
  { value: "colour", label: "Colour" },
];

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
    icon: <Sparkles size={10} strokeWidth={1.8} />,
    active: "border-marigold bg-marigold-pale/60 text-marigold",
  },
  not_this: {
    label: "Not for us",
    icon: <X size={10} strokeWidth={1.8} />,
    active: "border-ink bg-ink text-ivory",
  },
};

// ── Reference gallery suggestions, by event ───────────────────────────────
// Each event gets 3 curated suggested images tailored to when desserts appear
// during that celebration. Couple can Love / Not-for-us each one, add their
// own URLs, or upload from disk. Suggestions are read-only starters.
const REF_GALLERY_SUGGESTIONS: Record<
  WeddingEvent,
  { id: string; image_url: string; caption: string }[]
> = {
  pre_wedding: [],
  haldi: [
    {
      id: "haldi-marigold",
      image_url:
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=640&q=70",
      caption: "Marigold-glazed ladoo towers",
    },
    {
      id: "haldi-turmeric",
      image_url:
        "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=640&q=70",
      caption: "Turmeric sponge with saffron cream",
    },
    {
      id: "haldi-banana-leaf",
      image_url:
        "https://images.unsplash.com/photo-1601050690117-94f5f7a16345?w=640&q=70",
      caption: "Banana-leaf mithai plating",
    },
  ],
  mehendi: [
    {
      id: "mehendi-henna-cake",
      image_url:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&q=70",
      caption: "Henna-piped fondant cake",
    },
    {
      id: "mehendi-paan",
      image_url:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=640&q=70",
      caption: "Paan station with silver varaq",
    },
    {
      id: "mehendi-jalebi",
      image_url:
        "https://images.unsplash.com/photo-1601050690117-94f5f7a16345?w=640&q=70",
      caption: "Live jalebi press, warm kesar",
    },
  ],
  sangeet: [
    {
      id: "sangeet-dessert-bar",
      image_url:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=640&q=70",
      caption: "Lit dessert bar, mirrored back",
    },
    {
      id: "sangeet-kulfi",
      image_url:
        "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=640&q=70",
      caption: "Kulfi pops, chef-attended",
    },
    {
      id: "sangeet-gulab-jamun",
      image_url:
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=640&q=70",
      caption: "Gulab jamun fountain centrepiece",
    },
  ],
  wedding: [
    {
      id: "wedding-tiered",
      image_url:
        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=640&q=70",
      caption: "Tall tiered white cake, fresh florals",
    },
    {
      id: "wedding-mithai-thali",
      image_url:
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=640&q=70",
      caption: "Mithai thali centrepiece per table",
    },
    {
      id: "wedding-naked",
      image_url:
        "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=640&q=70",
      caption: "Naked tier with pistachio rubble",
    },
  ],
  reception: [
    {
      id: "reception-modern",
      image_url:
        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=640&q=70",
      caption: "Modern minimalist cake, metallic base",
    },
    {
      id: "reception-station",
      image_url:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=640&q=70",
      caption: "Late-night fusion dessert station",
    },
    {
      id: "reception-coffee",
      image_url:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&q=70",
      caption: "Coffee cart with masala chai pastries",
    },
  ],
};

// ── Events that appear in the reference gallery tabs ──────────────────────
const REF_EVENTS: { id: WeddingEvent; label: string; prompt: string }[] = [
  {
    id: "mehendi",
    label: "Mehendi",
    prompt: "What should Mehendi sweets feel like?",
  },
  {
    id: "sangeet",
    label: "Sangeet",
    prompt: "What should Sangeet sweets feel like?",
  },
  {
    id: "wedding",
    label: "Wedding",
    prompt: "What should Wedding sweets feel like?",
  },
  {
    id: "reception",
    label: "Reception",
    prompt: "What should Reception sweets feel like?",
  },
  {
    id: "haldi",
    label: "Haldi",
    prompt: "What should Haldi sweets feel like?",
  },
];

type RefImage = {
  id: string;
  image_url: string;
  caption: string;
  suggested?: boolean;
  reaction?: "love" | "not_this";
};

type RefGalleryState = Partial<Record<WeddingEvent, RefImage[]>>;

// ── Moment wishlist item ──────────────────────────────────────────────────
type Moment = { id: string; text: string };

const SUGGESTED_MOMENTS = [
  "The cutting of the cake — both of us, hands over hands, mom in the frame.",
  "The first piece of mithai offered to elders, feet touched.",
  "The late-night jalebi run when the dance floor thins out.",
  "Guests leaning in over the dessert table, phones out, eyes wide.",
];

// ── Entry ─────────────────────────────────────────────────────────────────

export function VisionMoodTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-6">
      {VISION_QUIZ && (
        <QuizEntryCard schema={VISION_QUIZ} categoryId={category.id} />
      )}

      <StyleKeywordsSection />

      <FlavorProfileSection />

      <AllergensSection />

      <MoodboardSection category={category} />

      <ReferenceGalleryByEvent />

      <MomentWishlistSection />

      <DessertBriefSection />

      <NotesSection category={category} />

      {VISION_QUIZ && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={VISION_QUIZ} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── 2. Style keywords ─────────────────────────────────────────────────────

function StyleKeywordsSection() {
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(() => keywordsMap[CATEGORY] ?? [], [keywordsMap]);
  const setKeywords = useVisionStore((s) => s.setKeywords);
  const [draft, setDraft] = useState("");

  function toggle(word: string) {
    const has = keywords.some((k) => k.toLowerCase() === word.toLowerCase());
    if (has) {
      setKeywords(
        CATEGORY,
        keywords.filter((k) => k.toLowerCase() !== word.toLowerCase()),
      );
    } else {
      setKeywords(CATEGORY, [...keywords, word]);
    }
  }

  function addCustom() {
    const v = draft.trim();
    if (!v) return;
    if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setKeywords(CATEGORY, [...keywords, v]);
    setDraft("");
  }

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Style keywords"
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Tap the ones that feel right. Add your own.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {DEFAULT_KEYWORDS.map((word) => {
          const active = keywords.some(
            (k) => k.toLowerCase() === word.toLowerCase(),
          );
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggle(word)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/60 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
              )}
            >
              <Plus size={10} strokeWidth={2} className={active ? "rotate-45" : ""} />
              {word}
            </button>
          );
        })}
        {keywords
          .filter(
            (k) =>
              !DEFAULT_KEYWORDS.some(
                (d) => d.toLowerCase() === k.toLowerCase(),
              ),
          )
          .map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => toggle(word)}
              className="group inline-flex items-center gap-1 rounded-full border border-saffron bg-saffron-pale/60 px-2.5 py-1 text-[12px] text-saffron transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
              title="Remove"
            >
              {word}
              <X size={10} strokeWidth={2} className="opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        <div className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-ivory-warm/40 px-2.5 py-0.5">
          <Plus size={10} strokeWidth={2} className="text-ink-faint" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            onBlur={addCustom}
            placeholder="add your own"
            className="w-[110px] bg-transparent py-0.5 text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>
    </PanelCard>
  );
}

// ── 3. Flavor profile (couple's dessert preferences) ──────────────────────

function FlavorProfileSection() {
  const sweetness = useCakeSweetsStore((s) => s.flavor.sweetness);
  const reactions = useCakeSweetsStore((s) => s.flavor.flavor_reactions);
  const tradition = useCakeSweetsStore((s) => s.flavor.tradition);
  const brideFavorite = useCakeSweetsStore((s) => s.flavor.bride_favorite);
  const groomFavorite = useCakeSweetsStore((s) => s.flavor.groom_favorite);
  const setSweetness = useCakeSweetsStore((s) => s.setSweetness);
  const setFlavorReaction = useCakeSweetsStore((s) => s.setFlavorReaction);
  const setTradition = useCakeSweetsStore((s) => s.setTradition);
  const setBrideFavorite = useCakeSweetsStore((s) => s.setBrideFavorite);
  const setGroomFavorite = useCakeSweetsStore((s) => s.setGroomFavorite);

  const lovedCount = Object.values(reactions).filter((r) => r === "love").length;

  return (
    <PanelCard
      icon={<Candy size={14} strokeWidth={1.8} />}
      title="Flavor & tradition"
      badge={
        lovedCount > 0 ? (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {lovedCount} flavor{lovedCount === 1 ? "" : "s"} loved
          </span>
        ) : undefined
      }
    >
      <p className="mb-4 text-[12.5px] text-ink-muted">
        Your actual dessert preferences — not a colour abstraction. Your baker
        reads this first.
      </p>

      {/* Sweetness slider */}
      <div className="mb-6">
        <Eyebrow className="mb-2">How sweet do you like things?</Eyebrow>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={sweetness}
          onChange={(e) => setSweetness(Number(e.target.value))}
          className="w-full accent-saffron"
          aria-label="Sweetness level"
        />
        <div className="mt-1 flex justify-between font-mono text-[9.5px] text-ink-faint">
          <span>Just a hint</span>
          <span>Balanced</span>
          <span>Bring on the sugar</span>
        </div>
      </div>

      {/* Flavor cards */}
      <div className="mb-6">
        <Eyebrow className="mb-2">What flavors do you gravitate toward?</Eyebrow>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {FLAVOR_PROFILES.map((f) => {
            const r = reactions[f.id];
            return (
              <li key={f.id}>
                <div
                  className={cn(
                    "rounded-md border bg-white p-3 transition-colors",
                    r === "love"
                      ? "border-rose bg-rose-pale/30"
                      : r === "not_this"
                        ? "border-ink bg-ivory-warm/40 opacity-60"
                        : "border-border",
                  )}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-serif text-[14px] text-ink">
                        <span className="mr-1.5">{f.emoji}</span>
                        {f.label}
                      </p>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                        {f.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setFlavorReaction(f.id, r === "love" ? null : "love")
                      }
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.06em] transition-colors",
                        r === "love"
                          ? "border-rose bg-rose text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-rose hover:text-rose",
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Heart
                        size={10}
                        strokeWidth={1.8}
                        className={r === "love" ? "fill-ivory" : ""}
                      />
                      Love
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFlavorReaction(
                          f.id,
                          r === "not_this" ? null : "not_this",
                        )
                      }
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.06em] transition-colors",
                        r === "not_this"
                          ? "border-ink bg-ink text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-ink",
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <X size={10} strokeWidth={1.8} />
                      Not for us
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tradition direction */}
      <div className="mb-6">
        <Eyebrow className="mb-2">Indian, Western, or both?</Eyebrow>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {TRADITION_DIRECTIONS.map((t) => {
            const active = tradition === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTradition(active ? null : t.id)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 rounded-md border bg-white p-3 text-left transition-colors",
                    active
                      ? "border-saffron bg-saffron-pale/40"
                      : "border-border hover:border-saffron",
                  )}
                >
                  <span className="font-serif text-[15px] text-ink">
                    <span className="mr-1.5">{t.emoji}</span>
                    {t.label}
                  </span>
                  <span className="text-[11.5px] leading-snug text-ink-muted">
                    {t.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Couple's favorite desserts */}
      <div>
        <Eyebrow className="mb-2">What's YOUR favorite dessert?</Eyebrow>
        <p className="mb-2 text-[11.5px] text-ink-muted">
          The one you'd eat right now — a little personal is a good thing.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded-md border border-border bg-white p-3">
            <Eyebrow className="mb-1">Partner 1 (bride)</Eyebrow>
            <input
              type="text"
              value={brideFavorite}
              onChange={(e) => setBrideFavorite(e.target.value)}
              placeholder="Chocolate lava cake, jalebi, my nana's kheer…"
              className="w-full rounded-sm border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </div>
          <div className="rounded-md border border-border bg-white p-3">
            <Eyebrow className="mb-1">Partner 2 (groom)</Eyebrow>
            <input
              type="text"
              value={groomFavorite}
              onChange={(e) => setGroomFavorite(e.target.value)}
              placeholder="Tiramisu, gulab jamun, mom's gajar halwa…"
              className="w-full rounded-sm border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ── 3b. Allergens & dietary (carries forward to other tabs) ───────────────

function AllergensSection() {
  const flags = useCakeSweetsStore((s) => s.allergens.flags);
  const notes = useCakeSweetsStore((s) => s.allergens.notes);
  const toggleAllergen = useCakeSweetsStore((s) => s.toggleAllergen);
  const setAllergenNotes = useCakeSweetsStore((s) => s.setAllergenNotes);

  const activeCount = Object.values(flags).filter(Boolean).length;

  return (
    <PanelCard
      icon={<ShieldAlert size={14} strokeWidth={1.8} />}
      title="Allergen & dietary needs"
      badge={
        activeCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-sm border border-amber-400 bg-amber-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-700"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ShieldAlert size={10} strokeWidth={1.8} />
            {activeCount} flag{activeCount === 1 ? "" : "s"} active
          </span>
        ) : undefined
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        These apply across every dessert — cake, mithai, table station. They
        carry forward as warnings on each tab, so your baker and mithai shop
        can plan separate batches.
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {ALLERGEN_OPTIONS.map((a) => {
          const active = flags[a.id];
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAllergen(a.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors",
                active
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-border bg-white text-ink-muted hover:border-amber-400 hover:text-amber-700",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {active ? (
                <Plus size={10} strokeWidth={2} className="rotate-45" />
              ) : (
                <Plus size={10} strokeWidth={2} />
              )}
              {a.label}
            </button>
          );
        })}
      </div>

      <div>
        <Eyebrow className="mb-1">Specific allergies or diets</Eyebrow>
        <textarea
          value={notes}
          onChange={(e) => setAllergenNotes(e.target.value)}
          placeholder="e.g. 4 guests with severe nut allergy — keep nut tier on separate stand; grandmother is Jain, avoid onion/garlic crossover."
          rows={2}
          className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

// ── 4. Moodboard (URL/upload + filter chips + Love/Note/Not-this tiles) ──

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
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Paste URLs, drop files, tag each pin so your baker knows what to study.
      </p>

      <DragDropZone
        onDropFiles={handleFileDrop}
        onDropUrls={handleUrlDrop}
        overlayLabel="Drop to pin"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-ivory-warm/30 px-4 py-10 text-center">
            <IceCream size={22} className="text-ink-faint" strokeWidth={1.4} />
            <p className="font-serif text-[15px] italic text-ink">
              Drop inspiration here.
            </p>
            <p className="max-w-md text-[12px] leading-relaxed text-ink-muted">
              {filterTag === "all"
                ? "Tag each pin so your baker knows what to reference — cake, mithai, table styling, plating, or colour."
                : "No pins tagged yet for this category. Try another filter, or tag a pin below."}
            </p>
          </div>
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
            {TAG_OPTIONS.find((t) => t.value === item.tag)?.label ?? item.tag}
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

// ── 5. Reference gallery by event ─────────────────────────────────────────

function ReferenceGalleryByEvent() {
  const [activeEvent, setActiveEvent] = useState<WeddingEvent>("mehendi");
  const [state, setState] = useState<RefGalleryState>({});
  const [urlDraft, setUrlDraft] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(CAKE_REF_GALLERY_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function persist(next: RefGalleryState) {
    setState(next);
    try {
      window.localStorage.setItem(CAKE_REF_GALLERY_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  // Merge: suggested starters first (read-only until reacted to), then
  // the couple's additions.
  const eventSuggestions = REF_GALLERY_SUGGESTIONS[activeEvent] ?? [];
  const userImages = state[activeEvent] ?? [];
  const userIds = new Set(userImages.map((x) => x.id));
  const suggested: RefImage[] = eventSuggestions
    .filter((s) => !userIds.has(s.id))
    .map((s) => ({ ...s, suggested: true }));
  const combined: RefImage[] = hydrated ? [...suggested, ...userImages] : [];

  function react(imageId: string, r: "love" | "not_this") {
    const current = state[activeEvent] ?? [];
    const existing = current.find((x) => x.id === imageId);
    if (existing) {
      const next = current.map((x) =>
        x.id === imageId
          ? { ...x, reaction: x.reaction === r ? undefined : r }
          : x,
      );
      persist({ ...state, [activeEvent]: next });
      return;
    }
    // Suggested image — copy it into the couple's list with the reaction.
    const seed = eventSuggestions.find((s) => s.id === imageId);
    if (!seed) return;
    persist({
      ...state,
      [activeEvent]: [...current, { ...seed, suggested: true, reaction: r }],
    });
  }

  function remove(imageId: string) {
    const current = state[activeEvent] ?? [];
    const removed = current.find((x) => x.id === imageId);
    if (!removed) return;
    const next = current.filter((x) => x.id !== imageId);
    persist({ ...state, [activeEvent]: next });
    pushUndo({
      message: "Reference removed",
      undo: () =>
        persist({
          ...state,
          [activeEvent]: [...(state[activeEvent] ?? []), removed],
        }),
    });
  }

  function addUrl(url: string) {
    const v = url.trim();
    if (!v) return;
    const current = state[activeEvent] ?? [];
    persist({
      ...state,
      [activeEvent]: [
        ...current,
        { id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, image_url: v, caption: "" },
      ],
    });
    setUrlDraft("");
  }

  function addFiles(files: File[]) {
    const current = state[activeEvent] ?? [];
    const additions: RefImage[] = files.map((f) => ({
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      image_url: URL.createObjectURL(f),
      caption: f.name.replace(/\.[^.]+$/, ""),
    }));
    persist({ ...state, [activeEvent]: [...current, ...additions] });
  }

  const activeDef = REF_EVENTS.find((e) => e.id === activeEvent) ?? REF_EVENTS[0]!;

  return (
    <PanelCard
      icon={<CakeSlice size={14} strokeWidth={1.8} />}
      title="Reference gallery by event"
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Browse our suggestions, add your own, tell us what you love.
      </p>

      {/* Event tab pills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {REF_EVENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActiveEvent(e.id)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors",
              activeEvent === e.id
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {e.label}
          </button>
        ))}
      </div>

      <p className="mb-3 font-serif text-[15px] italic text-ink">
        {activeDef.prompt}
      </p>

      <DragDropZone
        onDropFiles={addFiles}
        onDropUrls={(urls) => urls.forEach((u) => addUrl(u))}
        overlayLabel="Drop to add reference"
      >
        {combined.length === 0 ? (
          <EmptyRow>
            Drop images here from your desktop, the moodboard, or the
            Inspiration tab.
          </EmptyRow>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {combined.map((img) => (
              <RefCard
                key={img.id}
                image={img}
                onReact={(r) => react(img.id, r)}
                onRemove={() => remove(img.id)}
              />
            ))}
          </ul>
        )}
      </DragDropZone>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && urlDraft.trim()) addUrl(urlDraft);
          }}
          placeholder={`Paste an image URL for ${activeDef.label}…`}
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
            if (list.length) addFiles(list);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => addUrl(urlDraft)}
          className="rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          Add
        </button>
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

function RefCard({
  image,
  onReact,
  onRemove,
}: {
  image: RefImage;
  onReact: (r: "love" | "not_this") => void;
  onRemove: () => void;
}) {
  return (
    <li className="group relative overflow-hidden rounded-md ring-1 ring-border">
      <div className="relative aspect-[4/3] bg-ivory-warm">
        <img
          src={image.image_url}
          alt={image.caption}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {image.suggested && (
          <span
            className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-saffron-pale/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Plus size={9} strokeWidth={2} /> Suggested
          </span>
        )}
        {!image.suggested && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
            aria-label="Remove reference"
          >
            <Trash2 size={10} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div className="space-y-1 border-t border-border bg-white px-2 py-1.5">
        {image.caption && (
          <p className="truncate text-[11.5px] italic text-ink-muted">
            {image.caption}
          </p>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReact("love")}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
              image.reaction === "love"
                ? "border-rose bg-rose text-ivory"
                : "border-border bg-white text-ink-muted hover:border-rose hover:text-rose",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Heart
              size={10}
              strokeWidth={1.8}
              className={image.reaction === "love" ? "fill-ivory" : ""}
            />
            Love
          </button>
          <button
            type="button"
            onClick={() => onReact("not_this")}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
              image.reaction === "not_this"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <X size={10} strokeWidth={1.8} /> Not for us
          </button>
        </div>
      </div>
    </li>
  );
}

// ── 6. Expression & moment wishlist ───────────────────────────────────────

function MomentWishlistSection() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(CAKE_MOMENTS_KEY);
      if (raw) setMoments(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function persist(next: Moment[]) {
    setMoments(next);
    try {
      window.localStorage.setItem(CAKE_MOMENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function add(text: string) {
    const v = text.trim();
    if (!v) return;
    persist([
      ...moments,
      { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: v },
    ]);
    setDraft("");
  }

  function remove(id: string) {
    const removed = moments.find((m) => m.id === id);
    if (!removed) return;
    persist(moments.filter((m) => m.id !== id));
    pushUndo({
      message: "Moment removed",
      undo: () => persist([...moments.filter((m) => m.id !== id), removed]),
    });
  }

  function update(id: string, text: string) {
    persist(moments.map((m) => (m.id === id ? { ...m, text } : m)));
  }

  function suggest() {
    const existing = new Set(moments.map((m) => m.text.toLowerCase()));
    const fresh = SUGGESTED_MOMENTS.filter(
      (s) => !existing.has(s.toLowerCase()),
    );
    if (fresh.length === 0) return;
    const pick = fresh[Math.floor(Math.random() * fresh.length)]!;
    persist([
      ...moments,
      { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: pick },
    ]);
  }

  return (
    <PanelCard
      icon={<Star size={14} strokeWidth={1.8} />}
      title="Expression & moment wishlist"
      badge={
        <button
          type="button"
          onClick={suggest}
          className="inline-flex items-center gap-1 rounded-sm border border-gold/30 bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={10} strokeWidth={1.8} /> Suggest moments
        </button>
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Not a dessert list — your emotional input. The expressions and beats
        you want captured.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) add(draft);
          }}
          placeholder="e.g. The look on my mom's face when she sees the cake…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={() => add(draft)}
          className="rounded-sm border border-border px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          Add
        </button>
      </div>

      {!hydrated || moments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-ivory-warm/30 px-4 py-8 text-center">
          <Star size={18} className="text-ink-faint" strokeWidth={1.4} />
          <p className="font-serif text-[15px] italic text-ink">
            List the moments you can't miss.
          </p>
          <p className="max-w-md text-[12px] leading-relaxed text-ink-muted">
            Your baker reads these first. Tell them the presentations and beats
            that, if missed, would break your heart.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {moments.map((m) => (
            <li
              key={m.id}
              className="group flex items-start gap-2 rounded-sm border border-border bg-white px-3 py-2"
            >
              <Star
                size={12}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-saffron"
              />
              <div className="min-w-0 flex-1">
                <InlineText
                  value={m.text}
                  onSave={(next) => update(m.id, next)}
                  variant="block"
                  className="!p-0 text-[13px] leading-relaxed text-ink"
                  placeholder="Describe the moment…"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove moment"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── 7. Dessert brief (the document the baker reads first) ─────────────────

function DessertBriefSection() {
  const [brief, setBrief] = useState<string>("");
  const [refining, setRefining] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const b = window.localStorage.getItem(CAKE_BRIEF_KEY);
      if (b) setBrief(b);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function persist(next: string) {
    setBrief(next);
    try {
      window.localStorage.setItem(CAKE_BRIEF_KEY, next);
    } catch {
      // ignore
    }
  }

  // Demonstrative polish — tightens whitespace and capitalises the first
  // sentence. A real AI wire-up replaces this later.
  function refine() {
    if (!brief.trim()) return;
    setRefining(true);
    setTimeout(() => {
      const cleaned = brief
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^([a-z])/, (m) => m.toUpperCase());
      persist(cleaned);
      setRefining(false);
    }, 400);
  }

  return (
    <PanelCard
      icon={<Cake size={14} strokeWidth={1.8} />}
      title="Your Dessert Brief"
      badge={
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The document your baker reads first
          </span>
          <button
            type="button"
            onClick={refine}
            disabled={refining || !brief.trim()}
            className="inline-flex items-center gap-1 rounded-sm border border-gold/30 bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/40 disabled:opacity-40"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles size={10} strokeWidth={1.8} />
            {refining ? "Refining…" : "Refine with AI"}
          </button>
        </div>
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Describe the feeling you want — not the flavors. We'll polish the
        structure.
      </p>
      <div className="rounded-md border border-gold/15 bg-ivory-warm/40 p-4">
        {hydrated ? (
          <InlineText
            value={brief}
            onSave={persist}
            variant="block"
            allowEmpty
            multilineRows={6}
            className="!p-0 font-serif text-[15.5px] italic leading-relaxed text-ink"
            placeholder="Click to write a brief — a few sentences about what your wedding desserts should feel like. Don't worry about structure; we'll help you polish it."
            emptyLabel="Click to write a brief — a few sentences about what your wedding desserts should feel like. Don't worry about structure; we'll help you polish it."
          />
        ) : (
          <p className="font-serif text-[15.5px] italic leading-relaxed text-ink-faint">
            Click to write a brief…
          </p>
        )}
      </div>
    </PanelCard>
  );
}

// ── 8. Notes (workspace-store backed) ─────────────────────────────────────

function NotesSection({ category }: { category: WorkspaceCategory }) {
  const allNotes = useWorkspaceStore((s) => s.notes);
  const notes = useMemo(
    () => allNotes.filter((n) => n.category_id === category.id),
    [allNotes, category.id],
  );
  const addNote = useWorkspaceStore((s) => s.addNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const [draft, setDraft] = useState("");

  function save() {
    const v = draft.trim();
    if (!v) return;
    addNote(category.id, v);
    setDraft("");
  }

  return (
    <PanelCard title="Notes">
      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          placeholder="Add a note…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          className="rounded-sm border border-border px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          Save
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyRow>No notes yet.</EmptyRow>
      ) : (
        <ul className="space-y-1.5">
          {notes.map((n) => (
            <li
              key={n.id}
              className="group flex items-start gap-2 rounded-sm border border-border bg-white px-3 py-2"
            >
              <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink">
                {n.body}
              </div>
              <button
                type="button"
                onClick={() => deleteNote(n.id)}
                className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove note"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
