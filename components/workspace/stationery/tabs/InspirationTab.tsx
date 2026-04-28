"use client";

// ── Stationery · Inspiration tab ──────────────────────────────────────────
// Broader inspiration gathering that complements the piece-scoped gallery
// on Vision & Mood. Three sections:
//   1. Moodboard reference back to the single moodboard from Vision & Mood.
//   2. Themed reference gallery — Romantic / Modern / Traditional / etc.
//   3. "I keep coming back to…" free-text list with AI-suggest button.

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Heart,
  Image as ImageIcon,
  Notebook,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";

type Theme =
  | "romantic"
  | "modern"
  | "traditional"
  | "whimsical"
  | "luxe"
  | "rustic"
  | "eclectic";

const THEME_LABEL: Record<Theme, string> = {
  romantic: "Romantic",
  modern: "Modern",
  traditional: "Traditional",
  whimsical: "Whimsical",
  luxe: "Luxe",
  rustic: "Rustic",
  eclectic: "Eclectic",
};

const THEME_BLURB: Record<Theme, string> = {
  romantic:
    "Soft scripts, watercolour florals, blush and ivory. Letterpress you can feel with your eyes.",
  modern:
    "Clean type, confident layout, negative space. Less is more; let the words breathe.",
  traditional:
    "Devanagari alongside English, paisley and lotus borders, gold foil on thick cotton.",
  whimsical:
    "Hand illustrations, playful layouts, unexpected colour. Joy before formality.",
  luxe: "Heavyweight paper, deep jewel tones, foil edges, wax seals. A suite that feels gifted.",
  rustic:
    "Handmade paper with deckle edges, botanical illustrations, earth tones and natural twine.",
  eclectic:
    "Cross-cultural type stacks, bold pattern mixes, punchy palette — a signature that can't be anyone else's.",
};

const THEME_REFS: Record<Theme, { url: string; caption: string }[]> = {
  romantic: [
    {
      url: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=480&q=70",
      caption: "Blush and ivory watercolour floral suite",
    },
    {
      url: "https://images.unsplash.com/photo-1520512236001-f7edd6b32b8d?w=480&q=70",
      caption: "Copper calligraphy on handmade paper",
    },
    {
      url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=480&q=70",
      caption: "Vellum overlay with wax seal",
    },
  ],
  modern: [
    {
      url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=480&q=70",
      caption: "Minimalist type-only invite",
    },
    {
      url: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=480&q=70",
      caption: "Art-deco geometric suite",
    },
    {
      url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=480&q=70",
      caption: "Terracotta and ivory editorial suite",
    },
  ],
  traditional: [
    {
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=480&q=70",
      caption: "Foil-stamped lotus motif, Devanagari subtitle",
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
      caption: "Letterpress paisley border suite",
    },
    {
      url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=480&q=70",
      caption: "Traditional gold frame save-the-date",
    },
  ],
  whimsical: [
    {
      url: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=480&q=70",
      caption: "Hand-painted turmeric-yellow invite",
    },
    {
      url: "https://images.unsplash.com/photo-1583939411023-14783179e581?w=480&q=70",
      caption: "Playful Sangeet insert with illustrated figures",
    },
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=480&q=70",
      caption: "Bright saturated event card set",
    },
  ],
  luxe: [
    {
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=480&q=70",
      caption: "Wax-sealed envelope with paisley-silk liner",
    },
    {
      url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=480&q=70",
      caption: "Blush cotton letterpress heirloom suite",
    },
    {
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=480&q=70",
      caption: "Silk-band belly-wrap with foil emblem",
    },
  ],
  rustic: [
    {
      url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=480&q=70",
      caption: "Olive green botanical Mehendi insert",
    },
    {
      url: "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=480&q=70",
      caption: "Deckle-edge handmade paper invite",
    },
  ],
  eclectic: [
    {
      url: "https://images.unsplash.com/photo-1567002260557-eec64317e6e4?w=480&q=70",
      caption: "Architectural jali motif with modern grid",
    },
    {
      url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=480&q=70",
      caption: "Cross-cultural type stack reception card",
    },
    {
      url: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=480&q=70",
      caption: "Simple serif with ornate underlay",
    },
  ],
};

// ── Tab ───────────────────────────────────────────────────────────────────

export function StationeryInspirationTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <MoodboardLink category={category} />
      <ThemedGallery category={category} />
      <InspirationWishlist category={category} />
    </div>
  );
}

// ── Moodboard link back to Vision & Mood ──────────────────────────────────

