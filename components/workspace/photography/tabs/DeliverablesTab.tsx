"use client";

// ── Deliverables tab ──────────────────────────────────────────────────────
// What you expect back, and when. Organised by kind (same-day → album →
// usage rights). Each row has a due label, optional notes, and can be
// edited inline. Usage rights + raw-file policy are deliverables too —
// they belong to this same brief.

import { useMemo } from "react";
import {
  Archive,
  Award,
  BookOpen,
  Check,
  Eye,
  Plus,
  Printer,
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import {
  DELIVERABLE_KIND_LABEL,
  DELIVERABLE_STATUS_LABEL,
  type DeliverableKind,
  type DeliverableStatus,
  type PhotoDeliverable,
} from "@/types/photography";
import type { WorkspaceCategory } from "@/types/workspace";
import { EmptyRow, Eyebrow } from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

const KIND_ORDER: DeliverableKind[] = [
  "same_day",
  "sneak_peek",
  "full_gallery",
  "raw",
  "album",
  "print",
  "usage_rights",
];

const KIND_ICON: Record<DeliverableKind, React.ElementType> = {
  same_day: Zap,
  sneak_peek: Sparkles,
  full_gallery: Eye,
  raw: Archive,
  album: BookOpen,
  print: Printer,
  usage_rights: Award,
};

export function DeliverablesTab({ category }: { category: WorkspaceCategory }) {
  const allDeliverables = usePhotographyStore((s) => s.deliverables);
  const addDeliverable = usePhotographyStore((s) => s.addDeliverable);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Outputs
          </p>
          <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
            What comes back, and by when
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            Same-day edits, sneak peeks, full galleries, the album, and
            usage rights. Set realistic timelines the photographer can
            commit to — short-term expectations beat vague promises.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            addDeliverable({
              category_id: category.id,
              kind: "full_gallery",
              name: "New deliverable",
              due_label: "",
            })
          }
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add deliverable
        </button>
      </div>

      {deliverables.length === 0 ? (
        <EmptyRow>
          No deliverables yet. Add teaser reels, galleries, albums, and your
          raw-file/usage-rights policy.
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

// ── Deliverable card ─────────────────────────────────────────────────────

function DeliverableCard({ item }: { item: PhotoDeliverable }) {
  const updateDeliverable = usePhotographyStore((s) => s.updateDeliverable);
  const deleteDeliverable = usePhotographyStore((s) => s.deleteDeliverable);
  const addDeliverable = usePhotographyStore((s) => s.addDeliverable);

  const Icon = KIND_ICON[item.kind];

  function handleDelete() {
    const snap: PhotoDeliverable = { ...item };
    deleteDeliverable(item.id);
    pushUndo({
      message: `Removed ${snap.name}`,
      undo: () =>
        addDeliverable({
          category_id: snap.category_id,
          kind: snap.kind,
          name: snap.name,
          due_label: snap.due_label,
          due_date: snap.due_date,
          delivered_at: snap.delivered_at,
          status: snap.status,
          preview_url: snap.preview_url,
          download_url: snap.download_url,
          notes: snap.notes,
          sort_order: snap.sort_order,
        }),
    });
  }

  const status = item.status ?? "not_started";
  const progress = computeProgress(item);

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <HoverRow className="items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-saffron-pale/50 text-saffron">
          <Icon size={16} strokeWidth={1.6} />
        </div>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <select
              value={item.kind}
              onChange={(e) =>
                updateDeliverable(item.id, {
                  kind: e.target.value as DeliverableKind,
                })
              }
              className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted focus:border-saffron focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>
                  {DELIVERABLE_KIND_LABEL[k]}
                </option>
              ))}
            </select>
            <InlineText
              value={item.name}
              onSave={(v) => updateDeliverable(item.id, { name: v })}
              placeholder="e.g. Full edited gallery"
              className="!p-0 font-serif text-[16px] text-ink"
            />
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete deliverable" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
        <div className="rounded-sm bg-ivory/40 p-3">
          <Eyebrow className="mb-1">Due</Eyebrow>
          <InlineText
            value={item.due_label}
            onSave={(v) => updateDeliverable(item.id, { due_label: v })}
            placeholder="e.g. 72 hours after wedding"
            emptyLabel="Click to add a due window…"
            allowEmpty
            className="!p-0 text-[13px] text-ink"
          />
          <div className="mt-2">
            <Eyebrow className="mb-1">Exact date</Eyebrow>
            <input
              type="date"
              value={item.due_date ?? ""}
              onChange={(e) =>
                updateDeliverable(item.id, {
                  due_date: e.target.value || undefined,
                })
              }
              className="w-full rounded-sm border border-border bg-white px-1.5 py-0.5 text-[11.5px] text-ink-muted focus:border-saffron focus:outline-none"
            />
          </div>
        </div>
        <div className="rounded-sm bg-ivory/40 p-3">
          <Eyebrow className="mb-1">Notes</Eyebrow>
          <InlineText
            value={item.notes ?? ""}
            onSave={(v) => updateDeliverable(item.id, { notes: v })}
            variant="block"
            placeholder="Count, format, rounds of edits, fine print…"
            emptyLabel="—"
            allowEmpty
            className="!p-0 text-[12.5px] leading-relaxed text-ink"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Eyebrow className="!normal-case">Status</Eyebrow>
          {(Object.keys(DELIVERABLE_STATUS_LABEL) as DeliverableStatus[]).map(
            (s) => {
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateDeliverable(item.id, { status: s })}
                  className={cn(
                    "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                    active
                      ? s === "approved"
                        ? "border-sage bg-sage text-ivory"
                        : s === "delivered"
                          ? "border-saffron bg-saffron text-ivory"
                          : s === "needs_revision"
                            ? "border-rose bg-rose text-ivory"
                            : "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-ink",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {DELIVERABLE_STATUS_LABEL[s]}
                </button>
              );
            },
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-[3px] flex-1 rounded-full bg-ivory-deep">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress.bar,
              )}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {progress.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {status === "delivered" && (
            <>
              <button
                type="button"
                onClick={() => updateDeliverable(item.id, { status: "approved" })}
                className="flex items-center gap-1 rounded-sm border border-sage bg-sage-pale/40 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-sage hover:bg-sage-pale/60"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Check size={11} /> Approve
              </button>
              <button
                type="button"
                onClick={() =>
                  updateDeliverable(item.id, { status: "needs_revision" })
                }
                className="flex items-center gap-1 rounded-sm border border-rose bg-rose-pale/40 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-rose hover:bg-rose-pale/60"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <RefreshCw size={11} /> Request revision
              </button>
            </>
          )}
          {item.preview_url && (
            <a
              href={item.preview_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted hover:border-saffron hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Eye size={11} /> Preview
            </a>
          )}
          {item.download_url && (
            <a
              href={item.download_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted hover:border-saffron hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Archive size={11} /> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Progress helper ──────────────────────────────────────────────────────
// Calculates a progress % + label: how far through the delivery window we
// are (days elapsed vs total days between the wedding day and due_date),
// plus a color that shifts to rose when we've run past the due date.

function computeProgress(item: PhotoDeliverable): {
  pct: number;
  label: string;
  bar: string;
} {
  const status = item.status ?? "not_started";
  if (status === "approved") {
    return { pct: 100, label: "Approved", bar: "bg-sage" };
  }
  if (status === "delivered") {
    return { pct: 95, label: "Delivered — pending review", bar: "bg-saffron" };
  }
  if (status === "needs_revision") {
    return { pct: 70, label: "Needs revision", bar: "bg-rose" };
  }
  if (!item.due_date) {
    return {
      pct: status === "in_progress" ? 40 : 10,
      label: status === "in_progress" ? "In progress" : "Not started",
      bar: "bg-ink-faint",
    };
  }
  const due = new Date(item.due_date).getTime();
  const now = Date.now();
  const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) {
    return {
      pct: 100,
      label: `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"}`,
      bar: "bg-rose",
    };
  }
  // Assume a 12-week window for "total days" when we don't have a wedding
  // reference — enough to give a reasonable-looking bar.
  const totalDays = 84;
  const elapsed = totalDays - daysLeft;
  const pct = Math.max(5, Math.min(95, Math.round((elapsed / totalDays) * 100)));
  return {
    pct,
    label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} until due`,
    bar:
      status === "in_progress"
        ? "bg-gradient-to-r from-saffron to-gold"
        : "bg-ink-faint",
  };
}
