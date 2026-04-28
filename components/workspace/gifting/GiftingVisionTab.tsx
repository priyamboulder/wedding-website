"use client";

// ── Gifting Vision & Mood ──────────────────────────────────────────────────
// Discovery-first vision tab. Three upfront sections — style direction, a
// per-sub-category budget comfort selector, and an idea browser — above the
// standard moodboard / palette / notes. Loving an idea auto-creates a
// WorkspaceItem in the matching sub-tab (welcome_bags, return_favors, etc.)
// so the sub-tab stops being an empty text input and starts as a draft.

import { useMemo, useState } from "react";
import {
  DollarSign,
  Gift,
  Heart,
  Package,
  PackageOpen,
  Sparkles,
  Handshake,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { PanelCard, Tag } from "@/components/workspace/blocks/primitives";
import {
  MoodboardBlock,
  NotesBlock,
  PaletteBlock,
} from "@/components/workspace/blocks/vision-blocks";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";
import { SEED_PALETTES } from "@/lib/workspace-seed";
import {
  GIFT_BUDGET_CATEGORIES,
  GIFT_IDEAS,
  GIFT_STYLE_DIRECTIONS,
  getIdeasForCategory,
  type GiftIdea,
  type GiftIdeaCategory,
  type GiftReaction,
  type GiftStyleDirection,
  type GiftBudgetCategory,
} from "@/lib/gifting-seed";

const MONO = "var(--font-mono)";

const CATEGORY_ICON: Record<GiftIdeaCategory, typeof Gift> = {
  welcome_bags: PackageOpen,
  return_favors: Gift,
  trousseau_packaging: Package,
  family_exchanges: Handshake,
};

const CATEGORY_LABEL: Record<GiftIdeaCategory, string> = {
  welcome_bags: "Welcome bags",
  return_favors: "Return favors",
  trousseau_packaging: "Trousseau",
  family_exchanges: "Family exchanges",
};

// ── Root ──────────────────────────────────────────────────────────────────

export function GiftingVisionTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const moodboard = useWorkspaceStore((s) => s.moodboard);
  const notes = useWorkspaceStore((s) => s.notes);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const deleteMoodboardItem = useWorkspaceStore((s) => s.deleteMoodboardItem);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);

  const boardItems = useMemo(
    () =>
      moodboard
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [moodboard, category.id],
  );
  const noteItems = useMemo(
    () =>
      notes
        .filter((n) => n.category_id === category.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [notes, category.id],
  );

  const palette = SEED_PALETTES[category.slug] ?? [];
  const quiz = getQuizSchema(category.slug, "vision");

  return (
    <div className="space-y-6">
      {quiz && <QuizEntryCard schema={quiz} categoryId={category.id} />}

      <StyleDirectionSection category={category} />
      <BudgetComfortSection category={category} />
      <IdeaBrowserSection category={category} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MoodboardBlock
          items={boardItems}
          editable
          onAdd={(url, caption) => addMoodboardItem(category.id, url, caption)}
          onRemove={(id) => deleteMoodboardItem(id)}
        />
        <PaletteBlock swatches={palette} />
        <NotesBlock
          notes={noteItems}
          editable
          onAdd={(body) => addNote(category.id, body)}
          onDelete={(id) => deleteNote(id)}
        />
      </div>

      {quiz && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={quiz} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── Style Direction section ───────────────────────────────────────────────

function StyleDirectionSection({ category }: { category: WorkspaceCategory }) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);

  const directionItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "vision" &&
          (i.meta as { kind?: string })?.kind === "style_direction",
      ),
    [items, category.id],
  );

  const reactions = useMemo(() => {
    const map = new Map<string, GiftReaction>();
    for (const it of directionItems) {
      const m = it.meta as { directionId?: string; reaction?: GiftReaction };
      if (m.directionId && m.reaction) map.set(m.directionId, m.reaction);
    }
    return map;
  }, [directionItems]);

  const setReaction = (direction: GiftStyleDirection, reaction: GiftReaction) => {
    const existing = directionItems.find(
      (i) => (i.meta as { directionId?: string }).directionId === direction.id,
    );
    if (existing) {
      updateItem(existing.id, {
        meta: {
          kind: "style_direction",
          directionId: direction.id,
          reaction,
        },
      });
    } else {
      addItem({
        category_id: category.id,
        tab: "vision",
        block_type: "note",
        title: direction.label,
        meta: {
          kind: "style_direction",
          directionId: direction.id,
          reaction,
        },
        sort_order: directionItems.length + 1,
      });
    }
  };

  const lovedCount = Array.from(reactions.values()).filter(
    (r) => r === "love",
  ).length;

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Gift style direction"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: MONO }}
        >
          {lovedCount} loved
        </span>
      }
    >
      <p className="mb-4 max-w-3xl text-[12.5px] leading-relaxed text-ink-muted">
        Pick the energy that matches how you want guests to feel unwrapping
        what you give them. You can love more than one — we'll keep them all
        in play.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {GIFT_STYLE_DIRECTIONS.map((d) => (
          <StyleDirectionCard
            key={d.id}
            direction={d}
            reaction={reactions.get(d.id)}
            onReact={(r) => setReaction(d, r)}
          />
        ))}
      </div>
    </PanelCard>
  );
}

