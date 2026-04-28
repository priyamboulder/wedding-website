"use client";

import { useMemo } from "react";
import {
  Check,
  Eye,
  LogIn,
  MessageCircle,
  Pencil,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./WorkspaceContent";
import type {
  ActivityKind,
  VendorWorkspaceActivity,
} from "@/types/vendor-workspace";

const KIND_META: Record<
  ActivityKind,
  { icon: React.ElementType; tone: string; bg: string }
> = {
  logged_in: { icon: LogIn, tone: "text-sage", bg: "bg-sage-pale/60" },
  viewed: { icon: Eye, tone: "text-ink-muted", bg: "bg-ivory-warm" },
  updated: { icon: Pencil, tone: "text-saffron", bg: "bg-saffron-pale/60" },
  message_sent: { icon: MessageCircle, tone: "text-gold", bg: "bg-gold-pale/60" },
  file_uploaded: { icon: Upload, tone: "text-rose", bg: "bg-rose-pale/60" },
  confirmed_item: { icon: Check, tone: "text-sage", bg: "bg-sage-pale/60" },
};

interface ActivityLogProps {
  activity: VendorWorkspaceActivity[];
  limit?: number;
}

export function ActivityLog({ activity, limit }: ActivityLogProps) {
  const rows = useMemo(() => {
    const sorted = [...activity].sort((a, b) => b.at.localeCompare(a.at));
    return limit ? sorted.slice(0, limit) : sorted;
  }, [activity, limit]);

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Activity Log"
        title="Everything this vendor has touched"
        description="Every login, every view, every update — a transparent audit trail. The vendor sees their own; you see theirs plus yours."
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-white px-6 py-12 text-center">
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            No activity yet
          </p>
          <p className="mt-2 text-[12.5px] italic text-ink-muted">
            Activity will populate here once the workspace is claimed.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-0 rounded-lg border border-border bg-white">
          {rows.map((a, i) => (
            <ActivityRow
              key={a.id}
              entry={a}
              first={i === 0}
              last={i === rows.length - 1}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function ActivityRow({
  entry,
  first,
  last,
}: {
  entry: VendorWorkspaceActivity;
  first: boolean;
  last: boolean;
}) {
  const meta = KIND_META[entry.kind];
  const Icon = meta.icon;

  return (
    <li
      className={cn(
        "relative grid grid-cols-[40px_1fr_auto] items-start gap-4 px-5 py-4",
        !last && "border-b border-border",
      )}
    >
      {/* Icon column with connecting line */}
      <div className="relative flex justify-center">
        {!first && (
          <span className="absolute left-1/2 top-0 h-2.5 w-px -translate-x-1/2 bg-border" />
        )}
        {!last && (
          <span className="absolute bottom-0 left-1/2 top-11 w-px -translate-x-1/2 bg-border" />
        )}
        <span
          className={cn(
            "z-10 flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-border",
            meta.bg,
            meta.tone,
          )}
        >
          <Icon size={14} strokeWidth={1.8} />
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-[13px] text-ink">{entry.summary}</p>
        {entry.detail && (
          <p className="mt-0.5 text-[11.5px] italic text-ink-muted">{entry.detail}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <ActorPill actor={entry.actor} />
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {entry.kind.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <time className="shrink-0 font-mono text-[11px] text-ink-muted">
        {formatRelative(entry.at)}
      </time>
    </li>
  );
}

function ActorPill({ actor }: { actor: VendorWorkspaceActivity["actor"] }) {
  const map = {
    vendor: { label: "Vendor", tone: "bg-saffron-pale/60 text-saffron" },
    couple: { label: "Couple", tone: "bg-rose-pale/60 text-rose" },
    planner: { label: "Planner", tone: "bg-gold-pale/60 text-gold" },
  }[actor];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em]",
        map.tone,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {map.label}
    </span>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
