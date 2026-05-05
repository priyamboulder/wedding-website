"use client";

// ── /share/new/build ────────────────────────────────────────────────────────
// Step 3: Block Builder. Left rail = block-type picker. Right column = the
// blocks the couple has assembled, expandable cards with reorder + delete.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareShell } from "@/components/share/ShareShell";
import {
  BlockEditor,
  BlockTypeIcon,
  blockShoutoutBadge,
  blockSummary,
  blockTypeLabel,
} from "@/components/share/BlockEditors";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";
import {
  BLOCK_TYPES,
  defaultBlock,
  type BlockType,
  type StoryBlock,
} from "@/types/share-shaadi";

export default function BuildPage() {
  const router = useRouter();
  const draft = useShareShaadiStore((s) => s.draft);
  const addBlock = useShareShaadiStore((s) => s.addBlock);
  const updateBlock = useShareShaadiStore((s) => s.updateBlock);
  const removeBlock = useShareShaadiStore((s) => s.removeBlock);
  const reorderBlocks = useShareShaadiStore((s) => s.reorderBlocks);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const recommended = useMemo(() => {
    if (!draft.angle) return new Set<BlockType>();
    return new Set(
      BLOCK_TYPES.filter((b) => b.recommendedFor.includes(draft.angle!)).map(
        (b) => b.type,
      ),
    );
  }, [draft.angle]);

  const enoughBlocks = draft.blocks.length >= 3;

  function toggleOpen(id: string) {
    setOpenIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd(type: BlockType) {
    const block = defaultBlock(type);
    addBlock(block);
    setOpenIds((s) => {
      const next = new Set(s);
      next.add(block.id);
      return next;
    });
  }

  function handleMove(id: string, dir: -1 | 1) {
    const ids = draft.blocks.map((b) => b.id);
    const idx = ids.indexOf(id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= ids.length) return;
    const next = ids.slice();
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    reorderBlocks(next);
  }

  return (
    <ShareShell
      eyebrow="step three"
      title={
        <>
          Build your wedding <em className="italic text-gold">story.</em>
        </>
      }
      subtitle="Pick the blocks that feel right. Drag them into the order you want. Skip anything that doesn't resonate."
      step="build"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr] md:gap-10">
        {/* Block picker rail */}
        <aside>
          <div className="sticky top-6 space-y-4 rounded-2xl border border-gold/15 bg-white/70 p-4">
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Block library
              </p>
              <h3
                className="mt-1 text-[20px] font-medium text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Add to your story
              </h3>
              {draft.angle && (
                <p
                  className="mt-1 text-[12.5px] italic text-ink-muted"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recommended for {recommendedLabel(draft.angle)}.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              {BLOCK_TYPES.map((b) => (
                <button
                  key={b.type}
                  type="button"
                  onClick={() => handleAdd(b.type)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-lg border bg-white px-3 py-2.5 text-left transition-colors",
                    recommended.has(b.type)
                      ? "border-gold/40 bg-gold-pale/30 hover:border-gold"
                      : "border-warm-border hover:border-gold/30",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                      recommended.has(b.type)
                        ? "bg-gold/15 text-gold"
                        : "bg-ivory-warm text-ink-muted",
                    )}
                  >
                    <BlockTypeIcon type={b.type} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-[13px] font-semibold text-ink"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {b.label}
                      </p>
                      {recommended.has(b.type) && (
                        <span
                          className="rounded-full bg-gold px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.18em] text-ivory"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          Pick
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                      {b.description}
                    </p>
                  </div>
                  <Plus
                    size={14}
                    strokeWidth={2}
                    className="mt-1 shrink-0 text-ink-faint group-hover:text-gold"
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Blocks */}
        <section>
          {draft.blocks.length === 0 ? (
            <EmptyBuilder />
          ) : (
            <div className="space-y-4">
              {draft.blocks.map((block, idx) => {
                const open = openIds.has(block.id);
                return (
                  <article
                    key={block.id}
                    className="overflow-hidden rounded-2xl border border-gold/15 bg-white/85 transition-shadow hover:shadow-[0_4px_24px_-12px_rgba(184,134,11,0.25)]"
                  >
                    <header className="flex items-center gap-3 border-b border-warm-border bg-ivory-warm/40 px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleMove(block.id, -1)}
                        disabled={idx === 0}
                        className="text-ink-faint disabled:opacity-30 hover:text-ink"
                        aria-label="Move up"
                      >
                        <ChevronUp size={16} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(block.id, 1)}
                        disabled={idx === draft.blocks.length - 1}
                        className="text-ink-faint disabled:opacity-30 hover:text-ink"
                        aria-label="Move down"
                      >
                        <ChevronDown size={16} strokeWidth={1.8} />
                      </button>
                      <span
                        aria-hidden="true"
                        className="text-ink-faint"
                      >
                        <GripVertical size={14} strokeWidth={1.8} />
                      </span>
                      {blockShoutoutBadge(block)}
                      <p className="ml-1 truncate text-[13px] italic text-ink-muted" style={{ fontFamily: "var(--font-display)" }}>
                        {blockSummary(block)}
                      </p>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint hover:bg-rose-pale/40 hover:text-rose"
                          aria-label="Remove block"
                        >
                          <Trash2 size={13} strokeWidth={1.8} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleOpen(block.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint hover:bg-ivory-warm hover:text-ink"
                          aria-label={open ? "Collapse" : "Expand"}
                        >
                          {open ? (
                            <ChevronUp size={14} strokeWidth={1.8} />
                          ) : (
                            <ChevronDown size={14} strokeWidth={1.8} />
                          )}
                        </button>
                      </div>
                    </header>
                    {open && (
                      <div className="px-5 py-6 md:px-7 md:py-7">
                        <BlockEditor
                          block={block}
                          onPatch={(patch) =>
                            updateBlock(block.id, patch as Partial<StoryBlock>)
                          }
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Minimum nudge */}
          {draft.blocks.length > 0 && draft.blocks.length < 3 && (
            <p
              className="mt-6 text-center text-[14px] italic text-saffron"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A few more blocks and your story will really shine.
            </p>
          )}

          {/* Footer nav */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/share/new/angle")}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
            >
              <ArrowLeft size={14} strokeWidth={1.8} />
              Choose your angle
            </button>
            <button
              type="button"
              disabled={!enoughBlocks}
              onClick={() => router.push("/share/review")}
              className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/90"
            >
              Review &amp; submit
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </section>
      </div>
    </ShareShell>
  );
}

function recommendedLabel(angle: NonNullable<StoryBlock["type"]> | string): string {
  switch (angle) {
    case "timeline":
      return "the timeline angle";
    case "people":
      return "the people angle";
    case "details":
      return "the details angle";
    case "unfiltered":
      return "the unfiltered angle";
    default:
      return "your angle";
  }
}

function EmptyBuilder() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/30 bg-ivory-warm/40 px-6 py-20 text-center">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Empty canvas
      </p>
      <p
        className="mt-3 text-[26px] italic text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Pick a block from the rail to begin.
      </p>
      <p className="mt-2 max-w-md text-[14px] leading-[1.6] text-ink-muted">
        Think of this like a magazine spread — one block per moment. The Moment
        block is a great place to start.
      </p>
    </div>
  );
}
