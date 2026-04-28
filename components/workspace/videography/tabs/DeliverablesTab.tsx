"use client";

// ── Deliverables tab (Videography) ────────────────────────────────────────
// What the couple is getting back, on what timeline, and where it stands.
// Parallels Photography's Deliverables but with a richer status lifecycle
// (review / revisions / approved / delivered) and a music-review gate —
// a common revision point that belongs before the final cut locks.

import { useMemo } from "react";
import {
  Archive,
  Clock,
  Film,
  HelpCircle,
  Link2,
  Music,
  Plus,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideographyStore } from "@/stores/videography-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type {
  VideoDeliverable,
  VideoDeliverableKind,
  VideoDeliverableStatus,
} from "@/types/videography";
import {
  VIDEO_DELIVERABLE_LABEL,
  VIDEO_DELIVERABLE_STATUS_LABEL,
} from "@/types/videography";
import {
  EmptyRow,
  Eyebrow,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

const KIND_ORDER: VideoDeliverableKind[] = [
  "same_day",
  "teaser",
  "highlight",
  "feature",
  "ceremony_full",
  "raw",
  "interview_package",
];

const KIND_ICON: Record<VideoDeliverableKind, React.ElementType> = {
  same_day: Zap,
  teaser: Star,
  highlight: Film,
  feature: Film,
  ceremony_full: Clock,
  raw: Archive,
  interview_package: HelpCircle,
};

const STATUS_TONE: Record<VideoDeliverableStatus, string> = {
  not_started: "bg-ivory-warm text-ink-muted border-border",
  in_progress: "bg-gold-light/30 text-ink border-gold/30",
  review: "bg-saffron-pale/60 text-saffron border-saffron/30",
  revisions: "bg-rose-pale/60 text-rose border-rose/30",
  approved: "bg-sage-pale/60 text-sage border-sage/30",
  delivered: "bg-sage text-ivory border-sage",
};

export function DeliverablesTab({ category }: { category: WorkspaceCategory }) {
  const allDeliverables = useVideographyStore((s) => s.deliverables);
  const addDeliverable = useVideographyStore((s) => s.addDeliverable);

  const deliverables = useMemo(
    () =>
      allDeliverables
        .filter((d) => d.category_id === category.id)
        .sort((a, b) => {
          const ka = KIND_ORDER.indexOf(a.kind);
          const kb = KIND_ORDER.indexOf(b.kind);
          if (ka !== kb) return ka - kb;
          return a.sort_order - b.sort_order;
        }),
    [allDeliverables, category.id],
  );

  const musicReviewNeeded = deliverables.some(
    (d) =>
      (d.kind === "highlight" || d.kind === "feature") &&
      !d.music_reviewed &&
      (d.status === "in_progress" || d.status === "review"),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Outputs"
        title="What comes back, and when"
        description="The edit timeline from same-day reel through the feature film. Track status, preview links, and revision notes in one place."
        right={
          <button
            type="button"
            onClick={() =>
              addDeliverable({
                category_id: category.id,
                kind: "highlight",
                name: "New deliverable",
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add deliverable
          </button>
        }
      />

      {musicReviewNeeded && (
        <div className="flex items-start gap-3 rounded-md border border-saffron/30 bg-saffron-pale/30 p-3">
          <Music size={15} strokeWidth={1.8} className="mt-0.5 text-saffron" />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-ink">
              Review music selections before the final cut
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              The most common revision: the videographer picks a song the
              couple doesn't connect with. Flag music on each in-progress
              deliverable below — it's easier to change now than after the
              edit locks.
            </p>
          </div>
        </div>
      )}

      {deliverables.length === 0 ? (
        <EmptyRow>
          No deliverables yet. A typical package is: same-day reel → teaser
          → highlight → feature → raw footage.
        </EmptyRow>
      ) : (
        <ul className="space-y-3">
          {deliverables.map((d) => (
            <li key={d.id}>
              <DeliverableCard item={d} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeliverableCard({ item }: { item: VideoDeliverable }) {
  const updateDeliverable = useVideographyStore((s) => s.updateDeliverable);
  const deleteDeliverable = useVideographyStore((s) => s.deleteDeliverable);
  const addDeliverable = useVideographyStore((s) => s.addDeliverable);

  const Icon = KIND_ICON[item.kind];

  function handleDelete() {
    const snap: VideoDeliverable = { ...item };
    deleteDeliverable(item.id);
    pushUndo({
      message: `Removed ${snap.name}`,
      undo: () =>
        addDeliverable({
          category_id: snap.category_id,
          kind: snap.kind,
          name: snap.name,
          description: snap.description,
          contracted_length: snap.contracted_length,
          delivery_target: snap.delivery_target,
          status: snap.status,
          preview_url: snap.preview_url,
          download_url: snap.download_url,
          revision_notes: snap.revision_notes,
          music_reviewed: snap.music_reviewed,
          sort_order: snap.sort_order,
        }),
    });
  }

  const showMusicReview =
    item.kind === "highlight" || item.kind === "feature";

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <HoverRow className="items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-saffron-pale/50 text-saffron">
          <Icon size={16} strokeWidth={1.6} />
        </span>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <select
              value={item.kind}
              onChange={(e) =>
                updateDeliverable(item.id, {
                  kind: e.target.value as VideoDeliverableKind,
                })
              }
              className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted focus:border-saffron focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>
                  {VIDEO_DELIVERABLE_LABEL[k]}
                </option>
              ))}
            </select>
            <InlineText
              value={item.name}
              onSave={(v) => updateDeliverable(item.id, { name: v })}
              placeholder="e.g. Highlight film"
              className="!p-0 font-serif text-[16px] text-ink"
            />
            <StatusPill
              value={item.status}
              onChange={(v) => updateDeliverable(item.id, { status: v })}
            />
          </div>
          {(item.description || item.description === "") && (
            <div className="mt-1.5">
              <InlineText
                value={item.description ?? ""}
                onSave={(v) => updateDeliverable(item.id, { description: v })}
                variant="block"
                placeholder="What this deliverable is."
                emptyLabel="Add a description…"
                allowEmpty
                className="!p-0 text-[12.5px] leading-relaxed text-ink-muted"
              />
            </div>
          )}
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <FieldBlock label="Contracted length">
          <InlineText
            value={item.contracted_length ?? ""}
            onSave={(v) => updateDeliverable(item.id, { contracted_length: v })}
            placeholder="e.g. 10–15 minutes"
            emptyLabel="Click to add…"
            allowEmpty
            className="!p-0 text-[13px] text-ink"
          />
        </FieldBlock>
        <FieldBlock label="Delivery target">
          <InlineText
            value={item.delivery_target ?? ""}
            onSave={(v) => updateDeliverable(item.id, { delivery_target: v })}
            placeholder="e.g. 6–8 weeks post-wedding"
            emptyLabel="Click to add…"
            allowEmpty
            className="!p-0 text-[13px] text-ink"
          />
        </FieldBlock>
        <FieldBlock label="Preview link" icon={<Link2 size={11} />}>
          <InlineText
            value={item.preview_url ?? ""}
            onSave={(v) => updateDeliverable(item.id, { preview_url: v })}
            placeholder="Vimeo private link…"
            emptyLabel="Paste a link…"
            allowEmpty
            className="!p-0 font-mono text-[11.5px] text-ink"
          />
        </FieldBlock>
        <FieldBlock label="Download link">
          <InlineText
            value={item.download_url ?? ""}
            onSave={(v) => updateDeliverable(item.id, { download_url: v })}
            placeholder="Download URL…"
            emptyLabel="Paste a link…"
            allowEmpty
            className="!p-0 font-mono text-[11.5px] text-ink"
          />
        </FieldBlock>
      </div>

      <div className="mt-3 rounded-sm bg-ivory/40 p-3">
        <Eyebrow className="mb-1">Revision notes</Eyebrow>
        <InlineText
          value={item.revision_notes ?? ""}
          onSave={(v) => updateDeliverable(item.id, { revision_notes: v })}
          variant="block"
          placeholder="What needs to change for the next cut…"
          emptyLabel="—"
          allowEmpty
          className="!p-0 text-[12.5px] leading-relaxed text-ink"
        />
      </div>

      {showMusicReview && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-sm border border-gold/20 bg-ivory/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <Music size={13} strokeWidth={1.8} className="text-saffron" />
            <p className="text-[12.5px] text-ink">
              Music reviewed by couple
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateDeliverable(item.id, {
                music_reviewed: !item.music_reviewed,
              })
            }
            aria-pressed={item.music_reviewed}
            className={cn(
              "rounded-sm border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
              item.music_reviewed
                ? "border-sage bg-sage text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.music_reviewed ? "✓ Approved" : "Mark reviewed"}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusPill({
  value,
  onChange,
}: {
  value: VideoDeliverableStatus;
  onChange: (v: VideoDeliverableStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VideoDeliverableStatus)}
      className={cn(
        "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] focus:outline-none",
        STATUS_TONE[value],
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {(Object.keys(VIDEO_DELIVERABLE_STATUS_LABEL) as VideoDeliverableStatus[]).map((s) => (
        <option key={s} value={s}>
          {VIDEO_DELIVERABLE_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function FieldBlock({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm bg-ivory/40 p-3">
      <Eyebrow className="mb-1 flex items-center gap-1">
        {icon}
        {label}
      </Eyebrow>
      {children}
    </div>
  );
}
