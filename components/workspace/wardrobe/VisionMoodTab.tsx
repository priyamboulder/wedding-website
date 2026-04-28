"use client";

// ── Wardrobe & Styling → Style & Vision tab ───────────────────────────────
// A narrative scroll from "we don't know yet" to a complete style brief:
// quiz entry → style story → per-event colour palette → tagged moodboard →
// reference gallery by event. Mirrors the HMUA Vision pattern so the two
// feel like sisters.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  Palette as PaletteIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { MoodboardTag, WorkspaceCategory } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

const CATEGORY = "wardrobe" as const;

// localStorage keys for narrative surfaces owned by this tab.
const WARDROBE_BRIEF_KEY = "ananya:wardrobe-brief";
const WARDROBE_EVENT_PALETTE_KEY = "ananya:wardrobe-event-palette";
const WARDROBE_EVENT_REF_STATE_KEY = "ananya:wardrobe-event-ref-state";

const EVENTS = WEDDING_EVENTS.map((e) => e.label);
type EventName = (typeof EVENTS)[number];

// Wardrobe moodboard tags.
const WARDROBE_TAG_OPTIONS: { value: MoodboardTag; label: string }[] = [
  { value: "bride", label: "Bride" },
  { value: "groom", label: "Groom" },
  { value: "bridesmaids", label: "Bridesmaids" },
  { value: "family", label: "Family" },
  { value: "accessories", label: "Accessories" },
];

// Default per-event palettes (the spec's starting points). The couple can
// override any hex. Import button pulls from the Décor colour story when
// present.
const DEFAULT_EVENT_PALETTE: Record<EventName, string[]> = {
  Haldi: ["#F6D36B", "#E8B64A", "#FFFDF7"],
  Mehendi: ["#9CAF88", "#C9D6A7", "#F5E6D3"],
  Sangeet: ["#C94088", "#E05A9F", "#F7C8DC"],
  Wedding: ["#B91C1C", "#7F1D1D", "#D4A853"],
  Reception: ["#F5E0D6", "#D4A853", "#F5E6D3"],
};

// ── Entry ─────────────────────────────────────────────────────────────────

export function WardrobeVisionMoodTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const quiz = getQuizSchema(CATEGORY, "vision");

  return (
    <div className="space-y-8">
      {quiz && <QuizEntryCard schema={quiz} categoryId={category.id} />}

      <EventPaletteSection />

      <StyleMoodboardSection category={category} />

      <ReferenceGalleryByEvent category={category} />

      <StyleBriefPanel />

      {quiz && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={quiz} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── Style Brief ──────────────────────────────────────────────────────────
// Always editable. Light "Refine with AI" restructures the brief into
// heritage / statement / comfort / week-arc beats. Suggestion-only, never
// replaces unless accepted.

function StyleBriefPanel() {
  const [brief, setBrief] = useState<string>("");
  const [proposal, setProposal] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(WARDROBE_BRIEF_KEY);
      if (raw) setBrief(raw);
    } catch {
      // ignore
    }
  }, []);

  function persist(next: string) {
    setBrief(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(WARDROBE_BRIEF_KEY, next);
    } catch {
      // ignore
    }
  }

  function refine() {
    const raw = brief.trim();
    if (!raw) return;
    const sentences = raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const buckets: {
      heritage: string[];
      statement: string[];
      comfort: string[];
      arc: string[];
    } = { heritage: [], statement: [], comfort: [], arc: [] };

    for (const s of sentences) {
      const l = s.toLowerCase();
      if (/\b(heirloom|tradition|heritage|mother|grandmother|family)\b/.test(l)) {
        buckets.heritage.push(s);
      } else if (/\b(statement|bold|dramatic|editorial|fashion)\b/.test(l)) {
        buckets.statement.push(s);
      } else if (/\b(comfort|easy|breathable|movement|dance)\b/.test(l)) {
        buckets.comfort.push(s);
      } else {
        buckets.arc.push(s);
      }
    }

    const lines: string[] = [];
    if (buckets.arc.length)
      lines.push(`Overall arc: ${buckets.arc.join(" ")}`);
    if (buckets.heritage.length)
      lines.push(`Heritage & family: ${buckets.heritage.join(" ")}`);
    if (buckets.statement.length)
      lines.push(`Statement moments: ${buckets.statement.join(" ")}`);
    if (buckets.comfort.length)
      lines.push(`Comfort & movement: ${buckets.comfort.join(" ")}`);

    setProposal(lines.join("\n\n"));
  }

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          eyebrow="The thread that ties your week together"
          title="Your Style Brief"
          description="Not the specific outfits — the overall arc. Is it about heritage? Making a statement? Comfort? A family tradition?"
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
          placeholder="Click to write a brief — what does 'getting dressed' for your wedding mean to you? Each event is a different chapter; what story are you telling?"
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

