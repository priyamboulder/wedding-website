"use client";

// ── Your Mehendi Story tab ────────────────────────────────────────────────
// Visual parity with Photography's Vision & Mood tab — sections are bare
// (serif title + underline + hint) rather than framed panels, and chips /
// cards / buttons share the same tokens as Photography.
//
// Blocks, in order:
//   1. Style directions — chip list (tap to love, tap again to clear).
//   2. Style keywords — shared keyword chip block.
//   3. Bridal coverage — three visual-card questions (arms / sides / feet).
//   4. Reference gallery — dual filter + gallery grid.
//   5. Hidden details — partner initials, symbols, matching elements,
//      uploaded reference images, avoid list.
//   6. Definitely want / not for us — shared WantAvoid lists.

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Heart, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultStylePrefs,
  useMehndiStore,
} from "@/stores/mehndi-store";
import {
  ARM_COVERAGE_HINT,
  ARM_COVERAGE_LABEL,
  FEET_COVERAGE_LABEL,
  HAND_SIDE_LABEL,
  REFERENCE_BUCKET_LABEL,
  VIBE_TAG_LABEL,
  type ArmCoverage,
  type FeetCoverage,
  type HandSide,
  type MehndiReference,
  type VibeTag,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  STYLE_DIRECTIONS,
  KEYWORD_SUGGESTIONS,
  SYMBOL_PRESETS,
} from "@/lib/mehndi-seed";
import { StyleKeywordsBlock } from "@/components/workspace/shared/StyleKeywordsBlock";
import { WantAvoidLists } from "@/components/workspace/shared/WantAvoidLists";
import { QuizEntryCard } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

const MEHNDI_VISION_QUIZ = getQuizSchema("mehndi", "vision");

const VIBES: VibeTag[] = [
  "storytelling",
  "flowing",
  "dense_traditional",
  "minimal_geometric",
  "feet_legs",
  "couple_matching",
];

const BUCKETS: Array<MehndiReference["bucket"]> = [
  "full_bridal",
  "arabic",
  "minimal",
  "feet",
  "back_of_hand",
];

// ── Local section head ────────────────────────────────────────────────────
// Mirrors Photography's inline SectionHead: 22px serif title, optional
// eyebrow (gold, mono, 0.18em tracking), subtle underline beneath. Used for
// bare sections (keywords, gallery, hidden details) so every internal head
// on this tab lines up with the Vision & Mood reference.
function InlineSectionHead({
  eyebrow,
  title,
  hint,
  right,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-ink/5 pb-2.5">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p
            className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
        )}
        <h3 className="font-serif text-[22px] font-bold leading-tight text-ink">
          {title}
        </h3>
        {hint && (
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {hint}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function MehendiStoryTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="flex flex-col gap-11">
      {MEHNDI_VISION_QUIZ && (
        <QuizEntryCard schema={MEHNDI_VISION_QUIZ} categoryId={category.id} />
      )}

      <StyleDirectionsBlock category={category} />
      <KeywordsBlock category={category} />
      <BridalCoverageBlock category={category} />
      <ReferenceGalleryBlock category={category} />
      <HiddenDetailsBlock category={category} />
      <WantLists category={category} />
    </div>
  );
}

// ── Style directions ──────────────────────────────────────────────────────

