"use client";

import { Camera, Clock, Package, Users, Calendar, Image as ImageIcon } from "lucide-react";
import type { WorkspaceItem } from "@/types/workspace";
import { PanelCard, Tag, EmptyRow, Eyebrow } from "./primitives";

// Photography/Videography-flavored blocks, shared between couple- and
// vendor-side Workspace. Each block takes a filtered `WorkspaceItem[]` —
// the caller filters by block_type before passing in.

// ── Shot list ──────────────────────────────────────────────────────────────
export function ShotListBlock({ items }: { items: WorkspaceItem[] }) {
  const mustCount = items.filter((i) => i.meta?.priority === "must").length;
  const preferredCount = items.filter(
    (i) => i.meta?.priority === "preferred",
  ).length;
  return (
    <PanelCard
      icon={<Camera size={14} strokeWidth={1.8} />}
      title="Shot list"
      badge={
        <div className="flex gap-1.5">
          <Tag tone="amber">{mustCount} must</Tag>
          <Tag tone="stone">{preferredCount} preferred</Tag>
        </div>
      }
      className="lg:col-span-2"
    >
      {items.length === 0 ? (
        <EmptyRow>No shots staged yet.</EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((s) => {
            const priority = (s.meta?.priority as string) ?? "nice";
            const event = (s.meta?.event as string) ?? "";
            return (
              <li key={s.id} className="flex items-start gap-3 py-2.5">
                <Tag
                  tone={
                    priority === "must"
                      ? "amber"
                      : priority === "preferred"
                        ? "stone"
                        : "ink"
                  }
                >
                  {priority}
                </Tag>
                <div className="flex-1">
                  <p className="text-[13px] text-ink">{s.title}</p>
                  {event && (
                    <Eyebrow className="mt-0.5">{event}</Eyebrow>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

// ── People / groupings list ────────────────────────────────────────────────
export function PeopleListBlock({ items }: { items: WorkspaceItem[] }) {
  return (
    <PanelCard
      icon={<Users size={14} strokeWidth={1.8} />}
      title="Family portraits & groupings"
      className="lg:col-span-2"
    >
      {items.length === 0 ? (
        <EmptyRow>No groupings defined.</EmptyRow>
      ) : (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {items.map((p) => (
            <li
              key={p.id}
              className="rounded-md border border-border/70 bg-ivory-warm/20 px-3 py-2.5"
            >
              <p className="text-[13px] font-medium text-ink">
                {p.meta?.grouping ? String(p.meta.grouping) : p.title}
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {p.meta?.grouping ? p.title : ""}
                {p.meta?.people ? ` · ${String(p.meta.people)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Kit & notes ────────────────────────────────────────────────────────────
export function KitNotesBlock({ items }: { items: WorkspaceItem[] }) {
  return (
    <PanelCard
      icon={<Package size={14} strokeWidth={1.8} />}
      title="Kit & notes"
    >
      {items.length === 0 ? (
        <EmptyRow>No production notes yet.</EmptyRow>
      ) : (
        <ul className="space-y-3">
          {items.map((k) => (
            <li key={k.id}>
              <p className="text-[13px] font-medium text-ink">{k.title}</p>
              {k.meta?.notes ? (
                <p className="mt-1 rounded-sm border-l-2 border-saffron/40 bg-ivory-warm/40 px-3 py-1.5 text-[11.5px] italic text-ink-muted">
                  {String(k.meta.notes)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Coverage hours per event ───────────────────────────────────────────────
export function CoverageHoursBlock({ items }: { items: WorkspaceItem[] }) {
  const totalHours = items.reduce(
    (sum, i) => sum + (typeof i.meta?.hours === "number" ? (i.meta.hours as number) : 0),
    0,
  );
  return (
    <PanelCard
      icon={<Clock size={14} strokeWidth={1.8} />}
      title="Coverage hours"
      badge={<Tag tone="saffron">{totalHours}h total</Tag>}
    >
      {items.length === 0 ? (
        <EmptyRow>No coverage windows set.</EmptyRow>
      ) : (
        <ul className="space-y-1">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0"
            >
              <div>
                <p className="text-[13px] text-ink">{c.title}</p>
                {c.meta?.time ? (
                  <p className="font-mono text-[10.5px] text-ink-muted">
                    {String(c.meta.time)}
                  </p>
                ) : null}
              </div>
              <span className="font-mono text-[13px] text-saffron">
                {c.meta?.hours ? `${c.meta.hours}h` : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Deliverables timeline ──────────────────────────────────────────────────
export function DeliverablesBlock({ items }: { items: WorkspaceItem[] }) {
  return (
    <PanelCard
      icon={<Calendar size={14} strokeWidth={1.8} />}
      title="Deliverables timeline"
      className="lg:col-span-2"
    >
      {items.length === 0 ? (
        <EmptyRow>No deliverables committed.</EmptyRow>
      ) : (
        <ol className="relative space-y-3 border-l border-border/70 pl-5">
          {items.map((d) => (
            <li key={d.id} className="relative">
              <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-saffron bg-white" />
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="text-[13.5px] font-medium text-ink">
                  {d.title}
                </h5>
                <span className="font-mono text-[11px] text-ink-muted">
                  {d.meta?.due_date ? String(d.meta.due_date) : "—"}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </PanelCard>
  );
}

// ── Reference image grid (used when a photography-specific moodboard sits
//    inside Plan tab rather than Vision) ─────────────────────────────────
export function ReferenceGridBlock({
  urls,
  title = "References",
}: {
  urls: string[];
  title?: string;
}) {
  return (
    <PanelCard icon={<ImageIcon size={14} strokeWidth={1.8} />} title={title}>
      {urls.length === 0 ? (
        <EmptyRow>No references attached.</EmptyRow>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-sm bg-ivory-warm ring-1 ring-border"
            >
              <img src={u} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}