// ── Per-event colour palette ─────────────────────────────────────────────
// Five rows, one per event. Each row has editable hex chips so the couple
// can coordinate across events and photograph arcs. "Import from Décor"
// seeds from any Décor palette items already pinned to the moodboard.

type EventPaletteMap = Record<EventName, string[]>;

function loadEventPalette(): EventPaletteMap {
  if (typeof window === "undefined") return DEFAULT_EVENT_PALETTE;
  try {
    const raw = window.localStorage.getItem(WARDROBE_EVENT_PALETTE_KEY);
    if (!raw) return DEFAULT_EVENT_PALETTE;
    const parsed = JSON.parse(raw) as Partial<EventPaletteMap>;
    const merged: EventPaletteMap = { ...DEFAULT_EVENT_PALETTE };
    for (const e of EVENTS) {
      const slot = parsed[e];
      if (Array.isArray(slot) && slot.every((x) => typeof x === "string")) {
        merged[e] = slot;
      }
    }
    return merged;
  } catch {
    return DEFAULT_EVENT_PALETTE;
  }
}

function EventPaletteSection() {
  const [palette, setPalette] = useState<EventPaletteMap>(DEFAULT_EVENT_PALETTE);

  useEffect(() => {
    setPalette(loadEventPalette());
  }, []);

  function persist(next: EventPaletteMap) {
    setPalette(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(WARDROBE_EVENT_PALETTE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function setHex(event: EventName, idx: number, hex: string) {
    const row = [...(palette[event] ?? [])];
    row[idx] = hex;
    persist({ ...palette, [event]: row });
  }

  function addChip(event: EventName) {
    const row = [...(palette[event] ?? [])];
    row.push("#CCCCCC");
    persist({ ...palette, [event]: row });
  }

  function removeChip(event: EventName, idx: number) {
    const row = [...(palette[event] ?? [])].filter((_, i) => i !== idx);
    persist({ ...palette, [event]: row });
  }

  function resetAll() {
    persist(DEFAULT_EVENT_PALETTE);
  }

  return (
    <section>
      <div className="mb-3">
        <SectionHeader
          title="Your wardrobe colour story"
          description="Coordinate across events so your photos have a visual arc. These are starting points — every family has its own traditions."
          right={
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
            >
              Reset to defaults
            </button>
          }
        />
      </div>

      <PanelCard
        icon={<PaletteIcon size={14} strokeWidth={1.8} />}
        title="Palette by event"
      >
        <ul className="divide-y divide-border/60">
          {EVENTS.map((event) => {
            const row = palette[event] ?? [];
            return (
              <li
                key={event}
                className="grid grid-cols-[110px_1fr_auto] items-center gap-3 py-3"
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">{event}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {row.map((hex, idx) => (
                    <div
                      key={`${event}-${idx}`}
                      className="group relative flex items-center gap-1.5 rounded-md border border-border bg-white px-1.5 py-1"
                    >
                      <input
                        type="color"
                        value={hex}
                        onChange={(e) => setHex(event, idx, e.target.value)}
                        className="h-5 w-5 cursor-pointer rounded-sm border-0 bg-transparent"
                        aria-label={`${event} colour ${idx + 1}`}
                      />
                      <span
                        className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {hex}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeChip(event, idx)}
                        aria-label="Remove swatch"
                        className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                      >
                        <X size={11} strokeWidth={1.8} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addChip(event)}
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-white px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
                  >
                    <Plus size={11} strokeWidth={1.8} /> Add
                  </button>
                </div>
                <div className="flex h-6 w-24 overflow-hidden rounded-sm ring-1 ring-border">
                  {row.length > 0 ? (
                    row.map((hex, idx) => (
                      <span
                        key={`strip-${event}-${idx}`}
                        className="block h-full flex-1"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))
                  ) : (
                    <span className="block h-full w-full bg-border/30" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </PanelCard>
    </section>
  );
}

// ── Style moodboard ──────────────────────────────────────────────────────

function StyleMoodboardSection({ category }: { category: WorkspaceCategory }) {
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
          title="Style moodboard"
          description="Paste URLs, drop files, tag each pin so your designer knows exactly whose look it is."
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
          <TagFilterPill
            active={filterTag === "all"}
            onClick={() => setFilterTag("all")}
          >
            All
          </TagFilterPill>
          {WARDROBE_TAG_OPTIONS.map((t) => (
            <TagFilterPill
              key={t.value}
              active={filterTag === t.value}
              onClick={() => setFilterTag(t.value)}
            >
              {t.label}
            </TagFilterPill>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyRow>
            {filterTag === "all"
              ? "Pin outfit refs — silhouettes, fabrics, embroidery details. Tag each with who it's for."
              : "No pins tagged yet. Pick a different filter, or tag some pins."}
          </EmptyRow>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {filtered.map((m) => (
              <li
                key={m.id}
                className="group relative overflow-hidden rounded-md ring-1 ring-border"
              >
                <div className="relative aspect-[4/5] bg-ivory-warm">
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
                  {WARDROBE_TAG_OPTIONS.map((t) => (
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

function TagFilterPill({
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
      className={cn(
        "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-ink",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </button>
  );
}

// ── Reference gallery by event ───────────────────────────────────────────
// Suggested outfit refs, paginated by event. Love pins to the moodboard,
// dismiss hides. Couple can add their own per event.

const SUGGESTED_PER_EVENT: Record<
  EventName,
  { id: string; url: string; caption: string; tag: MoodboardTag }[]
> = {
  Haldi: [
    {
      id: "w-haldi-1",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=640&q=70",
      caption: "Yellow cotton suit with gota work",
      tag: "bride",
    },
    {
      id: "w-haldi-2",
      url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=640&q=70",
      caption: "White kurta with yellow dupatta for the groom",
      tag: "groom",
    },
    {
      id: "w-haldi-3",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70",
      caption: "Mustard floral lehenga — bridesmaid energy",
      tag: "bridesmaids",
    },
    {
      id: "w-haldi-4",
      url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=640&q=70",
      caption: "Floral hair accessory",
      tag: "accessories",
    },
  ],
  Mehendi: [
    {
      id: "w-mehendi-1",
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=640&q=70",
      caption: "Mirror-work sage lehenga",
      tag: "bride",
    },
    {
      id: "w-mehendi-2",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=640&q=70",
      caption: "Green ikat kurta for groom",
      tag: "groom",
    },
    {
      id: "w-mehendi-3",
      url: "https://images.unsplash.com/photo-1501349800519-48093d60bde0?w=640&q=70",
      caption: "Jade suits for bridesmaids",
      tag: "bridesmaids",
    },
    {
      id: "w-mehendi-4",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=640&q=70",
      caption: "Fresh flower jewellery",
      tag: "accessories",
    },
  ],
  Sangeet: [
    {
      id: "w-sangeet-1",
      url: "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=640&q=70",
      caption: "Sequin magenta gown-lehenga",
      tag: "bride",
    },
    {
      id: "w-sangeet-2",
      url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=640&q=70",
      caption: "Velvet bandhgala for groom",
      tag: "groom",
    },
    {
      id: "w-sangeet-3",
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=640&q=70",
      caption: "Rose-gold bridesmaid gowns",
      tag: "bridesmaids",
    },
    {
      id: "w-sangeet-4",
      url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=640&q=70",
      caption: "Chandbali earrings",
      tag: "accessories",
    },
  ],
  Wedding: [
    {
      id: "w-wedding-1",
      url: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=640&q=70",
      caption: "Crimson bridal lehenga with zardozi",
      tag: "bride",
    },
    {
      id: "w-wedding-2",
      url: "https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=640&q=70",
      caption: "Ivory sherwani with gold embroidery",
      tag: "groom",
    },
    {
      id: "w-wedding-3",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=640&q=70",
      caption: "Ivory silk saree — mother of the bride",
      tag: "family",
    },
    {
      id: "w-wedding-4",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=640&q=70",
      caption: "Polki choker and maang tikka",
      tag: "accessories",
    },
  ],
  Reception: [
    {
      id: "w-reception-1",
      url: "https://images.unsplash.com/photo-1506469717960-433cebe3f181?w=640&q=70",
      caption: "Blush sculptural saree gown",
      tag: "bride",
    },
    {
      id: "w-reception-2",
      url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=640&q=70",
      caption: "Navy tuxedo with Nehru collar",
      tag: "groom",
    },
    {
      id: "w-reception-3",
      url: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=640&q=70",
      caption: "Champagne sarees for aunties",
      tag: "family",
    },
    {
      id: "w-reception-4",
      url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=640&q=70",
      caption: "Diamond tennis drops",
      tag: "accessories",
    },
  ],
};

type EventRefState = Record<
  EventName,
  { loved: string[]; dismissed: string[] }
>;

const EMPTY_REF_STATE: EventRefState = EVENTS.reduce(
  (acc, e) => ({ ...acc, [e]: { loved: [], dismissed: [] } }),
  {} as EventRefState,
);

function loadRefState(): EventRefState {
  if (typeof window === "undefined") return EMPTY_REF_STATE;
  try {
    const raw = window.localStorage.getItem(WARDROBE_EVENT_REF_STATE_KEY);
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

function ReferenceGalleryByEvent({
  category,
}: {
  category: WorkspaceCategory;
}) {
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
      window.localStorage.setItem(
        WARDROBE_EVENT_REF_STATE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore
    }
  }

  function love(ref: {
    id: string;
    url: string;
    caption: string;
    tag: MoodboardTag;
  }) {
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
          description="Browse our starting pins, add your own, tell us what you love."
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
          What should your {activeEvent} wardrobe feel like?
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
                    <Sparkles size={9} strokeWidth={2} /> {ref.tag}
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