function StyleDirectionsBlock({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const toggleLove = useMehndiStore((s) => s.toggleDirectionLove);
  const base = prefs ?? defaultStylePrefs(category.id);

  return (
    <section>
      <InlineSectionHead
        title="Style direction"
        hint="Tap the directions that feel right. These aren't categories, they're feelings."
      />
      <div className="flex flex-wrap gap-2">
        {STYLE_DIRECTIONS.map((dir) => {
          const loved = base.loved_directions.includes(dir.id);
          return (
            <button
              key={dir.id}
              type="button"
              onClick={() => toggleLove(category.id, dir.id)}
              title={dir.tagline}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors",
                loved
                  ? "border-gold bg-ink text-ivory"
                  : "border-border bg-transparent text-ink-soft hover:border-gold/60 hover:text-ink",
              )}
            >
              {!loved && <span aria-hidden>+</span>}
              {dir.title}
              {loved && (
                <Heart
                  size={11}
                  strokeWidth={2}
                  fill="currentColor"
                  className="text-gold-pale"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Keywords ──────────────────────────────────────────────────────────────

function KeywordsBlock({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const update = useMehndiStore((s) => s.updateStylePrefs);
  const base = prefs ?? defaultStylePrefs(category.id);

  return (
    <StyleKeywordsBlock
      title="Style keywords"
      hint="Tap the ones that feel right. Add your own."
      suggestions={KEYWORD_SUGGESTIONS}
      selected={base.keywords}
      onChange={(next) => update(category.id, { keywords: next })}
    />
  );
}

// ── Bridal coverage ───────────────────────────────────────────────────────
// Three visual-card questions that scope the bride's mehendi. Answers feed
// the artist's scoping estimate and get surfaced in the brief.

// Illustrated references per option. Unsplash placeholders — swap for
// custom artwork when brand assets land.
const ARM_COVERAGE_IMAGERY: Record<ArmCoverage, string> = {
  hands_only:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=520&q=75",
  past_wrist:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=520&q=75",
  mid_forearm:
    "https://images.unsplash.com/photo-1601122070922-84e7a0e8a3b6?w=520&q=75",
  full_elbow:
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=520&q=75",
};

const HAND_SIDE_IMAGERY: Record<HandSide, string> = {
  front:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=520&q=75",
  back:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=520&q=75",
  both:
    "https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=520&q=75",
};

const FEET_COVERAGE_IMAGERY: Record<FeetCoverage, string> = {
  full: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=520&q=75",
  tops_only:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=520&q=75",
  none: "",
};

function BridalCoverageBlock({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const update = useMehndiStore((s) => s.updateStylePrefs);
  const base = prefs ?? defaultStylePrefs(category.id);

  const armOptions: ArmCoverage[] = [
    "hands_only",
    "past_wrist",
    "mid_forearm",
    "full_elbow",
  ];
  const sideOptions: HandSide[] = ["front", "back", "both"];
  const feetOptions: FeetCoverage[] = ["full", "tops_only", "none"];

  return (
    <section>
      <InlineSectionHead
        eyebrow="Bridal coverage"
        title="how much should the artist do?"
        hint="Three quick picks so the artist can scope the work. Affects time, price, and how many arms/feet they'll plan for."
      />

      <div className="space-y-5">
        <CoverageQuestion
          number="01"
          prompt="How far up your arms do you want the design to go?"
        >
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {armOptions.map((opt) => (
              <CoverageCard
                key={opt}
                active={base.arm_coverage === opt}
                image={ARM_COVERAGE_IMAGERY[opt]}
                title={ARM_COVERAGE_LABEL[opt]}
                hint={ARM_COVERAGE_HINT[opt]}
                onSelect={() =>
                  update(category.id, {
                    arm_coverage:
                      base.arm_coverage === opt ? null : opt,
                  })
                }
              />
            ))}
          </div>
        </CoverageQuestion>

        <CoverageQuestion number="02" prompt="Front, back, or both?">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {sideOptions.map((opt) => (
              <CoverageCard
                key={opt}
                active={base.hand_side === opt}
                image={HAND_SIDE_IMAGERY[opt]}
                title={HAND_SIDE_LABEL[opt]}
                onSelect={() =>
                  update(category.id, {
                    hand_side: base.hand_side === opt ? null : opt,
                  })
                }
              />
            ))}
          </div>
        </CoverageQuestion>

        <CoverageQuestion number="03" prompt="Do you want your feet done?">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {feetOptions.map((opt) => (
              <CoverageCard
                key={opt}
                active={base.feet_coverage === opt}
                image={FEET_COVERAGE_IMAGERY[opt]}
                title={FEET_COVERAGE_LABEL[opt]}
                onSelect={() =>
                  update(category.id, {
                    feet_coverage:
                      base.feet_coverage === opt ? null : opt,
                  })
                }
              />
            ))}
          </div>
        </CoverageQuestion>
      </div>
    </section>
  );
}

function CoverageQuestion({
  number,
  prompt,
  children,
}: {
  number: string;
  prompt: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {number}
        </span>
        <span className="text-[13.5px] font-medium text-ink">{prompt}</span>
      </div>
      {children}
    </div>
  );
}

function CoverageCard({
  active,
  image,
  title,
  hint,
  onSelect,
}: {
  active: boolean;
  image: string;
  title: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group overflow-hidden rounded-md border text-left transition-colors",
        active
          ? "border-gold ring-2 ring-gold/30"
          : "border-border hover:border-gold/50",
      )}
    >
      {image ? (
        <div className="relative aspect-[5/3] overflow-hidden bg-ivory-warm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {active && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory">
              <Heart size={10} strokeWidth={2.5} fill="currentColor" /> Picked
            </span>
          )}
        </div>
      ) : (
        <div className="flex aspect-[5/3] items-center justify-center bg-ivory-warm/60 text-ink-faint">
          <span className="text-[13px] italic">No feet mehendi</span>
        </div>
      )}
      <div className="space-y-0.5 p-2.5">
        <div className="font-serif text-[14px] text-ink">{title}</div>
        {hint && (
          <div className="text-[11px] leading-snug text-ink-muted">{hint}</div>
        )}
      </div>
    </button>
  );
}

// ── Reference gallery ─────────────────────────────────────────────────────

function ReferenceGalleryBlock({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const allRefs = useMehndiStore((s) => s.references);
  const seed = useMehndiStore((s) => s.seedSuggestedReferences);
  const addRef = useMehndiStore((s) => s.addReference);
  const updateRef = useMehndiStore((s) => s.updateReference);
  const deleteRef = useMehndiStore((s) => s.deleteReference);

  const [activeVibe, setActiveVibe] = useState<VibeTag | "all">("all");
  const [activeBucket, setActiveBucket] = useState<
    MehndiReference["bucket"] | "all"
  >("all");
  const [showAdd, setShowAdd] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [customBucket, setCustomBucket] =
    useState<MehndiReference["bucket"]>("full_bridal");
  const [customVibe, setCustomVibe] = useState<VibeTag>("storytelling");

  const categoryRefs = useMemo(
    () => allRefs.filter((r) => r.category_id === category.id),
    [allRefs, category.id],
  );

  const refs = useMemo(
    () =>
      categoryRefs
        .filter((r) => activeVibe === "all" || r.vibe === activeVibe)
        .filter((r) => activeBucket === "all" || r.bucket === activeBucket)
        .sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    [categoryRefs, activeVibe, activeBucket],
  );

  const lovedCount = categoryRefs.filter((r) => r.reaction === "love").length;

  function handleAdd() {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    addRef({
      category_id: category.id,
      bucket: customBucket,
      vibe: customVibe,
      image_url: trimmed,
      caption: caption.trim(),
    });
    setImageUrl("");
    setCaption("");
    setShowAdd(false);
  }

  return (
    <section>
      <InlineSectionHead
        title="Reference gallery"
        hint="Save what pulls you in. Mark what isn't for you. Pins with a heart go to the artist; passes stay in your scratchpad."
        right={
          <span
            className="font-mono text-[10.5px] tabular-nums text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {lovedCount} loved · {categoryRefs.length} total
          </span>
        }
      />

      {/* Primary filter — vibe */}
      <div className="mb-2">
        <div
          className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          By vibe
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", ...VIBES] as const).map((vibe) => (
            <button
              key={vibe}
              type="button"
              onClick={() => setActiveVibe(vibe)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition-colors",
                activeVibe === vibe
                  ? "border-gold bg-ink text-ivory"
                  : "border-border bg-transparent text-ink-soft hover:border-gold/60 hover:text-ink",
              )}
            >
              {vibe === "all" ? "All" : VIBE_TAG_LABEL[vibe]}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary filter — body area */}
      <div className="mb-3.5">
        <div
          className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          By body area
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", ...BUCKETS] as const).map((bucket) => (
            <button
              key={bucket}
              type="button"
              onClick={() => setActiveBucket(bucket)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition-colors",
                activeBucket === bucket
                  ? "border-gold bg-ink text-ivory"
                  : "border-border bg-transparent text-ink-soft hover:border-gold/60 hover:text-ink",
              )}
            >
              {bucket === "all" ? "All" : REFERENCE_BUCKET_LABEL[bucket]}
            </button>
          ))}
        </div>
      </div>

      {categoryRefs.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-4 py-5 text-center">
          <p className="mb-3 text-[12.5px] italic text-ink-muted">
            Empty gallery. Load a starter set — or drop your own Pinterest pins
            below.
          </p>
          <button
            type="button"
            onClick={() => seed(category.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90"
          >
            Load suggested references
          </button>
        </div>
      ) : refs.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/20 px-3 py-3 text-[12px] italic text-ink-muted">
          No references match these filters yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {refs.map((ref) => (
            <ReferenceCard
              key={ref.id}
              reference={ref}
              onLove={() =>
                updateRef(ref.id, {
                  reaction: ref.reaction === "love" ? "unset" : "love",
                })
              }
              onPass={() =>
                updateRef(ref.id, {
                  reaction: ref.reaction === "pass" ? "unset" : "pass",
                })
              }
              onDelete={() => deleteRef(ref.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-ink/5 pt-3">
        {showAdd ? (
          <div className="space-y-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (Pinterest, Instagram, CDN…)"
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-gold/50 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="min-w-[160px] flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-gold/50 focus:outline-none"
              />
              <select
                value={customVibe}
                onChange={(e) => setCustomVibe(e.target.value as VibeTag)}
                className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold/50 focus:outline-none"
              >
                {VIBES.map((v) => (
                  <option key={v} value={v}>
                    {VIBE_TAG_LABEL[v]}
                  </option>
                ))}
              </select>
              <select
                value={customBucket}
                onChange={(e) =>
                  setCustomBucket(e.target.value as MehndiReference["bucket"])
                }
                className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold/50 focus:outline-none"
              >
                {BUCKETS.map((b) => (
                  <option key={b} value={b}>
                    {REFERENCE_BUCKET_LABEL[b]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-md border border-gold/40 bg-gold px-3 py-1.5 text-[12px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-md px-2 py-1.5 text-[12px] text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-transparent px-3 py-1 text-[12px] text-ink-soft transition-colors hover:border-gold/60 hover:text-ink"
          >
            <Plus size={12} strokeWidth={2} />
            Add your own reference
          </button>
        )}
      </div>
    </section>
  );
}

function ReferenceCard({
  reference,
  onLove,
  onPass,
  onDelete,
}: {
  reference: MehndiReference;
  onLove: () => void;
  onPass: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-white">
      <div className="relative aspect-square overflow-hidden bg-ivory-warm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reference.image_url}
          alt={reference.caption || "mehendi reference"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          aria-label="Delete reference"
          onClick={onDelete}
          className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
        >
          <Trash2 size={11} strokeWidth={1.8} />
        </button>
        <div className="absolute left-1 top-1 flex flex-col gap-0.5">
          {reference.vibe && (
            <span
              className="rounded-sm bg-ink/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ivory"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {VIBE_TAG_LABEL[reference.vibe]}
            </span>
          )}
          <span
            className="rounded-sm bg-white/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {REFERENCE_BUCKET_LABEL[reference.bucket]}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="line-clamp-2 text-[11px] leading-snug text-ink-muted">
          {reference.caption || <span className="italic">No note</span>}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Love"
            onClick={onLove}
            className={cn(
              "rounded-full border p-1.5 transition-colors",
              reference.reaction === "love"
                ? "border-rose bg-rose text-ivory"
                : "border-border bg-white text-ink-faint hover:border-rose hover:text-rose",
            )}
          >
            <Heart size={11} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Not for us"
            onClick={onPass}
            className={cn(
              "rounded-full border p-1.5 transition-colors",
              reference.reaction === "pass"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-faint hover:border-ink hover:text-ink",
            )}
          >
            <X size={11} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hidden details ────────────────────────────────────────────────────────

function HiddenDetailsBlock({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const update = useMehndiStore((s) => s.updateStylePrefs);
  const base = prefs ?? defaultStylePrefs(category.id);
  const [symbolDraft, setSymbolDraft] = useState("");

  function addSymbol(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (base.meaningful_symbols.includes(v)) return;
    update(category.id, {
      meaningful_symbols: [...base.meaningful_symbols, v],
    });
    setSymbolDraft("");
  }

  function removeSymbol(v: string) {
    update(category.id, {
      meaningful_symbols: base.meaningful_symbols.filter((s) => s !== v),
    });
  }

  const unusedSymbols = SYMBOL_PRESETS.filter(
    (s) => !base.meaningful_symbols.includes(s),
  );

  return (
    <section>
      <InlineSectionHead
        title="Hidden details & personal touches"
        hint="This is what makes mehendi magical — and most couples don't know it's an option. Your artist can hide anything here in the design."
      />

      {/* Partner initials */}
      <div className="mb-4 rounded-md border border-border bg-white p-3">
        <label className="flex items-start gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={base.partner_initials_toggle}
            onChange={(e) =>
              update(category.id, {
                partner_initials_toggle: e.target.checked,
              })
            }
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span className="flex-1">
            <span className="font-medium">
              Hide partner&apos;s name or initials in the design
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              A beloved tradition — the groom searches for his name on the
              wedding night.
            </span>
          </span>
        </label>
        {base.partner_initials_toggle && (
          <input
            value={base.partner_initials_placement}
            onChange={(e) =>
              update(category.id, {
                partner_initials_placement: e.target.value,
              })
            }
            placeholder="Placement — e.g. inside the left palm, under a peacock motif"
            className="mt-2 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-gold/50 focus:outline-none"
          />
        )}
      </div>

      {/* Meaningful symbols */}
      <div className="mb-4 rounded-md border border-border bg-white p-3">
        <div className="mb-2 text-[13px] font-medium text-ink">
          Meaningful symbols to include
        </div>

        {base.meaningful_symbols.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {base.meaningful_symbols.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-ink py-1 pl-3 pr-1.5 text-[12px] text-ivory"
              >
                {sym}
                <button
                  type="button"
                  onClick={() => removeSymbol(sym)}
                  aria-label={`Remove ${sym}`}
                  className="rounded-full p-0.5 text-gold-pale/80 transition-colors hover:text-ivory"
                >
                  <X size={11} strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}

        {unusedSymbols.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {unusedSymbols.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => addSymbol(sym)}
                className="inline-flex items-center rounded-full border border-border bg-transparent px-3 py-1 text-[12px] text-ink-soft transition-colors hover:border-gold/60 hover:text-ink"
              >
                + {sym}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSymbol(symbolDraft);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={symbolDraft}
            onChange={(e) => setSymbolDraft(e.target.value)}
            placeholder="Add your own — e.g. the jasmine from our first date"
            className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-gold/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!symbolDraft.trim()}
            className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Add
          </button>
        </form>
      </div>

      {/* Reference image uploads */}
      <PersonalTouchUploads category={category} />

      {/* Matching elements */}
      <div className="mb-4 rounded-md border border-border bg-white p-3">
        <label className="flex items-start gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={base.matching_elements_toggle}
            onChange={(e) =>
              update(category.id, {
                matching_elements_toggle: e.target.checked,
              })
            }
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span className="flex-1">
            <span className="font-medium">
              Matching elements with partner
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              A matching mandala on his palm, a shared motif across your wrists.
            </span>
          </span>
        </label>
        {base.matching_elements_toggle && (
          <textarea
            value={base.matching_elements_notes}
            onChange={(e) =>
              update(category.id, {
                matching_elements_notes: e.target.value,
              })
            }
            placeholder="What should match? Where?"
            className="mt-2 min-h-[60px] w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-gold/50 focus:outline-none"
          />
        )}
      </div>

      {/* Motifs to avoid */}
      <div className="rounded-md border border-border bg-white p-3">
        <div className="mb-2 text-[13px] font-medium text-ink">
          Any motifs to avoid
        </div>
        <p className="mb-2 text-[11.5px] text-ink-muted">
          Cultural sensitivity, personal preference, family history — anything
          the artist should know not to include.
        </p>
        <textarea
          value={base.motifs_to_avoid}
          onChange={(e) =>
            update(category.id, { motifs_to_avoid: e.target.value })
          }
          placeholder="e.g. no animal motifs, no religious symbols in dense center panels…"
          className="min-h-[70px] w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-gold/50 focus:outline-none"
        />
      </div>
    </section>
  );
}

// ── Personal-touch image uploads ─────────────────────────────────────────
// Drop-zone + thumbnail grid for reference images (family crests, symbols,
// or anything the couple wants the artist to interpret). Lives inside the
// Hidden Details block.

function PersonalTouchUploads({ category }: { category: WorkspaceCategory }) {
  const allImages = useMehndiStore((s) => s.personalTouchImages);
  const images = useMemo(
    () => allImages.filter((i) => i.category_id === category.id),
    [allImages, category.id],
  );
  const addImg = useMehndiStore((s) => s.addPersonalTouchImage);
  const updateImg = useMehndiStore((s) => s.updatePersonalTouchImage);
  const deleteImg = useMehndiStore((s) => s.deletePersonalTouchImage);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const f of list) {
      const url = URL.createObjectURL(f);
      addImg({
        category_id: category.id,
        url,
        note: f.name.replace(/\.[^.]+$/, ""),
      });
    }
  }

  const sortedImages = useMemo(
    () =>
      [...images].sort((a, b) =>
        a.created_at < b.created_at ? -1 : 1,
      ),
    [images],
  );

  return (
    <div className="mb-4 rounded-md border border-border bg-white p-3">
      <div className="mb-2 text-[13px] font-medium text-ink">
        Upload reference images
      </div>
      <p className="mb-2.5 text-[11.5px] text-ink-muted">
        Logos, crests, symbols, or anything you want your artist to see — a
        family crest, a specific flower, a photo that means something.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInput.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-5 text-center transition-colors",
          dragOver
            ? "border-gold bg-gold-pale/30"
            : "border-border bg-ivory-warm/20 hover:border-gold/60 hover:bg-ivory-warm/40",
        )}
      >
        <ImagePlus
          size={18}
          strokeWidth={1.6}
          className="mb-1.5 text-gold"
        />
        <span className="text-[12.5px] text-ink">
          Drop images here or click to upload
        </span>
        <span className="mt-0.5 text-[10.5px] text-ink-faint">
          PNG, JPG, or SVG · as many as you like
        </span>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {sortedImages.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3">
          {sortedImages.map((img) => (
            <div
              key={img.id}
              className="group overflow-hidden rounded-md border border-border bg-white"
            >
              <div className="relative aspect-square overflow-hidden bg-ivory-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.note || "personal touch reference"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  aria-label="Delete reference image"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImg(img.id);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              </div>
              <input
                value={img.note}
                onChange={(e) =>
                  updateImg(img.id, { note: e.target.value })
                }
                placeholder="Add a caption — what is this?"
                className="w-full border-0 bg-transparent px-2 py-1.5 text-[11.5px] text-ink-muted placeholder:text-ink-faint focus:bg-ivory-warm/40 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Want / not for us ────────────────────────────────────────────────────

function WantLists({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const update = useMehndiStore((s) => s.updateStylePrefs);
  const base = prefs ?? defaultStylePrefs(category.id);

  return (
    <WantAvoidLists
      wants={base.definitely_want}
      avoids={base.not_for_us}
      onChangeWants={(next) => update(category.id, { definitely_want: next })}
      onChangeAvoids={(next) => update(category.id, { not_for_us: next })}
      wantTitle="I definitely want…"
      avoidTitle="Not for us…"
      wantPlaceholder="e.g. dark stain — lemon + sugar overnight"
      avoidPlaceholder="e.g. no glitter mehendi, no white henna"
    />
  );
}