function StyleDirectionCard({
  direction,
  reaction,
  onReact,
}: {
  direction: GiftStyleDirection;
  reaction: GiftReaction | undefined;
  onReact: (r: GiftReaction) => void;
}) {
  const gradient = `linear-gradient(135deg, ${direction.palette[0]}, ${direction.palette[1]}, ${direction.palette[2]})`;
  const loved = reaction === "love";
  const notForMe = reaction === "not_this";
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-md border bg-white transition-colors",
        loved
          ? "border-rose"
          : notForMe
            ? "border-border/40 bg-ivory-warm/30 opacity-60"
            : "border-border hover:border-saffron/50",
      )}
    >
      <div className="relative h-16 w-full" style={{ background: gradient }}>
        <span
          className="absolute left-3 top-3 text-[20px]"
          aria-hidden
        >
          {direction.emoji}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <div>
          <h4 className="font-serif text-[14.5px] leading-tight text-ink">
            {direction.label}
          </h4>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
            {direction.description}
          </p>
        </div>
        <ReactionRow reaction={reaction} onReact={onReact} />
      </div>
    </article>
  );
}

// ── Budget Comfort section ────────────────────────────────────────────────

function BudgetComfortSection({ category }: { category: WorkspaceCategory }) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);

  const budgetItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "vision" &&
          (i.meta as { kind?: string })?.kind === "budget_comfort",
      ),
    [items, category.id],
  );

  const selections = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of budgetItems) {
      const m = it.meta as { budgetCategoryId?: string; rangeId?: string };
      if (m.budgetCategoryId && m.rangeId) {
        map.set(m.budgetCategoryId, m.rangeId);
      }
    }
    return map;
  }, [budgetItems]);

  const setRange = (cat: GiftBudgetCategory, rangeId: string) => {
    const existing = budgetItems.find(
      (i) =>
        (i.meta as { budgetCategoryId?: string }).budgetCategoryId === cat.id,
    );
    if (existing) {
      updateItem(existing.id, {
        meta: {
          kind: "budget_comfort",
          budgetCategoryId: cat.id,
          rangeId,
        },
      });
    } else {
      addItem({
        category_id: category.id,
        tab: "vision",
        block_type: "note",
        title: `${cat.label} budget`,
        meta: {
          kind: "budget_comfort",
          budgetCategoryId: cat.id,
          rangeId,
        },
        sort_order: budgetItems.length + 1,
      });
    }
  };

  return (
    <PanelCard
      icon={<DollarSign size={14} strokeWidth={1.8} />}
      title="Gifting budget comfort"
    >
      <p className="mb-4 max-w-3xl text-[12.5px] leading-relaxed text-ink-muted">
        Rough anchors per category. This isn't a budget lock — it's what you
        want the math to aim at as you pick ideas.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {GIFT_BUDGET_CATEGORIES.map((cat) => (
          <BudgetComfortRow
            key={cat.id}
            cat={cat}
            selectedRangeId={selections.get(cat.id)}
            onSelect={(rangeId) => setRange(cat, rangeId)}
          />
        ))}
      </div>
    </PanelCard>
  );
}

function BudgetComfortRow({
  cat,
  selectedRangeId,
  onSelect,
}: {
  cat: GiftBudgetCategory;
  selectedRangeId: string | undefined;
  onSelect: (rangeId: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h5 className="text-[12.5px] font-medium text-ink">{cat.label}</h5>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: MONO }}
        >
          {cat.unit}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cat.ranges.map((r) => {
          const active = selectedRangeId === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] transition-colors",
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-saffron/60 hover:text-ink",
              )}
              style={{ fontFamily: MONO }}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Idea Browser section ──────────────────────────────────────────────────

const BROWSER_TABS: GiftIdeaCategory[] = [
  "welcome_bags",
  "return_favors",
  "trousseau_packaging",
  "family_exchanges",
];

