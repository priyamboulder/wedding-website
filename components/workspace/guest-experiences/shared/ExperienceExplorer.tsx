"use client";

// ── Shared Experience Explorer ──────────────────────────────────────────────
// One component, two presentations:
//   • mode="full"     — full catalog scroll, every category visible at once
//                       (used by Tab 1 of the workspace).
//   • mode="guided"   — category-by-category walkthrough with a "Next" button
//                       and 2–3 items per category. Surfaces the 7 category
//                       blocks one at a time and prioritises them based on
//                       Session 1's vibe form.
//
// Reactions, custom cards, and AI suggestions all read/write the same
// `useGuestExperiencesStore` slice, so a love in guided mode shows up on
// the full catalog tab the moment the user switches.

import { useMemo, useState } from "react";
import {
  Bookmark,
  Eye,
  EyeOff,
  Heart,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_EVENT_CHIPS,
  type ExperienceCardDef,
  type ExperienceCategory,
  type ExperienceEvent,
} from "@/lib/guest-experiences/experience-catalog";
import {
  useGuestExperiencesStore,
  type CardReaction,
} from "@/stores/guest-experiences-store";
import { priorityCategoryOrder, useVibeForm } from "./ExperienceVibeForm";

// Items shown per category in guided mode. Picks the first N catalog cards.
const GUIDED_PER_CATEGORY = 3;

export function ExperienceExplorer({
  mode,
  onComplete,
}: {
  mode: "full" | "guided";
  // Called when the guided walkthrough hits the end. Optional — full mode
  // never calls this.
  onComplete?: () => void;
}) {
  const { data: vibe } = useVibeForm();
  const orderedCategoryIds = useMemo(() => priorityCategoryOrder(vibe), [vibe]);
  const orderedCategories = useMemo(
    () =>
      orderedCategoryIds
        .map((id) => EXPERIENCE_CATEGORIES.find((c) => c.id === id))
        .filter(Boolean) as typeof EXPERIENCE_CATEGORIES,
    [orderedCategoryIds],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const isGuided = mode === "guided";
  const visibleCategories = isGuided
    ? orderedCategories.slice(stepIndex, stepIndex + 1)
    : orderedCategories;

  return (
    <div>
      {isGuided && (
        <GuidedStepHeader
          stepIndex={stepIndex}
          total={orderedCategories.length}
          categoryLabel={visibleCategories[0]?.label ?? ""}
        />
      )}

      <div className={cn("space-y-10", !isGuided && "mt-6")}>
        {visibleCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat.id}
            limit={isGuided ? GUIDED_PER_CATEGORY : undefined}
          />
        ))}
      </div>

      {isGuided && (
        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted disabled:opacity-40 enabled:hover:border-saffron/40 enabled:hover:text-saffron"
          >
            ← Previous category
          </button>
          {stepIndex < orderedCategories.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
            >
              Next category →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete?.()}
              className="rounded-md bg-saffron px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
            >
              I'm done browsing →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GuidedStepHeader({
  stepIndex,
  total,
  categoryLabel,
}: {
  stepIndex: number;
  total: number;
  categoryLabel: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron">
        Category {stepIndex + 1} of {total}
      </span>
      <span className="text-ink-faint">·</span>
      <span className="font-medium text-ink">{categoryLabel}</span>
    </div>
  );
}

// ── Category section (shared by both modes) ──────────────────────────────