function MoodboardLink({ category }: { category: WorkspaceCategory }) {
  const moodboard = useWorkspaceStore((s) => s.moodboard);
  const items = useMemo(
    () =>
      moodboard
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [moodboard, category.id],
  );

  return (
    <PanelCard
      icon={<ImageIcon size={14} strokeWidth={1.8} />}
      eyebrow="Inspiration board"
      title="Your moodboard"
      description="Everything you've tagged across the suite lives here — shared with Vision & Mood."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Shared with Vision & Mood — edit in either place
        </span>
      }
    >
      {items.length === 0 ? (
        <EmptyRow>
          Nothing pinned yet. Head to Vision & Mood to drop inspiration, or
          hit ♥ on any reference below.
        </EmptyRow>
      ) : (
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {items.slice(0, 6).map((m) => (
            <li
              key={m.id}
              className="overflow-hidden rounded-md ring-1 ring-border"
            >
              <div className="aspect-square bg-ivory-warm">
                <img
                  src={m.image_url}
                  alt={m.caption}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length > 6 && (
        <Eyebrow className="mt-3">
          +{items.length - 6} more on the moodboard
        </Eyebrow>
      )}
    </PanelCard>
  );
}

// ── Themed reference gallery ──────────────────────────────────────────────

function ThemedGallery({ category }: { category: WorkspaceCategory }) {
  const [theme, setTheme] = useState<Theme>("romantic");
  const refReactions = useStationeryStore((s) => s.refReactions);
  const setRefReaction = useStationeryStore((s) => s.setRefReaction);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);

  const items = THEME_REFS[theme];
  const visible = useMemo(
    () => items.filter((i) => refReactions[`theme:${theme}:${i.url}`] !== "not"),
    [items, refReactions, theme],
  );

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      eyebrow="Curated by aesthetic"
      title="Style galleries"
      description="Curated references grouped by the aesthetic you're leaning into. Tap to save pins to your board."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Broader than by-piece. Pick a vibe.
        </span>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(Object.keys(THEME_LABEL) as Theme[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              theme === t
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:text-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {THEME_LABEL[t]}
          </button>
        ))}
      </div>

      <p className="mb-3 font-serif text-[13.5px] italic text-ink-muted">
        {THEME_BLURB[theme]}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const key = `theme:${theme}:${item.url}`;
          const reaction = refReactions[key];
          return (
            <figure
              key={key}
              className={cn(
                "group overflow-hidden rounded-md border bg-white",
                reaction === "love"
                  ? "border-rose ring-1 ring-rose/30"
                  : "border-border",
              )}
            >
              <div className="aspect-[4/5] bg-ivory-warm">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <figcaption className="px-2 py-1.5">
                <p className="line-clamp-2 text-[11px] text-ink-muted">
                  {item.caption}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (reaction === "love") {
                        setRefReaction(key, null);
                      } else {
                        setRefReaction(key, "love");
                        addMoodboardItem(
                          category.id,
                          item.url,
                          `${THEME_LABEL[theme]} · ${item.caption}`,
                        );
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10.5px] font-medium transition-colors",
                      reaction === "love"
                        ? "bg-rose text-ivory"
                        : "bg-rose-pale/60 text-rose hover:bg-rose-pale",
                    )}
                  >
                    <Heart
                      size={10}
                      strokeWidth={1.8}
                      className={reaction === "love" ? "fill-ivory" : ""}
                    />
                    {reaction === "love" ? "Loved" : "Love it"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefReaction(key, "not")}
                    className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[10.5px] text-ink-muted hover:text-ink"
                  >
                    <X size={10} strokeWidth={1.8} />
                    Not for us
                  </button>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <p className="font-serif text-[13.5px] italic text-ink-muted">
            You&apos;ve dismissed every reference for {THEME_LABEL[theme]} —
            try another vibe.
          </p>
        </div>
      )}
    </PanelCard>
  );
}

// ── "I keep coming back to…" wishlist ─────────────────────────────────────

function InspirationWishlist({ category }: { category: WorkspaceCategory }) {
  const entries = useStationeryStore((s) => s.inspirationEntries);
  const addInspirationEntry = useStationeryStore(
    (s) => s.addInspirationEntry,
  );
  const updateInspirationEntry = useStationeryStore(
    (s) => s.updateInspirationEntry,
  );
  const deleteInspirationEntry = useStationeryStore(
    (s) => s.deleteInspirationEntry,
  );
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);

  const [draft, setDraft] = useState("");

  function handleAdd() {
    if (!draft.trim()) return;
    addInspirationEntry(draft.trim());
    setDraft("");
  }

  function findSimilar() {
    // Placeholder AI — seeds the moodboard with a relevant-looking image
    // per entry so the couple sees what the feature will do once the
    // real matching pipeline lands.
    for (const e of entries) {
      addMoodboardItem(
        category.id,
        "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=480&q=70",
        `Style match · ${e.text.slice(0, 60)}`,
      );
    }
  }

  return (
    <PanelCard
      icon={<Notebook size={14} strokeWidth={1.8} />}
      eyebrow="Wishlist notes"
      title="I keep coming back to…"
      description="Short phrases, adjectives, a specific invite you loved. AI will suggest matching styles."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Free-text · AI will find matching styles
        </span>
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Jot the things you can&apos;t stop thinking about — the piece of
        stationery, the envelope liner, the wax seal you saw on Instagram.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="e.g. That envelope with the hand-painted floral liner I saw on Instagram…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-sm border border-saffron/40 bg-saffron-pale/40 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-saffron hover:bg-saffron-pale/70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Plus size={11} /> Add
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyRow>
          Nothing noted yet. Start with one — specifics are fine, so are
          half-formed feelings.
        </EmptyRow>
      ) : (
        <ul className="space-y-1.5">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-2 rounded-md border border-border bg-white px-3 py-2"
            >
              <span
                className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
              <div className="min-w-0 flex-1">
                <InlineText
                  value={entry.text}
                  onSave={(v) => updateInspirationEntry(entry.id, v)}
                  variant="block"
                  className="!p-0 text-[12.5px] text-ink"
                  placeholder="(empty)"
                />
              </div>
              <button
                type="button"
                onClick={() => deleteInspirationEntry(entry.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-ink-muted hover:text-rose"
                aria-label="Remove entry"
              >
                <Trash2 size={11} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {entries.length > 0 && (
        <button
          type="button"
          onClick={findSimilar}
          className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-saffron/40 bg-saffron-pale/40 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-saffron hover:bg-saffron-pale/70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Wand2 size={11} strokeWidth={1.8} />
          Find similar styles
          <ArrowUpRight size={11} />
        </button>
      )}
    </PanelCard>
  );
}