function IdeaBrowserSection({ category }: { category: WorkspaceCategory }) {
  const [activeTab, setActiveTab] = useState<GiftIdeaCategory>("welcome_bags");
  const items = useWorkspaceStore((s) => s.items);

  // Tally loved counts per browser tab for the pill badges
  const lovedByCategory = useMemo(() => {
    const map = new Map<GiftIdeaCategory, number>();
    for (const tab of BROWSER_TABS) {
      const count = items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === tab &&
          (i.meta as { ideaId?: string; reaction?: GiftReaction }).ideaId &&
          (i.meta as { reaction?: GiftReaction }).reaction === "love",
      ).length;
      map.set(tab, count);
    }
    return map;
  }, [items, category.id]);

  const ideas = useMemo(
    () => getIdeasForCategory(activeTab),
    [activeTab],
  );

  return (
    <PanelCard
      icon={<Heart size={14} strokeWidth={1.8} />}
      title="Gifting ideas browser"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: MONO }}
        >
          Loved items surface in their sub-tab
        </span>
      }
    >
      <p className="mb-4 max-w-3xl text-[12.5px] leading-relaxed text-ink-muted">
        Browse ideas per category. Loved ones become draft items in that
        sub-tab — quantity, vendor, and cost you fill in when you're ready.
      </p>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-2">
        {BROWSER_TABS.map((tab) => {
          const Icon = CATEGORY_ICON[tab];
          const loved = lovedByCategory.get(tab) ?? 0;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                activeTab === tab
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              <Icon size={11} strokeWidth={1.8} />
              {CATEGORY_LABEL[tab]}
              {loved > 0 && (
                <span
                  className="rounded-full bg-rose-pale/70 px-1.5 py-0.5 font-mono text-[9px] text-rose"
                  style={{ fontFamily: MONO }}
                >
                  {loved}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} categoryId={category.id} />
        ))}
      </div>
    </PanelCard>
  );
}

function IdeaCard({
  idea,
  categoryId,
}: {
  idea: GiftIdea;
  categoryId: string;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);

  // Reaction items live in the sub-tab (so loved items become draft entries)
  const existing = items.find(
    (i) =>
      i.category_id === categoryId &&
      i.tab === idea.category &&
      (i.meta as { ideaId?: string }).ideaId === idea.id,
  );
  const reaction = existing
    ? ((existing.meta as { reaction?: GiftReaction }).reaction as
        | GiftReaction
        | undefined)
    : undefined;

  const setReaction = (r: GiftReaction) => {
    if (existing) {
      updateItem(existing.id, {
        meta: {
          ...(existing.meta ?? {}),
          ideaId: idea.id,
          reaction: r,
        },
      });
    } else {
      addItem({
        category_id: categoryId,
        tab: idea.category,
        block_type: "note",
        title: idea.name,
        meta: {
          ideaId: idea.id,
          reaction: r,
          unitCost: idea.estUnitCost,
          qty: 0,
          status: "planned",
          vendor: "",
        },
        sort_order: items.length + 1,
      });
    }
  };

  const loved = reaction === "love";
  const notForMe = reaction === "not_this";

  return (
    <article
      className={cn(
        "flex flex-col rounded-md border bg-white p-3 transition-colors",
        loved
          ? "border-rose"
          : notForMe
            ? "border-border/40 bg-ivory-warm/30 opacity-60"
            : "border-border hover:border-saffron/50",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[22px]" aria-hidden>
          {idea.emoji}
        </span>
        <span
          className="font-mono text-[10px] text-ink-faint"
          style={{ fontFamily: MONO }}
        >
          ~${idea.estUnitCost}
        </span>
      </div>
      <h5 className="font-serif text-[14px] leading-tight text-ink">
        {idea.name}
      </h5>
      <p className="mt-1 flex-1 text-[11.5px] leading-relaxed text-ink-muted">
        {idea.description}
      </p>
      {idea.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {idea.tags.map((t) => (
            <Tag key={t} tone="stone">
              {t}
            </Tag>
          ))}
        </div>
      )}
      <div className="mt-3">
        <ReactionRow reaction={reaction} onReact={setReaction} />
      </div>
    </article>
  );
}

// ── Reaction buttons ──────────────────────────────────────────────────────

function ReactionRow({
  reaction,
  onReact,
}: {
  reaction: GiftReaction | undefined;
  onReact: (r: GiftReaction) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onReact("love")}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors",
          reaction === "love"
            ? "border-rose bg-rose text-ivory"
            : "border-border bg-white text-ink-muted hover:border-rose hover:text-rose",
        )}
        style={{ fontFamily: MONO }}
      >
        <Heart
          size={11}
          strokeWidth={1.8}
          className={reaction === "love" ? "fill-ivory" : ""}
        />
        Love it
      </button>
      <button
        type="button"
        onClick={() => onReact("not_this")}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors",
          reaction === "not_this"
            ? "border-ink bg-ink text-ivory"
            : "border-border bg-white text-ink-muted hover:border-ink",
        )}
        style={{ fontFamily: MONO }}
      >
        <X size={11} strokeWidth={1.8} />
        Not for me
      </button>
    </div>
  );
}