function CategorySection({
  category,
  limit,
}: {
  category: ExperienceCategory;
  limit?: number;
}) {
  const all = useMemo(
    () => EXPERIENCE_CATALOG.filter((c) => c.category === category),
    [category],
  );
  const visibleCatalog = limit ? all.slice(0, limit) : all;
  const customCards = useGuestExperiencesStore((s) =>
    s.customCards.filter((c) => c.category === category),
  );
  const aiSuggestions = useGuestExperiencesStore((s) =>
    s.aiSuggestions.filter((c) => c.category === category),
  );
  const reactions = useGuestExperiencesStore((s) => s.cards);
  const addAi = useGuestExperiencesStore((s) => s.addAiSuggestions);
  const [showHidden, setShowHidden] = useState(false);
  const [adding, setAdding] = useState(false);

  const catDef = EXPERIENCE_CATEGORIES.find((c) => c.id === category)!;
  const hiddenCount = visibleCatalog.filter(
    (c) => reactions[c.id]?.reaction === "not_for_us",
  ).length;
  const visible = showHidden
    ? visibleCatalog
    : visibleCatalog.filter((c) => reactions[c.id]?.reaction !== "not_for_us");

  function suggestMore() {
    addAi([
      {
        category,
        name: `Signature ${catDef.label.split(" ")[0]} moment`,
        description:
          "A curated take on this category, tuned to your brief — we'd refine the concept with you before booking.",
        image_url:
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=560&q=70&auto=format&fit=crop",
        price_low: 30000,
        price_high: 120000,
        suggested_events: ["sangeet", "reception"],
      },
    ]);
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="font-serif font-bold text-[18px] leading-tight text-ink">
            {catDef.label}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">{catDef.blurb}</p>
        </div>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowHidden((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            {showHidden ? <EyeOff size={11} /> : <Eye size={11} />}
            {showHidden ? "Hide skipped" : `Show skipped (${hiddenCount})`}
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((card) => (
          <CatalogCard key={card.id} card={card} />
        ))}
        {aiSuggestions.map((s) => (
          <AiCard key={s.id} suggestion={s} />
        ))}
        {customCards.map((c) => (
          <CustomCard key={c.id} card={c} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={suggestMore}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-ivory-warm/40 px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-ivory-warm/70"
        >
          <Sparkles size={12} strokeWidth={1.8} className="text-saffron" />
          Suggest something I haven't thought of
        </button>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add your own idea
        </button>
      </div>

      {adding && (
        <AddCustomCardForm
          category={category}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

// ── Catalog card ─────────────────────────────────────────────────────────

function CatalogCard({ card }: { card: ExperienceCardDef }) {
  const state = useGuestExperiencesStore((s) => s.cards[card.id]);
  const setReaction = useGuestExperiencesStore((s) => s.setReaction);
  const setEventAssignments = useGuestExperiencesStore(
    (s) => s.setEventAssignments,
  );
  const reaction = state?.reaction ?? null;

  function handleReact(next: CardReaction) {
    const newValue = reaction === next ? null : next;
    setReaction(card.id, newValue);
    if (newValue === "love" && (!state || state.event_assignments.length === 0)) {
      setEventAssignments(card.id, card.suggested_events);
    }
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-all",
        reaction === "love"
          ? "border-saffron shadow-[0_2px_10px_rgba(184,134,11,0.12)]"
          : reaction === "maybe"
            ? "border-gold/40"
            : reaction === "not_for_us"
              ? "border-border opacity-50"
              : "border-border hover:border-saffron/40",
      )}
    >
      <div
        className="relative aspect-[4/3] bg-ivory-warm bg-cover bg-center"
        style={{ backgroundImage: `url(${card.image_url})` }}
      >
        {reaction === "love" && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-saffron px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white">
            <Heart size={9} fill="currentColor" /> Loved
          </span>
        )}
        {reaction === "maybe" && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-light/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink">
            <Bookmark size={9} fill="currentColor" /> Maybe
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h4 className="font-serif text-[15px] leading-tight text-ink">
          {card.name}
        </h4>
        <p className="text-[12px] leading-snug text-ink-muted">
          {card.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-[10.5px] text-ink-faint">
            {formatPrice(card.price_low)} – {formatPrice(card.price_high)}
          </span>
          <div className="flex flex-wrap gap-1">
            {card.suggested_events.slice(0, 2).map((e) => (
              <EventChip key={e} event={e} />
            ))}
            {card.suggested_events.length > 2 && (
              <span className="font-mono text-[10px] text-ink-faint">
                +{card.suggested_events.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-stretch border-t border-border">
        <ReactionButton
          active={reaction === "love"}
          onClick={() => handleReact("love")}
          icon={<Heart size={13} strokeWidth={1.8} />}
          label="Love it"
          tone="love"
        />
        <ReactionButton
          active={reaction === "maybe"}
          onClick={() => handleReact("maybe")}
          icon={<Bookmark size={13} strokeWidth={1.8} />}
          label="Maybe"
          tone="maybe"
        />
        <ReactionButton
          active={reaction === "not_for_us"}
          onClick={() => handleReact("not_for_us")}
          icon={
            reaction === "not_for_us" ? (
              <RotateCcw size={13} />
            ) : (
              <X size={13} strokeWidth={1.8} />
            )
          }
          label={reaction === "not_for_us" ? "Undo" : "Not for us"}
          tone="not"
        />
      </div>
    </article>
  );
}

function AiCard({
  suggestion,
}: {
  suggestion: {
    id: string;
    category: string;
    name: string;
    description: string;
    image_url: string;
    price_low: number;
    price_high: number;
    suggested_events: ExperienceEvent[];
  };
}) {
  const state = useGuestExperiencesStore((s) => s.cards[suggestion.id]);
  const setReaction = useGuestExperiencesStore((s) => s.setReaction);
  const setEventAssignments = useGuestExperiencesStore(
    (s) => s.setEventAssignments,
  );
  const reaction = state?.reaction ?? null;

  function handleReact(next: CardReaction) {
    const newValue = reaction === next ? null : next;
    setReaction(suggestion.id, newValue);
    if (newValue === "love" && (!state || state.event_assignments.length === 0)) {
      setEventAssignments(suggestion.id, suggestion.suggested_events);
    }
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg border border-gold/30 bg-ivory-warm/20">
      <div
        className="aspect-[4/3] bg-cover bg-center"
        style={{ backgroundImage: `url(${suggestion.image_url})` }}
      >
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white">
          <Sparkles size={9} /> AI suggested
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h4 className="font-serif text-[15px] leading-tight text-ink">
          {suggestion.name}
        </h4>
        <p className="text-[12px] leading-snug text-ink-muted">
          {suggestion.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[10.5px] text-ink-faint">
          <span>
            {formatPrice(suggestion.price_low)} – {formatPrice(suggestion.price_high)}
          </span>
        </div>
      </div>
      <div className="flex items-stretch border-t border-gold/20">
        <ReactionButton
          active={reaction === "love"}
          onClick={() => handleReact("love")}
          icon={<Heart size={13} strokeWidth={1.8} />}
          label="Love it"
          tone="love"
        />
        <ReactionButton
          active={reaction === "not_for_us"}
          onClick={() => handleReact("not_for_us")}
          icon={<X size={13} strokeWidth={1.8} />}
          label="Not for us"
          tone="not"
        />
      </div>
    </article>
  );
}

function CustomCard({
  card,
}: {
  card: {
    id: string;
    name: string;
    description: string;
    price_low: number;
    price_high: number;
  };
}) {
  const deleteCustom = useGuestExperiencesStore((s) => s.deleteCustomCard);
  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg border border-saffron bg-white">
      <div className="flex h-[120px] items-center justify-center bg-ivory-warm text-ink-faint">
        <Sparkles size={24} strokeWidth={1.4} className="text-saffron" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-[15px] leading-tight text-ink">
            {card.name}
          </h4>
          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron">
            Custom
          </span>
        </div>
        <p className="text-[12px] leading-snug text-ink-muted">
          {card.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[10.5px] text-ink-faint">
          <span>
            {formatPrice(card.price_low)} – {formatPrice(card.price_high)}
          </span>
          <button
            type="button"
            onClick={() => deleteCustom(card.id)}
            className="text-[11px] text-ink-muted transition-colors hover:text-rose"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function ReactionButton({
  active,
  onClick,
  icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone: "love" | "maybe" | "not";
}) {
  const toneClass =
    tone === "love"
      ? active
        ? "bg-saffron/10 text-saffron"
        : "hover:bg-saffron/5 hover:text-saffron"
      : tone === "maybe"
        ? active
          ? "bg-gold-light/30 text-ink"
          : "hover:bg-gold-light/20"
        : active
          ? "bg-ivory-warm text-ink-muted"
          : "hover:bg-ivory-warm/50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 border-r border-border py-2 text-[11.5px] font-medium text-ink-muted transition-colors last:border-r-0",
        toneClass,
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EventChip({ event }: { event: ExperienceEvent }) {
  const label = EXPERIENCE_EVENT_CHIPS.find((c) => c.id === event)?.label ?? event;
  return (
    <span className="inline-flex items-center rounded-full bg-ivory-warm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted">
      {label}
    </span>
  );
}

// ── Custom card add form ─────────────────────────────────────────────────

function AddCustomCardForm({
  category,
  onClose,
}: {
  category: ExperienceCategory;
  onClose: () => void;
}) {
  const addCustom = useGuestExperiencesStore((s) => s.addCustomCard);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [low, setLow] = useState(20000);
  const [high, setHigh] = useState(80000);
  const [events, setEvents] = useState<ExperienceEvent[]>(["sangeet"]);

  function toggleEvent(e: ExperienceEvent) {
    setEvents((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }

  function save() {
    if (!name.trim()) return;
    addCustom({
      category,
      name: name.trim(),
      description: description.trim(),
      price_low: low,
      price_high: high,
      suggested_events: events,
    });
    onClose();
  }

  return (
    <div className="mt-4 rounded-lg border border-saffron/40 bg-ivory-warm/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-serif text-[15px] text-ink">Add your own idea</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-faint hover:text-ink"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name (e.g. Chai wallah pop-up)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-saffron focus:outline-none"
        />
        <textarea
          rows={2}
          placeholder="One-line description — what makes it special?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-saffron focus:outline-none"
        />
        <div className="flex items-center gap-3 text-[12px] text-ink-muted">
          <label className="flex items-center gap-2">
            Low
            <input
              type="number"
              value={low}
              onChange={(e) => setLow(Number(e.target.value) || 0)}
              className="w-24 rounded-md border border-border bg-white px-2 py-1 text-ink"
            />
          </label>
          <label className="flex items-center gap-2">
            High
            <input
              type="number"
              value={high}
              onChange={(e) => setHigh(Number(e.target.value) || 0)}
              className="w-24 rounded-md border border-border bg-white px-2 py-1 text-ink"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_EVENT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleEvent(chip.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                events.includes(chip.id)
                  ? "border-saffron bg-saffron/10 text-saffron"
                  : "border-border bg-white text-ink-muted",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Add to shortlist
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ReactionCounter (used by both the workspace tab strip and guided shell) ─

export function ReactionCounter({
  onViewShortlist,
}: {
  onViewShortlist?: () => void;
}) {
  const cards = useGuestExperiencesStore((s) => s.cards);
  const counts = useMemo(() => {
    const out: Record<CardReaction, number> = { love: 0, maybe: 0, not_for_us: 0 };
    for (const c of Object.values(cards)) {
      if (c.reaction) out[c.reaction] += 1;
    }
    return out;
  }, [cards]);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
        <Sparkles size={13} strokeWidth={1.6} className="text-saffron" />
        <span className="font-medium text-ink">React to ideas, build a shortlist.</span>
        <span className="text-ink-faint">No pressure — love what lands.</span>
      </div>
      <div className="ml-auto flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
        <Pill icon={<Heart size={10} />} n={counts.love} label="Loved" tone="love" />
        <Pill icon={<Bookmark size={10} />} n={counts.maybe} label="Maybe" tone="maybe" />
        <Pill icon={<X size={10} />} n={counts.not_for_us} label="Hidden" tone="not" />
      </div>
      {onViewShortlist && (
        <button
          type="button"
          onClick={onViewShortlist}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          View shortlist →
        </button>
      )}
    </div>
  );
}

function Pill({
  icon,
  n,
  label,
  tone,
}: {
  icon: React.ReactNode;
  n: number;
  label: string;
  tone: "love" | "maybe" | "not";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        tone === "love" && "bg-saffron/10 text-saffron",
        tone === "maybe" && "bg-gold-light/30 text-ink",
        tone === "not" && "bg-ivory-warm text-ink-muted",
      )}
    >
      {icon}
      <span className="tabular-nums">{n}</span>
      <span>{label}</span>
    </span>
  );
}

function formatPrice(rupees: number): string {
  if (rupees >= 100000)
    return `₹${(rupees / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (rupees >= 1000) return `₹${Math.round(rupees / 1000)}k`;
  return `₹${rupees}`;
}
